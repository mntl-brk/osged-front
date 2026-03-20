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

      audio.pause()
      audio.currentTime = 0

      audio.onended = () => {
        setStatus('idle')
        setAudioIdle()
        onEnd?.()
      }

      await audio.play()

      setStatus('speaking')
      setAudioSpeaking()

      if (allowReplay) {
        registerReplay(() => {
          audio.pause()
          audio.currentTime = 0
          audio.play()
        })

        setLastAudio(audioPath)

      }

    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.error(err)
      }
    }
  }, [audioPath, onEnd, allowReplay])

  const replay = useCallback(() => {
    if (!allowReplay) return

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }


    play()


  }, [allowReplay, play])


  useEffect(() => {
    if (!autoPlay) return

    hasPlayedRef.current = false
    play()
  }, [autoPlay, audioPath])

  return {
    status,
    isSpeaking: status === 'speaking',
    play,
    replay,
  }
}