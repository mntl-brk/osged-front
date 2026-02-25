'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import {
  setAudioSpeaking,
  setAudioIdle,
  setAudioPreparing,
  registerReplay,
  setLastAudio,
} from '@/lib/audioManager'
import { isAudioUnlocked } from '@/lib/audioUnlock'

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
  const hasPlayedRef = useRef(false)

  const [status, setStatus] =
    useState<VoiceGuideStatus>('idle')

  const play = useCallback(async () => {
    if (!isAudioUnlocked()) return

    if (!audioRef.current) {
      audioRef.current = new Audio(audioPath)
      audioRef.current.preload = 'auto'
    }

    const audio = audioRef.current

    try {
      setStatus('preparing')
      setAudioPreparing()

      audio.currentTime = 0

      audio.onended = () => {
        setStatus('idle')
        setAudioIdle()
        onEnd?.()
      }

      await audio.play()

      setStatus('speaking')
      setAudioSpeaking()
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.error(err)
      }
    }
  }, [audioPath, onEnd])

  const replay = useCallback(() => {
    if (!allowReplay) return
    play()
  }, [allowReplay, play])

  // autoplay
  useEffect(() => {
    if (!autoPlay) return
    if (hasPlayedRef.current) return

    hasPlayedRef.current = true
    play()
  }, [autoPlay, play])

  useEffect(() => {
    if (allowReplay) {
      registerReplay(replay)
    }
  }, [allowReplay, replay])

  return {
    status,
    isSpeaking: status === 'speaking',
    play,
    replay,
  }
}