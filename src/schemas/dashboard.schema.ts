// api/dashboard/schema.ts
import { object, string, number, nullable, array } from 'valibot'

export const PatientDetailSchema = object({
  session_id: string(),
  volunteer_code: string(),
  completed_at: nullable(string()),

  demographics: object({
    age: nullable(number()),
    sex: nullable(string()),
    current_location_description: nullable(string()),
    education_level: nullable(string()),
  }),

  minicog: object({
    word_registration: array(string()),
    recalled_words: array(string()),
    recall_score: number(),
    clock_score: nullable(number()),
    clock_image: nullable(string()),
    total_score: number(),
    clock_video_url: nullable(string()),
    clock_events_url: nullable(string())
  }),

  tgds: object({
    score: number(),
  }),

  status: string(),
})