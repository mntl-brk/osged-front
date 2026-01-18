'use client'

import { AppShell } from '@/components/public/AppShell'
import { AssessmentWordRegistrationPage } from '@/components/public/AssessmentWordRegistrationPage'
import { useAssessmentStore } from '@/store/assessmentStore'
import { getWordSetByEducation } from '@/lib/wordSets'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function WordRegistrationRoute() {
  const router = useRouter()

  const demographics = useAssessmentStore((s) => s.demographics)
  const currentWordSet = useAssessmentStore((s) => s.currentWordSet)
  const setCurrentWordSet = useAssessmentStore((s) => s.setCurrentWordSet)

  useEffect(() => {
    if (!demographics) {
      router.replace('/demographics')
      return
    }

    if (!currentWordSet) {
      const wordSet = getWordSetByEducation(demographics.educationLevel)
      setCurrentWordSet(wordSet)
    }
  }, [demographics, currentWordSet, router, setCurrentWordSet])

  if (!currentWordSet) return null

  return (
    <AppShell>
      <AssessmentWordRegistrationPage
        wordSet={currentWordSet}
        onReroll={() => {
          setCurrentWordSet(currentWordSet)
        }}
        onNext={() => router.push('/minicog/clock-drawing')}
      />
    </AppShell>
  )
}