import React from 'react'
import { motion } from 'framer-motion'

interface HudCardProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  headerExtra?: React.ReactNode
  className?: string
  progress?: number // Optional progress bar (0-100)
}

export default function HudCard({
  children,
  title,
  subtitle,
  headerExtra,
  className = '',
  progress,
}: HudCardProps) {
  return (
    <div
      className={`relative bg-[#041428]/60 border border-[#00cfff]/20 rounded-xl p-5 overflow-hidden backdrop-blur-md transition-all duration-300 hover:border-[#00cfff]/45 hover:shadow-[0_0_20px_rgba(0,207,255,0.15)] group ${className}`}
    >
      {/* Corner L-shapes */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#00cfff] opacity-60 group-hover:opacity-100 transition-opacity" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#00cfff] opacity-60 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#00cfff] opacity-60 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#00cfff] opacity-60 group-hover:opacity-100 transition-opacity" />

      {/* Grid Overlay background (very subtle) */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />

      {/* Header */}
      {(title || subtitle || headerExtra) && (
        <div className="flex items-center justify-between border-b border-[#00cfff]/10 pb-3 mb-4">
          <div>
            {title && (
              <h3 className="text-xs font-mono font-bold tracking-widest text-[#00cfff] uppercase">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-[10px] font-mono text-[#8ab6d6]/60 uppercase tracking-wider mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {headerExtra && <div className="text-xs">{headerExtra}</div>}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 text-[#e8f7ff]">{children}</div>

      {/* Optional HUD metrics bar */}
      {progress !== undefined && (
        <div className="mt-4 pt-3 border-t border-[#00cfff]/5">
          <div className="flex justify-between text-[10px] font-mono text-[#8ab6d6]/70 mb-1">
            <span>SYSTEM_CAPACITY</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1 w-full bg-[#081d38] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-[#00cfff]/40 to-[#00cfff]"
            />
          </div>
        </div>
      )}
    </div>
  )
}
