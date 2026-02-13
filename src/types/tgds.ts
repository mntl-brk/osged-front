// ================= TGDS =================

export interface TgdsAnswer {
  question_no: number
  answer: 0 | 1
  response_time_ms: number | null
  video_url: string | null
}

export interface TgdsSummary {
  total_score: number
  completed_at: string
}

export interface TgdsDetail {
  answers: TgdsAnswer[]
  summary: TgdsSummary
}