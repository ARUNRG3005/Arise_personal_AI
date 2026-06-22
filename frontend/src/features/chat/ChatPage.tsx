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
import AriseOrb from '@/components/shared/AriseOrb'
import HudCard from '@/components/shared/HudCard'

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
    const currentMessages = useChatStore.getState().messages
    const nextMessages = [...currentMessages, userMsg]
    setMessages(nextMessages)
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
    setMessages([...nextMessages, streamingMsg])

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
      let accumulatedSources: any[] | null = null
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

              if (data.sources) {
                accumulatedSources = data.sources
              }

              const runningTools = (data.toolCalls || []).map((tc: any) => `${tc.name} (${tc.status})`)

              // Update assistant message content in store
              setMessages(
                useChatStore.getState().messages.map(m =>
                  m.id === assistantMsgId ? {
                    ...m,
                    content: accumulatedContent,
                    tools: runningTools,
                    isStreaming: !isDone,
                    metadata: accumulatedSources ? { sources: accumulatedSources } : m.metadata
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

  const { state: voiceState, startListening, stopListening, interrupt, speakResponse, startWakeWord, stopWakeWord } = useVoiceAssistant({
    onSend: (text) => {
      handleSend(text)
      setInputValue('')
    },
    onTranscriptChange: (text) => {
      setInputValue(text)
    }
  })

  // Start wake word loop on mount
  useEffect(() => {
    startWakeWord()
    return () => {
      stopWakeWord()
    }
  }, [startWakeWord, stopWakeWord])

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
    <div className="flex flex-col md:flex-row h-full overflow-hidden">
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
                className="flex flex-col items-center gap-6 mb-10"
              >
                <AriseOrb size="lg" interactive onClick={toggleVoice} />
                <div className="text-center">
                  <h2 className="text-xl font-mono font-bold text-[#e8f7ff] uppercase tracking-wider">How can I help you?</h2>
                  <p className="text-xs font-mono text-[#8ab6d6]/60 mt-1 uppercase tracking-widest">SYSTEM_STATE: READY // STANDBY_WAKE_LOOP</p>
                </div>
              </motion.div>

              {/* Suggested prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <motion.button
                    key={prompt.text}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.05 }}
                    onClick={() => handleSend(prompt.text)}
                    className="relative flex items-center gap-3 p-3.5 rounded-xl border border-[#00cfff]/20 bg-[#041428]/40 hover:bg-[#00cfff]/5 hover:border-[#00cfff]/50 transition-all text-left group overflow-hidden cursor-pointer"
                  >
                    {/* Small HUD corner decorations */}
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#00cfff]/30 opacity-40 group-hover:opacity-100 group-hover:border-[#00cfff] transition-all" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#00cfff]/30 opacity-40 group-hover:opacity-100 group-hover:border-[#00cfff] transition-all" />
                    
                    <span className="text-xl flex-shrink-0">{prompt.icon}</span>
                    <span className="text-sm font-sans text-[#8ab6d6] group-hover:text-[#00cfff] transition-colors leading-snug">
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

      {/* Floating JARVIS Voice Indicator Pill */}
      {voiceState !== 'idle' && (
        <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#041428]/80 border border-[#00cfff]/30 backdrop-blur-md text-xs font-mono select-none shadow-glow-sm">
          {voiceState === 'wake' && (
            <div className="flex items-center gap-2 text-[#00cfff]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00cfff] animate-pulse" />
              <span>ARISE ONLINE</span>
            </div>
          )}
          {voiceState === 'listening' && (
            <div className="flex items-center gap-2 text-cyan-400 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <span>LISTENING</span>
            </div>
          )}
          {voiceState === 'processing' && (
            <div className="flex items-center gap-2 text-amber-400">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border-t-2 border-transparent animate-spin" />
              <span>PROCESSING</span>
            </div>
          )}
          {voiceState === 'speaking' && (
            <div className="flex items-center gap-2 text-[#00cfff]">
              <span className="w-2 h-2 bg-[#00cfff] rounded-full animate-bounce" />
              <span>SPEAKING</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
