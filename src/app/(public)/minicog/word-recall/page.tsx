'use client'

import { AppShell } from '@/components/public/AppShell'
import { AssessmentWordRecallPage } from '@/components/public/AssessmentWordRecallPage'
import { useAssessmentStore } from '@/store/assessmentStore'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { completeMiniCog } from '@/api/minicog/completeMinicog'

export default function WordRecallRoute() {
  const router = useRouter()

  const currentWordSet = useAssessmentStore((s) => s.currentWordSet)
  const setRecallScore = useAssessmentStore((s) => s.setRecallScore)
  const sessionId = useAssessmentStore((s) => s.sessionId)

  useEffect(() => {
    if (!currentWordSet) router.replace('/minicog/intro')
  }, [currentWordSet, router])

  if (!currentWordSet || !sessionId) return null

  return (
    <AppShell>
      <AssessmentWordRecallPage
        correctWordSet={currentWordSet}
        onNext={async (score) => {
          setRecallScore(score)

         try {
            await completeMiniCog({
              session_id: sessionId,
              recall_score: score,
            })

              router.push('/tgds/intro')
            } catch (err) {
              console.error('completeMiniCog failed', err)
            }

        }}
      />
    </AppShell>
  )
}