'use client'

import { useRouter } from 'next/navigation'
import { AppShell } from '@/components/AppShell'
import { IntroMiniCogPage } from '@/components/IntroMiniCogPage'
import { useAssessmentStore } from '@/store/assessmentStore'
import { getRandomWordSet } from '@/lib/wordSets'

export default function MiniCogIntroRoute() {
  const router = useRouter()
  const setCurrentWordSet = useAssessmentStore((s) => s.setCurrentWordSet)

  return (
    <AppShell>
      <IntroMiniCogPage
        onStart={() => {
          setCurrentWordSet(getRandomWordSet())
          router.push('/minicog/word-registration')
        }}
      />
    </AppShell>
  )
}