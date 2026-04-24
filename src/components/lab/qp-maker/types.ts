import { GeneratedQP } from '../../../services/gemini/qpMakerService';

export interface UploadedFile {
  id: string;
  file?: File;
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
  uploadedFiles: UploadedFile[];
  generatedPapers: GeneratedQP[];
}
