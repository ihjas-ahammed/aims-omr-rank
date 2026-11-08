import { SVG_CATALOG } from '../svgCatalog';
import type { BioIcon } from '../biology/bioIcons';

// Plus Two Physics chapter icons — same palette/stroke style as svgCatalog.ts. No <text> inside.
// Palette: Navy #061a40 | Blue #0072dc | Green #5cb85c / #168a1f | Mint #e3f9e1

const sparkle = (x: number, y: number, s = 1, fill = '#5cb85c') =>
  `<path d="M${x} ${y - 9 * s} L${x + 3 * s} ${y - 3 * s} L${x + 9 * s} ${y} L${x + 3 * s} ${y + 3 * s} L${x} ${y + 9 * s} L${x - 3 * s} ${y + 3 * s} L${x - 9 * s} ${y} L${x - 3 * s} ${y - 3 * s} Z" fill="${fill}"/>`;

export const PHY_ICONS: Record<string, BioIcon> = {
  // Ch 01: + and − charges with field lines between them
  phy_charges: {
    viewBox: '0 0 140 120',
    svg: `
      <g fill="none" stroke="#061a40" stroke-width="3.2" stroke-linecap="round">
        <path d="M44 40 C 60 10, 80 10, 96 40"/><path d="M50 50 C 62 34, 78 34, 90 50"/>
        <path d="M52 60 H88"/>
        <path d="M50 70 C 62 86, 78 86, 90 70"/><path d="M44 80 C 60 110, 80 110, 96 80"/>
      </g>
      <g fill="#061a40"><polygon points="94,36 84,36 92,28"/><polygon points="92,52 82,50 88,42"/><polygon points="92,60 83,55 83,65"/><polygon points="92,68 82,70 88,78"/><polygon points="94,84 84,84 92,92"/></g>
      <circle cx="30" cy="60" r="20" fill="#0072dc" stroke="#061a40" stroke-width="4"/>
      <path d="M20 60 H40 M30 50 V70" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
      <circle cx="110" cy="60" r="20" fill="#5cb85c" stroke="#061a40" stroke-width="4"/>
      <path d="M100 60 H120" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
      ${sparkle(122, 14, 0.8)}
    `
  },
  // Ch 02: parallel plate capacitor with field arrows and an equipotential
  phy_capacitor: {
    viewBox: '0 0 140 120',
    svg: `
      <rect x="20" y="22" width="100" height="14" rx="4" fill="#0072dc" stroke="#061a40" stroke-width="4"/>
      <rect x="20" y="84" width="100" height="14" rx="4" fill="#5cb85c" stroke="#061a40" stroke-width="4"/>
      <g stroke="#061a40" stroke-width="3.6" stroke-linecap="round"><path d="M44 42 V70"/><path d="M70 42 V70"/><path d="M96 42 V70"/></g>
      <g fill="#061a40"><polygon points="37,68 51,68 44,80"/><polygon points="63,68 77,68 70,80"/><polygon points="89,68 103,68 96,80"/></g>
      <path d="M22 60 H118" stroke="#0072dc" stroke-width="3" stroke-dasharray="6 5" stroke-linecap="round"/>
      <path d="M36 29 H46 M41 24 V34 M64 29 H74 M69 24 V34 M92 29 H102 M97 24 V34" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
      ${sparkle(124, 56, 0.8)}
    `
  },
  // Ch 03: circuit loop with cell, resistor and current arrow
  phy_current: {
    viewBox: '0 0 140 120',
    svg: `
      <path d="M24 92 H116 V28 H92 L86 40 L76 16 L66 40 L56 16 L50 28 H24 V50 M24 74 V92" fill="none" stroke="#061a40" stroke-width="4.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M12 50 H36" stroke="#5cb85c" stroke-width="6" stroke-linecap="round"/>
      <path d="M17 62 H31" stroke="#0072dc" stroke-width="6" stroke-linecap="round"/>
      <path d="M12 74 H36" stroke="#5cb85c" stroke-width="6" stroke-linecap="round"/>
      <polygon points="107,54 125,54 116,70" fill="#0072dc" stroke="#061a40" stroke-width="2.6" stroke-linejoin="round"/>
      <circle cx="70" cy="92" r="6" fill="#5cb85c" stroke="#061a40" stroke-width="3"/>
      ${sparkle(124, 100, 0.8)}
    `
  },
  // Ch 04: charge circling in a magnetic field (× marks)
  phy_moving: {
    viewBox: '0 0 140 120',
    svg: `
      <circle cx="70" cy="60" r="30" fill="#e3f9e1" stroke="#0072dc" stroke-width="4.5" stroke-dasharray="8 6"/>
      <g stroke="#061a40" stroke-width="3.4" stroke-linecap="round">
        <path d="M18 20 l8 8 m0 -8 l-8 8"/><path d="M114 20 l8 8 m0 -8 l-8 8"/><path d="M18 94 l8 8 m0 -8 l-8 8"/><path d="M114 94 l8 8 m0 -8 l-8 8"/><path d="M64 54 l12 12 m0 -12 l-12 12"/>
      </g>
      <path d="M100 56 V26" stroke="#061a40" stroke-width="4" stroke-linecap="round"/>
      <polygon points="92,32 108,32 100,16" fill="#061a40"/>
      <circle cx="100" cy="60" r="10" fill="#5cb85c" stroke="#061a40" stroke-width="3.6"/>
      <path d="M96 60 H104" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
    `
  },
  // Ch 05–07 revision: bar magnet over an AC sine wave
  phy_magnet_ac: {
    viewBox: '0 0 140 120',
    svg: `
      <path d="M26 30 C 34 6, 106 6, 114 30" fill="none" stroke="#0072dc" stroke-width="3" stroke-dasharray="5 4" stroke-linecap="round"/>
      <rect x="22" y="24" width="48" height="28" rx="6" fill="#0072dc" stroke="#061a40" stroke-width="4.2"/>
      <rect x="70" y="24" width="48" height="28" rx="6" fill="#5cb85c" stroke="#061a40" stroke-width="4.2"/>
      <path d="M30 38 H44 M37 31 V45" stroke="#ffffff" stroke-width="0" />
      <path d="M12 90 C 26 62, 40 62, 54 90 S 82 118, 96 90 S 124 62, 130 80" fill="none" stroke="#061a40" stroke-width="4.6" stroke-linecap="round"/>
      <path d="M10 90 H132" stroke="#061a40" stroke-width="2.4" stroke-dasharray="4 5" stroke-linecap="round"/>
      ${sparkle(124, 16, 0.8)}
    `
  },
  // Ch 08–10 revision: prism and rays (shared catalog icon)
  phy_optics: SVG_CATALOG.phys_optics,
  // Exam-day clipboard with a lightning bolt
  phy_exam: {
    viewBox: '0 0 140 120',
    svg: `
      <rect x="30" y="22" width="80" height="92" rx="10" fill="#ffffff" stroke="#061a40" stroke-width="4.8"/>
      <rect x="52" y="12" width="36" height="18" rx="6" fill="#0072dc" stroke="#061a40" stroke-width="4"/>
      <polygon points="76,42 54,76 68,76 62,100 88,64 74,64" fill="#5cb85c" stroke="#061a40" stroke-width="3.4" stroke-linejoin="round"/>
      ${sparkle(120, 34, 0.9)}
    `
  }
};

// Top-right badge: lightning bolt in a round badge.
export const PHY_HERO: BioIcon = {
  viewBox: '0 0 140 140',
  svg: `
    <circle cx="70" cy="70" r="58" fill="#e3f9e1" stroke="#061a40" stroke-width="5"/>
    <polygon points="80,22 46,78 68,78 58,118 96,58 74,58" fill="#0072dc" stroke="#061a40" stroke-width="4.2" stroke-linejoin="round"/>
    ${sparkle(112, 24, 1)}
    <circle cx="24" cy="34" r="4" fill="#5cb85c"/><circle cx="116" cy="108" r="3.5" fill="#0072dc"/>
  `
};
