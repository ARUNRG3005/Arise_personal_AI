import { Bell, Sun, Moon, Search, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { useUIStore } from '@/stores/uiStore'
import { useLocation } from 'react-router-dom'
import { cn, getGreeting } from '@/lib/utils'

const PAGE_TITLES: Record<string, { title: string; subtitle?: string }> = {
  '': { title: 'Dashboard', subtitle: getGreeting() + ' 👋' },
  'chat': { title: 'AI Chat', subtitle: 'Powered by ARISE Intelligence' },
  'tasks': { title: 'Tasks', subtitle: 'Stay on top of your work' },
  'calendar': { title: 'Calendar', subtitle: 'Your schedule at a glance' },
  'habits': { title: 'Habits', subtitle: 'Build better routines' },
  'journal': { title: 'Journal', subtitle: 'Reflect and grow' },
  'notes': { title: 'Notes', subtitle: 'Capture your thoughts' },
  'projects': { title: 'Projects', subtitle: 'Track your builds' },
  'expenses': { title: 'Expenses', subtitle: 'Money in, money out' },
  'documents': { title: 'Documents', subtitle: 'Your knowledge base' },
  'analytics': { title: 'Analytics', subtitle: 'Your performance insights' },
  'settings': { title: 'Settings', subtitle: 'Customize your experience' },
}

export default function TopBar() {
  const { theme, toggleTheme, setCommandPaletteOpen, setNotificationsPanelOpen } = useUIStore()
  const location = useLocation()
  const pageKey = location.pathname.split('/')[1] || ''
  const pageInfo = PAGE_TITLES[pageKey] || { title: 'ARISE' }

  return (
    <header
      className="h-16 flex items-center gap-4 px-6 border-b border-[color:var(--border-subtle)]"
      style={{ background: 'rgba(var(--bg-surface), 0.6)', backdropFilter: 'blur(20px)' }}
    >
      {/* Page title */}
      <div className="flex-1 min-w-0">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <h1 className="text-base font-semibold text-[color:var(--text-primary)] truncate">
            {pageInfo.title}
          </h1>
          {pageInfo.subtitle && (
            <p className="text-xs text-[color:var(--text-tertiary)] truncate">
              {pageInfo.subtitle}
            </p>
          )}
        </motion.div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {/* Search */}
        <button
          id="topbar-search-btn"
          onClick={() => setCommandPaletteOpen(true)}
          className="btn-ghost flex items-center gap-2 text-sm"
          aria-label="Open search"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:block text-[color:var(--text-tertiary)] text-xs">Search...</span>
          <kbd className="hidden sm:block px-1.5 py-0.5 text-[10px] rounded bg-white/10 text-[color:var(--text-tertiary)] font-mono">
            ⌘K
          </kbd>
        </button>

        {/* AI Quick Action */}
        <button
          id="topbar-ai-btn"
          onClick={() => setCommandPaletteOpen(true)}
          className="p-2 rounded-xl hover:bg-primary-500/15 transition-all duration-200 group"
          aria-label="Ask AI"
          title="Ask AI (⌘K)"
        >
          <Sparkles className="w-4 h-4 text-[color:var(--text-tertiary)] group-hover:text-primary-400 transition-colors" />
        </button>

        {/* Theme toggle */}
        <button
          id="topbar-theme-btn"
          onClick={toggleTheme}
          className="p-2 rounded-xl hover:bg-white/[0.06] transition-all duration-200 group"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          <motion.div
            key={theme}
            initial={{ rotate: -20, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[color:var(--text-tertiary)] group-hover:text-warning-400 transition-colors" />
            ) : (
              <Moon className="w-4 h-4 text-[color:var(--text-tertiary)] group-hover:text-primary-400 transition-colors" />
            )}
          </motion.div>
        </button>

        {/* Notifications */}
        <button
          id="topbar-notifications-btn"
          onClick={() => setNotificationsPanelOpen(true)}
          className="relative p-2 rounded-xl hover:bg-white/[0.06] transition-all duration-200 group"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4 text-[color:var(--text-tertiary)] group-hover:text-[color:var(--text-primary)] transition-colors" />
          {/* Unread dot */}
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary-500" />
        </button>

        {/* User avatar */}
        <div
          className={cn(
            'w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center',
            'text-white text-xs font-bold cursor-pointer hover:opacity-80 transition-opacity',
            'shadow-glow-primary ml-1'
          )}
          title="Profile"
        >
          U
        </div>
      </div>
    </header>
  )
}
