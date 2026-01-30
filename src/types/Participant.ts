import { UUID } from "crypto"

export interface Participant {
  id: UUID        // UUID
  code: string      // ก001
  status: 'unused' | 'used' | 'deleted'
  created_at?: string
}