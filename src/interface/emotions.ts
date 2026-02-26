export const EMO_COLORS = {
  Neutral: "#9CA3AF",
  Happy: "#F59E0B",
  Sad: "#60A5FA",
  Angry: "#EF4444",
  Fear: "#8B5CF6",
  Surprise: "#10B981",
} as const;

export type EmotionKey = keyof typeof EMO_COLORS;  
export const ALL_EMOTIONS = Object.keys(EMO_COLORS) as EmotionKey[];

export interface EmotionDurations {
  Neutral: number;
  Happy: number;
  Sad: number;
  Angry: number;
  Fear: number;
  Surprise: number;
}

export interface BarRow extends EmotionDurations {
  question: string;
  _total: number;
}