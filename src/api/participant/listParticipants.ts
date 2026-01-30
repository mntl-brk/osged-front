import { apiAction } from '@/api/apiAction'
import { ParticipantListResponseSchema } from '@/schemas/participant.schema'
import { array, object } from 'valibot'
import { get } from '@/services/httpRequest'
import { Participant } from '@/types/Participant'

export const listParticipants = () =>
  apiAction<{}, Participant[]>(
    {},
    object({}),
    ParticipantListResponseSchema,
    async () => {
      const res = await get<Participant[]>('/api/participants')
      return res.data
    }
  )