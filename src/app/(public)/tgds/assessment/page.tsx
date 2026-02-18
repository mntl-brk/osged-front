'use client'

import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/public/AppShell'
import { AssessmentMoodTGDSPage } from '@/components/public/AssessmentMoodTGDSPage'
import { useAssessmentStore } from '@/store/assessmentStore'
import { completeTGDS } from '@/api/tgds/completeTGDS'

export default function TGDSAssessmentRoute() {
  const router = useRouter()
  const setMoodScore = useAssessmentStore((s) => s.setMoodScore)
  const sessionId = useAssessmentStore((s) => s.sessionId)

  return (
    <AppShell>
      <AssessmentMoodTGDSPage
        onComplete={async (score: number) => {
          
          if (!sessionId) return
          await completeTGDS({
            session_id: sessionId,
            total_score: score,
          })

          setMoodScore(score)
          router.push('/score')
        }}
      />
    </AppShell>
  )
}