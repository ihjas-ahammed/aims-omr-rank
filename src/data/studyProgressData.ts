export interface ChapterDef {
  id: string;
  chapterNumber: number;
  titleEn: string;
  titleMl: string;
  subtitleEn?: string;
  subtitleMl?: string;
  unitEn?: string;
  unitMl?: string;
  totalBoxes: 3;
}

export interface SubjectDef {
  id: string;
  nameEn: string;
  nameMl: string;
  code: string;
  color: string;
  bgGradient: string;
  borderColor: string;
  chapters: ChapterDef[];
}

export const STUDY_SUBJECTS: SubjectDef[] = [
  {
    id: 'physics',
    nameEn: 'Physics',
    nameMl: 'ഭൗതികശാസ്ത്രം',
    code: 'PHY',
    color: 'from-rose-600 to-pink-600',
    bgGradient: 'bg-gradient-to-r from-rose-600 to-pink-600',
    borderColor: 'border-rose-200',
    chapters: [
      {
        id: 'phy-1',
        chapterNumber: 1,
        titleEn: 'SOUND WAVES',
        titleMl: 'ശബ്ദ തരംഗങ്ങൾ',
        subtitleEn: 'Properties and propagation of sound',
        subtitleMl: 'ശബ്ദ തരംഗങ്ങളുടെ സവിശേഷതകൾ',
        totalBoxes: 3
      },
      {
        id: 'phy-2',
        chapterNumber: 2,
        titleEn: 'LENSES',
        titleMl: 'ലെൻസുകൾ',
        subtitleEn: 'Refraction and optical lenses',
        subtitleMl: 'പ്രകാശ അപവർത്തനവും ലെൻസുകളും',
        totalBoxes: 3
      }
    ]
  },
  {
    id: 'chemistry',
    nameEn: 'Chemistry',
    nameMl: 'രസതന്ത്രം',
    code: 'CHEM',
    color: 'from-purple-600 to-indigo-600',
    bgGradient: 'bg-gradient-to-r from-purple-600 to-indigo-600',
    borderColor: 'border-purple-200',
    chapters: [
      {
        id: 'chem-1',
        chapterNumber: 1,
        titleEn: 'NOMENCLATURE OF ORGANIC COMPOUNDS & ISOMERISM',
        titleMl: 'ഓർഗാനിക് സംയുക്തങ്ങളുടെ നാമകരണവും ഐസോമെറിസവും',
        subtitleEn: 'IUPAC naming rules and structure',
        subtitleMl: 'ഐ.യു.പി.എ.സി നാമകരണ തത്വങ്ങൾ',
        totalBoxes: 3
      },
      {
        id: 'chem-2',
        chapterNumber: 2,
        titleEn: 'CHEMICAL REACTIONS OF ORGANIC COMPOUNDS',
        titleMl: 'ഓർഗാനിക് സംയുക്തങ്ങളുടെ നാമകരണം',
        subtitleEn: 'Functional group reactions',
        subtitleMl: 'പ്രവർത്തന ഗ്രൂപ്പുകളുടെ രാസപ്രവർത്തനങ്ങൾ',
        totalBoxes: 3
      },
      {
        id: 'chem-3',
        chapterNumber: 3,
        titleEn: 'PERIODIC TABLE AND ELECTRON CONFIGURATION',
        titleMl: 'പിരിയോഡിക് ടേബിളും ഇലക്ട്രോൺ വിന്യാസവും',
        subtitleEn: 'Elements and shell configurations',
        subtitleMl: 'മൂലകങ്ങളുടെ ഇലക്ട്രോൺ വിന്യാസം',
        totalBoxes: 3
      }
    ]
  },
  {
    id: 'biology',
    nameEn: 'Biology',
    nameMl: 'ജീവശാസ്ത്രം',
    code: 'BIO',
    color: 'from-emerald-600 to-teal-600',
    bgGradient: 'bg-gradient-to-r from-emerald-600 to-teal-600',
    borderColor: 'border-emerald-200',
    chapters: [
      {
        id: 'bio-1',
        chapterNumber: 1,
        titleEn: 'GENETICS OF LIFE',
        titleMl: 'ജീവന്റെ ജനിതകം',
        subtitleEn: 'DNA, RNA and genetic inheritance',
        subtitleMl: 'ഡി.എൻ.എ ഉം ജനിതക ഘടനയും',
        totalBoxes: 3
      },
      {
        id: 'bio-2',
        chapterNumber: 2,
        titleEn: 'PATHS OF EVOLUTIONS',
        titleMl: 'പരിണാമത്തിന്റെ വഴികൾ',
        subtitleEn: 'Evolutionary theory and origin of species',
        subtitleMl: 'പരിണാമ സിദ്ധാന്തങ്ങളും തെളിവുകളും',
        totalBoxes: 3
      }
    ]
  },
  {
    id: 'maths',
    nameEn: 'Mathematics',
    nameMl: 'ഗണിതം',
    code: 'MATH',
    color: 'from-blue-600 to-cyan-600',
    bgGradient: 'bg-gradient-to-r from-blue-600 to-cyan-600',
    borderColor: 'border-blue-200',
    chapters: [
      {
        id: 'math-1',
        chapterNumber: 1,
        titleEn: 'ARITHMETIC SEQUENCES',
        titleMl: 'സമാന്തര ശ്രേണികൾ',
        subtitleEn: 'Number patterns and common difference',
        subtitleMl: 'സമാന്തര ശ്രേണികളുടെ പൊതുവ്യത്യാസം',
        totalBoxes: 3
      },
      {
        id: 'math-2',
        chapterNumber: 2,
        titleEn: 'CIRCLES AND ANGLES',
        titleMl: 'വൃത്തങ്ങളും കോണുകളും',
        subtitleEn: 'Central angles and cyclic quadrilaterals',
        subtitleMl: 'വൃത്തത്തിലെ കോണുകളുടെ സവിശേഷതകൾ',
        totalBoxes: 3
      },
      {
        id: 'math-3',
        chapterNumber: 3,
        titleEn: 'ARITHMETIC SEQUENCES AND ALGEBRA',
        titleMl: 'സമാന്തര ശ്രേണിയും ബീജ ഗണിതവും',
        subtitleEn: 'Algebraic expression of nth terms',
        subtitleMl: 'ശ്രേണികളുടെ ബീജഗണിത രൂപം',
        totalBoxes: 3
      },
      {
        id: 'math-4',
        chapterNumber: 4,
        titleEn: 'MATHEMATICS OF CHANCE',
        titleMl: 'സാധ്യതകളുടെ ഗണിതം',
        subtitleEn: 'Probability calculations',
        subtitleMl: 'സാധ്യതയും സംഭവങ്ങളും',
        totalBoxes: 3
      },
      {
        id: 'math-5',
        chapterNumber: 5,
        titleEn: 'SECOND DEGREE EQUATIONS',
        titleMl: 'രണ്ടാംകൃതി സമവാക്യങ്ങൾ',
        subtitleEn: 'Quadratic equations and roots',
        subtitleMl: 'രണ്ടാംകൃതി സമവാക്യങ്ങളുടെ നിർദ്ധാരണം',
        totalBoxes: 3
      }
    ]
  },
  {
    id: 'english',
    nameEn: 'English',
    nameMl: 'English',
    code: 'ENG',
    color: 'from-amber-600 to-rose-600',
    bgGradient: 'bg-gradient-to-r from-amber-600 to-rose-600',
    borderColor: 'border-amber-200',
    chapters: [
      {
        id: 'eng-1',
        chapterNumber: 1,
        unitEn: 'UNIT 1: TRIALS & TRIUMPHS',
        unitMl: 'UNIT 1: TRIALS & TRIUMPHS',
        titleEn: 'A VERY OLD MAN WITH ENORMOUS WINGS',
        titleMl: 'A VERY OLD MAN WITH ENORMOUS WINGS',
        subtitleEn: 'Magical Realism',
        subtitleMl: 'Magical Realism',
        totalBoxes: 3
      },
      {
        id: 'eng-2',
        chapterNumber: 2,
        unitEn: 'UNIT 1: TRIALS & TRIUMPHS',
        unitMl: 'UNIT 1: TRIALS & TRIUMPHS',
        titleEn: 'IN THE ATTIC',
        titleMl: 'IN THE ATTIC',
        subtitleEn: 'Prose Study',
        subtitleMl: 'Prose Study',
        totalBoxes: 3
      },
      {
        id: 'eng-3',
        chapterNumber: 3,
        unitEn: 'UNIT 1: TRIALS & TRIUMPHS',
        unitMl: 'UNIT 1: TRIALS & TRIUMPHS',
        titleEn: 'FRIENDS ROMANS AND COUNTRYMAN',
        titleMl: 'FRIENDS ROMANS AND COUNTRYMAN',
        subtitleEn: 'Classic Oratory',
        subtitleMl: 'Classic Oratory',
        totalBoxes: 3
      },
      {
        id: 'eng-4',
        chapterNumber: 1,
        unitEn: 'UNIT 2: PATHS OF PROGRESS',
        unitMl: 'UNIT 2: PATHS OF PROGRESS',
        titleEn: 'BREAKING BARRIERS I WILL FLY',
        titleMl: 'BREAKING BARRIERS I WILL FLY',
        subtitleEn: 'Inspirational Essay',
        subtitleMl: 'Inspirational Essay',
        totalBoxes: 3
      },
      {
        id: 'eng-5',
        chapterNumber: 2,
        unitEn: 'UNIT 2: PATHS OF PROGRESS',
        unitMl: 'UNIT 2: PATHS OF PROGRESS',
        titleEn: 'A PHOENIX RISES',
        titleMl: 'A PHOENIX RISES',
        subtitleEn: 'Modern Poetry',
        subtitleMl: 'Modern Poetry',
        totalBoxes: 3
      }
    ]
  },
  {
    id: 'hindi',
    nameEn: 'Hindi',
    nameMl: 'हिन्दी',
    code: 'HIN',
    color: 'from-orange-600 to-amber-600',
    bgGradient: 'bg-gradient-to-r from-orange-600 to-amber-600',
    borderColor: 'border-orange-200',
    chapters: [
      {
        id: 'hin-1',
        chapterNumber: 1,
        unitEn: 'UNIT 1',
        unitMl: 'UNIT 1',
        titleEn: 'खिड़की (KHIDKI)',
        titleMl: 'खिड़की (लघुकथा)',
        subtitleEn: 'Short Story',
        subtitleMl: 'लघुकथा',
        totalBoxes: 3
      },
      {
        id: 'hin-2',
        chapterNumber: 2,
        unitEn: 'UNIT 1',
        unitMl: 'UNIT 1',
        titleEn: 'जिंदगी का सफर (ZINDAGI KA SAFAR)',
        titleMl: 'जिंदगी का सफर (हाइकु)',
        subtitleEn: 'Haiku Poetry',
        subtitleMl: 'हाइकु',
        totalBoxes: 3
      },
      {
        id: 'hin-3',
        chapterNumber: 3,
        unitEn: 'UNIT 1',
        unitMl: 'UNIT 1',
        titleEn: 'रैन बसेरे में... (RAIN BASERE MEIN)',
        titleMl: 'रैन बसेरे में... (यात्रावृत्त)',
        subtitleEn: 'Travelogue',
        subtitleMl: 'यात्रावृत्त',
        totalBoxes: 3
      },
      {
        id: 'hin-4',
        chapterNumber: 1,
        unitEn: 'UNIT 2',
        unitMl: 'UNIT 2',
        titleEn: 'मेरी दुनिया के तमाम बच्चे',
        titleMl: 'मेरी दुनिया के तमाम बच्चे (कविता)',
        subtitleEn: 'Poem Study',
        subtitleMl: 'कविता',
        totalBoxes: 3
      },
      {
        id: 'hin-5',
        chapterNumber: 2,
        unitEn: 'UNIT 2',
        unitMl: 'UNIT 2',
        titleEn: 'व्हाइट कैप (WHITE CAP)',
        titleMl: 'व्हाइट कैप (कहानी)',
        subtitleEn: 'Story Analysis',
        subtitleMl: 'कहानी',
        totalBoxes: 3
      }
    ]
  },
  {
    id: 'history',
    nameEn: 'History',
    nameMl: 'ചരിത്രം',
    code: 'HIST',
    color: 'from-violet-600 to-indigo-700',
    bgGradient: 'bg-gradient-to-r from-violet-600 to-indigo-700',
    borderColor: 'border-violet-200',
    chapters: [
      {
        id: 'hist-1',
        chapterNumber: 1,
        titleEn: 'HUMANISM',
        titleMl: 'മാനവികത',
        subtitleEn: 'Renaissance and culture',
        subtitleMl: 'നവോത്ഥാനവും മാനവിക ചിന്തകളും',
        totalBoxes: 3
      },
      {
        id: 'hist-2',
        chapterNumber: 2,
        titleEn: 'LIBERTY EQUALITY FRATERNITY',
        titleMl: 'സ്വാതന്ത്ര്യം, സമത്വം, സാഹോദര്യം',
        subtitleEn: 'French revolution ideals',
        subtitleMl: 'ഫ്രഞ്ച് വിപ്ലവവും ആശയങ്ങളും',
        totalBoxes: 3
      },
      {
        id: 'hist-3',
        chapterNumber: 3,
        titleEn: 'SOCIAL ANALYSIS THROUGH SOCIOLOGICAL IMAGINATION',
        titleMl: 'സാമൂഹിക വിശകലനം: സമൂഹ ശാസ്ത്ര സങ്കല്പത്തിലൂടെ',
        subtitleEn: 'Sociology perspectives',
        subtitleMl: 'സമൂഹശാസ്ത്ര സങ്കല്പങ്ങൾ',
        totalBoxes: 3
      }
    ]
  },
  {
    id: 'geography',
    nameEn: 'Geography',
    nameMl: 'ഭൂമിശാസ്ത്രം',
    code: 'GEO',
    color: 'from-sky-600 to-blue-600',
    bgGradient: 'bg-gradient-to-r from-sky-600 to-blue-600',
    borderColor: 'border-sky-200',
    chapters: [
      {
        id: 'geo-1',
        chapterNumber: 1,
        titleEn: 'WEATHER AND CLIMATE',
        titleMl: 'ദിനാന്തരീക്ഷ സ്ഥിതിയും കാലാവസ്ഥയും',
        subtitleEn: 'Weather elements and dynamics',
        subtitleMl: 'ദിനാന്തരീക്ഷ ഘടകങ്ങൾ',
        totalBoxes: 3
      },
      {
        id: 'geo-2',
        chapterNumber: 2,
        titleEn: 'CLIMATIC REGION AND THE CLIMATE CHANGE',
        titleMl: 'കാലാവസ്ഥ മേഖലകളും കാലാവസ്ഥ മാറ്റവും',
        subtitleEn: 'Global climate patterns',
        subtitleMl: 'ആഗോള കാലാവസ്ഥ വ്യതിയാനം',
        totalBoxes: 3
      },
      {
        id: 'geo-3',
        chapterNumber: 3,
        titleEn: 'FROM THE RAINY FORESTS TO THE LAND OF PERMAFROST',
        titleMl: 'മഴക്കാടുകളിൽ നിന്ന് മഞ്ഞിന്റെ നാട്ടിലേക്ക്',
        subtitleEn: 'Global biomes',
        subtitleMl: 'ലോകത്തിലെ വിവിധ ജീവമണ്ഡലങ്ങൾ',
        totalBoxes: 3
      },
      {
        id: 'geo-4',
        chapterNumber: 4,
        titleEn: 'CONSUMERS RIGHT & PROTECTION',
        titleMl: 'ഉപഭോക്താവ് : അവകാശങ്ങളും സംരക്ഷണവും',
        subtitleEn: 'Consumer awareness and laws',
        subtitleMl: 'ഉപഭോക്തൃ അവകാശ സംരക്ഷണം',
        totalBoxes: 3
      },
      {
        id: 'geo-5',
        chapterNumber: 5,
        titleEn: 'MONEY AND ECONOMY',
        titleMl: 'പണവും സാമ്പത്തിക വ്യവസ്ഥയും',
        subtitleEn: 'Financial systems',
        subtitleMl: 'സാമ്പത്തിക ക്രമങ്ങളും പണവും',
        totalBoxes: 3
      }
    ]
  }
];

export const TOTAL_CHAPTERS = STUDY_SUBJECTS.reduce((acc, sub) => acc + sub.chapters.length, 0);
export const TOTAL_CHECKPOINTS = TOTAL_CHAPTERS * 3;
