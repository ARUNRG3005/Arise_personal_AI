import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Plus, Search, Calendar, Smile, Meh, Frown, Heart, Zap, Moon, Sun, Edit3, Trash2, Sparkles } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

type Mood = 'amazing' | 'good' | 'okay' | 'bad' | 'awful'

interface JournalEntry {
  id: string
  content: string
  mood: Mood
  tags: string[]
  createdAt: string
  title?: string
  aiSummary?: string
}

const MOOD_CONFIG: Record<Mood, { icon: string; label: string; color: string; bg: string }> = {
  amazing: { icon: '🤩', label: 'Amazing', color: 'text-success-400', bg: 'bg-success-500/15' },
  good: { icon: '😊', label: 'Good', color: 'text-primary-400', bg: 'bg-primary-500/15' },
  okay: { icon: '😐', label: 'Okay', color: 'text-warning-400', bg: 'bg-warning-500/15' },
  bad: { icon: '😔', label: 'Bad', color: 'text-orange-400', bg: 'bg-orange-500/15' },
  awful: { icon: '😞', label: 'Awful', color: 'text-error-400', bg: 'bg-error-500/15' },
}

const MOCK_ENTRIES: JournalEntry[] = [
  {
    id: '1',
    title: 'A productive morning',
    content: "Today was really productive. I managed to complete the AI orchestrator design and reviewed the Prisma schema. Feeling great about the progress on ARISE. The architecture is coming together nicely — the event bus pattern really simplifies everything.\n\nAlso hit the gym in the morning which set a great tone for the day.",
    mood: 'amazing',
    tags: ['productivity', 'coding', 'fitness'],
    createdAt: new Date().toISOString(),
    aiSummary: 'High productivity day with technical achievements and fitness.',
  },
  {
    id: '2',
    title: 'Reflecting on goals',
    content: "Took some time today to think about where I want to be in 6 months. I want to finish ARISE and launch it publicly. I also want to improve my fitness routine and read more consistently.\n\nSetting clearer goals helps with motivation.",
    mood: 'good',
    tags: ['goals', 'reflection'],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    aiSummary: 'Goal-setting session focused on ARISE launch and personal development.',
  },
  {
    id: '3',
    content: "Didn't sleep well. Feeling a bit scattered today. Struggled to focus during the afternoon. Might be time to review my sleep schedule.",
    mood: 'okay',
    tags: ['sleep', 'health'],
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
]

const PROMPTS = [
  "What are you grateful for today?",
  "What's one thing you learned today?",
  "What's on your mind right now?",
  "What went well? What could improve?",
  "How did you take care of yourself today?",
]

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>(MOCK_ENTRIES)
  const [isWriting, setIsWriting] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [newContent, setNewContent] = useState('')
  const [newMood, setNewMood] = useState<Mood>('good')
  const [search, setSearch] = useState('')
  const [todayPrompt] = useState(PROMPTS[Math.floor(Math.random() * PROMPTS.length)])

  const filtered = entries.filter(e =>
    e.content.toLowerCase().includes(search.toLowerCase()) ||
    e.title?.toLowerCase().includes(search.toLowerCase()) ||
    e.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  )

  const saveEntry = () => {
    if (!newContent.trim()) return
    const entry: JournalEntry = {
      id: Date.now().toString(),
      content: newContent.trim(),
      mood: newMood,
      tags: [],
      createdAt: new Date().toISOString(),
      title: newContent.split('\n')[0].slice(0, 50) || undefined,
    }
    setEntries(prev => [entry, ...prev])
    setNewContent('')
    setIsWriting(false)
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: entry list */}
      <div className="w-72 flex-shrink-0 border-r border-[color:var(--border-subtle)] flex flex-col bg-[color:var(--bg-surface)]/40 h-full overflow-hidden">
        <div className="p-4 border-b border-[color:var(--border-subtle)]">
          <button
            onClick={() => { setIsWriting(true); setSelectedEntry(null) }}
            className="w-full btn-primary flex items-center gap-2 text-sm py-2.5"
          >
            <Edit3 className="w-4 h-4" />
            New Entry
          </button>
          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--bg-card)]">
            <Search className="w-3.5 h-3.5 text-[color:var(--text-tertiary)]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search entries..."
              className="flex-1 bg-transparent text-xs text-[color:var(--text-primary)] placeholder-[color:var(--text-muted)] outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin py-2">
          {filtered.map(entry => {
            const mc = MOOD_CONFIG[entry.mood]
            return (
              <button
                key={entry.id}
                onClick={() => { setSelectedEntry(entry); setIsWriting(false) }}
                className={cn(
                  'w-full text-left px-4 py-3.5 border-b border-[color:var(--border-subtle)] hover:bg-white/[0.03] transition-colors',
                  selectedEntry?.id === entry.id && 'bg-primary-500/8'
                )}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg flex-shrink-0">{mc.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[color:var(--text-primary)] truncate">
                      {entry.title || entry.content.split('\n')[0].slice(0, 40)}
                    </p>
                    <p className="text-[10px] text-[color:var(--text-tertiary)] mt-0.5 flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5" />
                      {format(parseISO(entry.createdAt), 'MMM d, h:mm a')}
                    </p>
                    {entry.aiSummary && (
                      <p className="text-[10px] text-primary-400 mt-1 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        {entry.aiSummary.slice(0, 45)}…
                      </p>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
          {filtered.length === 0 && (
            <div className="text-center py-10 text-[color:var(--text-muted)]">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs">No entries found</p>
            </div>
          )}
        </div>
      </div>

      {/* Right: editor/viewer */}
      <div className="flex-1 overflow-y-auto p-8">
        <AnimatePresence mode="wait">
          {isWriting ? (
            <motion.div
              key="editor"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-[color:var(--text-muted)] mb-6">
                {format(new Date(), "EEEE, MMMM d, yyyy")}
              </p>

              {/* Today's prompt */}
              <div className="mb-6 px-4 py-3 rounded-xl bg-primary-500/8 border border-primary-500/20">
                <p className="text-xs text-primary-400 font-medium mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  Today's prompt
                </p>
                <p className="text-sm text-[color:var(--text-secondary)] italic">"{todayPrompt}"</p>
              </div>

              {/* Mood selector */}
              <div className="flex gap-2 mb-5">
                <p className="text-xs text-[color:var(--text-tertiary)] self-center mr-1">Mood:</p>
                {(Object.entries(MOOD_CONFIG) as [Mood, typeof MOOD_CONFIG[Mood]][]).map(([key, mc]) => (
                  <button
                    key={key}
                    onClick={() => setNewMood(key)}
                    title={mc.label}
                    className={cn(
                      'text-xl rounded-xl p-2 transition-all',
                      newMood === key ? cn('scale-110', mc.bg) : 'hover:scale-105 opacity-50'
                    )}
                  >
                    {mc.icon}
                  </button>
                ))}
              </div>

              {/* Editor */}
              <textarea
                autoFocus
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                placeholder="Write freely… your thoughts are safe here."
                className="w-full min-h-80 bg-transparent text-[color:var(--text-primary)] placeholder-[color:var(--text-muted)] outline-none resize-none text-base leading-relaxed"
              />

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-[color:var(--border-subtle)]">
                <p className="text-xs text-[color:var(--text-muted)]">{newContent.length} characters</p>
                <div className="flex gap-3">
                  <button onClick={() => setIsWriting(false)} className="btn-ghost text-sm px-4">Cancel</button>
                  <button onClick={saveEntry} disabled={!newContent.trim()} className="btn-primary text-sm px-5">
                    Save Entry
                  </button>
                </div>
              </div>
            </motion.div>
          ) : selectedEntry ? (
            <motion.div
              key={selectedEntry.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-2xl mx-auto"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-xs text-[color:var(--text-tertiary)] mb-2">
                    {format(parseISO(selectedEntry.createdAt), "EEEE, MMMM d, yyyy · h:mm a")}
                  </p>
                  <div className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium', MOOD_CONFIG[selectedEntry.mood].bg, MOOD_CONFIG[selectedEntry.mood].color)}>
                    <span>{MOOD_CONFIG[selectedEntry.mood].icon}</span>
                    <span>{MOOD_CONFIG[selectedEntry.mood].label}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 rounded-xl hover:bg-white/10 text-[color:var(--text-tertiary)] hover:text-[color:var(--text-primary)] transition-colors">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-xl hover:bg-error-500/15 text-[color:var(--text-tertiary)] hover:text-error-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {selectedEntry.aiSummary && (
                <div className="mb-5 px-4 py-3 rounded-xl bg-primary-500/8 border border-primary-500/20">
                  <p className="text-xs text-primary-400 font-medium mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    AI Summary
                  </p>
                  <p className="text-sm text-[color:var(--text-secondary)]">{selectedEntry.aiSummary}</p>
                </div>
              )}

              <div className="prose prose-sm prose-invert max-w-none text-[color:var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                {selectedEntry.content}
              </div>

              {selectedEntry.tags.length > 0 && (
                <div className="flex gap-2 mt-6 flex-wrap">
                  {selectedEntry.tags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 rounded-full text-xs bg-white/5 text-[color:var(--text-tertiary)]">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-center"
            >
              <BookOpen className="w-12 h-12 text-[color:var(--text-tertiary)] mb-4 opacity-40" />
              <p className="text-[color:var(--text-secondary)] font-medium">Select an entry or write a new one</p>
              <p className="text-sm text-[color:var(--text-tertiary)] mt-1">Your thoughts are waiting to be captured.</p>
              <button onClick={() => setIsWriting(true)} className="btn-primary mt-6 text-sm px-6">
                Write Today's Entry
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
