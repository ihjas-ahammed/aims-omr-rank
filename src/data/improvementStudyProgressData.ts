export interface ImprovementTopicDef {
  id: string;
  topicNumber?: string;
  titleEn: string;
  titleMl?: string;
}

export interface ImprovementChapterDef {
  id: string;
  chapterNumber: number;
  titleEn: string;
  titleMl?: string;
  subtitleEn?: string;
  subtitleMl?: string;
  unitEn?: string;
  unitMl?: string;
  totalBoxes?: number;
  topics?: ImprovementTopicDef[];
}

export interface ImprovementSubjectDef {
  id: string;
  nameEn: string;
  nameMl: string;
  code: string;
  category: 'science' | 'computer_science' | 'language' | 'humanities';
  color: string;
  bgGradient: string;
  borderColor: string;
  chapters: ImprovementChapterDef[];
}

export type ImprovementSecondLanguage = 'Malayalam' | 'Hindi' | 'Arabic' | 'Urdu';

// Helper to dynamically build numbered chapter list for languages
export function createNumberedChapters(prefix: string, count: number, titlePrefixEn = 'Chapter'): ImprovementChapterDef[] {
  const safeCount = Math.max(1, Math.min(count || 10, 40));
  return Array.from({ length: safeCount }, (_, i) => ({
    id: `${prefix}-${i + 1}`,
    chapterNumber: i + 1,
    titleEn: `${titlePrefixEn} ${i + 1}`,
    titleMl: `അദ്ധ്യായം ${i + 1}`,
    totalBoxes: 1
  }));
}

// -------------------------------------------------------------
// 1. SECOND LANGUAGE SUBJECT DEFINITIONS (Numbered Chapters)
// -------------------------------------------------------------
export const IMPROVEMENT_LANGUAGE_SUBJECTS: Record<ImprovementSecondLanguage, (chapterCount?: number) => ImprovementSubjectDef> = {
  Malayalam: (count = 10) => ({
    id: 'malayalam',
    nameEn: 'Malayalam',
    nameMl: 'മലയാളം',
    code: 'MAL',
    category: 'language',
    color: 'from-pink-600 to-rose-600',
    bgGradient: 'bg-gradient-to-r from-pink-600 to-rose-600',
    borderColor: 'border-pink-200',
    chapters: createNumberedChapters('mal', count)
  }),
  Hindi: (count = 10) => ({
    id: 'hindi',
    nameEn: 'Hindi',
    nameMl: 'हिन्दी',
    code: 'HIN',
    category: 'language',
    color: 'from-orange-600 to-amber-600',
    bgGradient: 'bg-gradient-to-r from-orange-600 to-amber-600',
    borderColor: 'border-orange-200',
    chapters: createNumberedChapters('hin', count)
  }),
  Arabic: (count = 10) => ({
    id: 'arabic',
    nameEn: 'Arabic',
    nameMl: 'അറബിക്',
    code: 'ARB',
    category: 'language',
    color: 'from-emerald-600 to-teal-600',
    bgGradient: 'bg-gradient-to-r from-emerald-600 to-teal-600',
    borderColor: 'border-emerald-200',
    chapters: createNumberedChapters('arb', count)
  }),
  Urdu: (count = 10) => ({
    id: 'urdu',
    nameEn: 'Urdu',
    nameMl: 'ഉറുദു',
    code: 'URD',
    category: 'language',
    color: 'from-amber-600 to-orange-600',
    bgGradient: 'bg-gradient-to-r from-amber-600 to-orange-600',
    borderColor: 'border-amber-200',
    chapters: createNumberedChapters('urd', count)
  })
};

// -------------------------------------------------------------
// 2. OFFICIAL NCERT PLUS ONE (CLASS 11) TEXTBOOK CURRICULUM
// Cleaned: Removed 'Introduction' topics and CS subtopics
// -------------------------------------------------------------
export const ALL_IMPROVEMENT_SUBJECTS: ImprovementSubjectDef[] = [
  // =========================================================
  // 1. PHYSICS (NCERT Class 11 Part 1 & Part 2 - 14 Chapters)
  // =========================================================
  {
    id: 'physics',
    nameEn: 'Physics',
    nameMl: 'ഭൗതികശാസ്ത്രം',
    code: 'PHY',
    category: 'science',
    color: 'from-rose-600 to-pink-600',
    bgGradient: 'bg-gradient-to-r from-rose-600 to-pink-600',
    borderColor: 'border-rose-200',
    chapters: [
      {
        id: 'phy-1',
        chapterNumber: 1,
        titleEn: 'Units and Measurements',
        topics: [
          { id: 'phy-1-2', topicNumber: '1.2', titleEn: 'The International System of Units' },
          { id: 'phy-1-3', topicNumber: '1.3', titleEn: 'Significant Figures' },
          { id: 'phy-1-4', topicNumber: '1.4', titleEn: 'Dimensions of Physical Quantities' },
          { id: 'phy-1-5', topicNumber: '1.5', titleEn: 'Dimensional Formulae and Dimensional Equations' },
          { id: 'phy-1-6', topicNumber: '1.6', titleEn: 'Dimensional Analysis and its Applications' }
        ]
      },
      {
        id: 'phy-2',
        chapterNumber: 2,
        titleEn: 'Motion in a Straight Line',
        topics: [
          { id: 'phy-2-2', topicNumber: '2.2', titleEn: 'Instantaneous Velocity and Speed' },
          { id: 'phy-2-3', topicNumber: '2.3', titleEn: 'Acceleration' },
          { id: 'phy-2-4', topicNumber: '2.4', titleEn: 'Kinematic Equations for Uniformly Accelerated Motion' }
        ]
      },
      {
        id: 'phy-3',
        chapterNumber: 3,
        titleEn: 'Motion in a Plane',
        topics: [
          { id: 'phy-3-2', topicNumber: '3.2', titleEn: 'Scalars and Vectors' },
          { id: 'phy-3-3', topicNumber: '3.3', titleEn: 'Multiplication of Vectors by Real Numbers' },
          { id: 'phy-3-4', topicNumber: '3.4', titleEn: 'Addition and Subtraction of Vectors – Graphical Method' },
          { id: 'phy-3-5', topicNumber: '3.5', titleEn: 'Resolution of Vectors' },
          { id: 'phy-3-6', topicNumber: '3.6', titleEn: 'Vector Addition – Analytical Method' },
          { id: 'phy-3-7', topicNumber: '3.7', titleEn: 'Motion in a Plane' },
          { id: 'phy-3-8', topicNumber: '3.8', titleEn: 'Motion in a Plane with Constant Acceleration' },
          { id: 'phy-3-9', topicNumber: '3.9', titleEn: 'Projectile Motion' },
          { id: 'phy-3-10', topicNumber: '3.10', titleEn: 'Uniform Circular Motion' }
        ]
      },
      {
        id: 'phy-4',
        chapterNumber: 4,
        titleEn: 'Laws of Motion',
        topics: [
          { id: 'phy-4-2', topicNumber: '4.2', titleEn: "Aristotle's Fallacy" },
          { id: 'phy-4-3', topicNumber: '4.3', titleEn: 'The Law of Inertia' },
          { id: 'phy-4-4', topicNumber: '4.4', titleEn: "Newton's First Law of Motion" },
          { id: 'phy-4-5', topicNumber: '4.5', titleEn: "Newton's Second Law of Motion" },
          { id: 'phy-4-6', topicNumber: '4.6', titleEn: "Newton's Third Law of Motion" },
          { id: 'phy-4-7', topicNumber: '4.7', titleEn: 'Conservation of Momentum' },
          { id: 'phy-4-8', topicNumber: '4.8', titleEn: 'Equilibrium of a Particle' },
          { id: 'phy-4-9', topicNumber: '4.9', titleEn: 'Common Forces in Mechanics' },
          { id: 'phy-4-10', topicNumber: '4.10', titleEn: 'Circular Motion' },
          { id: 'phy-4-11', topicNumber: '4.11', titleEn: 'Solving Problems in Mechanics' }
        ]
      },
      {
        id: 'phy-5',
        chapterNumber: 5,
        titleEn: 'Work, Energy and Power',
        topics: [
          { id: 'phy-5-2', topicNumber: '5.2', titleEn: 'Notions of Work and Kinetic Energy: The Work-Energy Theorem' },
          { id: 'phy-5-3', topicNumber: '5.3', titleEn: 'Work' },
          { id: 'phy-5-4', topicNumber: '5.4', titleEn: 'Kinetic Energy' },
          { id: 'phy-5-5', topicNumber: '5.5', titleEn: 'Work Done by a Variable Force' },
          { id: 'phy-5-6', topicNumber: '5.6', titleEn: 'The Work-Energy Theorem for a Variable Force' },
          { id: 'phy-5-7', topicNumber: '5.7', titleEn: 'The Concept of Potential Energy' },
          { id: 'phy-5-8', topicNumber: '5.8', titleEn: 'The Conservation of Mechanical Energy' },
          { id: 'phy-5-9', topicNumber: '5.9', titleEn: 'The Potential Energy of a Spring' },
          { id: 'phy-5-10', topicNumber: '5.10', titleEn: 'Power' },
          { id: 'phy-5-11', topicNumber: '5.11', titleEn: 'Collisions' }
        ]
      },
      {
        id: 'phy-6',
        chapterNumber: 6,
        titleEn: 'System of Particles and Rotational Motion',
        topics: [
          { id: 'phy-6-2', topicNumber: '6.2', titleEn: 'Centre of Mass' },
          { id: 'phy-6-3', topicNumber: '6.3', titleEn: 'Motion of Centre of Mass' },
          { id: 'phy-6-4', topicNumber: '6.4', titleEn: 'Linear Momentum of a System of Particles' },
          { id: 'phy-6-5', topicNumber: '6.5', titleEn: 'Vector Product of Two Vectors' },
          { id: 'phy-6-6', topicNumber: '6.6', titleEn: 'Angular Velocity and its Relation with Linear Velocity' },
          { id: 'phy-6-7', topicNumber: '6.7', titleEn: 'Torque and Angular Momentum' },
          { id: 'phy-6-8', topicNumber: '6.8', titleEn: 'Equilibrium of a Rigid Body' },
          { id: 'phy-6-9', topicNumber: '6.9', titleEn: 'Moment of Inertia' },
          { id: 'phy-6-10', topicNumber: '6.10', titleEn: 'Kinematics of Rotational Motion about a Fixed Axis' },
          { id: 'phy-6-11', topicNumber: '6.11', titleEn: 'Dynamics of Rotational Motion about a Fixed Axis' },
          { id: 'phy-6-12', topicNumber: '6.12', titleEn: 'Angular Momentum in case of Rotations about a Fixed Axis' }
        ]
      },
      {
        id: 'phy-7',
        chapterNumber: 7,
        titleEn: 'Gravitation',
        topics: [
          { id: 'phy-7-2', topicNumber: '7.2', titleEn: "Kepler's Laws" },
          { id: 'phy-7-3', topicNumber: '7.3', titleEn: 'Universal Law of Gravitation' },
          { id: 'phy-7-4', topicNumber: '7.4', titleEn: 'The Gravitational Constant' },
          { id: 'phy-7-5', topicNumber: '7.5', titleEn: 'Acceleration due to Gravity of the Earth' },
          { id: 'phy-7-6', topicNumber: '7.6', titleEn: 'Acceleration due to Gravity below and above the Surface of Earth' },
          { id: 'phy-7-7', topicNumber: '7.7', titleEn: 'Gravitational Potential Energy' },
          { id: 'phy-7-8', topicNumber: '7.8', titleEn: 'Escape Speed' },
          { id: 'phy-7-9', topicNumber: '7.9', titleEn: 'Earth Satellites' },
          { id: 'phy-7-10', topicNumber: '7.10', titleEn: 'Energy of an Orbiting Satellite' }
        ]
      },
      {
        id: 'phy-8',
        chapterNumber: 8,
        titleEn: 'Mechanical Properties of Solids',
        topics: [
          { id: 'phy-8-2', topicNumber: '8.2', titleEn: 'Stress and Strain' },
          { id: 'phy-8-3', topicNumber: '8.3', titleEn: "Hooke's Law" },
          { id: 'phy-8-4', topicNumber: '8.4', titleEn: 'Stress-Strain Curve' },
          { id: 'phy-8-5', topicNumber: '8.5', titleEn: 'Elastic Moduli' },
          { id: 'phy-8-6', topicNumber: '8.6', titleEn: 'Applications of Elastic Behaviour of Materials' }
        ]
      },
      {
        id: 'phy-9',
        chapterNumber: 9,
        titleEn: 'Mechanical Properties of Fluids',
        topics: [
          { id: 'phy-9-2', topicNumber: '9.2', titleEn: 'Pressure' },
          { id: 'phy-9-3', topicNumber: '9.3', titleEn: 'Streamline Flow' },
          { id: 'phy-9-4', topicNumber: '9.4', titleEn: "Bernoulli's Principle" },
          { id: 'phy-9-5', topicNumber: '9.5', titleEn: 'Viscosity' },
          { id: 'phy-9-6', topicNumber: '9.6', titleEn: 'Surface Tension' }
        ]
      },
      {
        id: 'phy-10',
        chapterNumber: 10,
        titleEn: 'Thermal Properties of Matter',
        topics: [
          { id: 'phy-10-2', topicNumber: '10.2', titleEn: 'Temperature and Heat' },
          { id: 'phy-10-3', topicNumber: '10.3', titleEn: 'Measurement of Temperature' },
          { id: 'phy-10-4', topicNumber: '10.4', titleEn: 'Ideal-Gas Equation and Absolute Temperature' },
          { id: 'phy-10-5', topicNumber: '10.5', titleEn: 'Thermal Expansion' },
          { id: 'phy-10-6', topicNumber: '10.6', titleEn: 'Specific Heat Capacity' },
          { id: 'phy-10-7', topicNumber: '10.7', titleEn: 'Calorimetry' },
          { id: 'phy-10-8', topicNumber: '10.8', titleEn: 'Change of State' },
          { id: 'phy-10-9', topicNumber: '10.9', titleEn: 'Heat Transfer' },
          { id: 'phy-10-10', topicNumber: '10.10', titleEn: "Newton's Law of Cooling" }
        ]
      },
      {
        id: 'phy-11',
        chapterNumber: 11,
        titleEn: 'Thermodynamics',
        topics: [
          { id: 'phy-11-2', topicNumber: '11.2', titleEn: 'Thermal Equilibrium' },
          { id: 'phy-11-3', topicNumber: '11.3', titleEn: 'Zeroth Law of Thermodynamics' },
          { id: 'phy-11-4', topicNumber: '11.4', titleEn: 'Heat, Internal Energy and Work' },
          { id: 'phy-11-5', topicNumber: '11.5', titleEn: 'First Law of Thermodynamics' },
          { id: 'phy-11-6', topicNumber: '11.6', titleEn: 'Specific Heat Capacity' },
          { id: 'phy-11-7', topicNumber: '11.7', titleEn: 'Thermodynamic State Variables and Equation of State' },
          { id: 'phy-11-8', topicNumber: '11.8', titleEn: 'Thermodynamic Processes' },
          { id: 'phy-11-9', topicNumber: '11.9', titleEn: 'Second Law of Thermodynamics' },
          { id: 'phy-11-10', topicNumber: '11.10', titleEn: 'Reversible and Irreversible Processes' },
          { id: 'phy-11-11', topicNumber: '11.11', titleEn: 'Carnot Engine' }
        ]
      },
      {
        id: 'phy-12',
        chapterNumber: 12,
        titleEn: 'Kinetic Theory',
        topics: [
          { id: 'phy-12-2', topicNumber: '12.2', titleEn: 'Molecular Nature of Matter' },
          { id: 'phy-12-3', topicNumber: '12.3', titleEn: 'Behaviour of Gases' },
          { id: 'phy-12-4', topicNumber: '12.4', titleEn: 'Kinetic Theory of an Ideal Gas' },
          { id: 'phy-12-5', topicNumber: '12.5', titleEn: 'Law of Equipartition of Energy' },
          { id: 'phy-12-6', topicNumber: '12.6', titleEn: 'Specific Heat Capacity' },
          { id: 'phy-12-7', topicNumber: '12.7', titleEn: 'Mean Free Path' }
        ]
      },
      {
        id: 'phy-13',
        chapterNumber: 13,
        titleEn: 'Oscillations',
        topics: [
          { id: 'phy-13-2', topicNumber: '13.2', titleEn: 'Periodic and Oscillatory Motions' },
          { id: 'phy-13-3', topicNumber: '13.3', titleEn: 'Simple Harmonic Motion' },
          { id: 'phy-13-4', topicNumber: '13.4', titleEn: 'Simple Harmonic Motion and Uniform Circular Motion' },
          { id: 'phy-13-5', topicNumber: '13.5', titleEn: 'Velocity and Acceleration in Simple Harmonic Motion' },
          { id: 'phy-13-6', topicNumber: '13.6', titleEn: 'Force Law for Simple Harmonic Motion' },
          { id: 'phy-13-7', topicNumber: '13.7', titleEn: 'Energy in Simple Harmonic Motion' },
          { id: 'phy-13-8', topicNumber: '13.8', titleEn: 'The Simple Pendulum' }
        ]
      },
      {
        id: 'phy-14',
        chapterNumber: 14,
        titleEn: 'Waves',
        topics: [
          { id: 'phy-14-2', topicNumber: '14.2', titleEn: 'Transverse and Longitudinal Waves' },
          { id: 'phy-14-3', topicNumber: '14.3', titleEn: 'Displacement Relation in a Progressive Wave' },
          { id: 'phy-14-4', topicNumber: '14.4', titleEn: 'The Speed of a Travelling Wave' },
          { id: 'phy-14-5', topicNumber: '14.5', titleEn: 'The Principle of Superposition of Waves' },
          { id: 'phy-14-6', topicNumber: '14.6', titleEn: 'Reflection of Waves' },
          { id: 'phy-14-7', topicNumber: '14.7', titleEn: 'Beats' }
        ]
      }
    ]
  },

  // =========================================================
  // 2. CHEMISTRY (NCERT Class 11 Part 1 & Part 2 - 9 Chapters)
  // =========================================================
  {
    id: 'chemistry',
    nameEn: 'Chemistry',
    nameMl: 'രസതന്ത്രം',
    code: 'CHEM',
    category: 'science',
    color: 'from-purple-600 to-indigo-600',
    bgGradient: 'bg-gradient-to-r from-purple-600 to-indigo-600',
    borderColor: 'border-purple-200',
    chapters: [
      {
        id: 'chem-1',
        chapterNumber: 1,
        titleEn: 'Some Basic Concepts of Chemistry',
        topics: [
          { id: 'chem-1-1', topicNumber: '1.1', titleEn: 'Importance of Chemistry' },
          { id: 'chem-1-2', topicNumber: '1.2', titleEn: 'Nature of Matter' },
          { id: 'chem-1-3', topicNumber: '1.3', titleEn: 'Properties of Matter and their Measurement' },
          { id: 'chem-1-4', topicNumber: '1.4', titleEn: 'Uncertainty in Measurement' },
          { id: 'chem-1-5', topicNumber: '1.5', titleEn: 'Laws of Chemical Combinations' },
          { id: 'chem-1-6', topicNumber: '1.6', titleEn: "Dalton's Atomic Theory" },
          { id: 'chem-1-7', topicNumber: '1.7', titleEn: 'Atomic and Molecular Masses' },
          { id: 'chem-1-8', topicNumber: '1.8', titleEn: 'Mole Concept and Molar Masses' },
          { id: 'chem-1-9', topicNumber: '1.9', titleEn: 'Percentage Composition' },
          { id: 'chem-1-10', topicNumber: '1.10', titleEn: 'Stoichiometry and Stoichiometric Calculations' }
        ]
      },
      {
        id: 'chem-2',
        chapterNumber: 2,
        titleEn: 'Structure of Atom',
        topics: [
          { id: 'chem-2-1', topicNumber: '2.1', titleEn: 'Discovery of Sub-atomic Particles' },
          { id: 'chem-2-2', topicNumber: '2.2', titleEn: 'Atomic Models' },
          { id: 'chem-2-3', topicNumber: '2.3', titleEn: "Developments Leading to the Bohr's Model of Atom" },
          { id: 'chem-2-4', topicNumber: '2.4', titleEn: "Bohr's Model for Hydrogen Atom" },
          { id: 'chem-2-5', topicNumber: '2.5', titleEn: 'Towards Quantum Mechanical Model of the Atom' },
          { id: 'chem-2-6', topicNumber: '2.6', titleEn: 'Quantum Mechanical Model of Atom' }
        ]
      },
      {
        id: 'chem-3',
        chapterNumber: 3,
        titleEn: 'Classification of Elements and Periodicity in Properties',
        topics: [
          { id: 'chem-3-1', topicNumber: '3.1', titleEn: 'Why do we Need to Classify Elements?' },
          { id: 'chem-3-2', topicNumber: '3.2', titleEn: 'Genesis of Periodic Classification' },
          { id: 'chem-3-3', topicNumber: '3.3', titleEn: 'Modern Periodic Law and the Present Form of the Periodic Table' },
          { id: 'chem-3-4', topicNumber: '3.4', titleEn: 'Nomenclature of Elements with Atomic Numbers > 100' },
          { id: 'chem-3-5', topicNumber: '3.5', titleEn: 'Electronic Configurations of Elements and the Periodic Table' },
          { id: 'chem-3-6', topicNumber: '3.6', titleEn: 'Electronic Configurations and Types of Elements: s-, p-, d-, f- Blocks' },
          { id: 'chem-3-7', topicNumber: '3.7', titleEn: 'Periodic Trends in Properties of Elements' }
        ]
      },
      {
        id: 'chem-4',
        chapterNumber: 4,
        titleEn: 'Chemical Bonding and Molecular Structure',
        topics: [
          { id: 'chem-4-1', topicNumber: '4.1', titleEn: 'Kössel-Lewis Approach to Chemical Bonding' },
          { id: 'chem-4-2', topicNumber: '4.2', titleEn: 'Ionic or Electrovalent Bond' },
          { id: 'chem-4-3', topicNumber: '4.3', titleEn: 'Bond Parameters' },
          { id: 'chem-4-4', topicNumber: '4.4', titleEn: 'The Valence Shell Electron Pair Repulsion (VSEPR) Theory' },
          { id: 'chem-4-5', topicNumber: '4.5', titleEn: 'Valence Bond Theory' },
          { id: 'chem-4-6', topicNumber: '4.6', titleEn: 'Hybridisation' },
          { id: 'chem-4-7', topicNumber: '4.7', titleEn: 'Molecular Orbital Theory' },
          { id: 'chem-4-8', topicNumber: '4.8', titleEn: 'Bonding in Some Homonuclear Diatomic Molecules' },
          { id: 'chem-4-9', topicNumber: '4.9', titleEn: 'Hydrogen Bonding' }
        ]
      },
      {
        id: 'chem-5',
        chapterNumber: 5,
        titleEn: 'Thermodynamics',
        topics: [
          { id: 'chem-5-1', topicNumber: '5.1', titleEn: 'Thermodynamic Terms' },
          { id: 'chem-5-2', topicNumber: '5.2', titleEn: 'Applications' },
          { id: 'chem-5-3', topicNumber: '5.3', titleEn: 'Measurement of ∆U and ∆H: Calorimetry' },
          { id: 'chem-5-4', topicNumber: '5.4', titleEn: 'Enthalpy Change, ∆rH of a Reaction – Reaction Enthalpy' },
          { id: 'chem-5-5', topicNumber: '5.5', titleEn: 'Enthalpies for Different Types of Reactions' },
          { id: 'chem-5-6', topicNumber: '5.6', titleEn: 'Spontaneity' },
          { id: 'chem-5-7', topicNumber: '5.7', titleEn: 'Gibbs Energy Change and Equilibrium' }
        ]
      },
      {
        id: 'chem-6',
        chapterNumber: 6,
        titleEn: 'Equilibrium',
        topics: [
          { id: 'chem-6-1', topicNumber: '6.1', titleEn: 'Equilibrium in Physical Processes' },
          { id: 'chem-6-2', topicNumber: '6.2', titleEn: 'Equilibrium in Chemical Processes – Dynamic Equilibrium' },
          { id: 'chem-6-3', topicNumber: '6.3', titleEn: 'Law of Chemical Equilibrium and Equilibrium Constant' },
          { id: 'chem-6-4', topicNumber: '6.4', titleEn: 'Homogeneous Equilibria' },
          { id: 'chem-6-5', topicNumber: '6.5', titleEn: 'Heterogeneous Equilibria' },
          { id: 'chem-6-6', topicNumber: '6.6', titleEn: 'Applications of Equilibrium Constants' },
          { id: 'chem-6-7', topicNumber: '6.7', titleEn: 'Relationship between Equilibrium Constant K, Reaction Quotient Q and Gibbs Energy G' },
          { id: 'chem-6-8', topicNumber: '6.8', titleEn: 'Factors Affecting Equilibria' },
          { id: 'chem-6-9', topicNumber: '6.9', titleEn: 'Ionic Equilibrium in Solution' },
          { id: 'chem-6-10', topicNumber: '6.10', titleEn: 'Acids, Bases and Salts' },
          { id: 'chem-6-11', topicNumber: '6.11', titleEn: 'Ionization of Acids and Bases' },
          { id: 'chem-6-12', topicNumber: '6.12', titleEn: 'Buffer Solutions' },
          { id: 'chem-6-13', topicNumber: '6.13', titleEn: 'Solubility Equilibria of Sparingly Soluble Salts' }
        ]
      },
      {
        id: 'chem-7',
        chapterNumber: 7,
        titleEn: 'Redox Reactions',
        topics: [
          { id: 'chem-7-1', topicNumber: '7.1', titleEn: 'Classical Idea of Redox Reactions-Oxidation and Reduction Reactions' },
          { id: 'chem-7-2', topicNumber: '7.2', titleEn: 'Redox Reactions in Terms of Electron Transfer Reactions' },
          { id: 'chem-7-3', topicNumber: '7.3', titleEn: 'Oxidation Number' },
          { id: 'chem-7-4', topicNumber: '7.4', titleEn: 'Redox Reactions and Electrode Processes' }
        ]
      },
      {
        id: 'chem-8',
        chapterNumber: 8,
        titleEn: 'Organic Chemistry – Some Basic Principles and Techniques',
        topics: [
          { id: 'chem-8-2', topicNumber: '8.2', titleEn: 'Tetravalence of Carbon: Shapes of Organic Compounds' },
          { id: 'chem-8-3', topicNumber: '8.3', titleEn: 'Structural Representations of Organic Compounds' },
          { id: 'chem-8-4', topicNumber: '8.4', titleEn: 'Classification of Organic Compounds' },
          { id: 'chem-8-5', topicNumber: '8.5', titleEn: 'Nomenclature of Organic Compounds' },
          { id: 'chem-8-6', topicNumber: '8.6', titleEn: 'Isomerism' },
          { id: 'chem-8-7', topicNumber: '8.7', titleEn: 'Fundamental Concepts in Organic Reaction Mechanism' },
          { id: 'chem-8-8', topicNumber: '8.8', titleEn: 'Methods of Purification of Organic Compounds' },
          { id: 'chem-8-9', topicNumber: '8.9', titleEn: 'Qualitative Analysis of Organic Compounds' },
          { id: 'chem-8-10', topicNumber: '8.10', titleEn: 'Quantitative Analysis' }
        ]
      },
      {
        id: 'chem-9',
        chapterNumber: 9,
        titleEn: 'Hydrocarbons',
        topics: [
          { id: 'chem-9-1', topicNumber: '9.1', titleEn: 'Classification' },
          { id: 'chem-9-2', topicNumber: '9.2', titleEn: 'Alkanes' },
          { id: 'chem-9-3', topicNumber: '9.3', titleEn: 'Alkenes' },
          { id: 'chem-9-4', topicNumber: '9.4', titleEn: 'Alkynes' },
          { id: 'chem-9-5', topicNumber: '9.5', titleEn: 'Aromatic Hydrocarbon' },
          { id: 'chem-9-6', topicNumber: '9.6', titleEn: 'Carcinogenicity and Toxicity' }
        ]
      }
    ]
  },

  // =========================================================
  // 3. MATHEMATICS (NCERT Class 11 - 14 Chapters)
  // =========================================================
  {
    id: 'mathematics',
    nameEn: 'Mathematics',
    nameMl: 'ഗണിതം',
    code: 'MATH',
    category: 'science',
    color: 'from-blue-600 to-cyan-600',
    bgGradient: 'bg-gradient-to-r from-blue-600 to-cyan-600',
    borderColor: 'border-blue-200',
    chapters: [
      {
        id: 'math-1',
        chapterNumber: 1,
        titleEn: 'Sets',
        topics: [
          { id: 'math-1-2', topicNumber: '1.2', titleEn: 'Sets and their Representations' },
          { id: 'math-1-3', topicNumber: '1.3', titleEn: 'The Empty Set' },
          { id: 'math-1-4', topicNumber: '1.4', titleEn: 'Finite and Infinite Sets' },
          { id: 'math-1-5', topicNumber: '1.5', titleEn: 'Equal Sets' },
          { id: 'math-1-6', topicNumber: '1.6', titleEn: 'Subsets' },
          { id: 'math-1-7', topicNumber: '1.7', titleEn: 'Universal Set' },
          { id: 'math-1-8', topicNumber: '1.8', titleEn: 'Venn Diagrams' },
          { id: 'math-1-9', topicNumber: '1.9', titleEn: 'Operations on Sets' },
          { id: 'math-1-10', topicNumber: '1.10', titleEn: 'Complement of a Set' }
        ]
      },
      {
        id: 'math-2',
        chapterNumber: 2,
        titleEn: 'Relations and Functions',
        topics: [
          { id: 'math-2-2', topicNumber: '2.2', titleEn: 'Cartesian Product of Sets' },
          { id: 'math-2-3', topicNumber: '2.3', titleEn: 'Relations' },
          { id: 'math-2-4', topicNumber: '2.4', titleEn: 'Functions' }
        ]
      },
      {
        id: 'math-3',
        chapterNumber: 3,
        titleEn: 'Trigonometric Functions',
        topics: [
          { id: 'math-3-2', topicNumber: '3.2', titleEn: 'Angles' },
          { id: 'math-3-3', topicNumber: '3.3', titleEn: 'Trigonometric Functions' },
          { id: 'math-3-4', topicNumber: '3.4', titleEn: 'Trigonometric Functions of Sum and Difference of Two Angles' }
        ]
      },
      {
        id: 'math-4',
        chapterNumber: 4,
        titleEn: 'Complex Numbers and Quadratic Equations',
        topics: [
          { id: 'math-4-2', topicNumber: '4.2', titleEn: 'Complex Numbers' },
          { id: 'math-4-3', topicNumber: '4.3', titleEn: 'Algebra of Complex Numbers' },
          { id: 'math-4-4', topicNumber: '4.4', titleEn: 'The Modulus and the Conjugate of a Complex Number' },
          { id: 'math-4-5', topicNumber: '4.5', titleEn: 'Argand Plane and Polar Representation' }
        ]
      },
      {
        id: 'math-5',
        chapterNumber: 5,
        titleEn: 'Linear Inequalities',
        topics: [
          { id: 'math-5-2', topicNumber: '5.2', titleEn: 'Inequalities' },
          { id: 'math-5-3', topicNumber: '5.3', titleEn: 'Algebraic Solutions of Linear Inequalities in One Variable and their Graphical Representation' }
        ]
      },
      {
        id: 'math-6',
        chapterNumber: 6,
        titleEn: 'Permutations and Combinations',
        topics: [
          { id: 'math-6-2', topicNumber: '6.2', titleEn: 'Fundamental Principle of Counting' },
          { id: 'math-6-3', topicNumber: '6.3', titleEn: 'Permutations' },
          { id: 'math-6-4', topicNumber: '6.4', titleEn: 'Combinations' }
        ]
      },
      {
        id: 'math-7',
        chapterNumber: 7,
        titleEn: 'Binomial Theorem',
        topics: [
          { id: 'math-7-2', topicNumber: '7.2', titleEn: 'Binomial Theorem for Positive Integral Indices' }
        ]
      },
      {
        id: 'math-8',
        chapterNumber: 8,
        titleEn: 'Sequences and Series',
        topics: [
          { id: 'math-8-2', topicNumber: '8.2', titleEn: 'Sequences' },
          { id: 'math-8-3', topicNumber: '8.3', titleEn: 'Series' },
          { id: 'math-8-4', topicNumber: '8.4', titleEn: 'Geometric Progression (G.P.)' },
          { id: 'math-8-5', topicNumber: '8.5', titleEn: 'Relationship Between A.M. and G.M.' }
        ]
      },
      {
        id: 'math-9',
        chapterNumber: 9,
        titleEn: 'Straight Lines',
        topics: [
          { id: 'math-9-2', topicNumber: '9.2', titleEn: 'Slope of a Line' },
          { id: 'math-9-3', topicNumber: '9.3', titleEn: 'Various Forms of the Equation of a Line' },
          { id: 'math-9-4', topicNumber: '9.4', titleEn: 'Distance of a Point From a Line' }
        ]
      },
      {
        id: 'math-10',
        chapterNumber: 10,
        titleEn: 'Conic Sections',
        topics: [
          { id: 'math-10-2', topicNumber: '10.2', titleEn: 'Sections of a Cone' },
          { id: 'math-10-3', topicNumber: '10.3', titleEn: 'Circle' },
          { id: 'math-10-4', topicNumber: '10.4', titleEn: 'Parabola' },
          { id: 'math-10-5', topicNumber: '10.5', titleEn: 'Ellipse' },
          { id: 'math-10-6', topicNumber: '10.6', titleEn: 'Hyperbola' }
        ]
      },
      {
        id: 'math-11',
        chapterNumber: 11,
        titleEn: 'Introduction to Three Dimensional Geometry',
        topics: [
          { id: 'math-11-2', topicNumber: '11.2', titleEn: 'Coordinate Axes and Coordinate Planes in Three Dimensional Space' },
          { id: 'math-11-3', topicNumber: '11.3', titleEn: 'Coordinates of a Point in Space' },
          { id: 'math-11-4', topicNumber: '11.4', titleEn: 'Distance between Two Points' }
        ]
      },
      {
        id: 'math-12',
        chapterNumber: 12,
        titleEn: 'Limits and Derivatives',
        topics: [
          { id: 'math-12-2', topicNumber: '12.2', titleEn: 'Intuitive Idea of Derivatives' },
          { id: 'math-12-3', topicNumber: '12.3', titleEn: 'Limits' },
          { id: 'math-12-4', topicNumber: '12.4', titleEn: 'Limits of Trigonometric Functions' },
          { id: 'math-12-5', topicNumber: '12.5', titleEn: 'Derivatives' }
        ]
      },
      {
        id: 'math-13',
        chapterNumber: 13,
        titleEn: 'Statistics',
        topics: [
          { id: 'math-13-2', topicNumber: '13.2', titleEn: 'Measures of Dispersion' },
          { id: 'math-13-3', topicNumber: '13.3', titleEn: 'Range' },
          { id: 'math-13-4', topicNumber: '13.4', titleEn: 'Mean Deviation' },
          { id: 'math-13-5', topicNumber: '13.5', titleEn: 'Variance and Standard Deviation' }
        ]
      },
      {
        id: 'math-14',
        chapterNumber: 14,
        titleEn: 'Probability',
        topics: [
          { id: 'math-14-1', topicNumber: '14.1', titleEn: 'Event' },
          { id: 'math-14-2', topicNumber: '14.2', titleEn: 'Axiomatic Approach to Probability' }
        ]
      }
    ]
  },

  // =========================================================
  // 4. BIOLOGY (NCERT Class 11 - 19 Chapters)
  // =========================================================
  {
    id: 'biology',
    nameEn: 'Biology',
    nameMl: 'ജീവശാസ്ത്രം (Botany & Zoology)',
    code: 'BIO',
    category: 'science',
    color: 'from-emerald-600 to-teal-600',
    bgGradient: 'bg-gradient-to-r from-emerald-600 to-teal-600',
    borderColor: 'border-emerald-200',
    chapters: [
      // ---------------- BOTANY (Plus One) ----------------
      {
        id: 'bio-1',
        chapterNumber: 1,
        unitEn: 'Botany',
        titleEn: 'The Living World',
        topics: [
          { id: 'bio-1-1', topicNumber: '1.1', titleEn: 'Diversity in the Living World' },
          { id: 'bio-1-2', topicNumber: '1.2', titleEn: 'Taxonomic Categories' }
        ]
      },
      {
        id: 'bio-2',
        chapterNumber: 2,
        unitEn: 'Botany',
        titleEn: 'Biological Classification',
        topics: [
          { id: 'bio-2-1', topicNumber: '2.1', titleEn: 'Kingdom Monera' },
          { id: 'bio-2-2', topicNumber: '2.2', titleEn: 'Kingdom Protista' },
          { id: 'bio-2-3', topicNumber: '2.3', titleEn: 'Kingdom Fungi' },
          { id: 'bio-2-4', topicNumber: '2.4', titleEn: 'Kingdom Plantae' },
          { id: 'bio-2-5', topicNumber: '2.5', titleEn: 'Kingdom Animalia' },
          { id: 'bio-2-6', topicNumber: '2.6', titleEn: 'Viruses, Viroids, Prions and Lichens' }
        ]
      },
      {
        id: 'bio-3',
        chapterNumber: 3,
        unitEn: 'Botany',
        titleEn: 'Plant Kingdom',
        topics: [
          { id: 'bio-3-1', topicNumber: '3.1', titleEn: 'Algae' },
          { id: 'bio-3-2', topicNumber: '3.2', titleEn: 'Bryophytes' },
          { id: 'bio-3-3', topicNumber: '3.3', titleEn: 'Pteridophytes' },
          { id: 'bio-3-4', topicNumber: '3.4', titleEn: 'Gymnosperms' },
          { id: 'bio-3-5', topicNumber: '3.5', titleEn: 'Angiosperms' }
        ]
      },
      {
        id: 'bio-4',
        chapterNumber: 4,
        unitEn: 'Botany',
        titleEn: 'Morphology of Flowering Plants',
        topics: [
          { id: 'bio-4-1', topicNumber: '5.1', titleEn: 'The Root' },
          { id: 'bio-4-2', topicNumber: '5.2', titleEn: 'The Stem' },
          { id: 'bio-4-3', topicNumber: '5.3', titleEn: 'The Leaf' },
          { id: 'bio-4-4', topicNumber: '5.4', titleEn: 'The Inflorescence' },
          { id: 'bio-4-5', topicNumber: '5.5', titleEn: 'The Flower' },
          { id: 'bio-4-6', topicNumber: '5.6', titleEn: 'The Fruit' },
          { id: 'bio-4-7', topicNumber: '5.7', titleEn: 'The Seed' },
          { id: 'bio-4-8', topicNumber: '5.8', titleEn: 'Semi-technical Description of a Typical Flowering Plant' },
          { id: 'bio-4-9', topicNumber: '5.9', titleEn: 'Description of Family Solanaceae' }
        ]
      },
      {
        id: 'bio-5',
        chapterNumber: 5,
        unitEn: 'Botany',
        titleEn: 'Anatomy of Flowering Plants',
        topics: [
          { id: 'bio-5-1', topicNumber: '6.1', titleEn: 'The Tissue System' },
          { id: 'bio-5-2', topicNumber: '6.2', titleEn: 'Anatomy of Dicotyledonous and Monocotyledonous Plants' }
        ]
      },
      {
        id: 'bio-6',
        chapterNumber: 6,
        unitEn: 'Botany',
        titleEn: 'Cell : The Unit of Life',
        topics: [
          { id: 'bio-6-1', topicNumber: '8.1', titleEn: 'What is a Cell?' },
          { id: 'bio-6-2', topicNumber: '8.2', titleEn: 'Cell Theory' },
          { id: 'bio-6-3', topicNumber: '8.3', titleEn: 'An Overview of Cell' },
          { id: 'bio-6-4', topicNumber: '8.4', titleEn: 'Prokaryotic Cells' },
          { id: 'bio-6-5', topicNumber: '8.5', titleEn: 'Eukaryotic Cells' }
        ]
      },
      {
        id: 'bio-7',
        chapterNumber: 7,
        unitEn: 'Botany',
        titleEn: 'Cell Cycle and Cell Division',
        topics: [
          { id: 'bio-7-1', topicNumber: '10.1', titleEn: 'Cell Cycle' },
          { id: 'bio-7-2', topicNumber: '10.2', titleEn: 'M Phase' },
          { id: 'bio-7-3', topicNumber: '10.3', titleEn: 'Significance of Mitosis' },
          { id: 'bio-7-4', topicNumber: '10.4', titleEn: 'Meiosis' },
          { id: 'bio-7-5', topicNumber: '10.5', titleEn: 'Significance of Meiosis' }
        ]
      },
      {
        id: 'bio-8',
        chapterNumber: 8,
        unitEn: 'Botany',
        titleEn: 'Photosynthesis in Higher Plants',
        topics: [
          { id: 'bio-8-1', topicNumber: '11.1', titleEn: 'What do we Know?' },
          { id: 'bio-8-2', topicNumber: '11.2', titleEn: 'Early Experiments' },
          { id: 'bio-8-3', topicNumber: '11.3', titleEn: 'Where does Photosynthesis take place?' },
          { id: 'bio-8-4', topicNumber: '11.4', titleEn: 'How many Types of Pigments are Involved in Photosynthesis?' },
          { id: 'bio-8-5', topicNumber: '11.5', titleEn: 'What is Light Reaction?' },
          { id: 'bio-8-6', topicNumber: '11.6', titleEn: 'The Electron Transport' },
          { id: 'bio-8-7', topicNumber: '11.7', titleEn: 'Where are the ATP and NADPH Used?' },
          { id: 'bio-8-8', topicNumber: '11.8', titleEn: 'The C4 Pathway' },
          { id: 'bio-8-9', topicNumber: '11.9', titleEn: 'Photorespiration' },
          { id: 'bio-8-10', topicNumber: '11.10', titleEn: 'Factors affecting Photosynthesis' }
        ]
      },
      {
        id: 'bio-9',
        chapterNumber: 9,
        unitEn: 'Botany',
        titleEn: 'Respiration in Plants',
        topics: [
          { id: 'bio-9-1', topicNumber: '12.1', titleEn: 'Do Plants Breathe?' },
          { id: 'bio-9-2', topicNumber: '12.2', titleEn: 'Glycolysis' },
          { id: 'bio-9-3', topicNumber: '12.3', titleEn: 'Fermentation' },
          { id: 'bio-9-4', topicNumber: '12.4', titleEn: 'Aerobic Respiration' },
          { id: 'bio-9-5', topicNumber: '12.5', titleEn: 'The Respiratory Balance Sheet' },
          { id: 'bio-9-6', topicNumber: '12.6', titleEn: 'Amphibolic Pathway' },
          { id: 'bio-9-7', topicNumber: '12.7', titleEn: 'Respiratory Quotient' }
        ]
      },
      {
        id: 'bio-10',
        chapterNumber: 10,
        unitEn: 'Botany',
        titleEn: 'Plant Growth and Development',
        topics: [
          { id: 'bio-10-1', topicNumber: '13.1', titleEn: 'Growth' },
          { id: 'bio-10-2', topicNumber: '13.2', titleEn: 'Differentiation, Dedifferentiation and Redifferentiation' },
          { id: 'bio-10-3', topicNumber: '13.3', titleEn: 'Development' },
          { id: 'bio-10-4', topicNumber: '13.4', titleEn: 'Plant Growth Regulators' }
        ]
      },

      // ---------------- ZOOLOGY (Plus One) ----------------
      {
        id: 'bio-11',
        chapterNumber: 11,
        unitEn: 'Zoology',
        titleEn: 'Animal Kingdom',
        topics: [
          { id: 'bio-11-1', topicNumber: '4.1', titleEn: 'Basis of Classification' },
          { id: 'bio-11-2', topicNumber: '4.2', titleEn: 'Classification of Animals' }
        ]
      },
      {
        id: 'bio-12',
        chapterNumber: 12,
        unitEn: 'Zoology',
        titleEn: 'Structural Organisation in Animals',
        topics: [
          { id: 'bio-12-1', topicNumber: '7.1', titleEn: 'Organ and Organ System' },
          { id: 'bio-12-2', topicNumber: '7.2', titleEn: 'Frogs' }
        ]
      },
      {
        id: 'bio-13',
        chapterNumber: 13,
        unitEn: 'Zoology',
        titleEn: 'Biomolecules',
        topics: [
          { id: 'bio-13-1', topicNumber: '9.1', titleEn: 'How to Analyse Chemical Composition?' },
          { id: 'bio-13-2', topicNumber: '9.2', titleEn: 'Primary and Secondary Metabolites' },
          { id: 'bio-13-3', topicNumber: '9.3', titleEn: 'Biomacromolecules' },
          { id: 'bio-13-4', topicNumber: '9.4', titleEn: 'Proteins' },
          { id: 'bio-13-5', topicNumber: '9.5', titleEn: 'Polysaccharides' },
          { id: 'bio-13-6', topicNumber: '9.6', titleEn: 'Nucleic Acids' },
          { id: 'bio-13-7', topicNumber: '9.7', titleEn: 'Structure of Proteins' },
          { id: 'bio-13-8', topicNumber: '9.8', titleEn: 'Enzymes' }
        ]
      },
      {
        id: 'bio-14',
        chapterNumber: 14,
        unitEn: 'Zoology',
        titleEn: 'Breathing and Exchange of Gases',
        topics: [
          { id: 'bio-14-1', topicNumber: '14.1', titleEn: 'Respiratory Organs' },
          { id: 'bio-14-2', topicNumber: '14.2', titleEn: 'Mechanism of Breathing' },
          { id: 'bio-14-3', topicNumber: '14.3', titleEn: 'Exchange of Gases' },
          { id: 'bio-14-4', topicNumber: '14.4', titleEn: 'Transport of Gases' },
          { id: 'bio-14-5', topicNumber: '14.5', titleEn: 'Regulation of Respiration' },
          { id: 'bio-14-6', topicNumber: '14.6', titleEn: 'Disorders of Respiratory System' }
        ]
      },
      {
        id: 'bio-15',
        chapterNumber: 15,
        unitEn: 'Zoology',
        titleEn: 'Body Fluids and Circulation',
        topics: [
          { id: 'bio-15-1', topicNumber: '15.1', titleEn: 'Blood' },
          { id: 'bio-15-2', topicNumber: '15.2', titleEn: 'Lymph (Tissue Fluid)' },
          { id: 'bio-15-3', topicNumber: '15.3', titleEn: 'Circulatory Pathways' },
          { id: 'bio-15-4', topicNumber: '15.4', titleEn: 'Double Circulation' },
          { id: 'bio-15-5', topicNumber: '15.5', titleEn: 'Regulation of Cardiac Activity' },
          { id: 'bio-15-6', topicNumber: '15.6', titleEn: 'Disorders of Circulatory System' }
        ]
      },
      {
        id: 'bio-16',
        chapterNumber: 16,
        unitEn: 'Zoology',
        titleEn: 'Excretory Products and their Elimination',
        topics: [
          { id: 'bio-16-1', topicNumber: '16.1', titleEn: 'Human Excretory System' },
          { id: 'bio-16-2', topicNumber: '16.2', titleEn: 'Urine Formation' },
          { id: 'bio-16-3', topicNumber: '16.3', titleEn: 'Function of the Tubules' },
          { id: 'bio-16-4', topicNumber: '16.4', titleEn: 'Mechanism of Concentration of the Filtrate' },
          { id: 'bio-16-5', topicNumber: '16.5', titleEn: 'Regulation of Kidney Function' },
          { id: 'bio-16-6', topicNumber: '16.6', titleEn: 'Micturition' },
          { id: 'bio-16-7', topicNumber: '16.7', titleEn: 'Role of other Organs in Excretion' },
          { id: 'bio-16-8', topicNumber: '16.8', titleEn: 'Disorders of the Excretory System' }
        ]
      },
      {
        id: 'bio-17',
        chapterNumber: 17,
        unitEn: 'Zoology',
        titleEn: 'Locomotion and Movement',
        topics: [
          { id: 'bio-17-1', topicNumber: '17.1', titleEn: 'Types of Movement' },
          { id: 'bio-17-2', topicNumber: '17.2', titleEn: 'Muscle' },
          { id: 'bio-17-3', topicNumber: '17.3', titleEn: 'Skeletal System' },
          { id: 'bio-17-4', topicNumber: '17.4', titleEn: 'Joints' },
          { id: 'bio-17-5', topicNumber: '17.5', titleEn: 'Disorders of Muscular and Skeletal System' }
        ]
      },
      {
        id: 'bio-18',
        chapterNumber: 18,
        unitEn: 'Zoology',
        titleEn: 'Neural Control and Coordination',
        topics: [
          { id: 'bio-18-1', topicNumber: '18.1', titleEn: 'Neural System' },
          { id: 'bio-18-2', topicNumber: '18.2', titleEn: 'Human Neural System' },
          { id: 'bio-18-3', topicNumber: '18.3', titleEn: 'Neuron as Structural and Functional Unit of Neural System' },
          { id: 'bio-18-4', topicNumber: '18.4', titleEn: 'Central Neural System' }
        ]
      },
      {
        id: 'bio-19',
        chapterNumber: 19,
        unitEn: 'Zoology',
        titleEn: 'Chemical Coordination and Integration',
        topics: [
          { id: 'bio-19-1', topicNumber: '19.1', titleEn: 'Endocrine Glands and Hormones' },
          { id: 'bio-19-2', topicNumber: '19.2', titleEn: 'Human Endocrine System' },
          { id: 'bio-19-3', topicNumber: '19.3', titleEn: 'Hormones of Heart, Kidney and Gastrointestinal Tract' },
          { id: 'bio-19-4', topicNumber: '19.4', titleEn: 'Mechanism of Hormone Action' }
        ]
      }
    ]
  },

  // =========================================================
  // 5. COMPUTER SCIENCE (10 Chapters - Numbered)
  // =========================================================
  {
    id: 'computer_science',
    nameEn: 'Computer Science',
    nameMl: 'കമ്പ്യൂട്ടർ സയൻസ്',
    code: 'CS',
    category: 'computer_science',
    color: 'from-cyan-600 to-teal-600',
    bgGradient: 'bg-gradient-to-r from-cyan-600 to-teal-600',
    borderColor: 'border-cyan-200',
    chapters: createNumberedChapters('cs', 10)
  },

  // =========================================================
  // 6. ENGLISH (19 Chapters)
  // =========================================================
  {
    id: 'english',
    nameEn: 'English',
    nameMl: 'ഇംഗ്ലീഷ്',
    code: 'ENG',
    category: 'language',
    color: 'from-amber-600 to-rose-600',
    bgGradient: 'bg-gradient-to-r from-amber-600 to-rose-600',
    borderColor: 'border-amber-200',
    chapters: createNumberedChapters('eng', 19)
  },

  // =========================================================
  // 7. SECOND LANGUAGE (Malayalam / Hindi / Arabic / Urdu)
  // =========================================================
  {
    id: 'language',
    nameEn: 'Language (Second Language)',
    nameMl: 'രണ്ടാം ഭാഷ (Second Language)',
    code: 'LANG',
    category: 'language',
    color: 'from-pink-600 to-purple-600',
    bgGradient: 'bg-gradient-to-r from-pink-600 to-purple-600',
    borderColor: 'border-pink-200',
    chapters: createNumberedChapters('lang', 10)
  }
];

// Available options for registration multi-select
export const AVAILABLE_IMPROVEMENT_OPTIONS = [
  { id: 'physics', name: 'Physics', code: 'PHY', icon: 'Zap', desc: '14 Plus One Chapters • NCERT Subsections' },
  { id: 'chemistry', name: 'Chemistry', code: 'CHEM', icon: 'FlaskConical', desc: '9 Plus One Chapters • NCERT Subsections' },
  { id: 'mathematics', name: 'Mathematics', code: 'MATH', icon: 'Calculator', desc: '14 Plus One Chapters • NCERT Subsections' },
  { id: 'biology', name: 'Biology (Botany & Zoology)', code: 'BIO', icon: 'Dna', desc: '19 Plus One Chapters • NCERT Subsections' },
  { id: 'computer_science', name: 'Computer Science', code: 'CS', icon: 'Cpu', desc: '10 Plus One Chapters' },
  { id: 'english', name: 'English', code: 'ENG', icon: 'BookOpen', desc: '19 Chapters' },
  { id: 'language', name: 'Language (Malayalam/Hindi/Arabic/Urdu)', code: 'LANG', icon: 'Languages', desc: 'Custom Chapters' }
];

export function getImprovementSubjectList(
  selectedIds?: string[],
  secondLanguage?: ImprovementSecondLanguage,
  languageChapterCount?: number
): ImprovementSubjectDef[] {
  // If no specific selection, default to core science
  const effectiveIds = (selectedIds && selectedIds.length > 0)
    ? selectedIds
    : ['physics', 'chemistry', 'biology', 'mathematics'];

  const count = languageChapterCount || 10;
  const result: ImprovementSubjectDef[] = [];

  effectiveIds.forEach((id) => {
    // Check if ID matches a specific language subject or generic 'language'
    if (id === 'language') {
      const specificLangFactory = secondLanguage ? IMPROVEMENT_LANGUAGE_SUBJECTS[secondLanguage] : null;
      if (specificLangFactory) {
        result.push(specificLangFactory(count));
      } else {
        const langSub: ImprovementSubjectDef = {
          id: 'language',
          nameEn: 'Language (Second Language)',
          nameMl: 'രണ്ടാം ഭാഷ',
          code: 'LANG',
          category: 'language',
          color: 'from-pink-600 to-purple-600',
          bgGradient: 'bg-gradient-to-r from-pink-600 to-purple-600',
          borderColor: 'border-pink-200',
          chapters: createNumberedChapters('lang', count)
        };
        result.push(langSub);
      }
    } else if (id === 'malayalam' || id === 'hindi' || id === 'arabic' || id === 'urdu') {
      const capitalized = (id.charAt(0).toUpperCase() + id.slice(1)) as ImprovementSecondLanguage;
      const langFactory = IMPROVEMENT_LANGUAGE_SUBJECTS[capitalized];
      if (langFactory) {
        result.push(langFactory(count));
      }
    } else {
      const match = ALL_IMPROVEMENT_SUBJECTS.find(s => s.id === id);
      if (match) result.push(match);
    }
  });

  return result;
}
