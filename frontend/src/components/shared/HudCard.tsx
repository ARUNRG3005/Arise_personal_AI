import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface HudCardProps {
  label?: string;
  title?: string; // Backward compatibility
  value?: string | number;
  sub?: string;
  subtitle?: string; // Backward compatibility
  progress?: number;
  children?: ReactNode;
  onClick?: () => void;
  className?: string;
  delay?: number;
  accent?: 'cyan' | 'green' | 'amber' | 'red' | 'purple';
  headerExtra?: ReactNode; // Backward compatibility
}

const ACCENT_COLORS = {
  cyan:   'border-j-cyan/20 hover:border-j-cyan/45',
  green:  'border-j-green/20 hover:border-j-green/45',
  amber:  'border-j-amber/20 hover:border-j-amber/45',
  red:    'border-j-red/20   hover:border-j-red/45',
  purple: 'border-j-purple/20 hover:border-j-purple/45',
};
const ACCENT_TEXT = {
  cyan:   'text-j-cyan',
  green:  'text-j-green',
  amber:  'text-j-amber',
  red:    'text-j-red',
  purple: 'text-j-purple',
};
const ACCENT_BAR = {
  cyan:   'bg-j-cyan',
  green:  'bg-j-green',
  amber:  'bg-j-amber',
  red:    'bg-j-red',
  purple: 'bg-j-purple',
};

export function HudCard({
  label, title, value, sub, subtitle, progress, children, onClick,
  className = '', delay = 0, accent = 'cyan', headerExtra
}: HudCardProps) {
  const displayLabel = label || title;
  const displaySub = sub || subtitle;
  const hasValue = value !== undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={`
        relative j-card j-corner
        ${ACCENT_COLORS[accent]}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* Top-right corner accent */}
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-j-cyan/40 rounded-tr-lg pointer-events-none" />

      {/* RENDER HEADER LAYOUT (for cards with title/headerExtra or no value) */}
      {!hasValue && (displayLabel || headerExtra) && (
        <div className="flex items-center justify-between border-b border-j-cyan/10 pb-3 mb-4">
          <div>
            {displayLabel && (
              <h3 className="text-xs font-mono font-bold tracking-widest text-j-cyan uppercase">
                {displayLabel}
              </h3>
            )}
            {displaySub && (
              <p className="text-[10px] font-mono text-j-text-sub uppercase tracking-wider mt-0.5">
                {displaySub}
              </p>
            )}
          </div>
          {headerExtra && <div className="text-xs">{headerExtra}</div>}
        </div>
      )}

      {/* RENDER VALUE LAYOUT (for stats style) */}
      {hasValue && (
        <>
          {displayLabel && (
            <div className="j-font-mono text-[9px] tracking-[0.2em] uppercase text-j-text-muted mb-2">
              {displayLabel}
            </div>
          )}
          
          <div className={`text-2xl font-bold ${ACCENT_TEXT[accent]} j-text-glow leading-none mb-1`}>
            {value}
          </div>

          {displaySub && (
            <div className="text-[10px] text-j-text-muted mt-1">{displaySub}</div>
          )}
        </>
      )}

      {/* Card Content */}
      {children && <div className="relative z-10">{children}</div>}

      {/* Progress Bar */}
      {progress !== undefined && (
        <div className="mt-3">
          <div className="h-[2px] bg-j-cyan/8 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${ACCENT_BAR[accent]} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ delay: delay + 0.3, duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default HudCard;
