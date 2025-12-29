
export type ModalContent = 'info' | 'pdpa' | 'project-info' | 'faq';

export interface ModalProps {
  type: ModalContent;
  onClose: () => void;
}

export type FontSize = 'small' | 'medium' | 'large';
export type Language = 'th' | 'en';
export type Page = 'home' | 'verification' | 'consent' | 'preferences' | 'demographics' | 'instruction' | 'intro-minicog' | 'assessment-word-registration' | 'assessment-clock-drawing' | 'assessment-word-recall' | 'intro-tgds' | 'assessment-mood-tgds' | 'score' | 'doctor-dashboard' | 'volunteer-management';

export type Gender = 'male' | 'female' | 'other';
export type Location = 'home' | 'nursing_home' | 'hospital';

export interface DemographicsData {
  currentLocationDescription: string;
  age: string;
  gender: Gender | null;
  locationType: Location | null;
}

export interface WordSet {
  id: string;
  words: string[];
}

export interface AssessmentData {
  wordSet: WordSet;
}

export interface PatientRecord {
  id: string;
  timestamp: string;
  demographics: DemographicsData;
  miniCog: {
    wordRegistration: string[];
    clockImage: string | null; // Base64
    recalledWords: string[];
    recallScore: number;
    score: number;
  };
  tgds: {
    score: number; // 0-15
  };
  status: 'normal' | 'mild-risk' | 'high-risk';
}
