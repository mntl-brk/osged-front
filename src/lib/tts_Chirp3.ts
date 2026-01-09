'use client';

import { playAudioBlob } from './audioManager';

export const speak = async (
  text: string,
  onEnded?: () => void
) => {
  const res = await fetch('/api/tts_Chirp3', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  const blob = await res.blob();
  playAudioBlob(blob, onEnded);
};