import { SVG_CATALOG } from '../svgCatalog';
import type { BioIcon } from '../biology/bioIcons';

// One icon per subject, same palette/stroke style as svgCatalog.ts. No <text> (SVGs drawn via <img> can't use web fonts).

const sparkle = (x: number, y: number, s = 1, fill = '#5cb85c') =>
  `<path d="M${x} ${y - 9 * s} L${x + 3 * s} ${y - 3 * s} L${x + 9 * s} ${y} L${x + 3 * s} ${y + 3 * s} L${x} ${y + 9 * s} L${x - 3 * s} ${y + 3 * s} L${x - 9 * s} ${y} L${x - 3 * s} ${y - 3 * s} Z" fill="${fill}"/>`;

// Pointy-top hexagon outline points
const hex = (cx: number, cy: number, r: number) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(' ');

const HEX_R = 21;
const HEX_W = Math.sqrt(3) * HEX_R;
const HEXES: [number, number][] = [
  [48, 46],
  [48 + HEX_W, 46],
  [48 + HEX_W / 2, 46 + HEX_R * 1.5]
];
const hexVertices = HEXES.flatMap(([cx, cy]) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return [cx + HEX_R * Math.cos(a), cy + HEX_R * Math.sin(a)] as [number, number];
  })
);

export const FYUG_ICONS: Record<string, BioIcon> = {
  thermo: SVG_CATALOG.phys_thermo,
  nuclear: SVG_CATALOG.phys_atom,
  // Electronics–II: op-amp triangle with + / − inputs
  electronics: {
    viewBox: '0 0 140 120',
    svg: `
      <path d="M8 38 H36 M8 82 H36 M110 60 H134 M72 28 V8 M72 92 V112" fill="none" stroke="#061a40" stroke-width="5" stroke-linecap="round"/>
      <polygon points="36,14 36,106 110,60" fill="#e3edfd" stroke="#061a40" stroke-width="5.5" stroke-linejoin="round"/>
      <path d="M44 38 H58 M51 31 V45" stroke="#0072dc" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M44 82 H58" stroke="#5cb85c" stroke-width="4.5" stroke-linecap="round"/>
      <circle cx="8" cy="38" r="5.5" fill="#0072dc"/><circle cx="8" cy="82" r="5.5" fill="#5cb85c"/><circle cx="134" cy="60" r="5.5" fill="#061a40"/>
    `
  },
  // Electrical and Photovoltaic Devices: sun + solar panel
  electrical: {
    viewBox: '0 0 140 120',
    svg: `
      <g stroke="#061a40" stroke-width="3.5" stroke-linecap="round">
        <path d="M30 4 V10 M30 50 V56 M4 30 H10 M50 30 H56 M12 12 L16 16 M44 44 L48 48 M48 12 L44 16 M16 44 L12 48"/>
      </g>
      <circle cx="30" cy="30" r="13" fill="#f5c542" stroke="#061a40" stroke-width="3.8"/>
      <path d="M44 58 H128 L116 110 H30 Z" fill="#0072dc" stroke="#061a40" stroke-width="4.8" stroke-linejoin="round"/>
      <path d="M38 84 H122 M66 58 L60 110 M92 58 L88 110" stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round"/>
      ${sparkle(124, 22, 0.9)}
    `
  },
  // Nanoscience and Nanotechnology: graphene-style hexagon lattice with atoms
  nano: {
    viewBox: '0 0 140 120',
    svg: `
      ${HEXES.map(([cx, cy], i) => `<polygon points="${hex(cx, cy, HEX_R)}" fill="${i === 2 ? '#e3f6e8' : '#ffffff'}" stroke="#061a40" stroke-width="4" stroke-linejoin="round"/>`).join('')}
      ${hexVertices.map(([x, y], i) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.6" fill="${i % 3 === 0 ? '#0072dc' : i % 3 === 1 ? '#5cb85c' : '#061a40'}"/>`).join('')}
      <circle cx="118" cy="34" r="9" fill="#0072dc" stroke="#061a40" stroke-width="3.2"/>
      <circle cx="124" cy="62" r="6" fill="#5cb85c" stroke="#061a40" stroke-width="3"/>
      <circle cx="110" cy="92" r="4" fill="#061a40"/>
      ${sparkle(24, 100, 0.8)}
    `
  },
  // Optoelectronics and Semiconductor Devices: LED diode emitting light
  opto: {
    viewBox: '0 0 140 120',
    svg: `
      <path d="M8 74 H38 M94 74 H132" fill="none" stroke="#061a40" stroke-width="5" stroke-linecap="round"/>
      <polygon points="38,46 38,102 90,74" fill="#e3f6e8" stroke="#061a40" stroke-width="5.5" stroke-linejoin="round"/>
      <path d="M94 44 V104" stroke="#061a40" stroke-width="6" stroke-linecap="round"/>
      <g stroke="#5cb85c" stroke-width="5" stroke-linecap="round">
        <path d="M58 38 L84 12"/><path d="M80 44 L108 18"/>
      </g>
      <polygon points="90,6 76,10 86,20" fill="#5cb85c"/><polygon points="114,12 100,16 110,26" fill="#5cb85c"/>
      <circle cx="8" cy="74" r="5.5" fill="#0072dc"/><circle cx="132" cy="74" r="5.5" fill="#061a40"/>
    `
  }
};

// Top-right badge: atom orbits in a round badge.
export const FYUG_HERO: BioIcon = {
  viewBox: '0 0 140 140',
  svg: `
    <circle cx="70" cy="70" r="58" fill="#e3edfd" stroke="#061a40" stroke-width="5"/>
    <g transform="translate(70 70)" fill="none" stroke="#061a40" stroke-width="3.6">
      <ellipse rx="14" ry="38" transform="rotate(20)"/><ellipse rx="14" ry="38" transform="rotate(80)"/><ellipse rx="14" ry="38" transform="rotate(140)"/>
    </g>
    <circle cx="70" cy="70" r="8" fill="#0072dc"/>
    ${sparkle(112, 22, 1)}
    <circle cx="22" cy="30" r="4" fill="#0072dc"/>
  `
};
