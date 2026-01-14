'use client'

import { useEffect, useRef, useState } from 'react'
import { speakSequentialWithPreload } from '@/lib/speakSequentialWithPreload'
import {
  registerReplay,
  setAudioIdle,
} from '@/lib/audioManager'
import { isAudioUnlocked } from '@/lib/audioUnlock'

export type VoiceGuideStatus = 'idle' | 'preparing' | 'speaking'

interface Options {
  autoPlay?: boolean
  allowReplay?: boolean
}

export const useVoiceGuide = (
  text: string,
  {
    autoPlay = true,
    allowReplay = true,
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
      },
      () => {
        setStatus('speaking')
      }
    )
  }

  const replay = () => {
    if (!allowReplay) return
    play()
  }

  useEffect(() => {
    if (!autoPlay) return
    if (hasPlayed.current) return
    if (!isAudioUnlocked()) return

    hasPlayed.current = true
    play()
  }, [])

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