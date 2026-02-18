'use client'

let currentAudio: HTMLAudioElement | null = null
let currentUrl: string | null = null

export type AudioStatus = 'idle' | 'preparing' | 'speaking'

let audioStatus: AudioStatus = 'idle'
let replayHandler: (() => void) | null = null

const listeners = new Set<(status: AudioStatus) => void>()

const notify = () => {
  listeners.forEach(fn => fn(audioStatus))
}

export const registerReplay = (fn: () => void) => {
  replayHandler = fn
}

export const replayLast = () => {
  replayHandler?.()
}

export const subscribeAudioStatus = (
  fn: (status: AudioStatus) => void
) => {
  listeners.add(fn)
  fn(audioStatus)
  return () => listeners.delete(fn)
}

export const subscribeSpeaking = (
  fn: (speaking: boolean) => void
) =>
  subscribeAudioStatus(status =>
    fn(status === 'speaking')
  )

export const setAudioPreparing = () => {
  audioStatus = 'preparing'
  notify()
}

export const setAudioSpeaking = () => {
  audioStatus = 'speaking'
  notify()
}

export const setAudioIdle = () => {
  audioStatus = 'idle'
  notify()
}

export const playAudioBlob = (
  blob: Blob,
  onEnded?: () => void
) => {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
  }

  if (currentUrl) {
    URL.revokeObjectURL(currentUrl)
  }

  currentUrl = URL.createObjectURL(blob)
  currentAudio = new Audio(currentUrl)

  setAudioSpeaking()

  currentAudio.onended = () => {
    setAudioIdle()
    onEnded?.()
  }

  currentAudio.onerror = () => {
    setAudioIdle()
    onEnded?.()
  }

  currentAudio.play().catch((err) => {
    if (err.name !== 'AbortError') {
      console.warn('Audio play error:', err)
    }
    setAudioIdle()
  })
}

export const stopAudio = () => {
  if (!currentAudio) return

  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
  }

  if (currentUrl) {
    URL.revokeObjectURL(currentUrl)
  }

  currentAudio = null
  currentUrl = null

  setAudioIdle()
}

export const getIsSpeaking = () =>
  audioStatus === 'speaking'