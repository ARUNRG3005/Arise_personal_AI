import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import ChatSidebar from './components/ChatSidebar'
import ChatMessages from './components/ChatMessages'
import ChatInput from './components/ChatInput'
import { useVoiceAssistant, type VoiceState } from '@/services/voice/useVoiceAssistant'
import { useChatStore } from '@/stores/chatStore'
import type { ChatMessage, Conversation } from '@/types'
import { SUGGESTED_PROMPTS } from '@/lib/utils'
import { Sparkles } from 'lucide-react'

export type Message = ChatMessage & {
  timestamp?: Date
  isStreaming?: boolean
  tools?: string[]
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

export default function ChatPage() {
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialQuery = searchParams.get('q')

  const {
    conversations,
    activeConversationId,
    messages,
    inputValue,
    setInputValue,
    fetchConversations,
    selectConversation,
    deleteConversation,
    addConversation,
    setMessages,
  } = useChatStore()

  const [isTyping, setIsTyping] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const voiceStateRef = useRef<VoiceState>('idle')
  const speakResponseRef = useRef<(text: string) => void>(() => {})
  const interruptRef = useRef<() => void>(() => {})

  // Fetch all conversations on mount
  useEffect(() => {
    fetchConversations()
  }, [])

  // Sync conversation ID from route param
  useEffect(() => {
    if (conversationId) {
      selectConversation(conversationId)
    } else {
      selectConversation(null)
    }
  }, [conversationId])

  // Handle initial query from command palette
  useEffect(() => {
    if (initialQuery) {
      handleSend(initialQuery)
    }
  }, []) // eslint-disable-line

  const handleSend = useCallback(async (content: string) => {
    if (!content.trim() || isTyping) return

    const userMsg = {
      id: generateId(),
      conversationId: activeConversationId || 'new',
      role: 'user' as const,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    }

    // Add user message locally
    setMessages([...useChatStore.getState().messages, userMsg])
    setIsTyping(true)

    const assistantMsgId = generateId()
    const streamingMsg = {
      id: assistantMsgId,
      conversationId: activeConversationId || 'new',
      role: 'assistant' as const,
      content: '',
      createdAt: new Date().toISOString(),
      isStreaming: true,
      tools: [],
    }

    // Add placeholder assistant message
    setMessages([...useChatStore.getState().messages, userMsg, streamingMsg])

    try {
      // Build history context from current conversation messages
      const history = useChatStore.getState().messages.slice(0, -2).map(m => ({
        role: m.role,
        content: m.content
      }))

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('arise-token') || ''}`,
        },
        body: JSON.stringify({
          message: content,
          history,
          conversationId: activeConversationId || undefined
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to connect to AI server')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      if (!reader) throw new Error('No readable stream available')

      let accumulatedContent = ''
      let isDone = false
      let activeId = activeConversationId

      while (!isDone) {
        const { value, done } = await reader.read()
        if (done) {
          isDone = true
          break
        }

        const chunkText = decoder.decode(value)
        const lines = chunkText.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))

              // Check if we received conversationId from the backend
              if (data.conversationId && !activeId) {
                activeId = data.conversationId
                
                // Add conversation to store list
                addConversation({
                  id: data.conversationId,
                  userId: 'user-id',
                  title: content.substring(0, 40) + (content.length > 40 ? '...' : ''),
                  isPinned: false,
                  messages: [userMsg],
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                })

                // Update URL to match persistent conversation ID
                navigate(`/chat/${activeId}`, { replace: true })
                useChatStore.setState({ activeConversationId: activeId })
              }

              if (data.error) {
                accumulatedContent += `\n*Error: ${data.error}*`
              } else if (data.content !== undefined) {
                accumulatedContent = data.content
              }

              const runningTools = (data.toolCalls || []).map((tc: any) => `${tc.name} (${tc.status})`)

              // Update assistant message content in store
              setMessages(
                useChatStore.getState().messages.map(m =>
                  m.id === assistantMsgId ? {
                    ...m,
                    content: accumulatedContent,
                    tools: runningTools,
                    isStreaming: !isDone
                  } : m
                )
              )
            } catch (e) {
              // Ignore partial JSON parsing errors
            }
          }
        }
      }

      // Mark streaming complete in store
      setMessages(
        useChatStore.getState().messages.map(m =>
          m.id === assistantMsgId ? { ...m, isStreaming: false } : m
        )
      )

      // Refresh conversations list in sidebar
      fetchConversations()

      // Speak response if voice assistant was processing this message
      if (voiceStateRef.current === 'processing') {
        speakResponseRef.current(accumulatedContent)
      }

    } catch (err: any) {
      console.error(err)
      if (voiceStateRef.current === 'processing') {
        interruptRef.current()
      }
      setMessages(
        useChatStore.getState().messages.map(m =>
          m.id === assistantMsgId ? {
            ...m,
            content: `An error occurred: ${err.message || 'Unable to reach the AI Operating System.'}`,
            isStreaming: false
          } : m
        )
      )
    } finally {
      setIsTyping(false)
    }
  }, [activeConversationId, isTyping, navigate, addConversation, setMessages, fetchConversations])

  const { state: voiceState, startListening, stopListening, interrupt, speakResponse } = useVoiceAssistant({
    onSend: (text) => {
      handleSend(text)
      setInputValue('')
    },
    onTranscriptChange: (text) => {
      setInputValue(text)
    }
  })

  useEffect(() => {
    voiceStateRef.current = voiceState
    speakResponseRef.current = speakResponse
    interruptRef.current = interrupt
  }, [voiceState, speakResponse, interrupt])

  const toggleVoice = useCallback(() => {
    if (voiceState === 'idle') {
      startListening()
    } else if (voiceState === 'listening') {
      stopListening()
    } else if (voiceState === 'speaking') {
      interrupt()
    }
  }, [voiceState, startListening, stopListening, interrupt])

  const handleNewChat = () => {
    navigate('/chat')
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex h-full overflow-hidden">
      {/* Chat sidebar */}
      <ChatSidebar
        conversations={conversations}
        activeId={activeConversationId}
        onSelect={(id) => navigate(id ? `/chat/${id}` : '/chat')}
        onDelete={deleteConversation}
        onNew={handleNewChat}
      />

      {/* Main chat area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {isEmpty ? (
            /* Empty state */
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex flex-col items-center gap-4 mb-10"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow-primary">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-bold text-[color:var(--text-primary)]">How can I help you?</h2>
                  <p className="text-sm text-[color:var(--text-tertiary)] mt-1">Your personal AI is ready — ask me anything.</p>
                </div>
              </motion.div>

              {/* Suggested prompts */}
              <div className="grid grid-cols-2 gap-2.5 w-full max-w-2xl">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <motion.button
                    key={prompt.text}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.05 }}
                    onClick={() => handleSend(prompt.text)}
                    className="flex items-center gap-3 p-3.5 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--bg-surface)] hover:bg-white/[0.05] hover:border-primary-500/30 transition-all text-left group"
                  >
                    <span className="text-xl flex-shrink-0">{prompt.icon}</span>
                    <span className="text-sm text-[color:var(--text-secondary)] group-hover:text-[color:var(--text-primary)] transition-colors">
                      {prompt.text}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            /* Messages */
            <ChatMessages
              key={activeConversationId || 'new'}
              messages={messages as any}
              isTyping={isTyping}
            />
          )}
        </AnimatePresence>

        {/* Input area */}
        <ChatInput
          onSend={handleSend}
          isDisabled={isTyping}
          inputRef={inputRef}
          value={inputValue}
          onChange={setInputValue}
          voiceState={voiceState}
          onVoiceToggle={toggleVoice}
          onVoiceInterrupt={interrupt}
        />
      </div>
    </div>
  )
}
