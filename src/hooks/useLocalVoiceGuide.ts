'use client'

import { useEffect, useRef, useState } from 'react'
import {
  setAudioSpeaking,
  setAudioIdle,
  setAudioPreparing,
  registerReplay,
} from '@/lib/audioManager'

export type VoiceGuideStatus =
  | 'idle'
  | 'preparing'
  | 'speaking'

interface Options {
  allowReplay?: boolean
  onEnd?: () => void
}

export const useLocalVoiceGuide = (
  audioPath: string,
  autoPlay = true,
  {
    allowReplay = true,
    onEnd,
  }: Options = {}
) => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [status, setStatus] =
    useState<VoiceGuideStatus>('idle')

  const play = async () => {
    if (!audioRef.current) return

    try {
      setStatus('preparing')
      setAudioPreparing()

      await audioRef.current.play()

      setStatus('speaking')
      setAudioSpeaking()
    } catch (err) {
      setStatus('idle')
      setAudioIdle()
    }
  }

  const replay = () => {
    if (!allowReplay) return
    if (!audioRef.current) return

    audioRef.current.currentTime = 0
    play()
  }

  useEffect(() => {
    const audio = new Audio(audioPath)
    audioRef.current = audio

    audio.onended = () => {
      setStatus('idle')
      setAudioIdle()
      onEnd?.()
    }

    if (allowReplay) {
      registerReplay(replay)
    }

    if (autoPlay) {
      play()
    }

    return () => {
      if (!audio.paused) {
        audio.pause()
      }
    }
  }, [audioPath, autoPlay])

  return {
    status,
    isSpeaking: status !== 'idle',
    play,
    replay,
  }
}