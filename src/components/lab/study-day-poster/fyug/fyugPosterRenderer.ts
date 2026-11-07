import { POSTER_H, POSTER_SCALE, POSTER_W, drawBackgroundAndCorners, roundRectPath } from '../posterRenderer';
import { drawIconContain, drawStudyHeader, rasteriseIcon, setLetterSpacing, type IconImage } from '../biology/biologyPosterRenderer';
import { FYUG_HERO, FYUG_ICONS } from './fyugIcons';
import { SUBJECTS, type Slot } from './fyugData';

export interface FyugAssets {
  icons: Record<string, IconImage>;
}

const NAVY = '#061a40';
const HEADER_SHIFT = 120;
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
  roundRectPath(ctx, x + 10, y + 10, 214, h - 20, 18);
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

  drawIconContain(ctx, icons[sub.icon], x + 106, y + 16, 110, h - 32);

  // Text block
  const tx = x + 240;
  const rightW = rightColumnWidth(ctx, slot);
  const maxW = x + w - 20 - rightW - 14 - tx;

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

  // Right column: time pill (with a small clock) above the navy room tag, centred as a stack.
  const pillH = 38;
  const roomH = 44;
  const stackGap = 10;
  const stackH = (slot.time ? pillH : 0) + (slot.time && slot.room ? stackGap : 0) + (slot.room ? roomH : 0);
  let sy = y + (h - stackH) / 2;
  const colRight = x + w - 20;

  if (slot.time) {
    ctx.font = `800 20px ${FONT}`;
    const tw = ctx.measureText(slot.time).width;
    const pw = tw + 52;
    const px = colRight - pw;
    roundRectPath(ctx, px, sy, pw, pillH, pillH / 2);
    ctx.fillStyle = sub.tint;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = sub.accent;
    ctx.stroke();
    drawClock(ctx, px + 20, sy + pillH / 2, sub.accent);
    ctx.fillStyle = sub.accent;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(slot.time, px + 36, sy + pillH / 2 + 1);
    ctx.textBaseline = 'alphabetic';
    sy += pillH + stackGap;
  }

  if (slot.room) {
    ctx.font = `800 26px ${FONT}`;
    const pw = ctx.measureText(slot.room).width + 40;
    const px = colRight - pw;
    roundRectPath(ctx, px, sy, pw, roomH, roomH / 2);
    ctx.fillStyle = NAVY;
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(slot.room, px + pw / 2, sy + roomH / 2 + 1);
    ctx.textBaseline = 'alphabetic';
  }
}

function drawClock(ctx: CanvasRenderingContext2D, cx: number, cy: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy, 8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy - 4.5);
  ctx.lineTo(cx, cy);
  ctx.lineTo(cx + 3.5, cy + 2);
  ctx.stroke();
  ctx.lineCap = 'butt';
}

// Width of the right-hand column (widest of the time pill and room tag) so the subject name can avoid it.
function rightColumnWidth(ctx: CanvasRenderingContext2D, slot: Slot): number {
  let wMax = 0;
  if (slot.time) {
    ctx.font = `800 20px ${FONT}`;
    wMax = Math.max(wMax, ctx.measureText(slot.time).width + 52);
  }
  if (slot.room) {
    ctx.font = `800 26px ${FONT}`;
    wMax = Math.max(wMax, ctx.measureText(slot.room).width + 40);
  }
  return wMax;
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

  // No logo and no title on this one: the header sits at the top and the cards use the freed space.
  drawStudyHeader(ctx, {
    date,
    logo: null,
    hero: assets.icons.hero,
    subtitle: daySpan(slots),
    shiftY: -HEADER_SHIFT
  });

  const top = 408 - HEADER_SHIFT;
  const bottom = 1100;
  const gap = 12;
  const h = (bottom - top - gap * (slots.length - 1)) / slots.length;
  slots.forEach((slot, i) => drawSlot(ctx, slot, i + 1, assets.icons, top + i * (h + gap), h));

  ctx.restore();
}

// "5 HOURS  •  9:30 – 3:30" from the first start to the last end time.
function daySpan(slots: Slot[]): string {
  const start = slots[0]?.time?.split(' – ')[0];
  const end = slots[slots.length - 1]?.time?.split(' – ')[1];
  return start && end ? `${slots.length} HOURS  •  ${start} – ${end}` : `${slots.length} HOURS`;
}
