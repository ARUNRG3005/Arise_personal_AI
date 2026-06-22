import { useEffect, useRef } from 'react';

type OrbState = 'idle' | 'listening' | 'speaking' | 'thinking' | 'processing' | 'wake';
type OrbSize  = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const SIZE_MAP: Record<OrbSize, number> = {
  xs: 28, sm: 40, md: 60, lg: 96, xl: 140
};

interface AriseOrbProps {
  size?: OrbSize;
  state?: OrbState;
  className?: string;
  interactive?: boolean; // For compatibility
  onClick?: () => void;  // For compatibility
}

export function AriseOrb({ size = 'md', state = 'idle', className = '', interactive = false, onClick }: AriseOrbProps) {
  const px = SIZE_MAP[size];

  // Map other states to core state mapping
  const normalizedState = 
    state === 'wake' ? 'listening' :
    state === 'processing' ? 'thinking' :
    state;

  const ring1Speed = normalizedState === 'thinking'  ? 'animate-j-cw-fast'
                   : normalizedState === 'listening' ? 'animate-j-cw'
                   : 'animate-j-cw';

  const ring2Speed = normalizedState === 'speaking'  ? 'animate-j-ccw'
                   : 'animate-j-ccw';

  const coreGlow   = normalizedState === 'idle'      ? 'opacity-60'
                   : normalizedState === 'listening' ? 'opacity-100 animate-j-pulse'
                   : normalizedState === 'speaking'  ? 'opacity-100 animate-j-pulse'
                   : 'opacity-80';

  return (
    <div
      onClick={interactive ? onClick : undefined}
      className={`relative flex items-center justify-center ${interactive ? 'cursor-pointer select-none active:scale-95 transition-transform' : ''} ${className}`}
      style={{ width: px, height: px }}
      aria-label={`ARISE orb — ${state}`}
    >
      {/* Outer pulse ring */}
      <div
        className="absolute inset-0 rounded-full border border-j-cyan/20 animate-j-ring-pulse"
        style={{ margin: -px * 0.08 }}
      />

      {/* Ring 3 — slowest, dashed */}
      <div
        className="absolute inset-0 rounded-full border border-dashed border-j-cyan/15 animate-j-cw"
        style={{
          animationDuration: '12s',
          margin: px * 0.05
        }}
      />

      {/* Ring 2 — medium speed, counter-clockwise */}
      <div
        className={`absolute rounded-full border border-j-cyan/30 ${ring2Speed}`}
        style={{
          inset: px * 0.14,
          animationDuration: '6s',
        }}
      >
        {/* Ring 2 dot */}
        <div
          className="absolute bg-j-cyan rounded-full"
          style={{ width: px*0.08, height: px*0.08, top: -px*0.04, left: '50%', transform: 'translateX(-50%)' }}
        />
      </div>

      {/* Ring 1 — fast, clockwise */}
      <div
        className={`absolute rounded-full border border-j-cyan/55 ${ring1Speed}`}
        style={{
          inset: px * 0.24,
          animationDuration: '4s',
        }}
      >
        {/* Ring 1 dot */}
        <div
          className="absolute bg-j-cyan-bright rounded-full"
          style={{ width: px*0.1, height: px*0.1, top: -px*0.05, left: '50%', transform: 'translateX(-50%)' }}
        />
      </div>

      {/* Core */}
      <div
        className={`absolute rounded-full bg-j-cyan shadow-j-md ${coreGlow} transition-opacity duration-300`}
        style={{ inset: px * 0.36 }}
      />

      {/* Core inner bright spot */}
      <div
        className="absolute rounded-full bg-white/40"
        style={{ inset: px * 0.44 }}
      />
    </div>
  );
}

export default AriseOrb;
