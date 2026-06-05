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
// photoUrl matches galleryCurrentKey. In Auto mode, falls back to the first of
// the category (so the slide is never blank). In Queue-only mode there is no
// fallback — when nothing is queued yet it shows a "ready" placeholder.
function currentStudent(slide: Slide): Student | null {
  if (slide.galleryCurrentKey) {
    const match = STUDENTS.find(s => s.photoUrl === slide.galleryCurrentKey);
    if (match) return match;
  }
  if (slide.galleryQueueOnly) return null;
  return studentsFor(slide.galleryCategory || 'all')[0] || null;
}

export default function GallerySlide({ slide, preview = false }: { slide: Slide; preview?: boolean }) {
  const student = currentStudent(slide);
  const galleryEmpty = studentsFor(slide.galleryCategory || 'all').length === 0;
  const eyebrow = slide.galleryTitle || 'Congratulations';
  // Subtitle follows the student's own category (so a combined "all" gallery
  // labels each one Full A+ / 5 A+ / 90% & above), unless a fixed one is set.
  const subtitle = (slide.gallerySubtitle && slide.gallerySubtitle.trim())
    ? slide.gallerySubtitle
    : (student ? CATEGORY_LABEL[student.category] : '');

  return (
    <div className="w-full h-full relative overflow-hidden" style={{ containerType: 'size' }}>
      <style>{awardsKeyframes}</style>
      <AwardsBackground />
      <Sparkles count={6} />
      <Confetti count={10} />
      <AwardsFrame />

      {!student && galleryEmpty ? (
        <div className="absolute inset-0 flex items-center justify-center" style={{ color: AWARDS.muted, fontSize: preview ? '1.5cqmin' : '3cqmin' }}>
          No students in this gallery.
        </div>
      ) : !student ? (
        // Queue-only mode, nothing queued yet — a calm "ready" stage.
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-[10cqmin]" style={{ paddingBottom: '14cqmin' }}>
          <p className="uppercase" style={{ color: AWARDS.accent, fontSize: '3cqmin', letterSpacing: '0.46em', paddingLeft: '0.46em', fontWeight: 600, animation: 'ssaRiseUp 0.8s ease-out both' }}>
            {eyebrow}
          </p>
          <span style={{ display: 'block', height: '0.5cqmin', width: '20cqmin', borderRadius: '1cqmin', background: `linear-gradient(90deg, transparent, ${AWARDS.green}, transparent)`, marginTop: '3cqmin', animation: 'ssaFadeIn 1s ease-out 0.3s both' }} />
          {(slide.gallerySubtitle && slide.gallerySubtitle.trim()) && (
            <p className="uppercase" style={{ color: AWARDS.muted, fontSize: '2.4cqmin', letterSpacing: '0.3em', paddingLeft: '0.3em', marginTop: '3cqmin', fontWeight: 600, animation: 'ssaFadeIn 1s ease-out 0.5s both' }}>
              {slide.gallerySubtitle}
            </p>
          )}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={student.photoUrl}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-[8cqmin]"
            style={{ paddingTop: '9cqmin', paddingBottom: '13cqmin' }}
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
            <motion.div variants={photoV} className="relative flex items-center justify-center" style={{ marginTop: '3cqmin' }}>
              <div className="absolute" style={{ width: '64cqmin', height: '64cqmin', borderRadius: '50%', background: `radial-gradient(circle, ${AWARDS.green}26, transparent 66%)` }} />
              <StudentPortrait student={student} />
            </motion.div>

            {/* Name */}
            <motion.h1
              variants={textV}
              style={{
                fontFamily: SERIF, color: AWARDS.navy, fontSize: '7.6cqmin', fontWeight: 800,
                lineHeight: 1.04, marginTop: '2.4cqmin', textShadow: `0 0.2cqmin 0.5cqmin ${AWARDS.navy}1a`,
              }}
            >
              {student.name}
            </motion.h1>

            <motion.span
              variants={textV}
              style={{ display: 'block', height: '0.45cqmin', width: '16cqmin', borderRadius: '1cqmin', background: `linear-gradient(90deg, transparent, ${AWARDS.green}, transparent)`, marginTop: '1.8cqmin' }}
            />
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
  // The frame hugs the photo: the border sits on the image itself and the image
  // is bounded by max height/width, so it scales to its own aspect ratio —
  // whole photo shown, never cropped, and no letterbox gaps.
  const frame: React.CSSProperties = {
    borderRadius: '3cqmin',
    border: `0.7cqmin solid ${AWARDS.green}`,
    background: AWARDS.panel,
    boxShadow: `0 0.6cqmin 2.4cqmin ${AWARDS.navy}26`,
  };
  if (err) {
    return (
      <div className="flex items-center justify-center" style={{ width: '46cqmin', height: '56cqmin', ...frame }}>
        <User style={{ width: '45%', height: '45%', color: AWARDS.accent }} />
      </div>
    );
  }
  return (
    <img
      src={student.photoUrl}
      alt={student.name}
      onError={() => setErr(true)}
      style={{ maxHeight: '56cqmin', maxWidth: '66cqmin', width: 'auto', height: 'auto', objectFit: 'contain', display: 'block', ...frame }}
    />
  );
}
