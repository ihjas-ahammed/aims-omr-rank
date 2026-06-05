import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { User } from 'lucide-react';
import { Slide } from '../../../services/firebaseService';
import { AWARDS, SERIF } from './templates';
import { STUDENTS, studentsFor, Student, CATEGORY_LABEL } from './students';
import { AwardsBackground, AwardsFrame, Sparkles, Confetti, CelebrationConfetti, AwardsFooter, awardsKeyframes } from './awardsShared';

// Per-student entrance: photo zooms in, text rises — re-keyed on each student so
// it replays for every name as the gallery advances.
const photoV: Variants = {
  hidden: { opacity: 0, scale: 0.72 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 110, damping: 15 } },
  exit: { opacity: 0, scale: 0.92, transition: { duration: 0.35 } },
};
const textV: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 90, damping: 16, delay: 0.12 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.3 } },
};

// Looks up the student a gallery slide should currently show: the one whose
// photoUrl matches galleryCurrentKey, falling back to the first of the category.
function currentStudent(slide: Slide): Student | null {
  const list = studentsFor(slide.galleryCategory || 'all');
  if (slide.galleryCurrentKey) {
    const match = STUDENTS.find(s => s.photoUrl === slide.galleryCurrentKey);
    if (match) return match;
  }
  return list[0] || null;
}

export default function GallerySlide({ slide, preview = false }: { slide: Slide; preview?: boolean }) {
  const student = currentStudent(slide);
  const eyebrow = slide.galleryTitle || 'Congratulations';
  const subtitle = slide.gallerySubtitle || (slide.galleryCategory ? CATEGORY_LABEL[slide.galleryCategory as keyof typeof CATEGORY_LABEL] : '');

  return (
    <div className="w-full h-full relative overflow-hidden" style={{ containerType: 'size' }}>
      <style>{awardsKeyframes}</style>
      <AwardsBackground />
      <Sparkles count={6} />
      <Confetti count={10} />
      <AwardsFrame />

      {!student ? (
        <div className="absolute inset-0 flex items-center justify-center" style={{ color: AWARDS.muted, fontSize: preview ? '1.5cqmin' : '3cqmin' }}>
          No students in this gallery.
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={student.photoUrl}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-[8cqmin]"
            style={{ paddingTop: '4cqmin', paddingBottom: '16cqmin' }}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Eyebrow */}
            <motion.p
              variants={textV}
              className="uppercase"
              style={{ color: AWARDS.accent, fontSize: '2.6cqmin', letterSpacing: '0.46em', paddingLeft: '0.46em', fontWeight: 600 }}
            >
              {eyebrow}
            </motion.p>
            {subtitle && (
              <motion.p
                variants={textV}
                className="uppercase"
                style={{ color: AWARDS.muted, fontSize: '2cqmin', letterSpacing: '0.3em', paddingLeft: '0.3em', marginTop: '1cqmin', fontWeight: 600 }}
              >
                {subtitle}
              </motion.p>
            )}

            {/* Portrait with spotlight glow */}
            <motion.div variants={photoV} className="relative flex items-center justify-center" style={{ marginTop: '3.5cqmin' }}>
              <div className="absolute" style={{ width: '64cqmin', height: '64cqmin', borderRadius: '50%', background: `radial-gradient(circle, ${AWARDS.green}26, transparent 66%)` }} />
              <StudentPortrait student={student} />
            </motion.div>

            {/* Name */}
            <motion.h1
              variants={textV}
              style={{
                fontFamily: SERIF, color: AWARDS.navy, fontSize: '7.6cqmin', fontWeight: 800,
                lineHeight: 1.04, marginTop: '3cqmin', textShadow: `0 0.2cqmin 0.5cqmin ${AWARDS.navy}1a`,
              }}
            >
              {student.name}
            </motion.h1>

            <motion.span
              variants={textV}
              style={{ display: 'block', height: '0.45cqmin', width: '16cqmin', borderRadius: '1cqmin', background: `linear-gradient(90deg, transparent, ${AWARDS.green}, transparent)`, marginTop: '1.8cqmin' }}
            />

            {/* Percentage badge for the 90%-above set */}
            {student.percent && (
              <motion.p
                variants={textV}
                className="font-bold"
                style={{ color: AWARDS.greenDark, fontSize: '4.2cqmin', marginTop: '1.8cqmin', letterSpacing: '0.04em' }}
              >
                {student.percent}
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {!preview && <CelebrationConfetti />}

      <AwardsFooter caption={slide.footerCaption} />
    </div>
  );
}

function StudentPortrait({ student }: { student: Student }) {
  const [err, setErr] = useState(false);
  useEffect(() => { setErr(false); }, [student.photoUrl]);
  // Portrait frame (taller than wide) with object-cover — keeps faces filled,
  // consistent sizing across mixed-aspect photos.
  return (
    <div
      className="overflow-hidden flex items-center justify-center"
      style={{
        width: '44cqmin',
        height: '52cqmin',
        borderRadius: '3cqmin',
        border: `0.7cqmin solid ${AWARDS.green}`,
        background: AWARDS.panel,
        boxShadow: `0 0.6cqmin 2.4cqmin ${AWARDS.navy}26`,
      }}
    >
      {!err ? (
        <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" onError={() => setErr(true)} />
      ) : (
        <User style={{ width: '45%', height: '45%', color: AWARDS.accent }} />
      )}
    </div>
  );
}
