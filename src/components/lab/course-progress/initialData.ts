import { SubjectProgress, TaskData } from './types';

const generateId = () => Math.random().toString(36).substring(7);

const createSession = (teacher: string | null): TaskData => {
  if (!teacher) return { status: 'pending', sessions: [] };
  return {
    status: 'finished',
    sessions: [{
      id: generateId(),
      teacher
    }]
  };
};

export const initialData: SubjectProgress[] = [
  {
    name: "Physics",
    chapters: [
      { name: "Electric charges and fields", tcr: createSession("ABR"), entrance: createSession("ABR"), revision: createSession("ARJ") },
      { name: "Electrostatic potential and capacitance", tcr: createSession("ABR"), entrance: createSession(null), revision: createSession("ARJ") },
      { name: "Current electricity", tcr: createSession("ARJ"), entrance: createSession("ARJ"), revision: createSession("NSR") },
      { name: "Moving charges and magnetism", tcr: createSession("ARJ"), entrance: createSession("ARJ"), revision: createSession("ARJ") },
      { name: "Magnetism and matter", tcr: createSession("ARJ"), entrance: createSession(null), revision: createSession(null) },
      { name: "Electromagnetic induction", tcr: createSession("JN"), entrance: createSession(null), revision: createSession("NSR") },
      { name: "Alternating current", tcr: createSession("ARJ"), entrance: createSession(null), revision: createSession("NSR") },
      { name: "Electromagnetic wave", tcr: createSession("JN"), entrance: createSession(null), revision: createSession(null) },
      { name: "Ray optics", tcr: createSession("ARJ"), entrance: createSession(null), revision: createSession("NSR") },
      { name: "Wave optics", tcr: createSession("ARJ"), entrance: createSession(null), revision: createSession("NSR") },
      { name: "Dual nature ", tcr: createSession("ABR"), entrance: createSession(null), revision: createSession("NSR") },
      { name: "Atoms", tcr: createSession("ABR"), entrance: createSession(null), revision: createSession("ARJ") },
      { name: "Nuclei", tcr: createSession("ARJ"), entrance: createSession(null), revision: createSession("NSR") },
      { name: "Semiconductors", tcr: createSession("ARJ"), entrance: createSession(null), revision: createSession(null) }
    ]
  },
  {
    name: "CHEMISTRY",
    chapters: [
      { name: "Solutions", tcr: createSession("CAZ"), entrance: createSession("CAZ"), revision: createSession("CAZ") },
      { name: "Electrochemistry", tcr: createSession("CY"), entrance: createSession("CY"), revision: createSession("CY") },
      { name: "Chemical kinetics", tcr: createSession("CY"), entrance: createSession("CY"), revision: createSession("CY") },
      { name: "D and f block", tcr: createSession("CAZ"), entrance: createSession(null), revision: createSession("CY") },
      { name: "Coordination compound", tcr: createSession("CAZ"), entrance: createSession(null), revision: createSession("CAZ") },
      { name: "Haloalkanes and haloarenes", tcr: createSession("JSL"), entrance: createSession("need 2H"), revision: createSession("CY") },
      { name: "Alcohols,phenols and ethers", tcr: createSession("CY"), entrance: createSession(null), revision: createSession("CY") },
      { name: "Aldehydes, ketone and carboxylate acids", tcr: createSession("CY"), entrance: createSession(null), revision: createSession("CY") },
      { name: "Amines", tcr: createSession("CAZ"), entrance: createSession(null), revision: createSession("CY") },
      { name: "Bio molecules", tcr: createSession("CY"), entrance: createSession(null), revision: createSession("CY") }
    ]
  },
  {
    name: "Maths",
    chapters: [
      { name: "Relations and functions", tcr: createSession("SRJ"), entrance: createSession("MRS"), revision: createSession("MF") },
      { name: "Inverse trignometry", tcr: createSession("SRJ"), entrance: createSession(null), revision: createSession("MRS") },
      { name: "Matrices", tcr: createSession("MF"), entrance: createSession("MF"), revision: createSession(null) },
      { name: "Determinants", tcr: createSession("MF"), entrance: createSession("MF"), revision: createSession(null) },
      { name: "Continuity and differentiability", tcr: createSession("MF"), entrance: createSession("MRS"), revision: createSession("SRJ") },
      { name: "Applications of derivatives", tcr: createSession("MRS"), entrance: createSession(null), revision: createSession("ADL") },
      { name: "Integrals", tcr: createSession("MF"), entrance: createSession(null), revision: createSession("SRJ") },
      { name: "Applications of integrals", tcr: createSession("MF"), entrance: createSession(null), revision: createSession("SRJ") },
      { name: "Differential equations", tcr: createSession("MRS"), entrance: createSession(null), revision: createSession("MF") },
      { name: "Vector algebra", tcr: createSession("ADL"), entrance: createSession(null), revision: createSession("MRS") },
      { name: "Three dimensional geometry", tcr: createSession("ADL"), entrance: createSession(null), revision: createSession("MF") },
      { name: "Linear programming", tcr: createSession("SRJ"), entrance: createSession(null), revision: createSession("MF") },
      { name: "Probability", tcr: createSession("ADL"), entrance: createSession(null), revision: createSession("MRS") }
    ]
  },
  {
    name: "ZOOLOGY",
    chapters: [
      { name: "Human reproduction", tcr: createSession("AZ"), entrance: createSession(null), revision: createSession("IQ") },
      { name: "Reproductive health", tcr: createSession("IQ"), entrance: createSession(null), revision: createSession("AZ") },
      { name: "Principles of heredity and variation", tcr: createSession("AZ"), entrance: createSession(null), revision: createSession("IQ") },
      { name: "Molecular basis of inheritance", tcr: createSession("AZ"), entrance: createSession(null), revision: createSession("IQ") },
      { name: "Evolution", tcr: createSession("IQ"), entrance: createSession(null), revision: createSession("AZ") },
      { name: "Human health and Diseases", tcr: createSession("IQ"), entrance: createSession(null), revision: createSession("AZ") },
      { name: "Microbes in human welfare", tcr: createSession("AZ"), entrance: createSession(null), revision: createSession("AZ") },
      { name: "Biodiversity and conservation", tcr: createSession("AZ"), entrance: createSession(null), revision: createSession("AZ") }
    ]
  },
  {
    name: "BOTANY",
    chapters: [
      { name: "Sexual reproduction in flowering plant", tcr: createSession("JS"), entrance: createSession("JS"), revision: createSession("JS") },
      { name: "Biotechnology principles and processes", tcr: createSession("SHM"), entrance: createSession("SHM"), revision: createSession("JS") },
      { name: "Biotechnology and its application", tcr: createSession("JS"), entrance: createSession(null), revision: createSession(null) },
      { name: "Organism and population", tcr: createSession("SHM"), entrance: createSession(null), revision: createSession("JS") },
      { name: "Ecosystem", tcr: createSession("JS"), entrance: createSession(null), revision: createSession(null) }
    ]
  }
];