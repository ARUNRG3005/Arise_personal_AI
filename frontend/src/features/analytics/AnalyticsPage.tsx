import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Target, Flame, CheckSquare, BookOpen, Wallet, Brain, Calendar, Award } from 'lucide-react'
import { format, subDays, eachDayOfInterval } from 'date-fns'
import { cn, formatCurrency } from '@/lib/utils'

// 30 days of mock data
const LAST_30_DAYS = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() })
const PRODUCTIVITY_DATA = LAST_30_DAYS.map((_, i) => ({
  day: i,
  tasks: Math.floor(Math.random() * 8 + 1),
  habits: Math.floor(Math.random() * 6 + 1),
  score: Math.floor(Math.random() * 40 + 60),
}))

const WEEKLY_DATA = [
  { label: 'Mon', tasks: 5, habits: 4, score: 78 },
  { label: 'Tue', tasks: 7, habits: 5, score: 85 },
  { label: 'Wed', tasks: 3, habits: 6, score: 72 },
  { label: 'Thu', tasks: 8, habits: 4, score: 80 },
  { label: 'Fri', tasks: 6, habits: 5, score: 83 },
  { label: 'Sat', tasks: 2, habits: 3, score: 58 },
  { label: 'Sun', tasks: 4, habits: 4, score: 70 },
]

const maxScore = Math.max(...WEEKLY_DATA.map(d => d.score))
const maxTasks = Math.max(...WEEKLY_DATA.map(d => d.tasks))

const STATS = [
  { label: 'Avg Daily Tasks', value: '5.4', change: '+12%', positive: true, icon: CheckSquare, color: 'text-primary-400', bg: 'bg-primary-500/10' },
  { label: 'Habit Completion', value: '76%', change: '+8%', positive: true, icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  { label: 'Journal Entries', value: '18', change: '-2', positive: false, icon: BookOpen, color: 'text-secondary-400', bg: 'bg-secondary-500/10' },
  { label: 'Monthly Savings', value: formatCurrency(17000), change: '+5%', positive: true, icon: Wallet, color: 'text-success-400', bg: 'bg-success-500/10' },
]

const ACHIEVEMENTS = [
  { icon: '🔥', title: '30-Day Streak', desc: 'Logged in 30 days in a row', earned: true },
  { icon: '⚡', title: 'Productivity Pro', desc: 'Completed 100 tasks this month', earned: true },
  { icon: '📚', title: 'Knowledge Builder', desc: 'Created 20+ notes', earned: false },
  { icon: '💰', title: 'Money Saver', desc: 'Saved 20% of income 3 months', earned: false },
]

export default function AnalyticsPage() {
  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[color:var(--text-primary)] flex items-center gap-2">
            Analytics <BarChart3 className="w-5 h-5 text-primary-400" />
          </h1>
          <p className="text-sm text-[color:var(--text-tertiary)] mt-0.5">Your performance insights for the last 30 days</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[color:var(--text-tertiary)]">
          <Calendar className="w-4 h-4" />
          <span>Last 30 days</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STATS.map(stat => {
          const StatIcon = stat.icon
          return (
            <div key={stat.label} className="card">
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', stat.bg)}>
                <StatIcon className={cn('w-4 h-4', stat.color)} />
              </div>
              <p className="text-xl font-bold text-[color:var(--text-primary)]">{stat.value}</p>
              <p className="text-xs text-[color:var(--text-tertiary)] mt-0.5">{stat.label}</p>
              <p className={cn('text-xs font-semibold mt-1.5 flex items-center gap-1', stat.positive ? 'text-success-400' : 'text-error-400')}>
                {stat.positive ? '↑' : '↓'} {stat.change}
                <span className="text-[color:var(--text-muted)] font-normal">vs last month</span>
              </p>
            </div>
          )
        })}
      </div>

      {/* Weekly bar chart */}
      <div className="card">
        <h3 className="section-title mb-1">Weekly Productivity</h3>
        <p className="section-subtitle mb-5">Task completion and productivity score</p>
        <div className="flex items-end gap-2 h-48">
          {WEEKLY_DATA.map((d, i) => {
            const scoreH = (d.score / maxScore) * 100
            const taskH = (d.tasks / maxTasks) * 100
            const isToday = i === 4 // Friday as "today" for demo
            return (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-2">
                <div className="relative flex items-end gap-1 w-full" style={{ height: '160px' }}>
                  {/* Task bar */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${taskH}%` }}
                    transition={{ delay: i * 0.07, duration: 0.5, ease: 'easeOut' }}
                    className="flex-1 rounded-t-lg bg-primary-600/40 hover:bg-primary-600/60 transition-colors cursor-pointer"
                    title={`${d.tasks} tasks`}
                  />
                  {/* Score bar */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${scoreH}%` }}
                    transition={{ delay: i * 0.07 + 0.1, duration: 0.5, ease: 'easeOut' }}
                    className={cn('flex-1 rounded-t-lg transition-colors cursor-pointer', isToday ? 'bg-gradient-primary' : 'bg-secondary-600/40 hover:bg-secondary-600/60')}
                    title={`Score: ${d.score}`}
                  />
                </div>
                <span className={cn('text-[10px] font-medium', isToday ? 'text-primary-400' : 'text-[color:var(--text-muted)]')}>{d.label}</span>
              </div>
            )
          })}
        </div>
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-primary-600/40" /><span className="text-[10px] text-[color:var(--text-tertiary)]">Tasks</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-secondary-600/40" /><span className="text-[10px] text-[color:var(--text-tertiary)]">Score</span></div>
        </div>
      </div>

      {/* 30-day activity heatmap + Achievements */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 lg:col-span-7 card">
          <h3 className="section-title mb-1">30-Day Activity</h3>
          <p className="section-subtitle mb-4">Daily productivity score over time</p>
          <div className="flex items-end gap-1 h-24">
            {PRODUCTIVITY_DATA.map((d, i) => {
              const h = ((d.score - 60) / 40) * 100
              const isHigh = d.score >= 80
              return (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(h, 8)}%` }}
                  transition={{ delay: i * 0.02, duration: 0.3 }}
                  title={`${format(LAST_30_DAYS[i], 'MMM d')}: ${d.score}`}
                  className={cn('flex-1 rounded-sm cursor-pointer hover:opacity-80 transition-opacity', isHigh ? 'bg-primary-500/70' : 'bg-white/10')}
                />
              )
            })}
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-[color:var(--text-muted)]">{format(LAST_30_DAYS[0], 'MMM d')}</span>
            <span className="text-[10px] text-[color:var(--text-muted)]">Today</span>
          </div>

          {/* Key metrics */}
          <div className="mt-5 pt-4 border-t border-[color:var(--border-subtle)] grid grid-cols-3 gap-4">
            {[
              { label: 'Best Day', value: `${Math.max(...PRODUCTIVITY_DATA.map(d => d.score))}`, sub: 'score' },
              { label: 'Total Tasks', value: PRODUCTIVITY_DATA.reduce((s, d) => s + d.tasks, 0), sub: 'completed' },
              { label: 'Active Days', value: PRODUCTIVITY_DATA.filter(d => d.score > 65).length, sub: 'of 30' },
            ].map(m => (
              <div key={m.label} className="text-center">
                <p className="text-lg font-bold text-[color:var(--text-primary)]">{m.value}</p>
                <p className="text-[10px] text-[color:var(--text-tertiary)]">{m.label}</p>
                <p className="text-[9px] text-[color:var(--text-muted)]">{m.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="col-span-12 lg:col-span-5 card">
          <h3 className="section-title mb-1 flex items-center gap-2">
            Achievements <Award className="w-4 h-4 text-warning-400" />
          </h3>
          <p className="section-subtitle mb-4">2 of 4 earned</p>
          <div className="space-y-3">
            {ACHIEVEMENTS.map(ach => (
              <div key={ach.title} className={cn('flex items-center gap-3 p-3 rounded-xl border transition-all', ach.earned ? 'border-warning-500/20 bg-warning-500/5' : 'border-[color:var(--border-subtle)] opacity-50')}>
                <span className={cn('text-2xl', !ach.earned && 'grayscale')}>{ach.icon}</span>
                <div>
                  <p className={cn('text-sm font-semibold', ach.earned ? 'text-[color:var(--text-primary)]' : 'text-[color:var(--text-tertiary)]')}>{ach.title}</p>
                  <p className="text-[10px] text-[color:var(--text-tertiary)]">{ach.desc}</p>
                </div>
                {ach.earned && <span className="ml-auto text-warning-400 text-lg">✓</span>}
              </div>
            ))}
          </div>

          {/* AI Insight */}
          <div className="mt-4 pt-4 border-t border-[color:var(--border-subtle)]">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-primary-500/8 border border-primary-500/15">
              <Brain className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-primary-400 mb-1">AI Insight</p>
                <p className="text-xs text-[color:var(--text-secondary)] leading-relaxed">
                  Your productivity peaks on Tuesday and Thursday. Consider scheduling deep work sessions on these days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
