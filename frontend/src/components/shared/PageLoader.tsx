import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export default function PageLoader() {
  return (
    <div className="flex items-center justify-center h-full min-h-64">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-3"
      >
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow-primary">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="absolute inset-0 rounded-2xl bg-gradient-primary animate-ping opacity-20" />
        </div>
        <div className="flex gap-1">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      </motion.div>
    </div>
  )
}
