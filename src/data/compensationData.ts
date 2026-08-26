export interface CompensationChapter {
  id: string;
  subject: 'Physics' | 'Chemistry' | 'Mathematics' | 'Zoology';
  name: string;
  teacher?: string;
}

export const A2_COMPENSATION_CHAPTERS: CompensationChapter[] = [
  // Physics
  { id: 'phy_1', subject: 'Physics', name: 'Units & measurement', teacher: 'JN' },
  { id: 'phy_2', subject: 'Physics', name: 'Motion in a straight line', teacher: 'ARJ' },
  { id: 'phy_3', subject: 'Physics', name: 'Motion in a plane', teacher: 'ABR' },
  { id: 'phy_4', subject: 'Physics', name: 'Laws of motion', teacher: 'ARJ' },

  // Chemistry
  { id: 'chem_1', subject: 'Chemistry', name: 'Some basic concepts in Chemistry', teacher: 'AMR' },
  { id: 'chem_2', subject: 'Chemistry', name: 'Structure of atom', teacher: 'CY' },

  // Mathematics
  { id: 'math_1', subject: 'Mathematics', name: 'Sets', teacher: 'MF' },
  { id: 'math_2', subject: 'Mathematics', name: 'Relation and function', teacher: 'ADL' },
  { id: 'math_4', subject: 'Mathematics', name: 'Complex numbers and Quadratic equations', teacher: 'ADL' },

  // Zoology
  { id: 'zoo_1', subject: 'Zoology', name: 'Structural Organisation in Animals', teacher: '' },
];

export const A2_SUBJECTS: ('Physics' | 'Chemistry' | 'Mathematics' | 'Zoology')[] = ['Physics', 'Chemistry', 'Mathematics', 'Zoology'];
