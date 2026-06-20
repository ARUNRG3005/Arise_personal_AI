import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — attach auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('arise-token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Something went wrong'

    if (error.response?.status === 401) {
      localStorage.removeItem('arise-token')
      window.location.href = '/'
    } else if (error.response?.status === 429) {
      toast.error('Too many requests. Please slow down.')
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again.')
    }

    return Promise.reject(new Error(message))
  }
)

export default api

// ============================================================
// API MODULES
// ============================================================

export const authAPI = {
  init: () => api.get('/auth/init'),
  me: () => api.get('/auth/me'),
  updateProfile: (data: unknown) => api.patch('/auth/me', data),
}

export const tasksAPI = {
  getAll: (params?: Record<string, unknown>) => api.get('/tasks', { params }),
  getById: (id: string) => api.get(`/tasks/${id}`),
  create: (data: unknown) => api.post('/tasks', data),
  update: (id: string, data: unknown) => api.patch(`/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
  complete: (id: string) => api.post(`/tasks/${id}/complete`),
  reorder: (tasks: { id: string; sortOrder: number }[]) => api.post('/tasks/reorder', { tasks }),
}

export const calendarAPI = {
  getEvents: (params: { start: string; end: string }) => api.get('/calendar', { params }),
  getById: (id: string) => api.get(`/calendar/${id}`),
  create: (data: unknown) => api.post('/calendar', data),
  update: (id: string, data: unknown) => api.patch(`/calendar/${id}`, data),
  delete: (id: string) => api.delete(`/calendar/${id}`),
  checkConflicts: (data: unknown) => api.post('/calendar/conflicts', data),
}

export const habitsAPI = {
  getAll: () => api.get('/habits'),
  create: (data: unknown) => api.post('/habits', data),
  update: (id: string, data: unknown) => api.patch(`/habits/${id}`, data),
  delete: (id: string) => api.delete(`/habits/${id}`),
  complete: (id: string, note?: string) => api.post(`/habits/${id}/complete`, { note }),
  getHeatmap: (id: string, months?: number) => api.get(`/habits/${id}/heatmap`, { params: { months } }),
}

export const journalAPI = {
  getAll: (params?: Record<string, unknown>) => api.get('/journal', { params }),
  getById: (id: string) => api.get(`/journal/${id}`),
  create: (data: unknown) => api.post('/journal', data),
  update: (id: string, data: unknown) => api.patch(`/journal/${id}`, data),
  delete: (id: string) => api.delete(`/journal/${id}`),
  getAIReflection: (id: string) => api.post(`/journal/${id}/reflect`),
}

export const notesAPI = {
  getAll: (params?: Record<string, unknown>) => api.get('/notes', { params }),
  getById: (id: string) => api.get(`/notes/${id}`),
  create: (data: unknown) => api.post('/notes', data),
  update: (id: string, data: unknown) => api.patch(`/notes/${id}`, data),
  delete: (id: string) => api.delete(`/notes/${id}`),
  getFolders: () => api.get('/notes/folders'),
  createFolder: (data: unknown) => api.post('/notes/folders', data),
  summarize: (id: string) => api.post(`/notes/${id}/summarize`),
}

export const projectsAPI = {
  getAll: () => api.get('/projects'),
  getById: (id: string) => api.get(`/projects/${id}`),
  create: (data: unknown) => api.post('/projects', data),
  update: (id: string, data: unknown) => api.patch(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
}

export const expensesAPI = {
  getAll: (params?: Record<string, unknown>) => api.get('/expenses', { params }),
  create: (data: unknown) => api.post('/expenses', data),
  update: (id: string, data: unknown) => api.patch(`/expenses/${id}`, data),
  delete: (id: string) => api.delete(`/expenses/${id}`),
  getSummary: (period: 'week' | 'month' | 'year') => api.get('/expenses/summary', { params: { period } }),
}

export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getProductivity: (period: string) => api.get('/analytics/productivity', { params: { period } }),
  getHabits: (period: string) => api.get('/analytics/habits', { params: { period } }),
  getMood: (period: string) => api.get('/analytics/mood', { params: { period } }),
}

export const aiAPI = {
  getConversations: () => api.get('/ai/conversations'),
  getMessages: (conversationId: string) => api.get(`/ai/conversations/${conversationId}/messages`),
  createConversation: () => api.post('/ai/conversations'),
  deleteConversation: (id: string) => api.delete(`/ai/conversations/${id}`),
  pinConversation: (id: string) => api.post(`/ai/conversations/${id}/pin`),
  getMemories: (layer?: string) => api.get('/ai/memory', { params: { layer } }),
  quickCapture: (text: string) => api.post('/ai/quick-capture', { text }),
}

export const searchAPI = {
  search: (query: string, domains?: string[]) => api.get('/search', { params: { query, domains: domains?.join(',') } }),
}

export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id: string) => api.post(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
}

export const documentsAPI = {
  getAll: () => api.get('/documents'),
  upload: (file: File, title: string) => {
    const form = new FormData()
    form.append('file', file)
    form.append('title', title)
    return api.post('/documents/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  summarize: (id: string) => api.post(`/documents/${id}/summarize`),
  delete: (id: string) => api.delete(`/documents/${id}`),
}
