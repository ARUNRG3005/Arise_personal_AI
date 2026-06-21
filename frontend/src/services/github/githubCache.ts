import type { GitHubCacheData } from './githubTypes';

const CACHE_KEY_PREFIX = 'arise-github-cache-';
const CACHE_LIFESPAN_MS = 15 * 60 * 1000; // 15 minutes

export const githubCache = {
  getCachedData(username: string): GitHubCacheData | null {
    try {
      const dataStr = localStorage.getItem(`${CACHE_KEY_PREFIX}${username.toLowerCase()}`);
      if (!dataStr) return null;
      return JSON.parse(dataStr) as GitHubCacheData;
    } catch (e) {
      console.error('Error reading GitHub cache:', e);
      return null;
    }
  },

  setCachedData(username: string, data: Omit<GitHubCacheData, 'timestamp'>): void {
    try {
      const cacheData: GitHubCacheData = {
        ...data,
        timestamp: Date.now(),
      };
      localStorage.setItem(
        `${CACHE_KEY_PREFIX}${username.toLowerCase()}`,
        JSON.stringify(cacheData)
      );
    } catch (e) {
      console.error('Error writing GitHub cache:', e);
    }
  },

  isCacheExpired(timestamp: number): boolean {
    return Date.now() - timestamp > CACHE_LIFESPAN_MS;
  },

  clearCache(username: string): void {
    localStorage.removeItem(`${CACHE_KEY_PREFIX}${username.toLowerCase()}`);
  }
};
