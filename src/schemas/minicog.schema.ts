import { object, string, array, number, nullable } from 'valibot'

export const MiniCogCreateSchema = object({
  session_id: string(),
  word_set_id: string(),
  words_prompt: array(string()),
})

export const MiniCogResponseSchema = object({
  minicog_id: string(),
  session_id: string(),

  word_set_id: string(),
  words_prompt: array(string()),

  recall_score: nullable(number()),
  clock_score: nullable(number()),
})