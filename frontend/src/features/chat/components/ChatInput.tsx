import { useState, useRef, RefObject, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, Paperclip, Sparkles, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  onSend: (msg: string) => void
  isDisabled?: boolean
  inputRef?: RefObject<HTMLTextAreaElement>
}

const QUICK_CHIPS = [
  { label: '📅 Plan my day', text: 'Help me plan my day today' },
  { label: '✅ My tasks', text: 'What tasks are due today?' },
  { label: '🔥 Habit check', text: 'Check my habit streaks' },
  { label: '💡 Suggest', text: 'Give me a productivity tip' },
]

export default function ChatInput({ onSend, isDisabled, inputRef }: Props) {
  const [value, setValue] = useState('')
  const localRef = useRef<HTMLTextAreaElement>(null)
  const ref = inputRef || localRef

  // Auto-resize textarea
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }, [value])

  const handleSend = () => {
    if (!value.trim() || isDisabled) return
    onSend(value.trim())
    setValue('')
    if (ref.current) ref.current.style.height = 'auto'
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-[color:var(--border-subtle)] bg-[color:var(--bg-base)]/80 backdrop-blur-xl p-4">
      {/* Quick chips */}
      <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide pb-1">
        {QUICK_CHIPS.map(chip => (
          <button
            key={chip.text}
            onClick={() => onSend(chip.text)}
            disabled={isDisabled}
            className="flex-shrink-0 px-3 py-1.5 rounded-full border border-[color:var(--border-subtle)] text-xs text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] hover:border-primary-500/40 hover:bg-primary-500/8 transition-all disabled:opacity-40"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Input box */}
      <div className={cn(
        'flex items-end gap-3 rounded-2xl border bg-[color:var(--bg-card)] px-4 py-3 transition-all duration-200',
        isDisabled ? 'border-[color:var(--border-subtle)] opacity-60' : 'border-[color:var(--border-default)] focus-within:border-primary-500/50 focus-within:shadow-glow-sm',
      )}>
        {/* Attach */}
        <button
          className="p-1.5 rounded-lg hover:bg-white/10 text-[color:var(--text-tertiary)] hover:text-[color:var(--text-secondary)] transition-colors flex-shrink-0"
          title="Attach file"
          disabled={isDisabled}
        >
          <Paperclip className="w-4 h-4" />
        </button>

        {/* Textarea */}
        <textarea
          ref={ref}
          id="chat-input"
          rows={1}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
          placeholder="Message ARISE… (Shift+Enter for new line)"
          className="flex-1 bg-transparent text-sm text-[color:var(--text-primary)] placeholder-[color:var(--text-muted)] outline-none resize-none leading-relaxed"
          style={{ maxHeight: '200px' }}
        />

        {/* Char count */}
        {value.length > 200 && (
          <span className={cn(
            'text-[10px] self-end flex-shrink-0',
            value.length > 800 ? 'text-error-400' : 'text-[color:var(--text-muted)]'
          )}>
            {value.length}
          </span>
        )}

        {/* Voice */}
        <button
          className="p-1.5 rounded-lg hover:bg-white/10 text-[color:var(--text-tertiary)] hover:text-[color:var(--text-secondary)] transition-colors flex-shrink-0"
          title="Voice input"
          disabled={isDisabled}
        >
          <Mic className="w-4 h-4" />
        </button>

        {/* Send */}
        <AnimatePresence mode="wait">
          <motion.button
            key={value ? 'send' : 'sparkle'}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={handleSend}
            disabled={!value.trim() || isDisabled}
            className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all',
              value.trim() && !isDisabled
                ? 'bg-gradient-primary text-white shadow-glow-primary hover:opacity-90'
                : 'bg-white/5 text-[color:var(--text-tertiary)]'
            )}
            aria-label="Send message"
          >
            {value.trim() ? (
              <Send className="w-4 h-4" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </motion.button>
        </AnimatePresence>
      </div>

      <p className="text-[10px] text-[color:var(--text-muted)] text-center mt-2">
        ARISE AI may make mistakes. Always verify important information.
      </p>
    </div>
  )
}
