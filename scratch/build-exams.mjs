import fs from 'fs';
const env = Object.fromEntries(fs.readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  .split('\n').filter(l => l.includes('=')).map(l => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim().replace(/^"|"$/g, '')]));
const PROJ = env.VITE_FIREBASE_PROJECT_ID, KEY = env.VITE_FIREBASE_API_KEY;
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJ}/databases/(default)/documents/online_exams`;

const enc = v => {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'string') return { stringValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(enc) } };
  return { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, enc(x)])) } };
};
const toBody = obj => ({ fields: Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, enc(v)])) });

const mk = (n, prompt, options, correctOption) => ({
  id: `q${n}`, number: n, type: 'mcq', prompt, marks: 4, negativeMarks: 1,
  numOptions: 4, options, correctOption,
});

const EN = [
  mk(1, "In Fleming's Left-Hand Rule, which finger indicates the direction of the magnetic field?", ["Thumb", "First finger", "Second finger", "Ring finger"], 'B'),
  mk(2, "Which metal alloy is used to manufacture the heating element in appliances like iron boxes and electric heaters?", ["Copper", "Aluminium", "Nichrome", "Tungsten"], 'C'),
  mk(3, "Which colour of light in the visible spectrum undergoes maximum atmospheric scattering due to its shorter wavelength?", ["Red", "Yellow", "Green", "Blue"], 'D'),
  mk(4, "The phenomenon of splitting white light into its component colours when passing through a glass prism is known as", ["Refraction", "Scattering", "Dispersion", "Internal reflection"], 'C'),
  mk(5, "An object is placed between F and 2F in front of a convex lens. The nature and size of the image formed is:", ["Virtual, erect, and magnified", "Real, inverted, and magnified", "Real, inverted, and diminished", "Virtual, erect, and diminished"], 'B'),
  mk(6, "When a wave travels through a uniform medium at constant speed, how is its frequency (f) related to its wavelength (λ)?", ["Directly proportional (f ∝ λ)", "Inversely proportional (f ∝ 1/λ)", "Completely independent", "Proportional to λ²"], 'B'),
  mk(7, "A simple pendulum completes one oscillation in 0.5 s. What is its frequency of oscillation?", ["0.5 Hz", "1 Hz", "2 Hz", "4 Hz"], 'C'),
  mk(8, "What is the power of a concave lens having a focal length of 25 cm (f = −0.25 m)?", ["+4 D", "−4 D", "+0.25 D", "−0.25 D"], 'B'),
  mk(9, "According to the Right-Hand Thumb Rule, if the thumb points along the direction of electric current in a straight conductor, the curled fingers represent:", ["Direction of the electric field", "Direction of magnetic field lines", "Direction of mechanical force", "Direction of induced EMF"], 'B'),
  mk(10, "A rainbow is formed in the sky when sunlight interacts with water droplets through the combined process of:", ["Refraction, dispersion, and internal reflection", "Reflection and interference", "Atmospheric scattering and diffraction", "Polarization and absorption"], 'A'),
  mk(11, "An electric heater connected to 230 V draws a current of 2 A. What is its resistance?", ["115 Ω", "460 Ω", "92 Ω", "230 Ω"], 'A'),
  mk(12, "According to Joule's Law (H = I²Rt), if the current passing through a fixed resistor is doubled while keeping time constant, the heat produced will:", ["Double", "Become half", "Quadruple (increase 4 times)", "Remain unchanged"], 'C'),
  mk(13, "Which device component in a direct current (DC) electric motor reverses the current in the armature coil every half rotation?", ["Field magnet", "Carbon brush", "Split-ring commutator", "Slip ring"], 'C'),
  mk(14, "If the current flows in a clockwise direction when viewing one end of a solenoid, that end acts as a:", ["North pole", "South pole", "Neutral region", "Positive terminal"], 'B'),
  mk(15, "An object of height 1.8 cm placed in front of a lens produces an inverted image of height 0.6 cm (hᵢ = −0.6 cm). What is the magnification (m)?", ["+3", "−3", "−0.33", "+0.33"], 'C'),
  mk(16, "An object is placed 90 cm in front of a convex lens (u = −90 cm). A real image is focused on a screen placed at v = +30 cm. Calculate the focal length (f) of the lens.", ["+22.5 cm", "−22.5 cm", "+60 cm", "+15 cm"], 'A'),
  mk(17, "A longitudinal sound wave travelling at 350 m/s in air has a frequency of 35 Hz. What is the distance between a compression and its immediately adjacent rarefaction?", ["10 m", "5 m", "20 m", "2.5 m"], 'B'),
  mk(18, "The image formed by a concave lens for any position of a real object is always:", ["Real, inverted, and magnified", "Virtual, erect, and diminished", "Real, inverted, and diminished", "Virtual, erect, and magnified"], 'B'),
  mk(19, "An electric iron operating at 230 V has a resistance of 92 Ω. Calculate the quantity of heat generated in joules when it operates for 14 minutes (840 s).", ["48,300 J", "483,000 J", "216,000 J", "972,000 J"], 'B'),
  mk(20, "Which of the following changes will NOT increase the magnetic field strength of a current-carrying solenoid?", ["Increasing the current passing through the solenoid", "Increasing the number of turns of wire per unit length", "Inserting a soft iron core inside the solenoid", "Replacing the soft iron core with a wooden core"], 'D'),
];

const ML = [
  mk(1, "ഫ്ലെമിങ്ങിന്റെ ഇടംകൈ നിയമത്തിൽ, കാന്തികക്ഷേത്രത്തിന്റെ ദിശ സൂചിപ്പിക്കുന്ന വിരൽ ഏതാണ്?", ["തള്ളവിരൽ", "ചൂണ്ടുവിരൽ", "നടുവിരൽ", "മോതിരവിരൽ"], 'B'),
  mk(2, "ഇസ്തിരിപ്പെട്ടി, ഇലക്ട്രിക് ഹീറ്റർ തുടങ്ങിയ ഉപകരണങ്ങളിലെ ഹീറ്റിംഗ് എലമെന്റ് നിർമ്മിക്കാൻ ഉപയോഗിക്കുന്ന ലോഹ സങ്കരം ഏതാണ്?", ["ചെമ്പ്", "അലുമിനിയം", "നിക്രോം", "ടങ്സ്റ്റൺ"], 'C'),
  mk(3, "ദൃശ്യപ്രകാശ സ്പെക്ട്രത്തിലെ ഏത് നിറത്തിന്, തരംഗദൈർഘ്യം കുറവായതിനാൽ അന്തരീക്ഷത്തിൽ ഏറ്റവും കൂടുതൽ പ്രകീർണനം (scattering) സംഭവിക്കുന്നു?", ["ചുവപ്പ്", "മഞ്ഞ", "പച്ച", "നീല"], 'D'),
  mk(4, "വെള്ളവെളിച്ചം ഗ്ലാസ് പ്രിസത്തിലൂടെ കടക്കുമ്പോൾ ഘടക വർണ്ണങ്ങളായി വേർപിരിയുന്ന പ്രതിഭാസം ഏത് പേരിലറിയപ്പെടുന്നു?", ["അപവർത്തനം", "പ്രകീർണനം", "വർണ്ണവിശ്ലേഷണം", "ആന്തരിക പ്രതിഫലനം"], 'C'),
  mk(5, "ഒരു കോൺവെക്സ് ലെൻസിന്റെ മുന്നിൽ F നും 2F നും ഇടയിൽ ഒരു വസ്തു വച്ചിരിക്കുന്നു. രൂപപ്പെടുന്ന പ്രതിബിംബത്തിന്റെ സ്വഭാവവും വലുപ്പവും എന്താണ്?", ["മിഥ്യ, നേരെയുള്ളത്, വലുതാക്കിയത്", "യഥാർത്ഥ, തലകീഴായത്, വലുതാക്കിയത്", "യഥാർത്ഥ, തലകീഴായത്, ചെറുതാക്കിയത്", "മിഥ്യ, നേരെയുള്ളത്, ചെറുതാക്കിയത്"], 'B'),
  mk(6, "ഒരു ഏകീകൃത മാധ്യമത്തിലൂടെ സ്ഥിരവേഗത്തിൽ തരംഗം സഞ്ചരിക്കുമ്പോൾ അതിന്റെ ആവൃത്തി (f) തരംഗദൈർഘ്യവുമായി (λ) എങ്ങനെ ബന്ധപ്പെട്ടിരിക്കുന്നു?", ["നേർ അനുപാതത്തിൽ (f ∝ λ)", "വിപരീത അനുപാതത്തിൽ (f ∝ 1/λ)", "പൂർണ്ണമായും സ്വതന്ത്രം", "λ² ന് അനുപാതത്തിൽ"], 'B'),
  mk(7, "ഒരു ലളിത ലോലകം ഒരു ദോലനം 0.5 സെക്കൻഡിൽ പൂർത്തിയാക്കുന്നു. അതിന്റെ ദോലന ആവൃത്തി എത്രയാണ്?", ["0.5 Hz", "1 Hz", "2 Hz", "4 Hz"], 'C'),
  mk(8, "25 cm ഫോക്കസ് ദൂരമുള്ള ഒരു കോൺകേവ് ലെൻസിന്റെ പവർ എത്രയാണ്? (f = −0.25 m)", ["+4 D", "−4 D", "+0.25 D", "−0.25 D"], 'B'),
  mk(9, "വലംകൈ പെരുവിരൽ നിയമപ്രകാരം, നേരായ ചാലകത്തിലെ വൈദ്യുത പ്രവാഹത്തിന്റെ ദിശയിലേക്ക് പെരുവിരൽ ചൂണ്ടുമ്പോൾ, മടങ്ങിയ വിരലുകൾ സൂചിപ്പിക്കുന്നത്:", ["വൈദ്യുത മണ്ഡലത്തിന്റെ ദിശ", "കാന്തികക്ഷേത്ര രേഖകളുടെ ദിശ", "യാന്ത്രിക ബലത്തിന്റെ ദിശ", "പ്രേരിത EMF ന്റെ ദിശ"], 'B'),
  mk(10, "സൂര്യപ്രകാശം ജലത്തുള്ളികളുമായി ഇടപെടുമ്പോൾ ആകാശത്ത് മഴവില്ല് രൂപപ്പെടുന്നത് ഏത് പ്രക്രിയകളുടെ സംയോജനത്താലാണ്?", ["അപവർത്തനം, വർണ്ണവിശ്ലേഷണം, ആന്തരിക പ്രതിഫലനം", "പ്രതിഫലനവും വ്യതികരണവും", "അന്തരീക്ഷ പ്രകീർണനവും വിഭംഗനവും", "ധ്രുവീകരണവും ആഗിരണവും"], 'A'),
  mk(11, "230 V വോൾട്ടേജിൽ ബന്ധിപ്പിച്ച ഒരു ഇലക്ട്രിക് ഹീറ്റർ 2 A കറന്റ് വലിക്കുന്നു. അതിന്റെ പ്രതിരോധം എത്രയാണ്?", ["115 Ω", "460 Ω", "92 Ω", "230 Ω"], 'A'),
  mk(12, "ജൂളിന്റെ നിയമം (H = I²Rt) പ്രകാരം, സ്ഥിര പ്രതിരോധമുള്ള ഒരു റെസിസ്റ്ററിലൂടെയുള്ള കറന്റ് ഇരട്ടിയാക്കുകയും സമയം സ്ഥിരമായി നിലനിർത്തുകയും ചെയ്താൽ, ഉണ്ടാകുന്ന താപം:", ["ഇരട്ടിയാകും", "പകുതിയാകും", "നാലിരട്ടിയാകും (4 മടങ്ങ് വർധിക്കും)", "മാറ്റമില്ലാതെ തുടരും"], 'C'),
  mk(13, "ഡയറക്ട് കറന്റ് (DC) ഇലക്ട്രിക് മോട്ടോറിൽ, ഓരോ അർധ ഭ്രമണത്തിലും ആർമേച്ചർ കോയിലിലെ കറന്റിന്റെ ദിശ മാറ്റുന്ന ഘടകം ഏതാണ്?", ["ഫീൽഡ് മാഗ്നറ്റ്", "കാർബൺ ബ്രഷ്", "സ്പ്ലിറ്റ്-റിങ് കമ്മ്യൂട്ടേറ്റർ", "സ്ലിപ് റിങ്"], 'C'),
  mk(14, "ഒരു സോളിനോയിഡിന്റെ ഒരറ്റത്തുനിന്ന് നോക്കുമ്പോൾ കറന്റ് ഘടികാരദിശയിൽ ഒഴുകുന്നുവെങ്കിൽ, ആ അറ്റം ഏത് ആയി പ്രവർത്തിക്കും?", ["ഉത്തര ധ്രുവം", "ദക്ഷിണ ധ്രുവം", "നിഷ്പക്ഷ മേഖല", "പോസിറ്റീവ് ടെർമിനൽ"], 'B'),
  mk(15, "1.8 cm ഉയരമുള്ള ഒരു വസ്തു ലെൻസിന് മുന്നിൽ വച്ചപ്പോൾ 0.6 cm ഉയരമുള്ള തലകീഴായ പ്രതിബിംബം (hᵢ = −0.6 cm) ലഭിക്കുന്നു. മാഗ്നിഫിക്കേഷൻ (m) എത്രയാണ്?", ["+3", "−3", "−0.33", "+0.33"], 'C'),
  mk(16, "ഒരു വസ്തു കോൺവെക്സ് ലെൻസിന് മുന്നിൽ 90 cm അകലെ വച്ചിരിക്കുന്നു (u = −90 cm). ലെൻസിന് പിന്നിൽ v = +30 cm അകലെയുള്ള സ്ക്രീനിൽ യഥാർത്ഥ പ്രതിബിംബം ഫോക്കസ് ചെയ്യുന്നു. ലെൻസിന്റെ ഫോക്കസ് ദൂരം (f) കണക്കാക്കുക.", ["+22.5 cm", "−22.5 cm", "+60 cm", "+15 cm"], 'A'),
  mk(17, "350 m/s വേഗതയിൽ വായുവിൽ സഞ്ചരിക്കുന്ന ഒരു രേഖാംശ ശബ്ദ തരംഗത്തിന്റെ ആവൃത്തി 35 Hz ആണ്. ഒരു കംപ്രഷനും അതിനടുത്തുള്ള റെയർഫാക്ഷനും തമ്മിലുള്ള അകലം എത്രയാണ്?", ["10 m", "5 m", "20 m", "2.5 m"], 'B'),
  mk(18, "യഥാർത്ഥ വസ്തുവിന്റെ ഏത് സ്ഥാനത്തിനും ഒരു കോൺകേവ് ലെൻസ് എപ്പോഴും ഉണ്ടാക്കുന്ന പ്രതിബിംബം:", ["യഥാർത്ഥ, തലകീഴായത്, വലുതാക്കിയത്", "മിഥ്യ, നേരെയുള്ളത്, ചെറുതാക്കിയത്", "യഥാർത്ഥ, തലകീഴായത്, ചെറുതാക്കിയത്", "മിഥ്യ, നേരെയുള്ളത്, വലുതാക്കിയത്"], 'B'),
  mk(19, "230 V ൽ പ്രവർത്തിക്കുന്ന ഒരു ഇലക്ട്രിക് ഇസ്തിരിപ്പെട്ടിയുടെ പ്രതിരോധം 92 Ω ആണ്. 14 മിനിറ്റ് (840 s) പ്രവർത്തിപ്പിച്ചാൽ ഉണ്ടാകുന്ന താപത്തിന്റെ അളവ് ജൂളിൽ കണക്കാക്കുക.", ["48,300 J", "483,000 J", "216,000 J", "972,000 J"], 'B'),
  mk(20, "കറന്റ് വഹിക്കുന്ന സോളിനോയിഡിന്റെ കാന്തികക്ഷേത്ര ശക്തി വർധിപ്പിക്കാത്ത മാറ്റം ഏതാണ്?", ["സോളിനോയിഡിലൂടെയുള്ള കറന്റ് വർധിപ്പിക്കുക", "ഏകക ദൈർഘ്യത്തിലെ വയർ ചുറ്റുകളുടെ എണ്ണം വർധിപ്പിക്കുക", "സോഫ്റ്റ് അയൺ കോർ ഉള്ളിൽ വയ്ക്കുക", "സോഫ്റ്റ് അയൺ കോറിനു പകരം മരക്കോർ വയ്ക്കുക"], 'D'),
];

const base = JSON.parse(fs.readFileSync(new URL('./omr-exam-physics-4q.json', import.meta.url), 'utf8'));
const now = new Date().toISOString();
const build = (id, title, instructions, questions, createdAt) => {
  const totalMarks = questions.reduce((s, q) => s + q.marks, 0);
  return { id, title, subject: 'Physics', className: 'All Batches', instructions, durationMinutes: 45,
    totalMarks, passMarks: Math.round(totalMarks * 0.4), questions, questionPaperImages: [],
    isPublished: true, createdAt, updatedAt: now };
};
const ENG_ID = 'exam_1792902391392_wcc67';
const ML_ID = `exam_${Date.now()}_ml01`;
const engExam = build(ENG_ID, 'Physics OMR Test (English Medium)', base.instructions, EN, '2026-10-25T04:21:31.089Z');
const mlExam = build(ML_ID, 'Physics OMR Test (Malayalam Medium)',
  'എല്ലാ ചോദ്യങ്ങൾക്കും ഉത്തരം നൽകുക. ശരിയുത്തരത്തിന് 4 മാർക്ക്; തെറ്റായ ഉത്തരത്തിന് −1 മാർക്ക്.', ML, now);

const mode = process.argv[2];
const targets = [[ENG_ID, engExam], [ML_ID, mlExam]];
for (const [id, exam] of targets) {
  if (mode === 'dry') { console.log(id, exam.title, exam.questions.length, 'Qs', exam.totalMarks, exam.passMarks); continue; }
  const res = await fetch(`${BASE}/${id}?key=${KEY}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(toBody(exam)) });
  console.log(id, res.status, exam.questions.length, 'Qs');
}
