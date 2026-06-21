import type { GitHubProfile, GitHubRepo, CommitInfo, Contributor } from './githubTypes';

const BASE_URL = 'https://api.github.com';

async function apiFetch<T>(url: string): Promise<T> {
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  };

  // Check if there is a saved personal access token in localStorage to increase rate limits
  const token = localStorage.getItem('arise-github-token');
  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    if (response.status === 403 || response.status === 429) {
      throw new Error('GitHub API rate limit exceeded. Consider adding a token in Settings.');
    }
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export const githubApi = {
  async getProfile(username: string): Promise<GitHubProfile> {
    return apiFetch<GitHubProfile>(`${BASE_URL}/users/${username}`);
  },

  async getRepos(username: string): Promise<GitHubRepo[]> {
    return apiFetch<GitHubRepo[]>(`${BASE_URL}/users/${username}/repos?sort=updated&per_page=100`);
  },

  async getLanguages(owner: string, repo: string): Promise<Record<string, number>> {
    try {
      return await apiFetch<Record<string, number>>(`${BASE_URL}/repos/${owner}/${repo}/languages`);
    } catch (e) {
      console.warn(`Could not fetch languages for ${owner}/${repo}:`, e);
      return {};
    }
  },

  async getReadme(owner: string, repo: string): Promise<string> {
    try {
      const data = await apiFetch<{ content?: string; encoding?: string }>(`${BASE_URL}/repos/${owner}/${repo}/readme`);
      if (data.content && data.encoding === 'base64') {
        const decoded = decodeURIComponent(
          atob(data.content.replace(/\s/g, ''))
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        return decoded;
      }
      return '';
    } catch (e) {
      console.warn(`Could not fetch readme for ${owner}/${repo}:`, e);
      return '';
    }
  },

  async getLatestCommit(owner: string, repo: string): Promise<CommitInfo | undefined> {
    try {
      const commits = await apiFetch<CommitInfo[]>(`${BASE_URL}/repos/${owner}/${repo}/commits?per_page=1`);
      return commits[0];
    } catch (e) {
      console.warn(`Could not fetch commits for ${owner}/${repo}:`, e);
      return undefined;
    }
  },

  async getContributors(owner: string, repo: string): Promise<Contributor[]> {
    try {
      return await apiFetch<Contributor[]>(`${BASE_URL}/repos/${owner}/${repo}/contributors?per_page=10`);
    } catch (e) {
      console.warn(`Could not fetch contributors for ${owner}/${repo}:`, e);
      return [];
    }
  }
};
