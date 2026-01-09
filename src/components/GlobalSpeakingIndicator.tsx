'use client';

import { useEffect, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { subscribeSpeaking } from '@/lib/audioManager';

export const GlobalSpeakingIndicator = () => {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeSpeaking(setSpeaking);
    return () => {
      unsubscribe();
    };
  }, []);

  if (!speaking) return null;

  return (
    <div className="
      fixed top-4 right-4 z-50
      flex items-center gap-2
      bg-primary/90 backdrop-blur
      px-4 py-2 rounded-full
      shadow-lg border
    ">
      <Volume2 className="text-white animate-pulse" />
      <div className="flex items-center gap-1">
        {[1, 2, 3].map(i => (
          <span
            key={i}
            className="w-1.5 bg-white rounded-full animate-wave"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
};