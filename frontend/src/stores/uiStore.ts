import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'dark' | 'light'

interface UIStore {
  // Theme
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void

  // Sidebar
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  setSidebarOpen: (open: boolean) => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void

  // Command Palette
  commandPaletteOpen: boolean
  setCommandPaletteOpen: (open: boolean) => void
  toggleCommandPalette: () => void

  // Search
  searchOpen: boolean
  setSearchOpen: (open: boolean) => void

  // Notifications panel
  notificationsPanelOpen: boolean
  setNotificationsPanelOpen: (open: boolean) => void

  // Active page
  activePage: string
  setActivePage: (page: string) => void

  // Quick capture
  quickCaptureValue: string
  setQuickCaptureValue: (value: string) => void

  // Loading states
  isPageLoading: boolean
  setIsPageLoading: (loading: boolean) => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      // Theme
      theme: 'dark',
      setTheme: (theme) => {
        set({ theme })
        applyTheme(theme)
      },
      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark'
        set({ theme: next })
        applyTheme(next)
      },

      // Sidebar
      sidebarOpen: true,
      sidebarCollapsed: false,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

      // Command Palette
      commandPaletteOpen: false,
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),

      // Search
      searchOpen: false,
      setSearchOpen: (open) => set({ searchOpen: open }),

      // Notifications
      notificationsPanelOpen: false,
      setNotificationsPanelOpen: (open) => set({ notificationsPanelOpen: open }),

      // Active page
      activePage: 'dashboard',
      setActivePage: (page) => set({ activePage: page }),

      // Quick capture
      quickCaptureValue: '',
      setQuickCaptureValue: (value) => set({ quickCaptureValue: value }),

      // Loading
      isPageLoading: false,
      setIsPageLoading: (loading) => set({ isPageLoading: loading }),
    }),
    {
      name: 'arise-ui',
      partialize: (state) => ({ theme: state.theme, sidebarCollapsed: state.sidebarCollapsed }),
    }
  )
)

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
    root.classList.remove('light')
  } else {
    root.classList.add('light')
    root.classList.remove('dark')
  }
}

// Initialize theme on load
const storedTheme = JSON.parse(localStorage.getItem('arise-ui') || '{}')?.state?.theme || 'dark'
applyTheme(storedTheme)
