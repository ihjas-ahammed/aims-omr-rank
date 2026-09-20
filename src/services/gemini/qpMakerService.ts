import { GoogleGenAI, Type } from '@google/genai';
import { fileToBase64 } from '../../utils/imageProcessing';
import { QPItem, QPAsset, QPSection, GeneratedPaper } from '../../components/lab/qp-maker/types';
import { compileQpHtml } from '../../components/lab/qp-maker/qpCompiler';
import { QpTemplate } from '../../components/lab/qp-maker/defaultDartTemplates';

export interface GenerateQPParams {
  targetName: string;
  templateId: string;
  date: string;
  duration: string;
  marks: string;
  subtitle: string;
  instructions: string;
  subjects: { subject: string; marks: string }[];
  items: QPItem[];
  assets: QPAsset[];
  fontSize?: string;
  latexSize?: string;
  twoColumn?: boolean;
  hideSet?: boolean;
  setCount?: number;
  apiKeys: string[];
  modelName: string;
  customTemplates?: QpTemplate[];
  customHtml?: string;
}

export async function generateImageDescription(
  fileBase64: string,
  mimeType: string,
  apiKeys: string[],
  modelName: string
): Promise<string> {
  const keys = apiKeys.filter(k => k && k.trim());
  if (keys.length === 0) throw new Error('No API keys provided. Please configure them in Settings.');
  
  const prompt = `Briefly describe the contents of this question paper image. Specifically, mention the subject, target class/batch if visible, and question numbers present (e.g., 'Physics questions 1 to 5'). Keep it concise and suitable for mapping instructions.`;
  
  let lastError: any;
  for (const key of keys) {
    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        model: modelName || 'gemini-2.5-flash',
        contents: [
          { text: prompt },
          { inlineData: { data: fileBase64.replace(/^data:[^;]+;base64,/, ''), mimeType } }
        ]
      });
      
      if (!response.text) throw new Error('Empty response');
      return response.text.trim();
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('Failed to generate description.');
}

export async function generateQuestionPaperTask(params: GenerateQPParams): Promise<GeneratedPaper> {
  const {
    targetName,
    templateId,
    date,
    duration,
    marks,
    subtitle,
    instructions,
    subjects,
    items,
    assets,
    fontSize = '13px',
    latexSize = '100%',
    twoColumn = false,
    hideSet,
    setCount,
    apiKeys,
    modelName,
    customTemplates,
    customHtml
  } = params;

  const keys = apiKeys.filter(k => k && k.trim());
  if (keys.length === 0) {
    throw new Error('No API keys provided. Please configure your API key in settings.');
  }

  let batch = 'B1';
  let setLabel = 'Set A';
  const nameParts = targetName.split(' - ');
  if (nameParts.length >= 2) {
    batch = nameParts[0].trim();
    setLabel = nameParts[1].trim();
  } else {
    batch = targetName.trim();
  }

  const safeName = targetName.replace(/[^a-zA-Z0-9]/g, '_');

  const subjectInfoLines = (subjects || [])
    .filter(s => s && s.subject && s.subject.trim())
    .map(s => `- ${s.subject}: ${s.marks} marks`);

  const subjectsText = subjectInfoLines.length > 0
    ? `\nTARGET SUBJECT DIVISIONS FOR THIS CLASS/PAPER:\nTotal Paper Marks: ${marks}\n${subjectInfoLines.join('\n')}\n(You MUST allocate questions strictly to these subjects so each section's sum equals the specified marks.)\n`
    : '';

  const prompt = `You are an expert exam question paper creator.
I am providing source materials (images and text) containing raw questions and specific instructions on how to parse and allocate them.

TARGET PAPER TO GENERATE: ${targetName}
TARGET BATCH/CLASS: ${batch}
TARGET SET: ${setLabel}
${subjectsText}
(Generate the paper specifically for this batch and set, following any variations mentioned.)

INSTRUCTIONS:
${instructions}

METADATA:
Date: ${date}
Duration: ${duration} mins
Max Marks: ${marks}

CRITICAL REQUIREMENTS:
- BATCH/CLASS MAPPING: The source materials contain questions for multiple batches/classes (e.g. A1, A2, B1, B2, CS, NonMath). You MUST only select and extract the questions that are designated or meant for the TARGET BATCH/CLASS (${batch}). Do NOT mix or include questions designated for other classes.
- EXACT TEXT PRESERVATION: You MUST copy the text of the questions, choices, and formulas EXACTLY as they are written in the source materials. Do NOT rephrase, simplify, rewrite, or alter the values or wording. The generated question text must match the source materials word-for-word.
- QUESTIONS ONLY (STRICTLY NO ANSWERS): You MUST write ONLY the question text, question stems, and any answer choices or sub-questions. Under NO CIRCUMSTANCES should you write answers, solutions, answer keys, explanations, hints, or marking keys. If the source material contains solutions or answers, you MUST completely omit them and extract ONLY the questions.
- SUB-QUESTIONS FORMATTING: When a question contains sub-questions, sub-parts, or Roman/lettered items (such as a), b), c) or i), ii), iii) or 1), 2)), you MUST structure them using HTML <ol> ordered lists with the appropriate type attribute, e.g. <ol type="a"><li>...</li><li>...</li></ol> or <ol type="i"><li>...</li><li>...</li></ol>. Do NOT leave them as raw unformatted text.
- Align/match selected questions to the subjects and marks defined in the instructions and metadata.
- Create a list of sections. Each section represents a subject division (e.g. Physics, Chemistry).
- For each section, provide a badge (e.g., "Section A" or "Section I"), the title (subject name), section instruction (optional, e.g. "Answer all questions."), and the list of questions.
- For each question, extract its number, its text content (must include MathJax format for math equations like \\(x = y^2\\) or \\[E = mc^2\\]), and the marks allocated to it.
- SORTING BY SCORE: Within each section, you MUST sort the questions by their score (marks) in ascending order (lowest to highest).
- QUESTION NUMBERING: After sorting, you MUST assign sequential question numbers starting from 1 (i.e. 1, 2, 3, 4, etc.) in the order of natural numbers.
- MARKS ALLOCATION: For each subject/section, the sum of the marks of all questions in that section MUST exactly equal the total marks allocated to that subject (as specified in the metadata and instructions). Adjust marks of individual questions if necessary to match the target total.
- REFERENCING DIAGRAMS/ASSETS: If any question in the source materials contains or references an image, figure, or diagram, locate the matching asset from the 'AVAILABLE ASSETS / DIAGRAMS' section, and insert it in the question's text field using a standard HTML image tag, for example: <img src="filename" style="max-width: 100%; height: auto;" /> (where filename matches the exact filename of the asset).
- Output a JSON object with 'filename' (e.g. '${safeName}.html') and the list of 'sections'.
`;

  const contentsParts: any[] = [{ text: prompt }];

  // Process items (images, PDFs, text)
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const desc = item.description || '';
    if (item.type === 'text' || item.isText) {
      if (item.textContent) {
        contentsParts.push({ text: `Source ${i + 1} (Text):\nContent: ${item.textContent}\nDescription/Instructions: ${desc}` });
      }
    } else {
      let rawBase64 = item.imageBytes || item.dataUrl || '';
      let mime = item.mimeType || 'image/png';

      if (!rawBase64 && item.file) {
        rawBase64 = await fileToBase64(item.file);
        mime = item.file.type || (item.file.name.endsWith('.pdf') ? 'application/pdf' : 'image/png');
      }

      if (rawBase64) {
        const cleanBase64 = rawBase64.replace(/^data:[^;]+;base64,/, '');
        const isPdf = mime === 'application/pdf' || (item.filename && item.filename.toLowerCase().endsWith('.pdf'));
        contentsParts.push({ text: `Source ${i + 1} (${isPdf ? 'PDF Document' : 'Image'}): ${desc}` });
        contentsParts.push({ inlineData: { data: cleanBase64, mimeType: isPdf ? 'application/pdf' : mime } });
      }
    }
  }

  // Process assets (diagrams / figures)
  if (assets && assets.length > 0) {
    contentsParts.push({
      text: `\nAVAILABLE ASSETS / DIAGRAMS:\nThese are diagram/figure images uploaded as assets. If a question in the source materials refers to an image, diagram, or figure, identify the corresponding asset below and reference it in the generated question HTML using an img tag like: <img src="filename" />. Ensure the src matches the exact filename of the asset.`
    });

    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];
      const filename = asset.filename || `asset_${i + 1}.png`;
      const desc = asset.description || '';
      let rawBase64 = asset.bytes || asset.imageBytes || '';
      let mime = asset.mimeType || 'image/png';

      if (!rawBase64 && asset.file) {
        rawBase64 = await fileToBase64(asset.file);
        mime = asset.file.type || 'image/png';
      }

      if (rawBase64) {
        const cleanBase64 = rawBase64.replace(/^data:[^;]+;base64,/, '');
        contentsParts.push({ text: `Asset ${i + 1} (Filename: ${filename}):\nDescription: ${desc}` });
        contentsParts.push({ inlineData: { data: cleanBase64, mimeType: mime } });
      }
    }
  }

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      filename: { type: Type.STRING },
      sections: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            badge: { type: Type.STRING, description: 'Section badge, e.g. "Section A" or "Section I"' },
            title: { type: Type.STRING, description: 'Section subject title, e.g. "Physics" or "Chemistry"' },
            instruction: { type: Type.STRING, description: 'Instructions for the section, e.g. "Answer all questions."' },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  number: { type: Type.STRING, description: 'Question number, e.g. "1" or "2"' },
                  text: { type: Type.STRING, description: 'Full question text including any equations/choices/LaTeX' },
                  marks: { type: Type.STRING, description: 'Marks for this question, e.g. "2" or "3"' }
                },
                required: ['number', 'text', 'marks']
              }
            }
          },
          required: ['badge', 'title', 'instruction', 'questions']
        }
      }
    },
    required: ['filename', 'sections']
  };

  let lastError: any;

  for (const key of keys) {
    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        model: modelName || 'gemini-2.5-flash',
        contents: contentsParts,
        config: {
          responseMimeType: 'application/json',
          responseSchema,
          temperature: 0.2
        }
      });

      const text = response.text;
      if (!text) throw new Error('Empty response from model');

      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      const parsedJson = JSON.parse(cleanedText);

      const sections: QPSection[] = parsedJson.sections || [];

      // Post-process sections: Sort questions by score (lowest to highest) and renumber sequentially 1, 2, 3...
      for (const sec of sections) {
        const questions = sec.questions || [];
        questions.sort((a, b) => {
          const ma = parseFloat(a.marks) || 0;
          const mb = parseFloat(b.marks) || 0;
          return ma - mb;
        });
        questions.forEach((q, idx) => {
          q.number = String(idx + 1);
        });
        sec.questions = questions;
      }

      // Build asset source lookup map
      const assetSources: Record<string, string> = {};
      for (const a of assets || []) {
        const fname = a.filename;
        const b64 = a.bytes || a.imageBytes || '';
        const mime = a.mimeType || 'image/png';
        if (fname && b64) {
          assetSources[fname] = b64.startsWith('data:') ? b64 : `data:${mime};base64,${b64}`;
        }
      }

      // Compile HTML using qpCompiler
      const htmlContent = compileQpHtml({
        templateId,
        sections,
        batch,
        setLabel,
        date,
        duration,
        marks,
        subtitle,
        assetSources,
        hideSet,
        setCount,
        twoColumn,
        fontSize,
        latexSize,
        customHtml,
        templates: customTemplates
      });

      return {
        targetName,
        batch,
        set: setLabel,
        filename: parsedJson.filename || `${safeName}.html`,
        sections,
        htmlContent,
        templateId,
        twoColumn,
        fontSize,
        latexSize
      };
    } catch (error) {
      console.error('Error generating QP with key:', error);
      lastError = error;
    }
  }

  throw lastError || new Error(`Failed to generate Question Paper for ${targetName}`);
}

// Backwards compatibility wrapper
export async function generateSingleQuestionPaper(
  items: QPItem[],
  instructions: string,
  targetName: string,
  _templateHtml: string,
  apiKeys: string[],
  modelName: string
): Promise<{ filename: string; htmlContent: string; sections?: QPSection[] }> {
  const result = await generateQuestionPaperTask({
    targetName,
    templateId: 'elegant',
    date: new Date().toLocaleDateString('en-GB'),
    duration: '30',
    marks: '15',
    subtitle: 'Daily Examination',
    instructions,
    subjects: [{ subject: 'General', marks: '15' }],
    items,
    assets: [],
    apiKeys,
    modelName
  });

  return {
    filename: result.filename,
    htmlContent: result.htmlContent,
    sections: result.sections
  };
}