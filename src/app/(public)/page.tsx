'use client'

import { AppShell } from '@/components/public/AppShell'
import { Hero } from '@/components/Hero'
import { InfoSection } from '@/components/public/InfoSection'
import { Footer } from '@/components/Footer'
import { useRouter } from 'next/navigation'
import { useAssessmentStore } from '@/store/assessmentStore'
import { useVoiceGuideControl } from '@/contexts/VoiceGuideContext'
import { useEffect } from 'react'
import { StepGuide } from '@/components/public/StepGuide'

export default function HomePage() {
  const router = useRouter()

  const resetAll = useAssessmentStore((s) => s.resetAll)
  const setModalContent = useAssessmentStore((s) => s.setModalContent)

  const { setEnabled } = useVoiceGuideControl()

  useEffect(() => {
    resetAll() 

    setEnabled(false)

    return () => {
      setEnabled(true)
    }
  }, [resetAll, setEnabled])


  return (
    <AppShell>
      <Hero
        onStart={() => router.push('/verification')}
        onOpenInfo={() => setModalContent('info')}
        onOpenPDPA={() => setModalContent('pdpa')}
      />

      <StepGuide />

      <InfoSection onReadMore={() => setModalContent('project-info')} />


      <Footer
        onOpenInfo={() => setModalContent('project-info')}
        onOpenFAQ={() => setModalContent('faq')}
        onOpenPDPA={() => setModalContent('pdpa')}
        onOpenDoctorPortal={() => router.push('login')}
      />
    </AppShell>
  )
}