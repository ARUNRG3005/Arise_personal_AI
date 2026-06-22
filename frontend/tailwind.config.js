/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Primary — Indigo
        primary: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        // Secondary — Purple
        secondary: {
          50:  '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        // Accent — Cyan
        accent: {
          50:  '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        // Success — Emerald
        success: {
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
        },
        // Warning — Amber
        warning: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        // Error — Rose
        error: {
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
        },
        // Dark Navy backgrounds
        navy: {
          950: '#030712',
          900: '#0a0f1e',
          850: '#0d1424',
          800: '#111827',
          750: '#131929',
          700: '#1a2332',
          600: '#1e2d3d',
          500: '#243447',
        },
        // JARVIS Edition Cyber Colors
        jarvis: {
          bg: '#020d18',
          surface: '#041428',
          accent: '#00cfff',
          'accent-glow': 'rgba(0, 207, 255, 0.35)',
        },
        // Glass surfaces
        glass: {
          DEFAULT: 'rgba(255, 255, 255, 0.05)',
          light: 'rgba(255, 255, 255, 0.08)',
          border: 'rgba(255, 255, 255, 0.1)',
          dark: 'rgba(0, 0, 0, 0.2)',
        },
        // JARVIS colors
        j: {
          void:    '#000811',
          bg:      '#010f1e',
          surface: '#021628',
          elevated:'#032038',
          overlay: '#042a4a',
          cyan:    '#00d4ff',
          'cyan-bright': '#40e8ff',
          'cyan-dim':    '#0099cc',
          blue:    '#1a6fff',
          text:    '#c8eeff',
          green:   '#00ff9d',
          amber:   '#ffb300',
          red:     '#ff3355',
          purple:  '#9d4edd',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
        'gradient-accent': 'linear-gradient(135deg, #06b6d4 0%, #6366f1 100%)',
        'gradient-success': 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
        'gradient-warm': 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
        'gradient-aurora': 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #06b6d4 100%)',
        'gradient-dark': 'linear-gradient(180deg, #0a0f1e 0%, #030712 100%)',
        'mesh-primary': 'radial-gradient(ellipse at top left, rgba(99,102,241,0.15) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(168,85,247,0.15) 0%, transparent 50%)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(99, 102, 241, 0.3)',
        'glow-accent': '0 0 20px rgba(6, 182, 212, 0.3)',
        'glow-success': '0 0 20px rgba(16, 185, 129, 0.3)',
        'glow-sm': '0 0 10px rgba(99, 102, 241, 0.2)',
        'glow-accent-cyan': '0 0 20px rgba(0, 207, 255, 0.35)',
        'glow-lg': '0 0 35px rgba(0, 207, 255, 0.4)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'glass-lg': '0 16px 64px rgba(0, 0, 0, 0.4)',
        'card': '0 4px 16px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.3)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'j-sm': '0 0 8px rgba(0,212,255,0.4)',
        'j-md': '0 0 20px rgba(0,212,255,0.3), 0 0 40px rgba(0,212,255,0.1)',
        'j-lg': '0 0 40px rgba(0,212,255,0.4), 0 0 80px rgba(0,212,255,0.15)',
        'j-blue': '0 0 20px rgba(26,111,255,0.4)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'typing': 'typing 1.2s steps(3) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-subtle': 'bounceSubtle 2s ease-in-out infinite',
        'scan': 'scan 8s linear infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'rotate-left': 'rotateLeft 12s linear infinite',
        'rotate-right': 'rotateRight 8s linear infinite',
        'j-scan':       'j-scanline 5s linear infinite',
        'j-pulse':      'j-pulse-glow 2s ease-in-out infinite',
        'j-cw':         'j-rotate-cw 8s linear infinite',
        'j-ccw':        'j-rotate-ccw 5s linear infinite',
        'j-cw-fast':    'j-rotate-cw 3s linear infinite',
        'j-blink':      'j-blink 1.5s ease-in-out infinite',
        'j-fade-up':    'j-fade-up 0.4s ease both',
        'j-ring-pulse': 'j-ring-pulse 2.5s ease-in-out infinite',
        'j-wave':       'j-wave 0.6s ease-in-out infinite',
        'j-flicker':    'j-flicker 10s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        slideUp: {
          from: { transform: 'translateY(8px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          from: { transform: 'translateY(-8px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        scaleIn: {
          from: { transform: 'scale(0.95)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          from: { backgroundPosition: '-200% 0' },
          to: { backgroundPosition: '200% 0' },
        },
        typing: {
          '0%': { content: '.' },
          '33%': { content: '..' },
          '66%': { content: '...' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
        scan: {
          '0%': { top: '0%' },
          '50%': { top: '100%' },
          '100%': { top: '0%' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(0, 207, 255, 0.2)', opacity: '0.8' },
          '50%': { boxShadow: '0 0 25px rgba(0, 207, 255, 0.6)', opacity: '1' },
        },
        rotateLeft: {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' },
        },
        rotateRight: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '72': '18rem',
        '80': '20rem',
        '88': '22rem',
        '96': '24rem',
      },
      screens: {
        'xs': '375px',   /* iPhone SE */
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
}
