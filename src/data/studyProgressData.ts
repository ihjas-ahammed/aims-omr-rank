export interface ChapterDef {
  id: string;
  chapterNumber: number;
  titleEn: string;
  titleMl: string;
  subtitleEn?: string;
  subtitleMl?: string;
  unitEn?: string;
  unitMl?: string;
  totalBoxes?: number;
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

export type FirstLanguageSubject = 'Malayalam' | 'Arabic' | 'Urdu';

export const FIRST_LANGUAGE_SUBJECTS: Record<FirstLanguageSubject, SubjectDef> = {
  Malayalam: {
    id: 'malayalam1',
    nameEn: 'Malayalam I',
    nameMl: 'മലയാളം I',
    code: 'MAL-1',
    color: 'from-pink-600 to-rose-600',
    bgGradient: 'bg-gradient-to-r from-pink-600 to-rose-600',
    borderColor: 'border-pink-200',
    chapters: [
      { id: 'mal1-1', chapterNumber: 1, titleEn: 'UNIT 1', titleMl: 'UNIT 1', totalBoxes: 1 },
      { id: 'mal1-2', chapterNumber: 2, titleEn: 'UNIT 2', titleMl: 'UNIT 2', totalBoxes: 1 },
      { id: 'mal1-3', chapterNumber: 3, titleEn: 'UNIT 3', titleMl: 'UNIT 3', totalBoxes: 1 },
      { id: 'mal1-4', chapterNumber: 4, titleEn: 'UNIT 4', titleMl: 'UNIT 4', totalBoxes: 1 }
    ]
  },
  Arabic: {
    id: 'arabic',
    nameEn: 'Arabic',
    nameMl: 'അറബിക്',
    code: 'ARB',
    color: 'from-emerald-600 to-teal-600',
    bgGradient: 'bg-gradient-to-r from-emerald-600 to-teal-600',
    borderColor: 'border-emerald-200',
    chapters: [
      { id: 'arb-1', chapterNumber: 1, titleEn: 'UNIT 1', titleMl: 'UNIT 1', totalBoxes: 1 },
      { id: 'arb-2', chapterNumber: 2, titleEn: 'UNIT 2', titleMl: 'UNIT 2', totalBoxes: 1 },
      { id: 'arb-3', chapterNumber: 3, titleEn: 'UNIT 3', titleMl: 'UNIT 3', totalBoxes: 1 },
      { id: 'arb-4', chapterNumber: 4, titleEn: 'UNIT 4', titleMl: 'UNIT 4', totalBoxes: 1 }
    ]
  },
  Urdu: {
    id: 'urdu',
    nameEn: 'Urdu',
    nameMl: 'ഉറുദു',
    code: 'URD',
    color: 'from-amber-600 to-orange-600',
    bgGradient: 'bg-gradient-to-r from-amber-600 to-orange-600',
    borderColor: 'border-amber-200',
    chapters: [
      { id: 'urd-1', chapterNumber: 1, titleEn: 'UNIT 1', titleMl: 'UNIT 1', totalBoxes: 1 },
      { id: 'urd-2', chapterNumber: 2, titleEn: 'UNIT 2', titleMl: 'UNIT 2', totalBoxes: 1 },
      { id: 'urd-3', chapterNumber: 3, titleEn: 'UNIT 3', titleMl: 'UNIT 3', totalBoxes: 1 },
      { id: 'urd-4', chapterNumber: 4, titleEn: 'UNIT 4', titleMl: 'UNIT 4', totalBoxes: 1 }
    ]
  }
};

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
        totalBoxes: 1
      },
      {
        id: 'phy-2',
        chapterNumber: 2,
        titleEn: 'LENSES',
        titleMl: 'ലെൻസുകൾ',
        subtitleEn: 'Refraction and optical lenses',
        subtitleMl: 'പ്രകാശ അപവർത്തനവും ലെൻസുകളും',
        totalBoxes: 1
      },
      {
        id: 'phy-3',
        chapterNumber: 3,
        titleEn: 'THE WORLD OF COLOURS AND VISION',
        titleMl: 'കാഴ്ചയും വർണ്ണങ്ങളുടെ ലോകവും',
        totalBoxes: 1
      },
      {
        id: 'phy-4',
        chapterNumber: 4,
        titleEn: 'MAGNETIC EFFECT OF ELECTRIC CURRENT',
        titleMl: 'വൈദ്യുതിയുടെ കാന്തികഫലം',
        totalBoxes: 1
      },
      {
        id: 'phy-5',
        chapterNumber: 5,
        titleEn: 'ELECTRIC ENERGY: CONSUMPTION AND CONSERVATION',
        titleMl: 'വൈദ്യുതോർജ്ജം: ഉപയോഗവും സംരക്ഷണവും',
        totalBoxes: 1
      },
      {
        id: 'phy-6',
        chapterNumber: 6,
        titleEn: 'ELECTROMAGNETIC INDUCTION IN DAILY LIFE',
        titleMl: 'വൈദ്യുതകാന്തിക പ്രേരണം: നിത്യജീവിതത്തിൽ',
        totalBoxes: 1
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
        totalBoxes: 1
      },
      {
        id: 'chem-2',
        chapterNumber: 2,
        titleEn: 'CHEMICAL REACTIONS OF ORGANIC COMPOUNDS',
        titleMl: 'ഓർഗാനിക് സംയുക്തങ്ങളുടെ നാമകരണം',
        subtitleEn: 'Functional group reactions',
        subtitleMl: 'പ്രവർത്തന ഗ്രൂപ്പുകളുടെ രാസപ്രവർത്തനങ്ങൾ',
        totalBoxes: 1
      },
      {
        id: 'chem-3',
        chapterNumber: 3,
        titleEn: 'PERIODIC TABLE AND ELECTRON CONFIGURATION',
        titleMl: 'പിരിയോഡിക് ടേബിളും ഇലക്ട്രോൺ വിന്യാസവും',
        subtitleEn: 'Upto quantum numbers',
        subtitleMl: 'Upto quantum numbers',
        totalBoxes: 1
      },
      {
        id: 'chem-4',
        chapterNumber: 4,
        titleEn: 'GAS LAWS AND MOLE CONCEPT',
        titleMl: 'വാതക നിയമങ്ങളും, മോൾ സങ്കല്പവും',
        totalBoxes: 1
      },
      {
        id: 'chem-5',
        chapterNumber: 5,
        titleEn: 'ELECTROCHEMISTRY',
        titleMl: 'വൈദ്യുത രസതന്ത്രം',
        totalBoxes: 1
      },
      {
        id: 'chem-6',
        chapterNumber: 6,
        titleEn: 'METALS',
        titleMl: 'ലോഹങ്ങൾ',
        totalBoxes: 1
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
        totalBoxes: 1
      },
      {
        id: 'bio-2',
        chapterNumber: 2,
        titleEn: 'PATHS OF EVOLUTIONS',
        titleMl: 'പരിണാമത്തിന്റെ വഴികൾ',
        subtitleEn: 'Evolutionary theory and origin of species',
        subtitleMl: 'പരിണാമ സിദ്ധാന്തങ്ങളും തെളിവുകളും',
        totalBoxes: 1
      },
      {
        id: 'bio-3',
        chapterNumber: 3,
        titleEn: 'BEHIND SENSATIONS',
        titleMl: 'സംവേദനങ്ങൾക്ക് പിന്നിൽ',
        totalBoxes: 1
      },
      {
        id: 'bio-4',
        chapterNumber: 4,
        titleEn: 'CHEMORECEPTION IN ORGANISM',
        titleMl: 'ജീവികളിലെ രാസസംവേദനം',
        totalBoxes: 1
      },
      {
        id: 'bio-5',
        chapterNumber: 5,
        titleEn: 'IMMUNITY AND HEALTH CARE',
        titleMl: 'പ്രതിരോധവും ആരോഗ്യ സംരക്ഷണവും',
        totalBoxes: 1
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
        totalBoxes: 1
      },
      {
        id: 'math-2',
        chapterNumber: 2,
        titleEn: 'CIRCLES AND ANGLES',
        titleMl: 'വൃത്തങ്ങളും കോണുകളും',
        subtitleEn: 'Central angles and cyclic quadrilaterals',
        subtitleMl: 'വൃത്തത്തിലെ കോണുകളുടെ സവിശേഷതകൾ',
        totalBoxes: 1
      },
      {
        id: 'math-3',
        chapterNumber: 3,
        titleEn: 'ARITHMETIC SEQUENCES AND ALGEBRA',
        titleMl: 'സമാന്തര ശ്രേണിയും ബീജ ഗണിതവും',
        subtitleEn: 'Algebraic expression of nth terms',
        subtitleMl: 'ശ്രേണികളുടെ ബീജഗണിത രൂപം',
        totalBoxes: 1
      },
      {
        id: 'math-4',
        chapterNumber: 4,
        titleEn: 'MATHEMATICS OF CHANCE',
        titleMl: 'സാധ്യതകളുടെ ഗണിതം',
        subtitleEn: 'Probability calculations',
        subtitleMl: 'സാധ്യതയും സംഭവങ്ങളും',
        totalBoxes: 1
      },
      {
        id: 'math-5',
        chapterNumber: 5,
        titleEn: 'SECOND DEGREE EQUATIONS',
        titleMl: 'രണ്ടാംകൃതി സമവാക്യങ്ങൾ',
        subtitleEn: 'Quadratic equations and roots',
        subtitleMl: 'രണ്ടാംകൃതി സമവാക്യങ്ങളുടെ നിർദ്ധാരണം',
        totalBoxes: 1
      },
      {
        id: 'math-6',
        chapterNumber: 6,
        titleEn: 'TRIGONOMETRY',
        titleMl: 'ത്രികോണമിതി',
        totalBoxes: 1
      },
      {
        id: 'math-7',
        chapterNumber: 7,
        titleEn: 'COORDINATES',
        titleMl: 'സൂചകസംഖ്യകൾ',
        totalBoxes: 1
      },
      {
        id: 'math-8',
        chapterNumber: 8,
        titleEn: 'TANGENTS',
        titleMl: 'തൊടുവരകൾ',
        totalBoxes: 1
      },
      {
        id: 'math-9',
        chapterNumber: 9,
        titleEn: 'POLYNOMIALS AND EQUATIONS',
        titleMl: 'ബഹുപദങ്ങളും സമവാക്യങ്ങളും',
        totalBoxes: 1
      },
      {
        id: 'math-10',
        chapterNumber: 10,
        titleEn: 'CIRCLES AND LINES',
        titleMl: 'വൃത്തങ്ങളും വരകളും',
        totalBoxes: 1
      },
      {
        id: 'math-11',
        chapterNumber: 11,
        titleEn: 'GEOMETRY AND ALGEBRA',
        titleMl: 'ജ്യാമിതിയും ബീജഗണിതവും',
        totalBoxes: 1
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
        totalBoxes: 1
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
        totalBoxes: 1
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
        totalBoxes: 1
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
        totalBoxes: 1
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
        totalBoxes: 1
      },
      {
        id: 'eng-6',
        chapterNumber: 3,
        unitEn: 'UNIT 2: PATHS OF PROGRESS',
        unitMl: 'UNIT 2: PATHS OF PROGRESS',
        titleEn: 'THE SEEDLING',
        titleMl: 'THE SEEDLING',
        totalBoxes: 1
      },
      {
        id: 'eng-7',
        chapterNumber: 1,
        unitEn: 'UNIT 3: THE TRUMPETS OF CHANGE',
        unitMl: 'UNIT 3: THE TRUMPETS OF CHANGE',
        titleEn: 'ANOTHER DAY IN PARADISE',
        titleMl: 'ANOTHER DAY IN PARADISE',
        totalBoxes: 1
      },
      {
        id: 'eng-8',
        chapterNumber: 2,
        unitEn: 'UNIT 3: THE TRUMPETS OF CHANGE',
        unitMl: 'UNIT 3: THE TRUMPETS OF CHANGE',
        titleEn: 'WAR',
        titleMl: 'WAR',
        totalBoxes: 1
      },
      {
        id: 'eng-9',
        chapterNumber: 3,
        unitEn: 'UNIT 3: THE TRUMPETS OF CHANGE',
        unitMl: 'UNIT 3: THE TRUMPETS OF CHANGE',
        titleEn: 'A PIECE OF STRING',
        titleMl: 'A PIECE OF STRING',
        totalBoxes: 1
      },
      {
        id: 'eng-10',
        chapterNumber: 1,
        unitEn: 'UNIT 4: WOODLAND WHISPERS',
        unitMl: 'UNIT 4: WOODLAND WHISPERS',
        titleEn: 'SHAKUNTALAM',
        titleMl: 'SHAKUNTALAM',
        totalBoxes: 1
      },
      {
        id: 'eng-11',
        chapterNumber: 2,
        unitEn: 'UNIT 4: WOODLAND WHISPERS',
        unitMl: 'UNIT 4: WOODLAND WHISPERS',
        titleEn: 'TRILLS AND THRILLS',
        titleMl: 'TRILLS AND THRILLS',
        subtitleEn: 'Bird Watching in India',
        subtitleMl: 'Bird Watching in India',
        totalBoxes: 1
      },
      {
        id: 'eng-12',
        chapterNumber: 3,
        unitEn: 'UNIT 4: WOODLAND WHISPERS',
        unitMl: 'UNIT 4: WOODLAND WHISPERS',
        titleEn: 'THE WILD SWANS AT COOLE',
        titleMl: 'THE WILD SWANS AT COOLE',
        totalBoxes: 1
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
        titleEn: 'KHIDKI',
        titleMl: 'खिड़की (लघुकथा)',
        subtitleEn: 'Short Story',
        subtitleMl: 'लघुकथा',
        totalBoxes: 1
      },
      {
        id: 'hin-2',
        chapterNumber: 2,
        unitEn: 'UNIT 1',
        unitMl: 'UNIT 1',
        titleEn: 'ZINDAGI KA SAFAR',
        titleMl: 'जिंदगी का सफर (हाइकु)',
        subtitleEn: 'Haiku Poetry',
        subtitleMl: 'हाइकु',
        totalBoxes: 1
      },
      {
        id: 'hin-3',
        chapterNumber: 3,
        unitEn: 'UNIT 1',
        unitMl: 'UNIT 1',
        titleEn: 'RAIN BASERE MEIN...',
        titleMl: 'रैन बसेरे में... (यात्रावृत्त)',
        subtitleEn: 'Travelogue',
        subtitleMl: 'यात्रावृत्त',
        totalBoxes: 1
      },
      {
        id: 'hin-4',
        chapterNumber: 1,
        unitEn: 'UNIT 2',
        unitMl: 'UNIT 2',
        titleEn: 'MERI DUNIYA KE TAMAM BACCHE',
        titleMl: 'मेरी दुनिया के तमाम बच्चे (कविता)',
        subtitleEn: 'Poem Study',
        subtitleMl: 'कविता',
        totalBoxes: 1
      },
      {
        id: 'hin-5',
        chapterNumber: 2,
        unitEn: 'UNIT 2',
        unitMl: 'UNIT 2',
        titleEn: 'WHITE CAP',
        titleMl: 'व्हाइट कैप (कहानी)',
        subtitleEn: 'Story Analysis',
        subtitleMl: 'कहानी',
        totalBoxes: 1
      },
      {
        id: 'hin-6',
        chapterNumber: 1,
        unitEn: 'UNIT 3',
        unitMl: 'UNIT 3',
        titleEn: 'DILLI MEIN UNIDE',
        titleMl: 'दिल्ली में उनीदे (संस्मरण)',
        subtitleEn: 'Memoir',
        subtitleMl: 'संस्मरण',
        totalBoxes: 1
      },
      {
        id: 'hin-7',
        chapterNumber: 2,
        unitEn: 'UNIT 3',
        unitMl: 'UNIT 3',
        titleEn: 'MADHUR VACHAN',
        titleMl: 'मधुर वचन (दोहे)',
        subtitleEn: 'Couplets',
        subtitleMl: 'दोहे',
        totalBoxes: 1
      },
      {
        id: 'hin-8',
        chapterNumber: 3,
        unitEn: 'UNIT 3',
        unitMl: 'UNIT 3',
        titleEn: 'EK TINKA',
        titleMl: 'एक तिनका (कविता)',
        subtitleEn: 'Poem',
        subtitleMl: 'कविता',
        totalBoxes: 1
      },
      {
        id: 'hin-9',
        chapterNumber: 1,
        unitEn: 'UNIT 4',
        unitMl: 'UNIT 4',
        titleEn: 'GALILEO',
        titleMl: 'गैलीलियो (लेख)',
        subtitleEn: 'Article',
        subtitleMl: 'लेख',
        totalBoxes: 1
      },
      {
        id: 'hin-10',
        chapterNumber: 2,
        unitEn: 'UNIT 4',
        unitMl: 'UNIT 4',
        titleEn: 'PAIDAL CHALTA HUA AADMI',
        titleMl: 'पैदल चलता हुआ आदमी (कविता)',
        subtitleEn: 'Poem',
        subtitleMl: 'कविता',
        totalBoxes: 1
      }
    ]
  },
  {
    id: 'malayalam2',
    nameEn: 'Malayalam II',
    nameMl: 'മലയാളം II',
    code: 'MAL-2',
    color: 'from-pink-600 to-rose-600',
    bgGradient: 'bg-gradient-to-r from-pink-600 to-rose-600',
    borderColor: 'border-pink-200',
    chapters: [
      {
        id: 'mal2-1',
        chapterNumber: 1,
        unitEn: 'UNIT 1: ARANGUM PORULUM',
        unitMl: 'UNIT : 1  അരങ്ങും പൊരുളും',
        titleEn: 'CHITHRAKARI',
        titleMl: 'ചിത്രകാരി',
        totalBoxes: 1
      },
      {
        id: 'mal2-2',
        chapterNumber: 2,
        unitEn: 'UNIT 1: ARANGUM PORULUM',
        unitMl: 'UNIT : 1  അരങ്ങും പൊരുളും',
        titleEn: 'KHALBILE NILAAVU',
        titleMl: 'ഖൽബിലെ നിലാവ്',
        totalBoxes: 1
      },
      {
        id: 'mal2-3',
        chapterNumber: 3,
        unitEn: 'UNIT 1: ARANGUM PORULUM',
        unitMl: 'UNIT : 1  അരങ്ങും പൊരുളും',
        titleEn: 'ORU PAKSHIKKUNJINTE MARANAM',
        titleMl: 'ഒരു പക്ഷിക്കുഞ്ഞിന്റെ മരണം',
        totalBoxes: 1
      },
      {
        id: 'mal2-4',
        chapterNumber: 1,
        unitEn: 'UNIT 2: EKODARA SODARAR NAAM',
        unitMl: 'UNIT : 2  ഏകോദര സോദരർ നാം',
        titleEn: 'VISHUKKANI',
        titleMl: 'വിഷുക്കണി',
        totalBoxes: 1
      },
      {
        id: 'mal2-5',
        chapterNumber: 2,
        unitEn: 'UNIT 2: EKODARA SODARAR NAAM',
        unitMl: 'UNIT : 2  ഏകോദര സോദരർ നാം',
        titleEn: 'ANANDASHRUKKAL',
        titleMl: 'ആനന്ദാശ്രുക്കൾ',
        totalBoxes: 1
      },
      {
        id: 'mal2-6',
        chapterNumber: 3,
        unitEn: 'UNIT 2: EKODARA SODARAR NAAM',
        unitMl: 'UNIT : 2  ഏകോദര സോദരർ നാം',
        titleEn: 'KETHALLU',
        titleMl: 'കെത്തളു',
        totalBoxes: 1
      },
      {
        id: 'mal2-7',
        chapterNumber: 1,
        unitEn: 'UNIT 3: CHARITHRAM RACHICHA NAADAKAM',
        unitMl: 'UNIT : 3  ചരിത്രം രചിച്ച നാടകം',
        titleEn: 'CHARITHRAM RACHICHA NAADAKAM',
        titleMl: 'ചരിത്രം രചിച്ച നാടകം',
        totalBoxes: 1
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
        totalBoxes: 1
      },
      {
        id: 'hist-2',
        chapterNumber: 2,
        titleEn: 'LIBERTY EQUALITY FRATERNITY',
        titleMl: 'സ്വാതന്ത്ര്യം, സമത്വം, സാഹോദര്യം',
        subtitleEn: 'French revolution ideals',
        subtitleMl: 'ഫ്രഞ്ച് വിപ്ലവവും ആശയങ്ങളും',
        totalBoxes: 1
      },
      {
        id: 'hist-3',
        chapterNumber: 3,
        titleEn: 'SOCIAL ANALYSIS THROUGH SOCIOLOGICAL IMAGINATION',
        titleMl: 'സാമൂഹിക വിശകലനം: സമൂഹ ശാസ്ത്ര സങ്കല്പത്തിലൂടെ',
        subtitleEn: 'Sociology perspectives',
        subtitleMl: 'സമൂഹശാസ്ത്ര സങ്കല്പങ്ങൾ',
        totalBoxes: 1
      },
      {
        id: 'hist-4',
        chapterNumber: 4,
        titleEn: 'WEALTH AND THE WORLD',
        titleMl: 'സമ്പത്തും ലോകവും',
        totalBoxes: 1
      },
      {
        id: 'hist-5',
        chapterNumber: 5,
        titleEn: 'PUBLIC OPINION IN DEMOCRACY',
        titleMl: 'പൊതുജനാഭിപ്രായം ജനാധിപത്യത്തിൽ',
        totalBoxes: 1
      },
      {
        id: 'hist-6',
        chapterNumber: 6,
        titleEn: 'MASS MOVEMENT FOR FREEDOM',
        titleMl: 'സ്വാതന്ത്ര്യത്തിനായുള്ള ബഹുജന മുന്നേറ്റം',
        totalBoxes: 1
      },
      {
        id: 'hist-7',
        chapterNumber: 7,
        titleEn: 'THE GLIMPSE OF FREE INDIA',
        titleMl: 'സ്വതന്ത്ര ഇന്ത്യയുടെ വർത്തമാനം',
        totalBoxes: 1
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
        totalBoxes: 1
      },
      {
        id: 'geo-2',
        chapterNumber: 2,
        titleEn: 'CLIMATIC REGION AND THE CLIMATE CHANGE',
        titleMl: 'കാലാവസ്ഥ മേഖലകളും കാലാവസ്ഥ മാറ്റവും',
        subtitleEn: 'Global climate patterns',
        subtitleMl: 'ആഗോള കാലാവസ്ഥ വ്യതിയാനം',
        totalBoxes: 1
      },
      {
        id: 'geo-3',
        chapterNumber: 3,
        titleEn: 'FROM THE RAINY FORESTS TO THE LAND OF PERMAFROST',
        titleMl: 'മഴക്കാടുകളിൽ നിന്ന് മഞ്ഞുരുകാത്ത നാട്ടിലേക്ക്',
        totalBoxes: 1
      },
      {
        id: 'geo-4',
        chapterNumber: 4,
        titleEn: 'CONSUMERS RIGHT & PROTECTION',
        titleMl: 'ഉപഭോക്താവ് : അവകാശങ്ങളും സംരക്ഷണവും',
        subtitleEn: 'Consumer awareness and laws',
        subtitleMl: 'ഉപഭോക്തൃ അവകാശ സംരക്ഷണം',
        totalBoxes: 1
      },
      {
        id: 'geo-5',
        chapterNumber: 5,
        titleEn: 'MONEY AND ECONOMY',
        titleMl: 'പണവും സമ്പദ് വ്യവസ്ഥയും',
        totalBoxes: 1
      },
      {
        id: 'geo-6',
        chapterNumber: 6,
        titleEn: 'THE CHANGING EARTH',
        titleMl: 'മാറുന്ന ഭൂമി',
        totalBoxes: 1
      }
    ]
  }
];

export function getSubjectListForStudent(firstLang?: FirstLanguageSubject): SubjectDef[] {
  const langSub = FIRST_LANGUAGE_SUBJECTS[firstLang || 'Malayalam'];
  return [langSub, ...STUDY_SUBJECTS];
}

export const TOTAL_CHAPTERS =
  STUDY_SUBJECTS.reduce((acc, sub) => acc + sub.chapters.length, 0) +
  (FIRST_LANGUAGE_SUBJECTS['Malayalam']?.chapters.length || 4);
export const TOTAL_CHECKPOINTS = TOTAL_CHAPTERS;
