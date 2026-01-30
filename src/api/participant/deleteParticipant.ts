import { apiAction } from '@/api/apiAction'
import { object, string, literal } from 'valibot'
import { del } from '@/services/httpRequest'

const InputSchema = object({
  id: string(),
})

const OutputSchema = object({
  success: literal(true),
})

export const deleteParticipant = (payload: { id: string }) =>
  apiAction(
    payload,
    InputSchema,
    OutputSchema,
    async (v) => {
      const res = await del(`/api/participants/${v.id}`)

      return res.data
    }
  )