import { BaseAgent, ToolResult } from './BaseAgent';
import { ToolDefinition } from '../providers/AIProvider';
import { searchService } from '../../services/searchService';
import { logger } from '../../config/logger';

export class SearchAgent extends BaseAgent {
  name = 'SearchAgent';
  description = 'Agent responsible for performing real-time global internet search.';

  getTools(): ToolDefinition[] {
    return [
      {
        name: 'searchWeb',
        description: 'Perform a real-time global internet search to retrieve current news, weather, stock prices, cryptocurrency, sports scores, technology updates, programming docs, or recent facts.',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'The search query to execute. Be specific, focused, and concise.',
            },
          },
          required: ['query'],
        },
      },
    ];
  }

  async execute(toolName: string, args: any, userId: string): Promise<ToolResult> {
    logger.info(`SearchAgent executing tool: ${toolName} with args: ${JSON.stringify(args)}`);

    if (toolName !== 'searchWeb') {
      throw new Error(`Tool ${toolName} not supported by SearchAgent.`);
    }

    const { query } = args;
    if (!query || typeof query !== 'string') {
      return { success: false, error: 'A query string parameter is required.' };
    }

    try {
      const results = await searchService.search(query);
      return { success: true, data: results };
    } catch (error: any) {
      logger.error(`SearchAgent failed to execute search:`, error);
      return { success: false, error: error.message || 'Search execution failed.' };
    }
  }
}
