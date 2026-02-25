'use client'

import { VoiceGuideProvider } from "@/contexts/VoiceGuideContext";
import { GlobalSpeakingIndicator } from "@/components/public/GlobalSpeakingIndicator";
import { initAudioManager } from "@/lib/audioManager";
import { useEffect } from "react";
import { SessionGuard } from "@/components/public/SessionGuard";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    initAudioManager()
  }, [])

  return (
    <VoiceGuideProvider>
      <GlobalSpeakingIndicator />
      <SessionGuard>
        {children}
      </SessionGuard>
    </VoiceGuideProvider>
  )
}