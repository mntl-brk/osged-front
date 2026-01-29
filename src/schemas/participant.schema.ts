import { object, string, union, literal, array } from 'valibot'

export const ParticipantStatusSchema = union([
  literal('unused'),
  literal('used'),
  literal('deleted'),
])

export const ParticipantSchema = object({
  id: string(),
  code: string(),
  status: ParticipantStatusSchema,
  created_at: string()
})

export const ParticipantListSchema = object({
  data: array(ParticipantSchema),
})
