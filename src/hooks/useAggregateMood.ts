import { useMemo } from "react"
import { makeEmptyDurations, normalizeEmotion } from "@/utils/emotion-utils"

export function useAggregateMood(cards: any) {

  return useMemo(() => {

    const videoTotals = makeEmptyDurations()
    let audioPositive = 0
    let audioNegative = 0

    Object.values(cards).forEach((st: any) => {

      // ===== VIDEO =====
      st.result?.segments?.forEach((s: any) => {
        const dur = Math.max(0, (s.end ?? 0) - (s.start ?? 0))
        const emo = normalizeEmotion(s.emotion)
        videoTotals[emo] += dur
      })

      // ===== AUDIO =====
      if (st.audioResult?.prediction !== undefined) {
        if (Number(st.audioResult.prediction) === 1) {
          audioNegative++
        } else {
          audioPositive++
        }
      }
    })

    // ================= VIDEO SUMMARY =================
    const vPositive = videoTotals.Happy
    const vNegative =
      videoTotals.Sad +
      videoTotals.Angry +
      videoTotals.Fear
    const vNeutral = videoTotals.Neutral

    const vTotal = vPositive + vNegative + vNeutral

    const videoMood =
      vTotal > 0
        ? {
            positive: vPositive / vTotal,
            negative: vNegative / vTotal,
            neutral: vNeutral / vTotal,
            dominant:
              vNegative > vPositive
                ? "negative"
                : vPositive > vNegative
                ? "positive"
                : "neutral"
          }
        : null

    // ================= AUDIO SUMMARY =================
    const aTotal = audioPositive + audioNegative

    const audioMood =
      aTotal > 0
        ? {
            positive: audioPositive / aTotal,
            negative: audioNegative / aTotal,
            dominant:
              audioNegative > audioPositive
                ? "negative"
                : audioPositive > audioNegative
                ? "positive"
                : "neutral"
          }
        : null

    return {
      videoMood,
      audioMood
    }

  }, [cards])
}