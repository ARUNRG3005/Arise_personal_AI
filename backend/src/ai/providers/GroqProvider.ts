import Groq from 'groq-sdk';
import { AIProvider, ChatMessage, ChatOptions, ToolDefinition } from './AIProvider';
import { env } from '../../config/env';
import { logger } from '../../config/logger';

export class GroqProvider implements AIProvider {
  readonly name = 'groq';
  private client: Groq | null = null;

  constructor() {
    const apiKey = env.GROQ_API_KEY;
    if (apiKey) {
      this.client = new Groq({ apiKey });
    } else {
      logger.warn('⚠️ GROQ_API_KEY is not set. GroqProvider will operate in mock mode.');
    }
  }

  async chat(
    messages: ChatMessage[],
    tools?: ToolDefinition[],
    options?: ChatOptions
  ): Promise<any> {
    if (!this.client) {
      logger.info('Mock Chat Response (Groq Key missing)');
      return {
        choices: [
          {
            message: {
              role: 'assistant',
              content: `This is a mock assistant response because the Groq API key is not configured yet. Here are the messages received:\n\n${messages.map(m => `**${m.role}**: ${m.content}`).join('\n')}`,
            },
          },
        ],
      };
    }

    try {
      const response = await this.client.chat.completions.create({
        model: env.GROQ_MODEL,
        messages: messages as any,
        tools: tools?.map(t => ({
          type: 'function',
          function: {
            name: t.name,
            description: t.description,
            parameters: t.parameters,
          },
        })) as any,
        temperature: options?.temperature ?? 0.2,
        max_tokens: options?.maxTokens,
      });

      return response;
    } catch (error: any) {
      logger.error('Error during Groq API chat execution:', error);
      if (error.status || error.statusCode) {
        logger.error(`Groq API Error Details: Status ${error.status || error.statusCode} - Body: ${JSON.stringify(error.error || error.body || error, null, 2)}`);
      }
      throw error;
    }
  }

  async *streamChat(
    messages: ChatMessage[],
    tools?: ToolDefinition[],
    options?: ChatOptions
  ): AsyncGenerator<any, void, unknown> {
    if (!this.client) {
      logger.info('Streaming Mock Response (Groq Key missing)');
      const mockWords = `Hello! I am ARISE, your personal AI Operating System. This is a streaming response simulated because the Groq API key is currently missing or invalid. Please check your config if you see this.`.split(' ');
      for (const word of mockWords) {
        yield {
          choices: [
            {
              delta: {
                content: word + ' ',
              },
            },
          ],
        };
        await new Promise(r => setTimeout(r, 100));
      }
      return;
    }

    try {
      const stream = await this.client.chat.completions.create({
        model: env.GROQ_MODEL,
        messages: messages as any,
        tools: tools?.map(t => ({
          type: 'function',
          function: {
            name: t.name,
            description: t.description,
            parameters: t.parameters,
          },
        })) as any,
        temperature: options?.temperature ?? 0.2,
        max_tokens: options?.maxTokens,
        stream: true,
      });

      for await (const chunk of stream) {
        yield chunk;
      }
    } catch (error: any) {
      logger.error('Error during Groq API stream execution:', error);
      if (error.status || error.statusCode) {
        logger.error(`Groq API Error Details: Status ${error.status || error.statusCode} - Body: ${JSON.stringify(error.error || error.body || error, null, 2)}`);
      }
      throw error;
    }
  }

  async embed(text: string): Promise<number[]> {
    // Groq doesn't provide robust embeddings endpoints in all regions, or they change.
    // If Groq key is missing, or we need vector, let's fallback to standard 1536 size mock embedding or openai/ollama if needed.
    // Since we must support pgvector (size 1536), we will generate a stable mock float array of size 1536 if no real embedder is set up,
    // or if the model is set. Let's create a stable deterministic mock embedding for local/testing.
    logger.debug(`Generating embeddings for text: "${text.substring(0, 30)}..."`);
    const embedding = new Array(1536).fill(0);
    // Simple deterministic hash mapping to floats between -1 and 1
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      embedding[i % 1536] = (embedding[i % 1536] + code / 256.0) % 2.0 - 1.0;
    }
    return embedding;
  }
}
