// ARISE — Global TypeScript Types
// All shared types across the application

export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
  bio?: string
  preferences: UserPreferences
  timezone: string
  currency: string
  createdAt: string
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'system'
  language: string
  aiProvider: AIProvider
  aiModel: string
  notificationsEnabled: boolean
  soundEnabled: boolean
  weekStartsOn: 0 | 1 // 0=Sunday, 1=Monday
  dailyBriefingTime?: string
  nightReviewTime?: string
}

export type AIProvider = 'groq' | 'openai' | 'gemini' | 'claude' | 'ollama' | 'openrouter'

// ============================================================
// TASKS
// ============================================================
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'ARCHIVED'

export interface Task {
  id: string
  userId: string
  title: string
  description?: string
  priority: Priority
  status: TaskStatus
  dueDate?: string
  completedAt?: string
  labels: string[]
  parentId?: string
  subtasks?: Task[]
  isRecurring: boolean
  recurRule?: string
  timeEstimate?: number
  timeSpent: number
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface CreateTaskInput {
  title: string
  description?: string
  priority?: Priority
  dueDate?: string
  labels?: string[]
  parentId?: string
  timeEstimate?: number
}

// ============================================================
// CALENDAR
// ============================================================
export interface CalendarEvent {
  id: string
  userId: string
  title: string
  description?: string
  start: string
  end: string
  isAllDay: boolean
  color: string
  location?: string
  isRecurring: boolean
  recurRule?: string
  reminders: EventReminder[]
  createdAt: string
}

export interface EventReminder {
  minutes: number
  type: 'notification' | 'email'
}

export interface CreateEventInput {
  title: string
  description?: string
  start: string
  end: string
  isAllDay?: boolean
  color?: string
  location?: string
  reminders?: EventReminder[]
}

// ============================================================
// HABITS
// ============================================================
export type Frequency = 'DAILY' | 'WEEKLY' | 'MONTHLY'

export interface Habit {
  id: string
  userId: string
  title: string
  description?: string
  frequency: Frequency
  targetCount: number
  color: string
  icon: string
  streakCount: number
  bestStreak: number
  sortOrder: number
  isArchived: boolean
  completions: HabitCompletion[]
  createdAt: string
}

export interface HabitCompletion {
  id: string
  habitId: string
  userId: string
  completedAt: string
  count: number
  note?: string
}

// ============================================================
// JOURNAL
// ============================================================
export type MoodLevel = 'TERRIBLE' | 'BAD' | 'OKAY' | 'GOOD' | 'GREAT'

export interface JournalEntry {
  id: string
  userId: string
  content: string
  mood?: number
  moodLabel?: MoodLevel
  energy?: number
  aiReflection?: string
  aiSummary?: string
  photos: string[]
  tags: string[]
  date: string
  createdAt: string
}

// ============================================================
// NOTES
// ============================================================
export interface NoteFolder {
  id: string
  userId: string
  name: string
  color: string
  icon: string
  parentId?: string
  children?: NoteFolder[]
  notes?: Note[]
}

export interface Note {
  id: string
  userId: string
  folderId?: string
  folder?: NoteFolder
  title: string
  content: string
  tags: string[]
  isPinned: boolean
  isFavorite: boolean
  createdAt: string
  updatedAt: string
}

// ============================================================
// AI CHAT
// ============================================================
export type MessageRole = 'user' | 'assistant' | 'tool'

export interface ChatMessage {
  id: string
  conversationId: string
  role: MessageRole
  content: string
  toolCalls?: ToolCall[]
  toolResults?: ToolResult[]
  metadata?: Record<string, unknown>
  createdAt: string
}

export interface ToolCall {
  id: string
  name: string
  arguments: Record<string, unknown>
}

export interface ToolResult {
  toolCallId: string
  result: unknown
  error?: string
}

export interface Conversation {
  id: string
  userId: string
  title?: string
  summary?: string
  isPinned: boolean
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

// ============================================================
// PROJECTS
// ============================================================
export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED'

export interface Project {
  id: string
  userId: string
  title: string
  description?: string
  status: ProjectStatus
  githubUrl?: string
  deployUrl?: string
  color: string
  progress: number
  milestones: Milestone[]
  issues: Issue[]
  screenshots: string[]
  deadline?: string
  createdAt: string
  updatedAt: string
}

export interface Milestone {
  id: string
  title: string
  completed: boolean
  dueDate?: string
}

export interface Issue {
  id: string
  title: string
  status: 'open' | 'in_progress' | 'closed'
  priority: Priority
}

// ============================================================
// EXPENSES
// ============================================================
export type ExpenseType = 'INCOME' | 'EXPENSE'

export interface Expense {
  id: string
  userId: string
  type: ExpenseType
  amount: number
  currency: string
  category: string
  description?: string
  tags: string[]
  date: string
  createdAt: string
}

// ============================================================
// MEMORY
// ============================================================
export type MemoryLayer = 'SHORT_TERM' | 'LONG_TERM' | 'PREFERENCE' | 'ROUTINE' | 'GOAL' | 'KNOWLEDGE' | 'CONVERSATION' | 'SEMANTIC'

export interface Memory {
  id: string
  userId: string
  layer: MemoryLayer
  key?: string
  content: string
  source?: string
  metadata: Record<string, unknown>
  importance: number
  expiresAt?: string
  createdAt: string
}

// ============================================================
// NOTIFICATIONS
// ============================================================
export interface Notification {
  id: string
  userId: string
  title: string
  body: string
  type: 'reminder' | 'ai' | 'system' | 'habit'
  isRead: boolean
  metadata: Record<string, unknown>
  scheduledFor?: string
  sentAt?: string
  createdAt: string
}

// ============================================================
// API RESPONSE WRAPPERS
// ============================================================
export interface APIResponse<T> {
  success: boolean
  data: T
  message?: string
  pagination?: Pagination
}

export interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface APIError {
  success: false
  error: string
  code?: string
  details?: unknown
}

// ============================================================
// DASHBOARD
// ============================================================
export interface DashboardData {
  greeting: string
  todaysTasks: Task[]
  upcomingEvents: CalendarEvent[]
  todaysHabits: { habit: Habit; completed: boolean }[]
  productivity: ProductivityScore
  aiSuggestion: string
  dailyQuote: Quote
  timeline: TimelineItem[]
}

export interface ProductivityScore {
  score: number // 0-100
  tasksCompleted: number
  tasksTotal: number
  habitsCompleted: number
  habitsTotal: number
  focusTime: number // minutes
}

export interface Quote {
  text: string
  author: string
}

export interface TimelineItem {
  id: string
  time: string // "09:00"
  title: string
  type: 'habit' | 'task' | 'event' | 'study' | 'routine' | 'break'
  color: string
  icon: string
  completed?: boolean
  source?: CalendarEvent | Task | Habit
}

// ============================================================
// SEARCH
// ============================================================
export interface SearchResult {
  id: string
  type: 'task' | 'event' | 'note' | 'habit' | 'journal' | 'project' | 'expense' | 'document' | 'conversation'
  title: string
  snippet?: string
  date?: string
  score?: number
  url: string
}

// ============================================================
// ANALYTICS
// ============================================================
export interface AnalyticsData {
  period: 'daily' | 'weekly' | 'monthly'
  productivity: ProductivityDataPoint[]
  habits: HabitAnalytics[]
  tasks: TaskAnalytics
  mood: MoodDataPoint[]
  study: StudyAnalytics
  focus: number // total minutes
}

export interface ProductivityDataPoint {
  date: string
  score: number
  tasksCompleted: number
  focusMinutes: number
}

export interface HabitAnalytics {
  habitId: string
  title: string
  completionRate: number
  streak: number
  completions: { date: string; count: number }[]
}

export interface TaskAnalytics {
  total: number
  completed: number
  overdue: number
  completionRate: number
  byPriority: Record<Priority, number>
  byStatus: Record<TaskStatus, number>
}

export interface MoodDataPoint {
  date: string
  mood: number
  energy?: number
}

export interface StudyAnalytics {
  totalMinutes: number
  sessions: number
  bySubject: { subject: string; minutes: number }[]
}
