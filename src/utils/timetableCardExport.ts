import { toPng, toBlob } from 'html-to-image';

/**
 * High resolution timetable card export engine using html-to-image.
 * Handles modern CSS (including Tailwind v4 OKLCH), custom fonts, and high-DPI rendering (2.5x).
 */

export async function captureTimetableCardBlob(elementId: string = 'timetable-poster-card'): Promise<Blob> {
  const cardElement = document.getElementById(elementId);
  if (!cardElement) {
    throw new Error(`Poster card element "#${elementId}" not found in DOM`);
  }

  // Pre-load fonts and images to guarantee clean capture
  try {
    if (document.fonts) {
      await document.fonts.ready;
    }
  } catch (e) {}

  // 1. Primary Engine: html-to-image (Supports OKLCH, CSS variables, Google Fonts)
  try {
    const blob = await toBlob(cardElement, {
      pixelRatio: 2.5,
      backgroundColor: '#ffffff',
      cacheBust: true,
      skipAutoScale: true,
      filter: (node) => {
        // Exclude any interactive controls or modals if accidentally nested
        if (node instanceof HTMLElement && node.classList.contains('no-export')) {
          return false;
        }
        return true;
      }
    });

    if (blob && blob.size > 0) {
      return blob;
    }
  } catch (err) {
    console.warn('toBlob from html-to-image failed, trying toPng dataUrl conversion:', err);
  }

  // 2. Secondary fallback with toPng dataUrl
  try {
    const dataUrl = await toPng(cardElement, {
      pixelRatio: 2.5,
      backgroundColor: '#ffffff',
      cacheBust: true
    });

    const res = await fetch(dataUrl);
    const blob = await res.blob();
    if (blob && blob.size > 0) {
      return blob;
    }
  } catch (err2) {
    console.error('All html-to-image export methods failed:', err2);
    throw new Error(`Failed to generate timetable image: ${(err2 as any)?.message || 'Export error'}`);
  }

  throw new Error('Failed to generate image blob from poster element');
}

export async function downloadTimetableCardImage(
  batchName: string,
  date: string,
  elementId: string = 'timetable-poster-card'
): Promise<void> {
  const cardElement = document.getElementById(elementId);
  if (!cardElement) {
    throw new Error(`Poster card element "#${elementId}" not found in DOM`);
  }

  const cleanDate = (date || '').replace(/[\/\.\-]/g, '_');
  const cleanBatch = (batchName || 'PLUS_ONE').replace(/\s+/g, '_');
  const fileName = `TIMETABLE_${cleanBatch}_${cleanDate}.png`;

  try {
    // Generate high-res dataUrl directly for fastest, safest download
    const dataUrl = await toPng(cardElement, {
      pixelRatio: 2.5,
      backgroundColor: '#ffffff',
      cacheBust: true
    });

    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.warn('Direct dataUrl download failed, trying blob fallback:', err);
    const blob = await captureTimetableCardBlob(elementId);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = fileName;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
}

export async function copyTimetableCardToClipboard(
  elementId: string = 'timetable-poster-card'
): Promise<boolean> {
  const blob = await captureTimetableCardBlob(elementId);
  if (navigator.clipboard && navigator.clipboard.write) {
    await navigator.clipboard.write([
      new ClipboardItem({ [blob.type]: blob })
    ]);
    return true;
  }
  throw new Error('Clipboard write API is not supported on this device/browser.');
}
