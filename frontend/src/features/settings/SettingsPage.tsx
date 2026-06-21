import { useState } from 'react'
import { Settings, User, Brain, Palette, Bell, Shield, Key, ChevronRight, Sun, Moon, Monitor, Sparkles, Check, Globe, Volume2, Keyboard, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '@/stores/uiStore'
import { useUserStore } from '@/stores/userStore'
import { cn } from '@/lib/utils'
import { toast } from 'react-hot-toast'

const SECTIONS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'routine', label: 'Daily Routine', icon: Clock },
  { id: 'ai', label: 'AI & Memory', icon: Brain },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy & Data', icon: Shield },
  { id: 'integrations', label: 'Integrations', icon: Key },
  { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
]

const AI_MODELS = [
  { id: 'llama3-70b', label: 'Llama 3 70B', provider: 'Groq', speed: 'Fast', recommended: true },
  { id: 'llama3-8b', label: 'Llama 3 8B', provider: 'Groq', speed: 'Fastest', recommended: false },
  { id: 'mixtral-8x7b', label: 'Mixtral 8×7B', provider: 'Groq', speed: 'Fast', recommended: false },
  { id: 'gemma-7b', label: 'Gemma 7B', provider: 'Groq', speed: 'Fast', recommended: false },
]

const THEME_OPTIONS = [
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'light', label: 'Light', icon: Sun },
]

const ACCENT_COLORS = [
  { id: 'indigo', label: 'Indigo', value: '#6366f1' },
  { id: 'purple', label: 'Purple', value: '#a855f7' },
  { id: 'cyan', label: 'Cyan', value: '#06b6d4' },
  { id: 'emerald', label: 'Emerald', value: '#10b981' },
  { id: 'rose', label: 'Rose', value: '#f43f5e' },
  { id: 'amber', label: 'Amber', value: '#f59e0b' },
]

const SHORTCUTS = [
  { action: 'Open Command Palette', keys: ['⌘', 'K'] },
  { action: 'New Chat', keys: ['⌘', 'N'] },
  { action: 'Toggle Sidebar', keys: ['⌘', 'B'] },
  { action: 'Go to Dashboard', keys: ['⌘', '1'] },
  { action: 'Go to Chat', keys: ['⌘', '2'] },
  { action: 'Go to Tasks', keys: ['⌘', '3'] },
  { action: 'Search', keys: ['⌘', 'F'] },
  { action: 'Settings', keys: ['⌘', ','] },
]

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn('relative w-10 h-5.5 rounded-full transition-colors duration-200 flex-shrink-0 cursor-pointer', checked ? 'bg-primary-600' : 'bg-white/20')}
      style={{ height: '22px' }}
    >
      <motion.div
        animate={{ x: checked ? '22px' : '2px' }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white shadow-sm pointer-events-none"
        style={{ width: '18px', height: '18px', top: '2px' }}
      />
    </button>
  )
}

export default function SettingsPage() {
  const { theme, setTheme } = useUIStore()
  const { profile, setProfile } = useUserStore()

  // Tab section
  const [activeSection, setActiveSection] = useState('profile')

  // Profile Form States
  const [name, setName] = useState(profile.name || '')
  const [role, setRole] = useState(profile.role || 'Other')
  const [country, setCountry] = useState(profile.country || '')
  const [timezone, setTimezone] = useState(profile.timezone || 'Asia/Kolkata')
  const [language, setLanguage] = useState(profile.language || 'en')
  const [wakeTime, setWakeTime] = useState(profile.wakeTime || '07:00')
  const [sleepTime, setSleepTime] = useState(profile.sleepTime || '22:30')
  const [currency, setCurrency] = useState(profile.currency || 'INR')
  const [githubUsername, setGithubUsername] = useState(profile.githubUsername || 'ARUNRG3005')

  // Routine settings local state
  const [localRoutine, setLocalRoutine] = useState(() => {
    const items = [
      { id: 'workout', label: 'Morning Workout', emoji: '🏋️', time: '08:00', enabled: false },
      { id: 'focus_morning', label: 'Deep Focus Block', emoji: '💼', time: '09:30', enabled: false },
      { id: 'lunch', label: 'Lunch Break', emoji: '🥗', time: '13:00', enabled: false },
      { id: 'learning', label: 'Skills & Study', emoji: '📚', time: '16:00', enabled: false },
      { id: 'dinner', label: 'Dinner', emoji: '🍽️', time: '20:00', enabled: false },
      { id: 'winddown', label: 'Evening Wind Down', emoji: '🧘', time: '21:30', enabled: false },
    ]
    if (profile.dailyRoutine && profile.dailyRoutine.length > 0) {
      return items.map(item => {
        const existing = profile.dailyRoutine.find(r => r.id === item.id)
        if (existing) {
          return { ...item, enabled: true, time: existing.time }
        }
        return item
      })
    }
    return items
  })

  // Other UI States
  const [selectedModel, setSelectedModel] = useState('llama3-70b')
  const [selectedAccent, setSelectedAccent] = useState('indigo')
  const [apiKey, setApiKey] = useState('')
  const [githubToken, setGithubToken] = useState(() => localStorage.getItem('arise-github-token') || '')
  const [notifs, setNotifs] = useState({ dailyDigest: true, reminders: true, habitAlerts: true, aiSuggestions: true, weeklyReport: false })
  const [aiSettings, setAiSettings] = useState({ memoryEnabled: true, contextWindow: true, personalization: true, safetyFilter: true })

  const handleSaveProfile = () => {
    if (!name.trim()) {
      toast.error('Display Name cannot be empty!')
      return
    }

    const updatedRoutine = (profile.dailyRoutine || []).map(item => {
      if (item.id === 'wake') return { ...item, time: wakeTime };
      if (item.id === 'sleep') return { ...item, time: sleepTime };
      return item;
    });

    setProfile({
      name: name.trim(),
      role: role as any,
      country: country.trim(),
      timezone: timezone.trim(),
      language,
      wakeTime,
      sleepTime,
      currency,
      githubUsername: githubUsername.trim(),
      dailyRoutine: updatedRoutine
    })

    toast.success('Profile settings updated successfully!')
  }

  const handleSaveRoutine = () => {
    const mappedRoutine = [
      { id: 'wake', label: 'Wake Up', emoji: '🌅', time: wakeTime },
      ...localRoutine
        .filter(r => r.enabled)
        .map(r => ({ id: r.id, label: r.label, emoji: r.emoji, time: r.time })),
      { id: 'sleep', label: 'Sleep', emoji: '🌙', time: sleepTime }
    ].sort((a, b) => a.time.localeCompare(b.time));

    setProfile({
      dailyRoutine: mappedRoutine
    })

    toast.success('Daily Routine settings updated successfully!')
  }

  const handleSaveGithubToken = () => {
    if (githubToken.trim()) {
      localStorage.setItem('arise-github-token', githubToken.trim())
      toast.success('GitHub token saved successfully!')
    } else {
      localStorage.removeItem('arise-github-token')
      toast.success('GitHub token cleared!')
    }
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-6">
            <h2 className="text-base font-semibold text-[color:var(--text-primary)]">Profile Settings</h2>
            
            {/* Avatar / Initials */}
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center text-white text-3xl font-bold shadow-glow-primary uppercase">
                {name.trim().charAt(0) || 'U'}
              </div>
              <div>
                <span className="text-sm font-semibold text-[color:var(--text-primary)] block">Avatar Initials</span>
                <p className="text-xs text-[color:var(--text-tertiary)] mt-1">Generated automatically from your name</p>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[color:var(--text-secondary)] block mb-1.5">Display Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-2.5 rounded-xl bg-[color:var(--bg-surface)] border border-[color:var(--border-default)] text-sm text-[color:var(--text-primary)] outline-none focus:border-primary-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[color:var(--text-secondary)] block mb-1.5">Activity Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[color:var(--bg-surface)] border border-[color:var(--border-default)] text-sm text-[color:var(--text-primary)] outline-none focus:border-primary-500/50 cursor-pointer"
                >
                  <option value="Student">Student</option>
                  <option value="Professional">Professional</option>
                  <option value="Freelancer">Freelancer</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[color:var(--text-secondary)] block mb-1.5">Country</label>
                <input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Your country"
                  className="w-full px-4 py-2.5 rounded-xl bg-[color:var(--bg-surface)] border border-[color:var(--border-default)] text-sm text-[color:var(--text-primary)] outline-none focus:border-primary-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[color:var(--text-secondary)] block mb-1.5">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[color:var(--bg-surface)] border border-[color:var(--border-default)] text-sm text-[color:var(--text-primary)] outline-none focus:border-primary-500/50 cursor-pointer"
                >
                  <option value="en">English (US/UK)</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[color:var(--text-secondary)] block mb-1.5">Wake Time</label>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[color:var(--bg-surface)] border border-[color:var(--border-default)] text-sm text-[color:var(--text-primary)] outline-none focus:border-primary-500/50 font-mono cursor-pointer"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[color:var(--text-secondary)] block mb-1.5">Sleep Time</label>
                <input
                  type="time"
                  value={sleepTime}
                  onChange={(e) => setSleepTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[color:var(--bg-surface)] border border-[color:var(--border-default)] text-sm text-[color:var(--text-primary)] outline-none focus:border-primary-500/50 font-mono cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[color:var(--text-secondary)] block mb-1.5">Timezone</label>
                <input
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  placeholder="e.g. Asia/Kolkata"
                  className="w-full px-4 py-2.5 rounded-xl bg-[color:var(--bg-surface)] border border-[color:var(--border-default)] text-sm text-[color:var(--text-primary)] outline-none focus:border-primary-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-[color:var(--text-secondary)] block mb-1.5">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[color:var(--bg-surface)] border border-[color:var(--border-default)] text-sm text-[color:var(--text-primary)] outline-none focus:border-primary-500/50 cursor-pointer"
                >
                  <option value="INR">₹ INR (Indian Rupee)</option>
                  <option value="USD">$ USD (US Dollar)</option>
                  <option value="EUR">€ EUR (Euro)</option>
                  <option value="GBP">£ GBP (British Pound)</option>
                  <option value="JPY">¥ JPY (Japanese Yen)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-[color:var(--text-secondary)] block mb-1.5">GitHub Username</label>
              <input
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                placeholder="GitHub Username (e.g. ARUNRG3005)"
                className="w-full px-4 py-2.5 rounded-xl bg-[color:var(--bg-surface)] border border-[color:var(--border-default)] text-sm text-[color:var(--text-primary)] outline-none focus:border-primary-500/50 transition-colors"
              />
            </div>

            <button
              onClick={handleSaveProfile}
              className="btn-primary text-sm px-6 py-2.5 mt-2 cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        )

      case 'routine':
        return (
          <div className="space-y-6">
            <h2 className="text-base font-semibold text-[color:var(--text-primary)]">Daily Routine</h2>
            <p className="text-xs text-[color:var(--text-tertiary)] -mt-4">
              Customize your standard daily blocks. These will populate your daily timeline on the dashboard.
            </p>

            <div className="space-y-3">
              {/* Wake Up */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-[color:var(--bg-surface)]/60 border border-[color:var(--border-subtle)] border-dashed opacity-80">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🌅</span>
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--text-primary)]">Wake Up</p>
                    <p className="text-xs text-[color:var(--text-tertiary)]">Synced with Profile settings</p>
                  </div>
                </div>
                <div className="text-sm font-mono px-3 py-1 rounded bg-white/5 border border-white/10 text-[color:var(--text-secondary)]">
                  {wakeTime}
                </div>
              </div>

              {/* Editable items */}
              {localRoutine.map((item, idx) => (
                <div key={item.id} className={cn("flex items-center justify-between p-4 rounded-xl border transition-all", item.enabled ? "bg-[color:var(--bg-surface)] border-primary-500/20" : "bg-[color:var(--bg-surface)]/35 border-[color:var(--border-subtle)] opacity-60")}>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        const updated = [...localRoutine]
                        updated[idx].enabled = !updated[idx].enabled
                        setLocalRoutine(updated)
                      }}
                      className={cn("w-5 h-5 rounded flex items-center justify-center border transition-all cursor-pointer", item.enabled ? "bg-primary-600 border-primary-500 text-white" : "border-white/20 hover:border-white/40")}
                    >
                      {item.enabled && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                    </button>
                    <span className="text-xl">{item.emoji}</span>
                    <span className="text-sm font-medium text-[color:var(--text-primary)]">{item.label}</span>
                  </div>

                  {item.enabled && (
                    <input
                      type="time"
                      value={item.time}
                      onChange={(e) => {
                        const updated = [...localRoutine]
                        updated[idx].time = e.target.value
                        setLocalRoutine(updated)
                      }}
                      className="px-2 py-1 rounded border border-white/10 bg-[color:var(--bg-base)] text-white text-xs font-mono outline-none focus:border-primary-500/60 transition-all cursor-pointer"
                    />
                  )}
                </div>
              ))}

              {/* Sleep */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-[color:var(--bg-surface)]/60 border border-[color:var(--border-subtle)] border-dashed opacity-80">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🌙</span>
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--text-primary)]">Sleep Time</p>
                    <p className="text-xs text-[color:var(--text-tertiary)]">Synced with Profile settings</p>
                  </div>
                </div>
                <div className="text-sm font-mono px-3 py-1 rounded bg-white/5 border border-white/10 text-[color:var(--text-secondary)]">
                  {sleepTime}
                </div>
              </div>
            </div>

            <button
              onClick={handleSaveRoutine}
              className="btn-primary text-sm px-6 py-2.5 mt-2 cursor-pointer"
            >
              Save Daily Routine
            </button>
          </div>
        )

      case 'ai':
        return (
          <div className="space-y-6">
            <h2 className="text-base font-semibold text-[color:var(--text-primary)]">AI & Memory</h2>

            <div>
              <p className="text-sm font-medium text-[color:var(--text-secondary)] mb-3">AI Model</p>
              <div className="space-y-2">
                {AI_MODELS.map(m => (
                  <button key={m.id} onClick={() => setSelectedModel(m.id)} className={cn('w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border text-left transition-all cursor-pointer', selectedModel === m.id ? 'border-primary-500/40 bg-primary-500/8' : 'border-[color:var(--border-subtle)] hover:border-[color:var(--border-default)]')}>
                    <Sparkles className={cn('w-4 h-4', selectedModel === m.id ? 'text-primary-400' : 'text-[color:var(--text-tertiary)]')} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[color:var(--text-primary)]">{m.label}</p>
                      <p className="text-xs text-[color:var(--text-tertiary)]">{m.provider} · {m.speed}</p>
                    </div>
                    {m.recommended && <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-500/15 text-primary-400 font-medium">Recommended</span>}
                    {selectedModel === m.id && <Check className="w-4 h-4 text-primary-400" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-[color:var(--text-secondary)]">Memory Settings</p>
              {([
                ['memoryEnabled', 'Enable Memory', 'AI remembers your context across sessions'],
                ['contextWindow', 'Large Context Window', 'Include more conversation history in AI context'],
                ['personalization', 'Personalization', 'AI adapts responses based on your patterns'],
                ['safetyFilter', 'Safety Filter', 'Filter potentially harmful content'],
              ] as [keyof typeof aiSettings, string, string][]).map(([key, title, desc]) => (
                <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)]">
                  <div>
                    <p className="text-sm font-medium text-[color:var(--text-primary)]">{title}</p>
                    <p className="text-xs text-[color:var(--text-tertiary)] mt-0.5">{desc}</p>
                  </div>
                  <ToggleSwitch checked={aiSettings[key]} onChange={v => setAiSettings(s => ({ ...s, [key]: v }))} />
                </div>
              ))}
            </div>

            <div>
              <label className="text-xs font-medium text-[color:var(--text-secondary)] block mb-1.5">API Key (Groq)</label>
              <input
                type="password"
                placeholder="gsk_••••••••••••••••••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-[color:var(--bg-surface)] border border-[color:var(--border-default)] text-sm text-[color:var(--text-primary)] placeholder-[color:var(--text-muted)] outline-none focus:border-primary-500/50 font-mono"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
          </div>
        )

      case 'appearance':
        return (
          <div className="space-y-6">
            <h2 className="text-base font-semibold text-[color:var(--text-primary)]">Appearance</h2>

            <div>
              <p className="text-sm font-medium text-[color:var(--text-secondary)] mb-3">Theme</p>
              <div className="grid grid-cols-2 gap-3">
                {THEME_OPTIONS.map(t => {
                  const ThemeIcon = t.icon
                  return (
                    <button key={t.id} onClick={() => setTheme(t.id as 'dark' | 'light')} className={cn('flex flex-col items-center gap-2 p-4 rounded-xl border transition-all cursor-pointer', theme === t.id ? 'border-primary-500/40 bg-primary-500/8' : 'border-[color:var(--border-subtle)] hover:border-[color:var(--border-default)]')}>
                      <ThemeIcon className={cn('w-5 h-5', theme === t.id ? 'text-primary-400' : 'text-[color:var(--text-tertiary)]')} />
                      <span className={cn('text-xs font-medium', theme === t.id ? 'text-primary-300' : 'text-[color:var(--text-secondary)]')}>{t.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-[color:var(--text-secondary)] mb-3">Accent Color</p>
              <div className="flex gap-3 flex-wrap">
                {ACCENT_COLORS.map(c => (
                  <button key={c.id} onClick={() => setSelectedAccent(c.id)} title={c.label} className={cn('w-9 h-9 rounded-xl border-2 transition-all cursor-pointer', selectedAccent === c.id ? 'border-white scale-110' : 'border-transparent hover:scale-105')} style={{ background: c.value }}>
                    {selectedAccent === c.id && <Check className="w-4 h-4 text-white mx-auto" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-[color:var(--text-secondary)] mb-1.5">Font Size</p>
              <input type="range" min="12" max="18" defaultValue="14" className="w-full accent-primary cursor-pointer" />
              <div className="flex justify-between text-[10px] text-[color:var(--text-muted)] mt-1">
                <span>Small</span><span>Default</span><span>Large</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)]">
              <div>
                <p className="text-sm font-medium text-[color:var(--text-primary)]">Compact Mode</p>
                <p className="text-xs text-[color:var(--text-tertiary)] mt-0.5">Reduce spacing for more content</p>
              </div>
              <ToggleSwitch checked={false} onChange={() => {}} />
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-6">
            <h2 className="text-base font-semibold text-[color:var(--text-primary)]">Notifications</h2>
            <div className="space-y-3">
              {([
                ['dailyDigest', 'Daily Digest', 'Morning summary of your tasks and events'],
                ['reminders', 'Task Reminders', 'Get reminded before tasks are due'],
                ['habitAlerts', 'Habit Alerts', 'Daily check-in reminders for habits'],
                ['aiSuggestions', 'AI Suggestions', 'Proactive suggestions from your AI'],
                ['weeklyReport', 'Weekly Report', 'Summary of your week every Sunday'],
              ] as [keyof typeof notifs, string, string][]).map(([key, title, desc]) => (
                <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)]">
                  <div>
                    <p className="text-sm font-medium text-[color:var(--text-primary)]">{title}</p>
                    <p className="text-xs text-[color:var(--text-tertiary)] mt-0.5">{desc}</p>
                  </div>
                  <ToggleSwitch checked={notifs[key]} onChange={v => setNotifs(s => ({ ...s, [key]: v }))} />
                </div>
              ))}
            </div>
          </div>
        )

      case 'integrations':
        return (
          <div className="space-y-6">
            <h2 className="text-base font-semibold text-[color:var(--text-primary)]">Integrations</h2>
            <p className="text-xs text-[color:var(--text-tertiary)] -mt-4">
              Configure third-party service connections and tokens.
            </p>

            <div className="p-4 rounded-xl bg-[color:var(--bg-surface)] border border-[color:var(--border-subtle)] space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xl">
                  🐙
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[color:var(--text-primary)]">GitHub API Integration</h3>
                  <p className="text-xs text-[color:var(--text-tertiary)]">Add a personal access token to bypass API rate limits.</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[color:var(--text-secondary)] block mb-1.5">GitHub Personal Access Token (PAT)</label>
                <input
                  type="password"
                  placeholder="ghp_••••••••••••••••••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-[color:var(--bg-base)] border border-[color:var(--border-default)] text-sm text-[color:var(--text-primary)] placeholder-[color:var(--text-muted)] outline-none focus:border-primary-500/50 font-mono"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                />
                <span className="text-[10px] text-[color:var(--text-muted)] mt-1.5 block">
                  To generate a token, go to <strong>GitHub settings &gt; Developer settings &gt; Personal access tokens</strong> and grant <code>repo</code> access.
                </span>
              </div>

              <button
                onClick={handleSaveGithubToken}
                className="btn-primary text-sm px-6 py-2 cursor-pointer"
              >
                Save Integration
              </button>
            </div>
          </div>
        )

      case 'shortcuts':
        return (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-[color:var(--text-primary)]">Keyboard Shortcuts</h2>
            <div className="space-y-1">
              {SHORTCUTS.map(sc => (
                <div key={sc.action} className="flex items-center justify-between px-4 py-3.5 rounded-xl hover:bg-white/[0.02] transition-colors">
                  <span className="text-sm text-[color:var(--text-secondary)]">{sc.action}</span>
                  <div className="flex items-center gap-1">
                    {sc.keys.map(k => (
                      <kbd key={k} className="px-2 py-1 text-xs rounded-lg bg-white/10 text-[color:var(--text-primary)] font-mono border border-white/10">{k}</kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      default:
        return (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <Settings className="w-10 h-10 text-[color:var(--text-tertiary)] mb-3 opacity-30" />
            <p className="text-sm text-[color:var(--text-secondary)]">Coming soon</p>
          </div>
        )
    }
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <div className="w-56 flex-shrink-0 border-r border-[color:var(--border-subtle)] p-3 flex flex-col bg-[color:var(--bg-surface)]/40">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[color:var(--text-muted)] px-3 mb-2">Settings</p>
        <div className="space-y-0.5">
          {SECTIONS.map(s => {
            const SectionIcon = s.icon
            return (
              <button key={s.id} onClick={() => setActiveSection(s.id)} className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all cursor-pointer', activeSection === s.id ? 'bg-primary-600/12 text-primary-300 border border-primary-500/20' : 'text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] hover:bg-white/[0.04]')}>
                <SectionIcon className="w-4 h-4" />
                {s.label}
                {activeSection === s.id && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
              </button>
            )
          })}
        </div>

        <div className="mt-auto pt-4 border-t border-[color:var(--border-subtle)]">
          <p className="text-[10px] text-[color:var(--text-muted)] text-center px-3">ARISE v1.0.0</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 bg-[color:var(--bg-base)]">
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
