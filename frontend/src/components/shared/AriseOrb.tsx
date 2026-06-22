import { useVoiceStore } from '@/stores/voiceStore'
import { motion } from 'framer-motion'

interface AriseOrbProps {
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onClick?: () => void
}

export default function AriseOrb({
  size = 'md',
  interactive = false,
  onClick,
}: AriseOrbProps) {
  const { state } = useVoiceStore()

  // Dimensions based on size prop
  const dim = size === 'sm' ? 'w-12 h-12' : size === 'lg' ? 'w-48 h-48' : 'w-24 h-24'
  const borderDashOuter = size === 'sm' ? '4,4' : '6,6'
  const borderDashInner = size === 'sm' ? '2,2' : '4,4'

  // Animations configuration based on state
  let outerDuration = 16
  let innerDuration = 10
  let glowColor = 'rgba(0, 207, 255, 0.2)'
  let coreScale = 1
  let pulseDuration = 2

  if (state === 'idle') {
    outerDuration = 20
    innerDuration = 14
    glowColor = 'rgba(0, 207, 255, 0.08)'
    coreScale = 0.9
  } else if (state === 'wake') {
    outerDuration = 12
    innerDuration = 8
    glowColor = 'rgba(0, 207, 255, 0.25)'
    pulseDuration = 1.5
  } else if (state === 'listening') {
    outerDuration = 6
    innerDuration = 4
    glowColor = 'rgba(0, 207, 255, 0.5)'
    coreScale = 1.15
    pulseDuration = 0.8
  } else if (state === 'processing') {
    outerDuration = 2
    innerDuration = 1.5
    glowColor = 'rgba(0, 207, 255, 0.6)'
    coreScale = 1.0
    pulseDuration = 0.4
  } else if (state === 'speaking') {
    outerDuration = 8
    innerDuration = 6
    glowColor = 'rgba(0, 207, 255, 0.45)'
    coreScale = 1.1
    pulseDuration = 1.0
  }

  return (
    <div
      onClick={interactive ? onClick : undefined}
      className={`relative flex items-center justify-center ${dim} ${
        interactive ? 'cursor-pointer select-none active:scale-95 transition-transform' : ''
      }`}
    >
      {/* Outer Glow Halo */}
      <motion.div
        animate={{
          boxShadow: [
            `0 0 15px ${glowColor}`,
            `0 0 35px ${glowColor}`,
            `0 0 15px ${glowColor}`,
          ],
        }}
        transition={{
          repeat: Infinity,
          duration: pulseDuration,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 rounded-full"
      />

      {/* SVG Concentric Rings */}
      <svg className="absolute w-full h-full" viewBox="0 0 100 100">
        {/* Outer Ring */}
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#00cfff"
          strokeWidth="1.5"
          strokeDasharray={borderDashOuter}
          opacity={state === 'idle' ? 0.2 : 0.6}
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: outerDuration,
            ease: 'linear',
          }}
          style={{ originX: '50px', originY: '50px' }}
        />

        {/* Middle Ring (Reverse direction) */}
        <motion.circle
          cx="50"
          cy="50"
          r="36"
          fill="none"
          stroke="#00cfff"
          strokeWidth="1.2"
          strokeDasharray={borderDashInner}
          opacity={state === 'idle' ? 0.3 : 0.7}
          animate={{ rotate: -360 }}
          transition={{
            repeat: Infinity,
            duration: innerDuration,
            ease: 'linear',
          }}
          style={{ originX: '50px', originY: '50px' }}
        />

        {/* Inner Tech Ring (Static or pulsating rotation) */}
        <motion.circle
          cx="50"
          cy="50"
          r="26"
          fill="none"
          stroke="#00cfff"
          strokeWidth="1"
          strokeDasharray="40 10 5 10"
          opacity={state === 'idle' ? 0.15 : 0.5}
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: outerDuration * 1.5,
            ease: 'linear',
          }}
          style={{ originX: '50px', originY: '50px' }}
        />
      </svg>

      {/* Glowing Inner Core Orb */}
      <motion.div
        animate={{
          scale: [coreScale, coreScale * 1.08, coreScale],
          opacity: state === 'idle' ? 0.4 : state === 'listening' ? [0.8, 1, 0.8] : 0.9,
        }}
        transition={{
          repeat: Infinity,
          duration: pulseDuration,
          ease: 'easeInOut',
        }}
        className={`absolute rounded-full bg-gradient-to-tr from-[#00cfff]/60 to-[#e8f7ff] shadow-glow-accent-cyan ${
          size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-20 h-20' : 'w-10 h-10'
        }`}
      />

      {/* Ripple Rings (only visible when speaking) */}
      {state === 'speaking' && (
        <>
          <motion.div
            initial={{ scale: 0.6, opacity: 0.8 }}
            animate={{ scale: 1.4, opacity: 0 }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: 'easeOut',
            }}
            className="absolute w-full h-full rounded-full border border-[#00cfff]/40"
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0.6 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              delay: 0.5,
              ease: 'easeOut',
            }}
            className="absolute w-full h-full rounded-full border border-[#00cfff]/20"
          />
        </>
      )}

      {/* Audio Wave Bar (only visible when listening) */}
      {state === 'listening' && (
        <div className="absolute flex gap-0.5 justify-center items-center h-4 z-20 pointer-events-none">
          <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-0.5 bg-[#020d18] rounded" />
          <motion.div animate={{ height: [6, 16, 6] }} transition={{ repeat: Infinity, duration: 0.4, delay: 0.1 }} className="w-0.5 bg-[#020d18] rounded" />
          <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }} className="w-0.5 bg-[#020d18] rounded" />
        </div>
      )}
    </div>
  )
}
