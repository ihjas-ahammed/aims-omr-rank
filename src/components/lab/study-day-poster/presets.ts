// Ported verbatim from docs/study_day_poster/prototype_with_all_svg.html

export interface StudyCard {
  chapterTitle: string;
  subject: string;
  subjectColor?: string;
  subjectLabel?: string;
  topicsHeader?: string;
  topRightIcon?: string;
  chapterIcon?: string;
  cornerGraphic?: string;
  topics: string[];
}

export type PresetKey = 'physics' | 'chemistry' | 'math' | 'cs' | 'biology';

export const PRESETS: Record<PresetKey, StudyCard> = {
      physics: {
        chapterTitle: "Chapter 12: Atoms",
        subject: "PHYSICS",
        subjectColor: "#14881a",
        topRightIcon: "phys_atom",
        chapterIcon: "phys_wave",
        cornerGraphic: "corners_physics",
        topics: [
          "Alpha Scattering, Impact Parameter & Closest Approach",
          "Bohr’s Postulates, Radius (r_n) & Velocity (v_n)",
          "Electron Energy Levels (E_n = −13.6/n^2 eV) & Spectra",
          "de Broglie Standing Wave Proof of Bohr’s Orbit"
        ]
      },
      chemistry: {
        chapterTitle: "Chapter 04: Chemical Kinetics",
        subject: "CHEMISTRY",
        subjectColor: "#14881a",
        topRightIcon: "chem_flask",
        chapterIcon: "chem_organic",
        cornerGraphic: "corners_chemistry",
        topics: [
          "Rate of Reaction, Rate Law & Order of Reaction",
          "Integrated Rate Equations for Zero & First Order (k_1)",
          "Half-Life Period (t_{1/2} = 0.693/k) & Pseudo First Order",
          "Arrhenius Equation (k = A·e^{-E_a/RT}) & Collision Theory"
        ]
      },
      math: {
        chapterTitle: "Chapter 07: Integrals",
        subject: "MATHEMATICS",
        subjectColor: "#14881a",
        topRightIcon: "math_calculus",
        chapterIcon: "math_trig",
        cornerGraphic: "corners_math",
        topics: [
          "Integration by Substitution, Partial Fractions & Parts",
          "Special Standard Integrals of dx / (x^2 ± a^2)",
          "Definite Integrals as Limit of a Sum & Properties (P_0 to P_7)",
          "Fundamental Theorem of Calculus & Area Under Curves"
        ]
      },
      cs: {
        chapterTitle: "Unit 03: Data Structures & Trees",
        subject: "COMPUTER SCIENCE",
        subjectColor: "#14881a",
        topRightIcon: "cs_cpu",
        chapterIcon: "cs_tree",
        cornerGraphic: "corners_cs",
        topics: [
          "Stack & Queue Operations (PUSH, POP, Enqueue, Dequeue)",
          "Time Complexity Analysis: Big-O (O(n log n)) & O(n^2)",
          "Binary Search Trees (BST), Traversals & Height Balance",
          "Graph Representations: BFS & Dijkstra’s Shortest Path"
        ]
      },
      biology: {
        chapterTitle: "Chapter 06: Molecular Inheritance",
        subject: "BIOLOGY",
        subjectColor: "#14881a",
        topRightIcon: "bio_dna",
        chapterIcon: "bio_cell",
        cornerGraphic: "corners_biology",
        topics: [
          "Double Helix Structure of DNA & Chargaff’s Base Pairing",
          "Meselson & Stahl Semiconservative Replication Proof",
          "Transcription Unit, mRNA Splicing & Genetic Code",
          "Lac Operon Regulation & Human Genome Project (HGP)"
        ]
      }
};

export const buildAIPrompt = (rawNotes: string) => `You are a curriculum designer creating daily "Study Card" JSON data for a poster generator web app.

Convert the provided chapter/topic list into valid JSON (return ONLY raw JSON, no markdown fences or extra commentary).
If there is 1 chapter, return a single JSON object. If there are multiple chapters/days, return a JSON array of objects.

### JSON SCHEMA PER CARD:
{
  "chapterTitle": "Chapter 12: Atoms",
  "subject": "PHYSICS",
  "topRightIcon": "phys_atom",
  "chapterIcon": "phys_wave",
  "cornerGraphic": "corners_physics",
  "topics": [
    "Alpha Scattering, Impact Parameter & Closest Approach",
    "Bohr’s Postulates, Radius (r_n) & Velocity (v_n)",
    "Electron Energy Levels (E_n = −13.6/n^2 eV) & Spectra",
    "de Broglie Standing Wave Proof of Bohr’s Orbit"
  ]
}

### RULES FOR TOPICS & MATH FORMATTING:
1. Include 4 to 5 concise, high-impact study topics per chapter (each 40–65 characters max so it fits on 1–2 lines cleanly).
2. Write subscripts using underscore (e.g., r_n, v_n, E_n, H_2O, k_1, t_{1/2}) and superscripts using caret (e.g., n^2, x^2, 10^{-19}). The poster engine automatically italicizes variables and renders proper subscripts/superscripts.

### CHOOSE THE BEST MATCHING BUILT-IN SVG GRAPHIC IDs FOR EACH PART OF THE POSTER:

1. "topRightIcon" and "chapterIcon" (Pick 2 distinct icons that best match the subject & chapter theme):
   - PHYSICS:
     * "phys_atom" (Bohr Atom, Orbitals & Sparkles)
     * "phys_wave" (Quantum Standing Wave & Barrier)
     * "phys_optics" (Prism Light Dispersion & Ray Optics)
     * "phys_circuit" (Electric Circuit, Resistor & Capacitor)
     * "phys_magnet" (Magnetism & Dipole Flux Lines)
     * "phys_mechanics" (Mechanics Pulley, Force Vectors & Masses)
     * "phys_thermo" (Thermodynamics Thermometer & Heat Waves)
     * "phys_gravity" (Gravitation & Planetary Orbits)
   - CHEMISTRY:
     * "chem_flask" (Conical Erlenmeyer Lab Flask & Reaction Bubbles)
     * "chem_organic" (Benzene Ring & Organic Carbon Bonds)
     * "chem_bonds" (3D Molecular Ball-and-Stick Covalent Bonds)
     * "chem_periodic" (Periodic Table Element Tile)
     * "chem_electro" (Electrochemistry Galvanic Cell & Electrodes)
     * "chem_crystal" (Solid State Crystal Lattice Cube)
   - MATHEMATICS:
     * "math_calculus" (Integral Sign, Curve & Area)
     * "math_geometry" (Geometry Circle, Triangle & Vertices)
     * "math_trig" (Trigonometry Sine & Cosine Waves)
     * "math_matrix" (Matrices, Brackets & Determinants)
     * "math_stats" (Statistics Bell Curve & Histogram)
     * "math_vectors" (3D Coordinate Axes & Resultant Vector)
   - COMPUTER SCIENCE:
     * "cs_code" (Code Brackets < / > & Programming)
     * "cs_cpu" (Processor Microchip & Hardware Architecture)
     * "cs_tree" (Data Structures Binary Tree & Graph Nodes)
     * "cs_db" (Database SQL Server Cylinders)
     * "cs_ai" (Neural Network Layers & AI Nodes)
   - BIOLOGY:
     * "bio_dna" (DNA Double Helix & Base Pairs)
     * "bio_cell" (Eukaryotic Cell, Nucleus & Organelles)
     * "bio_microscope" (Laboratory Microscope)
     * "bio_botany" (Botany Leaf & Photosynthesis)
     * "bio_neuron" (Neuron Synapse & Action Potential)

2. "cornerGraphic" (Bottom corner decorative artwork):
   - "corners_physics" (Atomic Orbitals & Quantum Rings)
   - "corners_chemistry" (Molecular Hexagonal Lattice)
   - "corners_math" (Harmonic Waves & Geometric Rings)
   - "corners_cs" (Digital Circuit Nodes & Traces)
   - "corners_biology" (Organic Cellular Waves & Helix)

### INPUT SYLLABUS / CHAPTER DETAILS TO CONVERT:
${rawNotes ? rawNotes : "[PASTE YOUR CHAPTER OR TOPIC LIST HERE]"}`;
