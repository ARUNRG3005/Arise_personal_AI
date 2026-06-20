import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns'
import type { Priority } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================================
// DATE FORMATTING
// ============================================================
export function formatDate(date: string | Date, fmt = 'MMM d, yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  if (isToday(d)) return 'Today'
  if (isTomorrow(d)) return 'Tomorrow'
  if (isYesterday(d)) return 'Yesterday'
  return format(d, fmt)
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'h:mm a')
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return `${formatDate(d)} at ${formatTime(d)}`
}

export function timeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  if (hour < 21) return 'Good Evening'
  return 'Good Night'
}

export function getDayPhase(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  if (hour < 21) return 'evening'
  return 'night'
}

// ============================================================
// PRIORITY HELPERS
// ============================================================
export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bgColor: string; icon: string }> = {
  LOW: { label: 'Low', color: 'text-success-400', bgColor: 'bg-success-500/10', icon: '↓' },
  MEDIUM: { label: 'Medium', color: 'text-warning-400', bgColor: 'bg-warning-500/10', icon: '→' },
  HIGH: { label: 'High', color: 'text-orange-400', bgColor: 'bg-orange-500/10', icon: '↑' },
  URGENT: { label: 'Urgent', color: 'text-error-400', bgColor: 'bg-error-500/10', icon: '⚡' },
}

// ============================================================
// CURRENCY
// ============================================================
export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

// ============================================================
// NUMBERS
// ============================================================
export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// ============================================================
// STRINGS
// ============================================================
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength).trimEnd() + '…'
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

// ============================================================
// COLORS
// ============================================================
export const PRESET_COLORS = [
  '#6366f1', // indigo
  '#a855f7', // purple
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#8b5cf6', // violet
  '#14b8a6', // teal
  '#f97316', // orange
]

export function getColorForString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return PRESET_COLORS[Math.abs(hash) % PRESET_COLORS.length]
}

// ============================================================
// MISC
// ============================================================
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export function groupBy<T>(arr: T[], key: keyof T): Record<string, T[]> {
  return arr.reduce(
    (groups, item) => {
      const group = String(item[key])
      groups[group] = groups[group] || []
      groups[group].push(item)
      return groups
    },
    {} as Record<string, T[]>
  )
}

// ============================================================
// SUGGESTED PROMPTS for AI Chat
// ============================================================
export const SUGGESTED_PROMPTS = [
  { icon: '📅', text: 'Plan my day', category: 'planning' },
  { icon: '✅', text: 'What tasks are due today?', category: 'tasks' },
  { icon: '💡', text: 'Give me a productivity tip', category: 'coaching' },
  { icon: '📝', text: 'Summarize my week', category: 'review' },
  { icon: '🎯', text: 'Help me set a goal', category: 'goals' },
  { icon: '🧘', text: 'I need a study schedule', category: 'study' },
  { icon: '💬', text: 'What did I work on this week?', category: 'review' },
  { icon: '🔥', text: 'Check my habit streaks', category: 'habits' },
]

// ARISE navigation items
export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/' },
  { id: 'chat', label: 'AI Chat', icon: 'MessageSquare', path: '/chat' },
  { id: 'tasks', label: 'Tasks', icon: 'CheckSquare', path: '/tasks' },
  { id: 'calendar', label: 'Calendar', icon: 'Calendar', path: '/calendar' },
  { id: 'habits', label: 'Habits', icon: 'Flame', path: '/habits' },
  { id: 'journal', label: 'Journal', icon: 'BookOpen', path: '/journal' },
  { id: 'notes', label: 'Notes', icon: 'FileText', path: '/notes' },
  { id: 'projects', label: 'Projects', icon: 'FolderKanban', path: '/projects' },
  { id: 'expenses', label: 'Expenses', icon: 'Wallet', path: '/expenses' },
  { id: 'documents', label: 'Documents', icon: 'Files', path: '/documents' },
  { id: 'analytics', label: 'Analytics', icon: 'BarChart3', path: '/analytics' },
]
