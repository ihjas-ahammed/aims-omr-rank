import { POSTER_H, POSTER_SCALE, POSTER_W, drawBackgroundAndCorners, roundRectPath } from '../posterRenderer';
import { drawIconContain, drawStudyHeader, rasteriseIcon, setLetterSpacing, type IconImage } from '../biology/biologyPosterRenderer';
import { FYUG_HERO, FYUG_ICONS } from './fyugIcons';
import { SUBJECTS, getDaySubtitle, type Slot, type SubjectKey } from './fyugData';
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

// Text cut with an ellipsis so it never runs past maxW.
function clip(ctx: CanvasRenderingContext2D, text: string, maxW: number): string {
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxW) t = t.slice(0, -1);
  return `${t.trimEnd()}…`;
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

const PROGRESS_ZONE = 20; // strip kept free along the bottom of a card for the syllabus progress bar
const MIN_PAD = 12; // least clear space above and below a card's text block
const FULL_CARD_H = 118; // cards shorter than this (more than five hours in a day) are drawn scaled down

function drawSlot(
  ctx: CanvasRenderingContext2D,
  slot: Slot,
  hour: number,
  icons: Record<string, IconImage>,
  w: number,
  h: number,
  progress?: number // fraction of the subject's syllabus ticked off, 0 to 1; undefined = no bar
) {
  const sub = SUBJECTS[slot.subject];
  // Drawn at the origin; renderFyugPoster translates (and, for short cards, scales) the context into place.
  const x = 0;
  const y = 0;
  // Height the text block and the time/room stack centre in; the progress bar takes the strip below it.
  const ch = progress === undefined ? h : h - PROGRESS_ZONE;

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

  const hasSubline = !!(slot.note || slot.teacher);
  const teacherH = !hasSubline ? 0 : progress === undefined ? 26 : 24;
  const titleGap = !hasSubline ? 0 : progress === undefined ? 10 : 6;
  let size = progress === undefined ? 32 : 27;
  let lines: string[] = [];
  for (; size >= 16; size--) {
    ctx.font = `800 ${size}px ${FONT}`;
    lines = wrap(ctx, slot.title || sub.name, maxW);
    // Shrink until the name is at most two lines and the block keeps MIN_PAD clear above and below it.
    if (lines.length <= 2 && lines.length * size * 1.22 + titleGap + teacherH <= ch - MIN_PAD * 2) break;
  }
  const lh = size * 1.22;
  const blockH = lines.length * lh + titleGap + teacherH;
  let by = y + (ch - blockH) / 2;

  ctx.textAlign = 'left';
  ctx.fillStyle = NAVY;
  ctx.font = `800 ${size}px ${FONT}`;
  for (const l of lines) {
    ctx.fillText(l, tx, by + size * 0.9);
    by += lh;
  }
  by += titleGap;
  ctx.fillStyle = sub.accent;
  // The note / teacher line shrinks to stay clear of the time and room column.
  if (slot.note) {
    let ns = 22;
    for (; ns > 15; ns--) {
      ctx.font = `700 ${ns}px ${FONT}`;
      if (ctx.measureText(slot.note).width <= maxW) break;
    }
    ctx.fillText(clip(ctx, slot.note, maxW), tx, by + 19);
  } else if (slot.teacher) {
    drawPerson(ctx, tx, by, sub.accent);
    setLetterSpacing(ctx, 0.8);
    let ts = 20;
    for (; ts > 15; ts--) {
      ctx.font = `700 ${ts}px ${FONT}`;
      if (ctx.measureText(slot.teacher).width <= maxW - 24) break;
    }
    ctx.fillText(clip(ctx, slot.teacher, maxW - 24), tx + 24, by + 19);
    setLetterSpacing(ctx, 0);
  }

  // Right column: time pill (with a small clock) above the navy room tag, centred as a stack.
  const pillH = 38;
  const roomH = progress === undefined ? 44 : 38;
  const stackGap = progress === undefined ? 10 : 8;
  const stackH = (slot.time ? pillH : 0) + (slot.time && slot.room ? stackGap : 0) + (slot.room ? roomH : 0);
  let sy = y + (ch - stackH) / 2;
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

  // Syllabus progress: rounded track from the text column to the right edge, with the percentage after it.
  if (progress !== undefined) {
    const pct = `${Math.round(progress * 100)}%`;
    ctx.font = `800 16px ${FONT}`;
    const pctW = ctx.measureText('100%').width;
    const barH = 8;
    const barX = tx;
    const barW = colRight - pctW - 10 - barX;
    const barY = y + h - 11 - barH;
    roundRectPath(ctx, barX, barY, barW, barH, barH / 2);
    ctx.fillStyle = sub.tint;
    ctx.fill();
    if (progress > 0) {
      roundRectPath(ctx, barX, barY, Math.max(barH, barW * Math.min(1, progress)), barH, barH / 2);
      ctx.fillStyle = sub.accent;
      ctx.fill();
    }
    ctx.fillStyle = sub.accent;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(pct, colRight, barY + barH / 2 + 1);
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

const shortDate = (key: string) =>
  new Date(key + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase();

// Footer: frosted blue glass bar with a date tile on the left, then "SPECIAL EVENT(S)" with that day's calendar
// events in large type. When the poster's own date has none, it shows the next event day instead ("NEXT …" plus
// how many days are left). A single event leaves room for a "THEN" line naming the event day after it.
// Fixed height, so one or two events never change the bar.
function drawEventsFooter(
  ctx: CanvasRenderingContext2D,
  events: CalendarEvent[],
  footerBottom: number,
  nextLabel: boolean,
  icons: Record<string, IconImage>,
  daysLeft: number | undefined,
  then: CalendarEvent[]
) {
  // The tile shows the events' own date (the poster's date, or a later one for the "next event" footer).
  const date = new Date(events[0].date + 'T00:00:00');
  const x = 30;
  const w = 740;
  const h = FOOTER_H;
  const y = footerBottom - h;

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
  const label = (nextLabel ? 'NEXT ' : '') + (many ? 'SPECIAL EVENTS' : 'SPECIAL EVENT');
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

  // Countdown chip at the right end of the label row, when the bar is about a later day.
  if (nextLabel && daysLeft !== undefined) {
    const chip = daysLeft === 1 ? 'TOMORROW' : `IN ${daysLeft} DAYS`;
    ctx.font = `800 15px ${FONT}`;
    setLetterSpacing(ctx, 2);
    const cw = ctx.measureText(chip).width + 28;
    const cx = x + w - 24 - cw;
    roundRectPath(ctx, cx, y + 14, cw, 28, 14);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.fillText(chip, cx + 14, y + 34);
    setLetterSpacing(ctx, 0);
  }

  // "THEN" line along the bottom: the event day after the ones listed above.
  const showThen = then.length > 0 && !many;
  const thenH = showThen ? 28 : 0;
  if (showThen) {
    const e = then[0];
    const ly = y + h - 12 - 22;
    ctx.font = `800 13px ${FONT}`;
    setLetterSpacing(ctx, 2);
    const pw = ctx.measureText('THEN').width + 20;
    roundRectPath(ctx, mx, ly, pw, 22, 11);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillText('THEN', mx + 10, ly + 16);
    setLetterSpacing(ctx, 0);

    const when = shortDate(e.date);
    ctx.font = `800 16px ${FONT}`;
    ctx.fillStyle = '#b9f0a8';
    ctx.fillText(when, mx + pw + 10, ly + 17);
    const whenW = ctx.measureText(when).width;
    const course = e.subject ? SUBJECTS[e.subject].name : e.note ?? '';
    const text = e.event + (course ? ` • ${course}` : '') + (then.length > 1 ? `  +${then.length - 1} more` : '');
    const textX = mx + pw + 10 + whenW + 10;
    const size = fitText(ctx, text, 700, 16, 11, x + w - 24 - textX);
    ctx.font = `700 ${size}px ${FONT}`;
    ctx.fillStyle = '#e1eefc';
    ctx.fillText(text, textX, ly + 17);
  }

  const rowsTop = y + 50;
  const rowsH = h - 50 - 12 - thenH;
  const rowH = rowsH / events.length;
  events.forEach((e, i) => drawEventRow(ctx, e, icons, mx, rowsTop + i * rowH, mw, rowH, many));
}

function rowLayout(ctx: CanvasRenderingContext2D, e: CalendarEvent, compact: boolean, maxTextW: number) {
  const iconBox = compact ? 46 : 62;
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
  events: CalendarEvent[]; // calendar events for the footer: the poster date's own, else the next event day's (empty = no footer)
  slots: Slot[];
  assets: FyugAssets;
  nextLabel?: boolean; // footer shows a later event, so it is labelled NEXT SPECIAL EVENT
  daysLeft?: number; // days from the poster's date to that later event
  then?: CalendarEvent[]; // the event day after the footer's, for the "THEN" line
  progress?: Partial<Record<SubjectKey, number>>; // syllabus fraction per subject (0 to 1); omitted = no progress bars
  height?: number; // logical px; defaults to the standard poster height
  subtitle?: string; // header bar text for a special day; defaults to the day's own subtitle or its hour span
}

export function renderFyugPoster(
  canvas: HTMLCanvasElement,
  { date, events, slots, assets, height = POSTER_H, nextLabel = false, daysLeft, then = [], progress, subtitle }: FyugRenderOptions
) {
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
    subtitle: subtitle || (getDaySubtitle(date) ?? daySpan(slots)),
    shiftY: -HEADER_SHIFT
  });

  const top = 408 - HEADER_SHIFT;
  const bottom = events.length ? H - 26 - FOOTER_H - 12 : H - 60;
  const gap = 12;
  const h = (bottom - top - gap * (slots.length - 1)) / slots.length;
  const f = Math.min(1, h / FULL_CARD_H);
  slots.forEach((slot, i) => {
    ctx.save();
    ctx.translate(30, top + i * (h + gap));
    ctx.scale(f, f);
    drawSlot(ctx, slot, i + 1, assets.icons, 740 / f, h / f, progress ? progress[slot.subject] ?? 0 : undefined);
    ctx.restore();
  });

  if (events.length) drawEventsFooter(ctx, events, H - 26, nextLabel, assets.icons, daysLeft, then);

  ctx.restore();
}

// "5 HOURS  •  9:30 – 3:30" from the first start to the last end time.
function daySpan(slots: Slot[]): string {
  const start = slots[0]?.time?.split(' – ')[0];
  const end = slots[slots.length - 1]?.time?.split(' – ')[1];
  const hours = `${slots.length} ${slots.length === 1 ? 'HOUR' : 'HOURS'}`;
  return start && end ? `${hours}  •  ${start} – ${end}` : hours;
}
