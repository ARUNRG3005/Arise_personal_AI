import { githubApi } from './githubApi';
import { githubCache } from './githubCache';
import type { EnhancedRepo, GitHubProfile, GitHubRepo, Contributor } from './githubTypes';

export function generateAiSummary(repo: GitHubRepo, languages: Record<string, number>): string {
  const languageNames = Object.keys(languages);
  const topLanguages = languageNames.slice(0, 2);
  const languageStr = topLanguages.length > 0 ? topLanguages.join(' + ') : 'codebase';
  
  const statusStr = repo.archived ? 'an archived' : 'a';
  const updatedDate = new Date(repo.pushed_at || repo.updated_at);
  const diffDays = Math.ceil(Math.abs(Date.now() - updatedDate.getTime()) / (1000 * 60 * 60 * 24));
  
  let activityDesc = 'is currently under active development';
  if (diffDays <= 5) {
    activityDesc = 'is actively maintained with very recent updates';
  } else if (diffDays > 30) {
    activityDesc = 'is currently stable and not receiving active updates';
  } else if (repo.archived) {
    activityDesc = 'is archived and preserved in read-only mode';
  }

  const focusAreas = repo.topics.length > 0 ? repo.topics.slice(0, 3).join(', ') : 'software engineering';
  const descriptionText = repo.description 
    ? ` It focuses on ${repo.description.replace(/\.$/, '')}.` 
    : ` It is designed for ${focusAreas} automation.`;

  return `This is ${statusStr} ${languageStr} project that ${activityDesc}.${descriptionText}`;
}

export function calculateActivityStatus(repo: GitHubRepo, latestCommitDateStr?: string): 'Very Active' | 'Active' | 'Inactive' | 'Archived' {
  if (repo.archived) return 'Archived';
  const dateStr = latestCommitDateStr || repo.pushed_at || repo.updated_at;
  const commitDate = new Date(dateStr);
  const diffTime = Math.abs(Date.now() - commitDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 7) return 'Very Active';
  if (diffDays <= 30) return 'Active';
  return 'Inactive';
}

export const githubService = {
  async fetchProfileAndRepos(username: string, force = false): Promise<{ profile: GitHubProfile; repos: EnhancedRepo[] }> {
    if (!force) {
      const cached = githubCache.getCachedData(username);
      if (cached && !githubCache.isCacheExpired(cached.timestamp)) {
        return { profile: cached.profile, repos: cached.repos };
      }
    }

    try {
      const profile = await githubApi.getProfile(username);
      const rawRepos = await githubApi.getRepos(username);

      const enrichedRepos: EnhancedRepo[] = [];

      // Sort repositories by pushes first, limit heavy operations to top 15 updated repos
      const sortedRepos = [...rawRepos].sort((a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime());

      for (let i = 0; i < sortedRepos.length; i++) {
        const repo = sortedRepos[i];
        const shouldEnrich = i < 15;
        
        let languages: Record<string, number> = {};
        let latestCommit = undefined;
        let contributors: Contributor[] = [];
        let readmeContent = '';

        if (shouldEnrich) {
          const [langsRes, commitRes, contribsRes, readmeRes] = await Promise.allSettled([
            githubApi.getLanguages(username, repo.name),
            githubApi.getLatestCommit(username, repo.name),
            githubApi.getContributors(username, repo.name),
            githubApi.getReadme(username, repo.name)
          ]);

          languages = langsRes.status === 'fulfilled' ? langsRes.value : {};
          latestCommit = commitRes.status === 'fulfilled' ? commitRes.value : undefined;
          contributors = contribsRes.status === 'fulfilled' ? contribsRes.value : [];
          readmeContent = readmeRes.status === 'fulfilled' ? readmeRes.value : '';
        }

        const activityStatus = calculateActivityStatus(repo, latestCommit?.commit.author.date);
        const aiSummary = generateAiSummary(repo, languages);

        enrichedRepos.push({
          ...repo,
          languages,
          latestCommit,
          contributors,
          readmeContent,
          activityStatus,
          aiSummary
        });
      }

      githubCache.setCachedData(username, { profile, repos: enrichedRepos });

      return { profile, repos: enrichedRepos };
    } catch (e) {
      console.error('Error fetching live GitHub data:', e);
      const cached = githubCache.getCachedData(username);
      if (cached) {
        return { profile: cached.profile, repos: cached.repos };
      }
      throw e;
    }
  },

  async fetchSingleRepoDetails(username: string, repoName: string): Promise<Partial<EnhancedRepo>> {
    try {
      const [languages, latestCommit, contributors, readmeContent] = await Promise.all([
        githubApi.getLanguages(username, repoName),
        githubApi.getLatestCommit(username, repoName),
        githubApi.getContributors(username, repoName),
        githubApi.getReadme(username, repoName)
      ]);

      return {
        languages,
        latestCommit,
        contributors,
        readmeContent
      };
    } catch (e) {
      console.error(`Error fetching single repo details for ${repoName}:`, e);
      return {};
    }
  },

  async requestRealAISummary(name: string, description: string | null, languages: string[], topics: string[]): Promise<string> {
    try {
      const response = await fetch('/api/ai/summarize-repo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('arise-token') || ''}`
        },
        body: JSON.stringify({ name, description, languages, topics })
      });

      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      return data.summary || '';
    } catch (e) {
      console.error('Error generating live AI summary:', e);
      return 'Failed to generate live AI summary.';
    }
  }
};
