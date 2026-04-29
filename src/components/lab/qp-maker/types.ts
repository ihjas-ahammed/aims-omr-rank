import { GeneratedQP } from '../../../services/gemini/qpMakerService';

export interface QPItem {
  id: string;
  type: 'image' | 'text';
  file?: File;
  textContent?: string;
  description: string;
  previewUrl?: string;
}

export interface SubjectDivision {
  id: string;
  subject: string;
  marks: string;
}

export interface QPMakerDayData {
  date: string;
  duration: string;
  totalMarks: string;
  subjectDivisions: SubjectDivision[];
  batchesAndSets: string;
  extraInstructions: string;
  templateId: string;
  items: QPItem[];
  generatedPapers: GeneratedQP[];
}