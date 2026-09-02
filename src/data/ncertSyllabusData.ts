// Official NCERT Curriculum Data with exact chapters and subtopics
// Extracted and curated for Plus One (Class 11) and Plus Two (Class 12)

export interface NCERTSubtopic {
  id: string;
  code: string;
  title: string;
}

export interface NCERTChapter {
  id: string;
  number: number;
  title: string;
  subtopics: NCERTSubtopic[];
}

export interface NCERTSubject {
  id: string;
  name: string;
  code: string;
  color: string;
  themeColor: string;
  badgeColor: string;
  chapters: NCERTChapter[];
}

export interface NCERTGradeLevel {
  title: string;
  batches: string[];
  subjects: NCERTSubject[];
}

export interface NCERTSyllabusDatabase {
  plus_two: NCERTGradeLevel;
  plus_one: NCERTGradeLevel;
}

export const NCERT_SYLLABUS_DATA: NCERTSyllabusDatabase = {
  "plus_two": {
    "title": "Plus Two (Class 12)",
    "batches": [
      "B1",
      "B2",
      "B3"
    ],
    "subjects": [
      {
        "id": "physics_12",
        "name": "Physics",
        "code": "PHY-12",
        "color": "rose",
        "themeColor": "from-rose-500 to-red-600",
        "badgeColor": "bg-rose-100 text-rose-700 border-rose-200",
        "chapters": [
          {
            "id": "phy12_ch1",
            "number": 1,
            "title": "Electric Charges and Fields",
            "subtopics": [
              {
                "id": "phy12_1_1",
                "code": "1.1",
                "title": "Introduction"
              },
              {
                "id": "phy12_1_2",
                "code": "1.2",
                "title": "Electric Charge"
              },
              {
                "id": "phy12_1_3",
                "code": "1.3",
                "title": "Conductors and Insulators"
              },
              {
                "id": "phy12_1_4",
                "code": "1.4",
                "title": "Basic Properties of Electric Charge"
              },
              {
                "id": "phy12_1_5",
                "code": "1.5",
                "title": "Coulomb's Law"
              },
              {
                "id": "phy12_1_6",
                "code": "1.6",
                "title": "Forces between Multiple Charges"
              },
              {
                "id": "phy12_1_7",
                "code": "1.7",
                "title": "Electric Field"
              },
              {
                "id": "phy12_1_8",
                "code": "1.8",
                "title": "Electric Field Lines"
              },
              {
                "id": "phy12_1_9",
                "code": "1.9",
                "title": "Electric Flux"
              },
              {
                "id": "phy12_1_10",
                "code": "1.10",
                "title": "Electric Dipole"
              },
              {
                "id": "phy12_1_11",
                "code": "1.11",
                "title": "Dipole in a Uniform External Field"
              },
              {
                "id": "phy12_1_12",
                "code": "1.12",
                "title": "Continuous Charge Distribution"
              },
              {
                "id": "phy12_1_13",
                "code": "1.13",
                "title": "Gauss's Law"
              },
              {
                "id": "phy12_1_14",
                "code": "1.14",
                "title": "Applications of Gauss's Law"
              }
            ]
          },
          {
            "id": "phy12_ch2",
            "number": 2,
            "title": "Electrostatic Potential and Capacitance",
            "subtopics": [
              {
                "id": "phy12_2_1",
                "code": "2.1",
                "title": "Introduction"
              },
              {
                "id": "phy12_2_2",
                "code": "2.2",
                "title": "Electrostatic Potential"
              },
              {
                "id": "phy12_2_3",
                "code": "2.3",
                "title": "Potential due to a Point Charge"
              },
              {
                "id": "phy12_2_4",
                "code": "2.4",
                "title": "Potential due to an Electric Dipole"
              },
              {
                "id": "phy12_2_5",
                "code": "2.5",
                "title": "Potential due to a System of Charges"
              },
              {
                "id": "phy12_2_6",
                "code": "2.6",
                "title": "Equipotential Surfaces"
              },
              {
                "id": "phy12_2_7",
                "code": "2.7",
                "title": "Potential Energy of a System of Charges"
              },
              {
                "id": "phy12_2_8",
                "code": "2.8",
                "title": "Potential Energy in an External Field"
              },
              {
                "id": "phy12_2_9",
                "code": "2.9",
                "title": "Electrostatics of Conductors"
              },
              {
                "id": "phy12_2_10",
                "code": "2.10",
                "title": "Dielectrics and Polarisation"
              },
              {
                "id": "phy12_2_11",
                "code": "2.11",
                "title": "Capacitors and Capacitance"
              },
              {
                "id": "phy12_2_12",
                "code": "2.12",
                "title": "The Parallel Plate Capacitor"
              },
              {
                "id": "phy12_2_13",
                "code": "2.13",
                "title": "Effect of Dielectric on Capacitance"
              },
              {
                "id": "phy12_2_14",
                "code": "2.14",
                "title": "Combination of Capacitors"
              },
              {
                "id": "phy12_2_15",
                "code": "2.15",
                "title": "Energy Stored in a Capacitor"
              }
            ]
          },
          {
            "id": "phy12_ch3",
            "number": 3,
            "title": "Current Electricity",
            "subtopics": [
              {
                "id": "phy12_3_1",
                "code": "3.1",
                "title": "Introduction"
              },
              {
                "id": "phy12_3_2",
                "code": "3.2",
                "title": "Electric Current"
              },
              {
                "id": "phy12_3_3",
                "code": "3.3",
                "title": "Electric Currents in Conductors"
              },
              {
                "id": "phy12_3_4",
                "code": "3.4",
                "title": "Ohm's Law"
              },
              {
                "id": "phy12_3_5",
                "code": "3.5",
                "title": "Drift of Electrons & Origin of Resistivity"
              },
              {
                "id": "phy12_3_6",
                "code": "3.6",
                "title": "Limitations of Ohm's Law"
              },
              {
                "id": "phy12_3_7",
                "code": "3.7",
                "title": "Resistivity of Various Materials"
              },
              {
                "id": "phy12_3_8",
                "code": "3.8",
                "title": "Temperature Dependence of Resistivity"
              },
              {
                "id": "phy12_3_9",
                "code": "3.9",
                "title": "Electrical Energy, Power"
              },
              {
                "id": "phy12_3_10",
                "code": "3.10",
                "title": "Cells, EMF, Internal Resistance"
              },
              {
                "id": "phy12_3_11",
                "code": "3.11",
                "title": "Cells in Series and in Parallel"
              },
              {
                "id": "phy12_3_12",
                "code": "3.12",
                "title": "Kirchhoff's Rules"
              },
              {
                "id": "phy12_3_13",
                "code": "3.13",
                "title": "Wheatstone Bridge"
              }
            ]
          },
          {
            "id": "phy12_ch4",
            "number": 4,
            "title": "Moving Charges and Magnetism",
            "subtopics": [
              {
                "id": "phy12_4_1",
                "code": "4.1",
                "title": "Introduction"
              },
              {
                "id": "phy12_4_2",
                "code": "4.2",
                "title": "Magnetic Force"
              },
              {
                "id": "phy12_4_3",
                "code": "4.3",
                "title": "Motion in a Magnetic Field"
              },
              {
                "id": "phy12_4_4",
                "code": "4.4",
                "title": "Biot-Savart Law"
              },
              {
                "id": "phy12_4_5",
                "code": "4.5",
                "title": "Magnetic Field on Axis of Circular Loop"
              },
              {
                "id": "phy12_4_6",
                "code": "4.6",
                "title": "Ampere's Circuital Law"
              },
              {
                "id": "phy12_4_7",
                "code": "4.7",
                "title": "The Solenoid"
              },
              {
                "id": "phy12_4_8",
                "code": "4.8",
                "title": "Force between Two Parallel Currents"
              },
              {
                "id": "phy12_4_9",
                "code": "4.9",
                "title": "Torque on Current Loop, Magnetic Dipole"
              },
              {
                "id": "phy12_4_10",
                "code": "4.10",
                "title": "The Moving Coil Galvanometer"
              }
            ]
          },
          {
            "id": "phy12_ch5",
            "number": 5,
            "title": "Magnetism and Matter",
            "subtopics": [
              {
                "id": "phy12_5_1",
                "code": "5.1",
                "title": "Introduction"
              },
              {
                "id": "phy12_5_2",
                "code": "5.2",
                "title": "The Bar Magnet & Dipole in Uniform Field"
              },
              {
                "id": "phy12_5_3",
                "code": "5.3",
                "title": "Magnetism and Gauss's Law"
              },
              {
                "id": "phy12_5_4",
                "code": "5.4",
                "title": "Magnetisation and Magnetic Intensity"
              },
              {
                "id": "phy12_5_5",
                "code": "5.5",
                "title": "Magnetic Properties of Materials (Dia, Para, Ferro)"
              }
            ]
          },
          {
            "id": "phy12_ch6",
            "number": 6,
            "title": "Electromagnetic Induction",
            "subtopics": [
              {
                "id": "phy12_6_1",
                "code": "6.1",
                "title": "Introduction"
              },
              {
                "id": "phy12_6_2",
                "code": "6.2",
                "title": "Experiments of Faraday and Henry"
              },
              {
                "id": "phy12_6_3",
                "code": "6.3",
                "title": "Magnetic Flux"
              },
              {
                "id": "phy12_6_4",
                "code": "6.4",
                "title": "Faraday's Law of Induction"
              },
              {
                "id": "phy12_6_5",
                "code": "6.5",
                "title": "Lenz's Law and Conservation of Energy"
              },
              {
                "id": "phy12_6_6",
                "code": "6.6",
                "title": "Motional Electromotive Force"
              },
              {
                "id": "phy12_6_7",
                "code": "6.7",
                "title": "Inductance (Self and Mutual)"
              },
              {
                "id": "phy12_6_8",
                "code": "6.8",
                "title": "AC Generator"
              }
            ]
          },
          {
            "id": "phy12_ch7",
            "number": 7,
            "title": "Alternating Current",
            "subtopics": [
              {
                "id": "phy12_7_1",
                "code": "7.1",
                "title": "Introduction"
              },
              {
                "id": "phy12_7_2",
                "code": "7.2",
                "title": "AC Voltage Applied to a Resistor"
              },
              {
                "id": "phy12_7_3",
                "code": "7.3",
                "title": "Phasor Representation of AC"
              },
              {
                "id": "phy12_7_4",
                "code": "7.4",
                "title": "AC Voltage Applied to an Inductor"
              },
              {
                "id": "phy12_7_5",
                "code": "7.5",
                "title": "AC Voltage Applied to a Capacitor"
              },
              {
                "id": "phy12_7_6",
                "code": "7.6",
                "title": "AC Voltage Applied to Series LCR Circuit"
              },
              {
                "id": "phy12_7_7",
                "code": "7.7",
                "title": "Power in AC Circuit: Power Factor"
              },
              {
                "id": "phy12_7_8",
                "code": "7.8",
                "title": "Transformers"
              }
            ]
          },
          {
            "id": "phy12_ch8",
            "number": 8,
            "title": "Electromagnetic Waves",
            "subtopics": [
              {
                "id": "phy12_8_1",
                "code": "8.1",
                "title": "Introduction"
              },
              {
                "id": "phy12_8_2",
                "code": "8.2",
                "title": "Displacement Current"
              },
              {
                "id": "phy12_8_3",
                "code": "8.3",
                "title": "Electromagnetic Waves (Nature & Sources)"
              },
              {
                "id": "phy12_8_4",
                "code": "8.4",
                "title": "Electromagnetic Spectrum"
              }
            ]
          },
          {
            "id": "phy12_ch9",
            "number": 9,
            "title": "Ray Optics and Optical Instruments",
            "subtopics": [
              {
                "id": "phy12_9_1",
                "code": "9.1",
                "title": "Introduction"
              },
              {
                "id": "phy12_9_2",
                "code": "9.2",
                "title": "Reflection by Spherical Mirrors"
              },
              {
                "id": "phy12_9_3",
                "code": "9.3",
                "title": "Refraction"
              },
              {
                "id": "phy12_9_4",
                "code": "9.4",
                "title": "Total Internal Reflection & Applications"
              },
              {
                "id": "phy12_9_5",
                "code": "9.5",
                "title": "Refraction at Spherical Surfaces & Lenses"
              },
              {
                "id": "phy12_9_6",
                "code": "9.6",
                "title": "Refraction through a Prism"
              },
              {
                "id": "phy12_9_7",
                "code": "9.7",
                "title": "Optical Instruments (Microscope & Telescope)"
              }
            ]
          },
          {
            "id": "phy12_ch10",
            "number": 10,
            "title": "Wave Optics",
            "subtopics": [
              {
                "id": "phy12_10_1",
                "code": "10.1",
                "title": "Introduction"
              },
              {
                "id": "phy12_10_2",
                "code": "10.2",
                "title": "Huygens Principle"
              },
              {
                "id": "phy12_10_3",
                "code": "10.3",
                "title": "Refraction & Reflection using Huygens Principle"
              },
              {
                "id": "phy12_10_4",
                "code": "10.4",
                "title": "Coherent and Incoherent Addition of Waves"
              },
              {
                "id": "phy12_10_5",
                "code": "10.5",
                "title": "Interference of Light Waves & Young's Experiment"
              },
              {
                "id": "phy12_10_6",
                "code": "10.6",
                "title": "Diffraction (Single Slit)"
              }
            ]
          },
          {
            "id": "phy12_ch11",
            "number": 11,
            "title": "Dual Nature of Radiation and Matter",
            "subtopics": [
              {
                "id": "phy12_11_1",
                "code": "11.1",
                "title": "Introduction"
              },
              {
                "id": "phy12_11_2",
                "code": "11.2",
                "title": "Electron Emission"
              },
              {
                "id": "phy12_11_3",
                "code": "11.3",
                "title": "Photoelectric Effect"
              },
              {
                "id": "phy12_11_4",
                "code": "11.4",
                "title": "Experimental Study of Photoelectric Effect"
              },
              {
                "id": "phy12_11_5",
                "code": "11.5",
                "title": "Einstein's Photoelectric Equation"
              },
              {
                "id": "phy12_11_6",
                "code": "11.6",
                "title": "Particle Nature of Light: The Photon"
              },
              {
                "id": "phy12_11_7",
                "code": "11.7",
                "title": "Wave Nature of Matter (de Broglie Wavelength)"
              }
            ]
          },
          {
            "id": "phy12_ch12",
            "number": 12,
            "title": "Atoms",
            "subtopics": [
              {
                "id": "phy12_12_1",
                "code": "12.1",
                "title": "Introduction"
              },
              {
                "id": "phy12_12_2",
                "code": "12.2",
                "title": "Alpha-particle Scattering & Rutherford's Model"
              },
              {
                "id": "phy12_12_3",
                "code": "12.3",
                "title": "Atomic Spectra"
              },
              {
                "id": "phy12_12_4",
                "code": "12.4",
                "title": "Bohr Model of the Hydrogen Atom"
              },
              {
                "id": "phy12_12_5",
                "code": "12.5",
                "title": "Line Spectra of Hydrogen Atom"
              },
              {
                "id": "phy12_12_6",
                "code": "12.6",
                "title": "de Broglie's Explanation of Bohr's Postulate"
              }
            ]
          },
          {
            "id": "phy12_ch13",
            "number": 13,
            "title": "Nuclei",
            "subtopics": [
              {
                "id": "phy12_13_1",
                "code": "13.1",
                "title": "Introduction"
              },
              {
                "id": "phy12_13_2",
                "code": "13.2",
                "title": "Atomic Masses and Composition of Nucleus"
              },
              {
                "id": "phy12_13_3",
                "code": "13.3",
                "title": "Size of the Nucleus"
              },
              {
                "id": "phy12_13_4",
                "code": "13.4",
                "title": "Mass-Energy & Nuclear Binding Energy"
              },
              {
                "id": "phy12_13_5",
                "code": "13.5",
                "title": "Nuclear Force"
              },
              {
                "id": "phy12_13_6",
                "code": "13.6",
                "title": "Nuclear Energy (Fission and Fusion)"
              }
            ]
          },
          {
            "id": "phy12_ch14",
            "number": 14,
            "title": "Semiconductor Electronics",
            "subtopics": [
              {
                "id": "phy12_14_1",
                "code": "14.1",
                "title": "Introduction"
              },
              {
                "id": "phy12_14_2",
                "code": "14.2",
                "title": "Classification of Metals, Conductors & Semiconductors"
              },
              {
                "id": "phy12_14_3",
                "code": "14.3",
                "title": "Intrinsic Semiconductor"
              },
              {
                "id": "phy12_14_4",
                "code": "14.4",
                "title": "Extrinsic Semiconductor (n-type & p-type)"
              },
              {
                "id": "phy12_14_5",
                "code": "14.5",
                "title": "p-n Junction Formation"
              },
              {
                "id": "phy12_14_6",
                "code": "14.6",
                "title": "Semiconductor Diode (Forward & Reverse Bias)"
              },
              {
                "id": "phy12_14_7",
                "code": "14.7",
                "title": "Application of Diode as a Rectifier"
              }
            ]
          }
        ]
      },
      {
        "id": "chemistry_12",
        "name": "Chemistry",
        "code": "CHEM-12",
        "color": "purple",
        "themeColor": "from-purple-500 to-indigo-600",
        "badgeColor": "bg-purple-100 text-purple-700 border-purple-200",
        "chapters": [
          {
            "id": "ch12_ch1",
            "number": 1,
            "title": "Solutions",
            "subtopics": [
              {
                "id": "ch12_1_1",
                "code": "1.1",
                "title": "Types of Solutions"
              },
              {
                "id": "ch12_1_2",
                "code": "1.2",
                "title": "Expressing Concentration of Solutions"
              },
              {
                "id": "ch12_1_3",
                "code": "1.3",
                "title": "Solubility (Henry's Law)"
              },
              {
                "id": "ch12_1_4",
                "code": "1.4",
                "title": "Vapour Pressure of Liquid Solutions (Raoult's Law)"
              },
              {
                "id": "ch12_1_5",
                "code": "1.5",
                "title": "Ideal and Non-ideal Solutions"
              },
              {
                "id": "ch12_1_6",
                "code": "1.6",
                "title": "Colligative Properties & Molar Mass"
              },
              {
                "id": "ch12_1_7",
                "code": "1.7",
                "title": "Abnormal Molar Masses (van 't Hoff factor)"
              }
            ]
          },
          {
            "id": "ch12_ch2",
            "number": 2,
            "title": "Electrochemistry",
            "subtopics": [
              {
                "id": "ch12_2_1",
                "code": "2.1",
                "title": "Electrochemical & Galvanic Cells"
              },
              {
                "id": "ch12_2_2",
                "code": "2.2",
                "title": "Nernst Equation"
              },
              {
                "id": "ch12_2_3",
                "code": "2.3",
                "title": "Conductance of Electrolytic Solutions (Kohlrausch's Law)"
              },
              {
                "id": "ch12_2_4",
                "code": "2.4",
                "title": "Electrolytic Cells and Electrolysis (Faraday's Laws)"
              },
              {
                "id": "ch12_2_5",
                "code": "2.5",
                "title": "Batteries (Primary & Secondary)"
              },
              {
                "id": "ch12_2_6",
                "code": "2.6",
                "title": "Fuel Cells and Corrosion"
              }
            ]
          },
          {
            "id": "ch12_ch3",
            "number": 3,
            "title": "Chemical Kinetics",
            "subtopics": [
              {
                "id": "ch12_3_1",
                "code": "3.1",
                "title": "Rate of a Chemical Reaction"
              },
              {
                "id": "ch12_3_2",
                "code": "3.2",
                "title": "Factors Influencing Rate (Order and Molecularity)"
              },
              {
                "id": "ch12_3_3",
                "code": "3.3",
                "title": "Integrated Rate Equations (Zero & First Order)"
              },
              {
                "id": "ch12_3_4",
                "code": "3.4",
                "title": "Temperature Dependence (Arrhenius Equation)"
              },
              {
                "id": "ch12_3_5",
                "code": "3.5",
                "title": "Collision Theory of Chemical Reactions"
              }
            ]
          },
          {
            "id": "ch12_ch4",
            "number": 4,
            "title": "The d- and f-Block Elements",
            "subtopics": [
              {
                "id": "ch12_4_1",
                "code": "4.1",
                "title": "Position & Electronic Configurations"
              },
              {
                "id": "ch12_4_2",
                "code": "4.2",
                "title": "General Properties of Transition Elements"
              },
              {
                "id": "ch12_4_3",
                "code": "4.3",
                "title": "Important Compounds (K2Cr2O7, KMnO4)"
              },
              {
                "id": "ch12_4_4",
                "code": "4.4",
                "title": "The Lanthanoids (Lanthanoid Contraction)"
              },
              {
                "id": "ch12_4_5",
                "code": "4.5",
                "title": "The Actinoids & Applications of d & f Block"
              }
            ]
          },
          {
            "id": "ch12_ch5",
            "number": 5,
            "title": "Coordination Compounds",
            "subtopics": [
              {
                "id": "ch12_5_1",
                "code": "5.1",
                "title": "Werner's Theory of Coordination Compounds"
              },
              {
                "id": "ch12_5_2",
                "code": "5.2",
                "title": "Definitions of Terms (Ligands, Coordination Number)"
              },
              {
                "id": "ch12_5_3",
                "code": "5.3",
                "title": "Nomenclature of Coordination Compounds"
              },
              {
                "id": "ch12_5_4",
                "code": "5.4",
                "title": "Isomerism (Structural & Stereoisomerism)"
              },
              {
                "id": "ch12_5_5",
                "code": "5.5",
                "title": "Bonding: Valence Bond & Crystal Field Theory (CFT)"
              },
              {
                "id": "ch12_5_6",
                "code": "5.6",
                "title": "Bonding in Metal Carbonyls and Applications"
              }
            ]
          },
          {
            "id": "ch12_ch6",
            "number": 6,
            "title": "Haloalkanes and Haloarenes",
            "subtopics": [
              {
                "id": "ch12_6_1",
                "code": "6.1",
                "title": "Classification and Nomenclature"
              },
              {
                "id": "ch12_6_2",
                "code": "6.2",
                "title": "Nature of C-X Bond & Preparation Methods"
              },
              {
                "id": "ch12_6_3",
                "code": "6.3",
                "title": "Physical Properties"
              },
              {
                "id": "ch12_6_4",
                "code": "6.4",
                "title": "Chemical Reactions: SN1 and SN2 Mechanisms"
              },
              {
                "id": "ch12_6_5",
                "code": "6.5",
                "title": "Reactions of Haloarenes and Polyhalogen Compounds"
              }
            ]
          },
          {
            "id": "ch12_ch7",
            "number": 7,
            "title": "Alcohols, Phenols and Ethers",
            "subtopics": [
              {
                "id": "ch12_7_1",
                "code": "7.1",
                "title": "Classification and Nomenclature"
              },
              {
                "id": "ch12_7_2",
                "code": "7.2",
                "title": "Preparation of Alcohols and Phenols"
              },
              {
                "id": "ch12_7_3",
                "code": "7.3",
                "title": "Physical Properties"
              },
              {
                "id": "ch12_7_4",
                "code": "7.4",
                "title": "Chemical Reactions of Alcohols and Phenols"
              },
              {
                "id": "ch12_7_5",
                "code": "7.5",
                "title": "Commercially Important Alcohols"
              },
              {
                "id": "ch12_7_6",
                "code": "7.6",
                "title": "Ethers: Preparation & Properties (Williamson synthesis)"
              }
            ]
          },
          {
            "id": "ch12_ch8",
            "number": 8,
            "title": "Aldehydes, Ketones and Carboxylic Acids",
            "subtopics": [
              {
                "id": "ch12_8_1",
                "code": "8.1",
                "title": "Nomenclature and Carbonyl Group Structure"
              },
              {
                "id": "ch12_8_2",
                "code": "8.2",
                "title": "Preparation of Aldehydes and Ketones"
              },
              {
                "id": "ch12_8_3",
                "code": "8.3",
                "title": "Physical Properties"
              },
              {
                "id": "ch12_8_4",
                "code": "8.4",
                "title": "Nucleophilic Addition, Aldol & Cannizzaro Reactions"
              },
              {
                "id": "ch12_8_5",
                "code": "8.5",
                "title": "Preparation & Properties of Carboxylic Acids (HVZ Reaction)"
              }
            ]
          },
          {
            "id": "ch12_ch9",
            "number": 9,
            "title": "Amines",
            "subtopics": [
              {
                "id": "ch12_9_1",
                "code": "9.1",
                "title": "Structure, Classification & Nomenclature"
              },
              {
                "id": "ch12_9_2",
                "code": "9.2",
                "title": "Preparation of Amines (Hoffmann bromamide, etc.)"
              },
              {
                "id": "ch12_9_3",
                "code": "9.3",
                "title": "Physical Properties & Basic Character"
              },
              {
                "id": "ch12_9_4",
                "code": "9.4",
                "title": "Chemical Reactions (Hinsberg test, Carbylamine)"
              },
              {
                "id": "ch12_9_5",
                "code": "9.5",
                "title": "Diazonium Salts: Preparation and Reactions"
              }
            ]
          },
          {
            "id": "ch12_ch10",
            "number": 10,
            "title": "Biomolecules",
            "subtopics": [
              {
                "id": "ch12_10_1",
                "code": "10.1",
                "title": "Carbohydrates (Classification, Glucose & Fructose)"
              },
              {
                "id": "ch12_10_2",
                "code": "10.2",
                "title": "Proteins (Amino Acids, Peptide Bond, Denaturation)"
              },
              {
                "id": "ch12_10_3",
                "code": "10.3",
                "title": "Enzymes & Vitamins (Classification, Deficiency diseases)"
              },
              {
                "id": "ch12_10_4",
                "code": "10.4",
                "title": "Nucleic Acids (DNA, RNA Structure & Functions)"
              },
              {
                "id": "ch12_10_5",
                "code": "10.5",
                "title": "Hormones"
              }
            ]
          }
        ]
      },
      {
        "id": "biology_12",
        "name": "Biology",
        "code": "BIO-12",
        "color": "emerald",
        "themeColor": "from-emerald-500 to-teal-600",
        "badgeColor": "bg-emerald-100 text-emerald-700 border-emerald-200",
        "chapters": [
          {
            "id": "bio12_ch1",
            "number": 1,
            "title": "Sexual Reproduction in Flowering Plants",
            "subtopics": [
              {
                "id": "bio12_1_1",
                "code": "1.1",
                "title": "Flower: A Fascinating Organ of Angiosperms"
              },
              {
                "id": "bio12_1_2",
                "code": "1.2",
                "title": "Pre-fertilisation: Structures and Events"
              },
              {
                "id": "bio12_1_3",
                "code": "1.3",
                "title": "Pollination (Agents, Outbreeding devices, Interaction)"
              },
              {
                "id": "bio12_1_4",
                "code": "1.4",
                "title": "Double Fertilisation"
              },
              {
                "id": "bio12_1_5",
                "code": "1.5",
                "title": "Post-fertilisation: Endosperm, Embryo, Seed & Fruit"
              },
              {
                "id": "bio12_1_6",
                "code": "1.6",
                "title": "Apomixis and Polyembryony"
              }
            ]
          },
          {
            "id": "bio12_ch2",
            "number": 2,
            "title": "Human Reproduction",
            "subtopics": [
              {
                "id": "bio12_2_1",
                "code": "2.1",
                "title": "The Male Reproductive System"
              },
              {
                "id": "bio12_2_2",
                "code": "2.2",
                "title": "The Female Reproductive System"
              },
              {
                "id": "bio12_2_3",
                "code": "2.3",
                "title": "Gametogenesis (Spermatogenesis & Oogenesis)"
              },
              {
                "id": "bio12_2_4",
                "code": "2.4",
                "title": "Menstrual Cycle"
              },
              {
                "id": "bio12_2_5",
                "code": "2.5",
                "title": "Fertilisation and Implantation"
              },
              {
                "id": "bio12_2_6",
                "code": "2.6",
                "title": "Pregnancy, Embryonic Development & Lactation"
              }
            ]
          },
          {
            "id": "bio12_ch3",
            "number": 3,
            "title": "Reproductive Health",
            "subtopics": [
              {
                "id": "bio12_3_1",
                "code": "3.1",
                "title": "Reproductive Health: Problems and Strategies"
              },
              {
                "id": "bio12_3_2",
                "code": "3.2",
                "title": "Population Explosion & Contraceptive Methods"
              },
              {
                "id": "bio12_3_3",
                "code": "3.3",
                "title": "Medical Termination of Pregnancy (MTP)"
              },
              {
                "id": "bio12_3_4",
                "code": "3.4",
                "title": "Sexually Transmitted Infections (STIs)"
              },
              {
                "id": "bio12_3_5",
                "code": "3.5",
                "title": "Infertility & Assisted Reproductive Technologies (ART)"
              }
            ]
          },
          {
            "id": "bio12_ch4",
            "number": 4,
            "title": "Principles of Inheritance and Variation",
            "subtopics": [
              {
                "id": "bio12_4_1",
                "code": "4.1",
                "title": "Mendel's Laws of Inheritance & Monohybrid Cross"
              },
              {
                "id": "bio12_4_2",
                "code": "4.2",
                "title": "Incomplete Dominance, Codominance & Multiple Alleles"
              },
              {
                "id": "bio12_4_3",
                "code": "4.3",
                "title": "Dihybrid Cross & Chromosomal Theory"
              },
              {
                "id": "bio12_4_4",
                "code": "4.4",
                "title": "Linkage and Recombination"
              },
              {
                "id": "bio12_4_5",
                "code": "4.5",
                "title": "Sex Determination (Humans, Birds, Honeybee)"
              },
              {
                "id": "bio12_4_6",
                "code": "4.6",
                "title": "Mutation & Genetic Disorders (Mendelian / Chromosomal)"
              }
            ]
          },
          {
            "id": "bio12_ch5",
            "number": 5,
            "title": "Molecular Basis of Inheritance",
            "subtopics": [
              {
                "id": "bio12_5_1",
                "code": "5.1",
                "title": "DNA Structure and Packaging"
              },
              {
                "id": "bio12_5_2",
                "code": "5.2",
                "title": "Search for Genetic Material (Griffith, Hershey-Chase)"
              },
              {
                "id": "bio12_5_3",
                "code": "5.3",
                "title": "RNA World and DNA Replication (Meselson-Stahl)"
              },
              {
                "id": "bio12_5_4",
                "code": "5.4",
                "title": "Transcription Unit & Process"
              },
              {
                "id": "bio12_5_5",
                "code": "5.5",
                "title": "Genetic Code and tRNA"
              },
              {
                "id": "bio12_5_6",
                "code": "5.6",
                "title": "Translation & Gene Regulation (Lac Operon)"
              },
              {
                "id": "bio12_5_7",
                "code": "5.7",
                "title": "Human Genome Project & DNA Fingerprinting"
              }
            ]
          },
          {
            "id": "bio12_ch6",
            "number": 6,
            "title": "Evolution",
            "subtopics": [
              {
                "id": "bio12_6_1",
                "code": "6.1",
                "title": "Origin of Life (Miller-Urey Experiment)"
              },
              {
                "id": "bio12_6_2",
                "code": "6.2",
                "title": "Evidences for Evolution (Homology, Analogy, Fossils)"
              },
              {
                "id": "bio12_6_3",
                "code": "6.3",
                "title": "Adaptive Radiation & Mechanism of Evolution"
              },
              {
                "id": "bio12_6_4",
                "code": "6.4",
                "title": "Hardy-Weinberg Principle & Natural Selection"
              },
              {
                "id": "bio12_6_5",
                "code": "6.5",
                "title": "Origin and Evolution of Man"
              }
            ]
          },
          {
            "id": "bio12_ch7",
            "number": 7,
            "title": "Human Health and Disease",
            "subtopics": [
              {
                "id": "bio12_7_1",
                "code": "7.1",
                "title": "Common Infectious Diseases (Typhoid, Malaria, etc.)"
              },
              {
                "id": "bio12_7_2",
                "code": "7.2",
                "title": "Immunity: Innate, Acquired & Vaccination"
              },
              {
                "id": "bio12_7_3",
                "code": "7.3",
                "title": "Allergies, Autoimmunity & Immune Organs"
              },
              {
                "id": "bio12_7_4",
                "code": "7.4",
                "title": "AIDS (HIV Life Cycle, Prevention)"
              },
              {
                "id": "bio12_7_5",
                "code": "7.5",
                "title": "Cancer (Causes, Detection, Treatment)"
              },
              {
                "id": "bio12_7_6",
                "code": "7.6",
                "title": "Drugs and Alcohol Abuse"
              }
            ]
          },
          {
            "id": "bio12_ch8",
            "number": 8,
            "title": "Microbes in Human Welfare",
            "subtopics": [
              {
                "id": "bio12_8_1",
                "code": "8.1",
                "title": "Microbes in Household & Industrial Products"
              },
              {
                "id": "bio12_8_2",
                "code": "8.2",
                "title": "Microbes in Sewage Treatment (STP)"
              },
              {
                "id": "bio12_8_3",
                "code": "8.3",
                "title": "Microbes in Biogas Production"
              },
              {
                "id": "bio12_8_4",
                "code": "8.4",
                "title": "Microbes as Biocontrol Agents & Biofertilisers"
              }
            ]
          },
          {
            "id": "bio12_ch9",
            "number": 9,
            "title": "Biotechnology: Principles and Processes",
            "subtopics": [
              {
                "id": "bio12_9_1",
                "code": "9.1",
                "title": "Principles of Genetic Engineering"
              },
              {
                "id": "bio12_9_2",
                "code": "9.2",
                "title": "Tools: Restriction Enzymes & Vectors"
              },
              {
                "id": "bio12_9_3",
                "code": "9.3",
                "title": "Competent Host & Gene Transfer"
              },
              {
                "id": "bio12_9_4",
                "code": "9.4",
                "title": "Processes of rDNA: PCR & Bioreactors"
              }
            ]
          },
          {
            "id": "bio12_ch10",
            "number": 10,
            "title": "Biotechnology and its Applications",
            "subtopics": [
              {
                "id": "bio12_10_1",
                "code": "10.1",
                "title": "Applications in Agriculture (Bt Cotton, RNAi)"
              },
              {
                "id": "bio12_10_2",
                "code": "10.2",
                "title": "Applications in Medicine (Insulin, Gene Therapy)"
              },
              {
                "id": "bio12_10_3",
                "code": "10.3",
                "title": "Transgenic Animals & Ethical Issues"
              }
            ]
          },
          {
            "id": "bio12_ch11",
            "number": 11,
            "title": "Organisms and Populations",
            "subtopics": [
              {
                "id": "bio12_11_1",
                "code": "11.1",
                "title": "Populations: Attributes & Age Pyramids"
              },
              {
                "id": "bio12_11_2",
                "code": "11.2",
                "title": "Population Growth Models"
              },
              {
                "id": "bio12_11_3",
                "code": "11.3",
                "title": "Population Interactions (Mutualism, Competition, etc.)"
              }
            ]
          },
          {
            "id": "bio12_ch12",
            "number": 12,
            "title": "Ecosystem",
            "subtopics": [
              {
                "id": "bio12_12_1",
                "code": "12.1",
                "title": "Ecosystem Structure and Function"
              },
              {
                "id": "bio12_12_2",
                "code": "12.2",
                "title": "Productivity & Decomposition"
              },
              {
                "id": "bio12_12_3",
                "code": "12.3",
                "title": "Energy Flow (Food Chain/Web & 10% Law)"
              },
              {
                "id": "bio12_12_4",
                "code": "12.4",
                "title": "Ecological Pyramids"
              }
            ]
          },
          {
            "id": "bio12_ch13",
            "number": 13,
            "title": "Biodiversity and Conservation",
            "subtopics": [
              {
                "id": "bio12_13_1",
                "code": "13.1",
                "title": "Biodiversity Patterns & Species-Area Curve"
              },
              {
                "id": "bio12_13_2",
                "code": "13.2",
                "title": "Loss of Biodiversity (The Evil Quartet)"
              },
              {
                "id": "bio12_13_3",
                "code": "13.3",
                "title": "Conservation Strategies (In-situ / Ex-situ)"
              }
            ]
          }
        ]
      },
      {
        "id": "maths_12",
        "name": "Mathematics",
        "code": "MATH-12",
        "color": "cyan",
        "themeColor": "from-cyan-500 to-blue-600",
        "badgeColor": "bg-cyan-100 text-cyan-700 border-cyan-200",
        "chapters": [
          {
            "id": "math12_ch1",
            "number": 1,
            "title": "Relations and Functions",
            "subtopics": [
              {
                "id": "math12_1_1",
                "code": "1.1",
                "title": "Introduction"
              },
              {
                "id": "math12_1_2",
                "code": "1.2",
                "title": "Types of Relations (Equivalence)"
              },
              {
                "id": "math12_1_3",
                "code": "1.3",
                "title": "Types of Functions (One-One & Onto)"
              },
              {
                "id": "math12_1_4",
                "code": "1.4",
                "title": "Composition & Invertible Functions"
              }
            ]
          },
          {
            "id": "math12_ch2",
            "number": 2,
            "title": "Inverse Trigonometric Functions",
            "subtopics": [
              {
                "id": "math12_2_1",
                "code": "2.1",
                "title": "Introduction & Basic Concepts"
              },
              {
                "id": "math12_2_2",
                "code": "2.2",
                "title": "Principal Value Branches (Domain/Range)"
              },
              {
                "id": "math12_2_3",
                "code": "2.3",
                "title": "Properties of Inverse Trig Functions"
              }
            ]
          },
          {
            "id": "math12_ch3",
            "number": 3,
            "title": "Matrices",
            "subtopics": [
              {
                "id": "math12_3_1",
                "code": "3.1",
                "title": "Introduction & Types of Matrices"
              },
              {
                "id": "math12_3_2",
                "code": "3.2",
                "title": "Operations on Matrices (Addition & Multi)"
              },
              {
                "id": "math12_3_3",
                "code": "3.3",
                "title": "Transpose, Symmetric & Skew Symmetric"
              },
              {
                "id": "math12_3_4",
                "code": "3.4",
                "title": "Invertible Matrices"
              }
            ]
          },
          {
            "id": "math12_ch4",
            "number": 4,
            "title": "Determinants",
            "subtopics": [
              {
                "id": "math12_4_1",
                "code": "4.1",
                "title": "Determinants of Order 1, 2, 3"
              },
              {
                "id": "math12_4_2",
                "code": "4.2",
                "title": "Area of Triangle using Determinants"
              },
              {
                "id": "math12_4_3",
                "code": "4.3",
                "title": "Minors and Cofactors"
              },
              {
                "id": "math12_4_4",
                "code": "4.4",
                "title": "Adjoint and Inverse of a Matrix"
              },
              {
                "id": "math12_4_5",
                "code": "4.5",
                "title": "Solving System of Linear Equations"
              }
            ]
          },
          {
            "id": "math12_ch5",
            "number": 5,
            "title": "Continuity and Differentiability",
            "subtopics": [
              {
                "id": "math12_5_1",
                "code": "5.1",
                "title": "Continuity at a Point and in an Interval"
              },
              {
                "id": "math12_5_2",
                "code": "5.2",
                "title": "Differentiability & Chain Rule"
              },
              {
                "id": "math12_5_3",
                "code": "5.3",
                "title": "Derivatives of Implicit & Inverse Trig Functions"
              },
              {
                "id": "math12_5_4",
                "code": "5.4",
                "title": "Exponential & Logarithmic Differentiation"
              },
              {
                "id": "math12_5_5",
                "code": "5.5",
                "title": "Parametric Forms & Second Order Derivatives"
              }
            ]
          },
          {
            "id": "math12_ch6",
            "number": 6,
            "title": "Application of Derivatives",
            "subtopics": [
              {
                "id": "math12_6_1",
                "code": "6.1",
                "title": "Rate of Change of Quantities"
              },
              {
                "id": "math12_6_2",
                "code": "6.2",
                "title": "Increasing and Decreasing Functions"
              },
              {
                "id": "math12_6_3",
                "code": "6.3",
                "title": "Maxima and Minima"
              }
            ]
          },
          {
            "id": "math12_ch7",
            "number": 7,
            "title": "Integrals",
            "subtopics": [
              {
                "id": "math12_7_1",
                "code": "7.1",
                "title": "Integration as Inverse Process"
              },
              {
                "id": "math12_7_2",
                "code": "7.2",
                "title": "Integration by Substitution & Trig Identities"
              },
              {
                "id": "math12_7_3",
                "code": "7.3",
                "title": "Integrals of Particular Functions"
              },
              {
                "id": "math12_7_4",
                "code": "7.4",
                "title": "Integration by Partial Fractions"
              },
              {
                "id": "math12_7_5",
                "code": "7.5",
                "title": "Integration by Parts"
              },
              {
                "id": "math12_7_6",
                "code": "7.6",
                "title": "Definite Integrals & Properties"
              }
            ]
          },
          {
            "id": "math12_ch8",
            "number": 8,
            "title": "Application of Integrals",
            "subtopics": [
              {
                "id": "math12_8_1",
                "code": "8.1",
                "title": "Area under Simple Curves"
              },
              {
                "id": "math12_8_2",
                "code": "8.2",
                "title": "Area Bounded by Curve and Line"
              }
            ]
          },
          {
            "id": "math12_ch9",
            "number": 9,
            "title": "Differential Equations",
            "subtopics": [
              {
                "id": "math12_9_1",
                "code": "9.1",
                "title": "Order, Degree & Solutions"
              },
              {
                "id": "math12_9_2",
                "code": "9.2",
                "title": "Variable Separable Method"
              },
              {
                "id": "math12_9_3",
                "code": "9.3",
                "title": "Homogeneous Differential Equations"
              },
              {
                "id": "math12_9_4",
                "code": "9.4",
                "title": "Linear Differential Equations"
              }
            ]
          },
          {
            "id": "math12_ch10",
            "number": 10,
            "title": "Vector Algebra",
            "subtopics": [
              {
                "id": "math12_10_1",
                "code": "10.1",
                "title": "Types of Vectors & Direction Cosines"
              },
              {
                "id": "math12_10_2",
                "code": "10.2",
                "title": "Addition & Scalar Multiplication"
              },
              {
                "id": "math12_10_3",
                "code": "10.3",
                "title": "Scalar (Dot) Product & Projections"
              },
              {
                "id": "math12_10_4",
                "code": "10.4",
                "title": "Vector (Cross) Product"
              }
            ]
          },
          {
            "id": "math12_ch11",
            "number": 11,
            "title": "Three Dimensional Geometry",
            "subtopics": [
              {
                "id": "math12_11_1",
                "code": "11.1",
                "title": "Direction Cosines & Direction Ratios"
              },
              {
                "id": "math12_11_2",
                "code": "11.2",
                "title": "Equation of Line in Space"
              },
              {
                "id": "math12_11_3",
                "code": "11.3",
                "title": "Angle between Two Lines"
              },
              {
                "id": "math12_11_4",
                "code": "11.4",
                "title": "Shortest Distance between Two Lines"
              }
            ]
          },
          {
            "id": "math12_ch12",
            "number": 12,
            "title": "Linear Programming",
            "subtopics": [
              {
                "id": "math12_12_1",
                "code": "12.1",
                "title": "Mathematical Formulation of LPP"
              },
              {
                "id": "math12_12_2",
                "code": "12.2",
                "title": "Graphical Method of Solution"
              }
            ]
          },
          {
            "id": "math12_ch13",
            "number": 13,
            "title": "Probability",
            "subtopics": [
              {
                "id": "math12_13_1",
                "code": "13.1",
                "title": "Conditional Probability"
              },
              {
                "id": "math12_13_2",
                "code": "13.2",
                "title": "Multiplication Theorem & Independent Events"
              },
              {
                "id": "math12_13_3",
                "code": "13.3",
                "title": "Bayes' Theorem"
              }
            ]
          }
        ]
      }
    ]
  },
  "plus_one": {
    "title": "Plus One (Class 11)",
    "batches": [
      "A1",
      "A2"
    ],
    "subjects": [
      {
        "id": "physics_11",
        "name": "Physics",
        "code": "PHY-11",
        "color": "rose",
        "themeColor": "from-rose-500 to-red-600",
        "badgeColor": "bg-rose-100 text-rose-700 border-rose-200",
        "chapters": [
          {
            "id": "phy11_ch1",
            "number": 1,
            "title": "Units and Measurements",
            "subtopics": [
              {
                "id": "phy11_1_1",
                "code": "1.1",
                "title": "Introduction & SI System of Units"
              },
              {
                "id": "phy11_1_2",
                "code": "1.2",
                "title": "Significant Figures"
              },
              {
                "id": "phy11_1_3",
                "code": "1.3",
                "title": "Dimensions of Physical Quantities"
              },
              {
                "id": "phy11_1_4",
                "code": "1.4",
                "title": "Dimensional Formulae & Equations"
              },
              {
                "id": "phy11_1_5",
                "code": "1.5",
                "title": "Dimensional Analysis & Applications"
              }
            ]
          },
          {
            "id": "phy11_ch2",
            "number": 2,
            "title": "Motion in a Straight Line",
            "subtopics": [
              {
                "id": "phy11_2_1",
                "code": "2.1",
                "title": "Position, Path Length & Displacement"
              },
              {
                "id": "phy11_2_2",
                "code": "2.2",
                "title": "Average Velocity & Speed"
              },
              {
                "id": "phy11_2_3",
                "code": "2.3",
                "title": "Instantaneous Velocity & Acceleration"
              },
              {
                "id": "phy11_2_4",
                "code": "2.4",
                "title": "Kinematic Equations for Accelerated Motion"
              },
              {
                "id": "phy11_2_5",
                "code": "2.5",
                "title": "Relative Velocity"
              }
            ]
          },
          {
            "id": "phy11_ch3",
            "number": 3,
            "title": "Motion in a Plane",
            "subtopics": [
              {
                "id": "phy11_3_1",
                "code": "3.1",
                "title": "Scalars, Vectors & Vector Operations"
              },
              {
                "id": "phy11_3_2",
                "code": "3.2",
                "title": "Resolution of Vectors"
              },
              {
                "id": "phy11_3_3",
                "code": "3.3",
                "title": "Motion in a Plane with Constant Acceleration"
              },
              {
                "id": "phy11_3_4",
                "code": "3.4",
                "title": "Projectile Motion (Trajectory, Range, Time)"
              },
              {
                "id": "phy11_3_5",
                "code": "3.5",
                "title": "Uniform Circular Motion"
              }
            ]
          },
          {
            "id": "phy11_ch4",
            "number": 4,
            "title": "Laws of Motion",
            "subtopics": [
              {
                "id": "phy11_4_1",
                "code": "4.1",
                "title": "Newton's First & Second Laws of Motion"
              },
              {
                "id": "phy11_4_2",
                "code": "4.2",
                "title": "Newton's Third Law & Momentum Conservation"
              },
              {
                "id": "phy11_4_3",
                "code": "4.3",
                "title": "Equilibrium of a Particle & Free Body Diagrams"
              },
              {
                "id": "phy11_4_4",
                "code": "4.4",
                "title": "Friction (Static, Kinetic, Rolling)"
              },
              {
                "id": "phy11_4_5",
                "code": "4.5",
                "title": "Circular Motion & Banking of Roads"
              }
            ]
          },
          {
            "id": "phy11_ch5",
            "number": 5,
            "title": "Work, Energy and Power",
            "subtopics": [
              {
                "id": "phy11_5_1",
                "code": "5.1",
                "title": "Work and Kinetic Energy: Work-Energy Theorem"
              },
              {
                "id": "phy11_5_2",
                "code": "5.2",
                "title": "Work Done by Constant and Variable Forces"
              },
              {
                "id": "phy11_5_3",
                "code": "5.3",
                "title": "Potential Energy & Conservation of Energy"
              },
              {
                "id": "phy11_5_4",
                "code": "5.4",
                "title": "Potential Energy of a Spring"
              },
              {
                "id": "phy11_5_5",
                "code": "5.5",
                "title": "Power & Collisions (Elastic & Inelastic)"
              }
            ]
          },
          {
            "id": "phy11_ch6",
            "number": 6,
            "title": "System of Particles and Rotational Motion",
            "subtopics": [
              {
                "id": "phy11_6_1",
                "code": "6.1",
                "title": "Centre of Mass & Linear Momentum"
              },
              {
                "id": "phy11_6_2",
                "code": "6.2",
                "title": "Vector Product of Two Vectors"
              },
              {
                "id": "phy11_6_3",
                "code": "6.3",
                "title": "Angular Velocity, Torque & Angular Momentum"
              },
              {
                "id": "phy11_6_4",
                "code": "6.4",
                "title": "Equilibrium of Rigid Body & Moment of Inertia"
              },
              {
                "id": "phy11_6_5",
                "code": "6.5",
                "title": "Kinematics & Dynamics of Rotational Motion"
              }
            ]
          },
          {
            "id": "phy11_ch7",
            "number": 7,
            "title": "Gravitation",
            "subtopics": [
              {
                "id": "phy11_7_1",
                "code": "7.1",
                "title": "Kepler's Laws of Planetary Motion"
              },
              {
                "id": "phy11_7_2",
                "code": "7.2",
                "title": "Universal Law of Gravitation & Constant G"
              },
              {
                "id": "phy11_7_3",
                "code": "7.3",
                "title": "Acceleration due to Gravity g (Altitude/Depth)"
              },
              {
                "id": "phy11_7_4",
                "code": "7.4",
                "title": "Gravitational Potential Energy & Escape Speed"
              },
              {
                "id": "phy11_7_5",
                "code": "7.5",
                "title": "Earth Satellites (Orbital Velocity, Energy)"
              }
            ]
          },
          {
            "id": "phy11_ch8",
            "number": 8,
            "title": "Mechanical Properties of Solids",
            "subtopics": [
              {
                "id": "phy11_8_1",
                "code": "8.1",
                "title": "Stress, Strain & Hooke's Law"
              },
              {
                "id": "phy11_8_2",
                "code": "8.2",
                "title": "Stress-Strain Curve & Elastic Moduli"
              },
              {
                "id": "phy11_8_3",
                "code": "8.3",
                "title": "Applications of Elastic Behaviour"
              }
            ]
          },
          {
            "id": "phy11_ch9",
            "number": 9,
            "title": "Mechanical Properties of Fluids",
            "subtopics": [
              {
                "id": "phy11_9_1",
                "code": "9.1",
                "title": "Pressure, Pascal's Law & Hydraulic Lift"
              },
              {
                "id": "phy11_9_2",
                "code": "9.2",
                "title": "Streamline Flow & Continuity Equation"
              },
              {
                "id": "phy11_9_3",
                "code": "9.3",
                "title": "Bernoulli's Principle and Applications"
              },
              {
                "id": "phy11_9_4",
                "code": "9.4",
                "title": "Viscosity, Stokes' Law & Terminal Velocity"
              },
              {
                "id": "phy11_9_5",
                "code": "9.5",
                "title": "Surface Tension, Angle of Contact & Capillarity"
              }
            ]
          },
          {
            "id": "phy11_ch10",
            "number": 10,
            "title": "Thermal Properties of Matter",
            "subtopics": [
              {
                "id": "phy11_10_1",
                "code": "10.1",
                "title": "Temperature, Heat & Thermal Expansion"
              },
              {
                "id": "phy11_10_2",
                "code": "10.2",
                "title": "Specific Heat Capacity and Calorimetry"
              },
              {
                "id": "phy11_10_3",
                "code": "10.3",
                "title": "Change of State, Latent Heat & Regelation"
              },
              {
                "id": "phy11_10_4",
                "code": "10.4",
                "title": "Heat Transfer (Conduction, Convection, Radiation)"
              },
              {
                "id": "phy11_10_5",
                "code": "10.5",
                "title": "Newton's Law of Cooling"
              }
            ]
          },
          {
            "id": "phy11_ch11",
            "number": 11,
            "title": "Thermodynamics",
            "subtopics": [
              {
                "id": "phy11_11_1",
                "code": "11.1",
                "title": "Zeroth & First Laws of Thermodynamics"
              },
              {
                "id": "phy11_11_2",
                "code": "11.2",
                "title": "Specific Heat Capacities (Cp & Cv)"
              },
              {
                "id": "phy11_11_3",
                "code": "11.3",
                "title": "Thermodynamic Processes (Isothermal, Adiabatic)"
              },
              {
                "id": "phy11_11_4",
                "code": "11.4",
                "title": "Second Law of Thermodynamics & Carnot Engine"
              }
            ]
          },
          {
            "id": "phy11_ch12",
            "number": 12,
            "title": "Kinetic Theory",
            "subtopics": [
              {
                "id": "phy11_12_1",
                "code": "12.1",
                "title": "Molecular Nature of Matter & Gas Laws"
              },
              {
                "id": "phy11_12_2",
                "code": "12.2",
                "title": "Kinetic Theory Pressure & Temperature"
              },
              {
                "id": "phy11_12_3",
                "code": "12.3",
                "title": "Law of Equipartition of Energy & Degrees of Freedom"
              },
              {
                "id": "phy11_12_4",
                "code": "12.4",
                "title": "Specific Heats & Mean Free Path"
              }
            ]
          },
          {
            "id": "phy11_ch13",
            "number": 13,
            "title": "Oscillations",
            "subtopics": [
              {
                "id": "phy11_13_1",
                "code": "13.1",
                "title": "Periodic Motions & Simple Harmonic Motion (SHM)"
              },
              {
                "id": "phy11_13_2",
                "code": "13.2",
                "title": "Velocity, Acceleration and Energy in SHM"
              },
              {
                "id": "phy11_13_3",
                "code": "13.3",
                "title": "Spring-Mass System & Simple Pendulum"
              }
            ]
          },
          {
            "id": "phy11_ch14",
            "number": 14,
            "title": "Waves",
            "subtopics": [
              {
                "id": "phy11_14_1",
                "code": "14.1",
                "title": "Transverse & Longitudinal Waves"
              },
              {
                "id": "phy11_14_2",
                "code": "14.2",
                "title": "Progressive Waves & Speed of Travelling Wave"
              },
              {
                "id": "phy11_14_3",
                "code": "14.3",
                "title": "Superposition, Standing Waves & Beats"
              }
            ]
          }
        ]
      },
      {
        "id": "chemistry_11",
        "name": "Chemistry",
        "code": "CHEM-11",
        "color": "purple",
        "themeColor": "from-purple-500 to-indigo-600",
        "badgeColor": "bg-purple-100 text-purple-700 border-purple-200",
        "chapters": [
          {
            "id": "ch11_ch1",
            "number": 1,
            "title": "Some Basic Concepts of Chemistry",
            "subtopics": [
              {
                "id": "ch11_1_1",
                "code": "1.1",
                "title": "Nature of Matter & Measurement"
              },
              {
                "id": "ch11_1_2",
                "code": "1.2",
                "title": "Laws of Chemical Combinations & Dalton's Theory"
              },
              {
                "id": "ch11_1_3",
                "code": "1.3",
                "title": "Atomic Mass, Mole Concept & Molar Mass"
              },
              {
                "id": "ch11_1_4",
                "code": "1.4",
                "title": "Empirical / Molecular Formula & Stoichiometry"
              }
            ]
          },
          {
            "id": "ch11_ch2",
            "number": 2,
            "title": "Structure of Atom",
            "subtopics": [
              {
                "id": "ch11_2_1",
                "code": "2.1",
                "title": "Discovery of Sub-atomic Particles & Early Models"
              },
              {
                "id": "ch11_2_2",
                "code": "2.2",
                "title": "Bohr's Model for Hydrogen Atom & Spectra"
              },
              {
                "id": "ch11_2_3",
                "code": "2.3",
                "title": "Dual Nature of Matter (de Broglie) & Heisenberg Principle"
              },
              {
                "id": "ch11_2_4",
                "code": "2.4",
                "title": "Quantum Numbers & Electronic Configuration"
              }
            ]
          },
          {
            "id": "ch11_ch3",
            "number": 3,
            "title": "Classification of Elements and Periodicity",
            "subtopics": [
              {
                "id": "ch11_3_1",
                "code": "3.1",
                "title": "Modern Periodic Law & Table Layout"
              },
              {
                "id": "ch11_3_2",
                "code": "3.2",
                "title": "Electronic Configurations in Blocks (s, p, d, f)"
              },
              {
                "id": "ch11_3_3",
                "code": "3.3",
                "title": "Periodic Trends: Radii, Ionization Enthalpy, Electronegativity"
              }
            ]
          },
          {
            "id": "ch11_ch4",
            "number": 4,
            "title": "Chemical Bonding and Molecular Structure",
            "subtopics": [
              {
                "id": "ch11_4_1",
                "code": "4.1",
                "title": "Ionic & Covalent Bonds, Bond Parameters"
              },
              {
                "id": "ch11_4_2",
                "code": "4.2",
                "title": "VSEPR Theory & Shapes of Molecules"
              },
              {
                "id": "ch11_4_3",
                "code": "4.3",
                "title": "Valence Bond Theory & Hybridisation"
              },
              {
                "id": "ch11_4_4",
                "code": "4.4",
                "title": "Molecular Orbital Theory & Hydrogen Bonding"
              }
            ]
          },
          {
            "id": "ch11_ch5",
            "number": 5,
            "title": "Chemical Thermodynamics",
            "subtopics": [
              {
                "id": "ch11_5_1",
                "code": "5.1",
                "title": "System, Surroundings & First Law of Thermodynamics"
              },
              {
                "id": "ch11_5_2",
                "code": "5.2",
                "title": "Enthalpy H, Heat Capacities & Hess's Law"
              },
              {
                "id": "ch11_5_3",
                "code": "5.3",
                "title": "Spontaneity, Entropy S & Gibbs Free Energy G"
              }
            ]
          },
          {
            "id": "ch11_ch6",
            "number": 6,
            "title": "Equilibrium",
            "subtopics": [
              {
                "id": "ch11_6_1",
                "code": "6.1",
                "title": "Chemical Equilibrium & Equilibrium Constants (Kc, Kp)"
              },
              {
                "id": "ch11_6_2",
                "code": "6.2",
                "title": "Le Chatelier's Principle"
              },
              {
                "id": "ch11_6_3",
                "code": "6.3",
                "title": "Ionic Equilibrium: Acids, Bases & pH Scale"
              },
              {
                "id": "ch11_6_4",
                "code": "6.4",
                "title": "Buffer Solutions & Solubility Product Ksp"
              }
            ]
          },
          {
            "id": "ch11_ch7",
            "number": 7,
            "title": "Redox Reactions",
            "subtopics": [
              {
                "id": "ch11_7_1",
                "code": "7.1",
                "title": "Concepts of Oxidation and Reduction"
              },
              {
                "id": "ch11_7_2",
                "code": "7.2",
                "title": "Oxidation Number & Balancing Redox Reactions"
              },
              {
                "id": "ch11_7_3",
                "code": "7.3",
                "title": "Electrode Processes & Electrochemical Cells"
              }
            ]
          },
          {
            "id": "ch11_ch8",
            "number": 8,
            "title": "Organic Chemistry - Basic Principles and Techniques",
            "subtopics": [
              {
                "id": "ch11_8_1",
                "code": "8.1",
                "title": "Tetravalence of Carbon & Nomenclature"
              },
              {
                "id": "ch11_8_2",
                "code": "8.2",
                "title": "Isomerism (Structural and Stereoisomerism)"
              },
              {
                "id": "ch11_8_3",
                "code": "8.3",
                "title": "Electronic Effects (Inductive, Resonance, Hyperconjugation)"
              },
              {
                "id": "ch11_8_4",
                "code": "8.4",
                "title": "Reaction Mechanisms & Purification Methods"
              }
            ]
          },
          {
            "id": "ch11_ch9",
            "number": 9,
            "title": "Hydrocarbons",
            "subtopics": [
              {
                "id": "ch11_9_1",
                "code": "9.1",
                "title": "Alkanes: Conformations and Reactions"
              },
              {
                "id": "ch11_9_2",
                "code": "9.2",
                "title": "Alkenes: Geometrical Isomerism & Markovnikov Rule"
              },
              {
                "id": "ch11_9_3",
                "code": "9.3",
                "title": "Alkynes: Acidity and Addition Reactions"
              },
              {
                "id": "ch11_9_4",
                "code": "9.4",
                "title": "Aromatic Hydrocarbons: Benzene & Electrophilic Substitution"
              }
            ]
          }
        ]
      },
      {
        "id": "biology_11",
        "name": "Biology",
        "code": "BIO-11",
        "color": "emerald",
        "themeColor": "from-emerald-500 to-teal-600",
        "badgeColor": "bg-emerald-100 text-emerald-700 border-emerald-200",
        "chapters": [
          {
            "id": "bio11_ch1",
            "number": 1,
            "title": "The Living World",
            "subtopics": [
              {
                "id": "bio11_1_1",
                "code": "1.1",
                "title": "Diversity in the Living World & Nomenclature"
              },
              {
                "id": "bio11_1_2",
                "code": "1.2",
                "title": "Taxonomic Categories"
              }
            ]
          },
          {
            "id": "bio11_ch2",
            "number": 2,
            "title": "Biological Classification",
            "subtopics": [
              {
                "id": "bio11_2_1",
                "code": "2.1",
                "title": "Monera & Protista Kingdoms"
              },
              {
                "id": "bio11_2_2",
                "code": "2.2",
                "title": "Kingdom Fungi (Classes & Reproduction)"
              },
              {
                "id": "bio11_2_3",
                "code": "2.3",
                "title": "Viruses, Viroids, Prions and Lichens"
              }
            ]
          },
          {
            "id": "bio11_ch3",
            "number": 3,
            "title": "Plant Kingdom",
            "subtopics": [
              {
                "id": "bio11_3_1",
                "code": "3.1",
                "title": "Algae & Bryophytes"
              },
              {
                "id": "bio11_3_2",
                "code": "3.2",
                "title": "Pteridophytes & Gymnosperms"
              },
              {
                "id": "bio11_3_3",
                "code": "3.3",
                "title": "Angiosperms and Plant Life Cycles"
              }
            ]
          },
          {
            "id": "bio11_ch4",
            "number": 4,
            "title": "Animal Kingdom",
            "subtopics": [
              {
                "id": "bio11_4_1",
                "code": "4.1",
                "title": "Basis of Classification (Symmetry, Coelom)"
              },
              {
                "id": "bio11_4_2",
                "code": "4.2",
                "title": "Non-chordates (Porifera to Echinodermata)"
              },
              {
                "id": "bio11_4_3",
                "code": "4.3",
                "title": "Chordates & Vertebrate Classes"
              }
            ]
          },
          {
            "id": "bio11_ch5",
            "number": 5,
            "title": "Morphology of Flowering Plants",
            "subtopics": [
              {
                "id": "bio11_5_1",
                "code": "5.1",
                "title": "Root, Stem and Leaf (Modifications)"
              },
              {
                "id": "bio11_5_2",
                "code": "5.2",
                "title": "Inflorescence and Flower Structure"
              },
              {
                "id": "bio11_5_3",
                "code": "5.3",
                "title": "Fruit, Seed & Plant Families Description"
              }
            ]
          },
          {
            "id": "bio11_ch6",
            "number": 6,
            "title": "Anatomy of Flowering Plants",
            "subtopics": [
              {
                "id": "bio11_6_1",
                "code": "6.1",
                "title": "Plant Tissues & Tissue Systems"
              },
              {
                "id": "bio11_6_2",
                "code": "6.2",
                "title": "Anatomy of Dicot & Monocot Root, Stem, Leaf"
              }
            ]
          },
          {
            "id": "bio11_ch7",
            "number": 7,
            "title": "Structural Organisation in Animals",
            "subtopics": [
              {
                "id": "bio11_7_1",
                "code": "7.1",
                "title": "Animal Tissues (Epithelial, Connective, Muscular, Neural)"
              },
              {
                "id": "bio11_7_2",
                "code": "7.2",
                "title": "Morphology and Anatomy of Frog"
              }
            ]
          },
          {
            "id": "bio11_ch8",
            "number": 8,
            "title": "Cell: The Unit of Life",
            "subtopics": [
              {
                "id": "bio11_8_1",
                "code": "8.1",
                "title": "Prokaryotic vs Eukaryotic Cells"
              },
              {
                "id": "bio11_8_2",
                "code": "8.2",
                "title": "Cell Membrane & Endomembrane System"
              },
              {
                "id": "bio11_8_3",
                "code": "8.3",
                "title": "Mitochondria, Plastids, Ribosomes, Nucleus"
              }
            ]
          },
          {
            "id": "bio11_ch9",
            "number": 9,
            "title": "Biomolecules",
            "subtopics": [
              {
                "id": "bio11_9_1",
                "code": "9.1",
                "title": "Biomacromolecules: Proteins, Lipids, Nucleic Acids"
              },
              {
                "id": "bio11_9_2",
                "code": "9.2",
                "title": "Enzymes: Mechanism, Factors & Classification"
              }
            ]
          },
          {
            "id": "bio11_ch10",
            "number": 10,
            "title": "Cell Cycle and Cell Division",
            "subtopics": [
              {
                "id": "bio11_10_1",
                "code": "10.1",
                "title": "Cell Cycle & Interphase"
              },
              {
                "id": "bio11_10_2",
                "code": "10.2",
                "title": "Mitosis & Meiosis (Phases and Significance)"
              }
            ]
          },
          {
            "id": "bio11_ch11",
            "number": 11,
            "title": "Photosynthesis in Higher Plants",
            "subtopics": [
              {
                "id": "bio11_11_1",
                "code": "11.1",
                "title": "Light Reaction: Z-Scheme & Photophosphorylation"
              },
              {
                "id": "bio11_11_2",
                "code": "11.2",
                "title": "Dark Reaction: Calvin (C3) & Hatch-Slack (C4) Cycles"
              },
              {
                "id": "bio11_11_3",
                "code": "11.3",
                "title": "Photorespiration & Limiting Factors"
              }
            ]
          },
          {
            "id": "bio11_ch12",
            "number": 12,
            "title": "Respiration in Plants",
            "subtopics": [
              {
                "id": "bio11_12_1",
                "code": "12.1",
                "title": "Glycolysis & Fermentation"
              },
              {
                "id": "bio11_12_2",
                "code": "12.2",
                "title": "Krebs Cycle, ETS & Oxidative Phosphorylation"
              },
              {
                "id": "bio11_12_3",
                "code": "12.3",
                "title": "Respiratory Quotient (RQ)"
              }
            ]
          },
          {
            "id": "bio11_ch13",
            "number": 13,
            "title": "Plant Growth and Development",
            "subtopics": [
              {
                "id": "bio11_13_1",
                "code": "13.1",
                "title": "Growth Phases, Rates & Differentiation"
              },
              {
                "id": "bio11_13_2",
                "code": "13.2",
                "title": "Plant Growth Regulators (Auxin, GA, Cytokinin, Ethylene, ABA)"
              }
            ]
          },
          {
            "id": "bio11_ch14",
            "number": 14,
            "title": "Breathing and Exchange of Gases",
            "subtopics": [
              {
                "id": "bio11_14_1",
                "code": "14.1",
                "title": "Human Respiratory System & Breathing Mechanism"
              },
              {
                "id": "bio11_14_2",
                "code": "14.2",
                "title": "Gas Exchange, Transport & Respiratory Disorders"
              }
            ]
          },
          {
            "id": "bio11_ch15",
            "number": 15,
            "title": "Body Fluids and Circulation",
            "subtopics": [
              {
                "id": "bio11_15_1",
                "code": "15.1",
                "title": "Blood Groups, Coagulation & Lymph"
              },
              {
                "id": "bio11_15_2",
                "code": "15.2",
                "title": "Heart Structure, Cardiac Cycle & ECG"
              },
              {
                "id": "bio11_15_3",
                "code": "15.3",
                "title": "Double Circulation & Disorders"
              }
            ]
          },
          {
            "id": "bio11_ch16",
            "number": 16,
            "title": "Excretory Products and Elimination",
            "subtopics": [
              {
                "id": "bio11_16_1",
                "code": "16.1",
                "title": "Human Excretory System & Nephron"
              },
              {
                "id": "bio11_16_2",
                "code": "16.2",
                "title": "Urine Formation & Counter Current Mechanism"
              },
              {
                "id": "bio11_16_3",
                "code": "16.3",
                "title": "Kidney Regulation & Excretory Disorders"
              }
            ]
          },
          {
            "id": "bio11_ch17",
            "number": 17,
            "title": "Locomotion and Movement",
            "subtopics": [
              {
                "id": "bio11_17_1",
                "code": "17.1",
                "title": "Muscle Structure & Sliding Filament Mechanism"
              },
              {
                "id": "bio11_17_2",
                "code": "17.2",
                "title": "Human Skeleton, Joints & Disorders"
              }
            ]
          },
          {
            "id": "bio11_ch18",
            "number": 18,
            "title": "Neural Control and Coordination",
            "subtopics": [
              {
                "id": "bio11_18_1",
                "code": "18.1",
                "title": "Neuron Structure & Nerve Impulse Conduction"
              },
              {
                "id": "bio11_18_2",
                "code": "18.2",
                "title": "Central Neural System: Human Brain"
              }
            ]
          },
          {
            "id": "bio11_ch19",
            "number": 19,
            "title": "Chemical Coordination and Integration",
            "subtopics": [
              {
                "id": "bio11_19_1",
                "code": "19.1",
                "title": "Endocrine Glands & Hormones"
              },
              {
                "id": "bio11_19_2",
                "code": "19.2",
                "title": "Mechanism of Hormone Action"
              }
            ]
          }
        ]
      },
      {
        "id": "maths_11",
        "name": "Mathematics",
        "code": "MATH-11",
        "color": "cyan",
        "themeColor": "from-cyan-500 to-blue-600",
        "badgeColor": "bg-cyan-100 text-cyan-700 border-cyan-200",
        "chapters": [
          {
            "id": "math11_ch1",
            "number": 1,
            "title": "Sets",
            "subtopics": [
              {
                "id": "math11_1_1",
                "code": "1.1",
                "title": "Sets Representations & Types of Sets"
              },
              {
                "id": "math11_1_2",
                "code": "1.2",
                "title": "Subsets, Power Set & Universal Set"
              },
              {
                "id": "math11_1_3",
                "code": "1.3",
                "title": "Venn Diagrams, Operations & Complement of Sets"
              }
            ]
          },
          {
            "id": "math11_ch2",
            "number": 2,
            "title": "Relations and Functions",
            "subtopics": [
              {
                "id": "math11_2_1",
                "code": "2.1",
                "title": "Cartesian Product of Sets"
              },
              {
                "id": "math11_2_2",
                "code": "2.2",
                "title": "Relations (Domain, Range) & Standard Functions"
              }
            ]
          },
          {
            "id": "math11_ch3",
            "number": 3,
            "title": "Trigonometric Functions",
            "subtopics": [
              {
                "id": "math11_3_1",
                "code": "3.1",
                "title": "Angles: Radian & Degree Measure"
              },
              {
                "id": "math11_3_2",
                "code": "3.2",
                "title": "Trigonometric Functions & Graphs"
              },
              {
                "id": "math11_3_3",
                "code": "3.3",
                "title": "Trigonometric Identities of Compound Angles"
              }
            ]
          },
          {
            "id": "math11_ch4",
            "number": 4,
            "title": "Complex Numbers and Quadratic Equations",
            "subtopics": [
              {
                "id": "math11_4_1",
                "code": "4.1",
                "title": "Complex Numbers & Algebra of Complex Numbers"
              },
              {
                "id": "math11_4_2",
                "code": "4.2",
                "title": "Modulus, Conjugate & Argand Plane"
              }
            ]
          },
          {
            "id": "math11_ch5",
            "number": 5,
            "title": "Linear Inequalities",
            "subtopics": [
              {
                "id": "math11_5_1",
                "code": "5.1",
                "title": "Linear Inequalities in One Variable"
              },
              {
                "id": "math11_5_2",
                "code": "5.2",
                "title": "System of Linear Inequalities Graphical Solution"
              }
            ]
          },
          {
            "id": "math11_ch6",
            "number": 6,
            "title": "Permutations and Combinations",
            "subtopics": [
              {
                "id": "math11_6_1",
                "code": "6.1",
                "title": "Fundamental Principle of Counting"
              },
              {
                "id": "math11_6_2",
                "code": "6.2",
                "title": "Permutations (nPr) & Combinations (nCr)"
              }
            ]
          },
          {
            "id": "math11_ch7",
            "number": 7,
            "title": "Binomial Theorem",
            "subtopics": [
              {
                "id": "math11_7_1",
                "code": "7.1",
                "title": "Binomial Theorem for Positive Integral Indices"
              },
              {
                "id": "math11_7_2",
                "code": "7.2",
                "title": "Pascal's Triangle & General Terms"
              }
            ]
          },
          {
            "id": "math11_ch8",
            "number": 8,
            "title": "Sequences and Series",
            "subtopics": [
              {
                "id": "math11_8_1",
                "code": "8.1",
                "title": "Sequences and Series Overview"
              },
              {
                "id": "math11_8_2",
                "code": "8.2",
                "title": "Geometric Progression (G.P.) & A.M.-G.M. Relation"
              }
            ]
          },
          {
            "id": "math11_ch9",
            "number": 9,
            "title": "Straight Lines",
            "subtopics": [
              {
                "id": "math11_9_1",
                "code": "9.1",
                "title": "Slope of a Line & Angle between Lines"
              },
              {
                "id": "math11_9_2",
                "code": "9.2",
                "title": "Equations of Line & Distance of Point from Line"
              }
            ]
          },
          {
            "id": "math11_ch10",
            "number": 10,
            "title": "Conic Sections",
            "subtopics": [
              {
                "id": "math11_10_1",
                "code": "10.1",
                "title": "Circle Standard Equation"
              },
              {
                "id": "math11_10_2",
                "code": "10.2",
                "title": "Parabola, Ellipse & Hyperbola Standard Equations"
              }
            ]
          },
          {
            "id": "math11_ch11",
            "number": 11,
            "title": "Introduction to Three Dimensional Geometry",
            "subtopics": [
              {
                "id": "math11_11_1",
                "code": "11.1",
                "title": "Coordinate Axes and Planes in 3D Space"
              },
              {
                "id": "math11_11_2",
                "code": "11.2",
                "title": "Distance Formula & Section Formula in 3D"
              }
            ]
          },
          {
            "id": "math11_ch12",
            "number": 12,
            "title": "Limits and Derivatives",
            "subtopics": [
              {
                "id": "math11_12_1",
                "code": "12.1",
                "title": "Intuitive Idea of Limits & Trigonometric Limits"
              },
              {
                "id": "math11_12_2",
                "code": "12.2",
                "title": "Derivatives: First Principle & Product/Quotient Rules"
              }
            ]
          },
          {
            "id": "math11_ch13",
            "number": 13,
            "title": "Statistics",
            "subtopics": [
              {
                "id": "math11_13_1",
                "code": "13.1",
                "title": "Measures of Dispersion Overview"
              },
              {
                "id": "math11_13_2",
                "code": "13.2",
                "title": "Mean Deviation, Variance and Standard Deviation"
              }
            ]
          },
          {
            "id": "math11_ch14",
            "number": 14,
            "title": "Probability",
            "subtopics": [
              {
                "id": "math11_14_1",
                "code": "14.1",
                "title": "Random Experiments, Sample Space and Events"
              },
              {
                "id": "math11_14_2",
                "code": "14.2",
                "title": "Axiomatic Approach to Probability & Addition Rule"
              }
            ]
          }
        ]
      }
    ]
  }
};

export const ALL_GRADE_LEVELS = [
  { id: 'plus_two', label: 'Plus Two (Class 12)', batches: ['B1', 'B2', 'B3'] },
  { id: 'plus_one', label: 'Plus One (Class 11)', batches: ['A1', 'A2'] }
];

export const TEACHER_SUBJECT_OPTIONS = [
  'Physics',
  'Chemistry',
  'Biology',
  'Botany',
  'Zoology',
  'Mathematics'
];

export const TEACHER_PRESET_NAMES = [
  'ABR',
  'ADL',
  'AMR',
  'ARJ',
  'AZ',
  'CY',
  'JN',
  'JS',
  'MF',
  'MRS',
  'SDR',
  'SHM',
  'SRJ'
];

export function getGradeForBatch(batch: string): 'plus_one' | 'plus_two' {
  if (['A1', 'A2'].includes(batch)) return 'plus_one';
  return 'plus_two';
}

export function getSubjectsForBatch(batch: string): NCERTSubject[] {
  const gradeKey = getGradeForBatch(batch);
  return NCERT_SYLLABUS_DATA[gradeKey].subjects;
}

export function findSubjectById(subjectId: string): NCERTSubject | undefined {
  for (const grade of Object.values(NCERT_SYLLABUS_DATA)) {
    const found = grade.subjects.find(s => s.id === subjectId);
    if (found) return found;
  }
  return undefined;
}

export function findSubjectByNameAndGrade(name: string, gradeKey: 'plus_one' | 'plus_two'): NCERTSubject | undefined {
  const grade = NCERT_SYLLABUS_DATA[gradeKey];
  if (!grade) return undefined;
  
  const normName = name.toLowerCase().trim();
  // Handle Botany & Zoology mapping to Biology
  if (normName === 'botany' || normName === 'zoology') {
    return grade.subjects.find(s => s.id.includes('biology') || s.name.toLowerCase().includes('biology'));
  }
  
  return grade.subjects.find(s => 
    s.name.toLowerCase().includes(normName) || normName.includes(s.name.toLowerCase())
  );
}
