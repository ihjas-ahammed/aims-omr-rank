import Tesseract from 'tesseract.js';
import { parseClipboardTimetable, ParsedClipboardResult } from '../utils/timetableClipboardParser';

export interface OcrProgress {
  status: string;
  progress: number; // 0 to 1
}

/**
 * Quick, client-side OCR extraction without relying on Gemini AI.
 * Runs completely in the browser via WebAssembly, requires zero API keys,
 * and works offline.
 */
export async function extractTextWithQuickOcr(
  imageSource: File | Blob | string,
  onProgress?: (info: OcrProgress) => void
): Promise<string> {
  try {
    // 1. Check if browser has native TextDetector (instant hardware acceleration on supported devices)
    if (typeof window !== 'undefined' && 'TextDetector' in window && imageSource instanceof Blob) {
      try {
        const imageBitmap = await createImageBitmap(imageSource);
        const textDetector = new (window as any).TextDetector();
        const detected = await textDetector.detect(imageBitmap);
        if (Array.isArray(detected) && detected.length > 0) {
          const joinedText = detected.map((item: any) => item.rawValue).join('\n').trim();
          if (joinedText.length > 10) {
            if (onProgress) onProgress({ status: 'Extracted via Native OS OCR', progress: 1 });
            return joinedText;
          }
        }
      } catch (nativeErr) {
        console.warn('Native TextDetector failed or not supported, using Tesseract.js:', nativeErr);
      }
    }

    // 2. Tesseract.js client-side OCR
    const result = await Tesseract.recognize(
      imageSource,
      'eng',
      {
        logger: (m: any) => {
          if (onProgress && m) {
            const statusMessage = 
              m.status === 'loading tesseract core' ? 'Loading OCR engine...' :
              m.status === 'initializing tesseract' ? 'Initializing OCR...' :
              m.status === 'loading language traineddata' ? 'Loading language model...' :
              m.status === 'initializing api' ? 'Preparing OCR pipeline...' :
              m.status === 'recognizing text' ? `Reading document text (${Math.round((m.progress || 0) * 100)}%)...` :
              m.status || 'Extracting text...';
            
            onProgress({
              status: statusMessage,
              progress: typeof m.progress === 'number' ? m.progress : 0
            });
          }
        }
      }
    );

    const extractedText = result.data?.text || '';
    if (onProgress) {
      onProgress({ status: 'Text extraction complete', progress: 1 });
    }

    return extractedText;
  } catch (err: any) {
    console.error('Quick OCR failed:', err);
    throw new Error(`Quick OCR failed: ${err?.message || 'Could not extract text from image'}`);
  }
}

/**
 * Performs Quick OCR on a timetable image screenshot and directly parses it
 * into structured day schedule and class periods using timetableClipboardParser.
 */
export async function scanTimetableWithQuickOcr(
  imageSource: File | Blob | string,
  teacherMappings: Record<string, string>,
  onProgress?: (info: OcrProgress) => void
): Promise<{
  rawText: string;
  parsed: ParsedClipboardResult;
}> {
  const rawText = await extractTextWithQuickOcr(imageSource, onProgress);
  
  if (!rawText.trim()) {
    throw new Error('No legible text was found in the image. Please ensure the screenshot is clear and well-lit.');
  }

  // Parse extracted raw OCR text with our timetable parser
  const parsed = parseClipboardTimetable(rawText, teacherMappings);

  return {
    rawText,
    parsed
  };
}
