import { object, string, number, union, literal } from 'valibot'

export const GenderSchema = union([
  literal('male'),
  literal('female'),
  literal('other'),
])

export const LocationTypeSchema = union([
  literal('home'),
  literal('nursing_home'),
  literal('hospital'),
])

export const EducationLevelSchema = union([
  literal('below_p4'),
  literal('p4_or_above'),
])

/* ---------- request ---------- */
export const CreateDemographicsRequestSchema = object({
  sessionId: string(),
  age_years: number(),
  sex: GenderSchema,
  current_location: string(),
  location_type: LocationTypeSchema,
  education_level: EducationLevelSchema,
})

/* ---------- response ---------- */
export const CreateDemographicsResponseSchema = object({
  session_id: string(),
  age_years: number(),
  sex: GenderSchema,
})