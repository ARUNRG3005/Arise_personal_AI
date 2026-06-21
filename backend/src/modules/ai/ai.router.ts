import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../../middlewares/auth';
import { orchestrator } from '../../ai/orchestrator';
import { logger } from '../../config/logger';
import { prisma } from '../../config/database';

const router = Router();

// GET all conversations for the user
router.get('/conversations', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  try {
    const conversations = await prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
    res.json({ success: true, conversations });
  } catch (error) {
    logger.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations.' });
  }
});

// GET specific conversation messages
router.get('/conversations/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const id = req.params.id as string;
  try {
    const conversation = await prisma.conversation.findFirst({
      where: { id, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }
    res.json({ success: true, conversation });
  } catch (error) {
    logger.error('Error fetching conversation messages:', error);
    res.status(500).json({ error: 'Failed to fetch conversation messages.' });
  }
});

// DELETE a conversation
router.delete('/conversations/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const id = req.params.id as string;
  try {
    const conversation = await prisma.conversation.findFirst({
      where: { id, userId },
    });
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found.' });
    }
    await prisma.conversation.delete({
      where: { id },
    });
    res.json({ success: true, message: 'Conversation deleted successfully.' });
  } catch (error) {
    logger.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Failed to delete conversation.' });
  }
});

// POST to Chat (with stream response and DB persistence)
router.post('/chat', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { message, history = [], conversationId } = req.body;
  const userId = req.user!.id;

  if (!message) {
    return res.status(400).json({ error: 'Message content is required.' });
  }

  // Set headers for streaming response (Server-Sent Events style or chunked text)
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  let activeConvId = conversationId;

  try {
    // 1. Resolve or create conversation
    if (activeConvId) {
      const exists = await prisma.conversation.findFirst({
        where: { id: activeConvId, userId },
      });
      if (!exists) {
        activeConvId = null;
      }
    }

    if (!activeConvId) {
      const title = message.substring(0, 40) + (message.length > 40 ? '...' : '');
      const newConv = await prisma.conversation.create({
        data: {
          userId,
          title,
        },
      });
      activeConvId = newConv.id;
    }

    // 2. Save User message to DB
    await prisma.message.create({
      data: {
        conversationId: activeConvId,
        role: 'user',
        content: message,
      },
    });

    // 3. Send conversationId to frontend immediately
    res.write(`data: ${JSON.stringify({ conversationId: activeConvId })}\n\n`);

    const stream = orchestrator.processMessage(message, history, userId);
    let accumulatedContent = '';
    let finalToolCalls: any[] = [];

    for await (const chunk of stream) {
      if (chunk.content) {
        accumulatedContent = chunk.content;
      }
      if (chunk.toolCalls) {
        finalToolCalls = chunk.toolCalls;
      }
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }

    // 4. Save Assistant response to DB on end
    if (accumulatedContent.trim()) {
      await prisma.message.create({
        data: {
          conversationId: activeConvId,
          role: 'assistant',
          content: accumulatedContent,
          toolCalls: finalToolCalls.length > 0 ? finalToolCalls : undefined,
        },
      });

      // Update conversation timestamp
      await prisma.conversation.update({
        where: { id: activeConvId },
        data: { updatedAt: new Date() },
      });
    }

    res.end();
  } catch (error) {
    logger.error('Error in AI chat stream endpoint:', error);
    res.write(`data: ${JSON.stringify({ error: 'An error occurred during response generation.' })}\n\n`);
    res.end();
  }
});

router.post('/quick-capture', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { content } = req.body;
  const userId = req.user!.id;

  if (!content) {
    return res.status(400).json({ error: 'Content is required.' });
  }

  // Quick Capture targets natural classification. Let's run a lightweight model instruction
  // to parse and run the appropriate tool, or classify it.
  try {
    const stream = orchestrator.processMessage(`Quick capture: ${content}`, [], userId);
    let finalResult = '';
    let toolCalls: any[] = [];
    
    for await (const chunk of stream) {
      if (chunk.content) finalResult = chunk.content;
      if (chunk.toolCalls && chunk.toolCalls.length > 0) {
        toolCalls = chunk.toolCalls;
      }
    }
    res.json({ success: true, response: finalResult, toolCalls });
  } catch (error) {
    logger.error('Error in AI quick capture classification:', error);
    res.status(500).json({ error: 'Failed to process quick capture content.' });
  }
});

import { ProviderFactory } from '../../ai/providers/ProviderFactory';

router.post('/summarize-repo', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { name, description, languages = [], topics = [] } = req.body;

  try {
    const provider = ProviderFactory.getProvider();
    const prompt = `You are the ARISE AI Operating System. Generate a concise development summary (2-3 sentences max) for the following GitHub repository:
- Name: ${name}
- Description: ${description || 'No description provided.'}
- Languages: ${languages.join(', ')}
- Topics: ${topics.join(', ')}

Format example: "This is a React + Node.js AI project currently under active development. The repository has been updated recently and focuses on productivity automation."`;

    const response = await provider.chat([
      { role: 'user', content: prompt }
    ], undefined, { temperature: 0.3 });

    const summary = response.choices?.[0]?.message?.content?.trim() || '';
    res.json({ success: true, summary });
  } catch (error) {
    logger.error('Error generating AI repo summary:', error);
    res.status(500).json({ error: 'Failed to generate repository summary.' });
  }
});

export default router;
