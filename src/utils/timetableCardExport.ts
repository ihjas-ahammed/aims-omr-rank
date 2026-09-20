import { toPng, toBlob } from 'html-to-image';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * High resolution timetable card export engine using html-to-image.
 * Handles modern CSS (including Tailwind v4 OKLCH), custom fonts, and high-DPI rendering (2.5x).
 */

/**
 * Ensures all fonts, images, and rendering cycles inside the element are settled before capture.
 */
export async function waitForElementReady(
  element: HTMLElement,
  delayMs: number = 300
): Promise<void> {
  // 1. Pre-load web fonts
  try {
    if (typeof document !== 'undefined' && document.fonts) {
      await document.fonts.ready;
    }
  } catch (e) {}

  // 2. Wait for all <img> elements inside to be completely loaded and decoded
  try {
    const images = Array.from(element.querySelectorAll('img'));
    if (images.length > 0) {
      await Promise.all(
        images.map((img) => {
          if (img.complete && img.naturalWidth > 0) {
            return img.decode ? img.decode().catch(() => {}) : Promise.resolve();
          }
          return new Promise<void>((resolve) => {
            const finish = () => {
              if (img.decode) {
                img.decode().then(() => resolve()).catch(() => resolve());
              } else {
                resolve();
              }
            };
            img.addEventListener('load', finish, { once: true });
            img.addEventListener('error', () => resolve(), { once: true });
            // Fallback timeout in case image never fires events
            setTimeout(resolve, 600);
          });
        })
      );
    }
  } catch (e) {}

  // 3. Small deliberate delay so layout, styles, and browser rendering cycles settle cleanly
  if (delayMs > 0) {
    await new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, delayMs)));
  }
}

export async function captureTimetableCardBlob(
  elementId: string = 'timetable-poster-card',
  delayMs: number = 300
): Promise<Blob> {
  const cardElement = document.getElementById(elementId);
  if (!cardElement) {
    throw new Error(`Poster card element "#${elementId}" not found in DOM`);
  }

  // Ensure fonts, images, and layout are settled
  await waitForElementReady(cardElement, delayMs);

  // 1. Primary Engine: html-to-image (Supports OKLCH, CSS variables, Google Fonts)
  try {
    const blob = await toBlob(cardElement, {
      pixelRatio: 2.5,
      backgroundColor: '#ffffff',
      cacheBust: true,
      skipAutoScale: true,
      filter: (node) => {
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
  elementId: string = 'timetable-poster-card',
  delayMs: number = 300
): Promise<void> {
  const cleanDate = (date || '').replace(/[\/\.\-]/g, '_');
  const cleanBatch = (batchName || 'PLUS_ONE').replace(/\s+/g, '_');
  const fileName = `TIMETABLE_${cleanBatch}_${cleanDate}.png`;

  const blob = await captureTimetableCardBlob(elementId, delayMs);
  saveAs(blob, fileName);
}

export interface ShareResult {
  success: boolean;
  method: 'share' | 'clipboard' | 'download' | 'dismissed';
  message?: string;
}

/**
 * Directly shares the timetable card image using Web Share API Level 2 (files).
 * Falls back to copying image to clipboard, or downloading if unsupported.
 */
export async function shareTimetableCardImage(
  batchName: string,
  date: string,
  elementId: string = 'timetable-poster-card',
  delayMs: number = 300
): Promise<ShareResult> {
  const cleanDate = (date || '').replace(/[\/\.\-]/g, '_');
  const cleanBatch = (batchName || 'PLUS_ONE').replace(/\s+/g, '_');
  const fileName = `TIMETABLE_${cleanBatch}_${cleanDate}.png`;

  // 1. Capture high-res blob with full asset loading delay
  const blob = await captureTimetableCardBlob(elementId, delayMs);
  const file = new File([blob], fileName, { type: 'image/png' });

  // 2. Try native Web Share API (Level 2: file sharing)
  let canShareFiles = false;
  try {
    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
      canShareFiles = navigator.canShare({ files: [file] });
    }
  } catch (e) {
    canShareFiles = false;
  }

  if (canShareFiles) {
    try {
      await navigator.share({
        files: [file],
        title: `${batchName} - TIMETABLE`,
        text: `Timetable: ${batchName} (${date})`
      });
      return { success: true, method: 'share', message: 'Shared successfully!' };
    } catch (shareErr: any) {
      if (shareErr?.name === 'AbortError') {
        return { success: true, method: 'dismissed', message: 'Share cancelled' };
      }
      console.warn('Native file share failed, falling back to clipboard/download:', shareErr);
    }
  }

  // 3. Fallback: Copy image to clipboard
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.write) {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      return {
        success: true,
        method: 'clipboard',
        message: 'Poster image copied to clipboard! (Paste directly into WhatsApp/chat)'
      };
    } catch (clipErr) {
      console.warn('Clipboard write fallback failed:', clipErr);
    }
  }

  // 4. Fallback: Download image
  saveAs(blob, fileName);
  return {
    success: true,
    method: 'download',
    message: 'Direct sharing not supported on this browser. Poster image downloaded!'
  };
}

export async function copyTimetableCardToClipboard(
  elementId: string = 'timetable-poster-card',
  delayMs: number = 300
): Promise<boolean> {
  const blob = await captureTimetableCardBlob(elementId, delayMs);
  if (navigator.clipboard && navigator.clipboard.write) {
    await navigator.clipboard.write([
      new ClipboardItem({ [blob.type]: blob })
    ]);
    return true;
  }
  throw new Error('Clipboard write API is not supported on this device/browser.');
}

/**
 * Package multiple class cards into a single ZIP archive to bypass browser multi-download limits.
 */
export async function createTimetableZipArchive(
  date: string,
  files: Array<{ name: string; blob: Blob }>
): Promise<Blob> {
  const zip = new JSZip();
  const folderName = `TIMETABLES_${date.replace(/[\/\.\-]/g, '_')}`;
  const folder = zip.folder(folderName) || zip;

  files.forEach(f => {
    folder.file(f.name, f.blob);
  });

  return await zip.generateAsync({ type: 'blob' });
}
