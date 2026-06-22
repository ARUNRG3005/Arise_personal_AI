import { tavilyService, TavilySearchResult } from './tavilyService';
import { logger } from '../config/logger';

export interface SearchSource {
  title: string;
  url: string;
  snippet: string;
}

interface CacheEntry {
  results: SearchSource[];
  timestamp: number;
}

export class SearchService {
  private cache = new Map<string, CacheEntry>();
  private cacheTtl = 5 * 60 * 1000; // 5 minutes TTL

  async search(query: string): Promise<SearchSource[]> {
    const cleanQuery = query.trim().toLowerCase();

    // 1. Check cache
    const cached = this.cache.get(cleanQuery);
    if (cached && Date.now() - cached.timestamp < this.cacheTtl) {
      logger.info(`🔍 Search Cache HIT for query: "${query}"`);
      return cached.results;
    }

    logger.info(`🔍 Search Cache MISS for query: "${query}". Requesting Tavily API.`);

    try {
      // 2. Query Tavily API
      const rawResults = await tavilyService.search(query);

      if (!rawResults || rawResults.length === 0) {
        logger.warn(`⚠️ Tavily returned empty results for query "${query}". Trying DuckDuckGo fallback.`);
        const fallbackResults = await this.fallbackSearchDDG(query);
        
        this.cache.set(cleanQuery, {
          results: fallbackResults,
          timestamp: Date.now(),
        });
        return fallbackResults;
      }

      // 3. Process, clean, and deduplicate results
      const processedResults = this.processResults(rawResults);

      // 4. Update Cache
      this.cache.set(cleanQuery, {
        results: processedResults,
        timestamp: Date.now(),
      });

      return processedResults;
    } catch (error: any) {
      logger.error(`❌ Error in Tavily search for query "${query}": ${error.message || error}. Falling back to DuckDuckGo.`);
      try {
        const fallbackResults = await this.fallbackSearchDDG(query);
        this.cache.set(cleanQuery, {
          results: fallbackResults,
          timestamp: Date.now(),
        });
        return fallbackResults;
      } catch (fallbackError: any) {
        logger.error(`❌ DuckDuckGo fallback search failed for query "${query}":`, fallbackError);
        return [];
      }
    }
  }

  async fallbackSearchDDG(query: string): Promise<SearchSource[]> {
    logger.info(`🦆 Querying DuckDuckGo Instant Answer API for query: "${query}"`);
    try {
      const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
        },
      });

      if (!response.ok) {
        throw new Error(`DuckDuckGo API responded with status ${response.status}`);
      }

      const data = (await response.json()) as any;
      const results: SearchSource[] = [];

      // 1. Primary abstract text
      if (data.AbstractText && data.AbstractText.trim()) {
        results.push({
          title: data.Heading || data.AbstractSource || 'Abstract Summary',
          url: data.AbstractURL || `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
          snippet: data.AbstractText.trim(),
        });
      }

      // 2. Add related topics (up to 5 total results)
      if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
        for (const topic of data.RelatedTopics) {
          if (topic.FirstURL && topic.Text) {
            results.push({
              title: topic.Text.split(' - ')[0] || 'Related Topic',
              url: topic.FirstURL,
              snippet: topic.Text,
            });
          } else if (topic.Topics && Array.isArray(topic.Topics)) {
            for (const subtopic of topic.Topics) {
              if (subtopic.FirstURL && subtopic.Text) {
                results.push({
                  title: subtopic.Text.split(' - ')[0] || 'Related Topic',
                  url: subtopic.FirstURL,
                  snippet: subtopic.Text,
                });
              }
              if (results.length >= 5) break;
            }
          }
          if (results.length >= 5) break;
        }
      }

      // 3. Add explicit results if any
      if (data.Results && Array.isArray(data.Results) && results.length < 5) {
        for (const res of data.Results) {
          if (res.FirstURL && res.Text) {
            results.push({
              title: res.Text.split(' - ')[0] || 'Search Result',
              url: res.FirstURL,
              snippet: res.Text,
            });
          }
          if (results.length >= 5) break;
        }
      }

      logger.info(`🦆 DuckDuckGo returned ${results.length} results.`);
      return results;
    } catch (error: any) {
      logger.error(`❌ DuckDuckGo search failed: ${error.message || error}`);
      throw error;
    }
  }

  private processResults(results: TavilySearchResult[]): SearchSource[] {
    const seenUrls = new Set<string>();
    const processed: SearchSource[] = [];

    for (const res of results) {
      if (!res.url || !res.title) continue;

      // Extract base URL / clean URL to deduplicate
      let cleanUrl = res.url.trim();
      try {
        const urlObj = new URL(res.url);
        cleanUrl = (urlObj.origin + urlObj.pathname).toLowerCase().trim();
      } catch (e) {
        // Fallback if URL parsing fails
      }

      if (seenUrls.has(cleanUrl)) continue;
      seenUrls.add(cleanUrl);

      processed.push({
        title: res.title.trim(),
        url: res.url.trim(),
        snippet: (res.content || '').trim(),
      });
    }

    return processed;
  }
}

export const searchService = new SearchService();
