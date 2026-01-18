'use client'

import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/public/AppShell'
import { AssessmentMoodTGDSPage } from '@/components/public/AssessmentMoodTGDSPage'
import { useAssessmentStore } from '@/store/assessmentStore'

export default function TGDSAssessmentRoute() {
  const router = useRouter()
  const setMoodScore = useAssessmentStore((s) => s.setMoodScore)

  return (
    <AppShell>
      <AssessmentMoodTGDSPage
        onComplete={(score: number) => {
          setMoodScore(score)
          router.push('/score')
        }}
      />
    </AppShell>
  )
}