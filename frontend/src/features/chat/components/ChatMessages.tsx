import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Sparkles, User, Globe, Search, ExternalLink } from 'lucide-react'
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
    <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 space-y-4 scrollbar-thin">
      <AnimatePresence initial={false}>
        {messages.map((msg) => {
          const sources = Array.isArray(msg.metadata?.sources) ? (msg.metadata.sources as any[]) : null;
          return (
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
                'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 self-start mt-0.5 border',
                msg.role === 'assistant'
                  ? 'bg-[#00cfff]/10 border-[#00cfff]/30 text-[#00cfff] shadow-[0_0_10px_rgba(0,207,255,0.15)]'
                  : 'bg-white/5 border-white/10 text-[#8ab6d6]'
              )}>
                {msg.role === 'assistant' ? (
                  <Sparkles className="w-4 h-4" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>

              {/* Bubble */}
              <div className={cn(
                'flex flex-col gap-1',
                msg.role === 'user' ? 'w-full md:max-w-[75%] md:ml-auto items-end' : 'w-full md:max-w-[85%] items-start'
              )}>
                {/* Monospace prefix */}
                <div className={cn(
                  'font-mono text-[9px] uppercase tracking-widest px-1',
                  msg.role === 'user' ? 'text-[#8ab6d6]/60' : 'text-[#00cfff]/80'
                )}>
                  {msg.role === 'user' ? 'YOU >' : 'ARISE >'}
                </div>

                <div className={cn(
                  'rounded-2xl px-4 py-3 text-sm leading-relaxed border',
                  msg.role === 'user'
                    ? 'bg-[#041428] border-[#00cfff]/30 text-[#e8f7ff] rounded-tr-none'
                    : 'bg-[#041428]/50 border-[#00cfff]/15 text-[#e8f7ff] rounded-tl-none shadow-[0_0_15px_rgba(0,207,255,0.03)]'
                )}>
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm prose-arise max-w-none">
                      {/* Web Search status indicators */}
                      {msg.tools?.some(t => t.toLowerCase().includes('searchweb') && t.toLowerCase().includes('running')) ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#00cfff]/10 border border-[#00cfff]/25 text-xs text-[#00cfff] font-mono font-medium mb-3 w-fit animate-pulse not-prose">
                          <Search className="w-3.5 h-3.5 animate-spin" />
                          <span>SEARCH_RUNNING // QUERYING...</span>
                        </div>
                      ) : (msg.tools?.some(t => t.toLowerCase().includes('searchweb') && t.toLowerCase().includes('done')) || (sources && sources.length > 0)) ? (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 font-mono font-medium mb-3 w-fit not-prose">
                          <Globe className="w-3.5 h-3.5" />
                          <span>LIVE_INTERNET_SEARCH // SECURE</span>
                        </div>
                      ) : null}

                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                      {msg.isStreaming && (
                        <span className="inline-block w-1.5 h-4 bg-[#00cfff] animate-pulse ml-0.5 -mb-0.5" />
                      )}

                      {/* Citations/sources grid */}
                      {sources && sources.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-[#00cfff]/10 w-full not-prose">
                          <div className="flex items-center gap-1.5 mb-2.5 text-[10px] font-mono font-semibold text-[#8ab6d6]/70 uppercase tracking-wider">
                            <Globe className="w-3.5 h-3.5 text-[#00cfff]" />
                            <span>SOURCES_FOUND // DIRECT_LINKS:</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                            {sources.map((source, index) => {
                              let domain = '';
                              try {
                                domain = new URL(source.url).hostname.replace('www.', '');
                              } catch (e) {
                                domain = source.url;
                              }
                              
                              return (
                                <a
                                  key={index}
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex flex-col gap-1 p-2.5 rounded-xl border border-[#00cfff]/10 bg-white/[0.01] hover:bg-[#00cfff]/5 hover:border-[#00cfff]/30 transition-all group"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <span className="text-xs font-sans font-medium text-[#e8f7ff] line-clamp-2 leading-snug group-hover:text-[#00cfff] transition-colors">
                                      {source.title}
                                    </span>
                                    <ExternalLink className="w-3.5 h-3.5 text-[#8ab6d6]/40 group-hover:text-[#00cfff] flex-shrink-0 mt-0.5" />
                                  </div>
                                  <span className="text-[10px] text-[#8ab6d6]/50 flex items-center gap-1.5 mt-1 font-mono">
                                    <img 
                                      src={`https://www.google.com/s2/favicons?sz=32&domain=${domain}`} 
                                      alt="" 
                                      className="w-3.5 h-3.5 rounded flex-shrink-0 bg-white/10"
                                      onError={(e) => {
                                        (e.target as HTMLElement).style.display = 'none';
                                      }}
                                    />
                                    {domain.toUpperCase()}
                                  </span>
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="font-sans whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
                <span className="text-[9px] font-mono text-[#8ab6d6]/40 px-1 mt-0.5">
                  {format(msg.createdAt ? new Date(msg.createdAt) : (msg.timestamp || new Date()), 'HH:mm:ss')}
                </span>
              </div>
            </motion.div>
          )})}

        {/* Typing indicator */}
        {isTyping && messages[messages.length - 1]?.role === 'user' && (
          <motion.div
            key="typing"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex gap-3 max-w-3xl mx-auto"
          >
            <div className="w-8 h-8 rounded-xl bg-[#00cfff]/10 border border-[#00cfff]/25 text-[#00cfff] flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(0,207,255,0.15)]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="font-mono text-[9px] uppercase tracking-widest text-[#00cfff]/80 px-1">
                ARISE &gt;
              </div>
              <div className="bg-[#041428]/50 border border-[#00cfff]/15 rounded-2xl rounded-tl-none px-4 py-3.5">
                <div className="flex gap-1.5 items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00cfff] animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00cfff] animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00cfff] animate-bounce" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={bottomRef} />
    </div>
  )
}
