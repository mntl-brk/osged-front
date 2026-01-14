'use client'

import { useEffect, useState } from 'react'
import { Volume2, Loader2, PlayCircle } from 'lucide-react'
import {
  subscribeAudioStatus,
  replayLast,
} from '@/lib/audioManager'

export const GlobalSpeakingIndicator = () => {
  const [status, setStatus] = useState<
    'idle' | 'preparing' | 'speaking'
  >('idle')

  useEffect(() => {
    const unsubscribe = subscribeAudioStatus(setStatus)
    return () => {
      unsubscribe()
    }
  }, [])

  if (status === 'idle') {
    return (
      <button
        onClick={replayLast}
        className="
          fixed top-4 right-4 z-50
          flex items-center gap-2
          bg-primary/90 text-white
          px-4 py-2 rounded-full
          shadow-lg hover:bg-primary
        "
      >
       <PlayCircle size={28} />
        ฟังคำแนะนำ
      </button>
    )
  }

  return (
    <div
      className="
        fixed top-4 right-4 z-50
        flex items-center gap-2
        bg-primary/90 backdrop-blur
        px-4 py-2 rounded-full
        shadow-lg border
      "
    >
      {status === 'preparing' ? (
        <>
          <Loader2 className="text-white animate-spin" />
          <span className="text-white text-sm">กำลังเตรียมเสียง…</span>
        </>
      ) : (
        <>
          <Volume2 className="text-white animate-pulse" />
          <div className="flex items-center gap-1">
            {[1, 2, 3].map(i => (
              <span
                key={i}
                className="w-1.5 bg-white rounded-full animate-wave"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}