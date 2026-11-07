import { POSTER_H, POSTER_SCALE, POSTER_W, drawBackgroundAndCorners, roundRectPath } from '../posterRenderer';
import { drawIconContain, drawStudyHeader, rasteriseIcon, setLetterSpacing, type IconImage } from '../biology/biologyPosterRenderer';
import { FYUG_HERO, FYUG_ICONS } from './fyugIcons';
import { SUBJECTS, type Slot } from './fyugData';
import { EVENT_ICONS } from './calendarIcons';
import type { CalendarEvent, Upcoming } from './calendar';

export interface FyugAssets {
  icons: Record<string, IconImage>;
}

const NAVY = '#061a40';
const HEADER_SHIFT = 120;
const FONT = "'Montserrat', sans-serif";


export async function loadFyugIcons(): Promise<Record<string, IconImage>> {
  const entries: [string, { viewBox: string; svg: string }][] = [
    ...Object.entries(FYUG_ICONS),
    ...Object.entries(EVENT_ICONS).map(([k, v]) => [`event_${k}`, v] as [string, { viewBox: string; svg: string }]),
    ['hero', FYUG_HERO]
  ];
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

const FOOTER_BOTTOM = 1134;
// Taller when a day has two events so both rows fit.
const footerHeight = (up: Upcoming) => (up.events.length > 1 ? 158 : 128);

function fitText(ctx: CanvasRenderingContext2D, text: string, weight: number, start: number, min: number, maxW: number): number {
  let size = start;
  ctx.font = `${weight} ${size}px ${FONT}`;
  while (ctx.measureText(text).width > maxW && size > min) {
    size -= 1;
    ctx.font = `${weight} ${size}px ${FONT}`;
  }
  return size;
}

// Footer: the next calendar event(s) — date tile, "UPCOMING" label, event + course, and a days-to-go badge.
function drawUpcomingFooter(ctx: CanvasRenderingContext2D, up: Upcoming, icons: Record<string, IconImage>) {
  const x = 30;
  const h = footerHeight(up);
  const y = FOOTER_BOTTOM - h;
  const w = 740;

  // Navy gradient card
  const g = ctx.createLinearGradient(x, y, x + w, y);
  g.addColorStop(0, '#004080');
  g.addColorStop(1, '#06306a');
  roundRectPath(ctx, x, y, w, h, 28);
  ctx.fillStyle = g;
  ctx.fill();

  // Date tile
  const tx = x + 16;
  const tw = 92;
  roundRectPath(ctx, tx, y + 14, tw, h - 28, 20);
  ctx.fillStyle = '#faf0ca';
  ctx.fill();
  const month = up.date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const weekday = up.date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#0072dc';
  ctx.font = `800 17px ${FONT}`;
  setLetterSpacing(ctx, 2);
  ctx.fillText(month, tx + tw / 2 + 1, y + 38);
  setLetterSpacing(ctx, 0);
  ctx.fillStyle = NAVY;
  ctx.font = `900 48px ${FONT}`;
  ctx.fillText(String(up.date.getDate()).padStart(2, '0'), tx + tw / 2, y + 82);
  ctx.fillStyle = '#4b5d7a';
  ctx.font = `700 13px ${FONT}`;
  setLetterSpacing(ctx, 2);
  ctx.fillText(weekday, tx + tw / 2 + 1, y + 102);
  setLetterSpacing(ctx, 0);

  // Days-to-go badge on the right
  const bw = 128;
  const bx = x + w - 16 - bw;
  roundRectPath(ctx, bx, y + 14, bw, h - 28, 20);
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  if (up.daysAway === 0 || up.daysAway === 1) {
    // Fit the word inside the badge with side padding so it never touches the edges.
    const word = up.daysAway === 0 ? 'TODAY' : 'TOMORROW';
    ctx.fillStyle = '#8cd96c';
    const size = fitText(ctx, word, 900, 30, 14, bw - 36);
    ctx.fillText(word, bx + bw / 2, y + h / 2 + size * 0.34);
  } else {
    ctx.fillStyle = '#8cd96c';
    ctx.font = `900 50px ${FONT}`;
    ctx.fillText(String(up.daysAway), bx + bw / 2, y + h / 2 + 8);
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 15px ${FONT}`;
    setLetterSpacing(ctx, 2.5);
    ctx.fillText('DAYS LEFT', bx + bw / 2 + 1, y + h / 2 + 34);
    setLetterSpacing(ctx, 0);
  }

  // Middle: label + event rows
  const mx = tx + tw + 20;
  const mw = bx - 16 - mx;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#8cd96c';
  ctx.font = `800 15px ${FONT}`;
  setLetterSpacing(ctx, 3);
  ctx.fillText('UPCOMING EVENT', mx, y + 34);
  setLetterSpacing(ctx, 0);

  const many = up.events.length > 1;
  const rowsTop = y + 46;
  const rowsH = h - 46 - 12;
  const rowH = rowsH / up.events.length;
  up.events.forEach((e, i) => drawEventRow(ctx, e, icons, mx, rowsTop + i * rowH, mw, rowH, many));
}

function drawEventRow(
  ctx: CanvasRenderingContext2D,
  e: CalendarEvent,
  icons: Record<string, IconImage>,
  x: number,
  y: number,
  w: number,
  h: number,
  compact: boolean
) {
  const sub = e.subject ? SUBJECTS[e.subject] : null;
  const iconBox = compact ? 38 : 56;

  roundRectPath(ctx, x, y + (h - iconBox) / 2, iconBox, iconBox, iconBox * 0.28);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  drawIconContain(ctx, icons[`event_${e.kind}`], x + 4, y + (h - iconBox) / 2 + 4, iconBox - 8, iconBox - 8);

  const tx = x + iconBox + 14;
  const tw = w - iconBox - 14;
  const course = sub ? sub.name : e.note ?? '';
  const extra = sub && e.note ? ` • ${e.note}` : '';

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  const titleSize = fitText(ctx, e.event, 800, compact ? 21 : 29, 16, tw);
  const subSize = compact ? 15 : 18;
  const blockH = titleSize * 1.15 + 4 + subSize * 1.15;
  const top = y + (h - blockH) / 2;

  ctx.fillStyle = '#ffffff';
  ctx.font = `800 ${titleSize}px ${FONT}`;
  ctx.fillText(e.event, tx, top + titleSize * 0.95);

  const line = course + extra;
  if (line) {
    fitText(ctx, line, 700, subSize, 12, tw);
    ctx.fillStyle = '#b9d4f3';
    ctx.fillText(line, tx, top + titleSize * 1.15 + 4 + subSize * 0.95);
  }
}

export interface FyugRenderOptions {
  date: Date;
  upcoming: Upcoming | null;
  slots: Slot[];
  assets: FyugAssets;
}

export function renderFyugPoster(canvas: HTMLCanvasElement, { date, upcoming, slots, assets }: FyugRenderOptions) {
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
  const bottom = upcoming ? FOOTER_BOTTOM - footerHeight(upcoming) - 12 : 1100;
  const gap = 12;
  const h = (bottom - top - gap * (slots.length - 1)) / slots.length;
  slots.forEach((slot, i) => drawSlot(ctx, slot, i + 1, assets.icons, top + i * (h + gap), h));

  if (upcoming) drawUpcomingFooter(ctx, upcoming, assets.icons);

  ctx.restore();
}

// "5 HOURS  •  9:30 – 3:30" from the first start to the last end time.
function daySpan(slots: Slot[]): string {
  const start = slots[0]?.time?.split(' – ')[0];
  const end = slots[slots.length - 1]?.time?.split(' – ')[1];
  return start && end ? `${slots.length} HOURS  •  ${start} – ${end}` : `${slots.length} HOURS`;
}
