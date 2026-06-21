import { useState } from 'react'
import { format, isAfter, isBefore } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Plus, X, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUserStore } from '@/stores/userStore'
import { toast } from 'react-hot-toast'

const SLOT_HEIGHT = 52 // px per hour

interface RoutineItem {
  id: string
  label: string
  emoji: string
  time: string
}

export default function DailyTimeline() {
  const now = new Date()
  const { profile, setProfile } = useUserStore()
  
  // Modal states
  const [isOpen, setIsOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<RoutineItem | null>(null)
  const [label, setLabel] = useState('')
  const [emoji, setEmoji] = useState('🏋️')
  const [time, setTime] = useState('08:00')

  // Dynamic timeline start and end based on wake and sleep hours
  const wakeHour = parseInt(profile.wakeTime?.split(':')[0]) || 7
  const sleepHour = parseInt(profile.sleepTime?.split(':')[0]) || 22
  const TIMELINE_START = Math.max(0, wakeHour - 1)
  const TIMELINE_END = Math.min(23, sleepHour + 1)
  const TOTAL_HOURS = TIMELINE_END - TIMELINE_START

  const HOUR_LABELS = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => TIMELINE_START + i)

  const currentHour = now.getHours() + now.getMinutes() / 60
  const isTimeInRange = currentHour >= TIMELINE_START && currentHour <= TIMELINE_END

  const dailyRoutine = profile.dailyRoutine || []
  
  const events = dailyRoutine.map((item, index) => {
    const [hours, minutes] = item.time.split(':').map(Number)
    const start = new Date()
    start.setHours(hours, minutes, 0, 0)
    
    // Default duration is 1 hour
    let end = new Date(start.getTime() + 60 * 60 * 1000)
    
    // If there is a next routine item, make the current block end when the next one starts (up to a max of 1.5 hours)
    const nextItem = dailyRoutine[index + 1]
    if (nextItem) {
      const [nextH, nextM] = nextItem.time.split(':').map(Number)
      const nextStart = new Date()
      nextStart.setHours(nextH, nextM, 0, 0)
      if (nextStart > start) {
        const diffMs = nextStart.getTime() - start.getTime()
        end = new Date(start.getTime() + Math.min(diffMs, 90 * 60 * 1000))
      }
    }

    // High fidelity color schemes matching the category
    let color = '#6366f1' // Default Indigo
    if (item.id === 'wake' || item.id === 'workout') color = '#10b981' // Green
    else if (item.id === 'sleep' || item.id === 'winddown') color = '#a855f7' // Purple
    else if (item.id === 'lunch' || item.id === 'dinner') color = '#f59e0b' // Amber
    else if (item.id === 'learning' || item.id === 'focus_morning') color = '#06b6d4' // Cyan

    return {
      id: item.id,
      title: `${item.emoji} ${item.label}`,
      start,
      end,
      color
    }
  })

  // Handle save/add routine item
  const handleSave = () => {
    if (!label.trim()) {
      toast.error('Label cannot be empty!')
      return
    }

    const newItem: RoutineItem = {
      id: editingItem ? editingItem.id : `custom-${Date.now()}`,
      label: label.trim(),
      emoji: emoji || '✨',
      time: time || '12:00'
    }

    let updatedRoutine = [...dailyRoutine]

    if (editingItem) {
      updatedRoutine = updatedRoutine.map(item => item.id === editingItem.id ? newItem : item)
      toast.success('Routine block updated!')
    } else {
      updatedRoutine.push(newItem)
      toast.success('Routine block added!')
    }

    // Sort chronologically by time
    updatedRoutine.sort((a, b) => a.time.localeCompare(b.time))

    // If updating wake up or sleep times specifically, synchronize those fields in profile too
    const updates: Partial<typeof profile> = { dailyRoutine: updatedRoutine }
    if (newItem.id === 'wake') updates.wakeTime = newItem.time
    if (newItem.id === 'sleep') updates.sleepTime = newItem.time

    setProfile(updates)
    setIsOpen(false)
    setEditingItem(null)
  }

  // Handle delete routine item
  const handleDelete = (id: string) => {
    if (id === 'wake' || id === 'sleep') {
      toast.error('Wake Up and Sleep times cannot be deleted, only edited.')
      return
    }

    const updatedRoutine = dailyRoutine.filter(item => item.id !== id)
    setProfile({ dailyRoutine: updatedRoutine })
    setIsOpen(false)
    setEditingItem(null)
    toast.success('Routine block removed!')
  }

  return (
    <div className="card h-full flex flex-col">
      <div className="section-header mb-4">
        <div>
          <h3 className="section-title">Daily Timeline</h3>
          <p className="section-subtitle">{format(new Date(), 'EEEE, MMM d')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingItem(null)
              setLabel('')
              setEmoji('🏋️')
              setTime('08:00')
              setIsOpen(true)
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-[color:var(--text-tertiary)] hover:text-white transition-colors"
            title="Add Routine Item"
          >
            <Plus className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 border-l border-white/5 pl-3">
            <Clock className="w-3.5 h-3.5 text-[color:var(--text-tertiary)]" />
            <span className="text-xs text-[color:var(--text-tertiary)]">{format(now, 'h:mm a')}</span>
          </div>
        </div>
      </div>

      {/* Timeline grid */}
      <div className="flex-1 relative overflow-y-auto scrollbar-thin pr-1 animate-fade-in" style={{ maxHeight: 440 }}>
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <Clock className="w-10 h-10 text-[color:var(--text-tertiary)] mb-3 opacity-30 animate-pulse" />
            <p className="text-sm text-[color:var(--text-secondary)]">No routine items set.</p>
            <p className="text-xs text-[color:var(--text-tertiary)] mt-1">Click the Plus icon to add a routine block.</p>
          </div>
        ) : (
          <div className="relative" style={{ height: `${TOTAL_HOURS * SLOT_HEIGHT}px` }}>
            {/* Hour lines */}
            {HOUR_LABELS.map((hour) => (
              <div
                key={hour}
                className="absolute left-0 right-0 flex items-center gap-2"
                style={{ top: `${(hour - TIMELINE_START) * SLOT_HEIGHT}px` }}
              >
                <span className="text-[10px] text-[color:var(--text-muted)] w-10 flex-shrink-0 text-right font-mono">
                  {hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour < 12 ? `${hour} AM` : `${hour - 12} PM`}
                </span>
                <div className="flex-1 border-t border-[color:var(--border-subtle)] border-dashed" />
              </div>
            ))}

            {/* Events */}
            <div className="absolute left-12 right-0 top-0 bottom-0">
              {events.map((event, index) => {
                const startH = event.start.getHours() + event.start.getMinutes() / 60
                const endH = event.end.getHours() + event.end.getMinutes() / 60
                
                // Position event, clamp within timeline start
                const top = Math.max(0, (startH - TIMELINE_START) * SLOT_HEIGHT)
                const height = Math.max((endH - startH) * SLOT_HEIGHT, 28)
                const isPast = isBefore(event.end, now)
                const isNow = isAfter(now, event.start) && isBefore(now, event.end)

                // Skip drawing if completely outside visible timeline
                if (startH > TIMELINE_END || endH < TIMELINE_START) return null

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * index }}
                    onClick={() => {
                      const originalItem = dailyRoutine.find(r => r.id === event.id)
                      if (originalItem) {
                        setEditingItem(originalItem)
                        setLabel(originalItem.label)
                        setEmoji(originalItem.emoji)
                        setTime(originalItem.time)
                        setIsOpen(true)
                      }
                    }}
                    className={cn(
                      'absolute left-1 right-1 rounded-lg px-2.5 py-1.5 cursor-pointer',
                      'border transition-all duration-200 hover:brightness-110 shadow-sm hover:shadow-md',
                      isPast && !isNow ? 'opacity-40' : 'opacity-100',
                      isNow ? 'ring-1 ring-white/20 shadow-lg' : ''
                    )}
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                      background: `${event.color}15`,
                      borderColor: `${event.color}35`,
                      borderLeft: `3px solid ${event.color}`,
                    }}
                  >
                    <p className="text-xs font-semibold truncate" style={{ color: event.color }}>
                      {event.title}
                    </p>
                    {height > 36 && (
                      <p className="text-[9px] font-medium text-[color:var(--text-secondary)] mt-0.5 font-mono">
                        {format(event.start, 'h:mm')} – {format(event.end, 'h:mm a')}
                      </p>
                    )}
                    {isNow && (
                      <span className="absolute top-1 right-1.5 text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm" style={{ background: event.color, color: '#fff' }}>
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
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsOpen(false)
                setEditingItem(null)
              }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#0c1020]/95 backdrop-blur-2xl p-6 shadow-2xl z-10"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  {editingItem ? 'Edit Routine Item' : 'Add Routine Item'}
                </h3>
                <button
                  onClick={() => {
                    setIsOpen(false)
                    setEditingItem(null)
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Emoji input */}
                <div>
                  <label className="text-[10px] font-semibold text-[color:var(--text-secondary)] uppercase tracking-wider block mb-1.5">Emoji Icon</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={2}
                      value={emoji}
                      onChange={e => setEmoji(e.target.value)}
                      className="w-12 px-2 py-2 rounded-xl bg-white/5 border border-white/10 text-center text-lg outline-none focus:border-primary-500/50"
                    />
                    <div className="flex gap-1.5 items-center flex-wrap">
                      {['🌅', '🏋️', '💼', '🥗', '📚', '🍽️', '🧘', '🌙'].map(em => (
                        <button
                          key={em}
                          type="button"
                          onClick={() => setEmoji(em)}
                          className={cn("w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/10 text-base transition-colors", emoji === em ? "bg-white/10 border border-primary-500/30" : "")}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Label input */}
                <div>
                  <label className="text-[10px] font-semibold text-[color:var(--text-secondary)] uppercase tracking-wider block mb-1.5">Label / Title</label>
                  <input
                    type="text"
                    value={label}
                    onChange={e => setLabel(e.target.value)}
                    placeholder="e.g. Morning Workout"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 outline-none focus:border-primary-500/50"
                  />
                </div>

                {/* Time input */}
                <div>
                  <label className="text-[10px] font-semibold text-[color:var(--text-secondary)] uppercase tracking-wider block mb-1.5">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={e => setTime(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0a0f1d] border border-white/10 text-xs text-white outline-none focus:border-primary-500/50 font-mono cursor-pointer"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2.5 mt-6 pt-4 border-t border-white/5">
                {editingItem && (
                  <button
                    onClick={() => handleDelete(editingItem.id)}
                    className="px-3.5 py-2.5 rounded-xl border border-rose-500/20 text-rose-400 hover:bg-rose-500/5 transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer"
                    title="Remove Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsOpen(false)
                    setEditingItem(null)
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 text-xs font-semibold cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-semibold cursor-pointer text-center"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
