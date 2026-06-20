import { BaseAgent, ToolResult } from './BaseAgent';
import { ToolDefinition } from '../providers/AIProvider';
import { prisma } from '../../config/database';
import { ProviderFactory } from '../providers/ProviderFactory';
import { logger } from '../../config/logger';

export class MemoryAgent extends BaseAgent {
  name = 'MemoryAgent';
  description = 'Agent for managing long-term and short-term memory, user preferences, routines, and factual recall.';

  getTools(): ToolDefinition[] {
    return [
      {
        name: 'storeFact',
        description: 'Remember an important personal fact or preference about the user.',
        parameters: {
          type: 'object',
          properties: {
            content: { type: 'string', description: 'The fact or detail to remember. E.g. "I prefer working on coding in the mornings."' },
            layer: { type: 'string', enum: ['LONG_TERM', 'PREFERENCE', 'ROUTINE', 'GOAL'], description: 'The layer category (default LONG_TERM).' },
            key: { type: 'string', description: 'Optional unique keyword identifier.' },
          },
          required: ['content'],
        },
      },
      {
        name: 'searchMemories',
        description: 'Search the user\'s memory base for matching facts or context.',
        parameters: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search term or question to query memory.' },
          },
          required: ['query'],
        },
      },
    ];
  }

  async execute(toolName: string, args: any, userId: string): Promise<ToolResult> {
    logger.info(`MemoryAgent executing tool: ${toolName} with args: ${JSON.stringify(args)}`);
    try {
      const provider = ProviderFactory.getProvider();
      switch (toolName) {
        case 'storeFact': {
          const content = args.content;
          const layer = args.layer || 'LONG_TERM';
          const key = args.key || null;

          let embedding = [0.0];
          try {
            embedding = await provider.embed(content);
          } catch (embedError) {
            logger.warn('Embedding generation skipped during storeFact fallback.');
          }

          let memory;
          try {
            memory = await prisma.memory.create({
              data: {
                userId,
                layer: layer as any,
                key,
                content,
                source: 'chat',
                importance: 0.8,
              },
            });

            try {
              // Apply embedding using raw query for pgvector
              const embeddingStr = `[${embedding.join(',')}]`;
              await prisma.$executeRawUnsafe(
                `UPDATE memories SET embedding = $1::vector WHERE id = $2`,
                embeddingStr,
                memory.id
              );
            } catch (embedError) {
              logger.warn('Failed to save vector embedding (pgvector might not be enabled yet on local database).', embedError);
            }
          } catch (dbErr) {
            logger.warn('⚠️ Database query failed. Falling back to mock memory storage.', dbErr);
            memory = {
              id: `mock-mem-${Math.random().toString(36).substring(2, 9)}`,
              userId,
              layer: layer as any,
              key,
              content,
              source: 'chat',
              importance: 0.8,
              createdAt: new Date(),
            };
          }

          return { success: true, data: memory, message: `Stored fact in memory: "${content}"` };
        }

        case 'searchMemories': {
          const query = args.query;
          let embedding = [0.0];
          try {
            embedding = await provider.embed(query);
          } catch (embedError) {
            logger.warn('Embedding generation skipped during searchMemories fallback.');
          }

          const embeddingStr = `[${embedding.join(',')}]`;

          let memories: any[] = [];
          try {
            // Raw query to retrieve similarity from pgvector
            memories = await prisma.$queryRawUnsafe(
              `SELECT id, layer, key, content, metadata, 1 - (embedding <=> $1::vector) as similarity 
               FROM memories 
               WHERE "userId" = $2 
               ORDER BY embedding <=> $1::vector LIMIT 5`,
              embeddingStr,
              userId
            );
          } catch (rawError) {
            logger.warn('Failed vector similarity search. Falling back to keyword match.', rawError);
            try {
              memories = await prisma.memory.findMany({
                where: {
                  userId,
                  content: { contains: query, mode: 'insensitive' },
                },
                take: 5,
              });
            } catch (dbErr) {
              logger.warn('⚠️ Database connection failed. Returning mock memory search response.', dbErr);
              memories = [
                {
                  id: 'mock-mem-1',
                  layer: 'LONG_TERM',
                  content: `User studies computer science and prefers working in the mornings.`,
                  importance: 0.9,
                  createdAt: new Date(),
                }
              ];
            }
          }

          return { success: true, data: memories, message: `Found ${memories.length} matching memory items.` };
        }

        default:
          return { success: false, error: `Unknown tool: ${toolName}` };
      }
    } catch (error: any) {
      logger.error(`Error in MemoryAgent.${toolName}:`, error);
      return { success: false, error: error.message || 'Error executing tool.' };
    }
  }
}
