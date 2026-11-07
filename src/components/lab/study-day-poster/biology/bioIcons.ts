// Chapter icons for the biology poster, in the same palette/stroke style as svgCatalog.ts.
// Palette: Navy #061a40 | Blue #0072dc | Green #5cb85c / #168a1f | Mint #e3f9e1
// NOTE: no <text> here — SVGs rasterised via <img> cannot use the page's web fonts.

export interface BioIcon {
  viewBox: string;
  svg: string;
}

const sparkle = (x: number, y: number, s = 1, fill = '#5cb85c') =>
  `<path d="M${x} ${y - 9 * s} L${x + 3 * s} ${y - 3 * s} L${x + 9 * s} ${y} L${x + 3 * s} ${y + 3 * s} L${x} ${y + 9 * s} L${x - 3 * s} ${y + 3 * s} L${x - 9 * s} ${y} L${x - 3 * s} ${y - 3 * s} Z" fill="${fill}"/>`;

export const BIO_ICONS: Record<string, BioIcon> = {
  // ---------- BOTANY ----------
  bio_classification: {
    viewBox: '0 0 140 120',
    svg: `
      <path d="M26 60 H50 M50 16 V104 M50 16 H100 M50 38 H100 M50 60 H100 M50 82 H100 M50 104 H100" fill="none" stroke="#061a40" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="18" cy="60" r="10" fill="#061a40"/>
      <circle cx="112" cy="16" r="9" fill="#0072dc" stroke="#061a40" stroke-width="3"/>
      <circle cx="112" cy="38" r="9" fill="#5cb85c" stroke="#061a40" stroke-width="3"/>
      <circle cx="112" cy="60" r="9" fill="#e3f9e1" stroke="#061a40" stroke-width="3"/>
      <circle cx="112" cy="82" r="9" fill="#5cb85c" stroke="#061a40" stroke-width="3"/>
      <circle cx="112" cy="104" r="9" fill="#0072dc" stroke="#061a40" stroke-width="3"/>
    `
  },
  bio_plant_kingdom: {
    viewBox: '0 0 140 120',
    svg: `
      <line x1="20" y1="108" x2="120" y2="108" stroke="#061a40" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M70 108 C 64 80 76 50 70 14" fill="none" stroke="#168a1f" stroke-width="5" stroke-linecap="round"/>
      <g stroke="#5cb85c" stroke-width="6" stroke-linecap="round">
        <line x1="68" y1="96" x2="36" y2="84"/><line x1="72" y1="96" x2="104" y2="84"/>
        <line x1="68" y1="78" x2="40" y2="66"/><line x1="72" y1="78" x2="100" y2="66"/>
        <line x1="68" y1="60" x2="46" y2="48"/><line x1="72" y1="60" x2="94" y2="48"/>
        <line x1="69" y1="42" x2="54" y2="32"/><line x1="71" y1="42" x2="86" y2="32"/>
      </g>
      <circle cx="70" cy="12" r="5" fill="#0072dc" stroke="#061a40" stroke-width="3"/>
      <circle cx="26" cy="98" r="5" fill="#0072dc"/><circle cx="112" cy="98" r="4" fill="#0072dc"/>
      ${sparkle(114, 30, 0.9)}
    `
  },
  bio_flower: {
    viewBox: '0 0 140 120',
    svg: `
      <path d="M70 86 C 73 98 67 106 70 116" fill="none" stroke="#168a1f" stroke-width="5" stroke-linecap="round"/>
      <path d="M70 102 C 92 90 110 94 114 100 C 102 114 82 114 70 102 Z" fill="#5cb85c" stroke="#061a40" stroke-width="3.5" stroke-linejoin="round"/>
      <g transform="translate(70 46)" fill="#ffffff" stroke="#061a40" stroke-width="4">
        <ellipse cx="0" cy="-22" rx="12" ry="17"/>
        <ellipse cx="0" cy="-22" rx="12" ry="17" transform="rotate(72)"/>
        <ellipse cx="0" cy="-22" rx="12" ry="17" transform="rotate(144)"/>
        <ellipse cx="0" cy="-22" rx="12" ry="17" transform="rotate(216)"/>
        <ellipse cx="0" cy="-22" rx="12" ry="17" transform="rotate(288)"/>
      </g>
      <circle cx="70" cy="46" r="11" fill="#0072dc" stroke="#061a40" stroke-width="3.5"/>
      ${sparkle(120, 24, 0.9)}
      <circle cx="22" cy="40" r="3.5" fill="#0072dc"/>
    `
  },
  bio_stem_anatomy: {
    viewBox: '0 0 140 120',
    svg: `
      <circle cx="70" cy="60" r="48" fill="#e3f9e1" stroke="#061a40" stroke-width="5"/>
      <circle cx="70" cy="60" r="41" fill="none" stroke="#5cb85c" stroke-width="3" stroke-dasharray="6 4"/>
      <g fill="#0072dc" stroke="#061a40" stroke-width="3">
        <circle cx="70" cy="34" r="8"/><circle cx="92.5" cy="47" r="8"/><circle cx="92.5" cy="73" r="8"/>
        <circle cx="70" cy="86" r="8"/><circle cx="47.5" cy="73" r="8"/><circle cx="47.5" cy="47" r="8"/>
      </g>
      <g fill="#5cb85c">
        <circle cx="70" cy="30" r="3"/><circle cx="96" cy="45" r="3"/><circle cx="96" cy="75" r="3"/>
        <circle cx="70" cy="90" r="3"/><circle cx="44" cy="75" r="3"/><circle cx="44" cy="45" r="3"/>
      </g>
      <circle cx="70" cy="60" r="9" fill="#ffffff" stroke="#061a40" stroke-width="3"/>
    `
  },
  bio_cell_unit: {
    viewBox: '0 0 140 120',
    svg: `
      <circle cx="70" cy="60" r="50" fill="#e3f9e1" stroke="#061a40" stroke-width="5"/>
      <circle cx="60" cy="52" r="17" fill="#0072dc" stroke="#061a40" stroke-width="4"/>
      <circle cx="65" cy="47" r="5.5" fill="#061a40"/>
      <ellipse cx="98" cy="74" rx="15" ry="8.5" transform="rotate(-30 98 74)" fill="#5cb85c" stroke="#061a40" stroke-width="3"/>
      <path d="M89 78 q4 -7 8 0 t8 -2" fill="none" stroke="#061a40" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M32 82 q6 -9 12 0 t12 0 t12 0" fill="none" stroke="#061a40" stroke-width="3.2" stroke-linecap="round"/>
      <g fill="#061a40"><circle cx="90" cy="38" r="2.8"/><circle cx="100" cy="46" r="2.8"/><circle cx="84" cy="30" r="2.8"/></g>
    `
  },
  bio_cell_division: {
    viewBox: '0 0 140 120',
    svg: `
      <path d="M26 60 A44 44 0 0 1 66 17" fill="none" stroke="#0072dc" stroke-width="7" stroke-linecap="round"/>
      <polygon points="62,5 82,17 62,29" fill="#0072dc"/>
      <path d="M114 60 A44 44 0 0 1 74 103" fill="none" stroke="#5cb85c" stroke-width="7" stroke-linecap="round"/>
      <polygon points="78,91 58,103 78,115" fill="#5cb85c"/>
      <circle cx="70" cy="60" r="19" fill="#e3f9e1" stroke="#061a40" stroke-width="4.5"/>
      <circle cx="70" cy="60" r="7.5" fill="#061a40"/>
      ${sparkle(122, 18, 0.8)}
    `
  },
  bio_botany_revision: {
    viewBox: '0 0 140 120',
    svg: `
      <rect x="30" y="22" width="80" height="92" rx="10" fill="#ffffff" stroke="#061a40" stroke-width="4.8"/>
      <rect x="52" y="12" width="36" height="18" rx="6" fill="#0072dc" stroke="#061a40" stroke-width="4"/>
      <path d="M48 78 C 44 52 66 40 90 44 C 92 66 72 86 48 78 Z" fill="#5cb85c" stroke="#061a40" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M50 76 L82 50" stroke="#061a40" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M44 98 H96" stroke="#0072dc" stroke-width="4" stroke-linecap="round"/>
      ${sparkle(120, 34, 0.9)}
    `
  },

  // ---------- ZOOLOGY ----------
  bio_living_world: {
    viewBox: '0 0 140 120',
    svg: `
      <circle cx="70" cy="72" r="42" fill="#0072dc" stroke="#061a40" stroke-width="5"/>
      <path d="M44 56 C 40 44 56 38 62 46 C 68 52 60 60 64 68 C 66 76 54 80 48 72 C 44 68 46 62 44 56 Z" fill="#5cb85c" stroke="#061a40" stroke-width="3" stroke-linejoin="round"/>
      <path d="M80 62 C 86 54 100 56 102 66 C 104 76 94 90 86 94 C 80 96 78 86 80 80 C 82 72 76 68 80 62 Z" fill="#5cb85c" stroke="#061a40" stroke-width="3" stroke-linejoin="round"/>
      <path d="M70 30 C 70 24 70 20 70 14" fill="none" stroke="#168a1f" stroke-width="4.5" stroke-linecap="round"/>
      <path d="M70 22 C 56 22 48 14 48 6 C 60 6 70 12 70 22 Z" fill="#5cb85c" stroke="#061a40" stroke-width="3" stroke-linejoin="round"/>
      <path d="M70 18 C 70 8 78 2 92 2 C 92 12 84 18 70 18 Z" fill="#e3f9e1" stroke="#061a40" stroke-width="3" stroke-linejoin="round"/>
      ${sparkle(120, 40, 0.9)}
      <circle cx="18" cy="96" r="3.5" fill="#0072dc"/>
    `
  },
  bio_animal_kingdom: {
    viewBox: '0 0 140 120',
    svg: `
      <path d="M98 60 L126 38 L126 82 Z" fill="#5cb85c" stroke="#061a40" stroke-width="4" stroke-linejoin="round"/>
      <ellipse cx="62" cy="60" rx="42" ry="26" fill="#0072dc" stroke="#061a40" stroke-width="4.8"/>
      <path d="M52 36 Q64 18 80 36" fill="#e3f9e1" stroke="#061a40" stroke-width="4" stroke-linejoin="round"/>
      <path d="M52 76 Q62 94 76 80" fill="#e3f9e1" stroke="#061a40" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M50 44 Q43 60 50 76" fill="none" stroke="#061a40" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="36" cy="54" r="6" fill="#ffffff" stroke="#061a40" stroke-width="3"/>
      <circle cx="35" cy="54" r="2.6" fill="#061a40"/>
      <g fill="none" stroke="#061a40" stroke-width="3"><circle cx="18" cy="36" r="5"/><circle cx="26" cy="20" r="3.2"/></g>
      <g fill="#ffffff" opacity="0.5"><circle cx="72" cy="60" r="4"/><circle cx="84" cy="52" r="3"/><circle cx="82" cy="68" r="3"/></g>
    `
  },
  bio_frog: {
    viewBox: '0 0 140 120',
    svg: `
      <ellipse cx="70" cy="72" rx="46" ry="32" fill="#5cb85c" stroke="#061a40" stroke-width="4.8"/>
      <circle cx="42" cy="42" r="15" fill="#e3f9e1" stroke="#061a40" stroke-width="4.5"/>
      <circle cx="98" cy="42" r="15" fill="#e3f9e1" stroke="#061a40" stroke-width="4.5"/>
      <circle cx="44" cy="42" r="6.5" fill="#061a40"/><circle cx="96" cy="42" r="6.5" fill="#061a40"/>
      <path d="M38 80 Q70 102 102 80" fill="none" stroke="#061a40" stroke-width="4.5" stroke-linecap="round"/>
      <circle cx="63" cy="64" r="2.6" fill="#061a40"/><circle cx="77" cy="64" r="2.6" fill="#061a40"/>
      <g stroke="#061a40" stroke-width="4" stroke-linecap="round" fill="none">
        <path d="M30 98 l-12 10 M30 100 l0 13 M30 98 l11 11"/>
        <path d="M110 98 l12 10 M110 100 l0 13 M110 98 l-11 11"/>
      </g>
      <circle cx="56" cy="90" r="4" fill="#168a1f"/><circle cx="88" cy="88" r="4" fill="#168a1f"/>
    `
  },
  bio_biomolecules: {
    viewBox: '0 0 140 120',
    svg: `
      <g stroke="#061a40" stroke-width="4.5" stroke-linecap="round">
        <line x1="40" y1="60" x2="100" y2="60" stroke="none"/>
        <line x1="70" y1="60" x2="28" y2="60"/>
        <line x1="70" y1="56" x2="106" y2="56"/><line x1="70" y1="65" x2="106" y2="65"/>
        <line x1="70" y1="60" x2="70" y2="40"/>
        <line x1="70" y1="60" x2="70" y2="92"/>
      </g>
      <polygon points="70,8 84,16 84,32 70,40 56,32 56,16" fill="#e3f9e1" stroke="#061a40" stroke-width="3.8" stroke-linejoin="round"/>
      <circle cx="70" cy="100" r="8" fill="#ffffff" stroke="#061a40" stroke-width="3.5"/>
      <circle cx="26" cy="60" r="13" fill="#0072dc" stroke="#061a40" stroke-width="4"/>
      <circle cx="114" cy="60" r="13" fill="#5cb85c" stroke="#061a40" stroke-width="4"/>
      <circle cx="70" cy="60" r="12" fill="#061a40"/>
    `
  },
  bio_lungs: {
    viewBox: '0 0 140 120',
    svg: `
      <path d="M54 30 C 28 38 12 76 18 100 C 22 112 42 110 52 98 C 60 86 62 60 54 30 Z" fill="#0072dc" stroke="#061a40" stroke-width="4.5" stroke-linejoin="round"/>
      <path d="M86 30 C 112 38 128 76 122 100 C 118 112 98 110 88 98 C 80 86 78 60 86 30 Z" fill="#5cb85c" stroke="#061a40" stroke-width="4.5" stroke-linejoin="round"/>
      <g fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.85">
        <path d="M50 66 L36 76 M50 66 L42 92"/><path d="M90 66 L104 76 M90 66 L98 92"/>
      </g>
      <path d="M70 12 V52" stroke="#061a40" stroke-width="6.5" stroke-linecap="round"/>
      <path d="M70 52 C 70 60 58 62 50 68 M70 52 C 70 60 82 62 90 68" fill="none" stroke="#061a40" stroke-width="5" stroke-linecap="round"/>
      ${sparkle(122, 16, 0.8)}
    `
  },
  bio_heart: {
    viewBox: '0 0 140 120',
    svg: `
      <path d="M70 108 C 18 72 12 36 40 24 C 56 17 68 28 70 38 C 72 28 84 17 100 24 C 128 36 122 72 70 108 Z" fill="#0072dc" stroke="#061a40" stroke-width="4.8" stroke-linejoin="round"/>
      <path d="M44 34 C 36 38 32 46 34 54" fill="none" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" opacity="0.6"/>
      <path d="M14 66 H46 L56 46 L68 88 L80 56 L86 66 H126" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="70" cy="12" r="5" fill="#5cb85c"/>
      ${sparkle(124, 16, 0.8)}
    `
  },
  bio_kidney: {
    viewBox: '0 0 140 120',
    svg: `
      <path d="M72 108 C 66 90 56 84 44 80" fill="none" stroke="#5cb85c" stroke-width="5.5" stroke-linecap="round"/>
      <path d="M86 12 C 124 16 132 60 114 92 C 102 114 70 112 66 90 C 64 78 82 74 80 62 C 78 50 56 50 52 34 C 48 18 66 10 86 12 Z" fill="#0072dc" stroke="#061a40" stroke-width="4.8" stroke-linejoin="round"/>
      <path d="M98 34 C 114 42 112 58 98 62 C 90 66 94 80 106 82" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
      <circle cx="94" cy="30" r="6.5" fill="#5cb85c" stroke="#061a40" stroke-width="2.8"/>
      <path d="M62 52 L22 44" stroke="#061a40" stroke-width="5.5" stroke-linecap="round"/>
      <path d="M62 62 L22 70" stroke="#168a1f" stroke-width="5.5" stroke-linecap="round"/>
      ${sparkle(18, 18, 0.8)}
    `
  },
  bio_zoology_revision: {
    viewBox: '0 0 140 120',
    svg: `
      <rect x="30" y="22" width="80" height="92" rx="10" fill="#ffffff" stroke="#061a40" stroke-width="4.8"/>
      <rect x="52" y="12" width="36" height="18" rx="6" fill="#0072dc" stroke="#061a40" stroke-width="4"/>
      <ellipse cx="70" cy="76" rx="15" ry="12" fill="#5cb85c" stroke="#061a40" stroke-width="3"/>
      <g fill="#5cb85c" stroke="#061a40" stroke-width="3">
        <circle cx="48" cy="58" r="6"/><circle cx="61" cy="48" r="6"/><circle cx="79" cy="48" r="6"/><circle cx="92" cy="58" r="6"/>
      </g>
      <path d="M44 100 H96" stroke="#0072dc" stroke-width="4" stroke-linecap="round"/>
      ${sparkle(120, 34, 0.9)}
    `
  }
};

// Top-right hero artwork: seedling in a round badge.
export const BIO_HERO: BioIcon = {
  viewBox: '0 0 140 140',
  svg: `
    <circle cx="70" cy="70" r="58" fill="#e3f9e1" stroke="#061a40" stroke-width="5"/>
    <path d="M70 112 C 70 92 70 80 70 60" fill="none" stroke="#168a1f" stroke-width="6" stroke-linecap="round"/>
    <path d="M70 84 C 44 84 32 68 34 48 C 56 48 70 62 70 84 Z" fill="#5cb85c" stroke="#061a40" stroke-width="4" stroke-linejoin="round"/>
    <path d="M70 68 C 70 46 84 32 106 32 C 108 54 94 70 70 68 Z" fill="#0072dc" stroke="#061a40" stroke-width="4" stroke-linejoin="round"/>
    <ellipse cx="70" cy="114" rx="28" ry="6" fill="#061a40"/>
    ${sparkle(112, 20, 1)}
    <circle cx="22" cy="30" r="4" fill="#0072dc"/>
  `
};
