import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Sparkles, User } from 'lucide-react'
import { format } from 'date-fns'
import type { ChatMessage } from '@/types'
import { cn } from '@/lib/utils'

export type Message = ChatMessage & {
  timestamp?: Date
  isStreaming?: boolean
  tools?: string[]
}

interface Props {
  messages: Message[]
  isTyping: boolean
}

export default function ChatMessages({ messages, isTyping }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6 scrollbar-thin">
      <AnimatePresence initial={false}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={cn(
              'flex gap-3 max-w-3xl mx-auto',
              msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            {/* Avatar */}
            <div className={cn(
              'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 self-start mt-0.5',
              msg.role === 'assistant'
                ? 'bg-gradient-primary shadow-glow-primary'
                : 'bg-white/10'
            )}>
              {msg.role === 'assistant'
                ? <Sparkles className="w-4 h-4 text-white" />
                : <User className="w-4 h-4 text-[color:var(--text-secondary)]" />
              }
            </div>

            {/* Bubble */}
            <div className={cn(
              'flex flex-col gap-1 max-w-[80%]',
              msg.role === 'user' ? 'items-end' : 'items-start'
            )}>
              <div className={cn(
                'rounded-2xl px-4 py-3 text-sm leading-relaxed',
                msg.role === 'user'
                  ? 'bg-primary-600 text-white rounded-tr-sm'
                  : 'bg-[color:var(--bg-card)] border border-[color:var(--border-subtle)] text-[color:var(--text-primary)] rounded-tl-sm'
              )}>
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                    {msg.isStreaming && (
                      <span className="inline-block w-0.5 h-4 bg-primary-400 animate-pulse ml-0.5 -mb-0.5" />
                    )}
                  </div>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
              <span className="text-[10px] text-[color:var(--text-muted)] px-1">
                {format(msg.createdAt ? new Date(msg.createdAt) : (msg.timestamp || new Date()), 'h:mm a')}
              </span>
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        {isTyping && messages[messages.length - 1]?.role === 'user' && (
          <motion.div
            key="typing"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex gap-3 max-w-3xl mx-auto"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-glow-primary">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="bg-[color:var(--bg-card)] border border-[color:var(--border-subtle)] rounded-2xl rounded-tl-sm px-4 py-3.5">
              <div className="flex gap-1">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={bottomRef} />
    </div>
  )
}
