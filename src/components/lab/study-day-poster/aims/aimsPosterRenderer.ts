import { SVG_CATALOG } from '../svgCatalog';
import { POSTER_H, POSTER_SCALE, POSTER_W, drawBackgroundAndCorners, roundRectPath } from '../posterRenderer';
import { BIO_ICONS } from '../biology/bioIcons';
import { drawIconContain, rasteriseIcon, setLetterSpacing, type IconImage } from '../biology/biologyPosterRenderer';
import { AIMS_ICONS } from './aimsIcons';
import type { RevisionItem, SubjectKey } from './schedule';

export interface AimsAssets {
  logo: HTMLImageElement | null;
  icons: Record<string, IconImage>;
}

const NAVY = '#061a40';
const BLUE = '#0072dc';
const GREEN = '#168a1f';
const MONT = "'Montserrat', sans-serif";
const ML = "'Noto Sans Malayalam', 'Manjari', sans-serif";
const HI = "'Noto Sans Devanagari', sans-serif";

// Fonts the poster draws with — load these (with sample text so Google's unicode-range subsets download) before rendering.
export const AIMS_FONT_REQUESTS: [string, string][] = [
  ['700 20px Montserrat', 'Aa0'],
  ['800 20px Montserrat', 'Aa0'],
  ['900 20px Montserrat', 'Aa0'],
  ['700 20px "Noto Sans Malayalam"', 'അആഇ സമ്പത്തും ലോകവും'],
  ['800 20px "Noto Sans Malayalam"', 'അആഇ സമ്പത്തും ലോകവും'],
  ['700 20px "Noto Sans Devanagari"', 'अआइ दिल्ली में'],
  ['800 20px "Noto Sans Devanagari"', 'अआइ दिल्ली में']
];

export const AIMS_FONT_STYLESHEET =
  'https://fonts.googleapis.com/css2?family=Noto+Sans+Malayalam:wght@700;800&family=Noto+Sans+Devanagari:wght@700;800&display=swap';

const SUBJECT_ICON: Partial<Record<SubjectKey, { viewBox: string; svg: string }>> = {
  physics: SVG_CATALOG.phys_atom,
  chemistry: SVG_CATALOG.chem_flask,
  maths: SVG_CATALOG.math_geometry,
  biology: BIO_ICONS.bio_cell_unit,
  history: AIMS_ICONS.history,
  geography: AIMS_ICONS.geography,
  english: AIMS_ICONS.english
};

export async function loadAimsIcons(): Promise<Record<string, IconImage>> {
  const entries: [string, { viewBox: string; svg: string }][] = [
    ...(Object.entries(SUBJECT_ICON) as [string, { viewBox: string; svg: string }][]),
    ['book_blue', AIMS_ICONS.book_blue],
    ['book_green', AIMS_ICONS.book_green]
  ];
  const loaded = await Promise.all(entries.map(([, i]) => rasteriseIcon(i.viewBox, i.svg)));
  return Object.fromEntries(entries.map(([k], i) => [k, loaded[i]]));
}

interface Theme {
  accent: string;
  tint: string;
}
const SCIENCE: Theme = { accent: GREEN, tint: '#e3f9e1' };
const LANGUAGE: Theme = { accent: BLUE, tint: '#e1effc' };
const SOCIAL: Theme = { accent: '#004080', tint: '#e7eef8' };

const themeFor = (s: SubjectKey): Theme =>
  s === 'english' || s === 'hindi' || s === 'malayalam2' ? LANGUAGE : s === 'history' || s === 'geography' ? SOCIAL : SCIENCE;

const fontFor = (text: string, weight: number, size: number) => {
  if (/[ഀ-ൿ]/.test(text)) return `${weight} ${size}px ${ML}`;
  if (/[ऀ-ॿ]/.test(text)) return `${weight} ${size}px ${HI}`;
  return `${weight} ${size}px ${MONT}`;
};

function wrap(ctx: CanvasRenderingContext2D, text: string, font: string, maxW: number): string[] {
  ctx.font = font;
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (cur && ctx.measureText(next).width > maxW) {
      lines.push(cur);
      cur = w;
    } else {
      cur = next;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

interface TextRow {
  lines: string[];
  font: string;
  color: string;
  lh: number;
  gapBefore: number;
}

interface LaidOutItem {
  height: number;
  draw: (y: number) => void;
}

function layoutItem(
  ctx: CanvasRenderingContext2D,
  item: RevisionItem,
  assets: AimsAssets,
  x: number,
  w: number,
  compact: boolean,
  s: number
): LaidOutItem {
  const theme = themeFor(item.subject);
  const padX = 36;
  const padY = compact ? 22 : 30;
  const circleR = (compact ? 46 : 62) * s;
  const labelSize = (compact ? 36 : 48) * s;
  const pillFont = `700 ${Math.round((compact ? 22 : 27) * s)}px ${MONT}`;
  const pillH = (compact ? 22 : 27) * s + 20;
  const titleSize = (compact ? 30 : 46) * s;
  const mlSize = (compact ? 28 : 38) * s;
  const lessonSize = (compact ? 26 : 32) * s;

  const textLeft = compact ? x + padX + circleR * 2 + 28 : x + padX;
  const textW = compact ? x + w - 24 - textLeft : w - padX * 2;
  const align: CanvasTextAlign = compact ? 'left' : 'center';
  const anchorX = compact ? textLeft : x + w / 2;

  // Body rows
  const rows: TextRow[] = [];
  if (item.titleEn) {
    rows.push({
      lines: wrap(ctx, item.titleEn, `800 ${titleSize}px ${MONT}`, textW),
      font: `800 ${titleSize}px ${MONT}`,
      color: NAVY,
      lh: titleSize * 1.28,
      gapBefore: compact ? 8 * s : 22 * s
    });
  }
  if (item.titleMl) {
    const f = fontFor(item.titleMl, 700, mlSize);
    const lines = wrap(ctx, `( ${item.titleMl} )`, f, textW);
    rows.push({ lines, font: f, color: theme.accent, lh: mlSize * 1.5, gapBefore: compact ? 4 * s : 14 * s });
  }
  item.lessons.forEach((l, i) => {
    const text = l.ml ?? l.en;
    const f = fontFor(text, 700, lessonSize);
    rows.push({
      lines: wrap(ctx, text, f, textW),
      font: f,
      color: NAVY,
      lh: lessonSize * 1.45,
      gapBefore: i === 0 ? (compact ? 6 : 18) * s : 4 * s
    });
  });

  const rowsH = rows.reduce((a, r) => a + r.gapBefore + r.lines.length * r.lh, 0);
  const headH = compact ? Math.max(labelSize * 1.2, pillH) : circleR * 2 + 16 * s + labelSize * 1.1 + 12 * s + pillH;
  const height = compact ? Math.max(circleR * 2, headH + rowsH) + padY * 2 : padY * 2 + headH + rowsH;

  const draw = (y: number) => {
    roundRectPath(ctx, x, y, w, height, 28);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fill();
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = '#b5cadb';
    ctx.stroke();

    const circleCx = compact ? x + padX + circleR : x + w / 2;
    const circleCy = compact ? y + padY + circleR : y + padY + circleR;
    ctx.beginPath();
    ctx.arc(circleCx, circleCy, circleR, 0, Math.PI * 2);
    ctx.fillStyle = theme.tint;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = theme.accent;
    ctx.stroke();

    const icon = assets.icons[item.subject];
    if (icon) {
      const box = circleR * 1.55;
      drawIconContain(ctx, icon, circleCx - box / 2, circleCy - box / 2, box, box);
    } else {
      // Hindi / Malayalam: the first letter of the script as the badge.
      const glyph = item.subject === 'hindi' ? 'अ' : 'അ';
      ctx.fillStyle = theme.accent;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = fontFor(glyph, 800, circleR * 0.78);
      ctx.fillText(glyph, circleCx, circleCy + circleR * 0.04);
    }

    // Label + pill
    const pillText = `${item.kind === 'unit' ? 'UNIT' : 'CHAPTER'} : ${item.number}`;
    ctx.font = pillFont;
    setLetterSpacing(ctx, 2);
    const pillW = ctx.measureText(pillText).width + 38 * s;
    setLetterSpacing(ctx, 0);

    let cursorY: number;
    if (compact) {
      const baseY = y + padY + labelSize * 0.95;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = theme.accent;
      ctx.font = `900 ${labelSize}px ${MONT}`;
      ctx.fillText(item.subjectLabel, textLeft, baseY);
      const labelW = ctx.measureText(item.subjectLabel).width;
      const px = textLeft + labelW + 18;
      const py = baseY - pillH * 0.72;
      roundRectPath(ctx, px, py, pillW, pillH, pillH / 2);
      ctx.fillStyle = NAVY;
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = pillFont;
      ctx.textBaseline = 'middle';
      setLetterSpacing(ctx, 2);
      ctx.fillText(pillText, px + 19 * s, py + pillH / 2 + 1);
      setLetterSpacing(ctx, 0);
      cursorY = y + padY + headH;
    } else {
      let cy = y + padY + circleR * 2 + 16 * s;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = theme.accent;
      ctx.font = `900 ${labelSize}px ${MONT}`;
      setLetterSpacing(ctx, 3);
      ctx.fillText(item.subjectLabel, x + w / 2, cy + labelSize * 0.9);
      setLetterSpacing(ctx, 0);
      cy += labelSize * 1.1 + 12 * s;
      roundRectPath(ctx, x + w / 2 - pillW / 2, cy, pillW, pillH, pillH / 2);
      ctx.fillStyle = NAVY;
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = pillFont;
      ctx.textBaseline = 'middle';
      setLetterSpacing(ctx, 2);
      ctx.fillText(pillText, x + w / 2, cy + pillH / 2 + 1);
      setLetterSpacing(ctx, 0);
      cursorY = cy + pillH;
    }

    ctx.textAlign = align;
    ctx.textBaseline = 'alphabetic';
    for (const r of rows) {
      cursorY += r.gapBefore;
      ctx.font = r.font;
      ctx.fillStyle = r.color;
      for (const line of r.lines) {
        ctx.fillText(line, anchorX, cursorY + r.lh * 0.72);
        cursorY += r.lh;
      }
    }
  };

  return { height, draw };
}

function sparkle(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx + r * 0.3, cy - r * 0.3);
  ctx.lineTo(cx + r, cy);
  ctx.lineTo(cx + r * 0.3, cy + r * 0.3);
  ctx.lineTo(cx, cy + r);
  ctx.lineTo(cx - r * 0.3, cy + r * 0.3);
  ctx.lineTo(cx - r, cy);
  ctx.lineTo(cx - r * 0.3, cy - r * 0.3);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

export interface AimsRenderOptions {
  date: Date;
  items: RevisionItem[];
  assets: AimsAssets;
}

export function renderAimsPoster(canvas: HTMLCanvasElement, { date, items, assets }: AimsRenderOptions) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = POSTER_W;
  const H = POSTER_H;
  ctx.save();
  ctx.setTransform(POSTER_SCALE, 0, 0, POSTER_SCALE, 0, 0);
  ctx.clearRect(0, 0, W, H);

  drawBackgroundAndCorners(ctx, W, H, 'corners_aims');

  // Logo
  if (assets.logo) {
    const r = Math.min(220 / assets.logo.width, 150 / assets.logo.height);
    const dw = assets.logo.width * r;
    const dh = assets.logo.height * r;
    ctx.drawImage(assets.logo, (W - dw) / 2, 24, dw, dh);
  }

  // Title
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = NAVY;
  ctx.font = `900 50px ${MONT}`;
  setLetterSpacing(ctx, 2);
  ctx.fillText('REVISION SCHEDULE', W / 2, 232);
  setLetterSpacing(ctx, 0);

  // Date pill (dd/mm/yyyy)
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dateText = `${dd}/${mm}/${date.getFullYear()}`;
  roundRectPath(ctx, 200, 258, 400, 84, 42);
  ctx.fillStyle = '#004080';
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = `900 50px ${MONT}`;
  ctx.textBaseline = 'middle';
  setLetterSpacing(ctx, 3);
  ctx.fillText(dateText, W / 2, 302);
  setLetterSpacing(ctx, 0);
  sparkle(ctx, 160, 300, 12, '#5cb85c');
  sparkle(ctx, 640, 300, 12, BLUE);

  // Book band
  const books = ['book_blue', 'book_green'];
  for (let i = 0; i < 9; i++) {
    drawIconContain(ctx, assets.icons[books[i % 2]], 85 + i * 70, 368, 54, 54);
  }

  // Cards
  const top = 446;
  const bottom = 1034;
  const gap = 18;
  const compact = items.length > 1;
  let laid: LaidOutItem[] = [];
  for (let s = compact ? 1 : 1.3; s >= 0.5; s -= 0.05) {
    laid = items.map((it) => layoutItem(ctx, it, assets, 30, 740, compact, s));
    const total = laid.reduce((a, l) => a + l.height, 0) + gap * (laid.length - 1);
    if (total <= bottom - top) break;
  }
  const total = laid.reduce((a, l) => a + l.height, 0) + gap * (laid.length - 1);
  let y = top + (bottom - top - total) / 2;
  for (const l of laid) {
    l.draw(y);
    y += l.height + gap;
  }

  // Footer
  ctx.strokeStyle = 'rgba(6, 26, 64, 0.35)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(190, 1076);
  ctx.lineTo(320, 1076);
  ctx.moveTo(480, 1076);
  ctx.lineTo(610, 1076);
  ctx.stroke();
  ctx.fillStyle = NAVY;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `900 30px ${MONT}`;
  setLetterSpacing(ctx, 6);
  ctx.fillText('AIMS', W / 2 + 3, 1077);
  setLetterSpacing(ctx, 0);
  sparkle(ctx, 338, 1076, 11, '#5cb85c');
  sparkle(ctx, 462, 1076, 11, BLUE);

  ctx.restore();
}
