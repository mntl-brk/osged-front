'use client'

import { splitTextIntoChunks } from '@/utils/textSplitter'
import { fetchTTSBlob } from './ttsFetcher'
import { playBlobAndWait } from './playBlobAndWait'
import {
  setAudioPreparing,
  setAudioSpeaking,
  setAudioIdle,
} from './audioManager'

export const speakSequentialWithPreload = async (
  fullText: string,
  onAllEnd?: () => void,
  onStart?: () => void
) => {
  const chunks = splitTextIntoChunks(fullText)
  if (chunks.length === 0) return

  // preparing (TTS / preload)
  setAudioPreparing()

  let nextBlobPromise: Promise<Blob> | null = null

  for (let i = 0; i < chunks.length; i++) {
    // preload current
    if (!nextBlobPromise) {
      nextBlobPromise = fetchTTSBlob(chunks[i])
    }

    const currentBlob = await nextBlobPromise

    // preload next ระหว่างเล่น current
    nextBlobPromise =
      i + 1 < chunks.length
        ? fetchTTSBlob(chunks[i + 1])
        : null

    if (i === 0) {
      setAudioSpeaking()
      onStart?.()
    }

    await playBlobAndWait(currentBlob)
  }

  setAudioIdle()
  onAllEnd?.()
}