import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, LayoutDashboard, MessageSquare, CheckSquare, Calendar,
  Flame, BookOpen, FileText, FolderKanban, Wallet, Files,
  BarChart3, Settings, Plus, Sparkles, ArrowRight, Clock,
} from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils'

const NAVIGATION_ITEMS = [
  { id: 'nav-dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/', group: 'Navigate' },
  { id: 'nav-chat', label: 'AI Chat', icon: MessageSquare, path: '/chat', group: 'Navigate' },
  { id: 'nav-tasks', label: 'Tasks', icon: CheckSquare, path: '/tasks', group: 'Navigate' },
  { id: 'nav-calendar', label: 'Calendar', icon: Calendar, path: '/calendar', group: 'Navigate' },
  { id: 'nav-habits', label: 'Habits', icon: Flame, path: '/habits', group: 'Navigate' },
  { id: 'nav-journal', label: 'Journal', icon: BookOpen, path: '/journal', group: 'Navigate' },
  { id: 'nav-notes', label: 'Notes', icon: FileText, path: '/notes', group: 'Navigate' },
  { id: 'nav-projects', label: 'Projects', icon: FolderKanban, path: '/projects', group: 'Navigate' },
  { id: 'nav-expenses', label: 'Expenses', icon: Wallet, path: '/expenses', group: 'Navigate' },
  { id: 'nav-documents', label: 'Documents', icon: Files, path: '/documents', group: 'Navigate' },
  { id: 'nav-analytics', label: 'Analytics', icon: BarChart3, path: '/analytics', group: 'Navigate' },
  { id: 'nav-settings', label: 'Settings', icon: Settings, path: '/settings', group: 'Navigate' },
]

const QUICK_ACTIONS = [
  { id: 'qa-task', label: 'Create Task', icon: Plus, action: 'create-task', group: 'Quick Actions' },
  { id: 'qa-event', label: 'Add Calendar Event', icon: Calendar, action: 'create-event', group: 'Quick Actions' },
  { id: 'qa-note', label: 'New Note', icon: FileText, action: 'create-note', group: 'Quick Actions' },
  { id: 'qa-journal', label: 'Write Journal Entry', icon: BookOpen, action: 'create-journal', group: 'Quick Actions' },
]

const RECENT_PAGES = [
  { id: 'recent-dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/', group: 'Recent' },
  { id: 'recent-chat', label: 'AI Chat', icon: MessageSquare, path: '/chat', group: 'Recent' },
]

export default function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setCommandPaletteOpen])

  // Focus input when opened
  useEffect(() => {
    if (commandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
      setQuery('')
      setSelectedIndex(0)
    }
  }, [commandPaletteOpen])

  const close = useCallback(() => {
    setCommandPaletteOpen(false)
    setQuery('')
  }, [setCommandPaletteOpen])

  // Filter items
  const isAIQuery = query.startsWith('?') || query.startsWith('/')
  const filtered = query && !isAIQuery
    ? NAVIGATION_ITEMS.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()))
    : query
    ? []
    : [...QUICK_ACTIONS, ...RECENT_PAGES, ...NAVIGATION_ITEMS]

  // Group items
  const groups: Record<string, typeof filtered> = {}
  for (const item of filtered) {
    const g = item.group
    groups[g] = groups[g] || []
    groups[g].push(item)
  }

  const flatItems = filtered
  const totalItems = flatItems.length

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => (i + 1) % Math.max(totalItems, 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => (i - 1 + Math.max(totalItems, 1)) % Math.max(totalItems, 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (isAIQuery && query) {
        navigate('/chat')
        close()
      } else if (flatItems[selectedIndex]) {
        handleSelect(flatItems[selectedIndex])
      }
    }
  }

  const handleSelect = (item: (typeof flatItems)[0]) => {
    if ('path' in item) {
      navigate(item.path)
    } else if ('action' in item) {
      const paths: Record<string, string> = {
        'create-task': '/tasks',
        'create-event': '/calendar',
        'create-note': '/notes',
        'create-journal': '/journal',
      }
      navigate(paths[item.action] || '/')
    }
    close()
  }

  const handleAISearch = () => {
    if (query) {
      navigate(`/chat?q=${encodeURIComponent(query.replace(/^[?/]/, ''))}`)
      close()
    }
  }

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 cmd-overlay"
            onClick={close}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 z-50 w-full max-w-xl cmd-palette rounded-2xl shadow-glass-lg overflow-hidden"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[color:var(--border-subtle)]">
              {isAIQuery ? (
                <Sparkles className="w-4 h-4 text-primary-400 flex-shrink-0" />
              ) : (
                <Search className="w-4 h-4 text-[color:var(--text-tertiary)] flex-shrink-0" />
              )}
              <input
                ref={inputRef}
                id="command-palette-input"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0) }}
                onKeyDown={handleKeyDown}
                placeholder="Search or ask AI… (type ? to ask)"
                className="flex-1 bg-transparent text-[color:var(--text-primary)] placeholder-[color:var(--text-tertiary)] outline-none text-sm"
              />
              <kbd className="px-1.5 py-0.5 text-[10px] rounded bg-white/10 text-[color:var(--text-tertiary)] font-mono flex-shrink-0">
                ESC
              </kbd>
            </div>

            {/* AI query hint */}
            {isAIQuery && query.length > 1 && (
              <button
                onClick={handleAISearch}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-500/10 transition-colors border-b border-[color:var(--border-subtle)] group"
              >
                <div className="w-7 h-7 rounded-lg bg-primary-600/20 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-primary-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm text-[color:var(--text-primary)] font-medium">
                    Ask AI: "{query.slice(1)}"
                  </p>
                  <p className="text-xs text-[color:var(--text-tertiary)]">Open AI Chat with this question</p>
                </div>
                <ArrowRight className="w-4 h-4 text-[color:var(--text-tertiary)] group-hover:text-primary-400 transition-colors" />
              </button>
            )}

            {/* Results */}
            <div className="max-h-80 overflow-y-auto py-2 scrollbar-thin">
              {Object.entries(groups).map(([group, items]) => (
                <div key={group}>
                  <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-[color:var(--text-muted)]">
                    {group}
                  </p>
                  {items.map((item, i) => {
                    const globalIndex = flatItems.indexOf(item)
                    const isSelected = globalIndex === selectedIndex
                    const ItemIcon = item.icon
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                          isSelected
                            ? 'bg-primary-500/12 text-[color:var(--text-primary)]'
                            : 'text-[color:var(--text-secondary)] hover:bg-white/[0.04]'
                        )}
                      >
                        <div className={cn(
                          'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
                          isSelected ? 'bg-primary-600/25' : 'bg-white/[0.05]'
                        )}>
                          <ItemIcon className={cn(
                            'w-3.5 h-3.5',
                            isSelected ? 'text-primary-400' : 'text-[color:var(--text-tertiary)]'
                          )} />
                        </div>
                        <span className="flex-1 text-left truncate">{item.label}</span>
                        {isSelected && (
                          <ArrowRight className="w-3.5 h-3.5 text-primary-400" />
                        )}
                      </button>
                    )
                  })}
                </div>
              ))}

              {!isAIQuery && query && filtered.length === 0 && (
                <div className="px-4 py-8 text-center">
                  <p className="text-sm text-[color:var(--text-tertiary)]">No results for "{query}"</p>
                  <button
                    onClick={handleAISearch}
                    className="mt-2 text-xs text-primary-400 hover:text-primary-300"
                  >
                    Ask AI instead →
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-[color:var(--border-subtle)] flex items-center gap-4 text-[10px] text-[color:var(--text-muted)]">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-white/10 font-mono">↑↓</kbd> navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-white/10 font-mono">↵</kbd> select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 rounded bg-white/10 font-mono">?</kbd> ask AI
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
