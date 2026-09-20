export interface QPItem {
  id: string;
  type: 'image' | 'text' | 'pdf';
  filename?: string;
  description: string;
  file?: File;
  dataUrl?: string;
  imageBytes?: string;
  mimeType?: string;
  previewUrl?: string;
  textContent?: string;
  isText?: boolean;
}

export interface QPAsset {
  id: string;
  filename: string;
  description: string;
  bytes?: string; // base64 / dataUrl
  imageBytes?: string;
  mimeType?: string;
  width?: string;
  height?: string;
  file?: File;
}

export interface SubjectDivision {
  id: string;
  subject: string;
  marks: string;
}

export interface ClassDivisionConfig {
  enabled: boolean;
  maxMarks: string;
  subjects: SubjectDivision[];
}

export interface QPQuestion {
  number: string;
  text: string;
  marks: string;
}

export interface QPSection {
  badge: string;
  title: string;
  instruction: string;
  questions: QPQuestion[];
}

export interface GeneratedPaper {
  targetName: string;
  batch: string;
  set: string;
  filename: string;
  sections: QPSection[];
  htmlContent: string;
  templateId?: string;
  twoColumn?: boolean;
  fontSize?: string;
  latexSize?: string;
  date?: string;
  duration?: string;
  totalMarks?: string;
  subtitle?: string;
  hideSet?: boolean;
  subjects?: SubjectDivision[];
}

export interface QPMakerDayData {
  date: string;
  subtitle: string;
  duration: string;
  totalMarks: string;
  subjectDivisions: SubjectDivision[];
  classDivisions: Record<string, ClassDivisionConfig>;
  selectedDivisionClass?: string;
  batchesAndSets: string;
  extraInstructions: string;
  templateId: string;
  twoColumn: boolean;
  fontSize: string;
  latexSize: string;
  items: QPItem[];
  assets: QPAsset[];
  generatedPapers: GeneratedPaper[];
}