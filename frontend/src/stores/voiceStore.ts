import { create } from 'zustand'

export type VoiceState = 'idle' | 'wake' | 'listening' | 'processing' | 'speaking'

interface VoiceStore {
  state: VoiceState
  setState: (state: VoiceState) => void
  transcript: string
  setTranscript: (transcript: string) => void
}

export const useVoiceStore = create<VoiceStore>((set) => ({
  state: 'idle',
  setState: (state) => set({ state }),
  transcript: '',
  setTranscript: (transcript) => set({ transcript }),
}))
