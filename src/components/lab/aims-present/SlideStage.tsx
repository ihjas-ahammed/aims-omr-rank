import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Slide, PresentationSettings } from '../../../services/firebaseService';
import SlideView from './SlideView';

// Awards slides use a white canvas; the generic slides (text/image/persons) use black.
const AWARDS_TYPES = new Set(['title', 'congrats', 'speaker', 'gallery']);

interface SlideStageProps {
  slide: Slide | null;
  settings?: PresentationSettings;
  preview?: boolean;
}

// Crossfades between slides: the outgoing slide fades/zooms out while the
// incoming slide fades/zooms in (both are absolutely stacked).
export default function SlideStage({ slide, settings, preview }: SlideStageProps) {
  const backdrop = slide && AWARDS_TYPES.has(slide.type) ? '#ffffff' : '#000000';
  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: backdrop }}>
      <AnimatePresence>
        <motion.div
          key={slide?.id || '__none__'}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.035 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.985 }}
          transition={{ duration: 0.55, ease: [0.22, 0.7, 0.2, 1] }}
          style={{ transformOrigin: 'center' }}
        >
          <SlideView slide={slide} settings={settings} preview={preview} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
