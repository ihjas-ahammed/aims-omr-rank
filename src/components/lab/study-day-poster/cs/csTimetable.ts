// Plus One Computer Science, REVISED SCERT Kerala syllabus (2026–27 textbook, with Python), cycle 08 NOV – 15 NOV 2026.
// Same plan for both batches. Chapter titles are the textbook's; the topics are condensed from the chapter-wise notes at
// hsslive.in (Anagh R K / TJ / Ranjith V). The Part A / Part B split of the long chapters and the day-to-chapter plan
// are our own planning, not something the textbook prescribes.

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
    // Day 01 (Sunday) was already sent; kept here so the page still works for that date.
    date: '2026-11-08',
    dayNo: 1,
    tag: 'CHAPTER 01',
    title: 'Introduction to Computing (Part A)',
    icon: 'cs_code',
    topics: [
      'Evolution of Number Systems: Egyptian to Mayan & Roman',
      'Abacus, Napier’s Bones & Pascaline',
      'Leibniz’s Calculator & Jacquard’s Loom',
      'Difference Engine & Analytical Engine (Babbage)',
      'Mark I & the Stored Program Computer (von Neumann)',
      'Generations of Computers: First to Fifth'
    ]
  },
  {
    date: '2026-11-09',
    dayNo: 2,
    tag: 'CHAPTER 01',
    title: 'Introduction to Computing (Part B)',
    icon: 'cs_code',
    topics: [
      'Evolution of Programming Languages: Machine, Assembly & High Level',
      'Language Translators: Assembler, Compiler & Interpreter',
      'Uses of Computers: Data Storage, Processing & Problem Solving',
      'Networking & Communication: Internet, Email & Video Calls',
      'Intelligent Decision Making: AI, Machine Learning & IoT',
      'Computers for Data Processing: Input, Storage, Output & Visualisation'
    ]
  },
  {
    date: '2026-11-10',
    dayNo: 3,
    tag: 'CHAPTER 02',
    title: 'Data Representation and Boolean Algebra (Part A)',
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
    date: '2026-11-11',
    dayNo: 4,
    tag: 'CHAPTER 02',
    title: 'Data Representation and Boolean Algebra (Part B)',
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
    date: '2026-11-12',
    dayNo: 5,
    tag: 'CHAPTER 03',
    title: 'Computer System Organisation (Part A: Hardware)',
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
    date: '2026-11-13',
    dayNo: 6,
    tag: 'CHAPTER 03',
    title: 'Computer System Organisation (Part B: Software)',
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
    date: '2026-11-14',
    dayNo: 7,
    tag: 'CH 04 · REVISION',
    title: 'Getting Started with Python & Revision (Ch 01–04)',
    icon: 'cs_python',
    topics: [
      'Python: Guido van Rossum, Features & Cross-Platform Use',
      'Interpreter, Bytecode & Platform Independence',
      'IDLE & Python Shell: Interactive Mode vs Script Mode',
      'Revision: Number Conversions & 1’s / 2’s Complement Numericals',
      'Revision: Boolean Laws, Logic Gates & Universal Gates',
      'Revision: Memory, Software, Flowcharts & PYQ Drill'
    ]
  },
  { date: '2026-11-15', exam: true, label: 'COMPUTER SCIENCE EXAM — CHAPTERS 01 TO 04' }
];

export const getCsDay = (dateKey: string): CsDay | null => CS_TIMETABLE.find((d) => d.date === dateKey) ?? null;
