import { create } from 'zustand'
import type { ChatMessage, Conversation } from '@/types'
import axios from 'axios'

interface ChatStore {
  // Conversations list
  conversations: Conversation[]
  setConversations: (convs: Conversation[]) => void
  addConversation: (conv: Conversation) => void
  updateConversation: (id: string, updates: Partial<Conversation>) => void

  // Active conversation
  activeConversationId: string | null
  setActiveConversationId: (id: string | null) => void
  activeConversation: Conversation | null

  // Messages
  messages: ChatMessage[]
  setMessages: (msgs: ChatMessage[]) => void
  addMessage: (msg: ChatMessage) => void
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void

  // Streaming state
  isStreaming: boolean
  streamingContent: string
  activeTools: { name: string; status: 'running' | 'done' | 'error' }[]
  setIsStreaming: (streaming: boolean) => void
  appendStreamContent: (chunk: string) => void
  setStreamingContent: (content: string) => void
  setActiveTools: (tools: { name: string; status: 'running' | 'done' | 'error' }[]) => void
  updateToolStatus: (name: string, status: 'running' | 'done' | 'error') => void
  clearStream: () => void

  // Input
  inputValue: string
  setInputValue: (value: string) => void

  // UI state
  showSuggestions: boolean
  setShowSuggestions: (show: boolean) => void

  // Persistence Actions
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  fetchConversations: () => Promise<void>
  selectConversation: (id: string | null) => Promise<void>
  deleteConversation: (id: string) => Promise<void>
}

// Helpers for Authorization header
const getAuthHeaders = () => ({
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('arise-token') || ''}`,
  }
})

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: [],
  setConversations: (convs) => set({ conversations: convs }),
  addConversation: (conv) => set((s) => ({ conversations: [conv, ...s.conversations] })),
  updateConversation: (id, updates) =>
    set((s) => ({
      conversations: s.conversations.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    })),

  activeConversationId: null,
  setActiveConversationId: (id) => set({ activeConversationId: id }),
  get activeConversation() {
    const { conversations, activeConversationId } = get()
    return conversations.find((c) => c.id === activeConversationId) ?? null
  },

  messages: [],
  setMessages: (msgs) => set({ messages: msgs }),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  updateMessage: (id, updates) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    })),

  isStreaming: false,
  streamingContent: '',
  activeTools: [],
  setIsStreaming: (streaming) => set({ isStreaming: streaming }),
  appendStreamContent: (chunk) =>
    set((s) => ({ streamingContent: s.streamingContent + chunk })),
  setStreamingContent: (content) => set({ streamingContent: content }),
  setActiveTools: (tools) => set({ activeTools: tools }),
  updateToolStatus: (name, status) =>
    set((s) => ({
      activeTools: s.activeTools.map((t) => (t.name === name ? { ...t, status } : t)),
    })),
  clearStream: () => set({ streamingContent: '', activeTools: [], isStreaming: false }),

  inputValue: '',
  setInputValue: (value) => set({ inputValue: value }),

  showSuggestions: true,
  setShowSuggestions: (show) => set({ showSuggestions: show }),

  // Persistence Actions Implementation
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),

  fetchConversations: async () => {
    set({ isLoading: true })
    try {
      const response = await axios.get('/api/ai/conversations', getAuthHeaders())
      if (response.data.success) {
        set({ conversations: response.data.conversations })
      }
    } catch (error) {
      console.error('[Zustand ChatStore] Failed to fetch conversations:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  selectConversation: async (id) => {
    set({ activeConversationId: id, showSuggestions: id === null })
    if (id === null) {
      set({ messages: [] })
      return
    }

    set({ isLoading: true })
    try {
      const response = await axios.get(`/api/ai/conversations/${id}`, getAuthHeaders())
      if (response.data.success) {
        const conv = response.data.conversation
        set({ messages: conv.messages || [] })
      }
    } catch (error) {
      console.error(`[Zustand ChatStore] Failed to fetch messages for conversation ${id}:`, error)
      set({ messages: [] })
    } finally {
      set({ isLoading: false })
    }
  },

  deleteConversation: async (id) => {
    try {
      const response = await axios.delete(`/api/ai/conversations/${id}`, getAuthHeaders())
      if (response.data.success) {
        set((s) => {
          const nextConvs = s.conversations.filter((c) => c.id !== id)
          const nextActiveId = s.activeConversationId === id ? (nextConvs[0]?.id || null) : s.activeConversationId
          
          // Trigger message loading for next active chat if selected
          if (nextActiveId !== s.activeConversationId) {
            setTimeout(() => {
              get().selectConversation(nextActiveId)
            }, 0)
          }

          return {
            conversations: nextConvs,
            activeConversationId: nextActiveId,
          }
        })
      }
    } catch (error) {
      console.error(`[Zustand ChatStore] Failed to delete conversation ${id}:`, error)
    }
  }
}))
