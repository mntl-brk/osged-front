import { apiAction } from '@/api/apiAction'
import { post } from '@/services/httpRequest'
import { object, string, number } from 'valibot'

export const completeTGDS = async (payload: {
  session_id: string
  total_score: number
}) =>
  apiAction(
    payload,
    object({
      session_id: string(),
      total_score: number(),
    }),
    object({}),
    async ({ session_id, ...body }) => {
      return post(
        `/api/tgds/${session_id}/complete`,
        body
      )
    }
  )