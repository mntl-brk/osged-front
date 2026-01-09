'use client';

let audioUnlocked = false;

export const unlockAudio = async () => {
  if (audioUnlocked) return;

  try {
    const audio = new Audio();

    const playPromise = audio.play();

    if (playPromise && typeof playPromise.then === 'function') {
      await Promise.race([
        playPromise.catch(() => {}),
        new Promise(resolve => setTimeout(resolve, 50)), // กันค้าง
      ]);
    }

    audioUnlocked = true;
  } catch (err) {
    console.warn('unlockAudio failed', err);
  }
};

export const isAudioUnlocked = () => audioUnlocked;