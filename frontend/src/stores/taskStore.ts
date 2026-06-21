import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Priority } from '../types'

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: Priority
  dueDate?: string
  tags?: string[]
  subtasks?: { id: string; title: string; done: boolean }[]
}

interface TaskStore {
  tasks: Task[]
  addTask: (title: string, priority?: Priority) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void
  setTasks: (tasks: Task[]) => void
}

const DEFAULT_TASKS: Task[] = [
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

export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      tasks: DEFAULT_TASKS,
      addTask: (title, priority = 'MEDIUM') => set((state) => ({
        tasks: [
          {
            id: Date.now().toString(),
            title: title.trim(),
            status: 'TODO',
            priority,
            dueDate: new Date().toISOString(),
            tags: [],
          },
          ...state.tasks
        ]
      })),
      toggleTask: (id) => set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id ? { ...t, status: (t.status === 'DONE' ? 'TODO' : 'DONE') as TaskStatus } : t
        )
      })),
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id)
      })),
      setTasks: (tasks) => set({ tasks }),
    }),
    {
      name: 'arise-tasks',
    }
  )
)
