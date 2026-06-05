import React from 'react';
import { motion } from 'framer-motion';
import { Slide } from '../../../services/firebaseService';
import { AWARDS, SERIF } from './templates';
import { Sparkles, AwardsBackground, AwardsFrame, AwardsFooter, CelebrationConfetti, awardsKeyframes, awardsContainer as container, awardsItem as item } from './awardsShared';

export default function CongratsSlide({ slide }: { slide: Slide }) {
  const title = slide.congratsTitle || 'Congratulations';
  const subtitle = slide.congratsSubtitle || '';
  const message = slide.congratsMessage || '';

  return (
    <div className="w-full h-full relative overflow-hidden" style={{ containerType: 'size' }}>
      <style>{awardsKeyframes}</style>
      <AwardsBackground />
      <Sparkles count={6} />
      <AwardsFrame />

      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-[9cqmin]"
        style={{ paddingTop: '4cqmin', paddingBottom: '17cqmin' }}
        variants={container}
        initial="hidden"
        animate="visible"
      >
        <motion.p
          variants={item}
          className="uppercase"
          style={{ color: AWARDS.accent, fontSize: '2.4cqmin', letterSpacing: '0.5em', paddingLeft: '0.5em', fontWeight: 600 }}
        >
          With pride &amp; joy
        </motion.p>

        <motion.h1
          variants={item}
          style={{
            fontFamily: SERIF, color: AWARDS.navy, fontSize: '10.5cqmin', fontWeight: 800,
            lineHeight: 1.02, marginTop: '2.4cqmin', textShadow: `0 0.2cqmin 0.5cqmin ${AWARDS.navy}1a`,
          }}
        >
          {title}
        </motion.h1>

        <motion.span
          variants={item}
          style={{
            display: 'block', height: '0.5cqmin', width: '24cqmin', borderRadius: '1cqmin',
            background: `linear-gradient(90deg, ${AWARDS.greenDark}, ${AWARDS.green}, ${AWARDS.greenDark})`,
            marginTop: '2.6cqmin',
          }}
        />

        {subtitle && (
          <motion.p
            variants={item}
            className="font-semibold uppercase"
            style={{ color: AWARDS.accent, fontSize: '3.8cqmin', marginTop: '2.6cqmin', letterSpacing: '0.14em' }}
          >
            {subtitle}
          </motion.p>
        )}

        {message && (
          <motion.p
            variants={item}
            style={{ color: AWARDS.muted, fontSize: '3.05cqmin', lineHeight: 1.55, marginTop: '2.8cqmin', maxWidth: '76cqmin' }}
          >
            {message}
          </motion.p>
        )}
      </motion.div>

      <CelebrationConfetti />
      <AwardsFooter />
    </div>
  );
}
