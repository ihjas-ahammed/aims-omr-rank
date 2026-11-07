// Source: STUDY.BIOLOGY.A1.pdf / STUDY.BIOLOGY.A2-1.pdf — Plus One Biology study timetable, cycle 08 NOV – 15 NOV 2026.

export type Batch = 'A1' | 'A2';

export interface Chapter {
  title: string;
  icon: string; // key into BIO_ICONS
  topics: string[];
}

export type StudyDay =
  | { date: string; exam?: undefined; botany: Chapter; zoology: Chapter }
  | { date: string; exam: true };

export const CYCLE_LABEL = '08 NOV – 15 NOV 2026';

// Botany is identical for both batches.
const BOTANY: Chapter[] = [
  {
    title: 'Biological Classification',
    icon: 'bio_classification',
    topics: [
      '5-Kingdom Classification',
      'Monera (Archaea, Eubacteria)',
      'Protista & Fungi Classes',
      'Viruses, Viroids & Lichens'
    ]
  },
  {
    title: 'Plant Kingdom',
    icon: 'bio_plant_kingdom',
    topics: [
      'Algae (Chloro, Phaeo, Rhodo)',
      'Bryophytes (Liverworts/Moss)',
      'Pteridophytes & Heterospory',
      'Gymnosperms & features'
    ]
  },
  {
    title: 'Morphology of Flowering Plants',
    icon: 'bio_flower',
    topics: [
      'Root, Stem & Leaf Venation',
      'Inflorescence & Flower Parts',
      'Aestivation & Placentation',
      'Fruit, Seed & Solanaceae'
    ]
  },
  {
    title: 'Anatomy of Flowering Plants',
    icon: 'bio_stem_anatomy',
    topics: [
      'Epidermal & Ground Tissue',
      'Vascular Bundles (Radial/Conj)',
      'Dicot vs Monocot Root & Stem',
      'Dorsiventral & Isobilateral Leaf'
    ]
  },
  {
    title: 'Cell: The Unit of Life',
    icon: 'bio_cell_unit',
    topics: [
      'Prokaryotic vs Eukaryotic Cell',
      'Fluid Mosaic Plasma Membrane',
      'Endomembrane, Mito & Plastids',
      'Ribosomes, Cilia & Nucleus'
    ]
  },
  {
    title: 'Cell Cycle and Cell Division',
    icon: 'bio_cell_division',
    topics: [
      'Interphase (G<sub>1</sub>, S, G<sub>2</sub>, G<sub>0</sub>)',
      'Mitosis Phases & Significance',
      'Meiosis I (Prophase I Substages)',
      'Meiosis II & Genetic Variation'
    ]
  },
  {
    title: 'Botany Revision & PYQs',
    icon: 'bio_botany_revision',
    topics: [
      'Plant Groups & Fungi Tables',
      'Floral Formulae & Diagrams',
      'Root/Stem Anatomy Comparison',
      'Mitosis vs Meiosis PYQ Drill'
    ]
  }
];

// Zoology days 1–3 are shared; days 4–7 differ by batch.
const ZOOLOGY_COMMON: Chapter[] = [
  {
    title: 'The Living World',
    icon: 'bio_living_world',
    topics: [
      'Diversity in Living World',
      'Binomial Nomenclature Rules',
      'Taxonomic Categories',
      'Taxonomic Hierarchy Table'
    ]
  },
  {
    title: 'Animal Kingdom',
    icon: 'bio_animal_kingdom',
    topics: [
      'Levels, Symmetry & Coelom',
      'Porifera to Aschelminthes',
      'Annelida to Hemichordata',
      'Chordata & Vertebrate Classes'
    ]
  },
  {
    title: 'Structural Organisation in Animals',
    icon: 'bio_frog',
    topics: [
      'Frog External Morphology',
      'Digestive & Respiratory Sys.',
      'Vascular & Nervous System',
      'Excretory & Reproductive Sys.'
    ]
  },
  {
    title: 'Biomolecules',
    icon: 'bio_biomolecules',
    topics: [
      'Amino Acids, Lipids & Sugars',
      'Primary/Secondary Metabolites',
      'Protein Structures (1° to 4°)',
      'Enzyme Action, Km & Inhibition'
    ]
  }
];

const EXCRETORY: Chapter = {
  title: 'Excretory Products & Elimination',
  icon: 'bio_kidney',
  topics: [
    'Excretory Modes & Nephron',
    'Urine Formation (3 Steps)',
    'Counter-Current Mechanism',
    'RAAS, ADH/ANF & Disorders'
  ]
};

const ZOOLOGY_A1: Chapter[] = [
  ...ZOOLOGY_COMMON,
  {
    title: 'Breathing and Exchange of Gases',
    icon: 'bio_lungs',
    topics: [
      'Human Respiratory Organs',
      'Respiratory Volumes/Capacities',
      'O<sub>2</sub> Dissociation Curve & CO<sub>2</sub>',
      'Regulation & Resp. Disorders'
    ]
  },
  {
    title: 'Body Fluids and Circulation',
    icon: 'bio_heart',
    topics: [
      'Blood Groups (ABO/Rh) & Clot',
      'Conducting System & Heart',
      'Cardiac Cycle, Output & ECG',
      'Double Circulation & Disorders'
    ]
  },
  EXCRETORY
];

const ZOOLOGY_A2: Chapter[] = [
  ...ZOOLOGY_COMMON,
  EXCRETORY,
  {
    title: 'Zoology Revision',
    icon: 'bio_zoology_revision',
    topics: [
      'Taxonomic Hierarchy',
      'Non-Chordate Phyla Examples',
      'Chordate Class Comparisons',
      'Frog Organ System Diagrams'
    ]
  },
  {
    title: 'Zoology Revision',
    icon: 'bio_zoology_revision',
    topics: [
      'Enzyme Graphs & Cofactors',
      'Nephron & Counter-Current',
      'JGA, ADH & ANF Regulation',
      'Full Zoology Previous Qs'
    ]
  }
];

const DATES = [
  '2026-11-08',
  '2026-11-09',
  '2026-11-10',
  '2026-11-11',
  '2026-11-12',
  '2026-11-13',
  '2026-11-14'
];

const buildCycle = (zoology: Chapter[]): StudyDay[] => [
  ...DATES.map((date, i): StudyDay => ({ date, botany: BOTANY[i], zoology: zoology[i] })),
  { date: '2026-11-15', exam: true }
];

export const TIMETABLE: Record<Batch, StudyDay[]> = {
  A1: buildCycle(ZOOLOGY_A1),
  A2: buildCycle(ZOOLOGY_A2)
};

export const getStudyDay = (batch: Batch, dateKey: string): StudyDay | null =>
  TIMETABLE[batch].find((d) => d.date === dateKey) ?? null;
