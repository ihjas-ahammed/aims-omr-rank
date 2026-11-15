import {
  POSTER_H,
  POSTER_SCALE,
  POSTER_W,
  drawBackgroundAndCorners,
  drawRichTextLine,
  layoutRichTextLines,
  roundRectPath,
} from "../posterRenderer";
import {
  drawIconContain,
  rasteriseIcon,
  setLetterSpacing,
  type IconImage,
} from "../biology/biologyPosterRenderer";
import { PHY_HERO, PHY_ICONS } from "./phyIcons";
import { MATH_ICONS } from "./mathIcons";
import {
  isExamDay,
  type PlusTwoChapter,
  type PlusTwoCycle,
  type PlusTwoDay,
} from "./plusTwoData";

export interface PlusTwoAssets {
  logo: HTMLImageElement | null;
  icons: Record<string, IconImage>;
}

const NAVY = "#061a40";
const GOLD = "#b45309";
const CREAM = "#faf0ca";
const FONT = "'Montserrat', sans-serif";
const X = 30;
const W = 740;

export async function loadPlusTwoIcons(): Promise<Record<string, IconImage>> {
  const entries: [string, { viewBox: string; svg: string }][] = [
    ...Object.entries(PHY_ICONS),
    ...Object.entries(MATH_ICONS),
    ["phy_hero", PHY_HERO],
  ];
  const loaded = await Promise.all(
    entries.map(([, i]) => rasteriseIcon(i.viewBox, i.svg)),
  );
  return Object.fromEntries(entries.map(([k], i) => [k, loaded[i]]));
}

const toDate = (key: string) => new Date(key + "T00:00:00");
const shortDay = (d: Date) =>
  d.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
const shortMonth = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "short" }).toUpperCase();

// Text cut with an ellipsis so it never runs past maxW.
function clip(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxW: number,
): string {
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxW)
    t = t.slice(0, -1);
  return `${t.trimEnd()}…`;
}

function drawCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r = 28,
) {
  roundRectPath(ctx, x, y, w, h, r);
  ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
  ctx.fill();
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = "#b5cadb";
  ctx.stroke();
}

// Top row: logo on the left, "PLUS TWO" over the subject name on the right.
function drawTopRow(
  ctx: CanvasRenderingContext2D,
  logo: HTMLImageElement | null,
  cycle: PlusTwoCycle,
) {
  if (logo) {
    const ratio = Math.min(330 / logo.width, 78 / logo.height);
    ctx.drawImage(
      logo,
      X,
      64 - (logo.height * ratio) / 2,
      logo.width * ratio,
      logo.height * ratio,
    );
  }
  ctx.textAlign = "right";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = NAVY;
  ctx.font = `700 17px ${FONT}`;
  setLetterSpacing(ctx, 4);
  ctx.fillText("PLUS TWO", X + W - 4, 50);
  ctx.fillStyle = cycle.accent;
  ctx.font = `900 32px ${FONT}`;
  setLetterSpacing(ctx, 1.5);
  ctx.fillText(cycle.subject, X + W - 1.5, 86);
  setLetterSpacing(ctx, 0);
}

// Navy date panel: cream day tile, weekday and month, round subject badge.
function drawDatePanel(
  ctx: CanvasRenderingContext2D,
  date: Date,
  hero: IconImage | undefined,
  y: number,
) {
  const h = 152;
  const grad = ctx.createLinearGradient(X, y, X + W, y + h);
  grad.addColorStop(0, "#061a40");
  grad.addColorStop(1, "#0b3a7a");
  roundRectPath(ctx, X, y, W, h, 30);
  ctx.fillStyle = grad;
  ctx.fill();

  // Soft rings behind the badge
  if (hero) {
    ctx.save();
    roundRectPath(ctx, X, y, W, h, 30);
    ctx.clip();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.09)";
    ctx.lineWidth = 2;
    for (const r of [96, 130, 164]) {
      ctx.beginPath();
      ctx.arc(X + W - 84, y + h / 2, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  const tile = h - 32;
  roundRectPath(ctx, X + 16, y + 16, tile, tile, 24);
  ctx.fillStyle = CREAM;
  ctx.fill();
  ctx.fillStyle = NAVY;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `900 78px ${FONT}`;
  ctx.fillText(
    String(date.getDate()).padStart(2, "0"),
    X + 16 + tile / 2,
    y + h / 2 + 5,
  );

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#ffffff";
  ctx.font = `800 50px ${FONT}`;
  ctx.fillText(
    date.toLocaleDateString("en-US", { weekday: "long" }),
    X + 162,
    y + 76,
  );
  ctx.fillStyle = "#9be28d";
  ctx.font = `700 29px ${FONT}`;
  ctx.fillText(
    date.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
    X + 164,
    y + 118,
  );

  if (hero) {
    ctx.beginPath();
    ctx.arc(X + W - 84, y + h / 2, 62, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    drawIconContain(ctx, hero, X + W - 84 - 58, y + h / 2 - 58, 116, 116);
  }
}

// Week strip: one dot per day of the cycle, today highlighted, the exam day in gold.
function drawWeekStrip(
  ctx: CanvasRenderingContext2D,
  cycle: PlusTwoCycle,
  index: number,
  y: number,
) {
  const h = 92;
  drawCard(ctx, X, y, W, h, 24);
  const n = cycle.days.length;
  const cell = (W - 28) / n;
  const cy = y + 58;
  const cx = (i: number) => X + 14 + cell * (i + 0.5);

  // Track: the part already covered in the subject colour
  ctx.lineCap = "round";
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#d9e6f2";
  ctx.beginPath();
  ctx.moveTo(cx(0), cy);
  ctx.lineTo(cx(n - 1), cy);
  ctx.stroke();
  if (index > 0) {
    ctx.strokeStyle = cycle.accent;
    ctx.beginPath();
    ctx.moveTo(cx(0), cy);
    ctx.lineTo(cx(index), cy);
    ctx.stroke();
  }

  cycle.days.forEach((d, i) => {
    const date = toDate(d.date);
    const exam = isExamDay(d);
    const today = i === index;
    const past = i < index;

    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.font = `${today ? 800 : 700} 14px ${FONT}`;
    setLetterSpacing(ctx, 1.6);
    ctx.fillStyle = exam ? GOLD : today ? cycle.accent : "#64748b";
    ctx.fillText(exam ? "EXAM" : shortDay(date), cx(i) + 0.8, y + 25);
    setLetterSpacing(ctx, 0);

    const r = today ? 23 : 18;
    ctx.beginPath();
    ctx.arc(cx(i), cy, r, 0, Math.PI * 2);
    ctx.fillStyle = today
      ? exam
        ? GOLD
        : cycle.accent
      : exam
        ? CREAM
        : past
          ? cycle.tint
          : "#ffffff";
    ctx.fill();
    ctx.lineWidth = today ? 4 : 2.4;
    ctx.strokeStyle = today
      ? "#ffffff"
      : exam
        ? GOLD
        : past
          ? cycle.accent
          : "#b5cadb";
    ctx.stroke();
    if (today) {
      ctx.beginPath();
      ctx.arc(cx(i), cy, r + 3.5, 0, Math.PI * 2);
      ctx.lineWidth = 2.4;
      ctx.strokeStyle = exam ? GOLD : cycle.accent;
      ctx.stroke();
    }

    ctx.fillStyle = today ? "#ffffff" : exam ? GOLD : NAVY;
    ctx.font = `800 ${today ? 20 : 16}px ${FONT}`;
    ctx.textBaseline = "middle";
    ctx.fillText(String(date.getDate()), cx(i), cy + 1);
  });
  ctx.textBaseline = "alphabetic";
}

const ROW_PAD = 10;
const TEXT_X = 106;
const TEXT_MAX_W = 640;

function layoutRows(
  ctx: CanvasRenderingContext2D,
  topics: string[],
  fontSize: number,
) {
  const lh = fontSize * 1.28;
  return topics.map((t) => {
    const lines = layoutRichTextLines(ctx, t, TEXT_MAX_W, fontSize);
    return {
      lines,
      need: Math.max(fontSize + 6, lines.length * lh) + ROW_PAD * 2,
    };
  });
}

// Largest topic size at which every chapter's rows fit their card with the padding kept.
function pickFontSize(
  ctx: CanvasRenderingContext2D,
  chapters: PlusTwoChapter[],
  rowsH: number,
): number {
  for (let size = 30; size > 15; size--) {
    if (
      chapters.every(
        (c) =>
          layoutRows(ctx, c.topics, size).reduce((a, r) => a + r.need, 0) <=
          rowsH,
      )
    )
      return size;
  }
  return 15;
}

function drawChapterCard(
  ctx: CanvasRenderingContext2D,
  chapter: PlusTwoChapter,
  cycle: PlusTwoCycle,
  icons: Record<string, IconImage>,
  y: number,
  h: number,
  bannerH: number,
  fontSize: number,
) {
  drawCard(ctx, X, y, W, h);

  // Banner: icon tile | tag chips + title
  const by = y + 11;
  roundRectPath(ctx, X + 11, by, W - 22, bannerH, 20);
  ctx.fillStyle = cycle.tint;
  ctx.fill();

  const tileW = bannerH + 22;
  roundRectPath(ctx, X + 19, by + 8, tileW, bannerH - 16, 15);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  drawIconContain(
    ctx,
    icons[chapter.icon],
    X + 27,
    by + 13,
    tileW - 16,
    bannerH - 26,
  );

  const tx = X + 19 + tileW + 20;
  const maxW = X + W - 11 - 16 - tx;

  // Title lines first, so the chips and the title can be centred together in the banner.
  const [tag, extra] = chapter.tag.split(" · ");
  const revision = /REV/.test(extra ?? "");
  // The REVISION chip already says it, so the title drops its "— Revision" ending.
  const title = revision
    ? chapter.title.replace(/\s+[—-]\s+Revision$/i, "")
    : chapter.title;
  const words = title.split(" ");
  let size = bannerH >= 100 ? 36 : 32;
  let lines = [title];
  ctx.font = `800 ${size}px ${FONT}`;
  while (ctx.measureText(title).width > maxW && size > 28) {
    size--;
    ctx.font = `800 ${size}px ${FONT}`;
  }
  if (ctx.measureText(title).width > maxW && words.length > 1) {
    for (size = bannerH >= 100 ? 29 : 25; size >= 18; size--) {
      ctx.font = `800 ${size}px ${FONT}`;
      let best = 1;
      let bestMax = Infinity;
      for (let i = 1; i < words.length; i++) {
        const m = Math.max(
          ctx.measureText(words.slice(0, i).join(" ")).width,
          ctx.measureText(words.slice(i).join(" ")).width,
        );
        if (m < bestMax) {
          bestMax = m;
          best = i;
        }
      }
      lines = [words.slice(0, best).join(" "), words.slice(best).join(" ")];
      if (bestMax <= maxW) break;
    }
  }
  const chipH = 26;
  const lh = size * 1.18;
  const blockH = chipH + 8 + lines.length * lh;
  let ty = by + (bannerH - blockH) / 2;

  // Chips: chapter tag, plus REVISION on revision days
  const chips = revision ? [tag, "REVISION"] : [chapter.tag];
  let chipX = tx;
  ctx.font = `800 15px ${FONT}`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  setLetterSpacing(ctx, 2);
  chips.forEach((label, i) => {
    const cw = ctx.measureText(label).width + 24;
    roundRectPath(ctx, chipX, ty, cw, chipH, chipH / 2);
    if (i === 0) {
      ctx.fillStyle = cycle.accent;
      ctx.fill();
      ctx.fillStyle = "#ffffff";
    } else {
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = cycle.accent;
      ctx.stroke();
      ctx.fillStyle = cycle.accent;
    }
    ctx.fillText(label, chipX + 13, ty + chipH / 2 + 1);
    chipX += cw + 8;
  });
  setLetterSpacing(ctx, 0);
  ty += chipH + 8;

  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = NAVY;
  ctx.font = `800 ${size}px ${FONT}`;
  for (const line of lines) {
    ctx.fillText(clip(ctx, line, maxW), tx, ty + size * 0.86);
    ty += lh;
  }

  // Topics — rows share the remaining height evenly.
  const rows = layoutRows(ctx, chapter.topics, fontSize);
  const lineH = fontSize * 1.28;
  const rowsTop = by + bannerH + 6;
  const rowsAvail = y + h - 10 - rowsTop;
  const extraH = Math.max(
    0,
    (rowsAvail - rows.reduce((a, r) => a + r.need, 0)) / rows.length,
  );
  const box = Math.min(32, Math.max(22, fontSize + 3));

  let rowY = rowsTop;
  rows.forEach((row, i) => {
    const rh = row.need + extraH;
    const cy = rowY + rh / 2;

    roundRectPath(ctx, 56 + (32 - box) / 2, cy - box / 2, box, box, 7);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.lineWidth = 2.6;
    ctx.strokeStyle = cycle.accent;
    ctx.stroke();

    let baseline = cy - (row.lines.length * lineH) / 2 + fontSize * 0.84;
    row.lines.forEach((line) => {
      drawRichTextLine(ctx, line, TEXT_X, baseline, fontSize, NAVY);
      baseline += lineH;
    });

    if (i < rows.length - 1) {
      ctx.beginPath();
      ctx.moveTo(50, rowY + rh);
      ctx.lineTo(750, rowY + rh);
      ctx.strokeStyle = "#d9e6f2";
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }
    rowY += rh;
  });
}

const SINGLE_BANNER_H = 112;

function drawChapters(
  ctx: CanvasRenderingContext2D,
  chapters: PlusTwoChapter[],
  cycle: PlusTwoCycle,
  icons: Record<string, IconImage>,
  top: number,
  bottom: number,
) {
  const gap = 14;
  const cardH = (bottom - top - gap * (chapters.length - 1)) / chapters.length;
  const bannerH = chapters.length > 1 ? 88 : SINGLE_BANNER_H;
  const fontSize = pickFontSize(ctx, chapters, cardH - 11 - bannerH - 6 - 10);
  chapters.forEach((c, i) =>
    drawChapterCard(
      ctx,
      c,
      cycle,
      icons,
      top + i * (cardH + gap),
      cardH,
      bannerH,
      fontSize,
    ),
  );
}

function drawExam(
  ctx: CanvasRenderingContext2D,
  label: string,
  cycle: PlusTwoCycle,
  icons: Record<string, IconImage>,
  y: number,
  h: number,
) {
  drawCard(ctx, X, y, W, h);
  const mid = y + h / 2;

  ctx.beginPath();
  ctx.arc(POSTER_W / 2, mid - 190, 124, 0, Math.PI * 2);
  ctx.fillStyle = cycle.tint;
  ctx.fill();
  drawIconContain(
    ctx,
    icons[cycle.examIcon],
    POSTER_W / 2 - 100,
    mid - 280,
    200,
    180,
  );

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = NAVY;
  ctx.font = `900 96px ${FONT}`;
  setLetterSpacing(ctx, 6);
  ctx.fillText("EXAM DAY", POSTER_W / 2 + 3, mid + 44);
  setLetterSpacing(ctx, 0);

  // The exam line breaks at the dash: subject above, chapter range in a pill below.
  const [head, tail] = label.split(" — ");
  ctx.fillStyle = cycle.accent;
  ctx.font = `800 31px ${FONT}`;
  ctx.fillText(head, POSTER_W / 2, mid + 108);
  if (tail) {
    ctx.font = `800 26px ${FONT}`;
    setLetterSpacing(ctx, 2);
    const tw = ctx.measureText(tail).width + 56;
    roundRectPath(ctx, POSTER_W / 2 - tw / 2, mid + 134, tw, 54, 27);
    ctx.fillStyle = NAVY;
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.textBaseline = "middle";
    ctx.fillText(tail, POSTER_W / 2 + 1, mid + 162);
    ctx.textBaseline = "alphabetic";
    setLetterSpacing(ctx, 0);
  }

  ctx.fillStyle = "#168a1f";
  ctx.font = `700 29px ${FONT}`;
  ctx.fillText("Revise well. All the best!", POSTER_W / 2, mid + 250);
}

export interface PlusTwoRenderOptions {
  date: Date;
  cycle: PlusTwoCycle;
  day: PlusTwoDay;
  index: number; // position of the day in its cycle
  assets: PlusTwoAssets;
}

// Plus Two poster: logo + subject, navy date panel, week strip, chapter cards, and a "tomorrow" footer.
const TOP = 390;
const BOTTOM_MARGIN = 30;

// A single-chapter day only needs as much height as its card: shrink the poster rather than stretch the rows.
function posterHeight(ctx: CanvasRenderingContext2D, day: PlusTwoDay): number {
  if (isExamDay(day) || day.chapters.length > 1) return POSTER_H;
  const fontSize = pickFontSize(ctx, day.chapters, Infinity);
  const rows = layoutRows(ctx, day.chapters[0].topics, fontSize);
  const cardH = 11 + SINGLE_BANNER_H + 6 + rows.reduce((a, r) => a + r.need, 0) + 10 + 16;
  return Math.min(POSTER_H, Math.ceil(TOP + cardH + BOTTOM_MARGIN));
}

// Draws the poster and returns its logical height (the canvas is resized to fit).
export function renderPlusTwoPoster(
  canvas: HTMLCanvasElement,
  { date, cycle, day, index, assets }: PlusTwoRenderOptions,
): number {
  const ctx = canvas.getContext("2d");
  if (!ctx) return POSTER_H;

  const H = posterHeight(ctx, day);
  canvas.width = POSTER_W * POSTER_SCALE;
  canvas.height = H * POSTER_SCALE;

  ctx.save();
  ctx.setTransform(POSTER_SCALE, 0, 0, POSTER_SCALE, 0, 0);
  ctx.clearRect(0, 0, POSTER_W, H);

  drawBackgroundAndCorners(ctx, POSTER_W, H, "corners_physics");
  drawTopRow(ctx, assets.logo, cycle);
  drawDatePanel(
    ctx,
    date,
    cycle.hero ? assets.icons[cycle.hero] : undefined,
    118,
  );
  drawWeekStrip(ctx, cycle, index, 284);

  const top = TOP;
  const bottom = H - BOTTOM_MARGIN;
  if (isExamDay(day)) {
    drawExam(ctx, day.label, cycle, assets.icons, top, bottom - top);
  } else {
    drawChapters(ctx, day.chapters, cycle, assets.icons, top, bottom);
  }

  ctx.restore();
  return H;
}
