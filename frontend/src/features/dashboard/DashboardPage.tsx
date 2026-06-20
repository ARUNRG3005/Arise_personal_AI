import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { Sparkles, Zap, Target, Brain, TrendingUp, Plus, ArrowRight, CheckCircle2, Circle, Flame, Calendar, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getGreeting, getDayPhase } from '@/lib/utils'
import QuickCapture from './components/QuickCapture'
import DailyTimeline from './components/DailyTimeline'
import { cn } from '@/lib/utils'

// Mock data for Phase 1 (will be replaced by real API data)
const MOCK_TASKS = [
  { id: '1', title: 'Review AI Orchestrator design', priority: 'HIGH', status: 'TODO', dueDate: new Date().toISOString() },
  { id: '2', title: 'Write Prisma schema migrations', priority: 'MEDIUM', status: 'IN_PROGRESS', dueDate: new Date().toISOString() },
  { id: '3', title: 'Set up Supabase storage bucket', priority: 'LOW', status: 'TODO', dueDate: new Date().toISOString() },
  { id: '4', title: 'Deploy frontend to Vercel', priority: 'HIGH', status: 'TODO', dueDate: new Date().toISOString() },
]

const MOCK_HABITS = [
  { id: '1', title: 'Morning Exercise', icon: '🏋️', completed: true, streak: 12 },
  { id: '2', title: 'Read 30 minutes', icon: '📚', completed: false, streak: 5 },
  { id: '3', title: 'Meditate', icon: '🧘', completed: false, streak: 3 },
  { id: '4', title: 'Drink 2L water', icon: '💧', completed: true, streak: 8 },
]

const MOCK_EVENTS = [
  { id: '1', title: 'Team standup', start: new Date(Date.now() + 3600000).toISOString(), color: '#6366f1' },
  { id: '2', title: 'Study session', start: new Date(Date.now() + 7200000).toISOString(), color: '#a855f7' },
  { id: '3', title: 'Gym', start: new Date(Date.now() + 18000000).toISOString(), color: '#10b981' },
]

const AI_SUGGESTIONS = [
  "You have 4 tasks due today. Want me to prioritize them?",
  "Your best focus time is usually 9–11 AM. Block it today?",
  "You haven't journaled in 2 days. Want to reflect now?",
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
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const phase = getDayPhase()
  const greeting = getGreeting()
  const today = format(new Date(), "EEEE, MMMM d")

  const completedTasks = MOCK_TASKS.filter(t => t.status === 'DONE').length
  const completedHabits = MOCK_HABITS.filter(h => h.completed).length
  const productivity = Math.round(((completedTasks + completedHabits) / (MOCK_TASKS.length + MOCK_HABITS.length)) * 100)

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      {/* Header greeting */}
      <motion.div
        variants={stagger}
        initial="initial"
        animate="animate"
        className="flex items-start justify-between gap-4"
      >
        <motion.div variants={fadeUp}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">
              {phase === 'morning' ? '☀️' : phase === 'afternoon' ? '🌤️' : phase === 'evening' ? '🌆' : '🌙'}
            </span>
            <h2 className="text-2xl font-bold text-[color:var(--text-primary)]">
              {greeting}, <span className="gradient-text">User</span>
            </h2>
          </div>
          <p className="text-sm text-[color:var(--text-secondary)]">{today} · Let's make today count.</p>
        </motion.div>

        {/* Productivity ring */}
        <motion.div variants={fadeUp} className="flex items-center gap-3">
          <div className="relative w-16 h-16">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="26" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
              <circle
                cx="30" cy="30" r="26"
                fill="none"
                stroke="url(#progress-grad)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 26}`}
                strokeDashoffset={`${2 * Math.PI * 26 * (1 - productivity / 100)}`}
                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
              />
              <defs>
                <linearGradient id="progress-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-[color:var(--text-primary)]">{productivity}%</span>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-[color:var(--text-primary)]">Productivity</p>
            <p className="text-xs text-[color:var(--text-tertiary)]">Today's score</p>
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
          {/* AI Suggestion */}
          <motion.div variants={fadeUp}>
            <div className="card gradient-border relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-600/5 to-secondary-600/5 pointer-events-none" />
              <div className="relative flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-glow-primary animate-pulse-slow">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-semibold text-primary-400 uppercase tracking-wide">AI Insight</p>
                    <span className="dot-online" />
                  </div>
                  <p className="text-sm text-[color:var(--text-primary)] leading-relaxed">
                    {AI_SUGGESTIONS[0]}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/chat')}
                  className="p-2 rounded-lg hover:bg-primary-500/15 transition-colors flex-shrink-0"
                >
                  <ArrowRight className="w-4 h-4 text-primary-400" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
            {[
              { label: 'Tasks Done', value: `${completedTasks}/${MOCK_TASKS.length}`, icon: Target, color: 'text-primary-400', bg: 'bg-primary-500/10' },
              { label: 'Habits', value: `${completedHabits}/${MOCK_HABITS.length}`, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10' },
              { label: 'Events', value: `${MOCK_EVENTS.length}`, icon: Calendar, color: 'text-accent-400', bg: 'bg-accent-500/10' },
            ].map((stat) => {
              const StatIcon = stat.icon
              return (
                <div key={stat.label} className="card card-hover text-center p-4">
                  <div className={cn('w-9 h-9 rounded-xl mx-auto mb-2 flex items-center justify-center', stat.bg)}>
                    <StatIcon className={cn('w-4 h-4', stat.color)} />
                  </div>
                  <p className="text-xl font-bold text-[color:var(--text-primary)]">{stat.value}</p>
                  <p className="text-xs text-[color:var(--text-tertiary)] mt-0.5">{stat.label}</p>
                </div>
              )
            })}
          </motion.div>

          {/* Today's tasks */}
          <motion.div variants={fadeUp} className="card">
            <div className="section-header">
              <div>
                <h3 className="section-title">Today's Tasks</h3>
                <p className="section-subtitle">{MOCK_TASKS.filter(t => t.status !== 'DONE').length} remaining</p>
              </div>
              <button
                onClick={() => navigate('/tasks')}
                className="btn-ghost text-xs flex items-center gap-1"
              >
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {MOCK_TASKS.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors cursor-pointer group"
                >
                  <button className="flex-shrink-0 text-[color:var(--text-tertiary)] hover:text-success-400 transition-colors">
                    {task.status === 'DONE'
                      ? <CheckCircle2 className="w-4 h-4 text-success-400" />
                      : <Circle className="w-4 h-4" />
                    }
                  </button>
                  <span className={cn(
                    'flex-1 text-sm truncate',
                    task.status === 'DONE'
                      ? 'line-through text-[color:var(--text-tertiary)]'
                      : 'text-[color:var(--text-primary)]'
                  )}>
                    {task.title}
                  </span>
                  <span className={cn(
                    'badge text-[10px]',
                    task.priority === 'HIGH' || task.priority === 'URGENT' ? 'badge-error' :
                    task.priority === 'MEDIUM' ? 'badge-warning' : 'badge-success'
                  )}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/tasks')}
              className="w-full mt-3 py-2.5 rounded-xl border border-dashed border-[color:var(--border-default)] text-sm text-[color:var(--text-tertiary)] hover:text-[color:var(--text-secondary)] hover:border-primary-500/30 hover:bg-primary-500/5 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add task
            </button>
          </motion.div>

          {/* Habits today */}
          <motion.div variants={fadeUp} className="card">
            <div className="section-header">
              <div>
                <h3 className="section-title">Habits</h3>
                <p className="section-subtitle">{completedHabits} of {MOCK_HABITS.length} done</p>
              </div>
              <button onClick={() => navigate('/habits')} className="btn-ghost text-xs flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {MOCK_HABITS.map((habit) => (
                <button
                  key={habit.id}
                  className={cn(
                    'flex items-center gap-2.5 p-3 rounded-xl border transition-all duration-200',
                    habit.completed
                      ? 'bg-success-500/10 border-success-500/20'
                      : 'bg-white/[0.02] border-[color:var(--border-subtle)] hover:bg-white/[0.05]'
                  )}
                >
                  <span className="text-lg">{habit.icon}</span>
                  <div className="text-left min-w-0">
                    <p className={cn(
                      'text-xs font-medium truncate',
                      habit.completed ? 'text-success-400' : 'text-[color:var(--text-primary)]'
                    )}>
                      {habit.title}
                    </p>
                    <p className="text-[10px] text-[color:var(--text-tertiary)] flex items-center gap-1">
                      <Flame className="w-2.5 h-2.5 text-orange-400" />
                      {habit.streak}d streak
                    </p>
                  </div>
                </button>
              ))}
            </div>
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
          <div className="card">
            <div className="section-header">
              <h3 className="section-title">Upcoming</h3>
              <button onClick={() => navigate('/calendar')} className="btn-ghost text-xs flex items-center gap-1">
                Calendar <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2">
              {MOCK_EVENTS.map((event) => (
                <div key={event.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors">
                  <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ background: event.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[color:var(--text-primary)] truncate">{event.title}</p>
                    <p className="text-xs text-[color:var(--text-tertiary)] flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {format(new Date(event.start), 'h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Daily quote */}
        <motion.div variants={fadeUp} className="col-span-12 md:col-span-6">
          <div className="card h-full flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-3 right-4 text-6xl font-serif text-primary-500/10 select-none leading-none">"</div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[color:var(--text-muted)] mb-3">Daily Reflection</p>
              <p className="text-base font-medium text-[color:var(--text-primary)] leading-relaxed relative z-10">
                {DAILY_QUOTE.text}
              </p>
            </div>
            <p className="text-xs text-[color:var(--text-tertiary)] mt-4">— {DAILY_QUOTE.author}</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
