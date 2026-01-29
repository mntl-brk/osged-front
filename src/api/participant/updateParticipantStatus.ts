import { apiAction } from '@/api/apiAction'
import { ParticipantSchema, ParticipantStatusSchema } from '@/schemas/participant.schema'
import { object, string } from 'valibot'
import { put } from '@/services/httpRequest'

const InputSchema = object({
  id: string(),
  status: ParticipantStatusSchema,
})

export const updateParticipantStatus = (
  payload: { id: string; status: 'unused' | 'used' | 'deleted' }
) =>
  apiAction(
    payload,
    InputSchema,
    ParticipantSchema,
    async (v) => {
      const res = await put(`/api/participants/${v.id}`, {
        status: v.status,
      })
      return res.data
    }
  )