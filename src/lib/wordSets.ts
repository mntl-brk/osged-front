import { WordSet } from '@/types'

export const WORD_SETS: WordSet[] = [
  {
    id: 'set1',
    words: ['กล้วย', 'พระอาทิตย์ขึ้น', 'เก้าอี้'],
  },
  {
    id: 'set2',
    words: ['ผู้นำ', 'ฤดูกาล', 'โต๊ะ'],
  },
  {
    id: 'set3',
    words: ['หมู่บ้าน', 'ห้องครัว', 'เด็ก'],
  },
  {
    id: 'set4',
    words: ['แม่น้ำ', 'ประเทศ', 'นิ้ว'],
  },
  {
    id: 'set5',
    words: ['กัปตันเรือ', 'สวน', 'รูปภาพ'],
  },
  {
    id: 'set6',
    words: ['ลูกสาว', 'สวรรค์', 'ภูเขา'],
  },
  {
    id: 'set7',
    words: ['บ้าน', 'แมว', 'สีเขียว'],
  },
]

export function getRandomWordSet(exceptId?: string): WordSet {
  const pool = exceptId
    ? WORD_SETS.filter((s) => s.id !== exceptId)
    : WORD_SETS

  return pool[Math.floor(Math.random() * pool.length)]
}