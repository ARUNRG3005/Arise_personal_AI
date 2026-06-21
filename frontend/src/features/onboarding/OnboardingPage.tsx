// src/features/onboarding/OnboardingPage.tsx
import { useState } from 'react';
import { useUserStore } from '@/stores/userStore';
import { useUIStore } from '@/stores/uiStore';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  User,
  Briefcase,
  Globe,
  Clock,
  Sparkles,
  Check,
  Plus,
  Trash2,
  Compass,
  Moon,
  Coins,
  ChevronRight,
  Calendar,
  Activity,
  Heart
} from 'lucide-react';

const lifeAreasList = [
  { id: 'study', label: 'Study & Education', emoji: '🎓', color: 'from-blue-500/20 to-indigo-500/20 text-blue-400' },
  { id: 'work', label: 'Work & Projects', emoji: '💼', color: 'from-amber-500/20 to-orange-500/20 text-orange-400' },
  { id: 'health', label: 'Health & Fitness', emoji: '❤️', color: 'from-rose-500/20 to-red-500/20 text-rose-400' },
  { id: 'finance', label: 'Finance & Wealth', emoji: '💰', color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400' },
  { id: 'growth', label: 'Personal Growth', emoji: '🚀', color: 'from-purple-500/20 to-fuchsia-500/20 text-purple-400' },
  { id: 'life', label: 'Personal Life', emoji: '👨‍👩‍👧', color: 'from-sky-500/20 to-cyan-500/20 text-sky-400' },
  { id: 'learning', label: 'Learning & Skills', emoji: '🧠', color: 'from-violet-500/20 to-purple-500/20 text-violet-400' },
];

const presetHabits = [
  { id: 'exercise', label: 'Daily Exercise', emoji: '🏋️' },
  { id: 'read', label: 'Read Books', emoji: '📚' },
  { id: 'meditate', label: 'Mindful Meditation', emoji: '🧘' },
  { id: 'journal', label: 'Reflection Journal', emoji: '✍️' },
];

const currencies = [
  { code: 'INR', symbol: '₹', label: 'Indian Rupee' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen' }
];

export default function OnboardingPage() {
  const { setProfile } = useUserStore();
  const { setOnboardingComplete } = useUIStore();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  // Local state for profile details
  const [name, setName] = useState('');
  const [role, setRole] = useState('Professional');
  const [country, setCountry] = useState('');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata');
  const [language, setLanguage] = useState('en');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [sleepTime, setSleepTime] = useState('22:30');
  const [selectedLifeAreas, setSelectedLifeAreas] = useState<string[]>([]);
  const [currency, setCurrency] = useState('INR');
  
  // Custom & selected habits state
  const [habitsList, setHabitsList] = useState(presetHabits);
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [customHabitInput, setCustomHabitInput] = useState('');

  // Daily timeline routine items
  const [routineItems, setRoutineItems] = useState([
    { id: 'workout', label: 'Morning Workout', emoji: '🏋️', time: '08:00', enabled: false },
    { id: 'focus_morning', label: 'Deep Focus Block', emoji: '💼', time: '09:30', enabled: false },
    { id: 'lunch', label: 'Lunch Break', emoji: '🥗', time: '13:00', enabled: false },
    { id: 'learning', label: 'Skills & Study', emoji: '📚', time: '16:00', enabled: false },
    { id: 'dinner', label: 'Dinner', emoji: '🍽️', time: '20:00', enabled: false },
    { id: 'winddown', label: 'Evening Wind Down', emoji: '🧘', time: '21:30', enabled: false },
  ]);

  // Goals state
  const [goals, setGoals] = useState<string[]>(['']);

  const handleNext = () => {
    if (step < 9) {
      setDirection(1);
      setStep(step + 1);
    } else {
      // 1. Map selected life area strings to Objects
      const mappedLifeAreas = selectedLifeAreas.map(id => {
        const area = lifeAreasList.find(a => a.id === id);
        return {
          id,
          label: area?.label || id,
          emoji: area?.emoji || '✨'
        };
      });

      // 2. Map routine events
      const mappedRoutine = [
        { id: 'wake', label: 'Wake Up', emoji: '🌅', time: wakeTime },
        ...routineItems
          .filter(r => r.enabled)
          .map(r => ({ id: r.id, label: r.label, emoji: r.emoji, time: r.time })),
        { id: 'sleep', label: 'Sleep', emoji: '🌙', time: sleepTime }
      ].sort((a, b) => a.time.localeCompare(b.time));

      // 3. Map goals
      const mappedGoals = goals
        .filter(g => g.trim() !== '')
        .map((g, index) => ({
          id: `goal-${Date.now()}-${index}`,
          title: g,
          emoji: '🎯',
          lifeArea: 'growth',
          createdAt: new Date().toISOString()
        }));

      // Save to Zustand userStore
      setProfile({
        name: name || 'User',
        role: role as any,
        country,
        timezone,
        language,
        wakeTime,
        sleepTime,
        lifeAreas: mappedLifeAreas,
        goals: mappedGoals,
        dailyRoutine: mappedRoutine,
        selectedHabits,
        currency,
      });

      // Set onboarding complete inside uiStore
      setOnboardingComplete(true);

      // Redirect to home
      navigate('/', { replace: true });
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  const toggleLifeArea = (id: string) => {
    setSelectedLifeAreas(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleHabit = (id: string) => {
    setSelectedHabits(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const addCustomHabit = () => {
    if (customHabitInput.trim() !== '') {
      const newId = `custom-${Date.now()}`;
      setHabitsList(prev => [...prev, { id: newId, label: customHabitInput.trim(), emoji: '✨' }]);
      setSelectedHabits(prev => [...prev, newId]);
      setCustomHabitInput('');
    }
  };

  const toggleRoutineItem = (id: string) => {
    setRoutineItems(prev =>
      prev.map(item => item.id === id ? { ...item, enabled: !item.enabled } : item)
    );
  };

  const updateRoutineTime = (id: string, time: string) => {
    setRoutineItems(prev =>
      prev.map(item => item.id === id ? { ...item, time } : item)
    );
  };

  const updateGoal = (index: number, val: string) => {
    const updated = [...goals];
    updated[index] = val;
    setGoals(updated);
  };

  const addGoalField = () => {
    if (goals.length < 5) {
      setGoals([...goals, '']);
    }
  };

  const removeGoalField = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
  };

  // framer-motion slide variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 80 : -80,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -80 : 80,
      opacity: 0,
    }),
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#030712] overflow-x-hidden px-4 py-8 font-sans">
      {/* Premium background mesh lights */}
      <div className="absolute top-1/4 left-1/4 w-[35rem] h-[35rem] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[35rem] h-[35rem] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[45rem] h-[45rem] bg-cyan-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative w-full max-w-xl z-10 flex flex-col">
        
        {/* Step Indicator Header */}
        {step > 0 && step < 9 && (
          <div className="mb-4 px-2 flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-slate-400">
            <span className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-indigo-400 animate-spin-slow" />
              Configure System
            </span>
            <span className="text-[11px] bg-slate-800/40 px-2 py-0.5 rounded-full border border-white/5">
              Step {step} of 8
            </span>
          </div>
        )}

        {/* Custom Progress Bar */}
        {step > 0 && step < 9 && (
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-6 border border-white/5">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500"
              initial={{ width: 0 }}
              animate={{ width: `${(step / 8) * 100}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </div>
        )}

        {/* Card Component */}
        <div className="w-full rounded-3xl border border-white/[0.08] bg-white/[0.02] p-8 md:p-10 shadow-2xl backdrop-blur-2xl transition-all duration-300">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: [0.25, 1, 0.5, 1] }}
              className="flex flex-col h-full min-h-[380px] justify-between"
            >
              
              {/* Step 0: Welcome Screen */}
              {step === 0 && (
                <div className="space-y-6 text-center my-auto flex flex-col items-center">
                  <div className="relative mb-2">
                    <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full scale-125" />
                    <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[1.5px] shadow-lg animate-pulse">
                      <div className="w-full h-full rounded-2xl bg-[#0a0f1d] flex items-center justify-center">
                        <Sparkles className="w-10 h-10 text-indigo-400" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-purple-300 bg-clip-text text-transparent">
                      ARISE
                    </h1>
                    <p className="text-sm font-semibold tracking-widest text-indigo-400 uppercase">
                      Intelligent AI Operating System
                    </p>
                  </div>

                  <p className="text-slate-400 leading-relaxed text-sm max-w-sm">
                    Evolve your day with an companion that learns your habits, manages your goals, and simplifies your cognitive load.
                  </p>

                  <button
                    className="group mt-6 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-semibold py-4.5 px-6 rounded-2xl shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] transition-all duration-300"
                    onClick={handleNext}
                  >
                    Initialize System
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}

              {/* Step 1: Tell us your name */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-indigo-400 tracking-wider uppercase">Identity Setup</span>
                    <h2 className="text-2xl font-bold text-white">What should I call you?</h2>
                    <p className="text-slate-400 text-sm">Your AI companion will use this to address you personally.</p>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      placeholder="Enter your name..."
                      className="w-full pl-12 pr-4 py-4 rounded-xl border border-white/10 bg-white/[0.04] text-white placeholder-slate-500 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 text-base"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoFocus
                    />
                  </div>

                  <div className="pt-8 flex justify-end">
                    <button
                      className={`flex items-center gap-1.5 px-6 py-3 rounded-xl font-semibold shadow-md active:scale-95 transition-all duration-200 ${
                        name.trim() !== ''
                          ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                          : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
                      }`}
                      onClick={handleNext}
                      disabled={name.trim() === ''}
                    >
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Personal Profile Details */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-indigo-400 tracking-wider uppercase">Context & Preferences</span>
                    <h2 className="text-2xl font-bold text-white">Tell me about yourself</h2>
                    <p className="text-slate-400 text-sm">Help me tailor my responses and timings to your location and role.</p>
                  </div>

                  <div className="space-y-4">
                    {/* Role Dropdown */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5" /> Core Activity
                      </label>
                      <div className="relative">
                        <select
                          className="w-full px-4 py-3.5 rounded-xl border border-white/10 bg-[#0a0f1d] text-white outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 text-sm appearance-none cursor-pointer"
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                        >
                          <option value="Student">Student (Academic)</option>
                          <option value="Professional">Professional (Full-time)</option>
                          <option value="Freelancer">Freelancer / Creator</option>
                          <option value="Other">Other / Self-employed</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                          <ChevronRight className="w-4 h-4 rotate-90" />
                        </div>
                      </div>
                    </div>

                    {/* Country Input */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5" /> Country
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. India, United States"
                        className="w-full px-4 py-3.5 rounded-xl border border-white/10 bg-white/[0.03] text-white placeholder-slate-600 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 text-sm"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                      />
                    </div>

                    {/* Timezone & Language Side-by-Side */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Timezone
                        </label>
                        <input
                          type="text"
                          placeholder="Asia/Kolkata"
                          className="w-full px-3 py-3.5 rounded-xl border border-white/10 bg-white/[0.03] text-white placeholder-slate-600 outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 text-xs"
                          value={timezone}
                          onChange={(e) => setTimezone(e.target.value)}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          Language
                        </label>
                        <select
                          className="w-full px-3 py-3.5 rounded-xl border border-white/10 bg-[#0a0f1d] text-white outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 text-xs cursor-pointer"
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                        >
                          <option value="en">English (US/UK)</option>
                          <option value="es">Español</option>
                          <option value="fr">Français</option>
                          <option value="de">Deutsch</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Actions */}
                  <div className="pt-8 flex justify-between">
                    <button
                      className="flex items-center gap-1.5 px-5 py-3 rounded-xl font-semibold border border-white/10 text-slate-300 hover:bg-white/5 active:scale-95 transition-all"
                      onClick={handleBack}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      className="flex items-center gap-1.5 px-6 py-3 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md active:scale-95 transition-all"
                      onClick={handleNext}
                    >
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Wake/Sleep rhythm */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-indigo-400 tracking-wider uppercase">Circadian Cycle</span>
                    <h2 className="text-2xl font-bold text-white">What is your sleep rhythm?</h2>
                    <p className="text-slate-400 text-sm">I will arrange your daily summaries and focus periods relative to these hours.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Wake up input card */}
                    <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.03] space-y-4 text-center">
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center mx-auto">
                        <Sparkles className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-white">Wake Up Time</p>
                        <p className="text-xs text-slate-400">Time to start the day</p>
                      </div>
                      <input
                        type="time"
                        className="mx-auto block px-3 py-2 rounded-lg border border-white/10 bg-[#0a0f1d] text-white text-lg font-mono text-center outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all cursor-pointer"
                        value={wakeTime}
                        onChange={(e) => setWakeTime(e.target.value)}
                      />
                    </div>

                    {/* Sleep time input card */}
                    <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.03] space-y-4 text-center">
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center mx-auto">
                        <Moon className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-white">Sleep Time</p>
                        <p className="text-xs text-slate-400">Wind down and rest</p>
                      </div>
                      <input
                        type="time"
                        className="mx-auto block px-3 py-2 rounded-lg border border-white/10 bg-[#0a0f1d] text-white text-lg font-mono text-center outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all cursor-pointer"
                        value={sleepTime}
                        onChange={(e) => setSleepTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="pt-8 flex justify-between">
                    <button
                      className="flex items-center gap-1.5 px-5 py-3 rounded-xl font-semibold border border-white/10 text-slate-300 hover:bg-white/5 active:scale-95 transition-all"
                      onClick={handleBack}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      className="flex items-center gap-1.5 px-6 py-3 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md active:scale-95 transition-all"
                      onClick={handleNext}
                    >
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Select Life Areas */}
              {step === 4 && (
                <div className="space-y-5">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-indigo-400 tracking-wider uppercase">Focal Vectors</span>
                    <h2 className="text-2xl font-bold text-white">Select areas of life</h2>
                    <p className="text-slate-400 text-xs">Choose which focus areas you want to organize in ARISE.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                    {lifeAreasList.map((area) => {
                      const isSelected = selectedLifeAreas.includes(area.id);
                      return (
                        <button
                          key={area.id}
                          type="button"
                          className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-300 relative overflow-hidden group ${
                            isSelected
                              ? 'bg-gradient-to-r from-indigo-950/40 to-slate-900 border-indigo-500/60 shadow-[0_0_12px_rgba(99,102,241,0.15)]'
                              : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'
                          }`}
                          onClick={() => toggleLifeArea(area.id)}
                        >
                          <span className="text-2xl flex-shrink-0">{area.emoji}</span>
                          <span className="text-sm font-semibold text-slate-200">{area.label}</span>
                          
                          {isSelected && (
                            <div className="ml-auto w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                              <Check className="w-3 h-3 text-white stroke-[3px]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-6 flex justify-between">
                    <button
                      className="flex items-center gap-1.5 px-5 py-3 rounded-xl font-semibold border border-white/10 text-slate-300 hover:bg-white/5 active:scale-95 transition-all"
                      onClick={handleBack}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      className={`flex items-center gap-1.5 px-6 py-3 rounded-xl font-semibold shadow-md active:scale-95 transition-all duration-200 ${
                        selectedLifeAreas.length > 0
                          ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                          : 'bg-white/5 text-slate-500 cursor-not-allowed border border-white/5'
                      }`}
                      onClick={handleNext}
                      disabled={selectedLifeAreas.length === 0}
                    >
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 5: Habits Builder */}
              {step === 5 && (
                <div className="space-y-5">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-indigo-400 tracking-wider uppercase">Habit Loop Engine</span>
                    <h2 className="text-2xl font-bold text-white">Which habits to build?</h2>
                    <p className="text-slate-400 text-xs">Choose preset items, or write your own to track in your dashboard.</p>
                  </div>

                  {/* Preset Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {habitsList.map((h) => {
                      const isSelected = selectedHabits.includes(h.id);
                      return (
                        <button
                          key={h.id}
                          type="button"
                          className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all duration-200 ${
                            isSelected
                              ? 'bg-indigo-950/40 border-indigo-500/50 text-white shadow-[0_0_8px_rgba(99,102,241,0.1)]'
                              : 'bg-white/[0.02] border-white/5 text-slate-300 hover:border-white/10 hover:bg-white/[0.04]'
                          }`}
                          onClick={() => toggleHabit(h.id)}
                        >
                          <span className="text-lg">{h.emoji}</span>
                          <span className="text-xs font-medium truncate">{h.label}</span>
                          
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-indigo-400 ml-auto flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Habit Box */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add custom habit (e.g. Drink Water)..."
                      className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] text-white placeholder-slate-600 outline-none text-xs focus:border-indigo-500/50"
                      value={customHabitInput}
                      onChange={(e) => setCustomHabitInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addCustomHabit()}
                    />
                    <button
                      type="button"
                      className="px-4 py-2.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 text-xs font-semibold flex items-center gap-1 active:scale-95 transition-all border border-white/5"
                      onClick={addCustomHabit}
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      className="flex items-center gap-1.5 px-5 py-3 rounded-xl font-semibold border border-white/10 text-slate-300 hover:bg-white/5 active:scale-95 transition-all"
                      onClick={handleBack}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      className="flex items-center gap-1.5 px-6 py-3 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md active:scale-95 transition-all"
                      onClick={handleNext}
                    >
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 6: Daily Routine (Timeline Builder) */}
              {step === 6 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-indigo-400 tracking-wider uppercase">Day Structure</span>
                    <h2 className="text-2xl font-bold text-white">Daily Routine timeline</h2>
                    <p className="text-slate-400 text-xs">Enable key events to overlay on your calendar and dashboard schedule.</p>
                  </div>

                  {/* Vertical list of events */}
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                    {/* Auto-locked Wake Up */}
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-white/10 bg-white/[0.01] opacity-75">
                      <span className="text-lg">🌅</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white">Wake Up</p>
                        <p className="text-[10px] text-indigo-400 font-medium">Synced circadian rhythm</p>
                      </div>
                      <span className="text-xs font-mono bg-indigo-950/40 text-indigo-300 px-2 py-1 rounded border border-indigo-500/20">{wakeTime}</span>
                    </div>

                    {/* Chooseable Routine list */}
                    {routineItems.map((item) => (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
                          item.enabled
                            ? 'bg-white/[0.03] border-white/10 shadow-[0_0_6px_rgba(255,255,255,0.02)]'
                            : 'bg-white/[0.01] border-white/5 opacity-50'
                        }`}
                      >
                        <button
                          type="button"
                          className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                            item.enabled
                              ? 'bg-indigo-600 border-indigo-500 text-white'
                              : 'border-white/20 hover:border-white/40'
                          }`}
                          onClick={() => toggleRoutineItem(item.id)}
                        >
                          {item.enabled && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                        </button>
                        
                        <span className="text-lg">{item.emoji}</span>
                        
                        <span className="text-xs font-semibold text-white flex-1">{item.label}</span>

                        {item.enabled && (
                          <input
                            type="time"
                            className="px-2 py-1 rounded border border-white/10 bg-[#0a0f1d] text-white text-xs font-mono outline-none focus:border-indigo-500/60 transition-all cursor-pointer"
                            value={item.time}
                            onChange={(e) => updateRoutineTime(item.id, e.target.value)}
                          />
                        )}
                      </div>
                    ))}

                    {/* Auto-locked Sleep */}
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-white/10 bg-white/[0.01] opacity-75">
                      <span className="text-lg">🌙</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white">Sleep Time</p>
                        <p className="text-[10px] text-indigo-400 font-medium">Synced circadian rhythm</p>
                      </div>
                      <span className="text-xs font-mono bg-indigo-950/40 text-indigo-300 px-2 py-1 rounded border border-indigo-500/20">{sleepTime}</span>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      className="flex items-center gap-1.5 px-5 py-3 rounded-xl font-semibold border border-white/10 text-slate-300 hover:bg-white/5 active:scale-95 transition-all"
                      onClick={handleBack}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      className="flex items-center gap-1.5 px-6 py-3 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md active:scale-95 transition-all"
                      onClick={handleNext}
                    >
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 7: Goals setup */}
              {step === 7 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-indigo-400 tracking-wider uppercase">Aspirational Targets</span>
                    <h2 className="text-2xl font-bold text-white">Core Goals for this year</h2>
                    <p className="text-slate-400 text-xs">Define what you want to achieve (up to 5 goals).</p>
                  </div>

                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                    {goals.map((goal, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <span className="text-xs font-bold font-mono text-slate-500 w-5 text-right">{index + 1}.</span>
                        <input
                          type="text"
                          placeholder={`Goal ${index + 1} (e.g. Build mobile app, Read 12 books)...`}
                          className="flex-1 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.03] text-white placeholder-slate-600 outline-none text-xs focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
                          value={goal}
                          onChange={(e) => updateGoal(index, e.target.value)}
                        />
                        {goals.length > 1 && (
                          <button
                            type="button"
                            className="p-3 rounded-xl border border-white/5 bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 transition-colors active:scale-90"
                            onClick={() => removeGoalField(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {goals.length < 5 && (
                    <button
                      type="button"
                      className="w-full py-2.5 rounded-xl border border-dashed border-white/10 hover:border-white/20 bg-white/[0.01] hover:bg-white/[0.02] text-xs text-slate-300 font-semibold flex items-center justify-center gap-1 active:scale-95 transition-all"
                      onClick={addGoalField}
                    >
                      <Plus className="w-4 h-4" /> Add Goal
                    </button>
                  )}

                  <div className="pt-4 flex justify-between">
                    <button
                      className="flex items-center gap-1.5 px-5 py-3 rounded-xl font-semibold border border-white/10 text-slate-300 hover:bg-white/5 active:scale-95 transition-all"
                      onClick={handleBack}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      className="flex items-center gap-1.5 px-6 py-3 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md active:scale-95 transition-all"
                      onClick={handleNext}
                    >
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 8: Currency selection */}
              {step === 8 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-indigo-400 tracking-wider uppercase">Financial Units</span>
                    <h2 className="text-2xl font-bold text-white">Select currency</h2>
                    <p className="text-slate-400 text-sm">Choose your primary currency for expense and budget tracking.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    {currencies.map((curr) => {
                      const isSelected = currency === curr.code;
                      return (
                        <button
                          key={curr.code}
                          type="button"
                          className={`flex items-center gap-3.5 p-4 rounded-xl border text-left transition-all duration-200 ${
                            isSelected
                              ? 'bg-indigo-950/40 border-indigo-500/50 shadow-[0_0_10px_rgba(99,102,241,0.12)]'
                              : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'
                          }`}
                          onClick={() => setCurrency(curr.code)}
                        >
                          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-base font-bold text-indigo-400">
                            {curr.symbol}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white">{curr.code}</p>
                            <p className="text-[10px] text-slate-400 truncate">{curr.label}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-8 flex justify-between">
                    <button
                      className="flex items-center gap-1.5 px-5 py-3 rounded-xl font-semibold border border-white/10 text-slate-300 hover:bg-white/5 active:scale-95 transition-all"
                      onClick={handleBack}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </button>
                    <button
                      className="flex items-center gap-1.5 px-6 py-3 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md active:scale-95 transition-all"
                      onClick={handleNext}
                    >
                      Next
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 9: Celebration / Finish */}
              {step === 9 && (
                <div className="space-y-6 text-center my-auto flex flex-col items-center">
                  <div className="relative mb-2">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full scale-125" />
                    <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 p-[1.5px] shadow-lg animate-bounce">
                      <div className="w-full h-full rounded-2xl bg-[#0a0f1d] flex items-center justify-center">
                        <Check className="w-10 h-10 text-emerald-400 stroke-[3px]" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-3xl font-extrabold text-white">System Configured!</h2>
                    <p className="text-sm font-semibold tracking-wider text-emerald-400 uppercase">
                      Welcome aboard, {name}
                    </p>
                  </div>

                  <div className="w-full p-5 rounded-2xl border border-white/5 bg-white/[0.01] grid grid-cols-3 gap-3 text-center text-xs">
                    <div className="space-y-1">
                      <span className="block text-slate-400 font-medium">Life Areas</span>
                      <span className="block text-base font-bold text-white">{selectedLifeAreas.length}</span>
                    </div>
                    <div className="space-y-1 border-x border-white/5">
                      <span className="block text-slate-400 font-medium">Habits</span>
                      <span className="block text-base font-bold text-white">{selectedHabits.length}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="block text-slate-400 font-medium">Goals</span>
                      <span className="block text-base font-bold text-white">
                        {goals.filter(g => g.trim() !== '').length}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-400 leading-relaxed text-xs max-w-xs">
                    ARISE has synthesized your rhythm and targets. Your dashboard is compiled and ready for activation.
                  </p>

                  <button
                    className="group mt-4 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:via-teal-500 hover:to-cyan-500 text-white font-semibold py-4.5 px-6 rounded-2xl shadow-lg hover:shadow-emerald-500/20 active:scale-[0.98] transition-all duration-300"
                    onClick={handleNext}
                  >
                    Enter Operating System
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
