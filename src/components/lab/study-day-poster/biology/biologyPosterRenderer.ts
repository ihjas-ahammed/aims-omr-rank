import {
  POSTER_H,
  POSTER_SCALE,
  POSTER_W,
  drawBackgroundAndCorners,
  drawRichTextLine,
  layoutRichTextLines,
  roundRectPath
} from '../posterRenderer';
import { BIO_ICONS, BIO_HERO } from './bioIcons';
import type { Batch, Chapter, StudyDay } from './timetable';

export interface IconImage {
  img: HTMLImageElement;
  w: number; // viewBox width
  h: number; // viewBox height
}

export interface BioAssets {
  logo: HTMLImageElement | null;
  icons: Record<string, IconImage>;
}

const NAVY = '#061a40';
const BLUE = '#0072dc';
const GREEN = '#168a1f';
const FONT = "'Montserrat', sans-serif";

const svgToImage = (svg: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });

// Rasterise at 4x the viewBox so the icon stays sharp on the 2x canvas, keeping the true aspect ratio.
export const rasteriseIcon = async (viewBox: string, inner: string): Promise<IconImage> => {
  const [, , w, h] = viewBox.split(' ').map(Number);
  const img = await svgToImage(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${w * 4}" height="${h * 4}">${inner}</svg>`
  );
  return { img, w, h };
};

export async function loadBioIcons(): Promise<Record<string, IconImage>> {
  const entries: [string, { viewBox: string; svg: string }][] = [
    ...Object.entries(BIO_ICONS),
    ['hero_dna', BIO_HERO]
  ];
  const loaded = await Promise.all(entries.map(([, i]) => rasteriseIcon(i.viewBox, i.svg)));
  return Object.fromEntries(entries.map(([k], i) => [k, loaded[i]]));
}

// Draw an icon scaled to fit (contain) inside the given box.
export function drawIconContain(ctx: CanvasRenderingContext2D, icon: IconImage | undefined, x: number, y: number, w: number, h: number) {
  if (!icon) return;
  const r = Math.min(w / icon.w, h / icon.h);
  const dw = icon.w * r;
  const dh = icon.h * r;
  ctx.drawImage(icon.img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

export const setLetterSpacing = (ctx: CanvasRenderingContext2D, px: number) => {
  (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${px}px`;
};

interface CardTheme {
  label: string;
  accent: string;
  tint: string;
}

const BOTANY_THEME: CardTheme = { label: 'BOTANY', accent: GREEN, tint: '#e3f9e1' };
const ZOOLOGY_THEME: CardTheme = { label: 'ZOOLOGY', accent: BLUE, tint: '#e1effc' };

const BANNER_H = 96;
const ROW_PAD = 10;
const TEXT_X = 100;
const TEXT_MAX_W = 640;

interface RowLayout {
  lines: ReturnType<typeof layoutRichTextLines>;
  need: number;
}

function layoutRows(ctx: CanvasRenderingContext2D, chapter: Chapter, fontSize: number): RowLayout[] {
  const lh = fontSize * 1.3;
  return chapter.topics.map((t) => {
    const lines = layoutRichTextLines(ctx, t, TEXT_MAX_W, fontSize);
    return { lines, need: Math.max(34, lines.length * lh) + ROW_PAD * 2 };
  });
}

function drawChapterCard(
  ctx: CanvasRenderingContext2D,
  chapter: Chapter,
  theme: CardTheme,
  icons: Record<string, IconImage>,
  y: number,
  h: number,
  fontSize: number
) {
  const x = 30;
  const w = 740;

  roundRectPath(ctx, x, y, w, h, 28);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.fill();
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = '#b5cadb';
  ctx.stroke();

  // Banner
  const by = y + 11;
  roundRectPath(ctx, x + 11, by, w - 22, BANNER_H, 22);
  ctx.fillStyle = theme.tint;
  ctx.fill();

  drawIconContain(ctx, icons[chapter.icon], x + 24, by + 6, 132, BANNER_H - 12);

  roundRectPath(ctx, x + 172, by + 14, 4.5, BANNER_H - 28, 2.25);
  ctx.fillStyle = theme.accent;
  ctx.fill();

  const tx = x + 194;
  const maxTitleW = w - 22 - 194 - 10;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = theme.accent;
  ctx.font = `700 19px ${FONT}`;
  setLetterSpacing(ctx, 3);
  ctx.fillText(theme.label, tx, by + 29);
  setLetterSpacing(ctx, 0);

  // Title: shrink to fit; if it still won't fit at 27px, wrap onto two lines.
  ctx.fillStyle = NAVY;
  let size = 36;
  ctx.font = `800 ${size}px ${FONT}`;
  while (ctx.measureText(chapter.title).width > maxTitleW && size > 27) {
    size -= 1;
    ctx.font = `800 ${size}px ${FONT}`;
  }
  if (ctx.measureText(chapter.title).width <= maxTitleW) {
    ctx.fillText(chapter.title, tx, by + 69);
  } else {
    const words = chapter.title.split(' ');
    let best = 1;
    let bestMax = Infinity;
    for (let i = 1; i < words.length; i++) {
      const m = Math.max(
        ctx.measureText(words.slice(0, i).join(' ')).width,
        ctx.measureText(words.slice(i).join(' ')).width
      );
      if (m < bestMax) {
        bestMax = m;
        best = i;
      }
    }
    ctx.fillText(words.slice(0, best).join(' '), tx, by + 58);
    ctx.fillText(words.slice(best).join(' '), tx, by + 86);
  }

  // Topic rows share whatever height is left, evenly.
  const rows = layoutRows(ctx, chapter, fontSize);
  const lh = fontSize * 1.3;
  const rowsTop = by + BANNER_H + 8;
  const rowsAvail = y + h - 10 - rowsTop;
  const extra = Math.max(0, (rowsAvail - rows.reduce((a, r) => a + r.need, 0)) / rows.length);

  let rowY = rowsTop;
  rows.forEach((row, i) => {
    const rh = row.need + extra;
    const cy = rowY + rh / 2;

    const box = 31;
    roundRectPath(ctx, 54, cy - box / 2, box, box, 7);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.lineWidth = 2.8;
    ctx.strokeStyle = NAVY;
    ctx.stroke();

    let baseline = cy - (row.lines.length * lh) / 2 + fontSize * 0.84;
    row.lines.forEach((line) => {
      drawRichTextLine(ctx, line, TEXT_X, baseline, fontSize, NAVY);
      baseline += lh;
    });

    if (i < rows.length - 1) {
      ctx.beginPath();
      ctx.moveTo(48, rowY + rh);
      ctx.lineTo(752, rowY + rh);
      ctx.strokeStyle = '#d9e6f2';
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }
    rowY += rh;
  });
}

// Largest font (<= 26px) at which both chapter cards fit in cardH.
function pickFontSize(ctx: CanvasRenderingContext2D, chapters: Chapter[], cardH: number): number {
  for (let size = 30; size > 17; size--) {
    const fits = chapters.every((c) => {
      const need = 11 + BANNER_H + 8 + layoutRows(ctx, c, size).reduce((a, r) => a + r.need, 0) + 10;
      return need <= cardH;
    });
    if (fits) return size;
  }
  return 17;
}

export interface StudyHeaderOptions {
  date: Date;
  logo: HTMLImageElement | null;
  hero: IconImage | undefined;
  subtitle: string;
  shiftY?: number; // move the whole header up/down (negative = up), e.g. when there is no logo
}

// Shared by the Plus One poster pages: logo, big day number + weekday/month, hero icon and the navy subtitle pill.
export function drawStudyHeader(ctx: CanvasRenderingContext2D, { date, logo, hero, subtitle, shiftY = 0 }: StudyHeaderOptions) {
  const W = POSTER_W;
  ctx.save();
  ctx.translate(0, shiftY);
  // Institute logo (aspect-correct, centred)
  if (logo) {
    const ratio = Math.min(500 / logo.width, 112 / logo.height);
    const dw = logo.width * ratio;
    const dh = logo.height * ratio;
    ctx.drawImage(logo, (W - dw) / 2, 82 - dh / 2, dw, dh);
  }

  // Date row
  const dayNum = String(date.getDate()).padStart(2, '0');
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  const month = date.toLocaleDateString('en-US', { month: 'long' });

  ctx.fillStyle = '#faf0ca';
  ctx.beginPath();
  ctx.arc(118, 244, 86, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = NAVY;
  ctx.font = `900 100px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(dayNum, 118, 250);

  roundRectPath(ctx, 260, 192, 4.2, 116, 2.1);
  ctx.fill();

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `800 50px ${FONT}`;
  ctx.fillText(weekday, 288, 244);
  ctx.fillStyle = BLUE;
  ctx.font = `800 44px ${FONT}`;
  ctx.fillText(month, 298, 294);

  drawIconContain(ctx, hero, 612, 176, 156, 148);

  // Subtitle pill
  roundRectPath(ctx, 30, 340, 740, 46, 23);
  ctx.fillStyle = '#004080';
  ctx.fill();
  roundRectPath(ctx, 50, 351, 7, 24, 3.5);
  ctx.fillStyle = '#25a22b';
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = `700 22px ${FONT}`;
  ctx.textBaseline = 'middle';
  setLetterSpacing(ctx, 1.5);
  ctx.fillText(subtitle, 74, 364);
  setLetterSpacing(ctx, 0);
  ctx.restore();
}

export interface BioRenderOptions {
  batch: Batch;
  date: Date;
  day: StudyDay;
  assets: BioAssets;
}

export function renderBiologyPoster(canvas: HTMLCanvasElement, { batch, date, day, assets }: BioRenderOptions) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = POSTER_W;
  const H = POSTER_H;
  ctx.save();
  ctx.setTransform(POSTER_SCALE, 0, 0, POSTER_SCALE, 0, 0);
  ctx.clearRect(0, 0, W, H);

  drawBackgroundAndCorners(ctx, W, H, 'corners_biology');

  drawStudyHeader(ctx, { date, logo: assets.logo, hero: assets.icons.hero_dna, subtitle: `PLUS ONE BIOLOGY  •  BATCH ${batch}` });

  const top = 408;
  const bottom = 1100;

  if (!('botany' in day)) {
    roundRectPath(ctx, 30, top, 740, bottom - top, 28);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fill();
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = '#b5cadb';
    ctx.stroke();

    drawIconContain(ctx, assets.icons.bio_botany_revision, 280, top + 40, 240, 200);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = NAVY;
    ctx.font = `900 96px ${FONT}`;
    setLetterSpacing(ctx, 6);
    ctx.fillText('EXAM DAY', W / 2, top + 380);
    setLetterSpacing(ctx, 0);
    ctx.fillStyle = BLUE;
    ctx.font = `800 36px ${FONT}`;
    ctx.fillText('Plus One Biology — Botany + Zoology', W / 2, top + 450);
    ctx.fillStyle = GREEN;
    ctx.font = `700 30px ${FONT}`;
    ctx.fillText('Revise well. All the best!', W / 2, top + 510);
    ctx.restore();
    return;
  }

  const gap = 18;
  const cardH = (bottom - top - gap) / 2;
  const fontSize = pickFontSize(ctx, [day.botany, day.zoology], cardH);
  drawChapterCard(ctx, day.botany, BOTANY_THEME, assets.icons, top, cardH, fontSize);
  drawChapterCard(ctx, day.zoology, ZOOLOGY_THEME, assets.icons, top + cardH + gap, cardH, fontSize);

  ctx.restore();
}
