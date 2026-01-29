import { apiAction } from '@/api/apiAction'
import { post } from '@/services/httpRequest'
import {
  CreateSessionRequestSchema,
  CreateSessionResponseSchema,
} from '@/schemas/session.schema'
import { Session } from '@/types/Sessions'

export const createSession = (payload: { participant_id: string }) =>
  apiAction(
    payload,
    CreateSessionRequestSchema,
    CreateSessionResponseSchema,
    async (v) => {
      const res = await post<Session>('/api/sessions', v)
      return res.data
    }
  )