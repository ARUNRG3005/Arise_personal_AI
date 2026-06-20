import { format, addHours, startOfDay, isAfter, isBefore, addMinutes } from 'date-fns'
import { motion } from 'framer-motion'
import { MapPin, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

const MOCK_EVENTS = [
  { id: '1', title: 'Morning Routine', start: addHours(startOfDay(new Date()), 7), end: addHours(startOfDay(new Date()), 8), color: '#10b981', type: 'habit' },
  { id: '2', title: 'Deep Work: ARISE Dev', start: addHours(startOfDay(new Date()), 9), end: addHours(startOfDay(new Date()), 11), color: '#6366f1', type: 'task' },
  { id: '3', title: 'Team Standup', start: addHours(startOfDay(new Date()), 11), end: addMinutes(addHours(startOfDay(new Date()), 11), 30), color: '#a855f7', type: 'event' },
  { id: '4', title: 'Lunch Break', start: addHours(startOfDay(new Date()), 13), end: addHours(startOfDay(new Date()), 14), color: '#f59e0b', type: 'break' },
  { id: '5', title: 'Study Session', start: addHours(startOfDay(new Date()), 15), end: addHours(startOfDay(new Date()), 17), color: '#06b6d4', type: 'task' },
  { id: '6', title: 'Gym', start: addHours(startOfDay(new Date()), 18), end: addHours(startOfDay(new Date()), 19), color: '#f97316', type: 'habit' },
]

const HOUR_LABELS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
const TIMELINE_START = 7 // 7 AM
const TIMELINE_END = 21  // 9 PM
const TOTAL_HOURS = TIMELINE_END - TIMELINE_START
const SLOT_HEIGHT = 52 // px per hour

export default function DailyTimeline() {
  const now = new Date()
  const currentHour = now.getHours() + now.getMinutes() / 60
  const currentTop = Math.max(0, Math.min((currentHour - TIMELINE_START) / TOTAL_HOURS * 100, 100))
  const isTimeInRange = currentHour >= TIMELINE_START && currentHour <= TIMELINE_END

  return (
    <div className="card h-full flex flex-col">
      <div className="section-header mb-4">
        <div>
          <h3 className="section-title">Daily Timeline</h3>
          <p className="section-subtitle">{format(new Date(), 'EEEE, MMM d')}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[color:var(--text-tertiary)]" />
          <span className="text-xs text-[color:var(--text-tertiary)]">{format(now, 'h:mm a')}</span>
        </div>
      </div>

      {/* Timeline grid */}
      <div className="flex-1 relative overflow-y-auto scrollbar-thin pr-1" style={{ maxHeight: 440 }}>
        <div className="relative" style={{ height: `${TOTAL_HOURS * SLOT_HEIGHT}px` }}>
          {/* Hour lines */}
          {HOUR_LABELS.map((hour) => (
            <div
              key={hour}
              className="absolute left-0 right-0 flex items-center gap-2"
              style={{ top: `${(hour - TIMELINE_START) * SLOT_HEIGHT}px` }}
            >
              <span className="text-[10px] text-[color:var(--text-muted)] w-10 flex-shrink-0 text-right">
                {hour === 12 ? '12 PM' : hour < 12 ? `${hour} AM` : `${hour - 12} PM`}
              </span>
              <div className="flex-1 border-t border-[color:var(--border-subtle)] border-dashed" />
            </div>
          ))}

          {/* Events */}
          <div className="absolute left-12 right-0 top-0 bottom-0">
            {MOCK_EVENTS.map((event) => {
              const startH = event.start.getHours() + event.start.getMinutes() / 60
              const endH = event.end.getHours() + event.end.getMinutes() / 60
              const top = (startH - TIMELINE_START) * SLOT_HEIGHT
              const height = Math.max((endH - startH) * SLOT_HEIGHT, 28)
              const isPast = isBefore(event.end, now)
              const isNow = isAfter(now, event.start) && isBefore(now, event.end)

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * parseInt(event.id) }}
                  className={cn(
                    'absolute left-1 right-1 rounded-lg px-2.5 py-1.5 cursor-pointer',
                    'border transition-all duration-200 hover:brightness-110',
                    isPast && !isNow ? 'opacity-40' : 'opacity-100',
                    isNow ? 'ring-1 ring-white/20 shadow-lg' : ''
                  )}
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    background: `${event.color}20`,
                    borderColor: `${event.color}40`,
                    borderLeft: `3px solid ${event.color}`,
                  }}
                >
                  <p className="text-xs font-medium truncate" style={{ color: event.color }}>
                    {event.title}
                  </p>
                  {height > 38 && (
                    <p className="text-[10px] text-[color:var(--text-tertiary)]">
                      {format(event.start, 'h:mm')} – {format(event.end, 'h:mm a')}
                    </p>
                  )}
                  {isNow && (
                    <span className="absolute top-1 right-1.5 text-[9px] font-bold px-1 py-0.5 rounded" style={{ background: event.color, color: '#fff' }}>
                      NOW
                    </span>
                  )}
                </motion.div>
              )
            })}

            {/* Current time indicator */}
            {isTimeInRange && (
              <div
                className="absolute left-0 right-0 flex items-center gap-1 z-10 pointer-events-none"
                style={{ top: `${(currentHour - TIMELINE_START) * SLOT_HEIGHT}px` }}
              >
                <div className="w-2 h-2 rounded-full bg-error-400 flex-shrink-0 shadow-glow" />
                <div className="flex-1 h-px bg-error-400/60" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
