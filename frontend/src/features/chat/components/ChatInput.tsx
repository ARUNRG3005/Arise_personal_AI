import { useState, useRef, useEffect } from 'react'
import type { RefObject } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, Paperclip, Sparkles, Volume2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { VoiceState } from '@/services/voice/useVoiceAssistant'

interface Props {
  onSend: (msg: string) => void
  isDisabled?: boolean
  inputRef?: RefObject<HTMLTextAreaElement | null>
  value?: string
  onChange?: (val: string) => void
  voiceState?: VoiceState
  onVoiceToggle?: () => void
  onVoiceInterrupt?: () => void
}

const QUICK_CHIPS = [
  { label: '📅 Plan my day', text: 'Help me plan my day today' },
  { label: '✅ My tasks', text: 'What tasks are due today?' },
  { label: '🔥 Habit check', text: 'Check my habit streaks' },
  { label: '💡 Suggest', text: 'Give me a productivity tip' },
]

const Waveform = () => {
  return (
    <div className="flex items-center gap-0.5 px-1 h-3 flex-shrink-0">
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="bg-error-500 rounded-full"
          style={{ width: '2px' }}
          animate={{
            height: ['4px', '12px', '4px'],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

export default function ChatInput({
  onSend,
  isDisabled,
  inputRef,
  value,
  onChange,
  voiceState = 'idle',
  onVoiceToggle,
  onVoiceInterrupt,
}: Props) {
  const [internalValue, setInternalValue] = useState('')
  const localRef = useRef<HTMLTextAreaElement>(null)
  const ref = inputRef || localRef

  const isControlled = value !== undefined
  const currentValue = isControlled ? value : internalValue

  const setCurrentValue = (val: string) => {
    if (isControlled) {
      onChange?.(val)
    } else {
      setInternalValue(val)
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`
  }, [currentValue, ref])

  const handleSend = () => {
    if (!currentValue.trim() || isDisabled) return
    onSend(currentValue.trim())
    setCurrentValue('')
    if (ref.current) ref.current.style.height = 'auto'
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setCurrentValue(val)
    if (voiceState !== 'idle' && onVoiceInterrupt) {
      onVoiceInterrupt()
    }
  }

  return (
    <div className="j-chat-input-wrap">
      {/* Quick chips */}
      <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide pb-1">
        {QUICK_CHIPS.map(chip => (
          <button
            key={chip.text}
            onClick={() => onSend(chip.text)}
            disabled={isDisabled || voiceState === 'listening'}
            className="flex-shrink-0 px-3 py-1.5 rounded-full border border-[color:var(--border-subtle)] text-xs text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] hover:border-primary-500/40 hover:bg-primary-500/8 transition-all disabled:opacity-40"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Input box */}
      <div className={cn(
        'flex items-end gap-3 rounded-2xl border bg-[color:var(--bg-card)] px-4 py-3 transition-all duration-200',
        isDisabled && voiceState !== 'speaking' && voiceState !== 'listening'
          ? 'border-[color:var(--border-subtle)] opacity-60'
          : 'border-[color:var(--border-default)] focus-within:border-primary-500/50 focus-within:shadow-glow-sm',
        voiceState === 'listening' && 'border-error-500/40 shadow-[0_0_12px_rgba(239,68,68,0.15)] focus-within:border-error-500/50',
        voiceState === 'speaking' && 'border-primary-500/40 shadow-[0_0_12px_rgba(99,102,241,0.15)]'
      )}>
        {/* Attach */}
        <button
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-white/10 text-[color:var(--text-tertiary)] hover:text-[color:var(--text-secondary)] transition-colors flex-shrink-0"
          title="Attach file"
          disabled={isDisabled || voiceState === 'listening'}
        >
          <Paperclip className="w-4 h-4" />
        </button>

        {/* Textarea */}
        <textarea
          ref={ref}
          id="chat-input"
          rows={1}
          value={currentValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={isDisabled && voiceState !== 'speaking' && voiceState !== 'listening'}
          placeholder={
            voiceState === 'listening'
              ? 'Listening... Speak clearly.'
              : voiceState === 'speaking'
              ? 'ARISE is speaking... Type to interrupt.'
              : 'Message ARISE… (Shift+Enter for new line)'
          }
          className="flex-1 bg-transparent text-base text-[color:var(--text-primary)] placeholder-[color:var(--text-muted)] outline-none resize-none leading-relaxed min-h-[44px]"
          style={{ maxHeight: '200px' }}
        />

        {/* Char count */}
        {currentValue.length > 200 && (
          <span className={cn(
            'text-[10px] self-end flex-shrink-0',
            currentValue.length > 800 ? 'text-error-400' : 'text-[color:var(--text-muted)]'
          )}>
            {currentValue.length}
          </span>
        )}

        {/* Animated Waveform Pill when listening */}
        {voiceState === 'listening' && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error-500/10 border border-error-500/20 text-error-400 text-[10px] font-medium flex-shrink-0 select-none animate-pulse self-center">
            <span className="w-1.5 h-1.5 rounded-full bg-error-500 animate-ping" />
            <span>Mic Live</span>
            <Waveform />
          </div>
        )}

        {/* Voice Button */}
        <button
          onClick={onVoiceToggle}
          className={cn(
            "min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-all flex-shrink-0 relative",
            voiceState === 'idle' && "hover:bg-white/10 text-[color:var(--text-tertiary)] hover:text-[color:var(--text-secondary)]",
            voiceState === 'listening' && "bg-error-500/20 text-error-400 shadow-[0_0_8px_rgba(239,68,68,0.3)] animate-pulse",
            voiceState === 'processing' && "text-primary-400 cursor-not-allowed",
            voiceState === 'speaking' && "bg-primary-500/20 text-primary-400 shadow-[0_0_8px_rgba(99,102,241,0.3)]"
          )}
          title={
            voiceState === 'listening' ? 'Stop listening and send' :
            voiceState === 'speaking' ? 'Interrupt speaking' :
            voiceState === 'processing' ? 'Processing speech...' : 'Voice input'
          }
          disabled={isDisabled && voiceState !== 'speaking' && voiceState !== 'listening'}
        >
          {voiceState === 'idle' && <Mic className="w-4 h-4" />}
          {voiceState === 'listening' && <Mic className="w-4 h-4" />}
          {voiceState === 'processing' && (
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          {voiceState === 'speaking' && (
            <div className="relative flex items-center justify-center">
              <span className="absolute -inset-1 rounded-full bg-primary-500/30 animate-ping" />
              <Volume2 className="w-4 h-4 relative z-10" />
            </div>
          )}
        </button>

        {/* Send */}
        <AnimatePresence mode="wait">
          <motion.button
            key={currentValue ? 'send' : 'sparkle'}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={handleSend}
            disabled={!currentValue.trim() || isDisabled || voiceState === 'listening'}
            className={cn(
              'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all',
              currentValue.trim() && !isDisabled && voiceState !== 'listening'
                ? 'bg-gradient-primary text-white shadow-glow-primary hover:opacity-90'
                : 'bg-white/5 text-[color:var(--text-tertiary)]'
            )}
            aria-label="Send message"
          >
            {currentValue.trim() ? (
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
