import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { useUIStore } from '@/stores/uiStore'

export default function AppLayout() {
  const { sidebarCollapsed, activePage, setActivePage } = useUIStore()
  const location = useLocation()

  // Sync active page with route
  useEffect(() => {
    const path = location.pathname.split('/')[1] || 'dashboard'
    setActivePage(path)
  }, [location.pathname, setActivePage])

  return (
    <div className="flex h-screen overflow-hidden bg-[color:var(--bg-base)] bg-mesh">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div
        className="flex flex-col flex-1 overflow-hidden transition-all duration-300"
        style={{
          marginLeft: sidebarCollapsed ? '72px' : 'var(--sidebar-width)',
        }}
      >
        {/* Top bar */}
        <TopBar />

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
