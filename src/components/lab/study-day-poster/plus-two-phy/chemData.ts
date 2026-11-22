import type { PlusTwoDay } from './plusTwoData';

// Source: "PLUS TWO · BATCH B1 · B2 · B3 · CHAPTERS 01 TO 06 · CHEMISTRY — Study Timetable", schedule week
// 23 NOV – 29 NOV 2026. Same plan for every batch. Topics are in the order the chart reads them (row by row,
// left then right). The small CY / AMR badges on the chart are not shown on the poster.

export const CHEM_CYCLE_LABEL = '23 NOV – 29 NOV 2026';

export const CHEM_TIMETABLE: PlusTwoDay[] = [
  {
    date: '2026-11-23',
    dayNo: 1,
    chapters: [
      {
        tag: 'CH 01',
        title: 'Solutions',
        icon: 'chem_solutions',
        topics: [
          'Henry’s Law & Raoult’s Law',
          'Ideal/Non-Ideal & Azeotropes',
          'Colligative Properties & Osmosis',
          'Abnormal Mass & van’t Hoff (i)'
        ]
      }
    ]
  },
  {
    date: '2026-11-24',
    dayNo: 2,
    chapters: [
      {
        tag: 'CH 02',
        title: 'Electrochemistry',
        icon: 'chem_electro',
        topics: [
          'Galvanic Cells, SHE & EMF',
          'Nernst Equation & Gibbs Energy',
          'Conductance & Kohlrausch’s Law',
          'Faraday’s Laws, Cells & Corrosion'
        ]
      }
    ]
  },
  {
    date: '2026-11-25',
    dayNo: 3,
    chapters: [
      {
        tag: 'CH 03',
        title: 'Chemical Kinetics',
        icon: 'chem_kinetics',
        topics: [
          'Rate Law, Order & Molecularity',
          'Zero & First Order Equations, t½',
          'Pseudo First Order & Half-Life',
          'Arrhenius Eqn & Collision Theory'
        ]
      }
    ]
  },
  {
    date: '2026-11-26',
    dayNo: 4,
    chapters: [
      {
        tag: 'CH 04',
        title: 'The d- and f-Block Elements',
        icon: 'chem_dblock',
        topics: [
          '3d Series Config & General Trends',
          'Oxidation, Colour & Magnetism',
          'K<sub>2</sub>Cr<sub>2</sub>O<sub>7</sub> & KMnO<sub>4</sub> Prep & Reactions',
          'Lanthanoid Contraction & Actinoids'
        ]
      }
    ]
  },
  {
    date: '2026-11-27',
    dayNo: 5,
    chapters: [
      {
        tag: 'CH 05',
        title: 'Coordination Compounds',
        icon: 'chem_coordination',
        topics: [
          'Werner’s Theory & IUPAC Naming',
          'Isomerism (Structural & Stereo)',
          'Valence Bond Theory (VBT)',
          'CFT Splitting & Metal Carbonyls'
        ]
      }
    ]
  },
  {
    date: '2026-11-28',
    dayNo: 6,
    chapters: [
      {
        tag: 'CH 06',
        title: 'Haloalkanes and Haloarenes',
        icon: 'chem_haloalkane',
        topics: [
          'Preparation & Nature of C–X Bond',
          'SN1 & SN2 Mechanisms, Chirality',
          'Saytzeff Rule & Grignard Reagent',
          'Haloarenes (EAS) & Polyhalogens'
        ]
      }
    ]
  },
  { date: '2026-11-29', exam: true, label: 'PLUS TWO CHEMISTRY EXAM — CH 01 TO 06' }
];
