'use client'

import { AppShell } from '@/components/public/AppShell'
import { VerificationPage } from '@/components/public/VerificationPage'
import { RequireChromeModal } from '@/components/RequireChromeModal'
import { useRouter } from 'next/navigation'
import { useAssessmentStore } from '@/store/assessmentStore'
import { useVoiceGuideControl } from '@/contexts/VoiceGuideContext'
import { useEffect, useState } from 'react'

export default function VerificationRoute() {
  const router = useRouter()
  const setParticipantId = useAssessmentStore((s) => s.setParticipantId)
  const { setCanReplay } = useVoiceGuideControl()

  const [showChromeWarning, setShowChromeWarning] = useState(false)

  useEffect(() => {
    setCanReplay(false)
    return () => setCanReplay(true)
  }, [])

  useEffect(() => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition

    const isChrome =
      /chrome/i.test(navigator.userAgent) &&
      !/edg/i.test(navigator.userAgent)

    if (!SR || !isChrome) {
      setShowChromeWarning(true)
    }
  }, [])

  return (
    <>
      <RequireChromeModal open={showChromeWarning} />

      <AppShell>
        <VerificationPage
          onSubmit={(code) => {
            if (showChromeWarning) return
            setParticipantId(code)
            router.push('/consent')
          }}
        />
      </AppShell>
    </>
  )
}