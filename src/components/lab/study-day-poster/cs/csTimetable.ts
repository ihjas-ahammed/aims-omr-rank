// Source: "AIMS PLUS — Plus One Computer Science Study Timetable (A1 & A2)" — same plan for both batches,
// cycle 08 NOV – 15 NOV 2026. Saturday/Sunday rows were cut off in the PDF, so they are read from its HTML source.

export interface CsChapter {
  date: string; // YYYY-MM-DD
  dayNo: number;
  tag: string; // "CHAPTER 02" | "REVISION"
  title: string;
  icon: string; // key into CS_ICONS
  topics: string[];
  exam?: undefined;
}

export interface CsExamDay {
  date: string;
  exam: true;
  label: string;
}

export type CsDay = CsChapter | CsExamDay;

export const CS_CYCLE_LABEL = '08 NOV – 15 NOV 2026';

export const CS_TIMETABLE: CsDay[] = [
  {
    date: '2026-11-08',
    dayNo: 1,
    tag: 'CHAPTER 02',
    title: 'Data Representation and Boolean Algebra (Part 1)',
    icon: 'cs_binary',
    topics: [
      'Number Systems (Decimal, Binary, Octal, Hex)',
      'Number Conversions (Integer & Fractional)',
      'Binary Arithmetic (Addition & Subtraction)',
      "Integers: Sign & Magnitude, 1's & 2's Complement",
      'Floating-Point Representation (Mantissa & Exponent)',
      'Characters (ASCII, EBCDIC, ISCII, Unicode) & File Formats'
    ]
  },
  {
    date: '2026-11-09',
    dayNo: 2,
    tag: 'CHAPTER 02',
    title: 'Data Representation and Boolean Algebra (Part 2)',
    icon: 'cs_gate',
    topics: [
      'Introduction to Boolean Algebra & Binary Quantities',
      'Basic Logic Gates (OR, AND, NOT) & Truth Tables',
      'Basic Postulates & Principle of Duality',
      'Boolean Laws (Identity, Idempotent, Involution, Absorption)',
      "De Morgan's Theorems & Algebraic Proofs",
      'Circuit Designing & Universal Gates (NAND & NOR)'
    ]
  },
  {
    date: '2026-11-10',
    dayNo: 3,
    tag: 'CHAPTER 03',
    title: 'Components of the Computer System (Hardware & Memory)',
    icon: 'cs_chip',
    topics: [
      'Data Processing & 6 Stages of Data Processing',
      'Functional Units (Input, ALU, CU, Registers, Storage, Output)',
      'Processors & CPU Registers (ACC, MAR, MBR, IR, PC)',
      'Motherboard, Peripherals & Communication Ports',
      'Primary Memory (RAM, ROM, Cache) & Secondary Storage',
      'Input Devices & Output Devices (VDU, Printers, Plotter, 3D)'
    ]
  },
  {
    date: '2026-11-11',
    dayNo: 4,
    tag: 'CHAPTER 03',
    title: 'Components of the Computer System (e-Waste & Software)',
    icon: 'cs_software',
    topics: [
      'e-Waste: Hazardous Chemicals & Disposal Methods',
      'Role of Students & Green Computing (Energy Star)',
      'System Software: Operating System & Major Functions',
      'Language Processors (Assembler, Interpreter, Compiler)',
      'Utility Software & Application Software Packages',
      'FOSS (4 Freedoms), Freeware, Shareware & Humanware'
    ]
  },
  {
    date: '2026-11-12',
    dayNo: 5,
    tag: 'CHAPTER 04',
    title: 'Principles of Programming and Problem Solving',
    icon: 'cs_flowchart',
    topics: [
      'Approaches in Problem Solving (Top-Down & Bottom-Up)',
      'Phases in Programming & Problem Identification',
      'Algorithms (Characteristics) & Flowchart Symbols',
      'Selection & Looping (Entry vs Exit Controlled Loops)',
      'Coding, Translation & Debugging (Syntax, Logical, Runtime)',
      'Execution, Testing, Documentation & Algorithm Evaluation'
    ]
  },
  {
    date: '2026-11-13',
    dayNo: 6,
    tag: 'CHAPTER 05',
    title: 'Introduction to C++ Programming',
    icon: 'cs_cpp',
    topics: [
      'C++ Character Set (Letters, Digits, Special, White Spaces)',
      'Tokens: Keywords & Rules for Valid Identifiers',
      'Integer & Floating-Point Literals (Fractional & Exponential)',
      'Character Literals, Escape Sequences & String Literals',
      'Punctuators & Operators in C++',
      'Integrated Development Environment (GCC & Geany IDE)'
    ]
  },
  {
    date: '2026-11-14',
    dayNo: 7,
    tag: 'REVISION',
    title: 'Comprehensive Revision & Previous Years Questions (Ch 02–05)',
    icon: 'cs_revision',
    topics: [
      "Number Conversions & 1's / 2's Complement Numericals",
      'Boolean Law Proofs, Logic Circuits & Universal Gates',
      'CPU Registers, Memory Hierarchy, Printers & Software',
      'Flowchart Practice & C++ Token / Identifier Classification'
    ]
  },
  { date: '2026-11-15', exam: true, label: 'COMPUTER SCIENCE EXAM — CHAPTERS 02, 03, 04 & 05' }
];

export const getCsDay = (dateKey: string): CsDay | null => CS_TIMETABLE.find((d) => d.date === dateKey) ?? null;
