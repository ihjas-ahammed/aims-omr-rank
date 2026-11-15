import type { SubjectKey } from './fyugData';

// Sixth Semester physics syllabus, unit by unit, generated from
// SSC-FILES/CURRENT/STUDY-PLAN-V6/src/app/js/data/subjects.js (SUBJECTS + UNIT_MODULE). Unit n is "<key>-n".

export interface SyllabusModule {
  module: number; // 1-4
  units: { n: number; text: string }[];
}

export const SYLLABUS: Record<SubjectKey, SyllabusModule[]> = {
  thermo: [
    {
      module: 1,
      units: [
        { n: 1, text: 'Thermodynamic Limit, Extensive and Intensive Variables, The Ideal Gas' },
        { n: 2, text: 'Definition of Heat, Heat Capacity, Specific Heat Capacity, Molar Heat Capacity, Cp and Cv' },
        { n: 3, text: 'Thermal Equilibrium and Zeroth Law of Thermodynamics' },
        { n: 4, text: 'A System in Thermal Equilibrium, Functions of State' },
        { n: 5, text: 'The First Law of Thermodynamics' },
        { n: 6, text: 'Heat Capacity' },
        { n: 7, text: 'Reversibility' },
        { n: 8, text: 'Isothermal and Adiabatic Expansion of Ideal Gas' }
      ]
    },
    {
      module: 2,
      units: [
        { n: 9, text: 'The Second Law of Thermodynamics' },
        { n: 10, text: 'The Carnot Engine' },
        { n: 11, text: 'Carnot\'s Theorem' },
        { n: 12, text: 'Equivalence of Clausius and Kelvin Statements' },
        { n: 13, text: 'Examples of Heat Engines' },
        { n: 14, text: 'Heat Engines Running Backwards: Refrigerator and Heat Pump' },
        { n: 15, text: 'Clausius\' Theorem' }
      ]
    },
    {
      module: 3,
      units: [
        { n: 16, text: 'Definition of Entropy' },
        { n: 17, text: 'Irreversible Change' },
        { n: 18, text: 'The First Law Revisited' },
        { n: 19, text: 'The Joule Expansion of Ideal Gas' },
        { n: 20, text: 'The Statistical Basis for Entropy' },
        { n: 21, text: 'Entropy of Mixing' },
        { n: 22, text: 'Maxwell\'s Demon' },
        { n: 23, text: 'Entropy and Probability' }
      ]
    },
    {
      module: 4,
      units: [
        { n: 24, text: 'Thermodynamic potentials: Internal Energy, Enthalpy, Helmholtz & Gibbs Functions' },
        { n: 25, text: 'Availability and Constraints' },
        { n: 26, text: 'Maxwell\'s Relations' },
        { n: 27, text: 'Different Statements of the Third Law and Consequences' },
        { n: 28, text: 'Latent Heat, Clausius–Clapeyron Equation and Phase Diagrams' },
        { n: 29, text: 'Stability and Metastability' },
        { n: 30, text: 'Gibbs Phase Rule' },
        { n: 31, text: 'Classification of Phase Transitions' }
      ]
    }
  ],
  nuclear: [
    {
      module: 1,
      units: [
        { n: 1, text: 'Introduction to Nuclear Properties' },
        { n: 2, text: 'Quantitative Facts About Nucleus' },
        { n: 3, text: 'Binding Energy and Mass Defect' },
        { n: 4, text: 'Nuclear Angular Momentum, Nuclear Moments, Parity' },
        { n: 5, text: 'Nuclear Force Properties' },
        { n: 6, text: 'Liquid Drop Model and Semi-Empirical Mass Formula' },
        { n: 7, text: 'Nuclear Shell Model and Magic Numbers' }
      ]
    },
    {
      module: 2,
      units: [
        { n: 8, text: 'Introduction to Radioactivity' },
        { n: 9, text: 'Laws of Radioactive Disintegration and Radioactive Series' },
        { n: 10, text: 'Alpha Emission and Gamow Theory' },
        { n: 11, text: 'Beta Decay: Beta Spectra, Neutrino Hypothesis, Fermi Theory' },
        { n: 12, text: 'Gamma Decay and Internal Conversion' },
        { n: 13, text: 'Artificial/Induced Radioactivity and Practical Applications' }
      ]
    },
    {
      module: 3,
      units: [
        { n: 14, text: 'Nuclear Reaction Cross-Section' },
        { n: 15, text: 'Conservation Laws, Kinematics of Reactions, Compound Nucleus' },
        { n: 16, text: 'Nuclear Fission and Energy Release' },
        { n: 17, text: 'Nuclear Fusion and Stellar Energy' },
        { n: 18, text: 'Interaction of Gamma Rays with Matter: Photoelectric, Compton, Pair Production' }
      ]
    },
    {
      module: 4,
      units: [
        { n: 19, text: 'Types of Fundamental Interactions' },
        { n: 20, text: 'Classification of Elementary Particles' },
        { n: 21, text: 'Quantum Numbers: Isospin, Strangeness, Baryon/Lepton Number' },
        { n: 22, text: 'Conservation Laws and Weak Decays of Strange Particles' },
        { n: 23, text: 'Quarks and Qualitative Description of Quark Model' }
      ]
    }
  ],
  electronics: [
    {
      module: 1,
      units: [
        { n: 1, text: 'Single Stage Transistor Amplifier' },
        { n: 2, text: 'Multi Stage Amplifier' },
        { n: 3, text: 'Feedback Principles' },
        { n: 4, text: 'Advantages of Negative Feedback' },
        { n: 5, text: 'Transistor Oscillators: Colpitts, Hartley, Phase Shift' }
      ]
    },
    {
      module: 2,
      units: [
        { n: 6, text: 'Types of FET' },
        { n: 7, text: 'Principle and Working of JFET' },
        { n: 8, text: 'Difference Between JFET and BJT' },
        { n: 9, text: 'JFET Amplifier' },
        { n: 10, text: 'Output Characteristics of JFET' },
        { n: 11, text: 'MOSFET Characteristics and Operation' }
      ]
    },
    {
      module: 3,
      units: [
        { n: 12, text: 'Differential Amplifier' },
        { n: 13, text: 'Operational Amplifier Fundamentals' },
        { n: 14, text: 'Op-Amp with Negative Feedback' },
        { n: 15, text: 'Summing Amplifiers' },
        { n: 16, text: 'Integrator and Differentiator Circuits' }
      ]
    },
    {
      module: 4,
      units: [
        { n: 17, text: 'Basic Logic Gates' },
        { n: 18, text: 'Combination of Logic Gates' },
        { n: 19, text: 'Boolean Algebra and Logic Circuits' },
        { n: 20, text: 'Combinational Logic Circuits' },
        { n: 21, text: 'Electronic Adders: Half and Full Adders' },
        { n: 22, text: 'Flip-Flops: RS, JK, D, T Flip-Flops' }
      ]
    }
  ],
  electrical: [
    {
      module: 1,
      units: [
        { n: 1, text: 'DC Motor Basics: Principle, Back EMF, Voltage Equation, Torque, Speed Regulation, BLDC Motor' },
        { n: 2, text: 'Working Principle of Transformer, Construction, Core-Type and Shell-Type' },
        { n: 3, text: 'Ideal Transformer Theory, EMF Equation, Transformation Ratio, Transformer on Load' },
        { n: 4, text: 'Classification of AC Motors, Induction Motor: Squirrel-Cage and Phase-Wound Rotor' },
        { n: 5, text: 'Production of Rotating Magnetic Field, Three-Phase Supply, Proof of Rotor Rotation' }
      ]
    },
    {
      module: 2,
      units: [
        { n: 6, text: 'Wiring Types, Specifications of Wires and Cable Classifications' },
        { n: 7, text: 'Basics of Wiring: Star and Delta Connections, Simple Domestic Wiring Schemes' },
        { n: 8, text: 'Fuses, Circuit Breakers (MCB/ELCB) and Earthing Systems' }
      ]
    },
    {
      module: 3,
      units: [
        { n: 9, text: 'Electricity Demand, Power Sources Comparison, Conventional and Renewable Energy' },
        { n: 10, text: 'Photovoltaic Materials and Basic Semiconductor Physics' },
        { n: 11, text: 'Generic Photovoltaic Cell and Equivalent Circuit Model' },
        { n: 12, text: 'From Photovoltaic Cells to Modules to Solar Arrays' },
        { n: 13, text: 'Crystalline Silicon Technologies: Mono and Polycrystalline' },
        { n: 14, text: 'Thin Film Photovoltaic Technologies' }
      ]
    },
    {
      module: 4,
      units: [
        { n: 15, text: 'Introduction to Energy Storage Systems and Source Profiles' },
        { n: 16, text: 'Battery Technology: Lead-Acid and Nickel Metal Hydride Batteries' },
        { n: 17, text: 'Lithium-Ion and Advanced Lithium Batteries' },
        { n: 18, text: 'Voltage Characteristics, Battery Standards, Nomenclature and Cell Designs' },
        { n: 19, text: 'Fuel Cells: Principles, Complementary Electrochemistry, SOFC and PEMFC' }
      ]
    }
  ],
  nano: [
    {
      module: 1,
      units: [
        { n: 1, text: 'Introduction to Nanoscale, Size Effects and Quantum Behaviors' },
        { n: 2, text: 'Schrodinger Equation Applications: Nanodot (3D), Nanosheet (2D), Nanowire (1D)' },
        { n: 3, text: 'Quantum Confinement Effect and Electron Confinement' },
        { n: 4, text: 'Density of States for Zero-Dimensional (0D) Solid' },
        { n: 5, text: 'Density of States in Two-Dimensional (2D) Potential Box' },
        { n: 6, text: 'Thin Films and Density of States in Three-Dimensional Box' }
      ]
    },
    {
      module: 2,
      units: [
        { n: 7, text: 'Nanostructures: 0D, 1D, 2D and 3D Classifications' },
        { n: 8, text: 'Carbon Nanomaterials: Fullerenes, CNTs, Types of CNTs, Graphene' },
        { n: 9, text: 'MOFs, Core-Shell Particles, Metamaterials and Bioinspired Materials' }
      ]
    },
    {
      module: 3,
      units: [
        { n: 10, text: 'Mechanical Methods: High Energy Ball Milling' },
        { n: 11, text: 'Physical Vapour Deposition with Consolidation and Laser Ablation' },
        { n: 12, text: 'Chemical Vapour Deposition, Ion Beam Techniques and MBE' },
        { n: 13, text: 'Chemical Methods: Sol-Gel Method and Hydrothermal Synthesis' },
        { n: 14, text: 'Sonochemical Synthesis and Microwave Synthesis' },
        { n: 15, text: 'Self-Assembly of Nanoparticles Using Organic Molecules' }
      ]
    },
    {
      module: 4,
      units: [
        { n: 16, text: 'Optical Microscopy and Confocal Microscopy' },
        { n: 17, text: 'Scanning Electron Microscope (SEM)' },
        { n: 18, text: 'Transmission Electron Microscope (TEM)' },
        { n: 19, text: 'Scanning Probe Microscopes (SPM) and Atomic Force Microscope (AFM)' },
        { n: 20, text: 'X-Ray Diffraction (XRD) and Sample Diffraction' },
        { n: 21, text: 'Diffraction from Nanoparticles' },
        { n: 22, text: 'X-Ray and UV Photoelectron Spectroscopies (XPS / UPS)' }
      ]
    }
  ],
  opto: [
    {
      module: 1,
      units: [
        { n: 1, text: 'Emission and Absorption Processes, Photon Statistics' },
        { n: 2, text: 'Behaviour of Electrons, Optical Properties of Common Materials' },
        { n: 3, text: 'Electrons in Periodic Lattice: Metals, Insulators, Semiconductors' },
        { n: 4, text: 'Refraction, Absorption, Emission, Fluorescence, Scattering' },
        { n: 5, text: 'Absorption and Emission of Light by Semiconductors' }
      ]
    },
    {
      module: 2,
      units: [
        { n: 6, text: 'Semiconductor Science and LEDs, Energy Band Diagrams' },
        { n: 7, text: 'Density of States, Fermi-Dirac Function, Extrinsic Semiconductors' },
        { n: 8, text: 'Compensation Doping, Degenerate Semiconductors, Band Diagrams in Applied Field' },
        { n: 9, text: 'Direct and Indirect Bandgap Semiconductors: E-K Diagrams, PN Junctions' },
        { n: 10, text: 'Open Circuits, PN Junction Forward and Reverse Bias Circuits' }
      ]
    },
    {
      module: 3,
      units: [
        { n: 11, text: 'Visible Light-Emitting Diodes: Physics and Optical Properties of LEDs' },
        { n: 12, text: 'Radiative and Non-Radiative Recombination, Electrical Properties' },
        { n: 13, text: 'Current-Voltage Characteristics, Efficiencies, Novel LED Technologies' }
      ]
    },
    {
      module: 4,
      units: [
        { n: 14, text: 'Stimulated Emission Devices: Stimulated Emission and Population Inversion' },
        { n: 15, text: 'Photon Amplification, Laser Principles, Einstein Coefficients' },
        { n: 16, text: 'Principle of Laser Diode, Heterostructure Laser Diodes' },
        { n: 17, text: 'Photovoltaic Devices: Solar Cells, Operating Current, Voltage and Fill Factor' }
      ]
    }
  ]
};
