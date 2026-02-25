'use client';

let audioUnlocked = false;

export const unlockAudio = async () => {
  if (audioUnlocked) return;

  try {
    const AudioContext =
      window.AudioContext ||
      (window as any).webkitAudioContext;

    const context = new AudioContext();

    if (context.state === 'suspended') {
      await context.resume();
    }

    // ยิงเสียงเงียบ 1 sample
    const buffer = context.createBuffer(1, 1, 22050);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start(0);

    audioUnlocked = true;
  } catch (err) {
    console.warn('unlockAudio failed', err);
  }
};

export const isAudioUnlocked = () => audioUnlocked;