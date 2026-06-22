import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { MobileNav } from './MobileNav'
import BriefingToast from './BriefingToast'
import { useUIStore } from '@/stores/uiStore'

export default function AppLayout() {
  const { sidebarCollapsed, activePage, setActivePage } = useUIStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const location = useLocation()

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  // Sync active page with route
  useEffect(() => {
    const path = location.pathname.split('/')[1] || 'dashboard'
    setActivePage(path)
  }, [location.pathname, setActivePage])

  // Close sidebar drawer on route change on mobile
  useEffect(() => {
    if (isMobile) setSidebarOpen(false)
  }, [location.pathname, isMobile])

  return (
    <div className="flex h-screen h-dvh bg-j-bg overflow-hidden relative">
      {/* Hex grid background */}
      <div className="j-hex-grid" aria-hidden="true" />
      {/* Scan line */}
      <div className="j-scan" aria-hidden="true" />

      {/* Cyber HUD corner decorations */}
      <div className="fixed top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#00cfff]/20 pointer-events-none z-45" />
      <div className="fixed top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#00cfff]/20 pointer-events-none z-45" />
      <div className="fixed bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#00cfff]/20 pointer-events-none z-45" />
      <div className="fixed bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#00cfff]/20 pointer-events-none z-45" />

      {/* ── DESKTOP SIDEBAR ── */}
      {!isMobile && (
        <Sidebar />
      )}

      {/* ── MOBILE SIDEBAR DRAWER ── */}
      {isMobile && sidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-j-void/80 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <aside className="fixed top-0 left-0 z-50 h-full w-[260px] bg-j-bg border-r border-j-cyan/20 overflow-y-auto">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </aside>
        </>
      )}

      {/* ── MAIN CONTENT ── */}
      <div
        className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative z-10 transition-all duration-300"
        style={{
          marginLeft: isMobile ? 0 : (sidebarCollapsed ? '72px' : 'var(--sidebar-width)'),
        }}
      >
        {/* Mobile top bar */}
        {isMobile ? (
          <div className="flex items-center justify-between px-4 py-3 border-b border-j-cyan/12 bg-j-bg/90 backdrop-blur-sm">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md border border-j-cyan/20 text-j-cyan hover:bg-j-cyan/8 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Open menu"
            >
              {/* Hamburger icon */}
              <div className="space-y-[5px]">
                <div className="w-4 h-[1.5px] bg-j-cyan" />
                <div className="w-3 h-[1.5px] bg-j-cyan" />
                <div className="w-4 h-[1.5px] bg-j-cyan" />
              </div>
            </button>
            <div className="j-font-mono text-xs tracking-[0.25em] text-j-cyan j-text-glow">
              A.R.I.S.E
            </div>
            <div className="w-[44px]" /> {/* Spacer for centering */}
          </div>
        ) : (
          <TopBar />
        )}

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

        {/* Mobile bottom nav */}
        {isMobile && <MobileNav />}
      </div>

      <BriefingToast />
    </div>
  )
}
