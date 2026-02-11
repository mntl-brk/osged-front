import { apiAction } from '@/api/apiAction'
import { post } from '@/services/httpRequest'
import { object, string } from 'valibot'

export const startTGDS = async (payload: {
  session_id: string
}) =>
  apiAction(
    payload,
    object({
      session_id: string(),
    }),
    object({}),
    async ({ session_id }) => {
      return post(`/api/tgds/${session_id}/start`)
    }
  )