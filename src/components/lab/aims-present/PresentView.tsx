import React, { useState, useEffect, useRef, useCallback } from 'react';
import { subscribePresentation, Presentation, isFirebaseConfigured } from '../../../services/firebaseService';
import SlideStage from './SlideStage';
import { slideImageUrls, preloadImages } from './imagePreload';

interface PresentViewProps {
  presentationId: string;
}

export default function PresentView({ presentationId }: PresentViewProps) {
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'notfound' | 'error'>('loading');
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const lastTapRef = useRef(0);

  const requestFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) return;
    const req =
      el.requestFullscreen ||
      (el as any).webkitRequestFullscreen ||
      (el as any).msRequestFullscreen;
    if (req) {
      try {
        Promise.resolve(req.call(el)).catch(() => {});
      } catch {
        /* ignore */
      }
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      lastTapRef.current = 0;
      requestFullscreen();
    } else {
      lastTapRef.current = now;
    }
  }, [requestFullscreen]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange as any);
    return () => {
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange as any);
    };
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setStatus('error');
      return;
    }
    const unsub = subscribePresentation(
      presentationId,
      (p) => {
        if (!p) {
          setStatus('notfound');
          setPresentation(null);
          return;
        }
        setPresentation(p);
        setStatus('ready');
      },
      () => setStatus('error')
    );
    return unsub;
  }, [presentationId]);

  const slides = presentation?.slides || [];
  const activeIndex = slides.findIndex(s => s.id === presentation?.activeSlideId);
  const activeSlide = activeIndex >= 0 ? slides[activeIndex] : null;

  // Preload the next slide's images while the current slide is showing, so the
  // upcoming slide appears instantly instead of loading in on screen. We warm
  // both the immediate next slide and the one after it.
  useEffect(() => {
    if (activeIndex < 0) return;
    for (let i = 1; i <= 2; i++) {
      const upcoming = slides[activeIndex + i];
      if (upcoming) preloadImages(slideImageUrls(upcoming));
    }
  }, [activeIndex, slides]);

  if (status === 'error') {
    return (
      <div className="fixed inset-0 bg-black text-red-400 flex items-center justify-center text-xl">
        Firebase is not configured or unreachable.
      </div>
    );
  }

  if (status === 'notfound') {
    return (
      <div className="fixed inset-0 bg-black text-gray-400 flex items-center justify-center text-xl">
        Presentation not found.
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="fixed inset-0 bg-black text-gray-500 flex items-center justify-center text-xl">
        Connecting…
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black"
      onDoubleClick={requestFullscreen}
      onTouchEnd={handleTouchEnd}
    >
      <SlideStage slide={activeSlide} settings={presentation?.settings} />
      {!isFullscreen && (
        <button
          onClick={requestFullscreen}
          className="absolute bottom-4 right-4 z-10 rounded-full bg-white/10 px-4 py-2 text-sm text-white/80 backdrop-blur transition hover:bg-white/20"
          title="Enter fullscreen (or double-tap anywhere)"
        >
          ⛶ Fullscreen
        </button>
      )}
    </div>
  );
}
