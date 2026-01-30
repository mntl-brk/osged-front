export interface MiniCog {
  minicog_id: string
  session_id: string

  word_set_id: string
  words_prompt: string[]

  recall_score?: number
  clock_score?: number
}

