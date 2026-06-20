import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Plus, Search, Pin, Star, Trash2, Edit3, Tag, Grid3X3, List, Hash } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn, getColorForString, truncate } from '@/lib/utils'

interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  color: string
  pinned: boolean
  starred: boolean
  createdAt: string
  updatedAt: string
}

const MOCK_NOTES: Note[] = [
  { id: '1', title: 'ARISE Architecture Notes', content: '# ARISE Architecture\n\nThe system uses an Agent-based architecture where each domain has a specialized agent.\n\n## Key Components\n- Orchestrator\n- Memory Engine\n- Event Bus\n- Provider Factory\n\nThe AI should be the product, not just a feature.', tags: ['dev', 'architecture'], color: '#6366f1', pinned: true, starred: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '2', title: 'React 19 Features', content: 'React 19 brings exciting new features:\n\n- Server Components by default\n- Actions API\n- `use()` hook for promises\n- Improved Suspense\n- Form actions', tags: ['react', 'frontend'], color: '#06b6d4', pinned: false, starred: true, createdAt: new Date(Date.now() - 3600000).toISOString(), updatedAt: new Date(Date.now() - 3600000).toISOString() },
  { id: '3', title: 'Book Notes: Deep Work', content: 'Key insights from "Deep Work" by Cal Newport:\n\n1. Deep work is rare and valuable\n2. Schedule distraction, not focus\n3. Work deeply with intensity\n4. Drain the shallows', tags: ['books', 'productivity'], color: '#a855f7', pinned: false, starred: false, createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: '4', title: 'Weekly Goals', content: '- [ ] Finish dashboard UI\n- [ ] Write tests for API\n- [ ] Review PR from team\n- [ ] Plan next sprint\n- [x] Set up CI/CD', tags: ['goals', 'work'], color: '#10b981', pinned: true, starred: false, createdAt: new Date(Date.now() - 172800000).toISOString(), updatedAt: new Date().toISOString() },
  { id: '5', title: 'Groq API Tips', content: 'Groq API offers ultra-fast inference.\n\n```typescript\nconst completion = await groq.chat.completions.create({\n  model: "llama3-8b-8192",\n  messages: [...]\n})\n```\n\nStream responses for better UX.', tags: ['ai', 'api'], color: '#f59e0b', pinned: false, starred: false, createdAt: new Date(Date.now() - 259200000).toISOString(), updatedAt: new Date(Date.now() - 259200000).toISOString() },
]

function NoteCard({ note, isActive, onClick }: { note: Note; isActive: boolean; onClick: () => void }) {
  return (
    <motion.div
      layout
      onClick={onClick}
      className={cn(
        'card card-hover cursor-pointer relative group',
        isActive && 'border-primary-500/30 bg-primary-500/5',
        note.pinned && 'ring-1 ring-white/10'
      )}
      style={{ borderTopColor: note.color, borderTopWidth: 2 }}
    >
      <div className="flex items-start gap-2 mb-2">
        <h3 className="text-sm font-semibold text-[color:var(--text-primary)] flex-1 leading-snug">{note.title}</h3>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {note.pinned && <Pin className="w-3 h-3 text-primary-400" style={{ fill: 'currentColor' }} />}
          {note.starred && <Star className="w-3 h-3 text-warning-400" style={{ fill: 'currentColor' }} />}
        </div>
      </div>
      <p className="text-xs text-[color:var(--text-tertiary)] leading-relaxed line-clamp-3">
        {note.content.replace(/[#*`\[\]-]/g, '').trim()}
      </p>
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        {note.tags.map(tag => (
          <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-[color:var(--text-muted)]">#{tag}</span>
        ))}
      </div>
      <p className="text-[9px] text-[color:var(--text-muted)] mt-2">{format(parseISO(note.updatedAt), 'MMM d, h:mm a')}</p>
    </motion.div>
  )
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>(MOCK_NOTES)
  const [selected, setSelected] = useState<Note | null>(MOCK_NOTES[0])
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [editContent, setEditContent] = useState(MOCK_NOTES[0]?.content || '')
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const allTags = Array.from(new Set(notes.flatMap(n => n.tags)))

  const filtered = notes.filter(n => {
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase())
    const matchTag = !activeTag || n.tags.includes(activeTag)
    return matchSearch && matchTag
  })

  const pinned = filtered.filter(n => n.pinned)
  const unpinned = filtered.filter(n => !n.pinned)

  const handleSelect = (note: Note) => {
    setSelected(note)
    setEditContent(note.content)
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left sidebar */}
      <div className="w-64 flex-shrink-0 border-r border-[color:var(--border-subtle)] flex flex-col bg-[color:var(--bg-surface)]/40 h-full overflow-hidden">
        <div className="p-3 border-b border-[color:var(--border-subtle)] space-y-2">
          <button className="w-full btn-primary text-sm py-2.5 flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Note
          </button>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--bg-card)]">
            <Search className="w-3.5 h-3.5 text-[color:var(--text-tertiary)]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes..." className="flex-1 bg-transparent text-xs outline-none text-[color:var(--text-primary)] placeholder-[color:var(--text-muted)]" />
          </div>
        </div>

        {/* Tags */}
        <div className="px-3 py-2 border-b border-[color:var(--border-subtle)]">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[color:var(--text-muted)] mb-2">Tags</p>
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => setActiveTag(null)} className={cn('text-[10px] px-2 py-0.5 rounded-full transition-colors', !activeTag ? 'bg-primary-500/20 text-primary-300' : 'bg-white/5 text-[color:var(--text-tertiary)] hover:text-[color:var(--text-secondary)]')}>All</button>
            {allTags.map(tag => (
              <button key={tag} onClick={() => setActiveTag(tag === activeTag ? null : tag)} className={cn('text-[10px] px-2 py-0.5 rounded-full transition-colors', activeTag === tag ? 'bg-primary-500/20 text-primary-300' : 'bg-white/5 text-[color:var(--text-tertiary)] hover:text-[color:var(--text-secondary)]')}>#{tag}</button>
            ))}
          </div>
        </div>

        {/* Note list */}
        <div className="flex-1 overflow-y-auto scrollbar-thin py-2 px-2">
          {pinned.length > 0 && (
            <div className="mb-3">
              <p className="text-[9px] font-semibold uppercase tracking-widest text-[color:var(--text-muted)] px-2 mb-1.5 flex items-center gap-1">
                <Pin className="w-2.5 h-2.5" /> Pinned
              </p>
              {pinned.map(note => (
                <button key={note.id} onClick={() => handleSelect(note)} className={cn('w-full text-left px-2.5 py-2 rounded-xl mb-0.5 transition-colors', selected?.id === note.id ? 'bg-primary-500/10' : 'hover:bg-white/[0.03]')}>
                  <p className="text-xs font-medium text-[color:var(--text-primary)] truncate">{note.title}</p>
                  <p className="text-[10px] text-[color:var(--text-tertiary)] truncate mt-0.5">{note.content.slice(0, 40).replace(/[#*`]/g, '')}</p>
                </button>
              ))}
            </div>
          )}
          {unpinned.length > 0 && (
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-widest text-[color:var(--text-muted)] px-2 mb-1.5">All Notes</p>
              {unpinned.map(note => (
                <button key={note.id} onClick={() => handleSelect(note)} className={cn('w-full text-left px-2.5 py-2 rounded-xl mb-0.5 transition-colors', selected?.id === note.id ? 'bg-primary-500/10' : 'hover:bg-white/[0.03]')}>
                  <p className="text-xs font-medium text-[color:var(--text-primary)] truncate">{note.title}</p>
                  <p className="text-[10px] text-[color:var(--text-tertiary)] truncate mt-0.5">{note.content.slice(0, 40).replace(/[#*`]/g, '')}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: editor */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {selected ? (
          <>
            <div className="flex items-center gap-3 px-6 py-3.5 border-b border-[color:var(--border-subtle)]">
              <div className="flex-1">
                <input
                  className="w-full bg-transparent text-base font-semibold text-[color:var(--text-primary)] outline-none"
                  value={selected.title}
                  onChange={() => {}}
                />
                <p className="text-xs text-[color:var(--text-tertiary)] mt-0.5">{format(parseISO(selected.updatedAt), "MMM d, yyyy · h:mm a")}</p>
              </div>
              <div className="flex gap-1">
                <button className="p-2 rounded-xl hover:bg-white/10 text-[color:var(--text-tertiary)] hover:text-warning-400 transition-colors"><Star className="w-4 h-4" /></button>
                <button className="p-2 rounded-xl hover:bg-white/10 text-[color:var(--text-tertiary)] hover:text-primary-400 transition-colors"><Pin className="w-4 h-4" /></button>
                <button className="p-2 rounded-xl hover:bg-error-500/15 text-[color:var(--text-tertiary)] hover:text-error-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <textarea
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
              className="flex-1 bg-transparent text-[color:var(--text-primary)] text-sm leading-relaxed outline-none resize-none p-6 font-mono"
              placeholder="Start writing…"
            />
            <div className="flex gap-2 flex-wrap px-6 py-3 border-t border-[color:var(--border-subtle)]">
              {selected.tags.map(tag => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-[color:var(--text-tertiary)]">#{tag}</span>
              ))}
              <span className="text-[10px] text-[color:var(--text-muted)] ml-auto">{editContent.length} chars</span>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center">
            <div>
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-[color:var(--text-secondary)]">Select a note to view or edit</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
