import { SVG_CATALOG } from '../svgCatalog';
import type { BioIcon } from '../biology/bioIcons';

// Plus Two Mathematics chapter icons — same palette/stroke style as svgCatalog.ts. No <text> inside.
// Palette: Navy #061a40 | Blue #0072dc | Green #5cb85c / #168a1f | Mint #e3f9e1

const sparkle = (x: number, y: number, s = 1, fill = '#5cb85c') =>
  `<path d="M${x} ${y - 9 * s} L${x + 3 * s} ${y - 3 * s} L${x + 9 * s} ${y} L${x + 3 * s} ${y + 3 * s} L${x} ${y + 9 * s} L${x - 3 * s} ${y + 3 * s} L${x - 9 * s} ${y} L${x - 3 * s} ${y - 3 * s} Z" fill="${fill}"/>`;

export const MATH_ICONS: Record<string, BioIcon> = {
  // Ch 03: square brackets with four entries (shared catalog icon)
  math_matrix: SVG_CATALOG.math_matrix,
  // Ch 04: determinant bars with the two cross-multiplying diagonals
  math_determinant: {
    viewBox: '0 0 140 120',
    svg: `
      <path d="M28 18 V102 M112 18 V102" stroke="#061a40" stroke-width="5.5" stroke-linecap="round"/>
      <path d="M50 40 L90 80" stroke="#0072dc" stroke-width="4.2" stroke-linecap="round"/>
      <path d="M90 40 L50 80" stroke="#5cb85c" stroke-width="4.2" stroke-linecap="round" stroke-dasharray="6 6"/>
      <circle cx="50" cy="40" r="8" fill="#0072dc" stroke="#061a40" stroke-width="3.4"/>
      <circle cx="90" cy="80" r="8" fill="#0072dc" stroke="#061a40" stroke-width="3.4"/>
      <circle cx="90" cy="40" r="8" fill="#5cb85c" stroke="#061a40" stroke-width="3.4"/>
      <circle cx="50" cy="80" r="8" fill="#5cb85c" stroke="#061a40" stroke-width="3.4"/>
      ${sparkle(128, 14, 0.7)}
    `
  },
  // Ch 05: a smooth curve with its tangent line at a point
  math_continuity: {
    viewBox: '0 0 140 120',
    svg: `
      <path d="M16 104 H128 M24 112 V14" stroke="#061a40" stroke-width="4" stroke-linecap="round"/>
      <polygon points="24,8 18,20 30,20" fill="#061a40"/><polygon points="134,104 122,98 122,110" fill="#061a40"/>
      <path d="M30 88 C 52 86, 62 30, 84 34 S 108 70, 126 40" fill="none" stroke="#0072dc" stroke-width="4.8" stroke-linecap="round"/>
      <path d="M44 74 L88 22" stroke="#5cb85c" stroke-width="4" stroke-linecap="round"/>
      <circle cx="64" cy="51" r="7" fill="#ffffff" stroke="#061a40" stroke-width="3.6"/>
      ${sparkle(118, 16, 0.75)}
    `
  },
  // Ch 06: a curve with its maximum and minimum marked by flat tangents
  math_maxmin: {
    viewBox: '0 0 140 120',
    svg: `
      <path d="M16 104 H128 M24 112 V14" stroke="#061a40" stroke-width="4" stroke-linecap="round"/>
      <path d="M30 92 C 40 20, 62 20, 74 56 S 104 100, 124 30" fill="none" stroke="#0072dc" stroke-width="4.8" stroke-linecap="round"/>
      <path d="M34 34 H74" stroke="#5cb85c" stroke-width="4" stroke-linecap="round"/>
      <path d="M78 84 H116" stroke="#5cb85c" stroke-width="4" stroke-linecap="round"/>
      <circle cx="54" cy="34" r="7" fill="#5cb85c" stroke="#061a40" stroke-width="3.6"/>
      <circle cx="97" cy="84" r="7" fill="#ffffff" stroke="#061a40" stroke-width="3.6"/>
      <path d="M54 44 V104 M97 92 V104" stroke="#061a40" stroke-width="2.4" stroke-dasharray="4 5" stroke-linecap="round"/>
    `
  },
  // Ch 07: integral sign with a curve (shared catalog icon)
  math_integral: SVG_CATALOG.math_calculus,
  // Ch 08: shaded area under a curve between two limits
  math_area: {
    viewBox: '0 0 140 120',
    svg: `
      <path d="M46 100 V58 C 60 36, 78 30, 100 28 V100 Z" fill="#e3f9e1" stroke="#5cb85c" stroke-width="3.4" stroke-linejoin="round"/>
      <path d="M58 100 V46 M72 100 V37 M86 100 V31" stroke="#5cb85c" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M16 100 H128 M24 108 V14" stroke="#061a40" stroke-width="4" stroke-linecap="round"/>
      <path d="M28 88 C 50 40, 80 28, 126 26" fill="none" stroke="#0072dc" stroke-width="4.8" stroke-linecap="round"/>
      <circle cx="46" cy="100" r="5" fill="#061a40"/><circle cx="100" cy="100" r="5" fill="#061a40"/>
      ${sparkle(118, 58, 0.7, '#0072dc')}
    `
  },
  // Ch 09: a family of solution curves through a slope field
  math_diffeq: {
    viewBox: '0 0 140 120',
    svg: `
      <path d="M16 104 H128 M24 112 V14" stroke="#061a40" stroke-width="4" stroke-linecap="round"/>
      <g stroke="#5cb85c" stroke-width="3" stroke-linecap="round">
        <path d="M38 90 l10 -3"/><path d="M62 90 l10 -5"/><path d="M86 90 l9 -8"/><path d="M110 90 l7 -10"/>
        <path d="M38 24 l10 -3"/><path d="M62 22 l10 -5"/>
      </g>
      <path d="M32 78 C 62 74, 96 62, 124 22" fill="none" stroke="#0072dc" stroke-width="4.8" stroke-linecap="round"/>
      <path d="M32 58 C 56 54, 82 44, 100 18" fill="none" stroke="#061a40" stroke-width="3.6" stroke-linecap="round" stroke-dasharray="7 6"/>
      <circle cx="78" cy="61" r="6.5" fill="#ffffff" stroke="#061a40" stroke-width="3.4"/>
    `
  },
  // Exam-day clipboard with a tick
  math_exam: {
    viewBox: '0 0 140 120',
    svg: `
      <rect x="30" y="22" width="80" height="92" rx="10" fill="#ffffff" stroke="#061a40" stroke-width="4.8"/>
      <rect x="52" y="12" width="36" height="18" rx="6" fill="#5cb85c" stroke="#061a40" stroke-width="4"/>
      <path d="M46 50 H94 M46 66 H78" stroke="#0072dc" stroke-width="4.4" stroke-linecap="round"/>
      <path d="M52 88 L64 100 L90 76" fill="none" stroke="#168a1f" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
      ${sparkle(122, 36, 0.9, '#0072dc')}
    `
  }
};
