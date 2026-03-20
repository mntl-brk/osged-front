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

export function replayLast() {

  if (replayHandler) {
    replayHandler()
    return
  }


  if (!lastAudioPath) return


  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
  }

  const audio = new Audio(lastAudioPath)
  currentAudio = audio

  setAudioPreparing()

  audio.onended = () => {
    setAudioIdle()
  }

  audio.onerror = () => {
    setAudioIdle()
  }

  audio.play()
    .then(() => {
      setAudioSpeaking()
      
      registerReplay(() => {
          audio.pause()
          audio.currentTime = 0
          audio.play()
        })
      })
    .catch(() => {
      setAudioIdle()
    })
}

export const subscribeAudioStatus = (
  fn: (status: AudioStatus) => void
) => {
  listeners.add(fn)
  fn(audioStatus)

  return () => {
    listeners.delete(fn)
  }
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

let lastAudioPath: string | null = null

export function setLastAudio(path: string) {
  lastAudioPath = path

  if (typeof window !== 'undefined') {
    localStorage.setItem('lastAudioPath', path)
  }
  notify()
}

export function initAudioManager() {
  if (typeof window === 'undefined') return

  const saved = localStorage.getItem('lastAudioPath')
  if (saved) {
    lastAudioPath = saved
    currentAudio = new Audio(saved)
  }

  notify()
}


export const playAudioUrl = async (
  path: string,
  onEnded?: () => void,
  options?: { remember?: boolean }
) => {
  stopAudio()


  return new Promise<void>((resolve, reject) => {
  
    const audio = new Audio(path)
    currentAudio = audio

    const cleanup = () => {
      audio.removeEventListener('ended', handleEnd)
      audio.removeEventListener('error', handleError)
    }

    const handleEnd = () => {
      cleanup()
      setAudioIdle()
      onEnded?.()
      resolve()
    }

    const handleError = () => {
      cleanup()
      setAudioIdle()
      reject()
    }

    audio.addEventListener('ended', handleEnd)
    audio.addEventListener('error', handleError)

    audio.play().then(() => {
      setAudioSpeaking()

      registerReplay(() => {
        const replayAudio = new Audio(path)
        replayAudio.play()
      })

      if (options?.remember !== false) {
        setLastAudio(path)
      }
    })
      
      .catch(handleError)
  })
}

export const playSequential = async (
  paths: string[],
  onEnd?: () => void,
  options?: { remember?: boolean }
) => {
  try {
    for (const path of paths) {
      await playAudioUrl(path, undefined, options)
    }

    onEnd?.()
  } catch (err) {
    console.warn('Sequential play error:', err)
  }
}