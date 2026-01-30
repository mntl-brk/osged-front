import { apiAction } from '@/api/apiAction'
import { post } from '@/services/httpRequest'
import {
  MiniCogCreateSchema,
  MiniCogResponseSchema,
} from '@/schemas/minicog.schema'
import { MiniCog } from '@/types/minicog'

export const createMiniCog = (payload: {
  session_id: string
  word_set_id: string
  words_prompt: string[]
}) =>
  apiAction(
    payload,
    MiniCogCreateSchema,
    MiniCogResponseSchema,
    async (v) => {
      const { session_id, ...body } = v
      const res = await post<MiniCog>(
        `/api/minicog/${session_id}/create`,
        body
      )

      return res.data
    }
  )