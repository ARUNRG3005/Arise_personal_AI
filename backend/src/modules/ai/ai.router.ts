import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../../middlewares/auth';
import { orchestrator } from '../../ai/orchestrator';
import { logger } from '../../config/logger';

const router = Router();

router.post('/chat', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { message, history = [] } = req.body;
  const userId = req.user!.id;

  if (!message) {
    return res.status(400).json({ error: 'Message content is required.' });
  }

  // Set headers for streaming response (Server-Sent Events style or chunked text)
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const stream = orchestrator.processMessage(message, history, userId);
    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
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
