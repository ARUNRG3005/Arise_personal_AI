import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { Sparkles, Target, ArrowRight, CheckCircle2, Circle, Flame, Calendar, Clock, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getGreeting, getDayPhase } from '@/lib/utils'
import QuickCapture from './components/QuickCapture'
import DailyTimeline from './components/DailyTimeline'
import { cn } from '@/lib/utils'
import { useUserStore } from '@/stores/userStore'
import { useTaskStore } from '@/stores/taskStore'
import { githubService } from '@/services/github/githubService'
import HudCard from '@/components/shared/HudCard'

// Mock data (will be replaced by real API data)
const MOCK_HABITS = [
  { id: '1', title: 'Morning Exercise', icon: '🏋️', completed: true, streak: 12 },
  { id: '2', title: 'Read 30 minutes', icon: '📚', completed: false, streak: 5 },
  { id: '3', title: 'Meditate', icon: '🧘', completed: false, streak: 3 },
  { id: '4', title: 'Drink 2L water', icon: '💧', completed: true, streak: 8 },
]

const MOCK_EVENTS = [
  { id: '1', title: 'Team standup', start: new Date(Date.now() + 3600000).toISOString(), color: '#00cfff' },
  { id: '2', title: 'Study session', start: new Date(Date.now() + 7200000).toISOString(), color: '#8884d8' },
  { id: '3', title: 'Gym', start: new Date(Date.now() + 18000000).toISOString(), color: '#00fa9a' },
]

const DAILY_QUOTE = {
  text: "The secret of getting ahead is getting started.",
  author: "Mark Twain"
}

const stagger = {
  animate: { transition: { staggerChildren: 0.07 } }
}

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { profile } = useUserStore()
  const { tasks, toggleTask, deleteTask } = useTaskStore()
  const name = profile.name || 'User'
  const phase = getDayPhase()
  const greeting = getGreeting()
  const today = format(new Date(), "EEEE, MMMM d")

  // Live Digital Clock
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Live GitHub state
  const githubUsername = profile.githubUsername || 'ARUNRG3005'
  const [gitProfile, setGitProfile] = useState<any>(null)
  const [gitRepos, setGitRepos] = useState<any[]>([])
  const [gitLoading, setGitLoading] = useState(true)

  useEffect(() => {
    async function loadGit() {
      try {
        const { profile: p, repos: r } = await githubService.fetchProfileAndRepos(githubUsername)
        setGitProfile(p)
        setGitRepos(r)
      } catch (e) {
        console.error(e)
      } finally {
        setGitLoading(false)
      }
    }
    loadGit()
  }, [githubUsername])

  // Dynamic calculations for GitHub details
  const sortedRepos = [...gitRepos].sort((a, b) => new Date(b.pushed_at || b.updated_at).getTime() - new Date(a.pushed_at || a.updated_at).getTime())
  const latestRepo = sortedRepos[0]

  let daysSinceCommit = 0
  if (latestRepo) {
    const lastPushed = new Date(latestRepo.pushed_at || latestRepo.updated_at)
    daysSinceCommit = Math.floor(Math.abs(Date.now() - lastPushed.getTime()) / (1000 * 60 * 60 * 24))
  }

  // Dynamic AI Suggestions
  const aiSuggestions: string[] = []
  if (latestRepo) {
    if (daysSinceCommit > 3) {
      aiSuggestions.push(`You haven't committed to your ${latestRepo.name} repository for ${daysSinceCommit} days. Consider starting a focus block today.`)
    } else {
      aiSuggestions.push(`Your development momentum is strong! You recently pushed updates to ${latestRepo.name}.`)
    }
  }

  const inactiveRepos = gitRepos.filter(r => r.activityStatus === 'Inactive').slice(0, 1)
  if (inactiveRepos.length > 0) {
    aiSuggestions.push(`Your ${inactiveRepos[0].name} project has become inactive. Want to archive it or schedule a task to review it?`)
  }

  const recentCommitsCount = gitRepos.filter(r => {
    const pushedDate = new Date(r.pushed_at || r.updated_at)
    const diffDays = Math.ceil(Math.abs(Date.now() - pushedDate.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays <= 7
  }).length

  if (recentCommitsCount > 0) {
    aiSuggestions.push(`You updated ${recentCommitsCount} repositories this week. Great work keeping up the progress!`)
  }

  if (aiSuggestions.length === 0) {
    aiSuggestions.push("You have 4 tasks due today. Want me to prioritize them?")
    aiSuggestions.push("Your best focus time is usually 9–11 AM. Block it today?")
    aiSuggestions.push("You haven't journaled in 2 days. Want to reflect now?")
  }

  const completedTasks = tasks.filter(t => t.status === 'DONE').length
  const completedHabits = MOCK_HABITS.filter(h => h.completed).length
  const totalItems = tasks.length + MOCK_HABITS.length
  const productivity = totalItems > 0 ? Math.round(((completedTasks + completedHabits) / totalItems) * 100) : 0

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      {/* Header greeting & Clock */}
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-[#00cfff]/15"
      >
        <motion.div variants={fadeUp}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">
              {phase === 'morning' ? '☀️' : phase === 'afternoon' ? '🌤️' : phase === 'evening' ? '🌆' : '🌙'}
            </span>
            <h2 className="text-2xl font-mono font-bold text-[#e8f7ff] uppercase tracking-wide">
              {greeting}, <span className="text-[#00cfff] shadow-glow-sm">{name}</span>
            </h2>
          </div>
          <p className="text-xs font-mono text-[#8ab6d6]/60 uppercase tracking-widest">{today} · SYSTEM_STATUS: OPERATIONAL</p>
        </motion.div>

        {/* Live digital clock */}
        <motion.div variants={fadeUp} className="flex flex-col items-start sm:items-end text-left sm:text-right font-mono">
          <div className="text-3xl font-bold text-[#00cfff] tracking-widest drop-shadow-[0_0_8px_rgba(0,207,255,0.4)]">
            {format(time, 'HH:mm:ss')}
          </div>
          <div className="text-[10px] text-[#8ab6d6]/60 uppercase tracking-widest mt-1">
            {format(time, 'zzz · yyyy-MM-dd')}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[9px] text-[#00cfff]/70">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00cfff] animate-ping" />
            <span>SECURE_LINK // ACTIVE</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Quick Capture */}
      <motion.div variants={fadeUp} initial="initial" animate="animate">
        <QuickCapture />
      </motion.div>

      {/* Main grid */}
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="grid grid-cols-12 gap-5"
      >
        {/* Daily Timeline */}
        <motion.div variants={fadeUp} className="col-span-12 lg:col-span-5">
          <DailyTimeline />
        </motion.div>

        {/* Right column */}
        <div className="col-span-12 lg:col-span-7 space-y-5">
          {/* AI Insight */}
          <motion.div variants={fadeUp}>
            <HudCard
              title="AI DIRECTIVE"
              subtitle="SYSTEM INTEL FEED"
              headerExtra={<span className="w-2 h-2 rounded-full bg-[#00cfff] shadow-[0_0_6px_#00cfff]" />}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#00cfff]/10 flex items-center justify-center flex-shrink-0 border border-[#00cfff]/25 text-[#00cfff] shadow-glow-sm">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#e8f7ff] leading-relaxed font-sans">
                    {aiSuggestions[0]}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/chat')}
                  className="p-2 rounded-lg bg-[#00cfff]/5 hover:bg-[#00cfff]/15 text-[#00cfff] transition-colors flex-shrink-0 border border-[#00cfff]/10"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </HudCard>
          </motion.div>

          {/* Stats row */}
          <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
            {[
              { label: 'Tasks Done', value: `${completedTasks}/${tasks.length}`, icon: Target, color: 'text-[#00cfff]', bg: 'bg-[#00cfff]/10 border border-[#00cfff]/15', progress: tasks.length ? (completedTasks / tasks.length) * 100 : 0 },
              { label: 'Habits Active', value: `${completedHabits}/${MOCK_HABITS.length}`, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10 border border-orange-500/15', progress: MOCK_HABITS.length ? (completedHabits / MOCK_HABITS.length) * 100 : 0 },
              { label: 'Events Today', value: `${MOCK_EVENTS.length}`, icon: Calendar, color: 'text-purple-400', bg: 'bg-purple-500/10 border border-purple-500/15', progress: 100 },
            ].map((stat) => {
              const StatIcon = stat.icon
              return (
                <HudCard key={stat.label} className="text-center" progress={stat.progress}>
                  <div className={cn('w-9 h-9 rounded-xl mx-auto mb-2 flex items-center justify-center', stat.bg)}>
                    <StatIcon className={cn('w-4 h-4', stat.color)} />
                  </div>
                  <p className="text-xl font-mono font-bold text-[#e8f7ff]">{stat.value}</p>
                  <p className="text-[10px] font-mono text-[#8ab6d6]/60 uppercase mt-0.5">{stat.label}</p>
                </HudCard>
              )
            })}
          </motion.div>

          {/* Today's tasks */}
          <motion.div variants={fadeUp}>
            <HudCard
              title="TODAY'S TASKS"
              subtitle={`${tasks.filter(t => t.status !== 'DONE').length} REMAINING`}
              headerExtra={
                <button
                  onClick={() => navigate('/tasks')}
                  className="btn-ghost text-[10px] font-mono flex items-center gap-1 text-[#00cfff]/80 hover:text-[#00cfff]"
                >
                  View all <ArrowRight className="w-3 h-3" />
                </button>
              }
            >
              <div className="space-y-2">
                {tasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] border border-[#00cfff]/5 hover:border-[#00cfff]/20 transition-all cursor-pointer group"
                    onClick={() => toggleTask(task.id)}
                  >
                    <button className="flex-shrink-0 text-[#8ab6d6]/55 hover:text-[#00cfff] transition-colors">
                      {task.status === 'DONE' ? (
                        <CheckCircle2 className="w-4 h-4 text-[#00cfff]" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>
                    <span className={cn(
                      'flex-1 text-sm truncate font-sans',
                      task.status === 'DONE'
                        ? 'line-through text-[#8ab6d6]/50'
                        : 'text-[#e8f7ff]'
                    )}>
                      {task.title}
                    </span>
                    <span className={cn(
                      'badge text-[10px] font-mono',
                      task.priority === 'HIGH' || task.priority === 'URGENT' ? 'badge-error' :
                      task.priority === 'MEDIUM' ? 'badge-warning' : 'badge-success'
                    )}>
                      {task.priority}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteTask(task.id) }}
                      className="p-1.5 rounded-lg hover:bg-rose-500/20 text-[#8ab6d6]/50 hover:text-rose-400 transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
                      title="Delete Task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <p className="text-xs text-[#8ab6d6]/40 text-center py-4 font-mono">NO ACTIVE TASKS DETECTED.</p>
                )}
              </div>

              <button
                onClick={() => navigate('/tasks')}
                className="w-full mt-3 py-2.5 rounded-xl border border-dashed border-[#00cfff]/20 text-xs font-mono uppercase text-[#8ab6d6]/70 hover:text-[#00cfff] hover:border-[#00cfff]/40 hover:bg-[#00cfff]/5 transition-all flex items-center justify-center gap-2"
              >
                + ADD NEW DIRECTIVE
              </button>
            </HudCard>
          </motion.div>

          {/* Habits today */}
          <motion.div variants={fadeUp}>
            <HudCard
              title="HABIT TRACKER"
              subtitle={`${completedHabits} OF ${MOCK_HABITS.length} DONE`}
              headerExtra={
                <button onClick={() => navigate('/habits')} className="btn-ghost text-[10px] font-mono flex items-center gap-1 text-[#00cfff]/80 hover:text-[#00cfff]">
                  View all <ArrowRight className="w-3 h-3" />
                </button>
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {MOCK_HABITS.map((habit) => (
                  <div
                    key={habit.id}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl border transition-all duration-200',
                      habit.completed
                        ? 'bg-[#00cfff]/5 border-[#00cfff]/20'
                        : 'bg-white/[0.01] border-[#00cfff]/5 hover:bg-white/[0.03]'
                    )}
                  >
                    <span className="text-lg">{habit.icon}</span>
                    <div className="text-left min-w-0 flex-1">
                      <p className={cn(
                        'text-xs font-bold truncate font-sans',
                        habit.completed ? 'text-[#00cfff]' : 'text-[#e8f7ff]'
                      )}>
                        {habit.title}
                      </p>
                      <p className="text-[10px] text-[#8ab6d6]/50 flex items-center gap-1 font-mono uppercase">
                        <Flame className="w-2.5 h-2.5 text-orange-400" />
                        {habit.streak}d STREAK
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </HudCard>
          </motion.div>

          {/* GitHub Live Monitor */}
          <motion.div variants={fadeUp}>
            <HudCard
              title="GITHUB ACTIVITY MONITOR"
              subtitle={`LIVE ACTIVITY FOR @${githubUsername}`}
              headerExtra={
                <button onClick={() => navigate('/projects')} className="btn-ghost text-[10px] font-mono flex items-center gap-1 text-[#00cfff]/80 hover:text-[#00cfff]">
                  Repos <ArrowRight className="w-3 h-3" />
                </button>
              }
            >
              {gitLoading ? (
                <div className="animate-pulse space-y-3 py-2">
                  <div className="h-4 bg-[#00cfff]/5 rounded w-1/3" />
                  <div className="h-10 bg-[#00cfff]/5 rounded w-full" />
                </div>
              ) : gitRepos.length === 0 ? (
                <p className="text-xs text-[#8ab6d6]/40 text-center py-4 font-mono">NO REPOSITORIES DETECTED.</p>
              ) : (
                <div className="space-y-3">
                  {latestRepo && (
                    <div className="p-3 rounded-xl bg-white/[0.01] border border-[#00cfff]/10 hover:border-[#00cfff]/25 transition-all flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[9px] uppercase font-semibold text-[#00cfff] font-mono tracking-widest">LATEST COMMITTED REPO</p>
                        <h4 className="text-xs font-mono font-bold text-white truncate mt-0.5">{latestRepo.name}</h4>
                        <p className="text-xs text-[#8ab6d6]/60 truncate mt-1">
                          {latestRepo.latestCommit?.commit.message || latestRepo.description || 'No commit message'}
                        </p>
                        <p className="text-[9px] text-[#8ab6d6]/50 mt-1.5 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-[#00cfff]" />
                          {daysSinceCommit === 0 ? 'PUSHED TODAY' : daysSinceCommit === 1 ? 'PUSHED YESTERDAY' : `${daysSinceCommit} DAYS AGO`}
                        </p>
                      </div>
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#00cfff]/10 text-[#00cfff] font-mono">
                        {latestRepo.activityStatus}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </HudCard>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom row */}
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="grid grid-cols-12 gap-5"
      >
        {/* Upcoming events */}
        <motion.div variants={fadeUp} className="col-span-12 md:col-span-6">
          <HudCard
            title="UPCOMING SCHEDULE"
            subtitle={`${MOCK_EVENTS.length} EVENTS LOADED`}
            headerExtra={
              <button onClick={() => navigate('/calendar')} className="btn-ghost text-[10px] font-mono flex items-center gap-1 text-[#00cfff]/80 hover:text-[#00cfff]">
                Calendar <ArrowRight className="w-3 h-3" />
              </button>
            }
          >
            <div className="space-y-2">
              {MOCK_EVENTS.map((event) => (
                <div key={event.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] border border-[#00cfff]/5 transition-colors">
                  <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ background: event.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#e8f7ff] truncate">{event.title}</p>
                    <p className="text-xs text-[#8ab6d6]/60 flex items-center gap-1 mt-0.5 font-mono">
                      <Clock className="w-3 h-3 text-[#00cfff]" />
                      {format(new Date(event.start), 'h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </HudCard>
        </motion.div>

        {/* Daily quote */}
        <motion.div variants={fadeUp} className="col-span-12 md:col-span-6">
          <HudCard title="DAILY DIRECTIVE" subtitle="SYSTEM REFLECTION CODE">
            <div className="h-full flex flex-col justify-between relative overflow-hidden min-h-[90px]">
              <div className="absolute -top-3 -right-2 text-6xl font-serif text-[#00cfff]/10 select-none leading-none">"</div>
              <div>
                <p className="text-sm italic text-[#e8f7ff] leading-relaxed relative z-10 font-sans">
                  "{DAILY_QUOTE.text}"
                </p>
              </div>
              <p className="text-xs text-[#8ab6d6]/50 mt-4 font-mono">— {DAILY_QUOTE.author.toUpperCase()}</p>
            </div>
          </HudCard>
        </motion.div>
      </motion.div>
    </div>
  )
}
