import { GoogleGenAI, Type } from '@google/genai';

let currentKeyIndex = 0;
function getNextKey(keys: string[]) {
  if (keys.length === 0) throw new Error("No API keys provided.");
  const index = currentKeyIndex;
  currentKeyIndex = (currentKeyIndex + 1) % keys.length;
  return keys[index];
}

export async function identifyStudentFromPage(
  base64: string,
  mimeType: string,
  previousName: string | null,
  apiKeys: string[],
  model: string
): Promise<{ isNewStudent: boolean, studentName: string | null }> {
  const keysToTry = apiKeys.filter(k => k.trim());
  let lastError: any;

  const prompt = `Analyze this handwritten exam page. 
Context: The previous page belonged to student "${previousName || 'None'}".
Determine if this page belongs to a new student or is a continuation of the previous student's exam.
Look for a clear "Name" or "Student" field at the top.
If there is a new name, return isNewStudent: true and the studentName.
If there is no name and it looks like a continuation, return isNewStudent: false and studentName: null.
`;

  for (let i = 0; i < keysToTry.length; i++) {
    const key = getNextKey(keysToTry);
    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        model: model || 'gemini-3.1-flash-lite-preview',
        contents: [
          { text: prompt },
          { inlineData: { data: base64, mimeType } }
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isNewStudent: { type: Type.BOOLEAN },
              studentName: { type: Type.STRING, nullable: true }
            },
            required: ["isNewStudent"]
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error('Empty response from model');
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError || new Error("Failed to identify student with provided keys.");
}

export async function evaluateDescriptiveAnswers(
  images: { base64: string, mimeType: string }[],
  answerKey: string,
  topicMapping: string,
  apiKeys: string[],
  model: string
): Promise<{ totalScore: number, maxTotalScore: number, breakdown: any[], feedback: string }> {
  const keysToTry = apiKeys.filter(k => k.trim());
  let lastError: any;

  const contents: any[] = [
    { text: `You are an expert examiner. Grade the student's descriptive exam answers from these images.
Question Paper & Evaluation Scheme (JSON):
${answerKey}

Topic Mapping:
${topicMapping}

For each question, assign a 'colorLevel' (0, 1, 2, or 3) strictly based on the rubric provided in the evaluation scheme JSON.
Provide totalScore, maxTotalScore, breakdown of marks, and short constructive overall feedback.
` }
  ];
  
  images.forEach(img => {
    contents.push({ inlineData: { data: img.base64, mimeType: img.mimeType } });
  });

  for (let i = 0; i < keysToTry.length; i++) {
    const key = getNextKey(keysToTry);
    try {
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        model: model || 'gemini-3.1-pro-preview',
        contents,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              totalScore: { type: Type.NUMBER },
              maxTotalScore: { type: Type.NUMBER },
              breakdown: { 
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    questionNumber: { type: Type.STRING },
                    score: { type: Type.NUMBER },
                    maxScore: { type: Type.NUMBER },
                    colorLevel: { type: Type.INTEGER, description: "0: Red, 1: Orange, 2: Yellow, 3: Green" },
                    remarks: { type: Type.STRING }
                  },
                  required: ["questionNumber", "score", "maxScore", "colorLevel", "remarks"]
                }
              },
              feedback: { type: Type.STRING }
            },
            required: ["totalScore", "maxTotalScore", "breakdown", "feedback"]
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error('Empty response from model');
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError || new Error("Failed to evaluate answers with provided keys.");
}

export async function fixDescriptiveNamesBatch(
  extractedNames: string[],
  officialNames: string[],
  apiKeys: string[],
  model: string
): Promise<Record<string, { correctedName: string, confidence: number }>> {
  const keysToTry = apiKeys.filter(k => k.trim());
  let lastError: any;
  const finalMap: Record<string, { correctedName: string, confidence: number }> = {};
  const BATCH_SIZE = 20;

  for (let start = 0; start < extractedNames.length; start += BATCH_SIZE) {
    const batch = extractedNames.slice(start, start + BATCH_SIZE);
    
    const prompt = `You are a data correction assistant.
Map each extracted name to the closest matching name in the official list.
Extracted Names: ${JSON.stringify(batch)}
Official Names: ${JSON.stringify(officialNames)}`;

    for (let i = 0; i < keysToTry.length; i++) {
      const key = getNextKey(keysToTry);
      try {
        const ai = new GoogleGenAI({ apiKey: key });
        const response = await ai.models.generateContent({
          model: model || 'gemini-3.1-pro-preview',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING },
                  corrected: { type: Type.STRING },
                  confidence: { type: Type.INTEGER }
                },
                required: ["original", "corrected", "confidence"]
              }
            }
          }
        });

        const text = response.text;
        if (!text) throw new Error('Empty response');
        const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
        const data = JSON.parse(cleanedText) as any[];
        data.forEach(item => {
          finalMap[item.original] = { correctedName: item.corrected, confidence: item.confidence };
        });
        break; // break inner loop on success
      } catch (e) {
        lastError = e;
        if (i === keysToTry.length - 1) throw lastError;
      }
    }
  }
  return finalMap;
}