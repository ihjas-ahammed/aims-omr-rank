import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import { Images } from 'lucide-react';
import { Slide } from '../../../services/firebaseService';

interface SlideshowSlideProps {
  slide: Slide;
  preview?: boolean;
}

// Transition variants. `slide` moves horizontally (custom `dir` decides direction),
// `fade` cross-dissolves, `zoom` eases in with a gentle scale.
const VARIANTS: Record<string, Variants> = {
  slide: {
    initial: (dir: number) => ({ x: dir >= 0 ? '100%' : '-100%', opacity: 1 }),
    animate: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir >= 0 ? '-100%' : '100%', opacity: 1 }),
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  zoom: {
    initial: { opacity: 0, scale: 1.08 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.96 },
  },
};

// A slideshow auto-advances ONLY while it is the live/active slide (it is only
// mounted then). Images are fit by height — a portrait image on a landscape
// screen fills the full height and is centered, never letterboxed top/bottom.
export default function SlideshowSlide({ slide, preview = false }: SlideshowSlideProps) {
  const images = (slide.images || []).filter(Boolean);
  const delay = Math.max(0.5, slide.slideshowDelay ?? 4);
  const animation = slide.slideshowAnimation || 'slide';
  const [index, setIndex] = useState(0);

  // Auto-advance infinitely; nothing to advance with a single image.
  useEffect(() => {
    if (images.length <= 1) return;
    const t = setInterval(() => setIndex(i => (i + 1) % images.length), delay * 1000);
    return () => clearInterval(t);
  }, [images.length, delay]);

  // If the image list shrinks below the current index, snap back to a valid one.
  useEffect(() => {
    if (index >= images.length) setIndex(0);
  }, [images.length, index]);

  if (images.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black text-gray-500 gap-2">
        <Images className={preview ? 'w-6 h-6' : 'w-16 h-16'} />
        <span className={preview ? 'text-xs' : 'text-lg'}>No images added</span>
      </div>
    );
  }

  const variant = VARIANTS[animation] || VARIANTS.slide;
  const safeIndex = Math.min(index, images.length - 1);
  const src = images[safeIndex];

  return (
    <div className="w-full h-full relative overflow-hidden bg-black">
      <AnimatePresence initial={false} custom={1}>
        <motion.div
          key={safeIndex}
          custom={1}
          variants={variant}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.6, ease: [0.22, 0.7, 0.2, 1] }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {/* Fit by height: height fills the stage, width follows aspect ratio. */}
          <img src={src} alt="" className="h-full w-auto max-w-none object-contain" />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
