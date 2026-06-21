import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FolderKanban, RefreshCw, Star, GitFork, Eye, AlertCircle,
  Clock, Calendar, User, Users, Code, FileText, ExternalLink,
  ChevronRight, Sparkles, Database, BookOpen, Layers, X,
  Activity, Award, Terminal
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'
import { useUserStore } from '@/stores/userStore'
import { githubService, generateAiSummary } from '@/services/github/githubService'
import { githubCache } from '@/services/github/githubCache'
import type { EnhancedRepo, GitHubProfile } from '@/services/github/githubTypes'
import { toast } from 'react-hot-toast'

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Rust: '#dea584',
  Go: '#00ADD8',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Shell: '#89e051',
  Vue: '#41b883',
  React: '#61dafb',
}

function ProjectCard({ repo, onClick }: { repo: EnhancedRepo; onClick: () => void }) {
  const mainLang = repo.language || 'Codebase'
  const langColor = LANGUAGE_COLORS[mainLang] || '#9ca3af'
  const updatedText = repo.pushed_at 
    ? `Updated ${format(parseISO(repo.pushed_at), 'MMM d, yyyy')}`
    : `Updated ${format(parseISO(repo.updated_at), 'MMM d, yyyy')}`

  return (
    <motion.div
      layout
      onClick={onClick}
      className="card card-hover group cursor-pointer relative overflow-hidden flex flex-col justify-between"
    >
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: langColor }} />

      <div className="space-y-4">
        {/* Title and Status */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-[color:var(--text-primary)] group-hover:text-primary-400 transition-colors truncate">
              {repo.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-[color:var(--text-muted)] font-mono border border-white/5 uppercase">
                {repo.private ? 'Private' : 'Public'}
              </span>
              {repo.default_branch && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-[color:var(--text-muted)] font-mono">
                  {repo.default_branch}
                </span>
              )}
            </div>
          </div>

          <span className={cn(
            'text-[9px] px-2 py-0.5 rounded-full font-medium tracking-wide uppercase',
            repo.activityStatus === 'Very Active' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/10' :
            repo.activityStatus === 'Active' ? 'bg-primary-500/15 text-primary-400 border border-primary-500/10' :
            repo.activityStatus === 'Archived' ? 'bg-slate-500/15 text-slate-400 border border-slate-500/10' :
            'bg-warning-500/15 text-warning-400 border border-warning-500/10'
          )}>
            {repo.activityStatus}
          </span>
        </div>

        {/* Description / Summary */}
        <div className="space-y-2.5">
          <p className="text-xs text-[color:var(--text-secondary)] line-clamp-2 leading-relaxed">
            {repo.description || 'No description provided.'}
          </p>

          {/* AI Summary Block */}
          <div className="p-2.5 rounded-xl bg-primary-950/8 border border-primary-500/10 relative overflow-hidden">
            <div className="absolute top-2 right-2 opacity-15">
              <Sparkles className="w-3.5 h-3.5 text-primary-400" />
            </div>
            <p className="text-[11px] text-[color:var(--text-tertiary)] italic leading-relaxed pr-4">
              <span className="font-semibold text-primary-400 not-italic flex items-center gap-1 mb-0.5">
                <Sparkles className="w-3 h-3 animate-pulse-slow" /> AI Summary
              </span>
              "{repo.aiSummary}"
            </p>
          </div>
        </div>

        {/* Languages and Topics */}
        <div className="space-y-2">
          {repo.topics && repo.topics.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {repo.topics.slice(0, 3).map(topic => (
                <span key={topic} className="text-[9px] px-2 py-0.5 rounded-md bg-white/5 text-[color:var(--text-muted)] border border-white/5">
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer statistics */}
      <div className="border-t border-[color:var(--border-subtle)] mt-4 pt-3 flex items-center justify-between text-[10px] text-[color:var(--text-tertiary)]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-400" />
            {repo.stargazers_count}
          </span>
          <span className="flex items-center gap-1">
            <GitFork className="w-3.5 h-3.5 text-indigo-400" />
            {repo.forks_count}
          </span>
          {repo.open_issues_count > 0 && (
            <span className="flex items-center gap-1 text-rose-400">
              <AlertCircle className="w-3.5 h-3.5" />
              {repo.open_issues_count}
            </span>
          )}
        </div>

        <span className="flex items-center gap-1 text-[9px] font-mono">
          <Clock className="w-3 h-3" />
          {updatedText}
        </span>
      </div>
    </motion.div>
  )
}

function ProjectCardSkeleton() {
  return (
    <div className="card animate-pulse space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-white/10 rounded w-1/3" />
          <div className="h-3 bg-white/5 rounded w-1/5" />
        </div>
        <div className="h-5 bg-white/5 rounded-full w-20" />
      </div>
      <div className="h-10 bg-white/5 rounded w-full" />
      <div className="h-14 bg-white/5 rounded w-full" />
      <div className="border-t border-white/5 pt-3 flex items-center justify-between">
        <div className="h-3 bg-white/10 rounded w-1/4" />
        <div className="h-3 bg-white/5 rounded w-1/4" />
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  const { profile } = useUserStore()
  const githubUsername = profile.githubUsername || 'ARUNRG3005'

  const [githubProfile, setGithubProfile] = useState<GitHubProfile | null>(null)
  const [repos, setRepos] = useState<EnhancedRepo[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'Very Active' | 'Active' | 'Inactive' | 'Archived'>('all')
  const [selectedLang, setSelectedLang] = useState<string>('all')

  // Selected Repo for Detail Slide-over
  const [selectedRepo, setSelectedRepo] = useState<EnhancedRepo | null>(null)
  const [selectedRepoDetails, setSelectedRepoDetails] = useState<Partial<EnhancedRepo>>({})
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [regeneratingAI, setRegeneratingAI] = useState(false)
  const [activeDetailTab, setActiveDetailTab] = useState<'readme' | 'commits' | 'contributors' | 'stats'>('readme')

  const loadGitHubData = async (force = false) => {
    if (force) setRefreshing(true)
    else setLoading(true)

    try {
      const { profile: gProfile, repos: gRepos } = await githubService.fetchProfileAndRepos(githubUsername, force)
      setGithubProfile(gProfile)
      setRepos(gRepos)
    } catch (e: any) {
      toast.error(e.message || 'Failed to fetch live GitHub data')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadGitHubData()
  }, [githubUsername]) // eslint-disable-line

  // Handle open repo details
  const handleOpenDetails = async (repo: EnhancedRepo) => {
    setSelectedRepo(repo)
    setSelectedRepoDetails({
      languages: repo.languages,
      latestCommit: repo.latestCommit,
      contributors: repo.contributors,
      readmeContent: repo.readmeContent
    })
    setActiveDetailTab('readme')
    setLoadingDetails(true)

    try {
      // Lazy load full details (commits, languages, readme, contributors) if not already fetched
      if (!repo.readmeContent && !repo.latestCommit) {
        const details = await githubService.fetchSingleRepoDetails(githubUsername, repo.name)
        setSelectedRepoDetails(details)
        // Cache this deep info back to our state so it persists during current session
        setRepos(prev => prev.map(r => r.name === repo.name ? { ...r, ...details } as EnhancedRepo : r))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingDetails(false)
    }
  }

  // Handle live AI Summarization request
  const handleLiveAISummarize = async () => {
    if (!selectedRepo) return
    setRegeneratingAI(true)
    try {
      const languagesList = Object.keys(selectedRepoDetails.languages || selectedRepo.languages || {})
      const summary = await githubService.requestRealAISummary(
        selectedRepo.name,
        selectedRepo.description,
        languagesList,
        selectedRepo.topics
      )

      // Update state and cache
      const updatedRepo = { ...selectedRepo, aiSummary: summary }
      setSelectedRepo(updatedRepo)
      setRepos(prev => prev.map(r => r.id === selectedRepo.id ? { ...r, aiSummary: summary } : r))
      
      // Save updated data to cache
      if (githubProfile) {
        const currentCached = githubService.fetchProfileAndRepos(githubUsername, false)
        currentCached.then(({ repos: currentRepos }) => {
          const updatedReposList = currentRepos.map(r => r.id === selectedRepo.id ? { ...r, aiSummary: summary } : r)
          githubCache.setCachedData(githubUsername, { profile: githubProfile, repos: updatedReposList })
        }).catch(() => {})
      }

      toast.success('Live AI Analysis generated!')
    } catch (e) {
      toast.error('Failed to generate AI analysis')
    } finally {
      setRegeneratingAI(false)
    }
  }

  // Statistics calculations
  const activeCount = repos.filter(r => r.activityStatus === 'Very Active' || r.activityStatus === 'Active').length
  const starCount = repos.reduce((acc, r) => acc + r.stargazers_count, 0)
  const forkCount = repos.reduce((acc, r) => acc + r.forks_count, 0)

  // Language list for filter dropdown
  const allLanguagesSet = new Set<string>()
  repos.forEach(r => {
    if (r.language) allLanguagesSet.add(r.language)
  })
  const availableLanguages = Array.from(allLanguagesSet)

  // Filter repos
  const filteredRepos = repos.filter(repo => {
    const matchesSearch = repo.name.toLowerCase().includes(search.toLowerCase()) ||
      (repo.description && repo.description.toLowerCase().includes(search.toLowerCase())) ||
      repo.topics.some(t => t.toLowerCase().includes(search.toLowerCase()))
    
    const matchesStatus = activeFilter === 'all' || repo.activityStatus === activeFilter
    const matchesLang = selectedLang === 'all' || repo.language === selectedLang

    return matchesSearch && matchesStatus && matchesLang
  })

  // Format date safely
  const formatProfileDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'MMMM yyyy')
    } catch (e) {
      return ''
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      {/* Header with Profile Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 card relative overflow-hidden bg-gradient-to-br from-indigo-950/20 to-slate-900 border-indigo-500/10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        {loading ? (
          <div className="flex items-center gap-4 animate-pulse flex-1">
            <div className="w-16 h-16 rounded-2xl bg-white/5" />
            <div className="space-y-2 flex-1">
              <div className="h-5 bg-white/10 rounded w-1/4" />
              <div className="h-3.5 bg-white/5 rounded w-1/2" />
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-4">
            <img
              src={githubProfile?.avatar_url || 'https://github.com/identicons/arun.png'}
              alt={githubUsername}
              className="w-16 h-16 rounded-2xl border border-white/10 shadow-lg object-cover"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-[color:var(--text-primary)]">
                  {githubProfile?.name || githubUsername}
                </h1>
                <span className="text-xs text-[color:var(--text-tertiary)] font-mono">
                  @{githubUsername}
                </span>
              </div>
              <p className="text-xs text-[color:var(--text-secondary)] leading-relaxed max-w-xl">
                {githubProfile?.bio || 'No profile bio provided.'}
              </p>
              {githubProfile && (
                <div className="flex items-center gap-4 text-[10px] text-[color:var(--text-tertiary)] mt-1.5 flex-wrap">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" /> {githubProfile.followers} followers · {githubProfile.following} following
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Joined {formatProfileDate(githubProfile.created_at)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 self-end md:self-center">
          <button
            onClick={() => loadGitHubData(true)}
            disabled={refreshing}
            className="btn-ghost flex items-center gap-1.5 text-xs px-3.5 py-2.5 rounded-xl border border-white/5 bg-white/[0.01]"
          >
            <RefreshCw className={cn('w-3.5 h-3.5 text-[color:var(--text-tertiary)]', refreshing && 'animate-spin')} />
            {refreshing ? 'Syncing...' : 'Sync GitHub'}
          </button>
          <a
            href={`https://github.com/${githubUsername}`}
            target="_blank"
            rel="noreferrer"
            className="btn-primary flex items-center gap-1.5 text-xs px-4 py-2.5"
          >
            GitHub Profile
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Top statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'GitHub Repos', value: loading ? '-' : repos.length, icon: Database, color: 'text-primary-400', bg: 'bg-primary-500/10' },
          { label: 'Active Projects', value: loading ? '-' : activeCount, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Total Stars', value: loading ? '-' : starCount, icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Total Forks', value: loading ? '-' : forkCount, icon: GitFork, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
        ].map(stat => {
          const StatIcon = stat.icon
          return (
            <div key={stat.label} className="card p-4 flex items-center gap-4">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', stat.bg)}>
                <StatIcon className={cn('w-5 h-5', stat.color)} />
              </div>
              <div>
                <p className="text-xl font-bold text-[color:var(--text-primary)] leading-none">{stat.value}</p>
                <p className="text-[11px] text-[color:var(--text-tertiary)] mt-1.5">{stat.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--bg-card)] flex-1">
          <Code className="w-4 h-4 text-[color:var(--text-tertiary)]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search repositories, topics, languages..."
            className="flex-1 bg-transparent text-sm text-[color:var(--text-primary)] placeholder-[color:var(--text-muted)] outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Tabs */}
          <div className="flex rounded-xl overflow-hidden border border-[color:var(--border-subtle)] bg-[color:var(--bg-card)]/50 p-0.5">
            {(['all', 'Very Active', 'Active', 'Inactive', 'Archived'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={cn(
                  'px-3 py-1.5 text-xs font-semibold rounded-lg transition-all capitalize',
                  activeFilter === tab
                    ? 'bg-primary-600/20 text-primary-300 border border-primary-500/20 shadow-sm'
                    : 'text-[color:var(--text-tertiary)] hover:text-[color:var(--text-secondary)] border border-transparent'
                )}
              >
                {tab === 'all' ? 'All Activity' : tab}
              </button>
            ))}
          </div>

          {/* Language Selector */}
          <select
            value={selectedLang}
            onChange={e => setSelectedLang(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--bg-card)] text-xs text-[color:var(--text-primary)] outline-none cursor-pointer"
          >
            <option value="all">All Languages</option>
            {availableLanguages.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Projects */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredRepos.map(repo => (
              <ProjectCard
                key={repo.id}
                repo={repo}
                onClick={() => handleOpenDetails(repo)}
              />
            ))}
          </AnimatePresence>

          {filteredRepos.length === 0 && (
            <div className="col-span-1 md:col-span-2 text-center py-20 card border-dashed border-[color:var(--border-default)]">
              <FolderKanban className="w-12 h-12 text-[color:var(--text-muted)] mx-auto mb-3 opacity-30" />
              <h3 className="text-sm font-semibold text-[color:var(--text-secondary)]">No repositories found</h3>
              <p className="text-xs text-[color:var(--text-tertiary)] mt-1">Try modifying your search query or filters.</p>
            </div>
          )}
        </div>
      )}

      {/* Detail Slide-over Drawer */}
      <AnimatePresence>
        {selectedRepo && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRepo(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 cursor-pointer"
            />

            {/* Slide Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-2xl bg-[#030712]/95 border-l border-white/[0.08] backdrop-blur-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-white/[0.08] bg-white/[0.01] flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: LANGUAGE_COLORS[selectedRepo.language || ''] || '#9ca3af' }} />
                    <h2 className="text-base font-bold text-white truncate pr-2">{selectedRepo.name}</h2>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-[color:var(--text-muted)] uppercase font-mono tracking-wider border border-white/5 flex-shrink-0">
                      {selectedRepo.private ? 'Private' : 'Public'}
                    </span>
                  </div>
                  <p className="text-xs text-[color:var(--text-secondary)] mt-1.5 leading-relaxed">
                    {selectedRepo.description || 'No description provided.'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedRepo(null)}
                  className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-white/[0.08] bg-white/[0.005] px-4">
                {([
                  { id: 'readme', label: 'README.md', icon: BookOpen },
                  { id: 'commits', label: 'Commits', icon: Clock },
                  { id: 'contributors', label: 'Contributors', icon: User },
                  { id: 'stats', label: 'AI & Statistics', icon: Sparkles }
                ] as const).map(tab => {
                  const TabIcon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveDetailTab(tab.id)}
                      className={cn(
                        'flex items-center gap-2 px-4 py-3.5 text-xs font-semibold border-b-2 transition-all cursor-pointer',
                        activeDetailTab === tab.id
                          ? 'border-primary-500 text-primary-300'
                          : 'border-transparent text-[color:var(--text-tertiary)] hover:text-slate-200'
                      )}
                    >
                      <TabIcon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  )
                })}
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {loadingDetails ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <RefreshCw className="w-8 h-8 text-primary-400 animate-spin" />
                    <p className="text-xs text-[color:var(--text-tertiary)]">Fetching repository metadata...</p>
                  </div>
                ) : (
                  <>
                    {/* Tab content: README */}
                    {activeDetailTab === 'readme' && (
                      <div className="prose prose-invert max-w-none text-sm leading-relaxed overflow-x-auto select-text">
                        {selectedRepoDetails.readmeContent ? (
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {selectedRepoDetails.readmeContent}
                          </ReactMarkdown>
                        ) : (
                          <div className="text-center py-16 bg-white/[0.01] rounded-2xl border border-white/5">
                            <FileText className="w-10 h-10 text-[color:var(--text-muted)] mx-auto mb-2 opacity-30" />
                            <p className="text-xs text-[color:var(--text-tertiary)]">No README.md file found in default branch.</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tab content: COMMITS */}
                    {activeDetailTab === 'commits' && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Terminal className="w-4 h-4 text-primary-400" />
                          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Latest Commit</h3>
                        </div>

                        {selectedRepoDetails.latestCommit ? (
                          <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] space-y-2">
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-xs font-bold text-primary-300 font-mono select-all">
                                {selectedRepoDetails.latestCommit.sha.slice(0, 7)}
                              </span>
                              <span className="text-[10px] text-[color:var(--text-muted)] font-mono">
                                {format(parseISO(selectedRepoDetails.latestCommit.commit.author.date), 'MMM d, yyyy h:mm a')}
                              </span>
                            </div>
                            <p className="text-sm text-[color:var(--text-primary)] font-medium leading-relaxed">
                              {selectedRepoDetails.latestCommit.commit.message}
                            </p>
                            <div className="flex items-center gap-1.5 text-[11px] text-[color:var(--text-tertiary)] pt-1 border-t border-white/5 mt-2">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              Authored by <span className="font-semibold text-slate-200">{selectedRepoDetails.latestCommit.commit.author.name}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-16 bg-white/[0.01] rounded-2xl border border-white/5">
                            <Clock className="w-10 h-10 text-[color:var(--text-muted)] mx-auto mb-2 opacity-30" />
                            <p className="text-xs text-[color:var(--text-tertiary)]">No commit history available.</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tab content: CONTRIBUTORS */}
                    {activeDetailTab === 'contributors' && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-4 h-4 text-emerald-400" />
                          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Top Contributors</h3>
                        </div>

                        {selectedRepoDetails.contributors && selectedRepoDetails.contributors.length > 0 ? (
                          <div className="grid grid-cols-2 gap-3">
                            {selectedRepoDetails.contributors.map(c => (
                              <div key={c.login} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.01]">
                                <img
                                  src={c.avatar_url}
                                  alt={c.login}
                                  className="w-8 h-8 rounded-lg bg-slate-800 border border-white/10"
                                />
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-white truncate">@{c.login}</p>
                                  <p className="text-[10px] text-emerald-400 font-medium mt-0.5">{c.contributions} commits</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-16 bg-white/[0.01] rounded-2xl border border-white/5">
                            <Users className="w-10 h-10 text-[color:var(--text-muted)] mx-auto mb-2 opacity-30" />
                            <p className="text-xs text-[color:var(--text-tertiary)]">No contributors found.</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tab content: STATS & AI */}
                    {activeDetailTab === 'stats' && (
                      <div className="space-y-6">
                        {/* ARISE AI Deep Analysis */}
                        <div className="card gradient-border relative overflow-hidden bg-gradient-to-br from-indigo-950/20 to-slate-900">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary-600/5 to-secondary-600/5 pointer-events-none" />
                          
                          <div className="relative space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-primary-500/10 flex items-center justify-center shadow-glow-primary">
                                  <Sparkles className="w-4 h-4 text-primary-400" />
                                </div>
                                <h3 className="text-xs font-bold text-white uppercase tracking-wider">ARISE AI Synthesis</h3>
                              </div>
                              
                              <button
                                onClick={handleLiveAISummarize}
                                disabled={regeneratingAI}
                                className="btn-ghost flex items-center gap-1 text-[10px] px-2.5 py-1 rounded bg-white/5 border border-white/5 hover:bg-white/10 disabled:opacity-50"
                              >
                                <RefreshCw className={cn("w-3 h-3", regeneratingAI && "animate-spin")} />
                                {regeneratingAI ? 'Analyzing...' : 'Ask AI to Analyze'}
                              </button>
                            </div>

                            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-sm text-[color:var(--text-secondary)] leading-relaxed italic">
                              "{selectedRepo.aiSummary}"
                            </div>

                            {/* Future AI Roadmap */}
                            <div className="space-y-2.5 pt-2">
                              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-primary-400 flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5" /> Suggested Roadmap (AI Compiled)
                              </h4>
                              <ul className="space-y-1.5 text-xs text-[color:var(--text-tertiary)] list-disc list-inside pl-1">
                                <li>Configure CI/CD pipelines via GitHub actions to automate deployments.</li>
                                <li>Improve documentation using inline code blocks, TS docstrings, and comprehensive setups.</li>
                                <li>Integrate telemetry monitoring (e.g., Sentry) to log client-side exception states.</li>
                                <li>Optimize static bundle sizes by compiling code splits for large node modules.</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Metadata Stats Grid */}
                        <div className="space-y-3">
                          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Metadata & Statistics</h3>
                          
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="p-3 rounded-xl border border-white/5 bg-white/[0.01] flex items-center justify-between">
                              <span className="text-[color:var(--text-tertiary)] flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Created
                              </span>
                              <span className="font-semibold text-white">
                                {format(parseISO(selectedRepo.created_at), 'MMM d, yyyy')}
                              </span>
                            </div>
                            <div className="p-3 rounded-xl border border-white/5 bg-white/[0.01] flex items-center justify-between">
                              <span className="text-[color:var(--text-tertiary)] flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-rose-400" /> Pushed
                              </span>
                              <span className="font-semibold text-white">
                                {format(parseISO(selectedRepo.pushed_at || selectedRepo.updated_at), 'MMM d, yyyy')}
                              </span>
                            </div>
                            <div className="p-3 rounded-xl border border-white/5 bg-white/[0.01] flex items-center justify-between">
                              <span className="text-[color:var(--text-tertiary)] flex items-center gap-1">
                                <Database className="w-3.5 h-3.5 text-amber-400" /> Storage Size
                              </span>
                              <span className="font-semibold text-white">
                                {selectedRepo.size > 1024 
                                  ? `${(selectedRepo.size / 1024).toFixed(1)} MB`
                                  : `${selectedRepo.size} KB`}
                              </span>
                            </div>
                            <div className="p-3 rounded-xl border border-white/5 bg-white/[0.01] flex items-center justify-between">
                              <span className="text-[color:var(--text-tertiary)] flex items-center gap-1">
                                <Award className="w-3.5 h-3.5 text-emerald-400" /> License
                              </span>
                              <span className="font-semibold text-white truncate max-w-[150px]">
                                {selectedRepo.license?.name || 'MIT / None'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-6 border-t border-white/[0.08] bg-white/[0.01] flex items-center justify-between gap-3">
                {selectedRepo.homepage && (
                  <a
                    href={selectedRepo.homepage}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-ghost flex-1 text-center flex items-center justify-center gap-1.5 text-xs py-3 border border-white/5 rounded-xl bg-white/[0.01]"
                  >
                    View Deployment
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <a
                  href={selectedRepo.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary flex-1 text-center flex items-center justify-center gap-1.5 text-xs py-3 rounded-xl"
                >
                  Open on GitHub
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
