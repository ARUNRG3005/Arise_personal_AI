import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, MessageSquare, CheckSquare, Calendar,
  Flame, BookOpen, FileText, FolderKanban, Wallet,
  Files, BarChart3, Settings, ChevronLeft, ChevronRight,
  Sparkles, Brain, Search,
} from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { useUserStore } from '@/stores/userStore'
import { cn } from '@/lib/utils'

const NAV_SECTIONS = [
  {
    label: 'Core',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
      { id: 'chat', label: 'AI Chat', icon: MessageSquare, path: '/chat', badge: 'AI' },
    ],
  },
  {
    label: 'Productivity',
    items: [
      { id: 'tasks', label: 'Tasks', icon: CheckSquare, path: '/tasks' },
      { id: 'calendar', label: 'Calendar', icon: Calendar, path: '/calendar' },
      { id: 'habits', label: 'Habits', icon: Flame, path: '/habits' },
      { id: 'projects', label: 'Projects', icon: FolderKanban, path: '/projects' },
    ],
  },
  {
    label: 'Personal',
    items: [
      { id: 'journal', label: 'Journal', icon: BookOpen, path: '/journal' },
      { id: 'notes', label: 'Notes', icon: FileText, path: '/notes' },
      { id: 'documents', label: 'Documents', icon: Files, path: '/documents' },
      { id: 'expenses', label: 'Expenses', icon: Wallet, path: '/expenses' },
    ],
  },
  {
    label: 'Insights',
    items: [
      { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' },
    ],
  },
]

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, setCommandPaletteOpen } = useUIStore()
  const { profile } = useUserStore()
  const location = useLocation()

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="fixed left-0 top-0 h-full z-30 flex flex-col glass border-r border-[color:var(--border-subtle)] overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-[color:var(--border-subtle)]">
        <div className="flex items-center gap-3 min-w-0">
          {/* Logo icon */}
          <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-glow-primary">
            <Sparkles className="w-5 h-5 text-white" />
          </div>

          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="min-w-0"
              >
                <span className="font-bold text-lg gradient-text tracking-tight">ARISE</span>
                <p className="text-[10px] text-[color:var(--text-tertiary)] font-medium -mt-0.5 uppercase tracking-widest">
                  Personal AI
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className={cn(
            'ml-auto p-1.5 rounded-lg hover:bg-white/10 transition-colors text-[color:var(--text-tertiary)] hover:text-[color:var(--text-primary)]',
            sidebarCollapsed && 'mx-auto'
          )}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Search / Command Palette trigger */}
      <div className="px-3 pt-3">
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className={cn(
            'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl',
            'text-[color:var(--text-tertiary)] hover:text-[color:var(--text-secondary)]',
            'bg-white/[0.03] hover:bg-white/[0.06] border border-[color:var(--border-subtle)]',
            'transition-all duration-200 text-sm',
            sidebarCollapsed && 'justify-center px-2'
          )}
        >
          <Search className="w-4 h-4 flex-shrink-0" />
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between w-full min-w-0"
              >
                <span className="text-xs truncate">Search or ask AI...</span>
                <kbd className="px-1.5 py-0.5 text-[10px] rounded-md bg-white/10 text-[color:var(--text-tertiary)] font-mono">
                  ⌘K
                </kbd>
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 scrollbar-hide">
        <div className="space-y-5">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-[10px] font-semibold uppercase tracking-widest text-[color:var(--text-muted)] px-3 mb-1.5"
                  >
                    {section.label}
                  </motion.p>
                )}
              </AnimatePresence>

              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive =
                    item.path === '/'
                      ? location.pathname === '/'
                      : location.pathname.startsWith(item.path)

                  const ItemIcon = item.icon

                  return (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      title={sidebarCollapsed ? item.label : undefined}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
                        'transition-all duration-200 cursor-pointer relative group',
                        sidebarCollapsed && 'justify-center px-2',
                        isActive
                          ? 'bg-primary-600/15 text-primary-300 border border-primary-500/20'
                          : 'text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] hover:bg-white/[0.04]'
                      )}
                    >
                      <ItemIcon
                        className={cn(
                          'w-[18px] h-[18px] flex-shrink-0',
                          isActive ? 'text-primary-400' : ''
                        )}
                      />

                      <AnimatePresence>
                        {!sidebarCollapsed && (
                          <motion.div
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -5 }}
                            transition={{ duration: 0.15 }}
                            className="flex items-center gap-2 flex-1 min-w-0"
                          >
                            <span className="truncate">{item.label}</span>
                            {'badge' in item && item.badge && (
                              <span className="badge badge-primary text-[10px] py-0.5 ml-auto">
                                {item.badge}
                              </span>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Active indicator dot (collapsed mode) */}
                      {isActive && sidebarCollapsed && (
                        <span className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary-400" />
                      )}
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Bottom — Memory indicator + Settings */}
      <div className="p-3 border-t border-[color:var(--border-subtle)] space-y-1">
        {/* Memory indicator */}
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-secondary-500/10 border border-secondary-500/15"
            >
              <Brain className="w-4 h-4 text-secondary-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-secondary-300">Memory Active</p>
                <p className="text-[10px] text-[color:var(--text-tertiary)] truncate">AI remembers your context</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings */}
        <NavLink
          to="/settings"
          title={sidebarCollapsed ? 'Settings' : undefined}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
              'transition-all duration-200',
              sidebarCollapsed && 'justify-center px-2',
              isActive
                ? 'bg-primary-600/15 text-primary-300'
                : 'text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] hover:bg-white/[0.04]'
            )
          }
        >
          <Settings className="w-[18px] h-[18px] flex-shrink-0" />
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </NavLink>

        {/* User Card */}
        <div className={cn(
          "flex items-center gap-2.5 px-3 py-2 rounded-xl border border-white/5 bg-white/[0.01] mt-1.5",
          sidebarCollapsed && "justify-center px-2"
        )}>
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold uppercase flex-shrink-0">
            {profile.name?.charAt(0) || 'U'}
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[color:var(--text-primary)] truncate">{profile.name || 'User'}</p>
              <p className="text-[9px] text-[color:var(--text-tertiary)] truncate uppercase tracking-wider">{profile.role || 'Other'}</p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  )
}
