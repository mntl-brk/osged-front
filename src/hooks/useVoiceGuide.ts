'use client'

import { useEffect, useRef, useState } from 'react'
import { speakSequentialWithPreload } from '@/lib/speakSequentialWithPreload'
import {
  registerReplay,
  setAudioIdle,
} from '@/lib/audioManager'
import { isAudioUnlocked, unlockAudio } from '@/lib/audioUnlock'

export type VoiceGuideStatus = 'idle' | 'preparing' | 'speaking'

interface Options {
  autoPlay?: boolean
  allowReplay?: boolean
  onEnd?: () => void
  onStart?: () => void
}

export const useVoiceGuide = (
  text: string,
  {
    autoPlay = true,
    allowReplay = true,
    onEnd,
    onStart,
  }: Options = {}
) => {
  const [status, setStatus] =
    useState<VoiceGuideStatus>('idle')

  const hasPlayed = useRef(false)

  const play = () => {
    if (!isAudioUnlocked()) return

    setStatus('preparing')

    speakSequentialWithPreload(
      text,
      () => {
        setStatus('idle')
        setAudioIdle()
        onEnd?.()
      },
      () => {
        setStatus('speaking')
        onStart?.()
      }
    )
  }

  const replay = async () => {
    if (!allowReplay) return

    if (!isAudioUnlocked()) {
      await unlockAudio()
    }

    play()
  }

  useEffect(() => {
    if (!autoPlay) return
    if (hasPlayed.current) return
    if (!isAudioUnlocked()) return

    hasPlayed.current = true
    play()
  }, [autoPlay, text])

  useEffect(() => {
    if (!allowReplay) return
    registerReplay(replay)
  }, [allowReplay])

  return {
    status,
    isSpeaking: status !== 'idle',
    play,
    replay,
    disableReplay: !allowReplay,
  }
}