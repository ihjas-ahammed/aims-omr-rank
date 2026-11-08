import {
  POSTER_H,
  POSTER_SCALE,
  POSTER_W,
  drawBackgroundAndCorners,
  drawRichTextLine,
  layoutRichTextLines,
  roundRectPath
} from '../posterRenderer';
import {
  drawIconContain,
  drawStudyHeader,
  rasteriseIcon,
  setLetterSpacing,
  type IconImage
} from '../biology/biologyPosterRenderer';
import { CS_HERO, CS_ICONS } from './csIcons';
import type { CsChapter, CsDay } from './csTimetable';

export interface CsAssets {
  logo: HTMLImageElement | null;
  icons: Record<string, IconImage>;
}

const NAVY = '#061a40';
const BLUE = '#0072dc';
const GREEN = '#168a1f';
const FONT = "'Montserrat', sans-serif";

export async function loadCsIcons(): Promise<Record<string, IconImage>> {
  const entries: [string, { viewBox: string; svg: string }][] = [...Object.entries(CS_ICONS), ['cs_hero', CS_HERO]];
  const loaded = await Promise.all(entries.map(([, i]) => rasteriseIcon(i.viewBox, i.svg)));
  return Object.fromEntries(entries.map(([k], i) => [k, loaded[i]]));
}

const BANNER_H = 112;
const ROW_PAD = 11;
const TEXT_X = 100;
const TEXT_MAX_W = 650;

function layoutRows(ctx: CanvasRenderingContext2D, topics: string[], fontSize: number) {
  const lh = fontSize * 1.3;
  return topics.map((t) => {
    const lines = layoutRichTextLines(ctx, t, TEXT_MAX_W, fontSize);
    return { lines, need: Math.max(34, lines.length * lh) + ROW_PAD * 2 };
  });
}

function pickFontSize(ctx: CanvasRenderingContext2D, topics: string[], cardH: number): number {
  for (let size = 30; size > 17; size--) {
    const need = 11 + BANNER_H + 8 + layoutRows(ctx, topics, size).reduce((a, r) => a + r.need, 0) + 10;
    if (need <= cardH) return size;
  }
  return 17;
}

function drawCard(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  roundRectPath(ctx, x, y, w, h, 28);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.fill();
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = '#b5cadb';
  ctx.stroke();
}

export function drawChapter(
  ctx: CanvasRenderingContext2D,
  day: CsChapter,
  icons: Record<string, IconImage>,
  y: number,
  h: number
) {
  const x = 30;
  const w = 740;
  const isRevision = /REV/.test(day.tag);
  const accent = isRevision ? BLUE : GREEN;
  const tint = isRevision ? '#e1effc' : '#e3f9e1';

  drawCard(ctx, x, y, w, h);

  // Banner: icon | tag + title
  const by = y + 11;
  roundRectPath(ctx, x + 11, by, w - 22, BANNER_H, 22);
  ctx.fillStyle = tint;
  ctx.fill();

  drawIconContain(ctx, icons[day.icon], x + 24, by + 8, 132, BANNER_H - 16);

  roundRectPath(ctx, x + 172, by + 16, 4.5, BANNER_H - 32, 2.25);
  ctx.fillStyle = accent;
  ctx.fill();

  const tx = x + 194;
  const maxTitleW = w - 22 - 194 - 12;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = accent;
  ctx.font = `700 19px ${FONT}`;
  setLetterSpacing(ctx, 3);
  ctx.fillText(day.tag, tx, by + 30);
  setLetterSpacing(ctx, 0);

  // Title: one line if it fits at >= 30px, otherwise two balanced lines shrunk until they fit.
  ctx.fillStyle = NAVY;
  let size = 36;
  ctx.font = `800 ${size}px ${FONT}`;
  while (ctx.measureText(day.title).width > maxTitleW && size > 30) {
    size -= 1;
    ctx.font = `800 ${size}px ${FONT}`;
  }
  if (ctx.measureText(day.title).width <= maxTitleW) {
    ctx.fillText(day.title, tx, by + 74);
  } else {
    const words = day.title.split(' ');
    let lines: string[] = [day.title];
    for (size = 32; size >= 20; size--) {
      ctx.font = `800 ${size}px ${FONT}`;
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
      lines = [words.slice(0, best).join(' '), words.slice(best).join(' ')];
      if (bestMax <= maxTitleW) break;
    }
    ctx.font = `800 ${size}px ${FONT}`;
    ctx.fillText(lines[0], tx, by + 58);
    ctx.fillText(lines[1], tx, by + 58 + size * 1.22);
  }

  // Topics — rows share the remaining height evenly.
  const fontSize = pickFontSize(ctx, day.topics, h);
  const rows = layoutRows(ctx, day.topics, fontSize);
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

export function drawExam(
  ctx: CanvasRenderingContext2D,
  label: string,
  icons: Record<string, IconImage>,
  y: number,
  h: number,
  iconKey = 'cs_revision'
) {
  drawCard(ctx, 30, y, 740, h);
  drawIconContain(ctx, icons[iconKey], 280, y + 40, 240, 200);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = NAVY;
  ctx.font = `900 96px ${FONT}`;
  setLetterSpacing(ctx, 6);
  ctx.fillText('EXAM DAY', POSTER_W / 2, y + 380);
  setLetterSpacing(ctx, 0);

  ctx.fillStyle = BLUE;
  ctx.font = `800 32px ${FONT}`;
  // Break the exam line at the dash so it stays centred on two lines.
  const [head, tail] = label.split(' — ');
  ctx.fillText(head, POSTER_W / 2, y + 450);
  if (tail) ctx.fillText(tail, POSTER_W / 2, y + 492);

  ctx.fillStyle = GREEN;
  ctx.font = `700 30px ${FONT}`;
  ctx.fillText('Revise well. All the best!', POSTER_W / 2, y + 560);
}

export interface CsRenderOptions {
  date: Date;
  day: CsDay;
  assets: CsAssets;
}

export function renderCsPoster(canvas: HTMLCanvasElement, { date, day, assets }: CsRenderOptions) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.save();
  ctx.setTransform(POSTER_SCALE, 0, 0, POSTER_SCALE, 0, 0);
  ctx.clearRect(0, 0, POSTER_W, POSTER_H);

  drawBackgroundAndCorners(ctx, POSTER_W, POSTER_H, 'corners_cs');

  const subtitle = 'topics' in day ? `PLUS ONE COMPUTER SCIENCE  •  DAY ${String(day.dayNo).padStart(2, '0')}` : 'PLUS ONE  •  COMPUTER SCIENCE';
  drawStudyHeader(ctx, { date, logo: assets.logo, hero: assets.icons.cs_hero, subtitle });

  const top = 408;
  const bottom = 1100;
  if ('topics' in day) drawChapter(ctx, day, assets.icons, top, bottom - top);
  else drawExam(ctx, day.label, assets.icons, top, bottom - top);

  ctx.restore();
}
