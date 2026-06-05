import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { User } from 'lucide-react';
import { Slide, Person } from '../../../services/firebaseService';
import { AWARDS } from './templates';
import { Confetti, Sparkles, AwardsBackground, AwardsFrame, AwardsFooter, awardsKeyframes, awardsContainer as container, awardsItem as item } from './awardsShared';

const photoV: Variants = {
  hidden: { opacity: 0, scale: 0.7 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 120, damping: 14 } },
};

export default function SpeakerSlide({ slide }: { slide: Slide }) {
  const persons = slide.persons || [];
  const active = persons.find(p => p.id === slide.activePersonId) || persons[0] || null;
  const others = persons.filter(p => p.id !== active?.id);

  return (
    <div className="w-full h-full relative overflow-hidden" style={{ containerType: 'size' }}>
      <style>{awardsKeyframes}</style>
      <AwardsBackground />
      <Sparkles count={6} />
      <Confetti count={12} />
      <AwardsFrame />

      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-[6cqmin]"
        style={{ paddingTop: '6cqmin', paddingBottom: '20cqmin' }}
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {/* Segment label */}
        <motion.div variants={item}>
          <p className="font-semibold uppercase" style={{ color: AWARDS.accent, fontSize: '3.2cqmin', letterSpacing: '0.42em', paddingLeft: '0.42em' }}>
            {slide.segment || 'Programme'}
          </p>
          <div className="flex items-center justify-center gap-[1.5cqmin]" style={{ marginTop: '1.2cqmin' }}>
            <span style={{ height: '0.25cqmin', width: '12cqmin', background: `linear-gradient(90deg, transparent, ${AWARDS.green})` }} />
            <span style={{ color: AWARDS.green, fontSize: '2.2cqmin' }}>◆</span>
            <span style={{ height: '0.25cqmin', width: '12cqmin', background: `linear-gradient(90deg, ${AWARDS.green}, transparent)` }} />
          </div>
        </motion.div>

        {/* Active speaker with subtle spotlight glow behind */}
        <motion.div variants={photoV} className="relative flex items-center justify-center" style={{ marginTop: '4.5cqmin' }}>
          <div className="absolute" style={{ width: '48cqmin', height: '48cqmin', borderRadius: '50%', background: `radial-gradient(circle, ${AWARDS.green}1f, transparent 65%)` }} />
          <PersonPhoto person={active} size={34} />
        </motion.div>

        <motion.p
          variants={item}
          className="font-bold"
          style={{ color: AWARDS.navy, fontSize: '7.2cqmin', marginTop: '3cqmin', lineHeight: 1.05, textShadow: `0 0.2cqmin 0.5cqmin ${AWARDS.navy}1a` }}
        >
          {active?.name || 'Speaker'}
        </motion.p>

        <motion.span
          variants={item}
          style={{ display: 'block', height: '0.45cqmin', width: '14cqmin', borderRadius: '1cqmin', background: `linear-gradient(90deg, transparent, ${AWARDS.green}, transparent)`, marginTop: '1.4cqmin' }}
        />

        {active?.role && (
          <motion.p variants={item} style={{ color: AWARDS.accent, fontSize: '3.4cqmin', marginTop: '1.4cqmin', letterSpacing: '0.05em' }}>
            {active.role}
          </motion.p>
        )}

        {/* Other people on this segment (smaller) */}
        {others.length > 0 && (
          <motion.div variants={item} className="flex flex-wrap items-start justify-center" style={{ gap: '4cqmin', marginTop: '4cqmin' }}>
            {others.map(p => (
              <div key={p.id} className="flex flex-col items-center" style={{ opacity: 0.9 }}>
                <PersonPhoto person={p} size={16} />
                <p style={{ color: AWARDS.navy, fontSize: '2.6cqmin', marginTop: '1cqmin' }}>{p.name || '—'}</p>
                {p.role && <p style={{ color: AWARDS.accent, fontSize: '2cqmin' }}>{p.role}</p>}
              </div>
            ))}
          </motion.div>
        )}
      </motion.div>

      <AwardsFooter caption={slide.footerCaption} />
    </div>
  );
}

function PersonPhoto({ person, size }: { person: Person | null; size: number }) {
  const [err, setErr] = useState(false);
  useEffect(() => { setErr(false); }, [person?.photoUrl]);
  return (
    <div
      className="rounded-full overflow-hidden flex items-center justify-center mx-auto"
      style={{
        width: `${size}cqmin`,
        height: `${size}cqmin`,
        border: `0.7cqmin solid ${AWARDS.green}`,
        background: AWARDS.panel,
        boxShadow: `0 0.4cqmin 2cqmin ${AWARDS.navy}1f`,
      }}
    >
      {person?.photoUrl && !err ? (
        <img src={person.photoUrl} alt="" className="w-full h-full object-cover" onError={() => setErr(true)} />
      ) : (
        <User style={{ width: '45%', height: '45%', color: AWARDS.accent }} />
      )}
    </div>
  );
}
