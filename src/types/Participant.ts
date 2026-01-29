export interface Participant {
  id: string        // UUID
  code: string      // ก001
  status: 'unused' | 'used' | 'deleted'
  created_at?: string
}