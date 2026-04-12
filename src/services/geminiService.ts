import { GoogleGenAI, Type } from '@google/genai';

export interface OMRResult {
  name: string;
  right: number;
  wrong: number;
  scores: Record<string, number>; // q1 to q25
  confidence: number;
  confidences?: number[];
  nameConfidence?: number;
}

export interface AutoCropResult {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
  rotation: number;
}

let currentKeyIndex = 0;

function getKeys(apiKeys: string[]) {
  const keys = apiKeys.length > 0 ? apiKeys : [process.env.GEMINI_API_KEY].filter(Boolean) as string[];
  if (keys.length === 0) {
    throw new Error('No API keys provided.');
  }
  return keys;
}

function getNextKey(keys: string[]): { key: string, index: number } {
  const index = currentKeyIndex;
  currentKeyIndex = (currentKeyIndex + 1) % keys.length;
  return { key: keys[index], index };
}

export async function fetchAvailableModels(apiKeys: string[]): Promise<string[]> {
  const keys = getKeys(apiKeys);
  let lastError: any;
  
  for (let i = 0; i < keys.length; i++) {
    const { key } = getNextKey(keys);
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      return data.models
        .map((m: any) => m.name.replace('models/', ''))
        .filter((name: string) => name.includes('gemini') || name.includes('gemma'));
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('Failed to fetch models');
}

export async function evaluateOMR(
  imageBase64: string,
  mimeType: string,
  apiKeys: string[],
  model: string,
  liteModel: string,
  answerKeyPrompt: string
): Promise<OMRResult> {
  const keysToTry = getKeys(apiKeys);

  const prompt = `
You are an expert OMR sheet evaluator.
Evaluate the provided OMR sheet image based on the following rules and answer key.
GIVE full focus on validation.

### Answer Key
${answerKeyPrompt}

Questions 26 through 30 have not been bubbled. Ignore them.

### Evaluation Rules:
- For each question Q1 to Q25, determine if the student's answer is correct, wrong, or unattempted.
- Give 1 if correct, -1 if wrong, 0 if no answer.
- Cross marks: If a student made a mistake and used a cross mark on a bubble, evaluate their second option (the bubbled one without a cross). If they only have one cross mark and no other bubble, skip the question (give 0).
- Extract the student's NAME from the sheet. (Best effort only, exact spelling is not critical as it will be verified against an attendance sheet later).
- Calculate total RIGHT (sum of 1s) and WRONG (count of -1s).
- Provide a confidence score from 0 to 100 representing how confident you are in your evaluation of this sheet.

Output your response as a JSON object with the following structure:
{
  "name": "Student Name",
  "right": 10,
  "wrong": 5,
  "confidence": 95,
  "q1": 1,
  "q2": -1,
  "q3": 0,
  // ... up to q25
}
`;

  const schemaConfig = {
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "Student's name" },
        right: { type: Type.INTEGER, description: "Total correct answers (1s)" },
        wrong: { type: Type.INTEGER, description: "Total wrong answers (-1s)" },
        confidence: { type: Type.INTEGER, description: "Confidence score from 0 to 100" },
        q1: { type: Type.INTEGER }, q2: { type: Type.INTEGER }, q3: { type: Type.INTEGER }, q4: { type: Type.INTEGER }, q5: { type: Type.INTEGER },
        q6: { type: Type.INTEGER }, q7: { type: Type.INTEGER }, q8: { type: Type.INTEGER }, q9: { type: Type.INTEGER }, q10: { type: Type.INTEGER },
        q11: { type: Type.INTEGER }, q12: { type: Type.INTEGER }, q13: { type: Type.INTEGER }, q14: { type: Type.INTEGER }, q15: { type: Type.INTEGER },
        q16: { type: Type.INTEGER }, q17: { type: Type.INTEGER }, q18: { type: Type.INTEGER }, q19: { type: Type.INTEGER }, q20: { type: Type.INTEGER },
        q21: { type: Type.INTEGER }, q22: { type: Type.INTEGER }, q23: { type: Type.INTEGER }, q24: { type: Type.INTEGER }, q25: { type: Type.INTEGER },
      },
      required: ["name", "right", "wrong", "confidence", "q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10", "q11", "q12", "q13", "q14", "q15", "q16", "q17", "q18", "q19", "q20", "q21", "q22", "q23", "q24", "q25"]
    }
  };

  let lastError: any;

  for (let i = 0; i < keysToTry.length; i++) {
    const { key } = getNextKey(keysToTry);
    try {
      const ai = new GoogleGenAI({ apiKey: key });
      
      const response = await ai.models.generateContent({
        model: model || 'gemini-3.1-pro-preview',
        contents: [
          { text: prompt },
          { inlineData: { data: imageBase64, mimeType } }
        ]
      });

      const text = response.text;
      if (!text) throw new Error('Empty response from model');
      
      let data;
      try {
        const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
        data = JSON.parse(cleanedText);
      } catch (parseError) {
        console.log('Failed to parse JSON from pro model, using lite model to restructure...', text);
        const restructureResponse = await ai.models.generateContent({
          model: liteModel || 'gemini-3.1-flash-lite-preview',
          contents: `Extract the OMR evaluation data from the following text and format it as JSON.\n\nText:\n${text}`,
          config: schemaConfig as any
        });
        
        const restructuredText = restructureResponse.text;
        if (!restructuredText) throw new Error('Empty response from lite model during restructure');
        data = JSON.parse(restructuredText);
      }
      
      const scores: Record<string, number> = {};
      for (let j = 1; j <= 25; j++) {
        scores[`q${j}`] = data[`q${j}`] ?? 0;
      }

      return {
        name: data.name || 'Unknown',
        right: data.right || 0,
        wrong: data.wrong || 0,
        confidence: data.confidence ?? 100,
        scores
      };

    } catch (error: any) {
      console.error('Error with API key:', error);
      lastError = error;
    }
  }

  throw lastError || new Error('Failed to evaluate OMR sheet with all provided keys.');
}

export async function evaluateOMRBatch(
  images: { id: string, base64: string, mimeType: string }[],
  apiKeys: string[],
  model: string,
  liteModel: string,
  answerKeyPrompt: string
): Promise<Record<string, OMRResult>> {
  const keysToTry = getKeys(apiKeys);

  const prompt = `
You are an expert OMR sheet evaluator.
Evaluate the provided OMR sheet images based on the following rules and answer key.
GIVE full focus on validation.

### Answer Key
${answerKeyPrompt}

Questions 26 through 30 have not been bubbled. Ignore them.

### Evaluation Rules:
- For each question Q1 to Q25, determine if the student's answer is correct, wrong, or unattempted.
- Give 1 if correct, -1 if wrong, 0 if no answer.
- Extract the student's NAME from the sheet. (Best effort only, exact spelling is not critical as it will be verified against an attendance sheet later).
- Calculate total RIGHT (sum of 1s) and WRONG (count of -1s).
- Provide a confidence score from 0 to 100 representing how confident you are in your evaluation of this sheet. (be accurate)

You will receive ${images.length} images. Each image corresponds to an ID. Evaluate each image and return a JSON object mapping the image ID to its evaluation result.

Output your response as a JSON object with the following structure:
{
  "image_id_1": {
    "name": "Student Name",
    "right": 10,
    "wrong": 5,
    "confidence": 95,
    "q1": 1,
    "q2": -1,
    "q3": 0,
    // ... up to q25
  },
  "image_id_2": {
    // ...
  }
}
`;

  const schemaConfig = {
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.OBJECT,
      properties: images.reduce((acc, img) => {
        acc[img.id] = {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Student's name" },
            right: { type: Type.INTEGER, description: "Total correct answers (1s)" },
            wrong: { type: Type.INTEGER, description: "Total wrong answers (-1s)" },
            confidence: { type: Type.INTEGER, description: "Confidence score from 0 to 100" },
            q1: { type: Type.INTEGER }, q2: { type: Type.INTEGER }, q3: { type: Type.INTEGER }, q4: { type: Type.INTEGER }, q5: { type: Type.INTEGER },
            q6: { type: Type.INTEGER }, q7: { type: Type.INTEGER }, q8: { type: Type.INTEGER }, q9: { type: Type.INTEGER }, q10: { type: Type.INTEGER },
            q11: { type: Type.INTEGER }, q12: { type: Type.INTEGER }, q13: { type: Type.INTEGER }, q14: { type: Type.INTEGER }, q15: { type: Type.INTEGER },
            q16: { type: Type.INTEGER }, q17: { type: Type.INTEGER }, q18: { type: Type.INTEGER }, q19: { type: Type.INTEGER }, q20: { type: Type.INTEGER },
            q21: { type: Type.INTEGER }, q22: { type: Type.INTEGER }, q23: { type: Type.INTEGER }, q24: { type: Type.INTEGER }, q25: { type: Type.INTEGER },
          },
          required: ["name", "right", "wrong", "confidence", "q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10", "q11", "q12", "q13", "q14", "q15", "q16", "q17", "q18", "q19", "q20", "q21", "q22", "q23", "q24", "q25"]
        };
        return acc;
      }, {} as any),
      required: images.map(img => img.id)
    }
  };

  let lastError: any;

  for (let i = 0; i < keysToTry.length; i++) {
    const { key } = getNextKey(keysToTry);
    try {
      const ai = new GoogleGenAI({ apiKey: key });
      
      const contentsParts: any[] = [{ text: prompt }];
      images.forEach((img) => {
        contentsParts.push({ text: `Image ID: ${img.id}` });
        contentsParts.push({ inlineData: { data: img.base64, mimeType: img.mimeType } });
      });

      const response = await ai.models.generateContent({
        model: model || 'gemini-3.1-pro-preview',
        contents: contentsParts
      });

      const text = response.text;
      if (!text) throw new Error('Empty response from model');
      
      let data;
      try {
        const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
        data = JSON.parse(cleanedText);
      } catch (parseError) {
        console.log('Failed to parse JSON from pro model, using lite model to restructure...', text);
        const restructureResponse = await ai.models.generateContent({
          model: liteModel || 'gemini-3.1-flash-lite-preview',
          contents: `Extract the OMR evaluation data from the following text and format it as JSON.\n\nText:\n${text}`,
          config: schemaConfig as any
        });
        
        const restructuredText = restructureResponse.text;
        if (!restructuredText) throw new Error('Empty response from lite model during restructure');
        data = JSON.parse(restructuredText);
      }
      
      const finalResults: Record<string, OMRResult> = {};
      
      for (const img of images) {
        const imgData = data[img.id];
        if (!imgData) continue;
        
        const scores: Record<string, number> = {};
        for (let j = 1; j <= 25; j++) {
          scores[`q${j}`] = imgData[`q${j}`] ?? 0;
        }
        
        finalResults[img.id] = {
          name: imgData.name || 'Unknown',
          right: imgData.right || 0,
          wrong: imgData.wrong || 0,
          confidence: imgData.confidence ?? 100,
          scores
        };
      }

      return finalResults;

    } catch (error: any) {
      console.error('Error with API key:', error);
      lastError = error;
    }
  }

  throw lastError || new Error('Failed to evaluate OMR sheets with all provided keys.');
}

export async function correctNamesBatch(
  foundNames: string[],
  attendanceSheet: string,
  apiKeys: string[],
  model: string
): Promise<Record<string, { correctedName: string, confidence: number }>> {
  if (foundNames.length === 0) return {};
  
  const keysToTry = getKeys(apiKeys);
  const finalMap: Record<string, { correctedName: string, confidence: number }> = {};
  const BATCH_SIZE = 20;
  const batchPromises = [];
  
  for (let batchStart = 0; batchStart < foundNames.length; batchStart += BATCH_SIZE) {
    const batchNames = foundNames.slice(batchStart, batchStart + BATCH_SIZE);
    
    batchPromises.push((async () => {
      const prompt = `
You are a data correction assistant.
I have a list of names extracted via OCR from OMR sheets, which might have spelling mistakes.
I also have an official attendance sheet.
Map each extracted name to the closest matching name in the attendance sheet.
Watch out specifically for these three distinct people: "Fathima Nasha", "Fathima Nasha CP", and "Nasha Fathima P".
similarly, we have Ridha K and Rihan K

For each name, provide the closest match from the attendance sheet and a confidence score (0-100) representing how certain you are of this match. If no good match is found, return the original name and a low confidence score.

Extracted Names:
${JSON.stringify(batchNames)}

Attendance Sheet:
${attendanceSheet}
`;

      let lastError: any;
      for (let i = 0; i < keysToTry.length; i++) {
        const { key } = getNextKey(keysToTry);
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
                    original: { type: Type.STRING, description: "The exact extracted name" },
                    corrected: { type: Type.STRING, description: "The corrected name from the attendance sheet" },
                    confidence: { type: Type.INTEGER, description: "Confidence score from 0 to 100" }
                  },
                  required: ["original", "corrected", "confidence"]
                }
              }
            }
          });

          const text = response.text;
          if (!text) throw new Error('Empty response from model');
          
          const data = JSON.parse(text) as { original: string, corrected: string, confidence: number }[];
          return data;
        } catch (error) {
          console.error('Error with API key in batch correction:', error);
          lastError = error;
        }
      }
      throw lastError || new Error('Failed to correct names with all provided keys.');
    })());
  }
  
  const results = await Promise.all(batchPromises);
  
  for (const batchResult of results) {
    for (const item of batchResult) {
      finalMap[item.original] = { correctedName: item.corrected, confidence: item.confidence };
    }
  }

  return finalMap;
}

export async function extractTextFromDocument(
  base64: string,
  mimeType: string,
  apiKeys: string[],
  model: string,
  extractionType: 'answerKey' | 'topicMapping'
): Promise<string> {
  const keysToTry = getKeys(apiKeys);
  
  const prompt = extractionType === 'answerKey' 
    ? `Extract the answer key from this document. Format it as a simple list like:
* **Q1.** A
* **Q2.** B
* **Q3.** C
Only output the formatted text, nothing else.`
    : `Extract the chapter and topic mapping from this document. Format it exactly like this:
### Chapter Name
* Topic Name: Q1, Q2, Q3
* Another Topic: Q4, Q5

### Another Chapter
* Topic Name: Q6, Q7

Only output the formatted text, nothing else.`;

  let lastError: any;

  for (let i = 0; i < keysToTry.length; i++) {
    const { key } = getNextKey(keysToTry);
    try {
      const ai = new GoogleGenAI({ apiKey: key });
      
      const response = await ai.models.generateContent({
        model: model || 'gemini-3.1-pro-preview',
        contents: [
          { text: prompt },
          { inlineData: { data: base64, mimeType } }
        ]
      });

      const text = response.text;
      if (!text) throw new Error('Empty response from model');
      
      return text.trim();
    } catch (error: any) {
      console.error('Error with API key in extractTextFromDocument:', error);
      lastError = error;
    }
  }

  throw lastError || new Error('Failed to extract text with all provided keys.');
}

export async function parseTopicMappingWithAI(
  mappingText: string,
  apiKeys: string[],
  model: string
): Promise<any> {
  const keysToTry = getKeys(apiKeys);

  const prompt = `
You are an expert curriculum parser.
Convert the provided topic mapping text into a structured JSON format.
The text contains Chapters, Topics, and the Question numbers associated with each topic.

Input text:
${mappingText}
`;

  let lastError: any;

  for (let i = 0; i < keysToTry.length; i++) {
    const { key } = getNextKey(keysToTry);
    try {
      const ai = new GoogleGenAI({ apiKey: key });
      
      const response = await ai.models.generateContent({
        model: model || 'gemini-3.1-flash-lite-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING, description: "The name of the chapter" },
                questions: { 
                  type: Type.ARRAY, 
                  items: { type: Type.INTEGER },
                  description: "All question numbers in this chapter"
                },
                topics: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING, description: "The name of the topic" },
                      questions: {
                        type: Type.ARRAY,
                        items: { type: Type.INTEGER },
                        description: "The question numbers associated with this topic"
                      }
                    },
                    required: ["name", "questions"]
                  }
                }
              },
              required: ["name", "questions", "topics"]
            }
          }
        }
      });

      const jsonStr = response.text?.trim() || '[]';
      const parsed = JSON.parse(jsonStr);
      return parsed;
    } catch (error) {
      console.error('Error with API key in parseTopicMappingWithAI:', error);
      lastError = error;
    }
  }

  throw lastError || new Error('Failed to parse topic mapping with all provided keys.');
}

export async function autoCropAndRotate(
  imageBase64: string,
  mimeType: string,
  apiKeys: string[],
  model: string
): Promise<AutoCropResult> {
  const keysToTry = getKeys(apiKeys);

  const prompt = `
You are an image processing assistant. Identify the exact bounding box of the main OMR sheet document within the image, ignoring background surfaces.
Return the coordinates of the bounding box normalized to a 0-1000 scale (ymin, xmin, ymax, xmax).

CRITICAL: OMR sheets are PORTRAIT (taller than they are wide). 
If the image shows the sheet lying sideways (landscape), you MUST return a rotation of 90 or 270 to make it upright.
Determine the clockwise rotation needed (0, 90, 180, or 270) to make the text on the OMR sheet upright and readable in a portrait orientation.

Output your response as a JSON object with this exact structure:
{
  "ymin": 100,
  "xmin": 150,
  "ymax": 900,
  "xmax": 850,
  "rotation": 0
}
`;

  let lastError: any;

  for (let i = 0; i < keysToTry.length; i++) {
    const { key } = getNextKey(keysToTry);
    try {
      const ai = new GoogleGenAI({ apiKey: key });
      
      const response = await ai.models.generateContent({
        model: model || 'gemini-3.1-flash-lite-preview',
        contents: [
          { text: prompt },
          { inlineData: { data: imageBase64, mimeType } }
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              ymin: { type: Type.INTEGER },
              xmin: { type: Type.INTEGER },
              ymax: { type: Type.INTEGER },
              xmax: { type: Type.INTEGER },
              rotation: { type: Type.INTEGER }
            },
            required: ["ymin", "xmin", "ymax", "xmax", "rotation"]
          }
        }
      });

      const text = response.text;
      if (!text) throw new Error('Empty response from model');
      
      const data = JSON.parse(text) as AutoCropResult;
      return data;
    } catch (error) {
      console.error('Error with API key in autoCropAndRotate:', error);
      lastError = error;
    }
  }
  throw lastError || new Error('Failed to process image with all provided keys.');
}

export interface FeeRecord {
  admissionNo: string;
  studentClass: string;
  studentName: string;
  feeAmount: number;
  isGPay: boolean;
  date: string;
}

export async function extractFeeRecordsBatch(
  images: { id: string, base64: string, mimeType: string }[],
  apiKeys: string[],
  model: string
): Promise<Record<string, FeeRecord[]>> {
  const keysToTry = getKeys(apiKeys);

  const prompt = `
You are an expert data extraction assistant.
Extract the fee log records from the provided handwritten ledger images.
The columns are typically: Admission No, Class, Student Name, Fee Amount, Payment Method (GP means Google Pay), and Date.

Rules:
1. Handle ditto marks (") or blank dates by inferring the date from the previous row.
2. Convert dates to YYYY-MM-DD format. Assume the year is 2025 if not fully specified.
3. If 'GP' is written in the payment method column, set isGPay to true, otherwise false.
4. If a field is completely unreadable, leave it as an empty string (or 0 for numbers).

Output your response as a JSON object mapping each image ID to an array of records with this structure:
{
  "image_id_1": [
    {
      "admissionNo": "1024",
      "studentClass": "10A",
      "studentName": "John Doe",
      "feeAmount": 500,
      "isGPay": true,
      "date": "2025-04-10"
    }
  ],
  "image_id_2": [...]
}
`;

  const schemaConfig = {
    responseMimeType: 'application/json',
    responseSchema: {
      type: Type.OBJECT,
      properties: images.reduce((acc, img) => {
        acc[img.id] = {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              admissionNo: { type: Type.STRING },
              studentClass: { type: Type.STRING },
              studentName: { type: Type.STRING },
              feeAmount: { type: Type.NUMBER },
              isGPay: { type: Type.BOOLEAN },
              date: { type: Type.STRING, description: "YYYY-MM-DD format" }
            },
            required: ["admissionNo", "studentClass", "studentName", "feeAmount", "isGPay", "date"]
          }
        };
        return acc;
      }, {} as any),
      required: images.map(img => img.id)
    }
  };

  let lastError: any;

  for (let i = 0; i < keysToTry.length; i++) {
    const { key } = getNextKey(keysToTry);
    try {
      const ai = new GoogleGenAI({ apiKey: key });

      const contentsParts: any[] = [{ text: prompt }];
      images.forEach((img) => {
        contentsParts.push({ text: `Image ID: ${img.id}` });
        contentsParts.push({ inlineData: { data: img.base64, mimeType: img.mimeType } });
      });

      const response = await ai.models.generateContent({
        model: model || 'gemini-3.1-pro-preview',
        contents: contentsParts,
        config: schemaConfig as any
      });

      const text = response.text;
      if (!text) throw new Error('Empty response from model');

      let data;
      try {
        const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
        data = JSON.parse(cleanedText) as Record<string, FeeRecord[]>;
      } catch (parseError) {
        console.error("Parse Error:", parseError);
        throw new Error("Failed to parse JSON from AI response.");
      }

      return data;
    } catch (error: any) {
      console.error('Error with API key in extractFeeRecordsBatch:', error);
      lastError = error;
    }
  }

  throw lastError || new Error('Failed to extract fee records with all provided keys.');
}