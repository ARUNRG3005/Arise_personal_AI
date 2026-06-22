import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster, toast } from 'react-hot-toast'
import { lazy, Suspense, useEffect } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import PageLoader from '@/components/shared/PageLoader'
import CommandPalette from '@/components/layout/CommandPalette'
import BriefingToast from '@/components/layout/BriefingToast'
import { useUIStore } from '@/stores/uiStore'
import { getSocket } from '@/lib/socket'

// Lazy loaded pages
const Dashboard = lazy(() => import('@/features/dashboard/DashboardPage'))
const ChatPage = lazy(() => import('@/features/chat/ChatPage'))
const TasksPage = lazy(() => import('@/features/tasks/TasksPage'))
const CalendarPage = lazy(() => import('@/features/calendar/CalendarPage'))
const HabitsPage = lazy(() => import('@/features/habits/HabitsPage'))
const JournalPage = lazy(() => import('@/features/journal/JournalPage'))
const NotesPage = lazy(() => import('@/features/notes/NotesPage'))
const ProjectsPage = lazy(() => import('@/features/projects/ProjectsPage'))
const ExpensesPage = lazy(() => import('@/features/expenses/ExpensesPage'))
const DocumentsPage = lazy(() => import('@/features/documents/DocumentsPage'))
const AnalyticsPage = lazy(() => import('@/features/analytics/AnalyticsPage'))
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage'))
const Onboarding = lazy(() => import('@/features/onboarding/OnboardingPage'))

export default function App() {
  const { theme, onboardingComplete } = useUIStore()

  // Connect Socket.IO and listen for notifications
  useEffect(() => {
    const socket = getSocket()
    
    // Listen for notification:new
    socket.on('notification:new', (notification: any) => {
      console.log('🔔 Received socket notification:', notification)
      toast(notification.body, {
        icon: '🔔',
        style: {
          background: '#1e1b4b',
          color: '#f9fafb',
          border: '1px solid rgba(129, 140, 248, 0.3)',
        }
      })
    })

    return () => {
      socket.off('notification:new')
    }
  }, [])

  // Apply theme on mount
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
    }
  }, [theme])

  return (
    <BrowserRouter>
      {/* Global Command Palette */}
      <CommandPalette />

      {/* Morning Briefing Toast Overlay */}
      <BriefingToast />

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#111827',
            color: '#f9fafb',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '0.75rem',
            fontSize: '0.875rem',
            fontFamily: 'Inter, sans-serif',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#111827' },
          },
          error: {
            iconTheme: { primary: '#f43f5e', secondary: '#111827' },
          },
        }}
      />

      <Routes>
        {/* Onboarding route */}
        <Route path="/onboarding" element={
          <Suspense fallback={<PageLoader />}> 
            <Onboarding />
          </Suspense>
        } />
        <Route path="/" element={onboardingComplete ? <AppLayout /> : <Navigate to="/onboarding" replace />}>
          <Route
            index
            element={
              <Suspense fallback={<PageLoader />}>
                <Dashboard />
              </Suspense>
            }
          />
          <Route
            path="chat"
            element={
              <Suspense fallback={<PageLoader />}>
                <ChatPage />
              </Suspense>
            }
          />
          <Route
            path="chat/:conversationId"
            element={
              <Suspense fallback={<PageLoader />}>
                <ChatPage />
              </Suspense>
            }
          />
          <Route
            path="tasks"
            element={
              <Suspense fallback={<PageLoader />}>
                <TasksPage />
              </Suspense>
            }
          />
          <Route
            path="calendar"
            element={
              <Suspense fallback={<PageLoader />}>
                <CalendarPage />
              </Suspense>
            }
          />
          <Route
            path="habits"
            element={
              <Suspense fallback={<PageLoader />}>
                <HabitsPage />
              </Suspense>
            }
          />
          <Route
            path="journal"
            element={
              <Suspense fallback={<PageLoader />}>
                <JournalPage />
              </Suspense>
            }
          />
          <Route
            path="notes"
            element={
              <Suspense fallback={<PageLoader />}>
                <NotesPage />
              </Suspense>
            }
          />
          <Route
            path="projects"
            element={
              <Suspense fallback={<PageLoader />}>
                <ProjectsPage />
              </Suspense>
            }
          />
          <Route
            path="expenses"
            element={
              <Suspense fallback={<PageLoader />}>
                <ExpensesPage />
              </Suspense>
            }
          />
          <Route
            path="documents"
            element={
              <Suspense fallback={<PageLoader />}>
                <DocumentsPage />
              </Suspense>
            }
          />
          <Route
            path="analytics"
            element={
              <Suspense fallback={<PageLoader />}>
                <AnalyticsPage />
              </Suspense>
            }
          />
          <Route
            path="settings"
            element={
              <Suspense fallback={<PageLoader />}>
                <SettingsPage />
              </Suspense>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
