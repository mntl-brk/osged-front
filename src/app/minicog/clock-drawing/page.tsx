'use client'

import { AppShell } from '@/components/AppShell'
import { AssessmentClockDrawingPage } from '@/components/AssessmentClockDrawingPage'
import { useAssessmentStore } from '@/store/assessmentStore'
import { useRouter } from 'next/navigation'

export default function ClockDrawingRoute() {
  const router = useRouter()
  const setClockImage = useAssessmentStore((s) => s.setClockImage)

  return (
    <AppShell>
      <AssessmentClockDrawingPage
        onNext={(imageData) => {
          setClockImage(imageData)
          router.push('/minicog/word-recall')
        }}
      />
    </AppShell>
  )
}