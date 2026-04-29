import { GoogleGenAI, Type } from '@google/genai';
import { fileToBase64 } from '../../utils/imageProcessing';
import { QPItem } from '../../components/lab/qp-maker/types';

export interface GeneratedQP {
  filename: string;
  htmlContent: string;
}

export async function generateImageDescription(
  fileBase64: string,
  mimeType: string,
  apiKeys: string[],
  modelName: string
): Promise<string> {
  const keys = apiKeys.filter(k => k.trim());
  if (keys.length === 0) throw new Error('No API keys provided. Please configure them in Settings.');
  
  const prompt = `Briefly describe the contents of this question paper image. Specifically, mention the subject, target class/batch if visible, and question numbers present (e.g., 'Physics questions 1 to 5'). Keep it concise and suitable for mapping instructions.`;
  
  let lastError: any;
  for (const key of keys) {
    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        model: modelName || 'gemini-3.1-flash-lite-preview',
        contents:[
          { text: prompt },
          { inlineData: { data: fileBase64, mimeType } }
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

export async function generateSingleQuestionPaper(
  items: QPItem[],
  instructions: string,
  targetName: string,
  templateHtml: string,
  apiKeys: string[],
  modelName: string
): Promise<GeneratedQP> {
  const keys = apiKeys.filter(k => k.trim());
  if (keys.length === 0) {
    throw new Error('No API keys provided.');
  }

  const prompt = `You are an expert exam question paper creator.
I am providing source materials (images and text) containing raw questions and specific instructions on how to parse and allocate them.

TARGET PAPER TO GENERATE: ${targetName}
(Ensure the paper is generated specifically for this batch and set, following any variations mentioned).

INSTRUCTIONS:
${instructions}

HTML TEMPLATE TO USE AS A GUIDE FOR STYLING AND STRUCTURE:
\`\`\`html
${templateHtml}
\`\`\`

CRITICAL REQUIREMENT: Keep the logo IMG tag (\`<img src="logo1.png" ...>\`) exactly as it is in the template! Do not remove or change it. Ensure it remains in the final HTML.
Use 100% width for the main container to allow fluid printing. Do not use fixed widths (like 850px) or box-shadows.

Output a JSON object with 'filename' (e.g., '${targetName.replace(/[^a-zA-Z0-9]/g, '_')}.html') and 'htmlContent' (the fully generated HTML string for that paper, integrating MathJax).
`;

  const contentsParts: any[] = [{ text: prompt }];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type === 'image' && item.file) {
      const base64 = await fileToBase64(item.file);
      contentsParts.push({ text: `Source ${i + 1} (Image): ${item.description}` });
      contentsParts.push({ inlineData: { data: base64, mimeType: item.file.type } });
    } else if (item.type === 'text' && item.textContent) {
      contentsParts.push({ text: `Source ${i + 1} (Text):\nContent: ${item.textContent}\nDescription/Instructions: ${item.description}` });
    }
  }

  let lastError: any;

  for (const key of keys) {
    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        model: modelName || 'gemini-3.1-pro-preview',
        contents: contentsParts,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              filename: { type: Type.STRING },
              htmlContent: { type: Type.STRING }
            },
            required: ["filename", "htmlContent"]
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error('Empty response from model');

      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedText) as GeneratedQP;
    } catch (error) {
      console.error('Error generating QP with key:', error);
      lastError = error;
    }
  }

  throw lastError || new Error(`Failed to generate Question Paper for ${targetName}`);
}