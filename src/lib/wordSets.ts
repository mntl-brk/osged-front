import { WORD_SETS } from '@/data/wordSetMiniCog'
import { WordSet, EducationLevel } from '@/types'

export function getWordSetByEducation(
  educationLevel: EducationLevel,
  withIn: boolean
): WordSet {

  let wordSetId: string

  if (educationLevel === 'below_p4') {
    wordSetId = withIn ? '1' : '7'
  } else {
    wordSetId = withIn ? '4' : '6'
  }

  const set = WORD_SETS.find((s) => s.id === wordSetId)

  if (!set) throw new Error(`Word set ${wordSetId} not found`)

  return set
}

export const getWordSetById = (id: string): WordSet | undefined =>
  WORD_SETS.find((w) => w.id === id)