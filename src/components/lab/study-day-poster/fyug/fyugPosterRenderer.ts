import { POSTER_H, POSTER_SCALE, POSTER_W, drawBackgroundAndCorners, roundRectPath } from '../posterRenderer';
import { drawIconContain, drawStudyHeader, rasteriseIcon, setLetterSpacing, type IconImage } from '../biology/biologyPosterRenderer';
import { FYUG_HERO, FYUG_ICONS } from './fyugIcons';
import { SUBJECTS, type Slot } from './fyugData';

export interface FyugAssets {
  icons: Record<string, IconImage>;
}

const NAVY = '#061a40';
const FONT = "'Montserrat', sans-serif";

export async function loadFyugIcons(): Promise<Record<string, IconImage>> {
  const entries: [string, { viewBox: string; svg: string }][] = [...Object.entries(FYUG_ICONS), ['hero', FYUG_HERO]];
  const loaded = await Promise.all(entries.map(([, i]) => rasteriseIcon(i.viewBox, i.svg)));
  return Object.fromEntries(entries.map(([k], i) => [k, loaded[i]]));
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (cur && ctx.measureText(next).width > maxW) {
      lines.push(cur);
      cur = w;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}

function drawPerson(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x + 8, y + 5, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + 8, y + 19, 9, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
}

function drawSlot(ctx: CanvasRenderingContext2D, slot: Slot, hour: number, icons: Record<string, IconImage>, y: number, h: number) {
  const sub = SUBJECTS[slot.subject];
  const x = 30;
  const w = 740;

  roundRectPath(ctx, x, y, w, h, 24);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.fill();
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = '#b5cadb';
  ctx.stroke();

  // Tinted icon panel
  roundRectPath(ctx, x + 10, y + 10, 232, h - 20, 18);
  ctx.fillStyle = sub.tint;
  ctx.fill();

  // Hour badge
  const bw = 78;
  roundRectPath(ctx, x + 20, y + 20, bw, h - 40, 14);
  ctx.fillStyle = sub.accent;
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `700 14px ${FONT}`;
  setLetterSpacing(ctx, 2);
  ctx.fillText('HOUR', x + 20 + bw / 2 + 1, y + h / 2 - 8);
  setLetterSpacing(ctx, 0);
  ctx.font = `900 46px ${FONT}`;
  ctx.fillText(String(hour), x + 20 + bw / 2, y + h / 2 + 34);

  drawIconContain(ctx, icons[sub.icon], x + 108, y + 16, 124, h - 32);

  // Text block
  const tx = x + 262;
  const roomW = slotRoomWidth(ctx, slot);
  const maxW = x + w - 20 - roomW - tx;

  let size = 32;
  let lines: string[] = [];
  for (; size >= 20; size--) {
    ctx.font = `800 ${size}px ${FONT}`;
    lines = wrap(ctx, sub.name, maxW);
    if (lines.length <= 2) break;
  }
  const lh = size * 1.22;
  const teacherH = 26;
  const blockH = lines.length * lh + 10 + teacherH;
  let by = y + (h - blockH) / 2;

  ctx.textAlign = 'left';
  ctx.fillStyle = NAVY;
  ctx.font = `800 ${size}px ${FONT}`;
  for (const l of lines) {
    ctx.fillText(l, tx, by + size * 0.9);
    by += lh;
  }
  by += 10;
  drawPerson(ctx, tx, by, sub.accent);
  ctx.fillStyle = sub.accent;
  ctx.font = `700 20px ${FONT}`;
  setLetterSpacing(ctx, 0.8);
  ctx.fillText(slot.teacher, tx + 24, by + 19);
  setLetterSpacing(ctx, 0);

  // Room tag
  if (slot.room) {
    ctx.font = `800 26px ${FONT}`;
    const pw = ctx.measureText(slot.room).width + 40;
    const px = x + w - 20 - pw;
    const ph = 46;
    roundRectPath(ctx, px, y + (h - ph) / 2, pw, ph, ph / 2);
    ctx.fillStyle = NAVY;
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(slot.room, px + pw / 2, y + h / 2 + 1);
    ctx.textBaseline = 'alphabetic';
  }
}

// Room pill width (0 when the slot has no room), used to leave space for it beside the subject name.
function slotRoomWidth(ctx: CanvasRenderingContext2D, slot: Slot): number {
  if (!slot.room) return 0;
  ctx.font = `800 26px ${FONT}`;
  return ctx.measureText(slot.room).width + 40 + 18;
}

export interface FyugRenderOptions {
  date: Date;
  slots: Slot[];
  assets: FyugAssets;
}

export function renderFyugPoster(canvas: HTMLCanvasElement, { date, slots, assets }: FyugRenderOptions) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.save();
  ctx.setTransform(POSTER_SCALE, 0, 0, POSTER_SCALE, 0, 0);
  ctx.clearRect(0, 0, POSTER_W, POSTER_H);

  drawBackgroundAndCorners(ctx, POSTER_W, POSTER_H, 'corners_aims');

  // No institute logo on this one — a plain title where the logo would sit.
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = NAVY;
  ctx.font = `900 54px ${FONT}`;
  setLetterSpacing(ctx, 3);
  ctx.fillText('TIMETABLE', POSTER_W / 2 + 2, 98);
  setLetterSpacing(ctx, 0);

  drawStudyHeader(ctx, {
    date,
    logo: null,
    hero: assets.icons.hero,
    subtitle: `${slots.length} HOURS  •  HOUR 1 – HOUR ${slots.length}`
  });

  const top = 408;
  const bottom = 1100;
  const gap = 12;
  const h = (bottom - top - gap * (slots.length - 1)) / slots.length;
  slots.forEach((slot, i) => drawSlot(ctx, slot, i + 1, assets.icons, top + i * (h + gap), h));

  ctx.restore();
}
