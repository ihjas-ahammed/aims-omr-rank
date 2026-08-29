import { GoogleGenAI, Type } from "@google/genai";
import { OnlineExam, OnlineExamSubmission, gradeStudentDescriptive } from "../onlineExamService";

export interface AIGradeResult {
  questionNumber: number;
  marks: number;
  maxMarks: number;
  feedback: string;
}

export interface AISubmissionEvaluationResult {
  grades: Record<number, { marks: number; feedback: string }>;
  overallFeedback: string;
  totalAwardedDescriptiveMarks: number;
}

function getApiKeys(): string[] {
  try {
    const storedList = localStorage.getItem("omr_apiKeysList");
    if (storedList) {
      const parsed = JSON.parse(storedList);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const valid = parsed.map(k => String(k).trim()).filter(Boolean);
        if (valid.length > 0) return valid;
      }
    }

    const storedOld = localStorage.getItem("omr_apiKeys");
    if (storedOld) {
      const split = storedOld.split(",").map(k => k.trim()).filter(Boolean);
      if (split.length > 0) return split;
    }
  } catch (e) {}

  return [];
}

/**
 * Converts an image URL (from Backblaze B2 or HTTPS) to base64 inlineData
 */
async function urlToBase64(url: string): Promise<{ base64: string; mimeType: string } | null> {
  try {
    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        resolve({ base64, mimeType: blob.type || "image/jpeg" });
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn("Failed to fetch image for AI grading:", url, e);
    return null;
  }
}

/**
 * Evaluates a single student submission with Google Gemini GenAI Multimodal
 */
export async function evaluateSubmissionWithAI(
  exam: OnlineExam,
  submission: OnlineExamSubmission,
  modelName?: string
): Promise<AISubmissionEvaluationResult> {
  const keys = getApiKeys();
  if (keys.length === 0) {
    throw new Error("No Gemini API Key found. Please add an API key in Settings.");
  }

  const descQuestions = exam.questions.filter(q => q.type === "descriptive");
  if (descQuestions.length === 0) {
    return {
      grades: {},
      overallFeedback: "No descriptive questions to grade in this exam.",
      totalAwardedDescriptiveMarks: 0
    };
  }

  const model = modelName || localStorage.getItem("omr_proModel") || "gemini-3.1-pro-preview";

  const systemInstruction = `You are a fair, strict, and highly accurate academic examiner grading student descriptive answers for an educational institute (AIMS Plus).
You are evaluating descriptive handwritten pages (images) and/or typed answers submitted by a student.

For each question:
1. Review the Question Prompt, Max Marks, and Teacher Guidelines/Scheme.
2. Read the student's typed answer and inspect all attached handwritten image pages carefully.
3. Award fair marks from 0 up to Max Marks (decimals like 0.5, 1.5, 2.5, 3.5 are allowed).
4. Provide concise, constructive feedback explaining why marks were awarded or deducted.
5. Provide overall exam feedback.

Return ONLY a JSON object adhering to the schema.`;

  // Build multimodal contents
  const contentsParts: any[] = [
    {
      text: `EXAM: ${exam.title} (Subject: ${exam.subject || "General"}, Class: ${exam.className})
STUDENT: ${submission.studentName} (Class: ${submission.studentClass})

QUESTIONS TO EVALUATE:`
    }
  ];

  for (const q of descQuestions) {
    const studentAns = submission.descriptiveAnswers?.[q.number];
    const textAns = studentAns?.textAnswer?.trim() || "";
    const images = studentAns?.images || [];

    contentsParts.push({
      text: `---
QUESTION ${q.number}:
Prompt: ${q.prompt}
Max Marks: ${q.marks}
Guidelines / Expected Key: ${q.guidelines || "Evaluate step-by-step correctness and clarity."}

STUDENT TYPED ANSWER:
${textAns || "[No typed text provided]"}

STUDENT ATTACHED HANDWRITTEN PAGES (${images.length} page(s)):`
    });

    // Fetch and attach each image
    for (let imgIdx = 0; imgIdx < images.length; imgIdx++) {
      const imgObj = images[imgIdx];
      const b64Obj = await urlToBase64(imgObj.url);
      if (b64Obj) {
        contentsParts.push({
          text: `Question ${q.number} - Page ${imgIdx + 1}:`
        });
        contentsParts.push({
          inlineData: {
            data: b64Obj.base64,
            mimeType: b64Obj.mimeType
          }
        });
      } else {
        contentsParts.push({
          text: `[Could not load image page ${imgIdx + 1}]`
        });
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
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallFeedback: { type: Type.STRING },
              evaluations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    questionNumber: { type: Type.INTEGER },
                    marksAwarded: { type: Type.NUMBER },
                    feedback: { type: Type.STRING }
                  },
                  required: ["questionNumber", "marksAwarded", "feedback"]
                }
              }
            },
            required: ["overallFeedback", "evaluations"]
          }
        }
      });

      const rawText = response.text;
      if (!rawText) throw new Error("Empty response from Gemini.");

      const cleaned = rawText.replace(/```json\n?|\n?```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      const gradeMap: Record<number, { marks: number; feedback: string }> = {};
      let totalDesc = 0;

      for (const ev of parsed.evaluations || []) {
        const qNum = Number(ev.questionNumber);
        const qDef = descQuestions.find(dq => dq.number === qNum);
        const maxM = qDef ? qDef.marks : 5;
        let awarded = Number(ev.marksAwarded);
        if (isNaN(awarded) || awarded < 0) awarded = 0;
        if (awarded > maxM) awarded = maxM;

        gradeMap[qNum] = {
          marks: awarded,
          feedback: ev.feedback ? String(ev.feedback).trim() : "Good effort."
        };
        totalDesc += awarded;
      }

      // Ensure any missing question gets 0
      for (const q of descQuestions) {
        if (!gradeMap[q.number]) {
          gradeMap[q.number] = { marks: 0, feedback: "Unattempted / No response." };
        }
      }

      const overall = parsed.overallFeedback?.trim() || "Evaluation completed by AI examiner.";

      // Automatically persist to Firestore
      await gradeStudentDescriptive(exam, submission.id, gradeMap, overall);


      return {
        grades: gradeMap,
        overallFeedback: overall,
        totalAwardedDescriptiveMarks: totalDesc
      };
    } catch (err) {
      console.warn(`AI grading with key ${i} failed:`, err);
      lastError = err;
    }
  }

  throw lastError || new Error("Failed to evaluate submission with AI. Check Gemini API key.");
}
