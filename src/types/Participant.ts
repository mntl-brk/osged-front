import { UUID } from "crypto"
import { DemographicsData } from "."

export interface Participant {
  id: UUID        // UUID
  code: string      // ก001
  status: 'unused' | 'used' | 'deleted'
  created_at?: string
}

export interface PatientDetail {
  id: string;
  volunteer_code: string;
  completed_at: string;
  demographics: DemographicsData;
  miniCog: {
    wordRegistration: string[];
    clockImage: string | null; // Base64
    recalledWords: string[];
    recallScore: number;
    clockScore: number;
    score: number;
    clock_video_url: string | null;
    clock_events_url: string | null;
  };
  tgds: {
    score: number; // 0-15
  };
  status: 'normal' | 'mild-risk' | 'high-risk';
}