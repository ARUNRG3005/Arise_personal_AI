import { BaseAgent, ToolResult } from './BaseAgent';
import { ToolDefinition } from '../providers/AIProvider';
import { logger } from '../../config/logger';

export class GitHubAgent extends BaseAgent {
  name = 'GitHubAgent';
  description = 'Agent responsible for querying GitHub profiles and public repositories.';

  getTools(): ToolDefinition[] {
    return [
      {
        name: 'getGithubProfile',
        description: 'Get public GitHub profile details for a given username.',
        parameters: {
          type: 'object',
          properties: {
            username: { type: 'string', description: 'The GitHub username (defaults to ARUNRG3005).' },
          },
          required: [],
        },
      },
      {
        name: 'getGithubRepositories',
        description: 'List public GitHub repositories and details for a given username.',
        parameters: {
          type: 'object',
          properties: {
            username: { type: 'string', description: 'The GitHub username (defaults to ARUNRG3005).' },
          },
          required: [],
        },
      },
    ];
  }

  async execute(toolName: string, args: any, userId: string): Promise<ToolResult> {
    logger.info(`GitHubAgent executing tool: ${toolName} with args: ${JSON.stringify(args)}`);
    const username = args.username || 'ARUNRG3005';

    try {
      switch (toolName) {
        case 'getGithubProfile': {
          const response = await fetch(`https://api.github.com/users/${username}`, {
            headers: {
              Accept: 'application/vnd.github.v3+json',
              'User-Agent': 'arise-personal-ai'
            }
          });

          if (!response.ok) {
            return { success: false, error: `GitHub API error: ${response.status} ${response.statusText}` };
          }

          const data = await response.json();
          return { success: true, data };
        }
        case 'getGithubRepositories': {
          const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=50`, {
            headers: {
              Accept: 'application/vnd.github.v3+json',
              'User-Agent': 'arise-personal-ai'
            }
          });

          if (!response.ok) {
            return { success: false, error: `GitHub API error: ${response.status} ${response.statusText}` };
          }

          const repos = await response.json() as any[];
          const simplifiedRepos = repos.map(r => ({
            name: r.name,
            description: r.description,
            language: r.language,
            stars: r.stargazers_count,
            forks: r.forks_count,
            open_issues: r.open_issues_count,
            url: r.html_url,
            updated_at: r.updated_at
          }));

          return { success: true, data: simplifiedRepos };
        }
        default:
          throw new Error(`Tool ${toolName} not supported by GitHubAgent.`);
      }
    } catch (error: any) {
      logger.error(`Error executing tool ${toolName} in GitHubAgent:`, error);
      return { success: false, error: error.message || 'API request failed.' };
    }
  }
}
