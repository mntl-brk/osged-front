import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DemographicsData, WordSet } from '@/types'

type State = {
  hasHydrated: boolean

  modalContent: string | null

  fontSize: 'small' | 'medium' | 'large'
  language: 'th' | 'en'

  demographics: DemographicsData | null
  participantId: string
  sessionId: string | null

  currentWordSet: WordSet | null
  recallScore: number | null
  moodScore: number | null

  setHasHydrated: (v: boolean) => void
  setModalContent: (v: string | null) => void
  setFontSize: (v: State['fontSize']) => void
  setLanguage: (v: State['language']) => void
  setDemographics: (v: DemographicsData | null) => void
  setSessionId: (id: string) => void
  setParticipantId: (v: string) => void
  setCurrentWordSet: (v: WordSet | null) => void
  setRecallScore: (v: number | null) => void
  setMoodScore: (v: number | null) => void
  resetAll: () => void
}

export const useAssessmentStore = create<State>()(
  persist(
    (set) => ({
      hasHydrated: false,
      modalContent: null,

      fontSize: 'medium',
      language: 'th',

      demographics: null,
      participantId: '',
      sessionId: null,

      currentWordSet: null,
      recallScore: null,
      moodScore: null,

      setHasHydrated: (v) => set({ hasHydrated: v }),
      setModalContent: (v) => set({ modalContent: v }),
      setFontSize: (v) => set({ fontSize: v }),
      setLanguage: (v) => set({ language: v }),
      setDemographics: (v) => set({ demographics: v }),
      setParticipantId: (v) => set({ participantId: v }),
      setSessionId: (id) => set({ sessionId: id }),
      setCurrentWordSet: (v) => set({ currentWordSet: v }),
      setRecallScore: (v) => set({ recallScore: v }),
      setMoodScore: (v) => set({ moodScore: v }),
      
      resetAll: () =>
        set({
          modalContent: null,
          demographics: null,
          participantId: '',
          sessionId: null,
          currentWordSet: null,
          recallScore: null,
          moodScore: null,
        }),
    }),
    {
      name: 'osged-assessment', 
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)