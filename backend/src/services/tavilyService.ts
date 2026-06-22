import { env } from '../config/env';
import { logger } from '../config/logger';

export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

export interface TavilyResponse {
  results: TavilySearchResult[];
}

export class TavilyService {
  private apiKey: string;
  private baseUrl = 'https://api.tavily.com/search';

  constructor() {
    this.apiKey = env.TAVILY_API_KEY || '';
  }

  async search(query: string, maxResults = 5): Promise<TavilySearchResult[]> {
    if (!this.apiKey) {
      logger.warn('Tavily search skipped: TAVILY_API_KEY is not configured.');
      return [];
    }

    const payload = {
      api_key: this.apiKey,
      query,
      search_depth: 'basic',
      max_results: maxResults,
      include_answer: false,
      include_raw_content: false,
    };

    try {
      const response = await this.fetchWithRetry(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`Tavily API responded with status ${response.status}: ${errorText || response.statusText}`);
      }

      const data = (await response.json()) as TavilyResponse;
      return data.results || [];
    } catch (error: any) {
      logger.error(`Tavily API call failed for query "${query}":`, error);
      throw error;
    }
  }

  private async fetchWithRetry(url: string, options: RequestInit, retries = 2, delay = 1000): Promise<Response> {
    for (let i = 0; i <= retries; i++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
      } catch (error: any) {
        clearTimeout(timeoutId);
        const isTimeout = error.name === 'AbortError';
        const errorMsg = isTimeout ? 'Request timed out (5s)' : error.message || String(error);

        if (i === retries) {
          logger.error(`Tavily API request failed after ${retries} retries. Final error: ${errorMsg}`);
          throw new Error(`Tavily API request failed: ${errorMsg}`);
        }

        logger.warn(`Tavily API request failed (${errorMsg}). Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    throw new Error('Tavily request failed after retries.');
  }
}

export const tavilyService = new TavilyService();
