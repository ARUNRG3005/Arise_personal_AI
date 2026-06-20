import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Loader2, CheckCircle2, Calendar, FileText, BookOpen, Wallet, Bell, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const PLACEHOLDER_EXAMPLES = [
  'Buy groceries tomorrow',
  'Meeting with team at 3pm',
  'I feel motivated today',
  'Spent ₹450 on lunch',
  'Remind me to call mom',
  'Note: Research React 19',
  'Goal: Finish ARISE by July',
]

const CLASSIFICATION_ICONS = {
  task: { icon: CheckCircle2, label: 'Task', color: 'text-primary-400', bg: 'bg-primary-500/15' },
  event: { icon: Calendar, label: 'Event', color: 'text-accent-400', bg: 'bg-accent-500/15' },
  note: { icon: FileText, label: 'Note', color: 'text-secondary-400', bg: 'bg-secondary-500/15' },
  journal: { icon: BookOpen, label: 'Journal', color: 'text-success-400', bg: 'bg-success-500/15' },
  expense: { icon: Wallet, label: 'Expense', color: 'text-warning-400', bg: 'bg-warning-500/15' },
  reminder: { icon: Bell, label: 'Reminder', color: 'text-orange-400', bg: 'bg-orange-500/15' },
}

type Classification = keyof typeof CLASSIFICATION_ICONS

function classifyInput(text: string): Classification {
  const lower = text.toLowerCase()
  if (lower.match(/₹|\$|spent|paid|bought|cost|expense|income|earned/)) return 'expense'
  if (lower.match(/feel|feeling|mood|happy|sad|anxious|tired|motivated|energy/)) return 'journal'
  if (lower.match(/remind|reminder|don't forget|remember to/)) return 'reminder'
  if (lower.match(/note:|note -|write down|idea:|idea -/)) return 'note'
  if (lower.match(/meeting|call|event|appointment|schedule|at \d|tomorrow at|today at|pm|am/)) return 'event'
  return 'task'
}

export default function QuickCapture() {
  const [value, setValue] = useState('')
  const [classification, setClassification] = useState<Classification | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [placeholder, setPlaceholder] = useState(PLACEHOLDER_EXAMPLES[0])
  const inputRef = useRef<HTMLInputElement>(null)
  let placeholderInterval: ReturnType<typeof setInterval>

  // Cycle placeholders
  useEffect(() => {
    let i = 0
    placeholderInterval = setInterval(() => {
      i = (i + 1) % PLACEHOLDER_EXAMPLES.length
      setPlaceholder(PLACEHOLDER_EXAMPLES[i])
    }, 3000)
    return () => clearInterval(placeholderInterval)
  }, [])

  // Classify on change
  useEffect(() => {
    if (value.trim().length > 3) {
      setClassification(classifyInput(value))
    } else {
      setClassification(null)
    }
  }, [value])

  const handleSubmit = async () => {
    if (!value.trim() || isProcessing) return
    setIsProcessing(true)
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 800))
    setIsProcessing(false)
    setIsDone(true)
    setTimeout(() => {
      setIsDone(false)
      setValue('')
      setClassification(null)
    }, 1500)
  }

  const cls = classification ? CLASSIFICATION_ICONS[classification] : null

  return (
    <div className="card gradient-border relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary-600/3 to-secondary-600/3 pointer-events-none" />

      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-widest text-[color:var(--text-muted)] mb-3">
          Quick Capture
        </p>

        <div className="flex items-center gap-3">
          {/* AI indicator */}
          <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-glow-primary">
            {isProcessing ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : isDone ? (
              <CheckCircle2 className="w-4 h-4 text-white" />
            ) : (
              <Sparkles className="w-4 h-4 text-white" />
            )}
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            id="quick-capture-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-sm text-[color:var(--text-primary)] placeholder-[color:var(--text-muted)] outline-none"
            disabled={isProcessing || isDone}
          />

          {/* Classification badge */}
          <AnimatePresence>
            {cls && value && (() => {
              const ClsIcon = cls.icon
              return (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, x: 10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: 10 }}
                  className={cn('flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium flex-shrink-0', cls.bg)}
                >
                  <ClsIcon className={cn('w-3.5 h-3.5', cls.color)} />
                  <span className={cls.color}>{cls.label}</span>
                </motion.div>
              )
            })()}
          </AnimatePresence>

          {/* Submit */}
          {value && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleSubmit}
              disabled={isProcessing || isDone}
              className="p-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white transition-colors flex-shrink-0"
            >
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          )}
        </div>

        {/* Hint */}
        <AnimatePresence>
          {isDone && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2 text-xs text-success-400"
            >
              ✓ Captured as {cls?.label.toLowerCase() || 'item'}
            </motion.p>
          )}
        </AnimatePresence>

        {!value && (
          <p className="mt-2 text-xs text-[color:var(--text-muted)]">
            Type anything — AI automatically classifies it as a task, event, note, expense, or journal entry.
          </p>
        )}
      </div>
    </div>
  )
}
