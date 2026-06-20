import { useState } from 'react'
import { motion } from 'framer-motion'
import { FolderKanban, Plus, Target, Calendar, Users, MoreHorizontal, ArrowRight, CheckCircle2, Circle, TrendingUp, Clock } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

interface Project {
  id: string
  name: string
  description: string
  color: string
  emoji: string
  progress: number
  status: 'active' | 'completed' | 'paused'
  dueDate: string
  taskCount: number
  completedTasks: number
  tags: string[]
}

const MOCK_PROJECTS: Project[] = [
  { id: '1', name: 'ARISE Personal AI', description: 'Build a complete personal AI operating system', color: '#6366f1', emoji: '🤖', progress: 35, status: 'active', dueDate: new Date(Date.now() + 30 * 86400000).toISOString(), taskCount: 24, completedTasks: 8, tags: ['ai', 'fullstack'] },
  { id: '2', name: 'Fitness Tracker App', description: 'React Native app for tracking workouts and nutrition', color: '#10b981', emoji: '💪', progress: 70, status: 'active', dueDate: new Date(Date.now() + 15 * 86400000).toISOString(), taskCount: 18, completedTasks: 13, tags: ['mobile', 'health'] },
  { id: '3', name: 'Portfolio Website', description: 'Personal portfolio to showcase projects', color: '#a855f7', emoji: '🎨', progress: 90, status: 'active', dueDate: new Date(Date.now() + 7 * 86400000).toISOString(), taskCount: 10, completedTasks: 9, tags: ['web', 'design'] },
  { id: '4', name: 'ML Course', description: 'Complete Stanford ML course on Coursera', color: '#f59e0b', emoji: '🧠', progress: 45, status: 'paused', dueDate: new Date(Date.now() + 60 * 86400000).toISOString(), taskCount: 20, completedTasks: 9, tags: ['learning', 'ai'] },
  { id: '5', name: 'Blog Platform', description: 'Build a technical blog with Next.js and MDX', color: '#06b6d4', emoji: '✍️', progress: 100, status: 'completed', dueDate: new Date(Date.now() - 7 * 86400000).toISOString(), taskCount: 15, completedTasks: 15, tags: ['web'] },
]

function ProjectCard({ project }: { project: Project }) {
  return (
    <motion.div layout className="card card-hover group cursor-pointer relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: project.color }} />

      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0" style={{ background: `${project.color}20` }}>
          {project.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[color:var(--text-primary)]">{project.name}</h3>
              <p className="text-xs text-[color:var(--text-tertiary)] mt-0.5 truncate max-w-xs">{project.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn(
                'text-[10px] px-2 py-0.5 rounded-full font-medium',
                project.status === 'active' ? 'bg-success-500/15 text-success-400' :
                project.status === 'completed' ? 'bg-primary-500/15 text-primary-400' :
                'bg-warning-500/15 text-warning-400'
              )}>
                {project.status}
              </span>
              <button className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-white/10 text-[color:var(--text-tertiary)] transition-all">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-[color:var(--text-tertiary)]">{project.completedTasks}/{project.taskCount} tasks</span>
              <span className="text-[10px] font-semibold" style={{ color: project.color }}>{project.progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${project.progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: project.color }}
              />
            </div>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 mt-3">
            <span className="flex items-center gap-1 text-[10px] text-[color:var(--text-tertiary)]">
              <Calendar className="w-3 h-3" />
              {format(parseISO(project.dueDate), 'MMM d')}
            </span>
            <div className="flex gap-1.5">
              {project.tags.map(tag => (
                <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-[color:var(--text-muted)]">#{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function ProjectsPage() {
  const [projects] = useState(MOCK_PROJECTS)
  const [activeStatus, setActiveStatus] = useState<string>('all')

  const filtered = activeStatus === 'all' ? projects : projects.filter(p => p.status === activeStatus)
  const active = projects.filter(p => p.status === 'active').length
  const completed = projects.filter(p => p.status === 'completed').length
  const avgProgress = Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[color:var(--text-primary)] flex items-center gap-2">
          Projects <FolderKanban className="w-5 h-5 text-primary-400" />
        </h1>
        <button className="btn-primary flex items-center gap-2 text-sm px-4 py-2">
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Active', value: active, icon: Target, color: 'text-success-400', bg: 'bg-success-500/10' },
          { label: 'Completed', value: completed, icon: CheckCircle2, color: 'text-primary-400', bg: 'bg-primary-500/10' },
          { label: 'Avg Progress', value: `${avgProgress}%`, icon: TrendingUp, color: 'text-accent-400', bg: 'bg-accent-500/10' },
          { label: 'Total', value: projects.length, icon: FolderKanban, color: 'text-secondary-400', bg: 'bg-secondary-500/10' },
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

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'active', 'paused', 'completed'].map(s => (
          <button key={s} onClick={() => setActiveStatus(s)} className={cn('px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all', activeStatus === s ? 'bg-primary-600/20 text-primary-300 border border-primary-500/30' : 'border border-[color:var(--border-subtle)] text-[color:var(--text-tertiary)] hover:text-[color:var(--text-secondary)]')}>
            {s === 'all' ? 'All Projects' : s}
          </button>
        ))}
      </div>

      {/* Project grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(project => <ProjectCard key={project.id} project={project} />)}
        <motion.button layout className="card border-dashed border-[color:var(--border-default)] hover:border-primary-500/40 hover:bg-primary-500/5 flex flex-col items-center justify-center gap-2 min-h-40 transition-all group">
          <div className="w-10 h-10 rounded-xl bg-white/5 group-hover:bg-primary-500/15 flex items-center justify-center transition-colors">
            <Plus className="w-5 h-5 text-[color:var(--text-tertiary)] group-hover:text-primary-400 transition-colors" />
          </div>
          <p className="text-sm text-[color:var(--text-tertiary)] group-hover:text-[color:var(--text-secondary)]">Start New Project</p>
        </motion.button>
      </div>
    </div>
  )
}
