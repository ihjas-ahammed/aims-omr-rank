import { POSTER_H, POSTER_SCALE, POSTER_W, drawBackgroundAndCorners, roundRectPath } from '../posterRenderer';
import { drawIconContain, drawStudyHeader, rasteriseIcon, setLetterSpacing, type IconImage } from '../biology/biologyPosterRenderer';
import { FYUG_HERO, FYUG_ICONS } from './fyugIcons';
import { SUBJECTS, getDaySubtitle, type Slot } from './fyugData';
import { EVENT_ICONS } from './calendarIcons';
import type { CalendarEvent } from './calendar';

export interface FyugAssets {
  icons: Record<string, IconImage>;
}

const NAVY = '#061a40';
const GREEN = '#168a1f';
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
  if (slot.badge) {
    ctx.font = `900 26px ${FONT}`;
    ctx.fillText(slot.badge, x + 20 + bw / 2, y + h / 2 + 9);
  } else {
    ctx.font = `700 14px ${FONT}`;
    setLetterSpacing(ctx, 2);
    ctx.fillText('HOUR', x + 20 + bw / 2 + 1, y + h / 2 - 8);
    setLetterSpacing(ctx, 0);
    ctx.font = `900 46px ${FONT}`;
    ctx.fillText(String(hour), x + 20 + bw / 2, y + h / 2 + 34);
  }

  drawIconContain(ctx, icons[sub.icon], x + 106, y + 16, 110, h - 32);

  // Text block
  const tx = x + 240;
  const rightW = rightColumnWidth(ctx, slot);
  const maxW = x + w - 20 - rightW - 14 - tx;

  let size = 32;
  let lines: string[] = [];
  for (; size >= 20; size--) {
    ctx.font = `800 ${size}px ${FONT}`;
    lines = wrap(ctx, slot.title ?? sub.name, maxW);
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
  ctx.fillStyle = sub.accent;
  if (slot.note) {
    ctx.font = `700 22px ${FONT}`;
    ctx.fillText(slot.note, tx, by + 19);
  } else {
    drawPerson(ctx, tx, by, sub.accent);
    ctx.font = `700 20px ${FONT}`;
    setLetterSpacing(ctx, 0.8);
    ctx.fillText(slot.teacher, tx + 24, by + 19);
    setLetterSpacing(ctx, 0);
  }

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
const FOOTER_H = 172; // fixed, so the cards above never change size when a day has one or two events

function fitText(ctx: CanvasRenderingContext2D, text: string, weight: number, start: number, min: number, maxW: number): number {
  let size = start;
  ctx.font = `${weight} ${size}px ${FONT}`;
  while (ctx.measureText(text).width > maxW && size > min) {
    size -= 1;
    ctx.font = `${weight} ${size}px ${FONT}`;
  }
  return size;
}

// Footer (light theme): mint→sky card with a fine grid, date tile on the left, then "SPECIAL EVENT(S)" with the
// day's calendar events listed in large type. Fixed height, so one or two events never change the bar.
function drawEventsFooter(ctx: CanvasRenderingContext2D, events: CalendarEvent[], date: Date, icons: Record<string, IconImage>) {
  const x = 30;
  const w = 740;
  const h = FOOTER_H;
  const y = FOOTER_BOTTOM - h;

  // Frosted glass: blur what is already drawn behind the bar (waves, grid, card edges), then lay a blue tint,
  // a soft highlight, a faint grid and a light edge over it, with a drop shadow so the bar floats.
  const scale = POSTER_SCALE;
  const pad = 22;
  const back = document.createElement('canvas');
  back.width = Math.round((w + pad * 2) * scale);
  back.height = Math.round((h + pad * 2) * scale);
  const bctx = back.getContext('2d');
  if (bctx) {
    bctx.filter = 'blur(16px)'; // where ctx.filter is unsupported this is a no-op and the glass is just tinted
    bctx.drawImage(ctx.canvas, (x - pad) * scale, (y - pad) * scale, back.width, back.height, 0, 0, back.width, back.height);
  }

  ctx.save();
  ctx.shadowColor = 'rgba(6, 26, 64, 0.35)';
  ctx.shadowBlur = 22;
  ctx.shadowOffsetY = 8;
  roundRectPath(ctx, x, y, w, h, 28);
  ctx.fillStyle = 'rgba(6, 48, 106, 0.5)';
  ctx.fill();
  ctx.restore();

  ctx.save();
  roundRectPath(ctx, x, y, w, h, 28);
  ctx.clip();
  // Blurred backdrop (replace the unblurred pixels under the bar)
  ctx.drawImage(back, 0, 0, back.width, back.height, x - pad, y - pad, w + pad * 2, h + pad * 2);
  // Blue glass tint
  const tint = ctx.createLinearGradient(x, y, x + w, y + h);
  tint.addColorStop(0, 'rgba(0, 70, 150, 0.86)');
  tint.addColorStop(1, 'rgba(6, 44, 100, 0.78)');
  ctx.fillStyle = tint;
  ctx.fillRect(x, y, w, h);
  // Soft specular highlight along the top-left
  const spec = ctx.createLinearGradient(x, y, x + w * 0.7, y + h);
  spec.addColorStop(0, 'rgba(255, 255, 255, 0.28)');
  spec.addColorStop(0.45, 'rgba(255, 255, 255, 0.06)');
  spec.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = spec;
  ctx.fillRect(x, y, w, h);
  // Faint grid for texture
  const step = 16;
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
  for (let gx = x + (step - (x % step)) % step; gx < x + w; gx += step) {
    ctx.beginPath();
    ctx.moveTo(gx, y);
    ctx.lineTo(gx, y + h);
    ctx.stroke();
  }
  for (let gy = y; gy < y + h; gy += step) {
    ctx.beginPath();
    ctx.moveTo(x, gy);
    ctx.lineTo(x + w, gy);
    ctx.stroke();
  }
  // Green glow at the top-right corner
  const glow = ctx.createRadialGradient(x + w, y, 0, x + w, y, 220);
  glow.addColorStop(0, 'rgba(120, 210, 100, 0.30)');
  glow.addColorStop(1, 'rgba(120, 210, 100, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(x, y, w, h);
  ctx.restore();

  // Glass edge: bright rim on top/left fading to a faint one bottom/right
  roundRectPath(ctx, x, y, w, h, 28);
  const rim = ctx.createLinearGradient(x, y, x + w, y + h);
  rim.addColorStop(0, 'rgba(255, 255, 255, 0.75)');
  rim.addColorStop(0.5, 'rgba(255, 255, 255, 0.25)');
  rim.addColorStop(1, 'rgba(255, 255, 255, 0.5)');
  ctx.lineWidth = 2;
  ctx.strokeStyle = rim;
  ctx.stroke();

  // Date tile — fixed size, centred vertically in the bar; its text is centred inside it.
  const tw = 96;
  const th = 128;
  const tx = x + 18;
  const ty = y + (h - th) / 2;
  roundRectPath(ctx, tx, ty, tw, th, 22);
  ctx.fillStyle = '#faf0ca';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = NAVY;
  ctx.stroke();

  const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const dayNum = String(date.getDate()).padStart(2, '0');
  const blockH = 14 + 10 + 38 + 12 + 11; // month cap + gap + day cap + gap + weekday cap
  const top = ty + (th - blockH) / 2;
  const cxTile = tx + tw / 2;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#0072dc';
  ctx.font = `800 18px ${FONT}`;
  setLetterSpacing(ctx, 2);
  ctx.fillText(month, cxTile + 1, top + 14);
  setLetterSpacing(ctx, 0);
  ctx.fillStyle = NAVY;
  ctx.font = `900 52px ${FONT}`;
  ctx.fillText(dayNum, cxTile, top + 14 + 10 + 38);
  ctx.fillStyle = '#4b5d7a';
  ctx.font = `700 14px ${FONT}`;
  setLetterSpacing(ctx, 2);
  ctx.fillText(weekday, cxTile + 1, top + 14 + 10 + 38 + 12 + 11);
  setLetterSpacing(ctx, 0);

  // "SPECIAL EVENT(S)" pill + rows, left-aligned
  const mx = tx + tw + 24;
  const mw = x + w - 24 - mx;
  const many = events.length > 1;
  const label = many ? 'SPECIAL EVENTS' : 'SPECIAL EVENT';
  ctx.font = `800 15px ${FONT}`;
  setLetterSpacing(ctx, 3);
  const lw = ctx.measureText(label).width + 30;
  setLetterSpacing(ctx, 0);
  roundRectPath(ctx, mx, y + 14, lw, 28, 14);
  ctx.fillStyle = GREEN;
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.font = `800 15px ${FONT}`;
  setLetterSpacing(ctx, 3);
  ctx.fillText(label, mx + 15, y + 34);
  setLetterSpacing(ctx, 0);

  const rowsTop = y + 50;
  const rowsH = h - 50 - 12;
  const rowH = rowsH / events.length;
  events.forEach((e, i) => drawEventRow(ctx, e, icons, mx, rowsTop + i * rowH, mw, rowH, many));
}

function rowLayout(ctx: CanvasRenderingContext2D, e: CalendarEvent, compact: boolean, maxTextW: number) {
  const iconBox = compact ? 46 : 66;
  const gap = 16;
  const sub = e.subject ? SUBJECTS[e.subject] : null;
  const course = sub ? sub.name : e.note ?? '';
  const line = course + (sub && e.note ? ` • ${e.note}` : '');
  const room = maxTextW - iconBox - gap;
  const titleSize = fitText(ctx, e.event, 800, compact ? 25 : 40, 16, room);
  const titleW = ctx.measureText(e.event).width;
  const subSize = compact ? 17 : 23;
  let lineW = 0;
  let lineSize = subSize;
  if (line) {
    lineSize = fitText(ctx, line, 700, subSize, 12, room);
    lineW = ctx.measureText(line).width;
  }
  return { iconBox, gap, line, titleSize, titleW, subSize: lineSize, lineW };
}

function drawEventRow(
  ctx: CanvasRenderingContext2D,
  e: CalendarEvent,
  icons: Record<string, IconImage>,
  x: number,
  y: number,
  maxTextW: number,
  h: number,
  compact: boolean
) {
  const { iconBox, gap, line, titleSize, subSize } = rowLayout(ctx, e, compact, maxTextW);
  const sub = e.subject ? SUBJECTS[e.subject] : null;
  const accent = sub ? sub.accent : '#0072dc';
  const iy = y + (h - iconBox) / 2;

  // Icon tile tinted with the course colour
  roundRectPath(ctx, x, iy, iconBox, iconBox, iconBox * 0.26);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = sub ? sub.accent : '#8cd96c';
  ctx.stroke();
  drawIconContain(ctx, icons[`event_${e.kind}`], x + 6, iy + 6, iconBox - 12, iconBox - 12);

  const tx = x + iconBox + gap;
  const blockH = titleSize * 1.15 + (line ? 4 + subSize * 1.15 : 0);
  const top = y + (h - blockH) / 2;

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 ${titleSize}px ${FONT}`;
  ctx.fillText(e.event, tx, top + titleSize * 0.95);

  if (line) {
    ctx.font = `700 ${subSize}px ${FONT}`;
    ctx.fillStyle = '#e1eefc';
    ctx.fillText(line, tx, top + titleSize * 1.15 + 4 + subSize * 0.95);
  }
}

export interface FyugRenderOptions {
  date: Date;
  events: CalendarEvent[]; // special calendar events on the poster's date (empty = no footer)
  slots: Slot[];
  assets: FyugAssets;
  height?: number; // logical px; defaults to the standard poster height
}

export function renderFyugPoster(canvas: HTMLCanvasElement, { date, events, slots, assets, height = POSTER_H }: FyugRenderOptions) {
  const H = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.save();
  ctx.setTransform(POSTER_SCALE, 0, 0, POSTER_SCALE, 0, 0);
  ctx.clearRect(0, 0, POSTER_W, H);

  drawBackgroundAndCorners(ctx, POSTER_W, H, 'corners_aims');

  // No logo and no title on this one: the header sits at the top and the cards use the freed space.
  drawStudyHeader(ctx, {
    date,
    logo: null,
    hero: assets.icons.hero,
    subtitle: getDaySubtitle(date) ?? daySpan(slots),
    shiftY: -HEADER_SHIFT
  });

  const top = 408 - HEADER_SHIFT;
  const bottom = events.length ? FOOTER_BOTTOM - FOOTER_H - 12 : H - 60;
  const gap = 12;
const h = (bottom - top - gap * (slots.length - 1)) / slots.length;
  slots.forEach((slot, i) => drawSlot(ctx, slot, i + 1, assets.icons, top + i * (h + gap), h));

  if (events.length) drawEventsFooter(ctx, events, date, assets.icons);

  ctx.restore();
}

// "5 HOURS  •  9:30 – 3:30" from the first start to the last end time.
function daySpan(slots: Slot[]): string {
  const start = slots[0]?.time?.split(' – ')[0];
  const end = slots[slots.length - 1]?.time?.split(' – ')[1];
  return start && end ? `${slots.length} HOURS  •  ${start} – ${end}` : `${slots.length} HOURS`;
}
