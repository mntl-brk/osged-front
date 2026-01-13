import { WORD_SETS } from '@/data/wordSetMiniCog'
import { WordSet } from '@/types'

export function getRandomWordSet(exceptId?: string): WordSet {
  const pool = exceptId
    ? WORD_SETS.filter((s) => s.id !== exceptId)
    : WORD_SETS

  return pool[Math.floor(Math.random() * pool.length)]
}