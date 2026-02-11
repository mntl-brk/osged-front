import { apiAction } from '@/api/apiAction'
import { post } from '@/services/httpRequest'
import { object, number, string, optional } from 'valibot'

export const completeMiniCog = async (payload: {
  session_id: string
  recall_score: number
}) => 
  apiAction(
    payload,
    object({
      session_id: string(),
      recall_score: number(),
    }),
    object({}),
    async (input) => {
      const { session_id, ...payload } = input

      const res = await post(
        `/api/minicog/${session_id}/complete`,
        payload
      )

      return res
    }
  )