import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

// Renders an on-screen A4 sheet to a multi-page PDF. Pages are cut at row boundaries (elements marked
// `.np-avoid`, `tr`, or `.np-force-break` for a forced new page) so no row is split in half.
export async function exportSheetToPdf(el: HTMLElement, filename: string, marginMm: number) {
  const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
  const scale = canvas.width / el.offsetWidth;
  const pageH = (el.offsetWidth * (297 - 2 * marginMm)) / (210 - 2 * marginMm);
  const rootTop = el.getBoundingClientRect().top;
  const tops = (sel: string) =>
    Array.from(el.querySelectorAll<HTMLElement>(sel)).map(n => n.getBoundingClientRect().top - rootTop);
  const breaks = [...new Set(tops('.np-avoid, tr'))].sort((a, b) => a - b);
  const forced = new Set(tops('.np-force-break').map(Math.round));
  const total = el.offsetHeight;

  const cuts: number[] = [0];
  let start = 0;
  while (total - start > pageH + 0.5) {
    const limit = start + pageH;
    const forcedCut = [...forced].find(f => f > start + 1 && f <= limit);
    const cut = forcedCut ?? breaks.filter(b => b > start + 1 && b <= limit + 0.5).pop() ?? limit;
    cuts.push(cut);
    start = cut;
  }
  cuts.push(total);

  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const widthMm = 210 - 2 * marginMm;
  for (let i = 0; i < cuts.length - 1; i++) {
    const h = cuts[i + 1] - cuts[i];
    const slice = document.createElement('canvas');
    slice.width = canvas.width;
    slice.height = Math.max(1, Math.round(h * scale));
    const ctx = slice.getContext('2d')!;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, slice.width, slice.height);
    ctx.drawImage(canvas, 0, Math.round(cuts[i] * scale), canvas.width, slice.height, 0, 0, slice.width, slice.height);
    if (i > 0) pdf.addPage();
    pdf.addImage(slice.toDataURL('image/jpeg', 0.95), 'JPEG', marginMm, marginMm, widthMm, (h / el.offsetWidth) * widthMm);
  }
  pdf.save(filename);
}
