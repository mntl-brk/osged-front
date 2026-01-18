'use client'

import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/public/AppShell'
import { ScorePage } from '@/components/public/ScorePage'
import { useAssessmentStore } from '@/store/assessmentStore'
import { useEffect } from 'react'

export default function ScoreRoute() {
  const router = useRouter()

  const {
    recallScore,
    moodScore,
    clockImage,
    resetAll,
  } = useAssessmentStore()

  // กันหลุด flow (เข้าหน้า score ตรง ๆ)
  useEffect(() => {
    if (recallScore === null || moodScore === null) {
      router.replace('/')
    }
  }, [recallScore, moodScore, router])

  if (recallScore === null || moodScore === null) return null

  return (
    <AppShell>
      <ScorePage
        recallScore={recallScore}
        moodScore={moodScore}
        clockImage={clockImage}
        onHome={() => {
          resetAll()
          router.push('/')
        }}
      />
    </AppShell>
  )
}