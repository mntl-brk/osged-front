import { apiAction } from '@/api/apiAction'
import { post } from '@/services/httpRequest'
import { object, number, string, optional } from 'valibot'

export const appendTGDSAnswer = async (payload: {
  session_id: string
  question_no: number
  answer: number
  video_media_id?: string
  audio_media_id?: string
  response_time_ms?: number
}) =>
  apiAction(
    payload,
    object({
      session_id: string(),
      question_no: number(),
      answer: number(),
      video_media_id: optional(string()),
      audio_media_id: optional(string()),
      response_time_ms: optional(number()),
    }),
    object({}),
    async ({ session_id, ...body }) => {
      return post(
        `/api/tgds/${session_id}/answers`,
        body
      )
    }
  )