export interface DescriptiveBreakdown {
  questionNumber: string;
  score: number;
  maxScore: number;
  remarks: string;
}

export interface DescriptiveResult {
  totalScore: number;
  breakdown: DescriptiveBreakdown[];
  feedback: string;
}

export interface DescriptiveImage {
  id: string;
  file: File;
  previewUrl: string;
  croppedBase64?: string;
  status: 'pending' | 'cropped';
  studentId?: string;
}

export interface DescriptiveStudent {
  id: string;
  name: string;
  images: DescriptiveImage[];
  status: 'pending' | 'evaluating' | 'success' | 'error';
  result?: DescriptiveResult;
  error?: string;
}