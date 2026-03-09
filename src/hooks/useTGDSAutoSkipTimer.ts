import { useEffect, useRef, useState } from 'react'

interface Options {
  isAiSpeaking: boolean
  isListening: boolean
  isSubmitting: boolean
  onSkip: () => void
}

export const useTGDSAutoSkipTimer = ({
  isAiSpeaking,
  isListening,
  isSubmitting,
  onSkip,
}: Options) => {

  const [showHint, setShowHint] = useState(false)

  const startTimeRef = useRef<number | null>(null)
  const autoSkippedRef = useRef(false)

  const resetTimer = () => {
    startTimeRef.current = Date.now()
    autoSkippedRef.current = false
    setShowHint(false)
  }

  /* start timer when AI finished */

  useEffect(() => {

    if (isAiSpeaking) return

    if (!startTimeRef.current) {
      resetTimer()
    }

  }, [isAiSpeaking])

  /* reset timer when user speaks */

  const onUserActivity = () => {
    resetTimer()
  }

  /* silence detection */

  useEffect(() => {

    const interval = setInterval(() => {

      if (!startTimeRef.current) return
      if (isAiSpeaking || isListening || isSubmitting) return

      const elapsed = Date.now() - startTimeRef.current

      if (elapsed > 30000 && !showHint) {
        setShowHint(true)
      }

      if (elapsed > 120000 && !autoSkippedRef.current) {

        autoSkippedRef.current = true
        onSkip()

      }

    }, 1000)

    return () => clearInterval(interval)

  }, [isAiSpeaking, isListening, isSubmitting, showHint])

  return {
    showHint,
    onUserActivity,
    resetTimer,
  }

}