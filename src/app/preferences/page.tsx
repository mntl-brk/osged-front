'use client'

import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/AppShell'
import { PreferencesPage } from '@/components/PreferencesPage'
import { useAssessmentStore } from '@/store/assessmentStore'

export default function PreferencesRoute() {
  const router = useRouter()
  const fontSize = useAssessmentStore((s) => s.fontSize)
  const setFontSize = useAssessmentStore((s) => s.setFontSize)

  return (
    <AppShell>
      <PreferencesPage
        currentFontSize={fontSize}
        setFontSize={setFontSize}
        onContinue={() => router.push('/demographics')}
      />
    </AppShell>
  )
}