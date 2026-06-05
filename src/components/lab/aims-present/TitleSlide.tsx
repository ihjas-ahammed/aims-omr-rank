import React from 'react';
import { motion } from 'framer-motion';
import { Slide } from '../../../services/firebaseService';
import { AWARDS, SERIF } from './templates';
import { AwardsBackground, AwardsFrame, Sparkles, AwardsFooter, awardsKeyframes, awardsContainer as container, awardsItem as item } from './awardsShared';

// Minimal, typography-led opening slide. No emblem — hierarchy carries it.
export default function TitleSlide({ slide }: { slide: Slide }) {
  const title = slide.congratsTitle || 'Title';
  const edition = slide.congratsSubtitle || '';
  const kicker = slide.congratsMessage || '';

  return (
    <div className="w-full h-full relative overflow-hidden" style={{ containerType: 'size' }}>
      <style>{awardsKeyframes}</style>
      <AwardsBackground />
      <Sparkles count={5} />
      <AwardsFrame />

      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-[10cqmin]"
        style={{ paddingBottom: '16cqmin' }}
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {kicker && (
          <motion.p
            variants={item}
            className="uppercase"
            style={{ color: AWARDS.accent, fontSize: '2.6cqmin', letterSpacing: '0.5em', paddingLeft: '0.5em', fontWeight: 600 }}
          >
            {kicker}
          </motion.p>
        )}

        <motion.h1
          variants={item}
          style={{
            fontFamily: SERIF, color: AWARDS.navy, fontSize: '13cqmin', fontWeight: 800,
            lineHeight: 1.0, marginTop: '3cqmin', textShadow: `0 0.2cqmin 0.5cqmin ${AWARDS.navy}1a`,
          }}
        >
          {title}
        </motion.h1>

        {edition && (
          <motion.div variants={item} className="flex items-center justify-center" style={{ gap: '2.5cqmin', marginTop: '3.5cqmin' }}>
            <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }} style={{ height: '0.2cqmin', width: '14cqmin', transformOrigin: 'right', background: `linear-gradient(90deg, transparent, ${AWARDS.green})` }} />
            <span style={{ color: AWARDS.muted, fontSize: '4.4cqmin', letterSpacing: '0.32em', paddingLeft: '0.32em', fontWeight: 500 }}>{edition}</span>
            <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }} style={{ height: '0.2cqmin', width: '14cqmin', transformOrigin: 'left', background: `linear-gradient(90deg, ${AWARDS.green}, transparent)` }} />
          </motion.div>
        )}
      </motion.div>

      <AwardsFooter />
    </div>
  );
}
