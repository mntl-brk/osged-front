'use client'

import { useEffect, useRef } from 'react'
import { AppShell } from '@/components/public/AppShell'
import { AssessmentClockDrawingPage } from '@/components/public/AssessmentClockDrawingPage'
import { useAssessmentStore } from '@/store/assessmentStore'
import { createClockDrawing } from '@/api/minicog/clock/createClockDrawing'
import { useRouter } from 'next/navigation'

export default function ClockDrawingRoute() {
  const router = useRouter()

  const minicogId = useAssessmentStore((s) => s.minicogId)

  const startedRef = useRef(false)

  useEffect(() => {
    if (!minicogId) {
      router.replace('/')
      return
    }

    if (startedRef.current) return

    startedRef.current = true

    createClockDrawing(minicogId).then((res) =>
      res.match(
        () => {},
        () => alert('ไม่สามารถเริ่มการวาดนาฬิกาได้')
      )
    )
  }, [minicogId, router])

  return (
    <AppShell>
      <AssessmentClockDrawingPage
        onNext={() => {
          router.push('/minicog/word-recall')
        }}
      />
    </AppShell>
  )
}