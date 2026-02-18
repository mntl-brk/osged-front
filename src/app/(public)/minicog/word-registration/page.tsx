'use client'

import { AppShell } from '@/components/public/AppShell'
import { AssessmentWordRegistrationPage } from '@/components/public/AssessmentWordRegistrationPage'
import { useAssessmentStore } from '@/store/assessmentStore'
import { getWordSetByEducation } from '@/lib/wordSets'
import { createMiniCog } from '@/api/minicog/createMinicog'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export default function WordRegistrationRoute() {
  const router = useRouter()

  const hasHydrated = useAssessmentStore((s) => s.hasHydrated)
  const demographics = useAssessmentStore((s) => s.demographics)
  const sessionId = useAssessmentStore((s) => s.sessionId)

  const currentWordSet = useAssessmentStore((s) => s.currentWordSet)
  const setCurrentWordSet = useAssessmentStore((s) => s.setCurrentWordSet)
  const startedRef = useRef(false)
  
  const [isMiniCogReady, setIsMiniCogReady] = useState(false)
  useEffect(() => {
    (async () => {
      if (!hasHydrated) return 

      if (!demographics) {
        router.replace('/demographics')
        return
      }

      if (!sessionId) {
        alert('Session not found')
        router.replace('/')
        return
      }

      if (!currentWordSet) {
        const wordSet = getWordSetByEducation(demographics.educationLevel)
        setCurrentWordSet(wordSet)
        return
      }

      if (!startedRef.current) {
        startedRef.current = true

        const result = await createMiniCog({
          session_id: sessionId,
          word_set_id: currentWordSet.id,
          words_prompt: currentWordSet.words,
        })

        result.match(
          () => {
            setIsMiniCogReady(true)
          },
          (err) => {
            alert('ไม่สามารถเริ่ม Mini-Cog ได้')
            console.error(err)
            startedRef.current = false
          }
        )
      }
    })()
  }, [hasHydrated, demographics, sessionId, currentWordSet, router, setCurrentWordSet])

  if (!currentWordSet) return null

  return (
    <AppShell>
      <AssessmentWordRegistrationPage
        wordSet={currentWordSet}
        onReroll={() => {
          const newSet = getWordSetByEducation(demographics!.educationLevel)
          setCurrentWordSet(newSet)
        }}
        onNext={() => router.push('/minicog/clock-drawing')}
      />
    </AppShell>
  )
}