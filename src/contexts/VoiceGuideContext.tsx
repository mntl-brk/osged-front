'use client'

import { createContext, useContext, useEffect, useState } from 'react'

interface VoiceGuideContextValue {
  canReplay: boolean
  setCanReplay: (v: boolean) => void
  ready: boolean
}

const VoiceGuideContext =
  createContext<VoiceGuideContextValue | null>(null)

export const VoiceGuideProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [canReplay, setCanReplay] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true) 
  }, [])

  return (
    <VoiceGuideContext.Provider
      value={{ canReplay, setCanReplay, ready }}
    >
      {children}
    </VoiceGuideContext.Provider>
  )
}

export const useVoiceGuideControl = () => {
  const ctx = useContext(VoiceGuideContext)
  if (!ctx)
    throw new Error(
      'useVoiceGuideControl must be used inside VoiceGuideProvider'
    )
  return ctx
}