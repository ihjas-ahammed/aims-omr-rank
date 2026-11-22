import { SVG_CATALOG } from '../svgCatalog';
import type { BioIcon } from '../biology/bioIcons';

// Plus Two Chemistry chapter icons — same palette/stroke style as svgCatalog.ts. No <text> inside.
// Palette: Navy #061a40 | Blue #0072dc | Green #5cb85c / #168a1f | Mint #e3f9e1

const sparkle = (x: number, y: number, s = 1, fill = '#5cb85c') =>
  `<path d="M${x} ${y - 9 * s} L${x + 3 * s} ${y - 3 * s} L${x + 9 * s} ${y} L${x + 3 * s} ${y + 3 * s} L${x} ${y + 9 * s} L${x - 3 * s} ${y + 3 * s} L${x - 9 * s} ${y} L${x - 3 * s} ${y - 3 * s} Z" fill="${fill}"/>`;

export const CHEM_ICONS: Record<string, BioIcon> = {
  // Ch 01: beaker of solution with dissolved particles
  chem_solutions: {
    viewBox: '0 0 140 120',
    svg: `
      <path d="M34 54 H106 L102 100 A8 8 0 0 1 94 108 H46 A8 8 0 0 1 38 100 Z" fill="#e1effc"/>
      <path d="M30 18 V100 A10 10 0 0 0 40 110 H100 A10 10 0 0 0 110 100 V18" fill="none" stroke="#061a40" stroke-width="4.8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M24 18 H116" stroke="#061a40" stroke-width="4.8" stroke-linecap="round"/>
      <path d="M34 54 Q52 47 70 54 T106 54" fill="none" stroke="#0072dc" stroke-width="3.6" stroke-linecap="round"/>
      <circle cx="52" cy="76" r="6" fill="#0072dc" stroke="#061a40" stroke-width="3"/>
      <circle cx="80" cy="88" r="6" fill="#5cb85c" stroke="#061a40" stroke-width="3"/>
      <circle cx="86" cy="68" r="4.5" fill="#0072dc"/>
      <circle cx="62" cy="96" r="4" fill="#5cb85c"/>
      <path d="M44 36 H60 M44 28 H52" stroke="#061a40" stroke-width="3" stroke-linecap="round"/>
      ${sparkle(122, 44, 0.8)}
    `
  },
  // Ch 02: electrochemical cell (shared catalog icon)
  chem_electro: SVG_CATALOG.chem_electro,
  // Ch 03: stopwatch with a falling concentration curve
  chem_kinetics: {
    viewBox: '0 0 140 120',
    svg: `
      <circle cx="68" cy="68" r="42" fill="#ffffff" stroke="#061a40" stroke-width="4.8"/>
      <rect x="58" y="12" width="20" height="10" rx="3" fill="#0072dc" stroke="#061a40" stroke-width="3.4"/>
      <path d="M68 22 V28" stroke="#061a40" stroke-width="4" stroke-linecap="round"/>
      <path d="M100 38 L108 30" stroke="#061a40" stroke-width="4.6" stroke-linecap="round"/>
      <path d="M44 88 H92 M48 92 V48" stroke="#061a40" stroke-width="3" stroke-linecap="round"/>
      <path d="M50 54 C 56 78, 70 82, 90 84" fill="none" stroke="#0072dc" stroke-width="4.4" stroke-linecap="round"/>
      <circle cx="56" cy="68" r="5" fill="#5cb85c" stroke="#061a40" stroke-width="2.8"/>
      ${sparkle(120, 88, 0.8)}
    `
  },
  // Ch 04: block of transition-metal cells, a few highlighted
  chem_dblock: {
    viewBox: '0 0 140 120',
    svg: `
      <g stroke="#061a40" stroke-width="3.4" stroke-linejoin="round">
        <rect x="16" y="14" width="20" height="20" rx="4" fill="#ffffff"/><rect x="40" y="14" width="20" height="20" rx="4" fill="#0072dc"/>
        <rect x="64" y="14" width="20" height="20" rx="4" fill="#ffffff"/><rect x="88" y="14" width="20" height="20" rx="4" fill="#5cb85c"/><rect x="112" y="14" width="20" height="20" rx="4" fill="#ffffff"/>
        <rect x="16" y="38" width="20" height="20" rx="4" fill="#5cb85c"/><rect x="40" y="38" width="20" height="20" rx="4" fill="#ffffff"/>
        <rect x="64" y="38" width="20" height="20" rx="4" fill="#0072dc"/><rect x="88" y="38" width="20" height="20" rx="4" fill="#ffffff"/><rect x="112" y="38" width="20" height="20" rx="4" fill="#0072dc"/>
      </g>
      <g stroke="#061a40" stroke-width="3.4" stroke-linejoin="round" fill="#e3f9e1">
        <rect x="28" y="72" width="16" height="16" rx="3"/><rect x="48" y="72" width="16" height="16" rx="3"/><rect x="68" y="72" width="16" height="16" rx="3"/><rect x="88" y="72" width="16" height="16" rx="3"/>
        <rect x="28" y="94" width="16" height="16" rx="3"/><rect x="48" y="94" width="16" height="16" rx="3"/><rect x="68" y="94" width="16" height="16" rx="3"/><rect x="88" y="94" width="16" height="16" rx="3"/>
      </g>
      ${sparkle(122, 92, 0.9)}
    `
  },
  // Ch 05: metal centre with six ligands (octahedral)
  chem_coordination: {
    viewBox: '0 0 140 120',
    svg: `
      <g stroke="#061a40" stroke-width="4.4" stroke-linecap="round">
        <path d="M70 60 V14 M70 60 V106 M70 60 L22 40 M70 60 L118 80 M70 60 L22 82 M70 60 L118 38"/>
      </g>
      <path d="M70 14 L22 40 L22 82 L70 106 L118 80 L118 38 Z" fill="none" stroke="#0072dc" stroke-width="2.6" stroke-dasharray="6 6" stroke-linejoin="round"/>
      <circle cx="70" cy="14" r="10" fill="#0072dc" stroke="#061a40" stroke-width="3.6"/>
      <circle cx="70" cy="106" r="10" fill="#0072dc" stroke="#061a40" stroke-width="3.6"/>
      <circle cx="22" cy="40" r="10" fill="#5cb85c" stroke="#061a40" stroke-width="3.6"/>
      <circle cx="22" cy="82" r="10" fill="#5cb85c" stroke="#061a40" stroke-width="3.6"/>
      <circle cx="118" cy="38" r="10" fill="#5cb85c" stroke="#061a40" stroke-width="3.6"/>
      <circle cx="118" cy="80" r="10" fill="#5cb85c" stroke="#061a40" stroke-width="3.6"/>
      <circle cx="70" cy="60" r="16" fill="#061a40"/>
      <circle cx="64" cy="54" r="4" fill="#ffffff" opacity="0.6"/>
    `
  },
  // Ch 06: carbon chain with a halogen leaving (curved arrow)
  chem_haloalkane: {
    viewBox: '0 0 140 120',
    svg: `
      <path d="M14 84 L38 62 L62 84 L86 62" fill="none" stroke="#061a40" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="14" cy="84" r="7" fill="#0072dc" stroke="#061a40" stroke-width="3"/>
      <circle cx="38" cy="62" r="9" fill="#061a40"/><circle cx="62" cy="84" r="9" fill="#061a40"/><circle cx="86" cy="62" r="9" fill="#061a40"/>
      <path d="M95 60 H108" stroke="#061a40" stroke-width="4" stroke-linecap="round" stroke-dasharray="3 6"/>
      <circle cx="120" cy="60" r="14" fill="#5cb85c" stroke="#061a40" stroke-width="4"/>
      <path d="M44 34 C 62 8, 106 8, 118 38" fill="none" stroke="#0072dc" stroke-width="4" stroke-linecap="round"/>
      <polygon points="122,44 110,40 120,32" fill="#0072dc"/>
      ${sparkle(22, 30, 0.8)}
    `
  },
  // Exam-day clipboard with a flask
  chem_exam: {
    viewBox: '0 0 140 120',
    svg: `
      <rect x="30" y="22" width="80" height="92" rx="10" fill="#ffffff" stroke="#061a40" stroke-width="4.8"/>
      <rect x="52" y="12" width="36" height="18" rx="6" fill="#7c3aed" stroke="#061a40" stroke-width="4"/>
      <path d="M62 44 V62 L48 90 A5 5 0 0 0 52 98 H88 A5 5 0 0 0 92 90 L78 62 V44" fill="#e1effc" stroke="#061a40" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M58 44 H82" stroke="#061a40" stroke-width="3.8" stroke-linecap="round"/>
      <circle cx="66" cy="84" r="3.6" fill="#0072dc"/><circle cx="76" cy="78" r="3" fill="#5cb85c"/>
      ${sparkle(122, 34, 0.9)}
    `
  }
};
