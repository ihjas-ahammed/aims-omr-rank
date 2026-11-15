import type { PlusTwoDay } from './plusTwoData';

// Source: "PLUS TWO · BATCH B1 · B2 · B3 · MATRICES TO DIFF. EQUATIONS · MATHEMATICS — Study Timetable",
// schedule week 16 NOV – 22 NOV 2026. Same plan for every batch. Topics are in the order the chart reads them
// (row by row, left then right).

export const MATH_CYCLE_LABEL = '16 NOV – 22 NOV 2026';

export const MATH_TIMETABLE: PlusTwoDay[] = [
  {
    date: '2026-11-16',
    dayNo: 1,
    chapters: [
      {
        tag: 'CH 03',
        title: 'Matrices',
        icon: 'math_matrix',
        topics: [
          'Types, Order & Equality',
          'Addition & Matrix Multiplication',
          'Transpose, Symm. & Skew-Symm.',
          'Invertible Matrices Properties'
        ]
      },
      {
        tag: 'CH 04',
        title: 'Determinants',
        icon: 'math_determinant',
        topics: [
          'Determinant & Area',
          'Minors, Cofactors & Adjoint',
          'Inverse of Matrix',
          'Linear Eqns Solution'
        ]
      }
    ]
  },
  {
    date: '2026-11-17',
    dayNo: 2,
    chapters: [
      {
        tag: 'CH 05',
        title: 'Continuity and Differentiability',
        icon: 'math_continuity',
        topics: [
          'Continuity & Algebra of Continuous Funcs',
          'Chain Rule, Implicit & Inverse Trig Deriv.',
          'Exponential, Log & Parametric Diff.',
          'Second Order Derivatives'
        ]
      }
    ]
  },
  {
    date: '2026-11-18',
    dayNo: 3,
    chapters: [
      {
        tag: 'CH 06',
        title: 'Applications of Derivatives',
        icon: 'math_maxmin',
        topics: [
          'Rate of Change of Quantities',
          'Increasing & Decreasing Functions',
          'Local Maxima & Minima',
          'Absolute Max/Min & Word Problems'
        ]
      }
    ]
  },
  {
    date: '2026-11-19',
    dayNo: 4,
    chapters: [
      {
        tag: 'CH 07',
        title: 'Integrals',
        icon: 'math_integral',
        topics: [
          'Indefinite Integrals & Substitution Method',
          'Trig Identities & Special Integrals',
          'Partial Fractions & Integration by Parts',
          'Definite Integrals & Properties'
        ]
      }
    ]
  },
  {
    date: '2026-11-20',
    dayNo: 5,
    chapters: [
      {
        tag: 'CH 08',
        title: 'Applications of Integrals',
        icon: 'math_area',
        topics: [
          'Area under Line, Parabola, Circle, Ellipse',
          'Area Bounded by Curve & Axes',
          'Symmetry & Quadrant Area Problems',
          'Board Exam PYQ Area Calculations'
        ]
      }
    ]
  },
  {
    date: '2026-11-21',
    dayNo: 6,
    chapters: [
      {
        tag: 'CH 09',
        title: 'Differential Equations',
        icon: 'math_diffeq',
        topics: [
          'Order & Degree of Differential Eqns',
          'General & Particular Solutions',
          'Variable Separable & Homogeneous Eqns',
          'Linear Differential Eqns'
        ]
      }
    ]
  },
  { date: '2026-11-22', exam: true, label: 'PLUS TWO MATHEMATICS EXAM — CH 03 TO 09' }
];
