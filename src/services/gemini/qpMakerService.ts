import { GoogleGenAI, Type } from '@google/genai';
import { fileToBase64 } from '../../utils/imageProcessing';

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

export async function generateQuestionPapers(
  files: File[],
  instructions: string,
  templateHtml: string,
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
${templateHtml}
\`\`\`

CRITICAL REQUIREMENT: Keep the logo IMG tag (\`<img src="logo1.png" ...>\`) exactly as it is in the template! Do not remove or change it. Ensure it remains in the final HTML.

Output a JSON array where each object contains a 'filename' (e.g., 'B1_Set_A.html') and 'htmlContent' (the fully generated HTML string for that paper, using the exact styling and structure of the template, integrating MathJax for equations). 
Ensure the HTML is perfectly valid and properly escapes quotes if needed for JSON.`;

  const contentsParts: any[] = [{ text: prompt }];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const base64 = await fileToBase64(file);
    contentsParts.push({ text: `Uploaded File ${i + 1}: ${file.name}` });
    contentsParts.push({ inlineData: { data: base64, mimeType: file.type } });
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