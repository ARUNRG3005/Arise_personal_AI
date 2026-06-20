import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useSearchParams } from 'react-router-dom'
import ChatSidebar from './components/ChatSidebar'
import ChatMessages from './components/ChatMessages'
import ChatInput from './components/ChatInput'
import { SUGGESTED_PROMPTS } from '@/lib/utils'
import { Sparkles } from 'lucide-react'

export type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isStreaming?: boolean
  tools?: string[]
}

export type Conversation = {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

// Simulated AI responses (will be replaced by real Groq streaming)
const AI_RESPONSES: Record<string, string> = {
  default: `I'm ARISE, your personal AI operating system. I can help you with:

- 📋 **Tasks** — Create, organize, and prioritize your to-do list
- 📅 **Calendar** — Schedule events and plan your day
- 🔥 **Habits** — Track and build powerful routines
- 📓 **Journal** — Reflect and process your thoughts
- 📝 **Notes** — Capture and organize knowledge
- 💰 **Expenses** — Track your spending
- 📊 **Analytics** — Understand your productivity patterns

What would you like to work on today?`,
  tasks: `I see you want to work on tasks! Let me check what's on your plate today...

**Today's Priority Tasks:**
1. 🔴 Review AI Orchestrator design *(HIGH)*
2. 🟡 Write Prisma schema migrations *(MEDIUM)*  
3. 🟢 Set up Supabase storage bucket *(LOW)*

You have **4 tasks** due today and **2 in progress**. Want me to help you prioritize or break any of these into smaller steps?`,
  habits: `Here's your **habit progress** for today 🔥

| Habit | Status | Streak |
|-------|--------|--------|
| Morning Exercise 🏋️ | ✅ Done | 12 days |
| Read 30 minutes 📚 | ⏳ Pending | 5 days |
| Meditate 🧘 | ⏳ Pending | 3 days |
| Drink 2L water 💧 | ✅ Done | 8 days |

You've completed **2 of 4** habits today. Your longest streak is **12 days** for Morning Exercise — keep it going!`,
}

function getAIResponse(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('task') || lower.includes('todo')) return AI_RESPONSES.tasks
  if (lower.includes('habit') || lower.includes('routine')) return AI_RESPONSES.habits
  return AI_RESPONSES.default
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

const INITIAL_CONVERSATION: Conversation = {
  id: 'conv-1',
  title: 'New Chat',
  messages: [],
  createdAt: new Date(),
  updatedAt: new Date(),
}

export default function ChatPage() {
  const { conversationId } = useParams()
  const [searchParams] = useSearchParams()
  const initialQuery = searchParams.get('q')

  const [conversations, setConversations] = useState<Conversation[]>([INITIAL_CONVERSATION])
  const [activeConvId, setActiveConvId] = useState('conv-1')
  const [isTyping, setIsTyping] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const activeConv = conversations.find(c => c.id === activeConvId) || conversations[0]

  // Handle initial query from command palette
  useEffect(() => {
    if (initialQuery) {
      handleSend(initialQuery)
    }
  }, []) // eslint-disable-line

  const handleSend = useCallback(async (content: string) => {
    if (!content.trim() || isTyping) return

    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    }

    // Update title if first message
    setConversations(prev => prev.map(c => {
      if (c.id === activeConvId) {
        return {
          ...c,
          title: c.messages.length === 0 ? content.slice(0, 40) : c.title,
          messages: [...c.messages, userMsg],
          updatedAt: new Date(),
        }
      }
      return c
    }))

    setIsTyping(true)

    const assistantMsgId = generateId()
    const streamingMsg: Message = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
      tools: [],
    }

    setConversations(prev => prev.map(c => {
      if (c.id === activeConvId) {
        return { ...c, messages: [...c.messages, streamingMsg] }
      }
      return c
    }))

    try {
      // Build history context from current conversation
      const currentConv = conversations.find(c => c.id === activeConvId);
      const history = (currentConv?.messages || []).map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('arise-token') || ''}`,
        },
        body: JSON.stringify({ message: content, history }),
      });

      if (!response.ok) {
        throw new Error('Failed to connect to AI server');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error('No readable stream available');

      let accumulatedContent = '';
      let isDone = false;

      while (!isDone) {
        const { value, done } = await reader.read();
        if (done) {
          isDone = true;
          break;
        }

        const chunkText = decoder.decode(value);
        const lines = chunkText.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.error) {
                accumulatedContent += `\n*Error: ${data.error}*`;
              } else {
                accumulatedContent = data.content;
              }

              const runningTools = (data.toolCalls || []).map((tc: any) => `${tc.name} (${tc.status})`);

              setConversations(prev => prev.map(c => {
                if (c.id === activeConvId) {
                  return {
                    ...c,
                    messages: c.messages.map(m =>
                      m.id === assistantMsgId ? {
                        ...m,
                        content: accumulatedContent,
                        tools: runningTools,
                        isStreaming: !isDone
                      } : m
                    ),
                  }
                }
                return c
              }));
            } catch (e) {
              // Ignore partial JSON parsing errors on split boundaries
            }
          }
        }
      }

      // Mark streaming complete
      setConversations(prev => prev.map(c => {
        if (c.id === activeConvId) {
          return {
            ...c,
            messages: c.messages.map(m =>
              m.id === assistantMsgId ? { ...m, isStreaming: false } : m
            ),
          }
        }
        return c
      }));

    } catch (err: any) {
      console.error(err);
      setConversations(prev => prev.map(c => {
        if (c.id === activeConvId) {
          return {
            ...c,
            messages: c.messages.map(m =>
              m.id === assistantMsgId ? {
                ...m,
                content: `An error occurred: ${err.message || 'Unable to reach the AI Operating System.'}`,
                isStreaming: false
              } : m
            ),
          }
        }
        return c
      }));
    } finally {
      setIsTyping(false);
    }
  }, [activeConvId, isTyping])

  const handleNewChat = () => {
    const newConv: Conversation = {
      id: generateId(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setConversations(prev => [newConv, ...prev])
    setActiveConvId(newConv.id)
  }

  const isEmpty = activeConv.messages.length === 0

  return (
    <div className="flex h-full overflow-hidden">
      {/* Chat sidebar */}
      <ChatSidebar
        conversations={conversations}
        activeId={activeConvId}
        onSelect={setActiveConvId}
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
              key={activeConvId}
              messages={activeConv.messages}
              isTyping={isTyping}
            />
          )}
        </AnimatePresence>

        {/* Input area */}
        <ChatInput
          onSend={handleSend}
          isDisabled={isTyping}
          inputRef={inputRef}
        />
      </div>
    </div>
  )
}
