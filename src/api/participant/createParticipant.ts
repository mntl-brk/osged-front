import { apiAction } from '@/api/apiAction'
import { ParticipantSchema } from '@/schemas/participant.schema'
import { literal, object } from 'valibot'
import { post } from '@/services/httpRequest'
import type { Participant } from '@/types/Participant'

export const createParticipant = () =>
  apiAction<{}, Participant>(
    {},
    object({}),
    ParticipantSchema,
    async () => {
      const res = await post<Participant>('/api/participants')
      return res.data
    }
  )