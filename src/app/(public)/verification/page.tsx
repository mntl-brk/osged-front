'use client'

import { AppShell } from '@/components/public/AppShell'
import { VerificationPage } from '@/components/public/VerificationPage'
import { useRouter } from 'next/navigation'
import { useAssessmentStore } from '@/store/assessmentStore'
import { useVoiceGuideControl } from '@/contexts/VoiceGuideContext'
import { useEffect } from 'react'

export default function VerificationRoute() {
  const router = useRouter()
  const setParticipantCode = useAssessmentStore((s) => s.setParticipantId)
  const { setCanReplay } = useVoiceGuideControl()

  useEffect(() => {
    setCanReplay(false)      
    return () => setCanReplay(true) 
  }, [])
  return (
    <AppShell>
      <VerificationPage
        onSubmit={(code) => {
          setParticipantCode(code)
          router.push('/consent')
        }}
      />
    </AppShell>
  )
}