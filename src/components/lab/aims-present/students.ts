// AUTO-GENERATED from the student photo folders in /public.
// Each student's photo lives in public/<category folder>/ named after the student.
// Regenerate with: node gen-students.cjs  (then it writes this file).

export type StudentCategory = 'full-aplus' | '5-aplus' | '90-above';

export interface Student {
  name: string;
  category: StudentCategory;
  photoUrl: string;   // root-relative, URI-encoded (served from /public)
  percent?: string;   // only for the 90%-above set
}

export const CATEGORY_LABEL: Record<StudentCategory, string> = {
  'full-aplus': 'Full A+',
  '5-aplus': '5 A+',
  '90-above': '90% & Above',
};

export const STUDENTS: Student[] = [
  { name: "ADITHYA RAJ EP", category: "full-aplus", photoUrl: "/FULL%20A+/ADITHYA%20RAJ%20EP%20.jpeg" },
  { name: "ALAKA BABU", category: "full-aplus", photoUrl: "/FULL%20A+/ALAKA%20BABU.jpg" },
  { name: "AMAL CHANDRA N", category: "full-aplus", photoUrl: "/FULL%20A+/AMAL%20CHANDRA%20N.jpeg" },
  { name: "ANISILA KADOORAN", category: "full-aplus", photoUrl: "/FULL%20A+/ANISILA%20KADOORAN%20.JPG" },
  { name: "ANJANA K", category: "full-aplus", photoUrl: "/FULL%20A+/ANJANA%20K%20.JPG" },
  { name: "ANSHAHA FATHIMA", category: "full-aplus", photoUrl: "/FULL%20A+/ANSHAHA%20FATHIMA%20.JPG" },
  { name: "APARNA C", category: "full-aplus", photoUrl: "/FULL%20A+/APARNA%20C%20.JPG" },
  { name: "ARSHA FATHIMA M", category: "full-aplus", photoUrl: "/FULL%20A+/ARSHA%20FATHIMA%20M.JPG" },
  { name: "AYISHA NOURIN K", category: "full-aplus", photoUrl: "/FULL%20A+/AYISHA%20NOURIN%20K.jpeg" },
  { name: "AZAL MUHAMMED", category: "full-aplus", photoUrl: "/FULL%20A+/AZAL%20MUHAMMED.JPG" },
  { name: "DIYA MEHRIN K", category: "full-aplus", photoUrl: "/FULL%20A+/DIYA%20MEHRIN%20K.JPG" },
  { name: "FAHMA VP", category: "full-aplus", photoUrl: "/FULL%20A+/FAHMA%20VP%20.JPG" },
  { name: "FARHA P", category: "full-aplus", photoUrl: "/FULL%20A+/FARHA%20P%20.JPG" },
  { name: "FATHIMA FIZA M", category: "full-aplus", photoUrl: "/FULL%20A+/FATHIMA%20FIZA%20M.jpeg" },
  { name: "FATHIMA HIDHA MC", category: "full-aplus", photoUrl: "/FULL%20A+/FATHIMA%20HIDHA%20MC.JPG" },
  { name: "FATHIMA HUDA N", category: "full-aplus", photoUrl: "/FULL%20A+/FATHIMA%20HUDA%20N.JPG" },
  { name: "FATHIMA LIYA A", category: "full-aplus", photoUrl: "/FULL%20A+/FATHIMA%20LIYA%20A.JPG" },
  { name: "FATHIMA MISBHA VA", category: "full-aplus", photoUrl: "/FULL%20A+/FATHIMA%20MISBHA%20VA.JPG" },
  { name: "FATHIMA NIHALA TP", category: "full-aplus", photoUrl: "/FULL%20A+/FATHIMA%20NIHALA%20TP.JPG" },
  { name: "FEZIN MUHAMMED", category: "full-aplus", photoUrl: "/FULL%20A+/FEZIN%20MUHAMMED.JPG" },
  { name: "GOURI NANDA C", category: "full-aplus", photoUrl: "/FULL%20A+/GOURI%20NANDA%20C.jpg" },
  { name: "HAMNA FATHIMA P", category: "full-aplus", photoUrl: "/FULL%20A+/HAMNA%20FATHIMA%20P%20.JPG" },
  { name: "HANIYA FATHIMA P", category: "full-aplus", photoUrl: "/FULL%20A+/HANIYA%20FATHIMA%20P.JPG" },
  { name: "HANIYYA V", category: "full-aplus", photoUrl: "/FULL%20A+/HANIYYA%20V%20.jpg" },
  { name: "KRISHNA PRIYA", category: "full-aplus", photoUrl: "/FULL%20A+/KRISHNA%20PRIYA.JPG" },
  { name: "KRISTHI MUNADHA T", category: "full-aplus", photoUrl: "/FULL%20A+/KRISTHI%20MUNADHA%20T.jpeg" },
  { name: "LISNA K", category: "full-aplus", photoUrl: "/FULL%20A+/LISNA%20K.jpeg" },
  { name: "MILHA RAZAK", category: "full-aplus", photoUrl: "/FULL%20A+/MILHA%20RAZAK.JPG" },
  { name: "MISHAL AHAMED", category: "full-aplus", photoUrl: "/FULL%20A+/MISHAL%20AHAMED%20.jpeg" },
  { name: "MOHAMMED RISHAN P", category: "full-aplus", photoUrl: "/FULL%20A+/MOHAMMED%20RISHAN%20P.JPG" },
  { name: "MUHAMMED AHANN", category: "full-aplus", photoUrl: "/FULL%20A+/MUHAMMED%20%20AHANN.JPG" },
  { name: "MUHAMMED FARHAN K", category: "full-aplus", photoUrl: "/FULL%20A+/MUHAMMED%20FARHAN%20K.jpeg" },
  { name: "MUHAMMED LIYAN P", category: "full-aplus", photoUrl: "/FULL%20A+/MUHAMMED%20LIYAN%20P.JPG" },
  { name: "MUYEENU SWABIRI", category: "full-aplus", photoUrl: "/FULL%20A+/MUYEENU%20SWABIRI.jpeg" },
  { name: "NAIRA ABDUL LATHEEF TK", category: "full-aplus", photoUrl: "/FULL%20A+/NAIRA%20ABDUL%20LATHEEF%20TK.jpeg" },
  { name: "NAJIH AHAMMED", category: "full-aplus", photoUrl: "/FULL%20A+/NAJIH%20AHAMMED%20.JPG" },
  { name: "NAVANEETH KRISHNAN C", category: "full-aplus", photoUrl: "/FULL%20A+/NAVANEETH%20KRISHNAN%20C.JPG" },
  { name: "NIDHA SHIRIN N", category: "full-aplus", photoUrl: "/FULL%20A+/NIDHA%20SHIRIN%20N.jpeg" },
  { name: "RAJEEBA K", category: "full-aplus", photoUrl: "/FULL%20A+/RAJEEBA%20K.jpeg" },
  { name: "RANA FATHIMA K", category: "full-aplus", photoUrl: "/FULL%20A+/RANA%20FATHIMA%20K.JPG" },
  { name: "RINSHA JALIDHA", category: "full-aplus", photoUrl: "/FULL%20A+/RINSHA%20JALIDHA%20.JPG" },
  { name: "SITHARA BASHEER", category: "full-aplus", photoUrl: "/FULL%20A+/SITHARA%20BASHEER%20.JPG" },
  { name: "ADWAID M", category: "5-aplus", photoUrl: "/5A+%202025-2026/ADWAID%20M.jpeg" },
  { name: "AHLAM HASAN", category: "5-aplus", photoUrl: "/5A+%202025-2026/AHLAM%20HASAN.jpg" },
  { name: "FATHIMA BENZY", category: "5-aplus", photoUrl: "/5A+%202025-2026/FATHIMA%20BENZY.JPG" },
  { name: "FATHIMA DILFA P", category: "5-aplus", photoUrl: "/5A+%202025-2026/FATHIMA%20DILFA%20P.JPG" },
  { name: "FATHIMA HIBA PP", category: "5-aplus", photoUrl: "/5A+%202025-2026/FATHIMA%20HIBA%20PP.jpeg" },
  { name: "FATHIMA RIFNA A", category: "5-aplus", photoUrl: "/5A+%202025-2026/FATHIMA%20RIFNA%20A.JPG" },
  { name: "HISHAM MUHAMMED", category: "5-aplus", photoUrl: "/5A+%202025-2026/HISHAM%20MUHAMMED.jpeg" },
  { name: "MOHAMMED DANISH", category: "5-aplus", photoUrl: "/5A+%202025-2026/MOHAMMED%20DANISH%20.jpg" },
  { name: "MUHAMMED ADNAN K", category: "5-aplus", photoUrl: "/5A+%202025-2026/MUHAMMED%20ADNAN%20K.JPG" },
  { name: "MUHAMMED FAIROOZ TM", category: "5-aplus", photoUrl: "/5A+%202025-2026/MUHAMMED%20FAIROOZ%20TM.JPG" },
  { name: "MUHAMMED FATHIN ALI TP", category: "5-aplus", photoUrl: "/5A+%202025-2026/MUHAMMED%20FATHIN%20ALI%20TP.JPG" },
  { name: "MUHAMMED NAJADH VK", category: "5-aplus", photoUrl: "/5A+%202025-2026/MUHAMMED%20NAJADH%20VK.jpeg" },
  { name: "MUHAMMED RIDHIN KK", category: "5-aplus", photoUrl: "/5A+%202025-2026/MUHAMMED%20RIDHIN%20KK.JPG" },
  { name: "NAJIYA NASRIN", category: "5-aplus", photoUrl: "/5A+%202025-2026/NAJIYA%20NASRIN.JPG" },
  { name: "NIDHA SANWA", category: "5-aplus", photoUrl: "/5A+%202025-2026/NIDHA%20SANWA.JPG" },
  { name: "REVATHI", category: "5-aplus", photoUrl: "/5A+%202025-2026/REVATHI.JPG" },
  { name: "RIDHA K", category: "5-aplus", photoUrl: "/5A+%202025-2026/RIDHA%20K.jpeg" },
  { name: "RIFA P", category: "5-aplus", photoUrl: "/5A+%202025-2026/RIFA%20P.JPG" },
  { name: "SADIYA PUTHALAN", category: "5-aplus", photoUrl: "/5A+%202025-2026/SADIYA%20PUTHALAN%20.JPG" },
  { name: "SILNA FATHIMA K", category: "5-aplus", photoUrl: "/5A+%202025-2026/SILNA%20FATHIMA%20K.JPG" },
  { name: "SIYA TP", category: "5-aplus", photoUrl: "/5A+%202025-2026/SIYA%20TP.jpeg" },
  { name: "AAMIR AHAMMED PV", category: "90-above", photoUrl: "/90%25%20ABOVE/AAMIR%20AHAMMED%20PV%2089.75%20%25%20.jpeg", percent: "89.75%" },
  { name: "AASHMI CHANDRA", category: "90-above", photoUrl: "/90%25%20ABOVE/AASHMI%20CHANDRA%2093.42%25.jpeg", percent: "93.42%" },
  { name: "AHAMMED JUNAID.K", category: "90-above", photoUrl: "/90%25%20ABOVE/AHAMMED%20JUNAID.K%2091.33%25.JPG", percent: "91.33%" },
  { name: "ANSHIA P", category: "90-above", photoUrl: "/90%25%20ABOVE/ANSHIA%20P%2090.5%20%25.jpeg", percent: "90.5%" },
  { name: "ARSHIN PC", category: "90-above", photoUrl: "/90%25%20ABOVE/ARSHIN%20PC%2089.91%25.jpg", percent: "89.91%" },
  { name: "ASWIN VINOD", category: "90-above", photoUrl: "/90%25%20ABOVE/ASWIN%20VINOD%2089.9%20%25.JPG", percent: "89.9%" },
  { name: "ATHUL VB", category: "90-above", photoUrl: "/90%25%20ABOVE/ATHUL%20VB%2091.75%25.jpg", percent: "91.75%" },
  { name: "FAIZ AHAMED", category: "90-above", photoUrl: "/90%25%20ABOVE/FAIZ%20AHAMED%2090.08%25.jpg", percent: "90.08%" },
  { name: "FATHIMA DILSHA P", category: "90-above", photoUrl: "/90%25%20ABOVE/FATHIMA%20DILSHA%20P%2091.83.JPG", percent: "91.83%" },
  { name: "FATHIMA RIZA A", category: "90-above", photoUrl: "/90%25%20ABOVE/FATHIMA%20RIZA%20A%2089.92%25.JPG", percent: "89.92%" },
  { name: "FATHIMA SHAHNA", category: "90-above", photoUrl: "/90%25%20ABOVE/FATHIMA%20SHAHNA%2093.17%25.JPG", percent: "93.17%" },
  { name: "HASNA SHARI", category: "90-above", photoUrl: "/90%25%20ABOVE/HASNA%20SHARI%2091.58%20%25.JPG", percent: "91.58%" },
  { name: "LASIN ABDULLA TP", category: "90-above", photoUrl: "/90%25%20ABOVE/LASIN%20ABDULLA%20TP%2091.08%20%25.jpeg", percent: "91.08%" },
  { name: "MAJID A", category: "90-above", photoUrl: "/90%25%20ABOVE/MAJID%20A%2092.25%25.JPG", percent: "92.25%" },
  { name: "MINHA PK", category: "90-above", photoUrl: "/90%25%20ABOVE/MINHA%20PK%2091.5%25.jpeg", percent: "91.5%" },
  { name: "MOHAMMED SHAFEEQUE KK", category: "90-above", photoUrl: "/90%25%20ABOVE/MOHAMMED%20SHAFEEQUE%20KK%2089.67.jpg", percent: "89.67%" },
  { name: "MUHAMMED AFHAM", category: "90-above", photoUrl: "/90%25%20ABOVE/MUHAMMED%20AFHAM%2091.17%25%20.JPG", percent: "91.17%" },
  { name: "MUHAMMED AMAN K", category: "90-above", photoUrl: "/90%25%20ABOVE/MUHAMMED%20AMAN%20K%2092.75%25.JPG", percent: "92.75%" },
  { name: "MUHAMMED SHAKEEL KP", category: "90-above", photoUrl: "/90%25%20ABOVE/MUHAMMED%20SHAKEEL%20KP%2092%25.jpg", percent: "92%" },
  { name: "NAJVA FATHIMA C", category: "90-above", photoUrl: "/90%25%20ABOVE/NAJVA%20FATHIMA%20C%2092.75%25.jpeg", percent: "92.75%" },
  { name: "NIDHA FATHIMA K", category: "90-above", photoUrl: "/90%25%20ABOVE/NIDHA%20FATHIMA%20K%2090.1.jpeg", percent: "90.1%" },
  { name: "NIMA RAHMAN", category: "90-above", photoUrl: "/90%25%20ABOVE/NIMA%20RAHMAN%2090%25.JPG", percent: "90%" },
  { name: "NISLA T", category: "90-above", photoUrl: "/90%25%20ABOVE/NISLA%20T%2090.83%20%25.jpeg", percent: "90.83%" },
  { name: "NYSHA K", category: "90-above", photoUrl: "/90%25%20ABOVE/NYSHA%20K%2089.75%25.JPG", percent: "89.75%" },
  { name: "ZAHIR MOHAMMED K", category: "90-above", photoUrl: "/90%25%20ABOVE/ZAHIR%20%20MOHAMMED%20K%2090.17%20%25.jpeg", percent: "90.17%" },
];

// Students of a category, sorted A-Z by name. 'all' returns everyone, A-Z.
export function studentsFor(category: StudentCategory | 'all'): Student[] {
  const list = category === 'all' ? STUDENTS : STUDENTS.filter(s => s.category === category);
  return [...list].sort((a, b) => a.name.localeCompare(b.name, 'en'));
}
