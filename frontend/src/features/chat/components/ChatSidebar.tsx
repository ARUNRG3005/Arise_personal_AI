import { motion } from 'framer-motion'
import { Plus, MessageSquare, Trash2, Search, Edit2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { Conversation } from '@/types'
import { cn, truncate } from '@/lib/utils'
import { useState } from 'react'
import { useChatStore } from '@/stores/chatStore'

interface Props {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (id: string | null) => void
  onDelete?: (id: string) => void
  onNew: () => void
}

export default function ChatSidebar({ conversations, activeId, onSelect, onDelete, onNew }: Props) {
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const renameConversation = useChatStore((s) => s.renameConversation)

  const filtered = conversations.filter(c =>
    (c.title || 'New Chat').toLowerCase().includes(search.toLowerCase())
  )

  const startRename = (id: string, currentTitle: string) => {
    setEditingId(id)
    setEditTitle(currentTitle || 'New Chat')
  }

  const handleRename = async (id: string) => {
    if (editTitle.trim()) {
      await renameConversation(id, editTitle.trim())
    }
    setEditingId(null)
  }

  return (
    <div className="w-64 flex-shrink-0 border-r border-[#00cfff]/15 flex flex-col bg-[#041428]/60 h-full backdrop-blur-md">
      {/* Header */}
      <div className="p-3 border-b border-[#00cfff]/10">
        <button
          id="new-chat-btn"
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#00cfff] text-[#020d18] text-xs font-mono font-bold uppercase hover:bg-[#00e1ff] transition-all shadow-[0_0_12px_rgba(0,207,255,0.3)] active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Session</span>
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-[#00cfff]/10">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.01] border border-[#00cfff]/15">
          <Search className="w-3.5 h-3.5 text-[#8ab6d6]/60" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="FILTER SESSIONS..."
            className="flex-1 bg-transparent text-[10px] font-mono text-[#e8f7ff] placeholder-[#8ab6d6]/30 outline-none uppercase"
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto py-2 scrollbar-thin">
        {filtered.length === 0 ? (
          <p className="text-[10px] font-mono text-[#8ab6d6]/40 text-center py-8">NO ACTIVE SESSIONS</p>
        ) : (
          <div className="space-y-1 px-2">
            {filtered.map((conv) => {
              const isActive = activeId === conv.id
              return (
                <motion.div
                  key={conv.id}
                  onClick={() => onSelect(conv.id)}
                  layout
                  role="button"
                  tabIndex={0}
                  className={cn(
                    'w-full flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all group cursor-pointer outline-none border relative overflow-hidden',
                    isActive
                      ? 'bg-[#00cfff]/10 border-[#00cfff]/35 shadow-[0_0_10px_rgba(0,207,255,0.12)]'
                      : 'hover:bg-white/[0.03] border-transparent'
                  )}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onSelect(conv.id);
                    }
                  }}
                >
                  {/* Cyber L-decorations for active chat */}
                  {isActive && (
                    <>
                      <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-[#00cfff]" />
                      <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-[#00cfff]" />
                    </>
                  )}

                  <MessageSquare className={cn(
                    'w-3.5 h-3.5 flex-shrink-0 mt-0.5',
                    isActive ? 'text-[#00cfff]' : 'text-[#8ab6d6]/60'
                  )} />
                  
                  <div className="flex-1 min-w-0">
                    {editingId === conv.id ? (
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onBlur={() => handleRename(conv.id)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRename(conv.id)
                          if (e.key === 'Escape') setEditingId(null)
                        }}
                        className="bg-[#041428] text-xs font-sans text-[#e8f7ff] border border-[#00cfff]/50 px-1 py-0.5 rounded outline-none w-full"
                        autoFocus
                      />
                    ) : (
                      <p 
                        onDoubleClick={(e) => {
                          e.stopPropagation()
                          startRename(conv.id, conv.title || '')
                        }}
                        className={cn(
                          'text-xs font-sans truncate',
                          isActive ? 'text-[#e8f7ff] font-semibold' : 'text-[#8ab6d6]'
                        )}
                        title="Double-click to rename"
                      >
                        {truncate(conv.title || 'New Chat', 28)}
                      </p>
                    )}
                    
                    <p className="text-[9px] font-mono text-[#8ab6d6]/40 mt-0.5 flex items-center gap-1">
                      <span>{conv.messages ? `${conv.messages.length} MSG` : '0 MSG'}</span>
                      <span>·</span>
                      <span className="truncate">
                        {formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true }).toUpperCase()}
                      </span>
                    </p>
                  </div>

                  {/* Actions (Rename/Delete) */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startRename(conv.id, conv.title || '')
                      }}
                      className="p-0.5 rounded text-[#8ab6d6]/55 hover:text-[#00cfff] transition-colors cursor-pointer"
                      title="Rename Session"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { 
                        e.stopPropagation();
                        if (confirm('Delete this session log?')) {
                          onDelete?.(conv.id);
                        }
                      }}
                      className="p-0.5 rounded text-[#8ab6d6]/55 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete Session"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2.5 border-t border-[#00cfff]/10">
        <p className="text-[9px] font-mono text-[#8ab6d6]/40 text-center uppercase tracking-widest">
          {conversations.length} SECURE SESSION{conversations.length !== 1 ? 'S' : ''} RECORDED
        </p>
      </div>
    </div>
  )
}
