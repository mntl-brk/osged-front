'use client'

import { AppShell } from '@/components/AppShell'
import { Hero } from '@/components/Hero'
import { InfoSection } from '@/components/InfoSection'
import { Footer } from '@/components/Footer'
import { useRouter } from 'next/navigation'
import { useAssessmentStore } from '@/store/assessmentStore'

export default function HomePage() {
  const router = useRouter()
  const setModalContent = useAssessmentStore((s) => s.setModalContent)

  return (
    <AppShell>
      <Hero
        onStart={() => router.push('/verification')}
        onOpenInfo={() => setModalContent('info')}
        onOpenPDPA={() => setModalContent('pdpa')}
      />

      <InfoSection onReadMore={() => setModalContent('project-info')} />

      <Footer
        onOpenInfo={() => setModalContent('project-info')}
        onOpenFAQ={() => setModalContent('faq')}
        onOpenPDPA={() => setModalContent('pdpa')}
        onOpenDoctorPortal={() => router.push('/doctor')}
      />
    </AppShell>
  )
}