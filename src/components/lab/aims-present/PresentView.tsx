import React, { useState, useEffect } from 'react';
import { subscribePresentation, Presentation, isFirebaseConfigured } from '../../../services/firebaseService';
import SlideStage from './SlideStage';

interface PresentViewProps {
  presentationId: string;
}

export default function PresentView({ presentationId }: PresentViewProps) {
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'notfound' | 'error'>('loading');

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

  const activeSlide =
    presentation?.slides.find(s => s.id === presentation.activeSlideId) || null;

  return (
    <div className="fixed inset-0 bg-black">
      <SlideStage slide={activeSlide} settings={presentation?.settings} />
    </div>
  );
}
