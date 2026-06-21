// src/stores/userStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Goal, RoutineItem, MoodEntry, LifeArea } from '../types';

type UserRole = 'Student' | 'Professional' | 'Freelancer' | 'Other';

type Currency = string; // e.g., 'INR', 'USD'

interface UserProfile {
  name: string;
  role: UserRole;
  country: string;
  timezone: string;
  language: string;
  wakeTime: string; // "07:00"
  sleepTime: string; // "22:30"
  lifeAreas: LifeArea[];
  goals: Goal[];
  dailyRoutine: RoutineItem[];
  selectedHabits: string[]; // habit ids
  currency: Currency;
  githubUsername?: string;
  mood?: MoodEntry;
}

interface UserStore {
  profile: UserProfile;
  setProfile: (profile: Partial<UserProfile>) => void;
  resetProfile: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      profile: {
        name: '',
        role: 'Other',
        country: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: 'en',
        wakeTime: '07:00',
        sleepTime: '22:30',
        lifeAreas: [],
        goals: [],
        dailyRoutine: [],
        selectedHabits: [],
        currency: 'INR',
        githubUsername: 'ARUNRG3005',
        mood: undefined,
      },
      setProfile: (partial) =>
        set((state) => ({
          profile: { ...state.profile, ...partial },
        })),
      resetProfile: () =>
        set(() => ({
          profile: {
            name: '',
            role: 'Other',
            country: '',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: 'en',
            wakeTime: '07:00',
            sleepTime: '22:30',
            lifeAreas: [],
            goals: [],
            dailyRoutine: [],
            selectedHabits: [],
            currency: 'INR',
            githubUsername: 'ARUNRG3005',
            mood: undefined,
          },
        })),
    }),
    {
      name: 'arise-user',
      // Persist everything except potentially large arrays if needed
      // Here we persist the whole profile
    }
  )
);
