// Ported verbatim from docs/study_day_poster/prototype_with_all_svg.html
// Palette: Navy #061a40 | Blue #0072dc | Green #25a22b / #5cb85c

export interface SvgIcon {
  label: string;
  category: string;
  viewBox: string;
  svg: string;
}

export const SVG_CATALOG: Record<string, SvgIcon> = {
      // ==================== PHYSICS ====================
      phys_atom: {
        label: "Physics: Bohr Atom & Sparkles",
        category: "Physics",
        viewBox: "0 0 140 140",
        svg: `
          <!-- Sparkles & Dots -->
          <path d="M114 14 L117 22 L125 25 L117 28 L114 36 L111 28 L103 25 L111 22 Z" fill="#5cb85c"/>
          <path d="M22 86 L24.5 92.5 L31 95 L24.5 97.5 L22 104 L19.5 97.5 L13 95 L19.5 92.5 Z" fill="#5cb85c"/>
          <path d="M126 84 L128 89.5 L133.5 91.5 L128 93.5 L126 99 L124 93.5 L118.5 91.5 L124 89.5 Z" fill="#0072dc"/>
          <circle cx="19" cy="36" r="3.2" fill="#0072dc"/>
          <circle cx="106" cy="122" r="2.8" fill="#0072dc"/>
          <!-- 3 Atomic Orbits -->
          <g transform="translate(72, 72)" fill="none" stroke="#061a40" stroke-width="3.6">
            <ellipse rx="22" ry="54" transform="rotate(8)"/>
            <ellipse rx="22" ry="54" transform="rotate(68)"/>
            <ellipse rx="22" ry="54" transform="rotate(128)"/>
          </g>
          <!-- Central Nucleus -->
          <circle cx="72" cy="72" r="10.5" fill="#0072dc"/>
          <circle cx="74.5" cy="70" r="4.5" fill="#061a40"/>
        `
      },
      phys_wave: {
        label: "Physics: Quantum Wave & Barrier",
        category: "Physics",
        viewBox: "0 0 155 86",
        svg: `
          <!-- Center Dotted Axis -->
          <g fill="#061a40">
            <circle cx="8" cy="46" r="2.3"/>
            <circle cx="23" cy="46" r="2.3"/>
            <circle cx="30" cy="46" r="2.3"/>
            <circle cx="52" cy="46" r="2.3"/>
            <circle cx="59" cy="46" r="2.3"/>
            <circle cx="80" cy="46" r="2.3"/>
            <circle cx="87" cy="46" r="2.3"/>
          </g>
          <!-- Oscillating Standing Wave -->
          <path d="M 12 56 C 19 14, 29 14, 37 46 C 43 72, 50 72, 56 46 C 63 14, 73 14, 80 46 C 85 68, 92 68, 96 34" fill="none" stroke="#061a40" stroke-width="4.6" stroke-linecap="round"/>
          <!-- Potential Barrier Bar -->
          <rect x="100" y="6" width="7.5" height="74" rx="3.75" fill="#061a40"/>
          <!-- Transmitted Quantum Dots -->
          <g fill="#061a40">
            <circle cx="117" cy="46" r="2.8"/>
            <circle cx="127" cy="46" r="2.8"/>
            <circle cx="137" cy="46" r="2.8"/>
            <circle cx="147" cy="46" r="2.8"/>
          </g>
        `
      },
      phys_optics: {
        label: "Physics: Prism & Ray Optics",
        category: "Physics",
        viewBox: "0 0 140 120",
        svg: `
          <path d="M112 18 L115 25 L122 28 L115 31 L112 38 L109 31 L102 28 L109 25 Z" fill="#5cb85c"/>
          <!-- Incident Ray -->
          <line x1="10" y1="72" x2="50" y2="56" stroke="#061a40" stroke-width="4.5" stroke-linecap="round"/>
          <!-- Dispersed Rays -->
          <line x1="82" y1="48" x2="128" y2="32" stroke="#0072dc" stroke-width="4" stroke-linecap="round"/>
          <line x1="86" y1="58" x2="130" y2="56" stroke="#5cb85c" stroke-width="4" stroke-linecap="round"/>
          <line x1="90" y1="68" x2="128" y2="82" stroke="#061a40" stroke-width="4" stroke-linecap="round"/>
          <!-- Prism Triangle -->
          <polygon points="68,18 28,96 108,96" fill="#e3f9e1" stroke="#061a40" stroke-width="5" stroke-linejoin="round"/>
          <line x1="50" y1="56" x2="86" y2="58" stroke="#0072dc" stroke-width="3.5" stroke-dasharray="4 3"/>
        `
      },
      phys_circuit: {
        label: "Physics: Electric Circuit & Capacitor",
        category: "Physics",
        viewBox: "0 0 140 120",
        svg: `
          <path d="M22 25 L40 25 L46 13 L56 37 L66 13 L76 37 L86 13 L92 25 L118 25 L118 52" fill="none" stroke="#061a40" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M118 68 L118 95 L80 95" fill="none" stroke="#061a40" stroke-width="4.5" stroke-linecap="round"/>
          <path d="M60 95 L22 95 L22 25" fill="none" stroke="#061a40" stroke-width="4.5" stroke-linecap="round"/>
          <!-- Capacitor Plates -->
          <line x1="102" y1="52" x2="134" y2="52" stroke="#0072dc" stroke-width="5" stroke-linecap="round"/>
          <line x1="102" y1="68" x2="134" y2="68" stroke="#0072dc" stroke-width="5" stroke-linecap="round"/>
          <!-- Battery Cell -->
          <line x1="60" y1="82" x2="60" y2="108" stroke="#5cb85c" stroke-width="5" stroke-linecap="round"/>
          <line x1="78" y1="74" x2="78" y2="116" stroke="#061a40" stroke-width="5" stroke-linecap="round"/>
          <!-- Lightning Spark -->
          <polygon points="72,44 60,62 71,62 66,78 82,56 71,56" fill="#0072dc"/>
        `
      },
      phys_magnet: {
        label: "Physics: Magnetism & Flux Lines",
        category: "Physics",
        viewBox: "0 0 140 120",
        svg: `
          <path d="M28 45 C 10 25, 10 5, 45 12" fill="none" stroke="#0072dc" stroke-width="3" stroke-dasharray="5 4"/>
          <path d="M112 45 C 130 25, 130 5, 95 12" fill="none" stroke="#0072dc" stroke-width="3" stroke-dasharray="5 4"/>
          <!-- U-Magnet -->
          <path d="M40 28 L40 70 A30 30 0 0 0 100 70 L100 28" fill="none" stroke="#061a40" stroke-width="18" stroke-linecap="butt"/>
          <path d="M40 28 L40 46" stroke="#0072dc" stroke-width="18"/>
          <path d="M100 28 L100 46" stroke="#5cb85c" stroke-width="18"/>
          <!-- Flux Sparkles -->
          <path d="M70 12 L73 20 L81 23 L73 26 L70 34 L67 26 L59 23 L67 20 Z" fill="#5cb85c"/>
        `
      },
      phys_mechanics: {
        label: "Physics: Mechanics, Pulley & Vectors",
        category: "Physics",
        viewBox: "0 0 140 120",
        svg: `
          <circle cx="70" cy="44" r="24" fill="#e3f9e1" stroke="#061a40" stroke-width="5"/>
          <circle cx="70" cy="44" r="7" fill="#0072dc"/>
          <line x1="70" y1="10" x2="70" y2="44" stroke="#061a40" stroke-width="4.5" stroke-linecap="round"/>
          <line x1="46" y1="44" x2="46" y2="96" stroke="#061a40" stroke-width="4"/>
          <line x1="94" y1="44" x2="94" y2="82" stroke="#061a40" stroke-width="4"/>
          <rect x="32" y="88" width="28" height="22" rx="4" fill="#0072dc" stroke="#061a40" stroke-width="4"/>
          <rect x="80" y="74" width="28" height="22" rx="4" fill="#5cb85c" stroke="#061a40" stroke-width="4"/>
        `
      },
      phys_thermo: {
        label: "Physics: Thermodynamics & Heat",
        category: "Physics",
        viewBox: "0 0 140 120",
        svg: `
          <!-- Heat Waves -->
          <path d="M32 32 Q 24 44, 32 56 T 32 80" fill="none" stroke="#0072dc" stroke-width="4" stroke-linecap="round"/>
          <path d="M108 32 Q 100 44, 108 56 T 108 80" fill="none" stroke="#5cb85c" stroke-width="4" stroke-linecap="round"/>
          <!-- Thermometer -->
          <path d="M60 22 A10 10 0 0 1 80 22 L80 72 A20 20 0 1 1 60 72 Z" fill="#ffffff" stroke="#061a40" stroke-width="4.5"/>
          <circle cx="70" cy="86" r="11" fill="#0072dc"/>
          <line x1="70" y1="36" x2="70" y2="86" stroke="#0072dc" stroke-width="7" stroke-linecap="round"/>
        `
      },
      phys_gravity: {
        label: "Physics: Gravitation & Planetary Orbit",
        category: "Physics",
        viewBox: "0 0 140 120",
        svg: `
          <ellipse cx="70" cy="60" rx="56" ry="24" transform="rotate(-22 70 60)" fill="none" stroke="#061a40" stroke-width="4"/>
          <circle cx="70" cy="60" r="20" fill="#0072dc" stroke="#061a40" stroke-width="4"/>
          <circle cx="115" cy="40" r="9" fill="#5cb85c" stroke="#061a40" stroke-width="3.5"/>
          <circle cx="24" cy="78" r="6" fill="#061a40"/>
          <path d="M28 20 L31 27 L38 30 L31 33 L28 40 L25 33 L18 30 L25 27 Z" fill="#5cb85c"/>
        `
      },

      // ==================== CHEMISTRY ====================
      chem_flask: {
        label: "Chemistry: Conical Lab Flask & Bubbles",
        category: "Chemistry",
        viewBox: "0 0 140 130",
        svg: `
          <path d="M110 18 L113 26 L121 29 L113 32 L110 40 L107 32 L99 29 L107 26 Z" fill="#5cb85c"/>
          <circle cx="72" cy="18" r="5" fill="#0072dc"/>
          <circle cx="58" cy="30" r="3.5" fill="#5cb85c"/>
          <!-- Liquid inside -->
          <path d="M36 82 Q 55 75, 70 82 T 104 82 L 112 102 A 10 10 0 0 1 102 115 L 38 115 A 10 10 0 0 1 28 102 Z" fill="#0072dc" opacity="0.25"/>
          <!-- Erlenmeyer Flask Outline -->
          <path d="M52 38 L88 38 M58 38 L58 58 L26 102 A10 10 0 0 0 35 116 L105 116 A10 10 0 0 0 114 102 L82 58 L82 38" fill="none" stroke="#061a40" stroke-width="4.8" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="62" cy="96" r="5" fill="#0072dc"/>
          <circle cx="82" cy="90" r="4" fill="#5cb85c"/>
        `
      },
      chem_organic: {
        label: "Chemistry: Benzene Ring & Organic Bonds",
        category: "Chemistry",
        viewBox: "0 0 145 120",
        svg: `
          <!-- Hexagon -->
          <polygon points="72,16 110,38 110,82 72,104 34,82 34,38" fill="none" stroke="#061a40" stroke-width="4.8" stroke-linejoin="round"/>
          <!-- Inner Circle (Aromatic ring) -->
          <circle cx="72" cy="60" r="24" fill="none" stroke="#0072dc" stroke-width="4" stroke-dasharray="10 6"/>
          <!-- Substituent branches -->
          <line x1="110" y1="38" x2="132" y2="25" stroke="#061a40" stroke-width="4.5" stroke-linecap="round"/>
          <line x1="34" y1="82" x2="12" y2="95" stroke="#061a40" stroke-width="4.5" stroke-linecap="round"/>
          <circle cx="132" cy="25" r="6" fill="#5cb85c"/>
          <circle cx="12" cy="95" r="6" fill="#0072dc"/>
        `
      },
      chem_bonds: {
        label: "Chemistry: 3D Molecular Covalent Bonds",
        category: "Chemistry",
        viewBox: "0 0 145 120",
        svg: `
          <line x1="36" y1="78" x2="72" y2="48" stroke="#061a40" stroke-width="5"/>
          <line x1="72" y1="48" x2="112" y2="74" stroke="#061a40" stroke-width="5"/>
          <line x1="72" y1="48" x2="72" y2="18" stroke="#061a40" stroke-width="5"/>
          <circle cx="72" cy="48" r="16" fill="#061a40"/>
          <circle cx="32" cy="82" r="13" fill="#0072dc" stroke="#061a40" stroke-width="4"/>
          <circle cx="114" cy="78" r="13" fill="#5cb85c" stroke="#061a40" stroke-width="4"/>
          <circle cx="72" cy="18" r="10" fill="#0072dc" stroke="#061a40" stroke-width="4"/>
        `
      },
      chem_periodic: {
        label: "Chemistry: Periodic Table Element",
        category: "Chemistry",
        viewBox: "0 0 140 120",
        svg: `
          <rect x="28" y="16" width="84" height="88" rx="14" fill="#ffffff" stroke="#061a40" stroke-width="4.8"/>
          <text x="42" y="42" font-family="Montserrat" font-weight="800" font-size="18" fill="#0072dc">11</text>
          <text x="70" y="76" text-anchor="middle" font-family="Montserrat" font-weight="900" font-size="38" fill="#061a40">Na</text>
          <line x1="45" y1="90" x2="95" y2="90" stroke="#5cb85c" stroke-width="4" stroke-linecap="round"/>
        `
      },
      chem_electro: {
        label: "Chemistry: Electrochemistry Cell",
        category: "Chemistry",
        viewBox: "0 0 140 120",
        svg: `
          <path d="M30 38 L30 98 A8 8 0 0 0 38 106 L102 106 A8 8 0 0 0 110 98 L110 38" fill="none" stroke="#061a40" stroke-width="4.5" stroke-linecap="round"/>
          <line x1="30" y1="62" x2="110" y2="62" stroke="#0072dc" stroke-width="3.5" stroke-dasharray="6 4"/>
          <rect x="44" y="26" width="12" height="66" rx="3" fill="#0072dc" stroke="#061a40" stroke-width="3.5"/>
          <rect x="84" y="26" width="12" height="66" rx="3" fill="#5cb85c" stroke="#061a40" stroke-width="3.5"/>
          <path d="M50 26 L50 14 L90 14 L90 26" fill="none" stroke="#061a40" stroke-width="3.8"/>
        `
      },
      chem_crystal: {
        label: "Chemistry: Solid State Crystal Lattice",
        category: "Chemistry",
        viewBox: "0 0 140 120",
        svg: `
          <rect x="28" y="38" width="56" height="56" fill="none" stroke="#061a40" stroke-width="4"/>
          <rect x="56" y="18" width="56" height="56" fill="none" stroke="#0072dc" stroke-width="4"/>
          <line x1="28" y1="38" x2="56" y2="18" stroke="#061a40" stroke-width="4"/>
          <line x1="84" y1="38" x2="112" y2="18" stroke="#061a40" stroke-width="4"/>
          <line x1="28" y1="94" x2="56" y2="74" stroke="#061a40" stroke-width="4"/>
          <line x1="84" y1="94" x2="112" y2="74" stroke="#061a40" stroke-width="4"/>
          <circle cx="28" cy="38" r="6" fill="#5cb85c"/>
          <circle cx="84" cy="38" r="6" fill="#0072dc"/>
          <circle cx="112" cy="18" r="6" fill="#5cb85c"/>
          <circle cx="84" cy="94" r="6" fill="#5cb85c"/>
        `
      },

      // ==================== MATHEMATICS ====================
      math_calculus: {
        label: "Math: Calculus Integral & Curve",
        category: "Mathematics",
        viewBox: "0 0 140 120",
        svg: `
          <!-- Integral Sign -->
          <path d="M52 20 C 40 20, 42 36, 42 60 C 42 84, 44 100, 32 100" fill="none" stroke="#061a40" stroke-width="5.5" stroke-linecap="round"/>
          <circle cx="53" cy="20" r="4" fill="#0072dc"/>
          <circle cx="31" cy="100" r="4" fill="#0072dc"/>
          <!-- Function Curve & Area -->
          <path d="M62 88 Q 82 32, 102 64 T 128 28" fill="none" stroke="#0072dc" stroke-width="4.5" stroke-linecap="round"/>
          <line x1="58" y1="92" x2="132" y2="92" stroke="#061a40" stroke-width="4" stroke-linecap="round"/>
          <path d="M114 14 L117 21 L124 24 L117 27 L114 34 L111 27 L104 24 L111 21 Z" fill="#5cb85c"/>
        `
      },
      math_geometry: {
        label: "Math: Geometry, Circle & Triangle",
        category: "Mathematics",
        viewBox: "0 0 140 120",
        svg: `
          <circle cx="60" cy="64" r="36" fill="none" stroke="#0072dc" stroke-width="4.2"/>
          <polygon points="78,20 34,94 118,94" fill="none" stroke="#061a40" stroke-width="4.6" stroke-linejoin="round"/>
          <circle cx="78" cy="20" r="5.5" fill="#5cb85c"/>
          <circle cx="34" cy="94" r="5.5" fill="#0072dc"/>
          <circle cx="118" cy="94" r="5.5" fill="#5cb85c"/>
        `
      },
      math_trig: {
        label: "Math: Trigonometry Sine/Cosine Wave",
        category: "Mathematics",
        viewBox: "0 0 150 100",
        svg: `
          <line x1="12" y1="50" x2="138" y2="50" stroke="#061a40" stroke-width="3.2" stroke-dasharray="5 5"/>
          <line x1="24" y1="14" x2="24" y2="86" stroke="#061a40" stroke-width="4" stroke-linecap="round"/>
          <path d="M24 50 C 42 8, 60 8, 78 50 C 96 92, 114 92, 132 50" fill="none" stroke="#0072dc" stroke-width="4.8" stroke-linecap="round"/>
          <path d="M24 22 C 42 22, 60 78, 78 78 C 96 78, 114 22, 132 22" fill="none" stroke="#5cb85c" stroke-width="4" stroke-linecap="round"/>
        `
      },
      math_matrix: {
        label: "Math: Matrices & Determinants",
        category: "Mathematics",
        viewBox: "0 0 140 120",
        svg: `
          <!-- Left Bracket -->
          <path d="M42 20 L26 20 L26 100 L42 100" fill="none" stroke="#061a40" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
          <!-- Right Bracket -->
          <path d="M98 20 L114 20 L114 100 L98 100" fill="none" stroke="#061a40" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
          <!-- Elements -->
          <circle cx="52" cy="42" r="6.5" fill="#0072dc"/>
          <circle cx="88" cy="42" r="6.5" fill="#061a40"/>
          <circle cx="52" cy="78" r="6.5" fill="#061a40"/>
          <circle cx="88" cy="78" r="6.5" fill="#5cb85c"/>
          <line x1="48" y1="38" x2="92" y2="82" stroke="#0072dc" stroke-width="3" stroke-dasharray="4 4"/>
        `
      },
      math_stats: {
        label: "Math: Statistics & Normal Distribution",
        category: "Mathematics",
        viewBox: "0 0 145 110",
        svg: `
          <rect x="32" y="62" width="14" height="32" rx="3" fill="#0072dc" opacity="0.35"/>
          <rect x="54" y="42" width="14" height="52" rx="3" fill="#5cb85c" opacity="0.45"/>
          <rect x="76" y="50" width="14" height="44" rx="3" fill="#0072dc" opacity="0.35"/>
          <path d="M14 94 C 38 94, 48 20, 72 20 C 96 20, 106 94, 130 94" fill="none" stroke="#061a40" stroke-width="4.8" stroke-linecap="round"/>
          <line x1="10" y1="94" x2="134" y2="94" stroke="#061a40" stroke-width="4" stroke-linecap="round"/>
        `
      },
      math_vectors: {
        label: "Math: 3D Vectors & Coordinates",
        category: "Mathematics",
        viewBox: "0 0 140 120",
        svg: `
          <line x1="65" y1="65" x2="65" y2="14" stroke="#061a40" stroke-width="4.5" stroke-linecap="round"/>
          <line x1="65" y1="65" x2="122" y2="65" stroke="#061a40" stroke-width="4.5" stroke-linecap="round"/>
          <line x1="65" y1="65" x2="24" y2="102" stroke="#061a40" stroke-width="4.5" stroke-linecap="round"/>
          <!-- Resultant Vector -->
          <line x1="65" y1="65" x2="112" y2="26" stroke="#0072dc" stroke-width="5" stroke-linecap="round"/>
          <polygon points="116,22 102,25 111,36" fill="#0072dc"/>
          <circle cx="65" cy="65" r="6" fill="#5cb85c"/>
        `
      },

      // ==================== COMPUTER SCIENCE ====================
      cs_code: {
        label: "CS: Code Brackets < / > & Terminal",
        category: "Computer Science",
        viewBox: "0 0 145 115",
        svg: `
          <path d="M48 32 L18 58 L48 84" fill="none" stroke="#061a40" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M97 32 L127 58 L97 84" fill="none" stroke="#061a40" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
          <line x1="82" y1="24" x2="63" y2="92" stroke="#0072dc" stroke-width="5.5" stroke-linecap="round"/>
          <path d="M116 12 L119 19 L126 22 L119 25 L116 32 L113 25 L106 22 L113 19 Z" fill="#5cb85c"/>
        `
      },
      cs_cpu: {
        label: "CS: Processor Chip & Architecture",
        category: "Computer Science",
        viewBox: "0 0 140 120",
        svg: `
          <!-- Pins -->
          <g stroke="#061a40" stroke-width="4.2" stroke-linecap="round">
            <line x1="50" y1="14" x2="50" y2="28"/><line x1="70" y1="14" x2="70" y2="28"/><line x1="90" y1="14" x2="90" y2="28"/>
            <line x1="50" y1="92" x2="50" y2="106"/><line x1="70" y1="92" x2="70" y2="106"/><line x1="90" y1="92" x2="90" y2="106"/>
            <line x1="22" y1="40" x2="36" y2="40"/><line x1="22" y1="60" x2="36" y2="60"/><line x1="22" y1="80" x2="36" y2="80"/>
            <line x1="104" y1="40" x2="118" y2="40"/><line x1="104" y1="60" x2="118" y2="60"/><line x1="104" y1="80" x2="118" y2="80"/>
          </g>
          <rect x="36" y="28" width="68" height="64" rx="10" fill="#ffffff" stroke="#061a40" stroke-width="4.8"/>
          <rect x="52" y="44" width="36" height="32" rx="5" fill="#0072dc" stroke="#061a40" stroke-width="3.5"/>
          <circle cx="70" cy="60" r="5" fill="#5cb85c"/>
        `
      },
      cs_tree: {
        label: "CS: Data Structures Binary Tree & Graph",
        category: "Computer Science",
        viewBox: "0 0 140 120",
        svg: `
          <line x1="70" y1="26" x2="38" y2="62" stroke="#061a40" stroke-width="4.5"/>
          <line x1="70" y1="26" x2="102" y2="62" stroke="#061a40" stroke-width="4.5"/>
          <line x1="38" y1="62" x2="22" y2="96" stroke="#061a40" stroke-width="4"/>
          <line x1="38" y1="62" x2="56" y2="96" stroke="#061a40" stroke-width="4"/>
          <line x1="102" y1="62" x2="118" y2="96" stroke="#061a40" stroke-width="4"/>
          <circle cx="70" cy="26" r="11" fill="#0072dc" stroke="#061a40" stroke-width="4"/>
          <circle cx="38" cy="62" r="10" fill="#5cb85c" stroke="#061a40" stroke-width="4"/>
          <circle cx="102" cy="62" r="10" fill="#5cb85c" stroke="#061a40" stroke-width="4"/>
          <circle cx="22" cy="96" r="8" fill="#ffffff" stroke="#061a40" stroke-width="4"/>
          <circle cx="56" cy="96" r="8" fill="#ffffff" stroke="#061a40" stroke-width="4"/>
          <circle cx="118" cy="96" r="8" fill="#0072dc" stroke="#061a40" stroke-width="4"/>
        `
      },
      cs_db: {
        label: "CS: Database SQL Cylinders",
        category: "Computer Science",
        viewBox: "0 0 140 120",
        svg: `
          <ellipse cx="70" cy="28" rx="40" ry="13" fill="#e3f9e1" stroke="#061a40" stroke-width="4.5"/>
          <path d="M30 28 L30 90 A40 13 0 0 0 110 90 L110 28" fill="none" stroke="#061a40" stroke-width="4.5"/>
          <path d="M30 58 A40 13 0 0 0 110 58" fill="none" stroke="#0072dc" stroke-width="4.2"/>
          <circle cx="92" cy="46" r="4" fill="#5cb85c"/>
          <circle cx="92" cy="76" r="4" fill="#0072dc"/>
        `
      },
      cs_ai: {
        label: "CS: Neural Network & AI Nodes",
        category: "Computer Science",
        viewBox: "0 0 140 120",
        svg: `
          <g stroke="#0072dc" stroke-width="2.8" opacity="0.7">
            <line x1="30" y1="30" x2="70" y2="45"/><line x1="30" y1="30" x2="70" y2="75"/>
            <line x1="30" y1="60" x2="70" y2="45"/><line x1="30" y1="60" x2="70" y2="75"/>
            <line x1="30" y1="90" x2="70" y2="45"/><line x1="30" y1="90" x2="70" y2="75"/>
            <line x1="70" y1="45" x2="110" y2="60"/><line x1="70" y1="75" x2="110" y2="60"/>
          </g>
          <circle cx="30" cy="30" r="8" fill="#061a40"/>
          <circle cx="30" cy="60" r="8" fill="#061a40"/>
          <circle cx="30" cy="90" r="8" fill="#061a40"/>
          <circle cx="70" cy="45" r="10" fill="#0072dc" stroke="#061a40" stroke-width="3.5"/>
          <circle cx="70" cy="75" r="10" fill="#0072dc" stroke="#061a40" stroke-width="3.5"/>
          <circle cx="110" cy="60" r="12" fill="#5cb85c" stroke="#061a40" stroke-width="4"/>
        `
      },

      // ==================== BIOLOGY ====================
      bio_dna: {
        label: "Biology: DNA Double Helix",
        category: "Biology",
        viewBox: "0 0 145 120",
        svg: `
          <!-- Base Pair Rungs -->
          <g stroke="#5cb85c" stroke-width="3.8" stroke-linecap="round">
            <line x1="32" y1="38" x2="32" y2="82"/>
            <line x1="50" y1="45" x2="50" y2="75"/>
            <line x1="95" y1="45" x2="95" y2="75"/>
            <line x1="113" y1="38" x2="113" y2="82"/>
          </g>
          <!-- Helix Strands -->
          <path d="M 14 30 C 42 30, 52 90, 72 90 C 92 90, 102 30, 130 30" fill="none" stroke="#061a40" stroke-width="5" stroke-linecap="round"/>
          <path d="M 14 90 C 42 90, 52 30, 72 30 C 92 30, 102 90, 130 90" fill="none" stroke="#0072dc" stroke-width="5" stroke-linecap="round"/>
        `
      },
      bio_cell: {
        label: "Biology: Eukaryotic Cell & Nucleus",
        category: "Biology",
        viewBox: "0 0 140 120",
        svg: `
          <path d="M32 34 C 55 12, 105 16, 116 48 C 126 80, 95 108, 62 104 C 28 100, 10 56, 32 34 Z" fill="#e3f9e1" stroke="#061a40" stroke-width="4.8"/>
          <circle cx="68" cy="62" r="18" fill="#0072dc" stroke="#061a40" stroke-width="4"/>
          <circle cx="72" cy="58" r="6" fill="#061a40"/>
          <ellipse cx="40" cy="68" rx="6" ry="10" transform="rotate(-25 40 68)" fill="#5cb85c"/>
          <ellipse cx="98" cy="48" rx="5" ry="9" transform="rotate(35 98 48)" fill="#5cb85c"/>
        `
      },
      bio_microscope: {
        label: "Biology: Laboratory Microscope",
        category: "Biology",
        viewBox: "0 0 140 120",
        svg: `
          <line x1="32" y1="104" x2="108" y2="104" stroke="#061a40" stroke-width="6" stroke-linecap="round"/>
          <path d="M76 36 C 106 46, 106 88, 72 104" fill="none" stroke="#061a40" stroke-width="5.5" stroke-linecap="round"/>
          <rect x="52" y="18" width="16" height="44" rx="4" transform="rotate(22 60 40)" fill="#0072dc" stroke="#061a40" stroke-width="4"/>
          <line x1="38" y1="74" x2="82" y2="74" stroke="#5cb85c" stroke-width="5" stroke-linecap="round"/>
        `
      },
      bio_botany: {
        label: "Biology: Botany Leaf & Photosynthesis",
        category: "Biology",
        viewBox: "0 0 140 120",
        svg: `
          <path d="M26 96 C 26 42, 68 20, 114 22 C 112 68, 90 100, 26 96 Z" fill="#e3f9e1" stroke="#061a40" stroke-width="4.8" stroke-linejoin="round"/>
          <path d="M20 102 Q 64 62, 114 22" fill="none" stroke="#168a1f" stroke-width="4.5" stroke-linecap="round"/>
          <line x1="56" y1="70" x2="52" y2="46" stroke="#168a1f" stroke-width="3.5" stroke-linecap="round"/>
          <line x1="76" y1="54" x2="96" y2="58" stroke="#168a1f" stroke-width="3.5" stroke-linecap="round"/>
          <circle cx="34" cy="28" r="9" fill="#0072dc"/>
        `
      },
      bio_neuron: {
        label: "Biology: Neuron & Action Potential",
        category: "Biology",
        viewBox: "0 0 145 120",
        svg: `
          <circle cx="46" cy="60" r="20" fill="#e3f9e1" stroke="#061a40" stroke-width="4.5"/>
          <circle cx="46" cy="60" r="8" fill="#0072dc"/>
          <!-- Dendrites -->
          <path d="M30 46 L16 32 M26 60 L10 60 M30 74 L16 88 M46 40 L46 22 M46 80 L46 98" stroke="#061a40" stroke-width="4" stroke-linecap="round"/>
          <!-- Axon -->
          <path d="M66 60 Q 92 50, 118 60" fill="none" stroke="#061a40" stroke-width="5" stroke-linecap="round"/>
          <path d="M118 60 L132 46 M118 60 L132 74" stroke="#5cb85c" stroke-width="4.5" stroke-linecap="round"/>
        `
      }
};

export const DEFAULT_LOGO_SVG = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 120" width="540" height="120">
        <!-- Plant/Leaf Icon on Left -->
        <g transform="translate(8, 2)">
          <!-- Left light-green leaf -->
          <path d="M52 72 C 26 70, 8 52, 2 32 C 24 34, 42 48, 52 72 Z" fill="#6dc043"/>
          <!-- Middle green leaf -->
          <path d="M55 72 C 36 48, 32 22, 42 2 C 58 20, 62 46, 55 72 Z" fill="#2c9f45"/>
          <!-- Right dark-blue leaf swoosh -->
          <path d="M58 72 C 56 44, 68 18, 90 8 C 88 26, 78 38, 66 72 Z" fill="#003e7e"/>
          <path d="M62 72 C 66 48, 78 32, 92 28 C 80 42, 72 56, 66 72 Z" fill="#ffffff" opacity="0.2"/>
        </g>

        <!-- "AIMS" Text -->
        <text x="86" y="74" font-family="'Montserrat', sans-serif" font-weight="900" font-size="64" letter-spacing="1" fill="#003e7e">AIMS</text>

        <!-- Slanted Green Parallelogram for "PLUS" -->
        <polygon points="292,16 530,16 514,79 276,79" rx="8" fill="#5cba36"/>
        <text x="404" y="68" text-anchor="middle" font-family="'Montserrat', sans-serif" font-weight="900" font-size="56" letter-spacing="2" fill="#ffffff">PLUS</text>

        <!-- Bottom Navy Pill: POWERED BY HARVEST GROUP OF INSTITUTIONS -->
        <rect x="20" y="87" width="500" height="27" rx="7" fill="#003e7e"/>
        <text x="270" y="106" text-anchor="middle" font-family="'Montserrat', sans-serif" font-weight="700" font-size="14.6" letter-spacing="0.9" fill="#ffffff">POWERED BY HARVEST GROUP OF INSTITUTIONS</text>
      </svg>
`;
