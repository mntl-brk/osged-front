import { object, string } from 'valibot'

export const CreateSessionRequestSchema = object({
  participant_id: string(),
})

export const CreateSessionResponseSchema = object({
  session_id: string(),
  participant_id: string(),
  created_at: string(),
})