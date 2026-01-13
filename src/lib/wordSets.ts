import { WORD_SETS } from '@/data/wordSetMiniCog'
import { WordSet, EducationLevel } from '@/types'

export function getWordSetByEducation(
  educationLevel: EducationLevel
): WordSet {
  if (educationLevel === 'below_p4') {
    const set = WORD_SETS.find((s) => s.id === '7')
    if (!set) throw new Error('Word set 7 not found')
    return set
  }

  // p4_or_above
  const set = WORD_SETS.find((s) => s.id === '6')
  if (!set) throw new Error('Word set 6 not found')
  return set
}