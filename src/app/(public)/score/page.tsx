'use client'

import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/public/AppShell'
import { ScorePage } from '@/components/public/ScorePage'
import { useAssessmentStore } from '@/store/assessmentStore'
import { useEffect } from 'react'
import { useVoiceGuideControl } from '@/contexts/VoiceGuideContext'

export default function ScoreRoute() {
  const router = useRouter()

  const { recallScore, moodScore, resetAll } = useAssessmentStore()

  const { setEnabled } = useVoiceGuideControl()

  useEffect(() => {
    if (recallScore === null || moodScore === null) {
      router.replace('/')
    }
  }, [recallScore, moodScore, router])

  useEffect(() => {
    setEnabled(false)
    return () => setEnabled(true)
  }, [setEnabled])

  if (recallScore === null || moodScore === null) return null

  return (
    <AppShell>
      <ScorePage
        recallScore={recallScore}
        moodScore={moodScore}
        onHome={() => {
          resetAll()
          router.push('/')
        }}
      />
    </AppShell>
  )
}