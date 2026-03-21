'use client'

import { AppShell } from '@/components/public/AppShell'
import { AssessmentWordRecallPage } from '@/components/public/AssessmentWordRecallPage'
import { useAssessmentStore } from '@/store/assessmentStore'
import { useRouter } from 'next/navigation'
import { finalizeRecall } from '@/api/minicog/finalizeRecall'

export default function WordRecallRoute() {
  const router = useRouter()

  const sessionId =
  useAssessmentStore((s) => s.sessionId)
  const setRecallScore = useAssessmentStore((s) => s.setRecallScore)

  if (!sessionId) return null

  return (
    <AppShell>
      <AssessmentWordRecallPage
        onNext={async (transcript, segments) => {
          try {
            const result = await finalizeRecall({
              session_id: sessionId,
              user_transcript: transcript,
              segments: segments.map(s => ({
                text: s.text,
                confidence: s.confidence,
              })),
            })

            result.match(
              (data) => {
                setRecallScore(data.recall_score)
                router.push('/tgds/intro')
              },
              (err) => {
                console.error(err)
                alert('เกิดข้อผิดพลาด')
              }
            )
          } catch (err) {
            console.error('finalizeRecall failed', err)
          }
        }}
      />
    </AppShell>
  )
}