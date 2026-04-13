export interface DescriptiveBreakdown {
  questionNumber: string;
  score: number;
  maxScore: number;
  colorLevel: 0 | 1 | 2 | 3; // 0=Red(No answer), 1=Orange(Only attempt), 2=Yellow(Correct way/wrong value), 3=Green(All correct)
  remarks: string;
}

export interface DescriptiveResult {
  totalScore: number;
  maxTotalScore: number;
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

export interface DescQuestionScheme {
  qNum: string;
  maxScore: number;
  rubric: {
    "3": string;
    "2": string;
    "1": string;
    "0": string;
  };
}