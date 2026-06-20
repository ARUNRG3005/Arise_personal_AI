import { create } from 'zustand'
import type { ChatMessage, Conversation } from '@/types'

interface StreamingChunk {
  conversationId: string
  content: string
  done: boolean
  toolCalls?: { name: string; status: 'running' | 'done' | 'error' }[]
}

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
}

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
}))
