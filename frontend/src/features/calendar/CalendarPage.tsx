import { useState } from 'react'
import { motion } from 'framer-motion'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, getDay, isToday } from 'date-fns'
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CalEvent {
  id: string
  title: string
  start: Date
  end: Date
  color: string
  location?: string
  type: 'task' | 'event' | 'habit' | 'reminder'
}

const MOCK_EVENTS: CalEvent[] = [
  { id: '1', title: 'Team Standup', start: new Date(), end: new Date(), color: '#6366f1', type: 'event', location: 'Google Meet' },
  { id: '2', title: 'Gym', start: new Date(), end: new Date(), color: '#10b981', type: 'habit' },
  { id: '3', title: 'Doctor Appointment', start: new Date(Date.now() + 2 * 86400000), end: new Date(Date.now() + 2 * 86400000), color: '#f43f5e', type: 'event', location: 'Apollo Hospital' },
  { id: '4', title: 'Deploy ARISE', start: new Date(Date.now() + 5 * 86400000), end: new Date(Date.now() + 5 * 86400000), color: '#a855f7', type: 'task' },
  { id: '5', title: 'Birthday Party', start: new Date(Date.now() + 8 * 86400000), end: new Date(Date.now() + 8 * 86400000), color: '#f59e0b', type: 'event' },
]

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week'>('month')

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPad = getDay(monthStart) // 0 = Sunday

  const eventsOnDay = (day: Date) => MOCK_EVENTS.filter(e => isSameDay(e.start, day))
  const selectedEvents = eventsOnDay(selectedDate)

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-[color:var(--text-primary)]">Calendar</h1>
          <div className="flex items-center gap-1 rounded-xl border border-[color:var(--border-subtle)] overflow-hidden">
            {(['month', 'week'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} className={cn('px-3 py-1.5 text-xs font-medium transition-colors capitalize', view === v ? 'bg-primary-600/20 text-primary-300' : 'text-[color:var(--text-tertiary)] hover:text-[color:var(--text-secondary)]')}>
                {v}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="p-2 rounded-xl hover:bg-white/10 text-[color:var(--text-tertiary)] hover:text-[color:var(--text-primary)] transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setCurrentMonth(new Date())} className="px-3 py-1.5 rounded-xl text-xs font-medium text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] hover:bg-white/8 transition-colors">
              Today
            </button>
            <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="p-2 rounded-xl hover:bg-white/10 text-[color:var(--text-tertiary)] hover:text-[color:var(--text-primary)] transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <span className="text-sm font-semibold text-[color:var(--text-primary)]">{format(currentMonth, 'MMMM yyyy')}</span>
          <button className="btn-primary text-sm px-4 py-2 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Event
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Calendar grid */}
        <div className="col-span-12 lg:col-span-8 card overflow-hidden">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {WEEKDAYS.map(d => (
              <div key={d} className="text-center text-[10px] font-semibold uppercase tracking-widest text-[color:var(--text-muted)] py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-px">
            {/* Empty cells for padding */}
            {Array.from({ length: startPad }).map((_, i) => (
              <div key={`pad-${i}`} className="aspect-square" />
            ))}

            {days.map(day => {
              const dayEvents = eventsOnDay(day)
              const isSelected = isSameDay(day, selectedDate)
              const isCurrent = isToday(day)
              const isOtherMonth = !isSameMonth(day, currentMonth)

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    'aspect-square rounded-xl flex flex-col items-center justify-start p-1.5 transition-all duration-200 group relative',
                    isSelected ? 'bg-primary-600/20 border border-primary-500/30' : 'hover:bg-white/[0.04]',
                    isOtherMonth && 'opacity-30',
                  )}
                >
                  <span className={cn(
                    'text-xs font-medium w-6 h-6 rounded-full flex items-center justify-center transition-colors',
                    isCurrent ? 'bg-primary-600 text-white font-bold' : isSelected ? 'text-primary-300' : 'text-[color:var(--text-secondary)]'
                  )}>
                    {format(day, 'd')}
                  </span>
                  <div className="flex gap-0.5 flex-wrap justify-center mt-1">
                    {dayEvents.slice(0, 3).map(e => (
                      <span key={e.id} className="w-1.5 h-1.5 rounded-full" style={{ background: e.color }} />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[8px] text-[color:var(--text-muted)]">+{dayEvents.length - 3}</span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Selected day panel */}
        <div className="col-span-12 lg:col-span-4 card">
          <h3 className="text-sm font-semibold text-[color:var(--text-primary)] mb-1">{format(selectedDate, 'EEEE, MMMM d')}</h3>
          <p className="text-xs text-[color:var(--text-tertiary)] mb-4">{selectedEvents.length || 'No'} events</p>

          <div className="space-y-2">
            {selectedEvents.length > 0 ? selectedEvents.map(ev => (
              <div key={ev.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors" style={{ borderLeft: `3px solid ${ev.color}` }}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[color:var(--text-primary)] truncate">{ev.title}</p>
                  {ev.location && (
                    <p className="text-xs text-[color:var(--text-tertiary)] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {ev.location}
                    </p>
                  )}
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full text-[color:var(--text-muted)] bg-white/5 capitalize">{ev.type}</span>
              </div>
            )) : (
              <div className="text-center py-8">
                <p className="text-sm text-[color:var(--text-tertiary)]">No events today</p>
                <button className="mt-3 btn-ghost text-xs flex items-center gap-1.5 mx-auto">
                  <Plus className="w-3.5 h-3.5" /> Add Event
                </button>
              </div>
            )}
          </div>

          {/* Upcoming events */}
          <div className="mt-5 pt-4 border-t border-[color:var(--border-subtle)]">
            <p className="text-xs font-semibold text-[color:var(--text-muted)] uppercase tracking-widest mb-3">Upcoming</p>
            <div className="space-y-2">
              {MOCK_EVENTS.filter(e => e.start > new Date()).slice(0, 3).map(ev => (
                <div key={ev.id} className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: ev.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[color:var(--text-secondary)] truncate">{ev.title}</p>
                    <p className="text-[10px] text-[color:var(--text-muted)]">{format(ev.start, 'MMM d')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
