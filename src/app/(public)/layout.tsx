import { VoiceGuideProvider } from "@/contexts/VoiceGuideContext";
import { GlobalSpeakingIndicator } from "@/components/public/GlobalSpeakingIndicator";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <VoiceGuideProvider>
      <GlobalSpeakingIndicator />
      {children}
    </VoiceGuideProvider>
  );
}