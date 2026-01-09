'use client'

import { AppShell } from '@/components/AppShell'
import { AssessmentWordRegistrationPage } from '@/components/AssessmentWordRegistrationPage'
import { useAssessmentStore } from '@/store/assessmentStore'
import { getRandomWordSet } from '@/lib/wordSets'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function WordRegistrationRoute() {
  const router = useRouter()
  const currentWordSet = useAssessmentStore((s) => s.currentWordSet)
  const setCurrentWordSet = useAssessmentStore((s) => s.setCurrentWordSet)

  useEffect(() => {
    if (!currentWordSet) router.replace('/minicog/intro')
  }, [currentWordSet, router])

  if (!currentWordSet) return null

  return (
    <AppShell>
      <AssessmentWordRegistrationPage
        wordSet={currentWordSet}
        onReroll={() => setCurrentWordSet(getRandomWordSet(currentWordSet.id))}
        onNext={() => router.push('/minicog/clock-drawing')}
      />
    </AppShell>
  )
}