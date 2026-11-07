// Extra subject icons for the AIMS class 10 revision poster (same palette/stroke style as svgCatalog.ts).
// No <text> inside — SVGs drawn through <img> cannot use the page's web fonts.

import type { BioIcon } from '../biology/bioIcons';

export const AIMS_ICONS: Record<string, BioIcon> = {
  history: {
    viewBox: '0 0 140 120',
    svg: `
      <polygon points="16,46 70,14 124,46" fill="#e3f9e1" stroke="#061a40" stroke-width="4.8" stroke-linejoin="round"/>
      <rect x="16" y="46" width="108" height="9" rx="2" fill="#0072dc" stroke="#061a40" stroke-width="3.5"/>
      <g fill="#ffffff" stroke="#061a40" stroke-width="4">
        <rect x="26" y="55" width="16" height="40"/><rect x="52" y="55" width="16" height="40"/>
        <rect x="78" y="55" width="16" height="40"/><rect x="104" y="55" width="16" height="40"/>
      </g>
      <rect x="10" y="95" width="120" height="12" rx="3" fill="#061a40"/>
      <circle cx="70" cy="34" r="5.5" fill="#5cb85c" stroke="#061a40" stroke-width="2.8"/>
    `
  },
  geography: {
    viewBox: '0 0 140 120',
    svg: `
      <circle cx="58" cy="62" r="42" fill="#0072dc" stroke="#061a40" stroke-width="5"/>
      <path d="M34 50 C 30 38 46 32 52 40 C 58 46 50 54 54 62 C 56 70 44 74 38 66 C 34 62 36 56 34 50 Z" fill="#5cb85c" stroke="#061a40" stroke-width="3" stroke-linejoin="round"/>
      <path d="M68 58 C 74 50 88 52 90 62 C 92 72 82 86 74 90 C 68 92 66 82 68 76 C 70 68 64 64 68 58 Z" fill="#5cb85c" stroke="#061a40" stroke-width="3" stroke-linejoin="round"/>
      <g fill="none" stroke="#ffffff" stroke-width="2.6" opacity="0.8">
        <ellipse cx="58" cy="62" rx="18" ry="42"/><line x1="16" y1="62" x2="100" y2="62"/>
      </g>
      <path d="M108 78 C 98 62 94 56 94 46 A14 14 0 1 1 122 46 C 122 56 118 62 108 78 Z" fill="#5cb85c" stroke="#061a40" stroke-width="4" stroke-linejoin="round"/>
      <circle cx="108" cy="46" r="5" fill="#ffffff" stroke="#061a40" stroke-width="2.5"/>
    `
  },
  english: {
    viewBox: '0 0 140 120',
    svg: `
      <path d="M16 44 C 34 38 54 40 68 50 V106 C 54 96 34 94 16 100 Z" fill="#ffffff" stroke="#061a40" stroke-width="4.6" stroke-linejoin="round"/>
      <path d="M124 44 C 106 38 86 40 72 50 V106 C 86 96 106 94 124 100 Z" fill="#e3f9e1" stroke="#061a40" stroke-width="4.6" stroke-linejoin="round"/>
      <g fill="none" stroke="#0072dc" stroke-width="3" stroke-linecap="round">
        <path d="M26 60 C 36 58 46 60 56 66"/><path d="M26 74 C 36 72 46 74 56 80"/>
        <path d="M84 66 C 94 60 104 58 114 60"/><path d="M84 80 C 94 74 104 72 114 74"/>
      </g>
      <g transform="rotate(32 98 24)">
        <rect x="92" y="2" width="12" height="36" rx="2" fill="#5cb85c" stroke="#061a40" stroke-width="3.4"/>
        <polygon points="92,38 104,38 98,50" fill="#e3f9e1" stroke="#061a40" stroke-width="3" stroke-linejoin="round"/>
      </g>
    `
  },
  book_blue: {
    viewBox: '0 0 60 60',
    svg: `
      <rect x="10" y="6" width="40" height="48" rx="6" fill="#0072dc" stroke="#061a40" stroke-width="3.5"/>
      <rect x="10" y="6" width="9" height="48" rx="4" fill="#061a40"/>
      <rect x="26" y="16" width="18" height="4" rx="2" fill="#ffffff" opacity="0.85"/>
      <rect x="26" y="26" width="14" height="4" rx="2" fill="#ffffff" opacity="0.6"/>
    `
  },
  book_green: {
    viewBox: '0 0 60 60',
    svg: `
      <rect x="10" y="6" width="40" height="48" rx="6" fill="#5cb85c" stroke="#061a40" stroke-width="3.5"/>
      <rect x="10" y="6" width="9" height="48" rx="4" fill="#061a40"/>
      <rect x="26" y="16" width="18" height="4" rx="2" fill="#ffffff" opacity="0.85"/>
      <rect x="26" y="26" width="14" height="4" rx="2" fill="#ffffff" opacity="0.6"/>
    `
  }
};
