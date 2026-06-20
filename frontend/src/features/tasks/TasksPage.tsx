import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, LayoutGrid, List, Filter, Search, CheckCircle2,
  Circle, Clock, Flame, Flag, Calendar, MoreHorizontal,
  Loader2, ChevronDown, Tag,
} from 'lucide-react'
import { format } from 'date-fns'
import { cn, PRIORITY_CONFIG } from '@/lib/utils'
import type { Priority } from '@/types'

type Status = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'

interface Task {
  id: string
  title: string
  description?: string
  status: Status
  priority: Priority
  dueDate?: string
  tags?: string[]
  subtasks?: { id: string; title: string; done: boolean }[]
}

const MOCK_TASKS: Task[] = [
  {
    id: '1', title: 'Review AI Orchestrator design', status: 'IN_PROGRESS', priority: 'HIGH',
    dueDate: new Date().toISOString(), tags: ['dev', 'ai'],
    subtasks: [{ id: 's1', title: 'Read architecture docs', done: true }, { id: 's2', title: 'Write feedback', done: false }],
  },
  { id: '2', title: 'Write Prisma schema migrations', status: 'TODO', priority: 'MEDIUM', dueDate: new Date().toISOString(), tags: ['dev'] },
  { id: '3', title: 'Set up Supabase storage bucket', status: 'TODO', priority: 'LOW', tags: ['infra'] },
  { id: '4', title: 'Deploy frontend to Vercel', status: 'TODO', priority: 'HIGH', dueDate: new Date(Date.now() + 86400000).toISOString() },
  { id: '5', title: 'Implement streaming chat', status: 'DONE', priority: 'URGENT', tags: ['dev', 'ai'] },
  { id: '6', title: 'Design dashboard widgets', status: 'IN_PROGRESS', priority: 'MEDIUM' },
  { id: '7', title: 'Add habit tracking UI', status: 'TODO', priority: 'MEDIUM', tags: ['frontend'] },
  { id: '8', title: 'Write unit tests', status: 'TODO', priority: 'LOW', tags: ['dev'] },
]

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string; icon: typeof Circle }> = {
  TODO: { label: 'To Do', color: 'text-[color:var(--text-tertiary)]', bg: 'bg-white/5', icon: Circle },
  IN_PROGRESS: { label: 'In Progress', color: 'text-warning-400', bg: 'bg-warning-500/10', icon: Loader2 },
  DONE: { label: 'Done', color: 'text-success-400', bg: 'bg-success-500/10', icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelled', color: 'text-[color:var(--text-muted)]', bg: 'bg-white/5', icon: Circle },
}

const STATUSES: Status[] = ['TODO', 'IN_PROGRESS', 'DONE']

function TaskCard({ task, onToggle }: { task: Task; onToggle: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const pc = PRIORITY_CONFIG[task.priority]
  const sc = STATUS_CONFIG[task.status]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="card card-hover cursor-pointer group"
      onClick={() => setExpanded(e => !e)}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={e => { e.stopPropagation(); onToggle(task.id) }}
          className="flex-shrink-0 mt-0.5 transition-colors"
        >
          {task.status === 'DONE'
            ? <CheckCircle2 className="w-4 h-4 text-success-400" />
            : <Circle className="w-4 h-4 text-[color:var(--text-tertiary)] hover:text-primary-400" />
          }
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <p className={cn(
              'text-sm font-medium flex-1',
              task.status === 'DONE' ? 'line-through text-[color:var(--text-tertiary)]' : 'text-[color:var(--text-primary)]'
            )}>
              {task.title}
            </p>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className={cn('text-xs px-1.5 py-0.5 rounded-md font-medium', pc.bgColor, pc.color)}>
                {pc.icon}
              </span>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            {task.dueDate && (
              <span className="flex items-center gap-1 text-[10px] text-[color:var(--text-tertiary)]">
                <Calendar className="w-3 h-3" />
                {format(new Date(task.dueDate), 'MMM d')}
              </span>
            )}
            {task.subtasks && (
              <span className="flex items-center gap-1 text-[10px] text-[color:var(--text-tertiary)]">
                <CheckCircle2 className="w-3 h-3" />
                {task.subtasks.filter(s => s.done).length}/{task.subtasks.length}
              </span>
            )}
            {task.tags?.map(tag => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-[color:var(--text-muted)]">
                #{tag}
              </span>
            ))}
          </div>

          {/* Expanded subtasks */}
          <AnimatePresence>
            {expanded && task.subtasks && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-3 space-y-1.5"
                onClick={e => e.stopPropagation()}
              >
                {task.subtasks.map(st => (
                  <div key={st.id} className="flex items-center gap-2 text-xs text-[color:var(--text-secondary)]">
                    <button>
                      {st.done
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-success-400" />
                        : <Circle className="w-3.5 h-3.5 text-[color:var(--text-tertiary)]" />
                      }
                    </button>
                    <span className={st.done ? 'line-through text-[color:var(--text-tertiary)]' : ''}>{st.title}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={e => e.stopPropagation()}
          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-white/10 text-[color:var(--text-tertiary)] transition-all"
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  )
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS)
  const [view, setView] = useState<'list' | 'kanban'>('list')
  const [search, setSearch] = useState('')
  const [filterPriority, setFilterPriority] = useState<Priority | 'ALL'>('ALL')
  const [newTaskText, setNewTaskText] = useState('')
  const [showAddTask, setShowAddTask] = useState(false)

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t =>
      t.id === id
        ? { ...t, status: t.status === 'DONE' ? 'TODO' : 'DONE' }
        : t
    ))
  }

  const addTask = () => {
    if (!newTaskText.trim()) return
    const task: Task = {
      id: Date.now().toString(),
      title: newTaskText.trim(),
      status: 'TODO',
      priority: 'MEDIUM',
    }
    setTasks(prev => [task, ...prev])
    setNewTaskText('')
    setShowAddTask(false)
  }

  const filtered = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase())
    const matchPriority = filterPriority === 'ALL' || t.priority === filterPriority
    return matchSearch && matchPriority
  })

  const counts = {
    TODO: filtered.filter(t => t.status === 'TODO').length,
    IN_PROGRESS: filtered.filter(t => t.status === 'IN_PROGRESS').length,
    DONE: filtered.filter(t => t.status === 'DONE').length,
  }

  return (
    <div className="p-6 space-y-5 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-[color:var(--text-primary)]">Tasks</h1>
            <div className="flex gap-2 text-xs">
              {STATUSES.map(s => (
                <span key={s} className={cn('px-2 py-0.5 rounded-full font-medium', STATUS_CONFIG[s].bg, STATUS_CONFIG[s].color)}>
                  {counts[s]} {STATUS_CONFIG[s].label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-xl overflow-hidden border border-[color:var(--border-subtle)]">
            {(['list', 'kanban'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5',
                  view === v
                    ? 'bg-primary-600/20 text-primary-300'
                    : 'text-[color:var(--text-tertiary)] hover:text-[color:var(--text-secondary)]'
                )}
              >
                {v === 'list' ? <List className="w-3.5 h-3.5" /> : <LayoutGrid className="w-3.5 h-3.5" />}
                {v === 'list' ? 'List' : 'Kanban'}
              </button>
            ))}
          </div>

          <button
            id="add-task-btn"
            onClick={() => setShowAddTask(true)}
            className="btn-primary flex items-center gap-2 text-sm px-4 py-2"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--bg-card)] flex-1 min-w-48">
          <Search className="w-4 h-4 text-[color:var(--text-tertiary)]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="flex-1 bg-transparent text-sm text-[color:var(--text-primary)] placeholder-[color:var(--text-muted)] outline-none"
          />
        </div>

        <div className="flex gap-1.5">
          {(['ALL', 'URGENT', 'HIGH', 'MEDIUM', 'LOW'] as const).map(p => (
            <button
              key={p}
              onClick={() => setFilterPriority(p)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-xs font-medium transition-all',
                filterPriority === p
                  ? 'bg-primary-600/20 text-primary-300 border border-primary-500/30'
                  : 'border border-[color:var(--border-subtle)] text-[color:var(--text-tertiary)] hover:text-[color:var(--text-secondary)] hover:border-[color:var(--border-default)]'
              )}
            >
              {p === 'ALL' ? 'All' : PRIORITY_CONFIG[p].icon + ' ' + PRIORITY_CONFIG[p].label}
            </button>
          ))}
        </div>
      </div>

      {/* Add task inline */}
      <AnimatePresence>
        {showAddTask && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="card flex items-center gap-3">
              <Circle className="w-4 h-4 text-[color:var(--text-tertiary)] flex-shrink-0" />
              <input
                autoFocus
                value={newTaskText}
                onChange={e => setNewTaskText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') addTask()
                  if (e.key === 'Escape') setShowAddTask(false)
                }}
                placeholder="Type task name and press Enter..."
                className="flex-1 bg-transparent text-sm text-[color:var(--text-primary)] placeholder-[color:var(--text-muted)] outline-none"
              />
              <button onClick={addTask} className="btn-primary text-xs px-3 py-1.5">Add</button>
              <button onClick={() => setShowAddTask(false)} className="btn-ghost text-xs px-2 py-1.5">Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List View */}
      {view === 'list' && (
        <div className="space-y-4">
          {STATUSES.filter(s => filtered.some(t => t.status === s)).map(status => {
            const StatusIcon = STATUS_CONFIG[status].icon
            return (
              <div key={status}>
                <div className="flex items-center gap-2 mb-2">
                  <StatusIcon className={cn('w-3.5 h-3.5', STATUS_CONFIG[status].color)} />
                  <span className={cn('text-xs font-semibold uppercase tracking-wide', STATUS_CONFIG[status].color)}>
                    {STATUS_CONFIG[status].label}
                  </span>
                  <span className="text-[10px] text-[color:var(--text-muted)]">({counts[status]})</span>
                </div>
                <div className="space-y-2">
                  <AnimatePresence>
                    {filtered.filter(t => t.status === status).map(task => (
                      <TaskCard key={task.id} task={task} onToggle={toggleTask} />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="text-center py-16 text-[color:var(--text-muted)]">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No tasks found</p>
            </div>
          )}
        </div>
      )}

      {/* Kanban View */}
      {view === 'kanban' && (
        <div className="grid grid-cols-3 gap-4">
          {STATUSES.map(status => {
            const sc = STATUS_CONFIG[status]
            const columnTasks = filtered.filter(t => t.status === status)
            const ColumnIcon = sc.icon
            return (
              <div key={status} className="flex flex-col gap-3">
                <div className={cn('flex items-center gap-2 px-3 py-2 rounded-xl', sc.bg)}>
                  <ColumnIcon className={cn('w-4 h-4', sc.color)} />
                  <span className={cn('text-xs font-semibold uppercase tracking-wide flex-1', sc.color)}>
                    {sc.label}
                  </span>
                  <span className="text-[10px] text-[color:var(--text-muted)]">{columnTasks.length}</span>
                </div>
                <div className="space-y-2">
                  <AnimatePresence>
                    {columnTasks.map(task => (
                      <TaskCard key={task.id} task={task} onToggle={toggleTask} />
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
