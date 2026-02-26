import { ALL_EMOTIONS } from "@/interface/emotions";
import type { EmotionKey, EmotionDurations } from "@/interface/emotions";

//  1. สร้างวัตถุรีแมป (Surprise → Neutral)
export const EMO_REMAP: Partial<Record<EmotionKey, EmotionKey>> = {
  Surprise: "Neutral",
} as const;

//  2. ฟังก์ชัน normalizeEmotion: คืนค่าอารมณ์หลังรีแมป
export function normalizeEmotion(e: string): EmotionKey {
  const valid = asEmotionKey(e) ? e : "Neutral";
  return (EMO_REMAP[valid] ?? valid) as EmotionKey;
}

// 3. สร้าง empty object ของ durations สำหรับทุก emotion
export function makeEmptyDurations(): EmotionDurations {
  return (ALL_EMOTIONS as readonly EmotionKey[]).reduce((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {} as EmotionDurations);
}

//  4. เช็คว่า string นี้อยู่ใน EmotionKey ไหม
export function asEmotionKey(e: string): e is EmotionKey {
  return (ALL_EMOTIONS as readonly string[]).includes(e);
}