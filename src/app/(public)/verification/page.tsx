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
  const setWithInTest = useAssessmentStore((s) => s.setWithInTest)

  // const [showChromeWarning, setShowChromeWarning] = useState(false)

  const { setEnabled } = useVoiceGuideControl()
  
    useEffect(() => {
      setEnabled(false)
  
      return () => {
        setEnabled(true)
      }
    }, [])

  // useEffect(() => {
  //   const SR =
  //     (window as any).SpeechRecognition ||
  //     (window as any).webkitSpeechRecognition

  //   const isChrome =
  //     /chrome/i.test(navigator.userAgent) &&
  //     !/edg/i.test(navigator.userAgent)

  //   if (!SR || !isChrome) {
  //     setShowChromeWarning(true)
  //   }
  // }, [])

  return (
    <>
      {/* <RequireChromeModal open={showChromeWarning} /> */}

      <AppShell>
        <VerificationPage
          onSubmit={(code, withIn) => {
            // if (showChromeWarning) return
            setParticipantId(code)
            setWithInTest(withIn)
            
            router.push('/consent')
          }}
        />
      </AppShell>
    </>
  )
}