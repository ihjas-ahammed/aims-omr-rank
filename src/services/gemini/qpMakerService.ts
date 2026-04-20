import { GoogleGenAI, Type } from '@google/genai';
import { fileToBase64 } from '../../utils/imageProcessing';
import { QP_HTML_TEMPLATE } from '../../components/lab/qp-maker/constants';

export interface GeneratedQP {
  filename: string;
  htmlContent: string;
}

export async function generateQuestionPapers(
  files: File[],
  date: string, // Kept for backwards compatibility if needed, but compiledInstructions handles everything
  instructions: string,
  apiKeys: string[],
  modelName: string
): Promise<GeneratedQP[]> {
  const keys = apiKeys.filter(k => k.trim());
  if (keys.length === 0) {
    throw new Error('No API keys provided. Please add them in Settings.');
  }

  const prompt = `You are an expert exam question paper creator.
I am providing images of handwritten questions and specific instructions on how to parse and allocate them.

INSTRUCTIONS:
${instructions}

HTML TEMPLATE TO USE AS A GUIDE FOR STYLING AND STRUCTURE:
\`\`\`html
${QP_HTML_TEMPLATE}
\`\`\`

Output a JSON array where each object contains a 'filename' (e.g., 'B1_Set_A.html') and 'htmlContent' (the fully generated HTML string for that paper, using the exact styling and structure of the template, integrating MathJax for equations). 
Ensure the HTML is perfectly valid and properly escapes quotes if needed for JSON.`;

  const contentsParts: any[] = [{ text: prompt }];

  // Read files and add to prompt
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const base64 = await fileToBase64(file);
    contentsParts.push({ text: `Uploaded File ${i + 1}: ${file.name}` });
    contentsParts.push({ inlineData: { data: base64, mimeType: file.type } });
  }

  let lastError: any;

  // Try each key until one succeeds
  for (const key of keys) {
    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        model: modelName || 'gemini-3.1-pro-preview',
        contents: contentsParts,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                filename: { type: Type.STRING, description: "e.g., B1_Set_A.html" },
                htmlContent: { type: Type.STRING, description: "The complete HTML code based on the template" }
              },
              required: ["filename", "htmlContent"]
            }
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error('Empty response from model');

      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      const data = JSON.parse(cleanedText) as GeneratedQP[];
      
      return data;
    } catch (error) {
      console.error('Error generating QPs with key:', error);
      lastError = error;
    }
  }

  throw lastError || new Error('Failed to generate Question Papers with the provided API keys.');
}