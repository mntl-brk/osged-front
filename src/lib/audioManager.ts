'use client';

let currentAudio: HTMLAudioElement | null = null;
let currentUrl: string | null = null;

let isSpeaking = false;

const listeners = new Set<(speaking: boolean) => void>();

const notify = () => {
  listeners.forEach(fn => fn(isSpeaking));
};

export const subscribeSpeaking = (fn: (speaking: boolean) => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const playAudioBlob = (
  blob: Blob,
  onEnded?: () => void
) => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  if (currentUrl) {
    URL.revokeObjectURL(currentUrl);
  }

  currentUrl = URL.createObjectURL(blob);
  currentAudio = new Audio(currentUrl);

  isSpeaking = true;
  notify();

  currentAudio.onended = () => {
    isSpeaking = false;
    notify();
    onEnded?.();
  };

  currentAudio.onerror = () => {
    isSpeaking = false;
    notify();
    onEnded?.();
  };

  currentAudio.play();
};

export const stopAudio = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  if (currentUrl) {
    URL.revokeObjectURL(currentUrl);
  }

  currentAudio = null;
  currentUrl = null;

  //  stop speaking
  isSpeaking = false;
  notify();
};

export const getIsSpeaking = () => isSpeaking;