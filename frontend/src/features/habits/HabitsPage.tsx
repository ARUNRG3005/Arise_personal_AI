import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Plus, Check, X, TrendingUp, Target, Calendar, MoreHorizontal, Star } from 'lucide-react'
import { format, subDays, eachDayOfInterval, isSameDay } from 'date-fns'
import { cn } from '@/lib/utils'

interface Habit {
  id: string
  title: string
  icon: string
  color: string
  frequency: 'daily' | 'weekly'
  streak: number
  bestStreak: number
  completedDates: string[]
  category: string
}

const MOCK_HABITS: Habit[] = [
  { id: '1', title: 'Morning Exercise', icon: '🏋️', color: '#10b981', frequency: 'daily', streak: 12, bestStreak: 18, completedDates: [...Array(12)].map((_, i) => subDays(new Date(), i).toISOString()), category: 'Health' },
  { id: '2', title: 'Read 30 minutes', icon: '📚', color: '#6366f1', frequency: 'daily', streak: 5, bestStreak: 21, completedDates: [...Array(5)].map((_, i) => subDays(new Date(), i).toISOString()), category: 'Learning' },
  { id: '3', title: 'Meditate', icon: '🧘', color: '#a855f7', frequency: 'daily', streak: 3, bestStreak: 10, completedDates: [...Array(3)].map((_, i) => subDays(new Date(), i).toISOString()), category: 'Mindfulness' },
  { id: '4', title: 'Drink 2L water', icon: '💧', color: '#06b6d4', frequency: 'daily', streak: 8, bestStreak: 30, completedDates: [...Array(8)].map((_, i) => subDays(new Date(), i).toISOString()), category: 'Health' },
  { id: '5', title: 'Journal', icon: '📓', color: '#f59e0b', frequency: 'daily', streak: 2, bestStreak: 7, completedDates: [...Array(2)].map((_, i) => subDays(new Date(), i).toISOString()), category: 'Mindfulness' },
  { id: '6', title: 'Code daily', icon: '💻', color: '#f97316', frequency: 'daily', streak: 22, bestStreak: 22, completedDates: [...Array(22)].map((_, i) => subDays(new Date(), i).toISOString()), category: 'Work' },
]

const LAST_30_DAYS = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() })

function HeatmapCell({ date, completed, color }: { date: Date; completed: boolean; color: string }) {
  return (
    <div
      title={format(date, 'MMM d')}
      className="w-3 h-3 rounded-sm transition-all duration-200"
      style={{
        background: completed ? color : 'rgba(255,255,255,0.05)',
        boxShadow: completed ? `0 0 6px ${color}40` : 'none',
      }}
    />
  )
}

function HabitCard({ habit, onToggle }: { habit: Habit; onToggle: (id: string) => void }) {
  const todayCompleted = habit.completedDates.some(d => isSameDay(new Date(d), new Date()))
  const progressPct = Math.min((habit.streak / habit.bestStreak) * 100, 100)

  return (
    <motion.div
      layout
      className={cn(
        'card card-hover group relative overflow-hidden',
        todayCompleted && 'border-success-500/20'
      )}
    >
      {todayCompleted && (
        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl" style={{ background: habit.color }} />
      )}

      <div className="flex items-start gap-3">
        {/* Icon + toggle */}
        <button
          onClick={() => onToggle(habit.id)}
          className={cn(
            'w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-all duration-300',
            todayCompleted ? 'scale-100' : 'hover:scale-110'
          )}
          style={{ background: todayCompleted ? `${habit.color}25` : 'rgba(255,255,255,0.05)', border: `1px solid ${habit.color}30` }}
        >
          {todayCompleted ? <span>{habit.icon}</span> : <span className="grayscale opacity-60">{habit.icon}</span>}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-[color:var(--text-primary)]">{habit.title}</p>
              <p className="text-[10px] text-[color:var(--text-tertiary)] mt-0.5">{habit.category}</p>
            </div>
            <button className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-white/10 text-[color:var(--text-tertiary)] transition-all">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-sm font-bold text-[color:var(--text-primary)]">{habit.streak}</span>
              <span className="text-[10px] text-[color:var(--text-tertiary)]">day streak</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-3 h-3 text-warning-400" />
              <span className="text-[10px] text-[color:var(--text-tertiary)]">Best: {habit.bestStreak}d</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-2.5">
            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: habit.color }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 30-day heatmap */}
      <div className="mt-3 pt-3 border-t border-[color:var(--border-subtle)]">
        <div className="flex gap-0.5 flex-wrap">
          {LAST_30_DAYS.map(day => (
            <HeatmapCell
              key={day.toISOString()}
              date={day}
              completed={habit.completedDates.some(d => isSameDay(new Date(d), day))}
              color={habit.color}
            />
          ))}
        </div>
        <p className="text-[9px] text-[color:var(--text-muted)] mt-1.5">Last 30 days</p>
      </div>

      {/* Today badge */}
      <button
        onClick={() => onToggle(habit.id)}
        className={cn(
          'absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all',
          todayCompleted
            ? 'bg-success-500/15 text-success-400 border border-success-500/20'
            : 'bg-white/5 text-[color:var(--text-tertiary)] hover:bg-white/10 border border-[color:var(--border-subtle)]'
        )}
      >
        {todayCompleted ? '✓ Done' : 'Mark done'}
      </button>
    </motion.div>
  )
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>(MOCK_HABITS)
  const [activeCategory, setActiveCategory] = useState('All')

  const categories = ['All', ...Array.from(new Set(habits.map(h => h.category)))]
  const completedToday = habits.filter(h => h.completedDates.some(d => isSameDay(new Date(d), new Date()))).length
  const completionPct = Math.round((completedToday / habits.length) * 100)

  const toggleHabit = (id: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h
      const todayDone = h.completedDates.some(d => isSameDay(new Date(d), new Date()))
      return {
        ...h,
        completedDates: todayDone
          ? h.completedDates.filter(d => !isSameDay(new Date(d), new Date()))
          : [new Date().toISOString(), ...h.completedDates],
        streak: todayDone ? Math.max(0, h.streak - 1) : h.streak + 1,
      }
    }))
  }

  const filtered = habits.filter(h => activeCategory === 'All' || h.category === activeCategory)

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[color:var(--text-primary)] flex items-center gap-2">
            Habits <Flame className="w-5 h-5 text-orange-400" />
          </h1>
          <p className="text-sm text-[color:var(--text-secondary)] mt-0.5">
            {completedToday} of {habits.length} habits done today
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2 text-sm px-4 py-2">
          <Plus className="w-4 h-4" />
          New Habit
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Today's Progress", value: `${completionPct}%`, icon: Target, color: 'text-primary-400', bg: 'bg-primary-500/10' },
          { label: 'Completed', value: `${completedToday}/${habits.length}`, icon: Check, color: 'text-success-400', bg: 'bg-success-500/10' },
          { label: 'Best Streak', value: `${Math.max(...habits.map(h => h.bestStreak))}d`, icon: Star, color: 'text-warning-400', bg: 'bg-warning-500/10' },
          { label: 'Active Habits', value: habits.length, icon: TrendingUp, color: 'text-accent-400', bg: 'bg-accent-500/10' },
        ].map(stat => {
          const StatIcon = stat.icon
          return (
            <div key={stat.label} className="card p-4">
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-2', stat.bg)}>
                <StatIcon className={cn('w-4 h-4', stat.color)} />
              </div>
              <p className="text-xl font-bold text-[color:var(--text-primary)]">{stat.value}</p>
              <p className="text-xs text-[color:var(--text-tertiary)] mt-0.5">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Daily progress bar */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-[color:var(--text-primary)]">Today's Completion</p>
          <span className="text-sm font-bold text-[color:var(--text-primary)]">{completionPct}%</span>
        </div>
        <div className="h-3 rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-primary"
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-[color:var(--text-tertiary)]">{completedToday} done</p>
          <p className="text-xs text-[color:var(--text-tertiary)]">{habits.length - completedToday} remaining</p>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
              activeCategory === cat
                ? 'bg-primary-600/20 text-primary-300 border border-primary-500/30'
                : 'border border-[color:var(--border-subtle)] text-[color:var(--text-tertiary)] hover:text-[color:var(--text-secondary)]'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Habit grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence>
          {filtered.map(habit => (
            <HabitCard key={habit.id} habit={habit} onToggle={toggleHabit} />
          ))}
        </AnimatePresence>

        {/* Add habit card */}
        <motion.button
          layout
          className="card border-dashed border-[color:var(--border-default)] hover:border-primary-500/40 hover:bg-primary-500/5 flex flex-col items-center justify-center gap-2 min-h-[200px] transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-white/5 group-hover:bg-primary-500/15 flex items-center justify-center transition-colors">
            <Plus className="w-5 h-5 text-[color:var(--text-tertiary)] group-hover:text-primary-400 transition-colors" />
          </div>
          <p className="text-sm text-[color:var(--text-tertiary)] group-hover:text-[color:var(--text-secondary)]">Add Habit</p>
        </motion.button>
      </div>
    </div>
  )
}
