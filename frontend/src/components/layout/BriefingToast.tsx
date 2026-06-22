import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getSocket } from '@/lib/socket'
import { speechSynthesis } from '@/services/voice/speechSynthesis'
import { Sparkles, Calendar, CheckSquare, Flame, X, Volume2 } from 'lucide-react'

interface BriefingData {
  time: string
  greeting: string
  motivation: string
  taskCount: number
  tasks: { title: string; priority: string }[]
  eventCount: number
  events: { title: string; time: string }[]
  topStreak: { name: string; count: number } | null
}

export default function BriefingToast() {
  const [briefing, setBriefing] = useState<BriefingData | null>(null)

  useEffect(() => {
    const socket = getSocket()

    const handleBriefing = (data: BriefingData) => {
      console.log('[Briefing] Received morning briefing:', data)
      setBriefing(data)

      // Synthesize spoken briefing
      let speakText = `${data.greeting}. You have ${data.taskCount} tasks due today.`
      if (data.eventCount > 0) {
        speakText += ` Your first event is "${data.events[0].title}" at ${data.events[0].time}.`
      } else {
        speakText += ` You have no events on your calendar today.`
      }
      if (data.topStreak) {
        speakText += ` Keep up your habit "${data.topStreak.name}" which is on a ${data.topStreak.count} day streak.`
      }
      speakText += ` ${data.motivation}`

      // Read aloud
      speechSynthesis.speak(speakText)
    }

    socket.on('morning_briefing', handleBriefing)

    return () => {
      socket.off('morning_briefing', handleBriefing)
    }
  }, [])

  // Auto-dismiss after 12 seconds
  useEffect(() => {
    if (!briefing) return
    const timer = setTimeout(() => {
      dismiss()
    }, 12000)
    return () => clearTimeout(timer)
  }, [briefing])

  const dismiss = () => {
    speechSynthesis.cancel()
    setBriefing(null)
  }

  return (
    <AnimatePresence>
      {briefing && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020d18]/90 backdrop-blur-md overflow-hidden font-sans"
        >
          {/* Sweeping scan line effect */}
          <div className="absolute inset-x-0 top-0 h-1 bg-[#00cfff]/15 z-0 animate-scan pointer-events-none" />

          {/* JARVIS Cyber Card */}
          <div
            onClick={dismiss}
            className="relative w-full max-w-2xl bg-[#041428] border border-[#00cfff]/30 rounded-2xl p-6 md:p-8 cursor-pointer shadow-glow-lg overflow-hidden group select-none z-10"
          >
            {/* L-shaped corner decorations */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00cfff]" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#00cfff]" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#00cfff]" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#00cfff]" />

            {/* Content header */}
            <div className="flex items-start justify-between border-b border-[#00cfff]/15 pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00cfff]/10 flex items-center justify-center text-[#00cfff] shadow-glow-sm">
                  <Volume2 className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-xs font-mono tracking-widest text-[#00cfff]/60 uppercase">System Intelligence Report</h2>
                  <p className="text-base font-bold text-[#e8f7ff]">{briefing.greeting}</p>
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); dismiss(); }} 
                className="p-1 rounded-lg text-[#00cfff]/60 hover:text-[#00cfff] hover:bg-[#00cfff]/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Motivation Quote */}
            <div className="mb-6 p-4 rounded-xl bg-[#00cfff]/5 border border-[#00cfff]/10">
              <p className="text-xs font-mono uppercase text-[#00cfff]/50 tracking-wider mb-1">Daily Directive</p>
              <p className="text-sm italic text-[#e8f7ff] font-medium">"{briefing.motivation}"</p>
            </div>

            {/* Grid for Tasks & Events */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
              {/* Tasks Column */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-[#00cfff] font-mono text-xs uppercase tracking-wider">
                  <CheckSquare className="w-4 h-4" />
                  <span>Tasks Today ({briefing.taskCount})</span>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {briefing.tasks.length === 0 ? (
                    <p className="text-xs text-[#00cfff]/45">No outstanding tasks for today.</p>
                  ) : (
                    briefing.tasks.map((task, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5 text-xs text-[#e8f7ff]">
                        <span className="truncate flex-1">{task.title}</span>
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 ml-2">
                          {task.priority}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Calendar Column */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-[#00cfff] font-mono text-xs uppercase tracking-wider">
                  <Calendar className="w-4 h-4" />
                  <span>Events Today ({briefing.eventCount})</span>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {briefing.events.length === 0 ? (
                    <p className="text-xs text-[#00cfff]/45">No schedule items today.</p>
                  ) : (
                    briefing.events.map((event, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5 text-xs text-[#e8f7ff]">
                        <span className="truncate flex-1">{event.title}</span>
                        <span className="text-[10px] font-mono text-[#00cfff] ml-2">
                          {event.time}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Bottom streak banner */}
            {briefing.topStreak && (
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#00cfff]/20 bg-[#00cfff]/5 text-xs text-[#e8f7ff]">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
                  <span>Streak Alert: <strong>{briefing.topStreak.name}</strong></span>
                </div>
                <span className="font-mono text-[#00cfff] text-sm font-bold">{briefing.topStreak.count} Days</span>
              </div>
            )}

            <div className="text-center mt-5 text-[10px] font-mono text-[#00cfff]/30 uppercase tracking-widest animate-pulse">
              Click anywhere to dismiss HUD overlay
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
