'use client';

import { playAudioBlob } from '@/lib/audioManager';

export const playBlobAndWait = (
  blob: Blob,
  onEnded?: () => void
): Promise<void> => {
  return new Promise((resolve) => {
    playAudioBlob(blob, () => {
      onEnded?.();
      resolve();
    });
  });
};