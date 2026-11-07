import type { BioIcon } from '../biology/bioIcons';
import type { EventKind } from './calendar';

// Small icons for the calendar events in the poster footer (palette as in svgCatalog.ts, no <text>).
export const EVENT_ICONS: Record<EventKind, BioIcon> = {
  classes: {
    viewBox: '0 0 60 60',
    svg: `
      <path d="M16 8 V54" stroke="#061a40" stroke-width="5" stroke-linecap="round"/>
      <path d="M20 12 H48 L41 23 L48 34 H20 Z" fill="#5cb85c" stroke="#061a40" stroke-width="3.5" stroke-linejoin="round"/>
    `
  },
  lab: {
    viewBox: '0 0 60 60',
    svg: `
      <path d="M22 8 H38 M25 8 V24 L10 50 A4 4 0 0 0 14 56 H46 A4 4 0 0 0 50 50 L35 24 V8" fill="none" stroke="#061a40" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M17 42 H43 L48 50 A3 3 0 0 1 45 54 H15 A3 3 0 0 1 12 50 Z" fill="#0072dc" opacity="0.85"/>
      <circle cx="26" cy="46" r="2.6" fill="#ffffff"/><circle cx="35" cy="48" r="2" fill="#ffffff"/>
    `
  },
  assignment: {
    viewBox: '0 0 60 60',
    svg: `
      <rect x="12" y="6" width="36" height="48" rx="5" fill="#ffffff" stroke="#061a40" stroke-width="4"/>
      <path d="M20 20 H40 M20 29 H40 M20 38 H32" stroke="#0072dc" stroke-width="3.6" stroke-linecap="round"/>
      <path d="M36 44 L41 49 L52 36" fill="none" stroke="#5cb85c" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    `
  },
  openbook: {
    viewBox: '0 0 60 60',
    svg: `
      <path d="M6 14 C 16 10 25 12 30 18 V50 C 25 44 16 42 6 46 Z" fill="#ffffff" stroke="#061a40" stroke-width="3.8" stroke-linejoin="round"/>
      <path d="M54 14 C 44 10 35 12 30 18 V50 C 35 44 44 42 54 46 Z" fill="#e3f9e1" stroke="#061a40" stroke-width="3.8" stroke-linejoin="round"/>
      <path d="M12 24 C 17 22 21 23 25 26 M12 33 C 17 31 21 32 25 35 M35 26 C 39 23 43 22 48 24 M35 35 C 39 32 43 31 48 33" fill="none" stroke="#0072dc" stroke-width="2.6" stroke-linecap="round"/>
    `
  },
  exam: {
    viewBox: '0 0 60 60',
    svg: `
      <rect x="10" y="8" width="34" height="46" rx="5" fill="#ffffff" stroke="#061a40" stroke-width="4"/>
      <path d="M18 20 H36 M18 29 H36 M18 38 H27" stroke="#0072dc" stroke-width="3.4" stroke-linecap="round"/>
      <g transform="rotate(38 46 24)"><rect x="41" y="4" width="10" height="34" rx="2" fill="#5cb85c" stroke="#061a40" stroke-width="3"/><polygon points="41,38 51,38 46,48" fill="#e3f9e1" stroke="#061a40" stroke-width="2.8" stroke-linejoin="round"/></g>
    `
  },
  seminar: {
    viewBox: '0 0 60 60',
    svg: `
      <rect x="6" y="8" width="48" height="32" rx="4" fill="#ffffff" stroke="#061a40" stroke-width="4"/>
      <path d="M14 32 L24 22 L32 28 L46 16" fill="none" stroke="#0072dc" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M30 40 V54 M18 54 H42" stroke="#061a40" stroke-width="4" stroke-linecap="round"/>
      <circle cx="46" cy="16" r="3.4" fill="#5cb85c"/>
    `
  }
};
