'use client'

import { AppShell } from '@/components/AppShell'
import { AssessmentWordRecallPage } from '@/components/AssessmentWordRecallPage'
import { useAssessmentStore } from '@/store/assessmentStore'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function WordRecallRoute() {
  const router = useRouter()
  const currentWordSet = useAssessmentStore((s) => s.currentWordSet)
  const setRecallScore = useAssessmentStore((s) => s.setRecallScore)

  useEffect(() => {
    if (!currentWordSet) router.replace('/minicog/intro')
  }, [currentWordSet, router])

  if (!currentWordSet) return null

  return (
    <AppShell>
      <AssessmentWordRecallPage
        correctWordSet={currentWordSet}
        onNext={(score /*, recalledWords */) => {
          setRecallScore(score)
          router.push('/tgds/intro')
        }}
      />
    </AppShell>
  )
}