export interface GitHubProfile {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  size: number; // in KB
  default_branch: string;
  license: { name: string } | null;
  topics: string[];
  private: boolean;
  language: string | null;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  archived: boolean;
}

export interface CommitInfo {
  sha: string;
  commit: {
    author: {
      name: string;
      date: string;
    };
    message: string;
  };
  html_url: string;
}

export interface Contributor {
  login: string;
  avatar_url: string;
  contributions: number;
}

export interface EnhancedRepo extends GitHubRepo {
  languages: Record<string, number>;
  readmeContent?: string;
  latestCommit?: CommitInfo;
  contributors: Contributor[];
  activityStatus: 'Very Active' | 'Active' | 'Inactive' | 'Archived';
  aiSummary: string;
}

export interface GitHubCacheData {
  timestamp: number;
  profile: GitHubProfile;
  repos: EnhancedRepo[];
}
