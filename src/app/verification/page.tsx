'use client'

import { AppShell } from '@/components/AppShell'
import { VerificationPage } from '@/components/VerificationPage'
import { useRouter } from 'next/navigation'
import { useAssessmentStore } from '@/store/assessmentStore'

export default function VerificationRoute() {
  const router = useRouter()
  const setVolunteerCode = useAssessmentStore((s) => s.setVolunteerCode)

  return (
    <AppShell>
      <VerificationPage
        onSubmit={(code) => {
          setVolunteerCode(code)
          router.push('/consent')
        }}
      />
    </AppShell>
  )
}