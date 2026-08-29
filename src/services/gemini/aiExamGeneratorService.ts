import { GoogleGenAI, Type } from '@google/genai';
import { ExamQuestion } from '../onlineExamService';

export interface AIExamFileAttachment {
  name: string;
  type: string; // e.g. 'image/jpeg', 'image/png', 'application/pdf', 'text/plain'
  base64: string;
}

export interface AIExamGeneratorParams {
  instructions: string;
  attachments?: AIExamFileAttachment[];
  subject?: string;
  className?: string;
  targetDurationMinutes?: number;
  numMcq?: number;
  numDescriptive?: number;
  apiKeys?: string[];
  modelName?: string;
}

export interface GeneratedExamData {
  title: string;
  subject: string;
  className: string;
  instructions: string;
  durationMinutes: number;
  questions: ExamQuestion[];
}

function getApiKeys(providedKeys?: string[]): string[] {
  if (providedKeys && providedKeys.length > 0) {
    const valid = providedKeys.map(k => k.trim()).filter(Boolean);
    if (valid.length > 0) return valid;
  }

  try {
    const storedList = localStorage.getItem('omr_apiKeysList');
    if (storedList) {
      const parsed = JSON.parse(storedList);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const valid = parsed.map(k => String(k).trim()).filter(Boolean);
        if (valid.length > 0) return valid;
      }
    }

    const storedOld = localStorage.getItem('omr_apiKeys');
    if (storedOld) {
      const split = storedOld.split(',').map(k => k.trim()).filter(Boolean);
      if (split.length > 0) return split;
    }
  } catch (e) {}

  return [];
}

/**
 * Generates structured exam data from text prompts, uploaded documents (PDF), and question paper images
 */
export async function generateExamWithAI(params: AIExamGeneratorParams): Promise<GeneratedExamData> {
  const keys = getApiKeys(params.apiKeys);
  if (keys.length === 0) {
    throw new Error('No Gemini API Key found. Please add an API key in Settings or enter one.');
  }

  const model = params.modelName || localStorage.getItem('omr_proModel') || 'gemini-3.1-pro-preview';

  const systemInstruction = `You are a high-level academic exam generator and OCR parser for educational institutions (AIMS Plus).
Your task is to create or extract a complete, ready-to-publish exam with high precision.

You will be given instructions, syllabus topics, and/or attached materials (question paper images, PDF documents, or notes).

Requirements:
1. Generate an Exam Title, Subject, Target Class/Batch, Student Instructions, and Suggested Duration in minutes.
2. Generate all Questions (both Multiple Choice 'mcq' and Handwritten 'descriptive').
3. For MCQ questions:
   - Provide a clear, complete question prompt.
   - Provide realistic, well-formatted option strings in the 'options' array (e.g. ["Option A text", "Option B text", "Option C text", "Option D text"]).
   - Specify the correct option letter ('A', 'B', 'C', or 'D') in 'correctOption'.
   - Assign appropriate positive marks (usually 4) and negative marks (usually 1, or 0 if specified).
4. For Descriptive questions:
   - Provide full detailed question prompt or numerical problem.
   - Assign marks (e.g., 2, 3, 5, or 8 Marks).
   - Set max allowable photo uploads 'maxImages' (usually 3 to 5 pages).
   - Provide clear guidelines/hints in 'guidelines' (e.g., "State the law, write mathematical derivation, and draw ray diagram").
5. Return ONLY a valid JSON object matching the required schema. No markdown wrapping or extra commentary.
`;

  let prompt = `GENERATE / PARSE ONLINE EXAM:
${params.instructions ? `User Custom Instructions:\n${params.instructions}\n` : 'Extract and generate an exam from the provided materials.'}

Subject Hint: ${params.subject || 'Auto-detect from content'}
Target Batch / Class Hint: ${params.className || 'Auto-detect'}
Duration Hint: ${params.targetDurationMinutes ? `${params.targetDurationMinutes} minutes` : 'Appropriate duration'}
${params.numMcq !== undefined && params.numMcq > 0 ? `Target MCQ count: around ${params.numMcq}` : ''}
${params.numDescriptive !== undefined && params.numDescriptive > 0 ? `Target Descriptive count: around ${params.numDescriptive}` : ''}

Ensure all questions are numbered sequentially starting from 1.`;

  const contentsParts: any[] = [{ text: prompt }];

  if (params.attachments && params.attachments.length > 0) {
    for (let i = 0; i < params.attachments.length; i++) {
      const att = params.attachments[i];
      contentsParts.push({
        text: `Attachment ${i + 1} (${att.name || 'File'}, Type: ${att.type}):`
      });

      if (att.type.startsWith('image/') || att.type === 'application/pdf') {
        contentsParts.push({
          inlineData: {
            data: att.base64,
            mimeType: att.type
          }
        });
      } else {
        try {
          const decoded = atob(att.base64);
          contentsParts.push({
            text: `Attachment Content:\n${decoded}`
          });
        } catch (e) {
          contentsParts.push({
            inlineData: {
              data: att.base64,
              mimeType: 'text/plain'
            }
          });
        }
      }
    }
  }

  let lastError: any;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    try {
      const ai = new GoogleGenAI({ apiKey: key });

      const response = await ai.models.generateContent({
        model: model,
        contents: contentsParts,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'Exam Title' },
              subject: { type: Type.STRING, description: 'Subject Name' },
              className: { type: Type.STRING, description: 'Target Batch or Class' },
              instructions: { type: Type.STRING, description: 'Instructions for students' },
              durationMinutes: { type: Type.INTEGER, description: 'Duration in minutes' },
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    number: { type: Type.INTEGER },
                    type: { type: Type.STRING, enum: ['mcq', 'descriptive'] },
                    prompt: { type: Type.STRING },
                    marks: { type: Type.NUMBER },
                    negativeMarks: { type: Type.NUMBER },
                    options: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    correctOption: { type: Type.STRING },
                    maxImages: { type: Type.INTEGER },
                    guidelines: { type: Type.STRING }
                  },
                  required: ['number', 'type', 'prompt', 'marks']
                }
              }
            },
            required: ['title', 'subject', 'className', 'instructions', 'durationMinutes', 'questions']
          }
        }
      });

      const rawText = response.text;
      if (!rawText) throw new Error('Received empty response from Gemini.');

      const cleaned = rawText.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      // Sanitize and format into ExamQuestion array
      const questions: ExamQuestion[] = (parsed.questions || []).map((q: any, idx: number) => {
        const qNum = Number(q.number) || idx + 1;
        const qType: 'mcq' | 'descriptive' = q.type === 'descriptive' ? 'descriptive' : 'mcq';
        const qMarks = Number(q.marks) || (qType === 'mcq' ? 4 : 5);

        let options: string[] | undefined = undefined;
        let correctOption: string | undefined = undefined;

        if (qType === 'mcq') {
          if (Array.isArray(q.options) && q.options.length > 0) {
            options = q.options.map((opt: any) => String(opt).trim());
          } else {
            options = ['Option A', 'Option B', 'Option C', 'Option D'];
          }
          correctOption = (q.correctOption ? String(q.correctOption).trim().toUpperCase() : 'A');
          if (!['A', 'B', 'C', 'D', 'E'].includes(correctOption)) {
            correctOption = 'A';
          }
        }

        return {
          id: `q_${qType}_${qNum}_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
          number: qNum,
          type: qType,
          prompt: q.prompt ? String(q.prompt).trim() : `Question ${qNum}`,
          marks: qMarks,
          negativeMarks: qType === 'mcq' ? (q.negativeMarks !== undefined ? Number(q.negativeMarks) : 1) : 0,
          numOptions: options ? options.length : 4,
          options,
          correctOption,
          maxImages: qType === 'descriptive' ? (Number(q.maxImages) || 5) : undefined,
          guidelines: qType === 'descriptive' ? (q.guidelines ? String(q.guidelines).trim() : 'Upload handwritten photo') : undefined
        };
      });

      return {
        title: parsed.title?.trim() || 'AI Generated Exam',
        subject: parsed.subject?.trim() || params.subject || 'General',
        className: parsed.className?.trim() || params.className || 'All Batches',
        instructions: parsed.instructions?.trim() || 'Answer all questions carefully.',
        durationMinutes: Number(parsed.durationMinutes) || params.targetDurationMinutes || 45,
        questions
      };
    } catch (err) {
      console.warn(`Gemini generation attempt with key index ${i} failed:`, err);
      lastError = err;
    }
  }

  throw lastError || new Error('Failed to generate exam with AI. Please check your Gemini API key and prompt.');
}
