// Plus One Computer Science, REVISED SCERT Kerala syllabus (2026–27 textbook, with Python), cycle 08 NOV – 15 NOV 2026.
// Same plan for both batches. Chapter titles are the textbook's; the topics are condensed from the chapter-wise notes at
// hsslive.in (Anagh R K / TJ / Ranjith V). The Part A / Part B split of the long chapters and the day-to-chapter plan
// are our own planning, not something the textbook prescribes. Chapter numbers 02–05 are the revised textbook's own.

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
    // Day 01 (Sunday) was already sent; kept so the page still works for that date.
    date: '2026-11-08',
    dayNo: 1,
    tag: 'CHAPTER 02',
    title: 'Data Representation and Boolean Algebra (Part 1)',
    icon: 'cs_binary',
    topics: [
      'Number Systems: Decimal, Binary & Hexadecimal (Base/Radix)',
      'Decimal to Binary & Binary to Hexadecimal Conversions',
      'Binary Addition & Subtraction',
      'Integer Representation: Sign & Magnitude, 1’s & 2’s Complement',
      'Floating-Point Representation (Sign, Exponent & Mantissa)',
      'Character Representation: ASCII & Unicode (UTF Encodings)'
    ]
  },
  {
    date: '2026-11-09',
    dayNo: 2,
    tag: 'CHAPTER 02',
    title: 'Data Representation and Boolean Algebra (Part 2)',
    icon: 'cs_gate',
    topics: [
      'Image Representation: Pixels, Resolution & Colour Depth',
      'Bitmap vs Vector Images & Image Formats',
      'Audio Representation: Sampling, Digitisation & File Formats',
      'Video Representation: Frames, Frame Rate, Bit Rate & Formats',
      'Boolean Algebra: Logic Gates, Truth Tables, Identities & Duality',
      'De Morgan’s Theorems & Universal Gates (NAND & NOR)'
    ]
  },
  {
    date: '2026-11-10',
    dayNo: 3,
    tag: 'CHAPTER 03',
    title: 'Computer System Organisation (Hardware & Memory)',
    icon: 'cs_chip',
    topics: [
      'Components of a Computer System: Hardware & Software',
      'CPU, Registers, Cache & Program Execution Steps',
      'Processors: CPU, GPU, TPU/NPU & Heterogeneous Computing',
      'Motherboard, Ports (USB Types) & Expansion Slots',
      'Memory & Storage: RAM, ROM, Cache, HDD, Optical & SSD (NVMe)',
      'Input & Output Devices: VDU, Printers, Plotters & Speakers'
    ]
  },
  {
    date: '2026-11-11',
    dayNo: 4,
    tag: 'CHAPTER 03',
    title: 'Computer System Organisation (Software & Algorithms)',
    icon: 'cs_flowchart',
    topics: [
      'System Software: Operating System & Its Functions',
      'Language Processors: Assembler, Compiler, Interpreter & Bytecode',
      'Utility Software: Antivirus, Backup, Disk Cleaner & Compression',
      'Application Software & Phases in Programming',
      'Errors: Syntax, Logical & Run-time',
      'Algorithms & Flowcharts: Symbols & Problem Solving'
    ]
  },
  {
    date: '2026-11-12',
    dayNo: 5,
    tag: 'CHAPTER 04',
    title: 'Getting Started with Python',
    icon: 'cs_python',
    topics: [
      'Python: History (Guido van Rossum, 1991) & Applications',
      'Why Python: Simple Syntax, Open Source & Cross-Platform',
      'Interpreter, Bytecode & Platform Independence',
      'Python IDEs & IDLE: Python Shell and the >>> Prompt',
      'Interactive Mode: Executing Statements Instantly',
      'Script Mode: Saving .py Files & Run Module'
    ]
  },
  {
    date: '2026-11-13',
    dayNo: 6,
    tag: 'CHAPTER 05',
    title: 'Python Fundamentals',
    icon: 'cs_shell',
    topics: [
      'Character Set: Letters, Digits, Special Symbols & Whitespace',
      'Tokens: Keywords & Rules for Valid Identifiers',
      'Literals: String (Escape Sequences), Numeric, Boolean & None',
      'Operators: Arithmetic, Relational, Logical, Assignment, Identity & Membership',
      'Variables, Data Types & Mutable vs Immutable Objects',
      'Expressions, Precedence, input() / print() & Comments'
    ]
  },
  {
    date: '2026-11-14',
    dayNo: 7,
    tag: 'REVISION',
    title: 'Comprehensive Revision & Previous Years Questions (Ch 02–05)',
    icon: 'cs_revision',
    topics: [
      'Number Conversions & 1’s / 2’s Complement Numericals',
      'Boolean Law Proofs, Logic Circuits & Universal Gates',
      'CPU Registers, Memory Hierarchy, Printers & Software',
      'Flowchart Practice & Python Token / Identifier Classification'
    ]
  },
  { date: '2026-11-15', exam: true, label: 'COMPUTER SCIENCE EXAM — CHAPTERS 02, 03, 04 & 05' }
];

export const getCsDay = (dateKey: string): CsDay | null => CS_TIMETABLE.find((d) => d.date === dateKey) ?? null;
