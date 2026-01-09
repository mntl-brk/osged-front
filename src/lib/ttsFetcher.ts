'use client';

export const fetchTTSBlob = async (text: string): Promise<Blob> => {
  const res = await fetch('/api/tts_Chirp3', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    throw new Error('TTS fetch failed');
  }

  return await res.blob();
};