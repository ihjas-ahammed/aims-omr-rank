export type PlusOneBatch = 'A1' | 'A2';
export type PlusOneSubject = 'physics' | 'mathematics';

export interface PlusOneTopicDef {
  id: string;
  topicNumber?: string;
  titleEn: string;
}

export interface PlusOneScheduleItem {
  id: string;
  subject: PlusOneSubject;
  weekNumber: 1 | 2;
  chapterNumber?: number;
  title: string;
  dateIso: string; // "YYYY-MM-DD" e.g. "2026-10-04"
  dateFormatted: string; // "04.Oct.2026"
  dateDisplay: string; // "Sun, 04 Oct 2026"
  dayName: string; // "Sunday"
  isExam?: boolean;
  isRevisionOnly?: boolean;
  examSubject?: 'Physics' | 'Mathematics';
  topics: PlusOneTopicDef[];
}

export interface PlusOneScheduleDef {
  batch: PlusOneBatch;
  title: string;
  physicsExamDate: string; // "2026-10-11" or "2026-10-12"
  physicsExamDisplay: string;
  mathsExamDate: string; // "2026-10-17"
  mathsExamDisplay: string;
  startDateIso: string;
  endDateIso: string;
  items: PlusOneScheduleItem[];
}

// -------------------------------------------------------------
// NCERT SUBTOPICS FOR PLUS ONE CHAPTERS IN docs/plus_one_study.pdf
// -------------------------------------------------------------
const TOPICS_UNITS_MEASUREMENT: PlusOneTopicDef[] = [
  { id: 'phy-1-2', topicNumber: '1.2', titleEn: 'The International System of Units (SI)' },
  { id: 'phy-1-3', topicNumber: '1.3', titleEn: 'Significant Figures & Rounding Off' },
  { id: 'phy-1-4', topicNumber: '1.4', titleEn: 'Dimensions of Physical Quantities' },
  { id: 'phy-1-5', topicNumber: '1.5', titleEn: 'Dimensional Formulae & Equations' },
  { id: 'phy-1-6', topicNumber: '1.6', titleEn: 'Dimensional Analysis & Applications' },
  { id: 'phy-1-pyq', topicNumber: 'PYQ', titleEn: 'Previous Year Exam Questions & Numerical Practice' }
];

const TOPICS_MOTION_STRAIGHT: PlusOneTopicDef[] = [
  { id: 'phy-2-2', topicNumber: '2.2', titleEn: 'Instantaneous Velocity & Speed' },
  { id: 'phy-2-3', topicNumber: '2.3', titleEn: 'Acceleration & Velocity-Time Graphs' },
  { id: 'phy-2-4', topicNumber: '2.4', titleEn: 'Kinematic Equations for Uniform Acceleration' },
  { id: 'phy-2-pyq', topicNumber: 'PYQ', titleEn: 'Previous Year Exam Questions & Numerical Practice' }
];

const TOPICS_MOTION_PLANE: PlusOneTopicDef[] = [
  { id: 'phy-3-2', topicNumber: '3.2', titleEn: 'Scalars and Vectors & Vector Addition' },
  { id: 'phy-3-5', topicNumber: '3.5', titleEn: 'Resolution of Vectors & Unit Vectors' },
  { id: 'phy-3-7', topicNumber: '3.7', titleEn: 'Motion in a Plane with Constant Acceleration' },
  { id: 'phy-3-9', topicNumber: '3.9', titleEn: 'Projectile Motion (Range, Height, Time of Flight)' },
  { id: 'phy-3-10', topicNumber: '3.10', titleEn: 'Uniform Circular Motion & Centripetal Acceleration' },
  { id: 'phy-3-pyq', topicNumber: 'PYQ', titleEn: 'Previous Year Exam Questions & Derivations' }
];

const TOPICS_LAWS_MOTION: PlusOneTopicDef[] = [
  { id: 'phy-4-2', topicNumber: '4.2', titleEn: "Law of Inertia & Newton's First Law" },
  { id: 'phy-4-5', topicNumber: '4.5', titleEn: "Newton's Second Law & Momentum" },
  { id: 'phy-4-6', topicNumber: '4.6', titleEn: "Newton's Third Law & Conservation of Momentum" },
  { id: 'phy-4-9', topicNumber: '4.9', titleEn: 'Static & Kinetic Friction & Circular Banking' },
  { id: 'phy-4-11', topicNumber: '4.11', titleEn: 'Solving Mechanics Problems (Free Body Diagrams)' },
  { id: 'phy-4-pyq', topicNumber: 'PYQ', titleEn: 'Previous Year Exam Questions & Derivations' }
];

const TOPICS_WORK_ENERGY_POWER: PlusOneTopicDef[] = [
  { id: 'phy-5-2', topicNumber: '5.2', titleEn: 'Work-Energy Theorem for Constant & Variable Force' },
  { id: 'phy-5-3', topicNumber: '5.3', titleEn: 'Work & Kinetic Energy' },
  { id: 'phy-5-7', topicNumber: '5.7', titleEn: 'Potential Energy & Conservation of Mechanical Energy' },
  { id: 'phy-5-9', topicNumber: '5.9', titleEn: 'Potential Energy of Spring' },
  { id: 'phy-5-10', topicNumber: '5.10', titleEn: 'Power & Elastic/Inelastic Collisions in 1D' },
  { id: 'phy-5-pyq', topicNumber: 'PYQ', titleEn: 'Previous Year Exam Questions & Derivations' }
];

const TOPICS_SYSTEM_PARTICLES: PlusOneTopicDef[] = [
  { id: 'phy-6-2', topicNumber: '6.2', titleEn: 'Centre of Mass & Motion of Centre of Mass' },
  { id: 'phy-6-5', topicNumber: '6.5', titleEn: 'Vector Product (Cross Product) of Vectors' },
  { id: 'phy-6-6', topicNumber: '6.6', titleEn: 'Angular Velocity & Relation with Linear Velocity' },
  { id: 'phy-6-7', topicNumber: '6.7', titleEn: 'Torque, Angular Momentum & Conservation' },
  { id: 'phy-6-9', topicNumber: '6.9', titleEn: 'Moment of Inertia of Standard Rigid Bodies' },
  { id: 'phy-6-pyq', topicNumber: 'PYQ', titleEn: 'Previous Year Exam Questions & Derivations' }
];

const TOPICS_SOLIDS_REVISION: PlusOneTopicDef[] = [
  { id: 'phy-8-2', topicNumber: '8.2', titleEn: 'Stress and Strain & Hooke’s Law' },
  { id: 'phy-8-4', topicNumber: '8.4', titleEn: 'Stress-Strain Curve & Elastic Moduli (Young, Shear, Bulk)' },
  { id: 'phy-8-6', topicNumber: '8.6', titleEn: 'Applications of Elastic Behaviour' },
  { id: 'phy-8-rev', topicNumber: 'REV', titleEn: 'Week 1 Physics Quick Formula Revision & Mock Practice' },
  { id: 'phy-8-pyq', topicNumber: 'PYQ', titleEn: 'Previous Year Exam Questions' }
];

const TOPICS_SOLIDS_ONLY: PlusOneTopicDef[] = [
  { id: 'phy-8-2', topicNumber: '8.2', titleEn: 'Stress and Strain & Hooke’s Law' },
  { id: 'phy-8-4', topicNumber: '8.4', titleEn: 'Stress-Strain Curve & Elastic Moduli (Young, Shear, Bulk)' },
  { id: 'phy-8-6', topicNumber: '8.6', titleEn: 'Applications of Elastic Behaviour' },
  { id: 'phy-8-pyq', topicNumber: 'PYQ', titleEn: 'Previous Year Exam Questions' }
];

const TOPICS_FULL_PHYSICS_REVISION: PlusOneTopicDef[] = [
  { id: 'phy-rev-1', topicNumber: 'REV', titleEn: 'High-Yield Formula Sheet Revision (All 6 Chapters)' },
  { id: 'phy-rev-2', topicNumber: 'DERIV', titleEn: 'Core Derivations & Graph Drawing Practice' },
  { id: 'phy-rev-3', topicNumber: 'MOCK', titleEn: 'Physics Exam Mock Test & Previous Question Bank' }
];

// MATHEMATICS
const TOPICS_SETS_INEQUALITIES: PlusOneTopicDef[] = [
  { id: 'math-1-1', topicNumber: 'Sets', titleEn: 'Sets, Subsets, Universal Set & Venn Diagrams' },
  { id: 'math-1-2', topicNumber: 'Sets', titleEn: 'Union, Intersection & Complement of Sets' },
  { id: 'math-5-1', topicNumber: 'Ineq', titleEn: 'Algebraic Solutions of Linear Inequalities in One Variable' },
  { id: 'math-5-2', topicNumber: 'Ineq', titleEn: 'Graphical Representation of Linear Inequalities' },
  { id: 'math-1-pyq', topicNumber: 'PYQ', titleEn: 'Previous Year Exam Questions Practice' }
];

const TOPICS_RELATIONS_FUNCTIONS: PlusOneTopicDef[] = [
  { id: 'math-2-1', topicNumber: '2.1', titleEn: 'Cartesian Product of Sets' },
  { id: 'math-2-2', topicNumber: '2.2', titleEn: 'Relations: Domain, Co-domain & Range' },
  { id: 'math-2-3', topicNumber: '2.3', titleEn: 'Functions & Graphs (Identity, Polynomial, Rational, Modulus, Signum)' },
  { id: 'math-2-pyq', topicNumber: 'PYQ', titleEn: 'Previous Year Exam Questions Practice' }
];

const TOPICS_TRIGONOMETRY: PlusOneTopicDef[] = [
  { id: 'math-3-1', topicNumber: '3.1', titleEn: 'Angles & Radian Measure Conversion' },
  { id: 'math-3-2', topicNumber: '3.2', titleEn: 'Trigonometric Functions & Sign in Quadrants' },
  { id: 'math-3-3', topicNumber: '3.3', titleEn: 'Compound Angles: sin(x±y), cos(x±y), tan(x±y)' },
  { id: 'math-3-4', topicNumber: '3.4', titleEn: 'Multiple Angle Formulas: sin 2x, cos 2x, tan 2x' },
  { id: 'math-3-pyq', topicNumber: 'PYQ', titleEn: 'Previous Year Proofs & Exam Questions' }
];

const TOPICS_COMPLEX_NUMBERS: PlusOneTopicDef[] = [
  { id: 'math-4-1', topicNumber: '4.1', titleEn: 'Algebra of Complex Numbers & Modulus/Conjugate' },
  { id: 'math-4-2', topicNumber: '4.2', titleEn: 'Argand Plane Representation' },
  { id: 'math-4-3', topicNumber: '4.3', titleEn: 'Quadratic Equations with Complex Roots' },
  { id: 'math-4-pyq', topicNumber: 'PYQ', titleEn: 'Previous Year Exam Questions Practice' }
];

const TOPICS_PERM_COMB_BINOMIAL: PlusOneTopicDef[] = [
  { id: 'math-6-1', topicNumber: '6.1', titleEn: 'Fundamental Principle of Counting (Multiplication & Addition)' },
  { id: 'math-6-2', topicNumber: '6.2', titleEn: 'Permutations: Formula nPr & Word Permutations' },
  { id: 'math-6-3', topicNumber: '6.3', titleEn: 'Combinations: Formula nCr & Applications' },
  { id: 'math-7-1', topicNumber: '7.1', titleEn: 'Binomial Theorem for Positive Integral Indices' },
  { id: 'math-6-pyq', topicNumber: 'PYQ', titleEn: 'Previous Year Exam Questions Practice' }
];

const TOPICS_PERM_COMB_ONLY: PlusOneTopicDef[] = [
  { id: 'math-6-1', topicNumber: '6.1', titleEn: 'Fundamental Principle of Counting (Multiplication & Addition)' },
  { id: 'math-6-2', topicNumber: '6.2', titleEn: 'Permutations: Formula nPr & Word Permutations' },
  { id: 'math-6-3', topicNumber: '6.3', titleEn: 'Combinations: Formula nCr & Practical Applications' },
  { id: 'math-6-pyq', topicNumber: 'PYQ', titleEn: 'Previous Year Exam Questions Practice' }
];

// -------------------------------------------------------------
// BATCH A1 SCHEDULE DEFINITION (PAGE 1 OF PDF)
// Week 01 Physics: 04–11 Oct 2026 (Physics Exam: 11 Oct)
// Week 02 Mathematics: 12–17 Oct 2026 (Maths Exam: 17 Oct)
// -------------------------------------------------------------
export const PLUS_ONE_SCHEDULE_A1: PlusOneScheduleDef = {
  batch: 'A1',
  title: 'PLUS ONE STUDY PLANNER BATCH A1',
  physicsExamDate: '2026-10-11',
  physicsExamDisplay: '11.Oct.2026',
  mathsExamDate: '2026-10-17',
  mathsExamDisplay: '17.Oct.2026',
  startDateIso: '2026-10-04',
  endDateIso: '2026-10-17',
  items: [
    // --- WEEK 01 PHYSICS ---
    {
      id: 'a1-phy-units',
      subject: 'physics',
      weekNumber: 1,
      chapterNumber: 1,
      title: 'Units & Measurement',
      dateIso: '2026-10-04',
      dateFormatted: '04.Oct.2026',
      dateDisplay: 'Sun, 04 Oct 2026',
      dayName: 'Sunday',
      topics: TOPICS_UNITS_MEASUREMENT
    },
    {
      id: 'a1-phy-straight-line',
      subject: 'physics',
      weekNumber: 1,
      chapterNumber: 2,
      title: 'Motion in a Straight Line',
      dateIso: '2026-10-05',
      dateFormatted: '05.Oct.2026',
      dateDisplay: 'Mon, 05 Oct 2026',
      dayName: 'Monday',
      topics: TOPICS_MOTION_STRAIGHT
    },
    {
      id: 'a1-phy-plane',
      subject: 'physics',
      weekNumber: 1,
      chapterNumber: 3,
      title: 'Motion in a Plane',
      dateIso: '2026-10-06',
      dateFormatted: '06.Oct.2026',
      dateDisplay: 'Tue, 06 Oct 2026',
      dayName: 'Tuesday',
      topics: TOPICS_MOTION_PLANE
    },
    {
      id: 'a1-phy-laws-motion',
      subject: 'physics',
      weekNumber: 1,
      chapterNumber: 4,
      title: 'Laws of Motion',
      dateIso: '2026-10-07',
      dateFormatted: '07.Oct.2026',
      dateDisplay: 'Wed, 07 Oct 2026',
      dayName: 'Wednesday',
      topics: TOPICS_LAWS_MOTION
    },
    {
      id: 'a1-phy-work-energy',
      subject: 'physics',
      weekNumber: 1,
      chapterNumber: 5,
      title: 'Work, Energy & Power',
      dateIso: '2026-10-08',
      dateFormatted: '08.Oct.2026',
      dateDisplay: 'Thu, 08 Oct 2026',
      dayName: 'Thursday',
      topics: TOPICS_WORK_ENERGY_POWER
    },
    {
      id: 'a1-phy-rotational',
      subject: 'physics',
      weekNumber: 1,
      chapterNumber: 6,
      title: 'System of Particles & Rotational Motion',
      dateIso: '2026-10-09',
      dateFormatted: '09.Oct.2026',
      dateDisplay: 'Fri, 09 Oct 2026',
      dayName: 'Friday',
      topics: TOPICS_SYSTEM_PARTICLES
    },
    {
      id: 'a1-phy-solids-rev',
      subject: 'physics',
      weekNumber: 1,
      chapterNumber: 7,
      title: 'Mechanical Properties of Solids & Revision',
      dateIso: '2026-10-10',
      dateFormatted: '10.Oct.2026',
      dateDisplay: 'Sat, 10 Oct 2026',
      dayName: 'Saturday',
      topics: TOPICS_SOLIDS_REVISION
    },
    {
      id: 'a1-phy-exam',
      subject: 'physics',
      weekNumber: 1,
      title: 'PHYSICS EXAM',
      dateIso: '2026-10-11',
      dateFormatted: '11.Oct.2026',
      dateDisplay: 'Sun, 11 Oct 2026',
      dayName: 'Sunday',
      isExam: true,
      examSubject: 'Physics',
      topics: [
        { id: 'phy-exam-check', topicNumber: 'EXAM', titleEn: 'Official AIMS Plus Physics Examination' }
      ]
    },

    // --- WEEK 02 MATHEMATICS ---
    {
      id: 'a1-math-sets-ineq',
      subject: 'mathematics',
      weekNumber: 2,
      chapterNumber: 1,
      title: 'Sets & Linear Inequalities',
      dateIso: '2026-10-12',
      dateFormatted: '12.Oct.2026',
      dateDisplay: 'Mon, 12 Oct 2026',
      dayName: 'Monday',
      topics: TOPICS_SETS_INEQUALITIES
    },
    {
      id: 'a1-math-relations',
      subject: 'mathematics',
      weekNumber: 2,
      chapterNumber: 2,
      title: 'Relations & Functions',
      dateIso: '2026-10-13',
      dateFormatted: '13.Oct.2026',
      dateDisplay: 'Tue, 13 Oct 2026',
      dayName: 'Tuesday',
      topics: TOPICS_RELATIONS_FUNCTIONS
    },
    {
      id: 'a1-math-trig',
      subject: 'mathematics',
      weekNumber: 2,
      chapterNumber: 3,
      title: 'Trigonometry',
      dateIso: '2026-10-14',
      dateFormatted: '14.Oct.2026',
      dateDisplay: 'Wed, 14 Oct 2026',
      dayName: 'Wednesday',
      topics: TOPICS_TRIGONOMETRY
    },
    {
      id: 'a1-math-complex',
      subject: 'mathematics',
      weekNumber: 2,
      chapterNumber: 4,
      title: 'Complex Numbers',
      dateIso: '2026-10-15',
      dateFormatted: '15.Oct.2026',
      dateDisplay: 'Thu, 15 Oct 2026',
      dayName: 'Thursday',
      topics: TOPICS_COMPLEX_NUMBERS
    },
    {
      id: 'a1-math-perm-comb-binom',
      subject: 'mathematics',
      weekNumber: 2,
      chapterNumber: 5,
      title: 'Permutations, Combinations & Binomial Theorem',
      dateIso: '2026-10-16',
      dateFormatted: '16.Oct.2026',
      dateDisplay: 'Fri, 16 Oct 2026',
      dayName: 'Friday',
      topics: TOPICS_PERM_COMB_BINOMIAL
    },
    {
      id: 'a1-math-exam',
      subject: 'mathematics',
      weekNumber: 2,
      title: 'MATHS EXAM',
      dateIso: '2026-10-17',
      dateFormatted: '17.Oct.2026',
      dateDisplay: 'Sat, 17 Oct 2026',
      dayName: 'Saturday',
      isExam: true,
      examSubject: 'Mathematics',
      topics: [
        { id: 'math-exam-check', topicNumber: 'EXAM', titleEn: 'Official AIMS Plus Mathematics Examination' }
      ]
    }
  ]
};

// -------------------------------------------------------------
// BATCH A2 SCHEDULE DEFINITION (PAGE 2 OF PDF)
// Week 01 Physics: 05–12 Oct 2026 (Physics Exam: 12 Oct)
// Week 02 Mathematics: 13–17 Oct 2026 (Maths Exam: 17 Oct)
// -------------------------------------------------------------
export const PLUS_ONE_SCHEDULE_A2: PlusOneScheduleDef = {
  batch: 'A2',
  title: 'PLUS ONE STUDY PLANNER BATCH A2',
  physicsExamDate: '2026-10-12',
  physicsExamDisplay: '12.Oct.2026',
  mathsExamDate: '2026-10-17',
  mathsExamDisplay: '17.Oct.2026',
  startDateIso: '2026-10-05',
  endDateIso: '2026-10-17',
  items: [
    // --- WEEK 01 PHYSICS ---
    {
      id: 'a2-phy-units',
      subject: 'physics',
      weekNumber: 1,
      chapterNumber: 1,
      title: 'Units & Measurement',
      dateIso: '2026-10-05',
      dateFormatted: '05.Oct.2026',
      dateDisplay: 'Mon, 05 Oct 2026',
      dayName: 'Monday',
      topics: TOPICS_UNITS_MEASUREMENT
    },
    {
      id: 'a2-phy-straight-line',
      subject: 'physics',
      weekNumber: 1,
      chapterNumber: 2,
      title: 'Motion in a Straight Line',
      dateIso: '2026-10-06',
      dateFormatted: '06.Oct.2026',
      dateDisplay: 'Tue, 06 Oct 2026',
      dayName: 'Tuesday',
      topics: TOPICS_MOTION_STRAIGHT
    },
    {
      id: 'a2-phy-plane',
      subject: 'physics',
      weekNumber: 1,
      chapterNumber: 3,
      title: 'Motion in a Plane',
      dateIso: '2026-10-07',
      dateFormatted: '07.Oct.2026',
      dateDisplay: 'Wed, 07 Oct 2026',
      dayName: 'Wednesday',
      topics: TOPICS_MOTION_PLANE
    },
    {
      id: 'a2-phy-laws-motion',
      subject: 'physics',
      weekNumber: 1,
      chapterNumber: 4,
      title: 'Laws of Motion',
      dateIso: '2026-10-08',
      dateFormatted: '08.Oct.2026',
      dateDisplay: 'Thu, 08 Oct 2026',
      dayName: 'Thursday',
      topics: TOPICS_LAWS_MOTION
    },
    {
      id: 'a2-phy-solids',
      subject: 'physics',
      weekNumber: 1,
      chapterNumber: 5,
      title: 'Mechanical Properties of Solids',
      dateIso: '2026-10-09',
      dateFormatted: '09.Oct.2026',
      dateDisplay: 'Fri, 09 Oct 2026',
      dayName: 'Friday',
      topics: TOPICS_SOLIDS_ONLY
    },
    {
      id: 'a2-phy-work-energy',
      subject: 'physics',
      weekNumber: 1,
      chapterNumber: 6,
      title: 'Work, Energy & Power',
      dateIso: '2026-10-10',
      dateFormatted: '10.Oct.2026',
      dateDisplay: 'Sat, 10 Oct 2026',
      dayName: 'Saturday',
      topics: TOPICS_WORK_ENERGY_POWER
    },
    {
      id: 'a2-phy-revision',
      subject: 'physics',
      weekNumber: 1,
      chapterNumber: 7,
      title: 'Revision',
      dateIso: '2026-10-11',
      dateFormatted: '11.Oct.2026',
      dateDisplay: 'Sun, 11 Oct 2026',
      dayName: 'Sunday',
      isRevisionOnly: true,
      topics: TOPICS_FULL_PHYSICS_REVISION
    },
    {
      id: 'a2-phy-exam',
      subject: 'physics',
      weekNumber: 1,
      title: 'PHYSICS EXAM',
      dateIso: '2026-10-12',
      dateFormatted: '12.Oct.2026',
      dateDisplay: 'Mon, 12 Oct 2026',
      dayName: 'Monday',
      isExam: true,
      examSubject: 'Physics',
      topics: [
        { id: 'phy-exam-check', topicNumber: 'EXAM', titleEn: 'Official AIMS Plus Physics Examination' }
      ]
    },

    // --- WEEK 02 MATHEMATICS ---
    {
      id: 'a2-math-sets-ineq',
      subject: 'mathematics',
      weekNumber: 2,
      chapterNumber: 1,
      title: 'Sets & Linear Inequalities',
      dateIso: '2026-10-13',
      dateFormatted: '13.Oct.2026',
      dateDisplay: 'Tue, 13 Oct 2026',
      dayName: 'Tuesday',
      topics: TOPICS_SETS_INEQUALITIES
    },
    {
      id: 'a2-math-relations',
      subject: 'mathematics',
      weekNumber: 2,
      chapterNumber: 2,
      title: 'Relations & Functions',
      dateIso: '2026-10-14',
      dateFormatted: '14.Oct.2026',
      dateDisplay: 'Wed, 14 Oct 2026',
      dayName: 'Wednesday',
      topics: TOPICS_RELATIONS_FUNCTIONS
    },
    {
      id: 'a2-math-complex',
      subject: 'mathematics',
      weekNumber: 2,
      chapterNumber: 3,
      title: 'Complex Numbers',
      dateIso: '2026-10-15',
      dateFormatted: '15.Oct.2026',
      dateDisplay: 'Thu, 15 Oct 2026',
      dayName: 'Thursday',
      topics: TOPICS_COMPLEX_NUMBERS
    },
    {
      id: 'a2-math-perm-comb',
      subject: 'mathematics',
      weekNumber: 2,
      chapterNumber: 4,
      title: 'Permutations & Combinations',
      dateIso: '2026-10-16',
      dateFormatted: '16.Oct.2026',
      dateDisplay: 'Fri, 16 Oct 2026',
      dayName: 'Friday',
      topics: TOPICS_PERM_COMB_ONLY
    },
    {
      id: 'a2-math-exam',
      subject: 'mathematics',
      weekNumber: 2,
      title: 'MATHS EXAM',
      dateIso: '2026-10-17',
      dateFormatted: '17.Oct.2026',
      dateDisplay: 'Sat, 17 Oct 2026',
      dayName: 'Saturday',
      isExam: true,
      examSubject: 'Mathematics',
      topics: [
        { id: 'math-exam-check', topicNumber: 'EXAM', titleEn: 'Official AIMS Plus Mathematics Examination' }
      ]
    }
  ]
};

// -------------------------------------------------------------
// HELPER FUNCTIONS FOR SCHEDULE, DUE DATES & COUNTDOWNS
// -------------------------------------------------------------
export function getScheduleForBatch(batch: PlusOneBatch): PlusOneScheduleDef {
  return batch === 'A2' ? PLUS_ONE_SCHEDULE_A2 : PLUS_ONE_SCHEDULE_A1;
}

export function formatIsoDateToDisplay(dateIso: string): string {
  const parts = dateIso.split('-');
  if (parts.length !== 3) return dateIso;
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return d.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
}

export function getTodayDateString(customDate?: Date): string {
  const now = customDate || new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDaysDifference(targetDateIso: string, fromDate?: Date): number {
  const now = fromDate || new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const parts = targetDateIso.split('-').map(Number);
  const targetDate = new Date(parts[0], parts[1] - 1, parts[2]).getTime();
  const diffMs = targetDate - todayStart;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export interface ExamCountdownInfo {
  examSubject: 'Physics' | 'Mathematics';
  dateIso: string;
  dateDisplay: string;
  daysRemaining: number;
  isToday: boolean;
  isPast: boolean;
  statusText: string;
}

export function getExamCountdowns(batch: PlusOneBatch, customDate?: Date): {
  physics: ExamCountdownInfo;
  maths: ExamCountdownInfo;
  nextExam: ExamCountdownInfo | null;
} {
  const schedule = getScheduleForBatch(batch);
  const phyDays = getDaysDifference(schedule.physicsExamDate, customDate);
  const mathDays = getDaysDifference(schedule.mathsExamDate, customDate);

  const physics: ExamCountdownInfo = {
    examSubject: 'Physics',
    dateIso: schedule.physicsExamDate,
    dateDisplay: schedule.physicsExamDisplay,
    daysRemaining: phyDays,
    isToday: phyDays === 0,
    isPast: phyDays < 0,
    statusText: phyDays === 0 ? 'Exam Today!' : phyDays > 0 ? `${phyDays} ${phyDays === 1 ? 'day' : 'days'} left` : 'Completed'
  };

  const maths: ExamCountdownInfo = {
    examSubject: 'Mathematics',
    dateIso: schedule.mathsExamDate,
    dateDisplay: schedule.mathsExamDisplay,
    daysRemaining: mathDays,
    isToday: mathDays === 0,
    isPast: mathDays < 0,
    statusText: mathDays === 0 ? 'Exam Today!' : mathDays > 0 ? `${mathDays} ${mathDays === 1 ? 'day' : 'days'} left` : 'Completed'
  };

  let nextExam: ExamCountdownInfo | null = null;
  if (!physics.isPast) {
    nextExam = physics;
  } else if (!maths.isPast) {
    nextExam = maths;
  }

  return { physics, maths, nextExam };
}

/**
 * Finds today's focus item.
 * If today has a scheduled item, returns that.
 * If today is before start date, returns first item.
 * If today has an exam, returns the exam item.
 * If today is past, returns the first uncompleted or last item.
 */
export function getTodayFocusItem(
  batch: PlusOneBatch, 
  completedItemIds: Set<string>, 
  customDate?: Date
): {
  item: PlusOneScheduleItem;
  reason: 'exact_today' | 'upcoming_next' | 'exam_day' | 'pre_start' | 'all_done';
} {
  const schedule = getScheduleForBatch(batch);
  const todayStr = getTodayDateString(customDate);

  // 1. Direct match for today's date
  const exactMatch = schedule.items.find(item => item.dateIso === todayStr);
  if (exactMatch) {
    if (exactMatch.isExam) {
      return { item: exactMatch, reason: 'exam_day' };
    }
    return { item: exactMatch, reason: 'exact_today' };
  }

  // 2. Pre-start (before the schedule starts)
  if (todayStr < schedule.startDateIso) {
    return { item: schedule.items[0], reason: 'pre_start' };
  }

  // 3. Find first incomplete study chapter
  const firstIncomplete = schedule.items.find(item => !item.isExam && !completedItemIds.has(item.id));
  if (firstIncomplete) {
    return { item: firstIncomplete, reason: 'upcoming_next' };
  }

  // 4. If all chapters complete, return the next upcoming exam or the last item
  const upcomingExam = schedule.items.find(item => item.isExam && item.dateIso >= todayStr);
  if (upcomingExam) {
    return { item: upcomingExam, reason: 'exam_day' };
  }

  return { item: schedule.items[schedule.items.length - 1], reason: 'all_done' };
}
