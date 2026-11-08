import type { CsChapter, CsExamDay } from '../cs/csTimetable';

// Source: "PLUS TWO · CLASS XII · PART I & II · PHYSICS — Study Timetable", chapters 01 to 10, cycle 09 NOV – 15 NOV 2026.
// Same plan for every batch. Topics are in the order the chart reads them (row by row, left then right).

export const PHY_CYCLE_LABEL = '09 NOV – 15 NOV 2026';

export type PhyDay = CsChapter | CsExamDay;

export const PHY_TIMETABLE: PhyDay[] = [
  {
    date: '2026-11-09',
    dayNo: 1,
    tag: 'CHAPTER 01',
    title: 'Electric Charges and Fields',
    icon: 'phy_charges',
    topics: [
      'Quantisation, Conservation of Charge & Coulomb’s Law',
      'Electric Field Lines, Superposition & Field Intensity',
      'Electric Dipole: Axial & Equatorial Field Derivations',
      'Torque & Work Done on Dipole in Uniform Field',
      'Electric Flux (Φ = E·A) & Gauss’s Law Proof',
      'Gauss’s Law Applications: Wire, Plane Sheet & Shell'
    ]
  },
  {
    date: '2026-11-10',
    dayNo: 2,
    tag: 'CHAPTER 02',
    title: 'Electrostatic Potential and Capacitance',
    icon: 'phy_capacitor',
    topics: [
      'Potential due to Point Charge & System of Charges',
      'Electrostatic Potential due to an Electric Dipole',
      'Equipotential Surfaces & Relation (E = -dV/dr)',
      'Potential Energy of System & Dipole in External Field',
      'Parallel Plate Capacitor & Effect of Dielectric',
      'Series/Parallel Capacitors & Energy Stored (½CV^2)'
    ]
  },
  {
    date: '2026-11-11',
    dayNo: 3,
    tag: 'CHAPTER 03',
    title: 'Current Electricity',
    icon: 'phy_current',
    topics: [
      'Drift Velocity (I = nAev_d), Mobility & Current Density',
      'Ohm’s Law, Resistivity & Temperature Dependence',
      'Electrical Energy, Power & Internal Resistance of Cell',
      'Cells in Series & Parallel (Equivalent EMF Derivations)',
      'Kirchhoff’s Junction Rule (KCL) & Loop Rule (KVL)',
      'Wheatstone Bridge Principle & Balanced Condition'
    ]
  },
  {
    date: '2026-11-12',
    dayNo: 4,
    tag: 'CHAPTER 04',
    title: 'Moving Charges and Magnetism',
    icon: 'phy_moving',
    topics: [
      'Lorentz Force & Circular/Helical Motion in B-Field',
      'Magnetic Force on Current-Carrying Conductor (Il×B)',
      'Biot-Savart Law & Field on Axis of Circular Loop',
      'Ampere’s Circuital Law: Straight Wire & Solenoid',
      'Force between Parallel Conductors & Torque on Loop',
      'Moving Coil Galvanometer (Ammeter & Voltmeter Conv.)'
    ]
  },
  {
    date: '2026-11-13',
    dayNo: 5,
    tag: 'CH 05, 06, 07 · REV',
    title: 'Magnetism, Electromagnetic Induction & AC — Revision',
    icon: 'phy_magnet_ac',
    topics: [
      'Bar Magnet, Gauss’s Law in Magnetism & Dipole Torque',
      'Magnetisation, Intensity (H) & Dia/Para/Ferromagnetism',
      'Faraday’s Laws, Lenz’s Law, Motional EMF & Inductance',
      'AC Generator & Transformer (Working & Energy Losses)',
      'Phasor Diagrams (R, L, C), Series LCR & Resonance',
      'Power in AC (P = VI cosφ), Power Factor & PYQ Drill'
    ]
  },
  {
    date: '2026-11-14',
    dayNo: 6,
    tag: 'CH 08, 09, 10 · REV',
    title: 'EM Waves, Ray Optics & Wave Optics — Revision',
    icon: 'phy_optics',
    topics: [
      'Displacement Current, EM Wave Properties & Spectrum',
      'Mirror Formula, Total Internal Reflection & Spherical Surface',
      'Lens Maker’s Formula, Thin Lenses & Prism Formula',
      'Compound Microscope & Astronomical Telescope',
      'Huygens’ Principle (Reflection & Refraction Proofs)',
      'Interference (YDSE), Single-Slit Diffraction & Polarisation'
    ]
  },
  { date: '2026-11-15', exam: true, label: 'PLUS TWO PHYSICS EXAM — CHAPTERS 01 TO 10' }
];

export const getPhyDay = (dateKey: string): PhyDay | null => PHY_TIMETABLE.find((d) => d.date === dateKey) ?? null;
