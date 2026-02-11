import { object, number, string, optional } from 'valibot'

export const TGDSAnswerSchema = object({
  question_no: number(),
  answer: number(),
  media_id: optional(string()),
  response_time_ms: optional(number()),
})

export type TGDSAnswerInput = {
  question_no: number
  answer: number
  media_id?: string
  response_time_ms?: number
}

export const TGDSCompleteSchema = object({
  completed_at: optional(string()),
})

export type TGDSCompleteInput = {
  completed_at?: string
}