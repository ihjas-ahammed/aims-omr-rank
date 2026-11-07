import { SVG_CATALOG } from './svgCatalog';
import type { StudyCard } from './presets';

// Ported from docs/study_day_poster/prototype_with_all_svg.html (sections 7 & 8).

export interface PosterAssets {
  svgImages: Record<string, HTMLImageElement>;
  logo: HTMLImageElement | null;
}

export const POSTER_W = 800;
export const POSTER_H = 1160;
export const POSTER_SCALE = 2;

interface MathToken {
  text: string;
  type: string;
  italic?: boolean;
}
export interface MeasuredWord {
  toks: MathToken[];
  width: number;
}

function parseMathTokens(text: string): MathToken[] {
  // Normalize minus sign for cleaner typography
  const normalized = String(text).replace(/<-/g, "←").replace(/->/g, "→");
  const tokens: MathToken[] = [];

  // Regex matches:
  // 1. HTML tags <sub>...</sub>, <sup>...</sup>, <i>...</i>
  // 2. Variable with subscript/superscript like E_n, r_n, t_{1/2}, n^2, x^{2+}
  const regex = /<(sub|sup|i)>(.*?)<\/\1>|([A-Za-z0-9)])([_^])(\{[^}]+\}|[A-Za-z0-9+\-]+)/g;

  let lastIdx = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(normalized)) !== null) {
    if (match.index > lastIdx) {
      tokens.push({
        text: normalized.slice(lastIdx, match.index),
        type: "normal"
      });
    }

    if (match[1]) {
      // HTML tag match
      const tag = match[1];
      tokens.push({
        text: match[2],
        type: tag === "i" ? "italic" : tag
      });
    } else {
      // Shorthand math match: base + (_ or ^) + script
      const baseChar = match[3];
      const op = match[4];
      const scriptText = match[5].replace(/^\{|\}$/g, "");

      // Italicize single-letter physics/math variables (like r, v, E, n, k, x, t)
      const isSingleVar = /^[A-Za-z]$/.test(baseChar);
      tokens.push({
        text: baseChar,
        type: isSingleVar ? "italic" : "normal"
      });
      tokens.push({
        text: scriptText,
        type: op === "_" ? "sub" : "sup",
        italic: /^[A-Za-z]+$/.test(scriptText)
      });
    }

    lastIdx = regex.lastIndex;
  }

  if (lastIdx < normalized.length) {
    tokens.push({
      text: normalized.slice(lastIdx),
      type: "normal"
    });
  }

  return tokens;
}

export function layoutRichTextLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, baseFontSize: number): MeasuredWord[][] {
  // Split by spaces while preserving token metadata
  const rawWords = String(text).split(/\s+/);
  const lines: MeasuredWord[][] = [];
  let currentLineWords: MeasuredWord[] = [];
  let currentLineWidth = 0;

  const spaceWidth = baseFontSize * 0.3;

  function measureWordTokens(wordStr: string): MeasuredWord {
    const toks = parseMathTokens(wordStr);
    let w = 0;
    for (const t of toks) {
      if (t.type === "sub" || t.type === "sup") {
        ctx.font = `${t.italic ? "italic " : ""}700 ${Math.round(baseFontSize * 0.68)}px 'Montserrat', sans-serif`;
      } else if (t.type === "italic") {
        ctx.font = `italic 700 ${baseFontSize}px 'Montserrat', sans-serif`;
      } else {
        ctx.font = `700 ${baseFontSize}px 'Montserrat', sans-serif`;
      }
      w += ctx.measureText(t.text).width;
    }
    return { toks, width: w };
  }

  for (const word of rawWords) {
    const measured = measureWordTokens(word);
    if (currentLineWords.length > 0 && currentLineWidth + spaceWidth + measured.width > maxWidth) {
      lines.push(currentLineWords);
      currentLineWords = [measured];
      currentLineWidth = measured.width;
    } else {
      if (currentLineWords.length > 0) currentLineWidth += spaceWidth;
      currentLineWords.push(measured);
      currentLineWidth += measured.width;
    }
  }
  if (currentLineWords.length > 0) lines.push(currentLineWords);
  return lines;
}

export function drawRichTextLine(ctx: CanvasRenderingContext2D, wordObjs: MeasuredWord[], x: number, y: number, baseFontSize: number, color = "#061a40") {
  let cursorX = x;
  const spaceWidth = baseFontSize * 0.3;
  ctx.fillStyle = color;
  ctx.textBaseline = "alphabetic";

  wordObjs.forEach((wordObj, wIdx) => {
    if (wIdx > 0) cursorX += spaceWidth;
    for (const t of wordObj.toks) {
      if (t.type === "sub") {
        const subSize = Math.round(baseFontSize * 0.68);
        ctx.font = `${t.italic ? "italic " : ""}700 ${subSize}px 'Montserrat', sans-serif`;
        ctx.fillText(t.text, cursorX, y + baseFontSize * 0.22);
        cursorX += ctx.measureText(t.text).width + 1;
      } else if (t.type === "sup") {
        const supSize = Math.round(baseFontSize * 0.68);
        ctx.font = `${t.italic ? "italic " : ""}700 ${supSize}px 'Montserrat', sans-serif`;
        ctx.fillText(t.text, cursorX, y - baseFontSize * 0.34);
        cursorX += ctx.measureText(t.text).width + 1;
      } else if (t.type === "italic") {
        ctx.font = `italic 700 ${baseFontSize}px 'Montserrat', sans-serif`;
        ctx.fillText(t.text, cursorX, y);
        cursorX += ctx.measureText(t.text).width;
      } else {
        ctx.font = `700 ${baseFontSize}px 'Montserrat', sans-serif`;
        ctx.fillText(t.text, cursorX, y);
        cursorX += ctx.measureText(t.text).width;
      }
    }
  });
}

export function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function drawBackgroundAndCorners(ctx: CanvasRenderingContext2D, W: number, H: number, cornerTheme: string) {
  // 1. Base Off-White Background
  ctx.fillStyle = "#fbfdfc";
  ctx.fillRect(0, 0, W, H);

  // 2. Subtle Engineering Grid
  ctx.strokeStyle = "rgba(12, 74, 110, 0.045)";
  ctx.lineWidth = 1;
  const gridSize = 38;
  for (let x = 0; x < W; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y < H; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // 3. Top-Left & Top-Right Decorative Arcs
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, 74, 0, Math.PI * 0.5);
  ctx.strokeStyle = "#1d7ec2";
  ctx.lineWidth = 2.2;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(W, 0, 74, Math.PI * 0.5, Math.PI);
  ctx.strokeStyle = "#2b9e5a";
  ctx.lineWidth = 2.2;
  ctx.stroke();
  ctx.restore();

  // 4. Bottom-Left Layered Organic Waves
  ctx.save();
  // Light green back wave
  ctx.beginPath();
  ctx.moveTo(0, H - 205);
  ctx.bezierCurveTo(65, H - 165, 118, H - 105, 102, H - 40);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fillStyle = "#91db6f";
  ctx.fill();

  // Medium blue middle wave
  ctx.beginPath();
  ctx.moveTo(0, H - 120);
  ctx.bezierCurveTo(110, H - 115, 225, H - 35, 435, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fillStyle = "#3688c9";
  ctx.fill();

  // Deep navy front wave
  ctx.beginPath();
  ctx.moveTo(0, H - 115);
  ctx.bezierCurveTo(95, H - 110, 145, H - 15, 345, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fillStyle = "#004d8c";
  ctx.fill();

  // 5. Bottom-Right Layered Organic Waves
  // Soft mint outer wave
  ctx.beginPath();
  ctx.moveTo(W, H - 175);
  ctx.bezierCurveTo(W - 95, H - 155, W - 155, H - 45, W - 210, H);
  ctx.lineTo(W, H);
  ctx.closePath();
  ctx.fillStyle = "#dcf5d3";
  ctx.fill();

  // Vibrant green upper crest
  ctx.beginPath();
  ctx.moveTo(W, H - 178);
  ctx.bezierCurveTo(W - 55, H - 185, W - 95, H - 135, W - 82, H - 80);
  ctx.bezierCurveTo(W - 65, H - 105, W - 35, H - 120, W, H - 122);
  ctx.closePath();
  ctx.fillStyle = "#8cd96c";
  ctx.fill();
  ctx.restore();

  // 6. Subject-Specific Corner Line Graphics
  ctx.save();
  if (cornerTheme === "corners_chemistry") {
    // Bottom-left white molecular hexes
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = 2;
    drawHexagon(ctx, 56, H - 62, 34);
    drawHexagon(ctx, 108, H - 36, 26);
    // Bottom-right navy benzene lattice
    ctx.strokeStyle = "#061a40";
    ctx.lineWidth = 2.4;
    drawHexagon(ctx, W - 86, H - 72, 42);
    drawHexagon(ctx, W - 42, H - 36, 32);
    ctx.fillStyle = "#168a1f";
    ctx.beginPath(); ctx.arc(W - 86, H - 114, 5, 0, Math.PI * 2); ctx.fill();
  } else if (cornerTheme === "corners_math") {
    // Bottom-left white harmonic circles
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(58, H - 56, 42, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(58, H - 56, 24, 0, Math.PI * 2); ctx.stroke();
    // Bottom-right navy concentric geometry
    ctx.strokeStyle = "#061a40";
    ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.arc(W - 76, H - 64, 54, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W - 130, H - 64); ctx.lineTo(W - 22, H - 64); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(W - 76, H - 118); ctx.lineTo(W - 76, H - 10); ctx.stroke();
  } else if (cornerTheme === "corners_cs") {
    // Circuit traces
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(15, H - 85); ctx.lineTo(65, H - 85); ctx.lineTo(95, H - 55);
    ctx.moveTo(25, H - 45); ctx.lineTo(80, H - 45); ctx.lineTo(115, H - 15);
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(95, H - 55, 4.5, 0, Math.PI * 2); ctx.fill();

    ctx.strokeStyle = "#061a40";
    ctx.beginPath();
    ctx.moveTo(W - 140, H - 30); ctx.lineTo(W - 95, H - 75); ctx.lineTo(W - 35, H - 75);
    ctx.moveTo(W - 115, H - 15); ctx.lineTo(W - 70, H - 55); ctx.lineTo(W - 20, H - 55);
    ctx.stroke();
    ctx.fillStyle = "#0072dc";
    ctx.beginPath(); ctx.arc(W - 95, H - 75, 5.5, 0, Math.PI * 2); ctx.fill();
  } else if (cornerTheme === "corners_aims") {
    // Neutral rings: white bottom-left, navy bottom-right
    ctx.strokeStyle = "rgba(255,255,255,0.88)";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(58, H - 52, 44, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(58, H - 52, 26, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "#0072dc";
    ctx.beginPath(); ctx.arc(102, H - 148, 3.8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(130, H - 105, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#061a40";
    ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.arc(W - 76, H - 64, 54, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(W - 76, H - 64, 34, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "#168a1f";
    ctx.beginPath(); ctx.arc(W - 76, H - 118, 5, 0, Math.PI * 2); ctx.fill();
  } else if (cornerTheme === "corners_biology") {
    // Bottom-left white leaves
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 2;
    drawLeaf(ctx, 34, H - 22, 74, -1.05);
    drawLeaf(ctx, 34, H - 22, 62, -0.35);
    drawLeaf(ctx, 34, H - 22, 52, -1.65);
    ctx.fillStyle = "#0072dc";
    ctx.beginPath(); ctx.arc(102, H - 148, 3.8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(130, H - 105, 4.5, 0, Math.PI * 2); ctx.fill();
    // Bottom-right navy DNA helix
    ctx.save();
    ctx.translate(W - 92, H - 70);
    ctx.rotate(-0.62);
    ctx.strokeStyle = "#061a40";
    ctx.lineWidth = 2.6;
    for (const phase of [0, Math.PI]) {
      ctx.beginPath();
      for (let x = -86; x <= 86; x += 3) {
        const y = 22 * Math.sin(x / 15 + phase);
        if (x === -86) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.strokeStyle = "#168a1f";
    ctx.lineWidth = 2;
    for (let x = -75; x <= 75; x += 15) {
      const y = 22 * Math.sin(x / 15);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, -y); ctx.stroke();
    }
    ctx.restore();
  } else {
    // Default: Exact Physics/Biology Orbital Rings from reference image
    // Bottom-left white/blue intersecting orbitals
    ctx.save();
    ctx.translate(56, H - 68);
    ctx.strokeStyle = "rgba(255,255,255,0.88)";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(0, 0, 58, 24, 0.45, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, 0, 58, 24, -0.55, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath(); ctx.arc(52, 24, 4.2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    // Small floating blue dots above bottom-left wave
    ctx.fillStyle = "#0072dc";
    ctx.beginPath(); ctx.arc(102, H - 148, 3.8, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(130, H - 105, 4.5, 0, Math.PI * 2); ctx.fill();

    // Bottom-right tilted dark-navy concentric atomic orbitals
    ctx.save();
    ctx.translate(W - 84, H - 76);
    ctx.rotate(-0.62);
    ctx.strokeStyle = "#061a40";
    ctx.lineWidth = 2.2;

    ctx.beginPath(); ctx.ellipse(0, 0, 92, 46, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, 0, 68, 32, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, 0, 44, 18, 0, 0, Math.PI * 2); ctx.stroke();

    // Central nucleus & orbital electrons
    ctx.fillStyle = "#08255c";
    ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = "#08255c";
    ctx.beginPath(); ctx.arc(38, -42, 6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-28, 30, 5, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = "#168a1f";
    ctx.beginPath(); ctx.arc(42, 4, 4.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

function drawLeaf(ctx: CanvasRenderingContext2D, x: number, y: number, len: number, angle: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(len * 0.5, -len * 0.3, len, 0);
  ctx.quadraticCurveTo(len * 0.5, len * 0.3, 0, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(len * 0.85, 0);
  ctx.stroke();
  ctx.restore();
}

function drawHexagon(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const ang = (Math.PI / 3) * i - Math.PI / 6;
    const px = cx + r * Math.cos(ang);
    const py = cy + r * Math.sin(ang);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();
}

export interface RenderOptions {
  card: StudyCard;
  date: Date;
  logoScale: number; // 0.6 – 1.5
  assets: PosterAssets;
}

export function renderPoster(canvas: HTMLCanvasElement, { card, date, logoScale, assets }: RenderOptions) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const W = POSTER_W;
  const H = POSTER_H;
  ctx.save();
  ctx.setTransform(POSTER_SCALE, 0, 0, POSTER_SCALE, 0, 0);
  ctx.clearRect(0, 0, W, H);

  const scaleSlider = logoScale;
  const cornerTheme = card.cornerGraphic || 'corners_physics';

  drawBackgroundAndCorners(ctx, W, H, cornerTheme);


  const logoImg = assets.logo;
  if (logoImg) {
  const maxLogoW = 500 * scaleSlider;
  const maxLogoH = 112 * scaleSlider;
  const ratio = Math.min(maxLogoW / logoImg.width, maxLogoH / logoImg.height);
  const drawW = logoImg.width * ratio;
  const drawH = logoImg.height * ratio;
  const drawX = (W - drawW) / 2;
  const drawY = 82 - drawH / 2;
  ctx.drawImage(logoImg, drawX, drawY, drawW, drawH);
}

  // 3. Date Row
  const dateObj = date;
  const dayNum = String(dateObj.getDate()).padStart(2, "0");
  const weekdayName = dateObj.toLocaleDateString("en-US", { weekday: "long" });
  const monthName = dateObj.toLocaleDateString("en-US", { month: "long" });

  // Soft cream-yellow circle behind Day Number (offset slightly top-left like reference)
  ctx.fillStyle = "#faf0ca";
  ctx.beginPath();
  ctx.arc(118, 244, 86, 0, Math.PI * 2);
  ctx.fill();

  // Day Number ("07")
  ctx.fillStyle = "#061a40";
  ctx.font = "900 100px 'Montserrat', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(dayNum, 142, 250);

  // Vertical Divider Line
  ctx.fillStyle = "#061a40";
  roundRectPath(ctx, 260, 192, 4.2, 116, 2.1);
  ctx.fill();

  // Weekday ("Saturday") & Month ("November")
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#061a40";
  ctx.font = "800 50px 'Montserrat', sans-serif";
  ctx.fillText(weekdayName, 288, 244);

  ctx.fillStyle = "#0072dc";
  ctx.font = "800 44px 'Montserrat', sans-serif";
  ctx.fillText(monthName, 298, 294);


  // Top-Right Subject SVG Icon
  const topIconKey = card.topRightIcon && SVG_CATALOG[card.topRightIcon] ? card.topRightIcon : 'phys_atom';
  const topIconImg = assets.svgImages[topIconKey];
  if (topIconImg) {
  ctx.drawImage(topIconImg, 614, 174, 152, 152);
}


  // 4. Chapter Banner (Pastel Green Rounded Pill)
  const chapY = 342;
  const chapH = 122;
  roundRectPath(ctx, 30, chapY, 740, chapH, 26);
  ctx.fillStyle = "#e3f9e1";
  ctx.fill();

  // Chapter Banner Left SVG Icon
  const chapIconKey = card.chapterIcon && SVG_CATALOG[card.chapterIcon] ? card.chapterIcon : 'phys_wave';
  const chapIconImg = assets.svgImages[chapIconKey];
  if (chapIconImg) {
  ctx.drawImage(chapIconImg, 48, chapY + 18, 154, 86);
}

  // Green Vertical Divider inside Chapter Banner
  roundRectPath(ctx, 216, chapY + 18, 4.5, 86, 2.25);
  ctx.fillStyle = "#168a1f";
  ctx.fill();

  // Chapter Title Text (Auto-scales font size if title is long)
  const chapTitle = card.chapterTitle || "Chapter 12: Atoms";
  ctx.fillStyle = "#061a40";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  let chapFontSize = 37;
  ctx.font = `800 ${chapFontSize}px 'Montserrat', sans-serif`;
  const maxChapTextW = 505;
  while (ctx.measureText(chapTitle).width > maxChapTextW && chapFontSize > 22) {
  chapFontSize -= 1;
  ctx.font = `800 ${chapFontSize}px 'Montserrat', sans-serif`;
}
  ctx.fillText(chapTitle, 244, chapY + chapH / 2 + 2);

  // 5. Subject Focus Box
  const subjY = 486;
  const subjH = 124;
  roundRectPath(ctx, 30, subjY, 740, subjH, 26);
  ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
  ctx.fill();
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = "#b5cadb";
  ctx.stroke();

  // Left Thick Green Pill Accent
  const accentColor = card.subjectColor || "#12871b";
  roundRectPath(ctx, 52, subjY + 14, 11, 96, 5.5);
  ctx.fillStyle = accentColor;
  ctx.fill();

  // "Subject Focus" Label
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#0072dc";
  ctx.font = "700 26px 'Montserrat', sans-serif";
  ctx.fillText(card.subjectLabel || "Subject Focus", 85, subjY + 42);

  // Subject Title ("PHYSICS")
  const subjectName = (card.subject || "PHYSICS").toUpperCase();
  let subjFontSize = 57;
  ctx.font = `900 ${subjFontSize}px 'Montserrat', sans-serif`;
  while (ctx.measureText(subjectName).width > 650 && subjFontSize > 34) {
  subjFontSize -= 2;
  ctx.font = `900 ${subjFontSize}px 'Montserrat', sans-serif`;
}
  ctx.fillStyle = accentColor;
  ctx.fillText(subjectName, 83, subjY + 100);

  // 6. Topics to Study Container
  const topicsY = 632;
  const topicsList = Array.isArray(card.topics) && card.topics.length > 0
  ? card.topics
  : ["Add topics in the JSON editor"];

  // Dynamically determine font size & row heights so 4–6 topics fit gracefully
  let topicFontSize = topicsList.length > 4 ? 22 : 24.5;
  const maxTopicTextWidth = 620;

  // Measure wrapped lines for each topic
  let wrappedTopics = topicsList.map((t) =>
  layoutRichTextLines(ctx, t, maxTopicTextWidth, topicFontSize)
  );

  // Calculate total height needed
  const rowPaddingY = topicsList.length > 4 ? 15 : 20;
  const lineHeight = topicFontSize * 1.32;

  let contentHeight = 0;
  const rowHeights = wrappedTopics.map((lines) => {
  const h = Math.max(36, lines.length * lineHeight) + rowPaddingY * 2;
  contentHeight += h;
  return h;
  });

  const topicsBoxH = Math.max(320, 78 + contentHeight + 10);

  // Outer Rounded Box
  roundRectPath(ctx, 30, topicsY, 740, topicsBoxH, 28);
  ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
  ctx.fill();
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = "#b5cadb";
  ctx.stroke();

  // Dark Blue Header Pill ("Topics to Study")
  roundRectPath(ctx, 41, topicsY + 11, 718, 60, 20);
  ctx.fillStyle = "#004080";
  ctx.fill();

  // Small Green Vertical Pill inside Header
  roundRectPath(ctx, 64, topicsY + 24, 7.5, 34, 3.75);
  ctx.fillStyle = "#25a22b";
  ctx.fill();

  // Header Text
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 32px 'Montserrat', sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(card.topicsHeader || "Topics to Study", 90, topicsY + 42);

  // Render Each Topic Row
  let currentRowY = topicsY + 78;
  wrappedTopics.forEach((lines, idx) => {
  const rH = rowHeights[idx];
  const centerY = currentRowY + rH / 2;

  // Rounded Square Checkbox on Left
  const boxSize = 35;
  roundRectPath(ctx, 52, centerY - boxSize / 2, boxSize, boxSize, 7.5);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.lineWidth = 2.8;
  ctx.strokeStyle = "#061a40";
  ctx.stroke();

  // Topic Rich Text Lines
  const totalTextBlockH = lines.length * lineHeight;
  let lineBaselineY = centerY - totalTextBlockH / 2 + topicFontSize * 0.84;

  lines.forEach((lineWordObjs) => {
    drawRichTextLine(ctx, lineWordObjs, 108, lineBaselineY, topicFontSize, "#061a40");
    lineBaselineY += lineHeight;
  });

  // Divider Line below (except last row)
  if (idx < wrappedTopics.length - 1) {
    ctx.beginPath();
    ctx.moveTo(48, currentRowY + rH);
    ctx.lineTo(752, currentRowY + rH);
    ctx.strokeStyle = "#d9e6f2";
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }

  currentRowY += rH;
  });

  ctx.restore();
}
