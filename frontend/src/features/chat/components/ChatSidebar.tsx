import { motion } from 'framer-motion'
import { Plus, MessageSquare, Trash2, Search } from 'lucide-react'
import { format } from 'date-fns'
import type { Conversation } from '../ChatPage'
import { cn, truncate } from '@/lib/utils'
import { useState } from 'react'

interface Props {
  conversations: Conversation[]
  activeId: string
  onSelect: (id: string) => void
  onNew: () => void
}

export default function ChatSidebar({ conversations, activeId, onSelect, onNew }: Props) {
  const [search, setSearch] = useState('')

  const filtered = conversations.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="w-60 flex-shrink-0 border-r border-[color:var(--border-subtle)] flex flex-col bg-[color:var(--bg-surface)]/50 h-full">
      {/* Header */}
      <div className="p-3 border-b border-[color:var(--border-subtle)]">
        <button
          id="new-chat-btn"
          onClick={onNew}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gradient-primary text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-glow-primary"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-[color:var(--border-subtle)]">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-[color:var(--border-subtle)]">
          <Search className="w-3.5 h-3.5 text-[color:var(--text-tertiary)]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search chats..."
            className="flex-1 bg-transparent text-xs text-[color:var(--text-primary)] placeholder-[color:var(--text-muted)] outline-none"
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto py-2 scrollbar-thin">
        {filtered.length === 0 ? (
          <p className="text-xs text-[color:var(--text-muted)] text-center py-8">No conversations</p>
        ) : (
          <div className="space-y-0.5 px-2">
            {filtered.map((conv) => (
              <motion.div
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                layout
                role="button"
                tabIndex={0}
                className={cn(
                  'w-full flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all group cursor-pointer outline-none',
                  activeId === conv.id
                    ? 'bg-primary-600/12 border border-primary-500/20'
                    : 'hover:bg-white/[0.04] border border-transparent'
                )}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onSelect(conv.id);
                  }
                }}
              >
                <MessageSquare className={cn(
                  'w-3.5 h-3.5 flex-shrink-0 mt-0.5',
                  activeId === conv.id ? 'text-primary-400' : 'text-[color:var(--text-tertiary)]'
                )} />
                <div className="flex-1 min-w-0">
                  <p className={cn(
                     'text-xs font-medium truncate',
                    activeId === conv.id ? 'text-[color:var(--text-primary)]' : 'text-[color:var(--text-secondary)]'
                  )}>
                    {truncate(conv.title, 28)}
                  </p>
                  <p className="text-[10px] text-[color:var(--text-muted)] mt-0.5">
                    {conv.messages.length === 0 ? 'Empty' : `${conv.messages.length} messages`}
                    {' · '}
                    {format(conv.updatedAt, 'h:mm a')}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation() /* TODO: delete */ }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-[color:var(--text-tertiary)] hover:text-error-400 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2.5 border-t border-[color:var(--border-subtle)]">
        <p className="text-[10px] text-[color:var(--text-muted)] text-center">
          {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  )
}
