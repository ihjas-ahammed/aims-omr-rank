import { SVG_CATALOG } from '../svgCatalog';
import type { BioIcon } from '../biology/bioIcons';

// Computer Science chapter icons, same palette/stroke style as svgCatalog.ts.
// Palette: Navy #061a40 | Blue #0072dc | Green #5cb85c / #168a1f | Mint #e3f9e1
// No <text>: SVGs drawn through <img> cannot use the page's web fonts, so digits/letters are built from shapes.

const sparkle = (x: number, y: number, s = 1, fill = '#5cb85c') =>
  `<path d="M${x} ${y - 9 * s} L${x + 3 * s} ${y - 3 * s} L${x + 9 * s} ${y} L${x + 3 * s} ${y + 3 * s} L${x} ${y + 9 * s} L${x - 3 * s} ${y + 3 * s} L${x - 9 * s} ${y} L${x - 3 * s} ${y - 3 * s} Z" fill="${fill}"/>`;

export const CS_ICONS: Record<string, BioIcon> = {
  // Chapter 02 (1): "1 0 1" binary digits
  cs_binary: {
    viewBox: '0 0 140 120',
    svg: `
      <path d="M24 38 L38 26 V84" fill="none" stroke="#061a40" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
      <ellipse cx="70" cy="55" rx="15" ry="28" fill="none" stroke="#0072dc" stroke-width="9"/>
      <path d="M92 38 L106 26 V84" fill="none" stroke="#061a40" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
      <g fill="#5cb85c"><rect x="22" y="98" width="14" height="8" rx="3"/><rect x="63" y="98" width="14" height="8" rx="3"/><rect x="99" y="98" width="14" height="8" rx="3"/></g>
      ${sparkle(124, 20, 0.9)}
    `
  },
  // Chapter 02 (2): AND gate
  cs_gate: {
    viewBox: '0 0 140 120',
    svg: `
      <path d="M12 44 H38 M12 76 H38 M98 60 H128" fill="none" stroke="#061a40" stroke-width="5" stroke-linecap="round"/>
      <path d="M38 22 H62 A38 38 0 0 1 62 98 H38 Z" fill="#e3f9e1" stroke="#061a40" stroke-width="5.5" stroke-linejoin="round"/>
      <circle cx="12" cy="44" r="6" fill="#0072dc"/><circle cx="12" cy="76" r="6" fill="#5cb85c"/><circle cx="128" cy="60" r="6" fill="#061a40"/>
      ${sparkle(120, 20, 0.8)}
    `
  },
  // Chapter 03 (1): processor chip (from the shared catalog)
  cs_chip: SVG_CATALOG.cs_cpu,
  // Chapter 03 (2): monitor with code lines + green leaf (e-waste / green computing)
  cs_software: {
    viewBox: '0 0 140 120',
    svg: `
      <rect x="14" y="14" width="102" height="70" rx="9" fill="#ffffff" stroke="#061a40" stroke-width="5"/>
      <rect x="14" y="14" width="102" height="16" rx="9" fill="#0072dc" stroke="#061a40" stroke-width="5"/>
      <g fill="#ffffff"><circle cx="26" cy="22" r="3"/><circle cx="36" cy="22" r="3"/></g>
      <g stroke="#061a40" stroke-width="4" stroke-linecap="round"><path d="M28 46 H62"/><path d="M28 58 H84"/><path d="M28 70 H52"/></g>
      <path d="M52 84 V100 M80 84 V100 M38 102 H94" fill="none" stroke="#061a40" stroke-width="5" stroke-linecap="round"/>
      <path d="M96 112 C 90 96 100 80 124 78 C 126 98 114 112 96 112 Z" fill="#5cb85c" stroke="#061a40" stroke-width="3.6" stroke-linejoin="round"/>
      <path d="M98 108 L118 86" stroke="#061a40" stroke-width="2.6" stroke-linecap="round"/>
    `
  },
  // Chapter 04: flowchart
  cs_flowchart: {
    viewBox: '0 0 140 120',
    svg: `
      <path d="M56 22 V32 M56 74 V86 M82 54 H100" fill="none" stroke="#061a40" stroke-width="4.5" stroke-linecap="round"/>
      <rect x="32" y="6" width="48" height="18" rx="9" fill="#0072dc" stroke="#061a40" stroke-width="4"/>
      <polygon points="56,32 82,54 56,76 30,54" fill="#e3f9e1" stroke="#061a40" stroke-width="4.5" stroke-linejoin="round"/>
      <rect x="34" y="86" width="44" height="22" rx="5" fill="#5cb85c" stroke="#061a40" stroke-width="4"/>
      <rect x="100" y="42" width="30" height="24" rx="5" fill="#ffffff" stroke="#061a40" stroke-width="4"/>
      ${sparkle(120, 90, 0.9)}
    `
  },
  // Chapter 01: code brackets (shared catalog icon)
  cs_code: SVG_CATALOG.cs_code,
  // Chapter 04: Python as an S-shaped snake with a tongue
  cs_python: {
    viewBox: '0 0 140 120',
    svg: `
      <path d="M104 30 C 104 8, 36 8, 36 38 C 36 62, 104 56, 104 82 C 104 108, 36 108, 36 90" fill="none" stroke="#061a40" stroke-width="22" stroke-linecap="round"/>
      <path d="M104 30 C 104 8, 36 8, 36 38 C 36 62, 104 56, 104 82 C 104 108, 36 108, 36 90" fill="none" stroke="#0072dc" stroke-width="14" stroke-linecap="round" stroke-dasharray="30 12"/>
      <circle cx="104" cy="30" r="15" fill="#5cb85c" stroke="#061a40" stroke-width="4.5"/>
      <circle cx="109" cy="25" r="4" fill="#ffffff"/><circle cx="110" cy="25" r="2" fill="#061a40"/>
      <path d="M118 36 L132 42 M118 36 L130 28" stroke="#d33a3a" stroke-width="3.2" stroke-linecap="round"/>
      ${sparkle(24, 22, 0.9)}
    `
  },
  // Chapter 05: C++ built from shapes
  cs_cpp: {
    viewBox: '0 0 140 120',
    svg: `
      <path d="M64 30 A32 32 0 1 0 64 90" fill="none" stroke="#061a40" stroke-width="12" stroke-linecap="round"/>
      <path d="M82 60 H102 M92 50 V70" stroke="#0072dc" stroke-width="7" stroke-linecap="round"/>
      <path d="M110 60 H130 M120 50 V70" stroke="#5cb85c" stroke-width="7" stroke-linecap="round"/>
      ${sparkle(120, 20, 0.9)}
    `
  },
  // Revision: clipboard with </> code brackets
  cs_revision: {
    viewBox: '0 0 140 120',
    svg: `
      <rect x="30" y="22" width="80" height="92" rx="10" fill="#ffffff" stroke="#061a40" stroke-width="4.8"/>
      <rect x="52" y="12" width="36" height="18" rx="6" fill="#0072dc" stroke="#061a40" stroke-width="4"/>
      <path d="M56 56 L42 70 L56 84 M84 56 L98 70 L84 84" fill="none" stroke="#061a40" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M74 54 L66 88" stroke="#0072dc" stroke-width="5" stroke-linecap="round"/>
      <path d="M44 102 H96" stroke="#5cb85c" stroke-width="4" stroke-linecap="round"/>
      ${sparkle(120, 34, 0.9)}
    `
  }
};

// Top-right hero artwork: laptop in a round badge.
export const CS_HERO: BioIcon = {
  viewBox: '0 0 140 140',
  svg: `
    <circle cx="70" cy="70" r="58" fill="#e3f9e1" stroke="#061a40" stroke-width="5"/>
    <rect x="36" y="40" width="68" height="46" rx="6" fill="#061a40"/>
    <g stroke="#5cb85c" stroke-width="4" stroke-linecap="round"><path d="M46 54 H70"/><path d="M46 64 H82" stroke="#0072dc"/><path d="M46 74 H62"/></g>
    <path d="M26 92 H114 L106 102 H34 Z" fill="#0072dc" stroke="#061a40" stroke-width="4" stroke-linejoin="round"/>
    ${sparkle(112, 22, 1)}
    <circle cx="22" cy="30" r="4" fill="#0072dc"/>
  `
};
