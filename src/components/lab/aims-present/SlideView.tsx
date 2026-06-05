import React, { useState, useEffect } from 'react';
import { ImageOff, User } from 'lucide-react';
import { Slide, Person, PresentationSettings, DEFAULT_PRESENTATION_SETTINGS } from '../../../services/firebaseService';
import SpeakerSlide from './SpeakerSlide';
import CongratsSlide from './CongratsSlide';
import TitleSlide from './TitleSlide';
import SlideshowSlide from './SlideshowSlide';
import GallerySlide from './GallerySlide';

interface SlideViewProps {
  slide: Slide | null;
  // `preview` shrinks the text sizing so the slide fits inside a small box.
  preview?: boolean;
  // Presentation-wide settings (persons sizing/placement).
  settings?: PresentationSettings;
}

const ANCHOR_V: Record<string, string> = { top: 'flex-start', center: 'center', bottom: 'flex-end' };
const ANCHOR_H: Record<string, string> = { left: 'flex-start', center: 'center', right: 'flex-end' };

export default function SlideView({ slide, preview = false, settings }: SlideViewProps) {
  const [imgError, setImgError] = useState(false);

  // Reset the error state whenever the image source changes.
  useEffect(() => { setImgError(false); }, [slide?.imageUrl]);

  if (!slide) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black text-gray-500">
        <span className={preview ? 'text-sm' : 'text-2xl'}>No active slide</span>
      </div>
    );
  }

  if (slide.type === 'slideshow') return <SlideshowSlide slide={slide} preview={preview} />;
  if (slide.type === 'gallery') return <GallerySlide slide={slide} preview={preview} />;

  if (slide.type === 'image') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-black overflow-hidden">
        {slide.imageUrl && !imgError ? (
          // Fit by height: a portrait image on a landscape screen fills the full
          // height and is centered, never letterboxed top/bottom.
          <img
            src={slide.imageUrl}
            alt=""
            className="h-full w-auto max-w-none object-contain"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-500 gap-2">
            <ImageOff className={preview ? 'w-6 h-6' : 'w-16 h-16'} />
            <span className={preview ? 'text-xs' : 'text-lg'}>
              {slide.imageUrl ? 'Image failed to load' : 'No image URL'}
            </span>
          </div>
        )}
      </div>
    );
  }

  if (slide.type === 'title') return <TitleSlide slide={slide} />;
  if (slide.type === 'speaker') return <SpeakerSlide slide={slide} />;
  if (slide.type === 'congrats') return <CongratsSlide slide={slide} />;

  if (slide.type === 'persons') {
    const persons = slide.persons || [];
    const s = settings || DEFAULT_PRESENTATION_SETTINGS;
    if (persons.length === 0) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-black text-gray-500">
          <span className={preview ? 'text-sm' : 'text-2xl'}>No people added</span>
        </div>
      );
    }
    return (
      // containerType: size makes the cq* units below scale to THIS box,
      // so the panel looks identical in fullscreen and in the small preview.
      <div
        className="w-full h-full flex bg-black p-[5cqmin]"
        style={{ containerType: 'size', alignItems: ANCHOR_V[s.personAnchorV], justifyContent: ANCHOR_H[s.personAnchorH] }}
      >
        <div className="flex flex-wrap items-end justify-center" style={{ gap: '5cqmin' }}>
          {persons.map(p => (
            <PersonCard
              key={p.id}
              person={p}
              active={p.id === slide.activePersonId}
              scale={s.personScale}
            />
          ))}
        </div>
      </div>
    );
  }

  // text slide
  return (
    <div className="w-full h-full flex items-center justify-center bg-black px-[6%]">
      <p
        className={`text-white text-center font-semibold whitespace-pre-wrap break-words leading-tight ${
          preview ? 'text-lg' : 'text-4xl sm:text-6xl md:text-7xl'
        }`}
      >
        {slide.text || ''}
      </p>
    </div>
  );
}

function PersonCard({ person, active, scale }: { person: Person; active: boolean; scale: number }) {
  const [imgError, setImgError] = useState(false);
  useEffect(() => { setImgError(false); }, [person.photoUrl]);

  // Sizes in cqmin (1% of the smaller container dimension) × the global scale.
  // Active speaker is bigger + bright; others shrink, dim, and desaturate.
  const photo = (active ? 34 : 22) * scale;
  const name = (active ? 5 : 3.6) * scale;
  const role = (active ? 3 : 2.3) * scale;

  return (
    <div className={`flex flex-col items-center text-center transition-all duration-300 ${active ? 'opacity-100' : 'opacity-40 grayscale'}`}>
      <div
        className="rounded-full overflow-hidden bg-gray-800 flex items-center justify-center"
        style={{
          width: `${photo}cqmin`,
          height: `${photo}cqmin`,
          border: active ? '0.7cqmin solid #8b5cf6' : '0.3cqmin solid #374151',
        }}
      >
        {person.photoUrl && !imgError ? (
          <img src={person.photoUrl} alt="" className="w-full h-full object-cover" onError={() => setImgError(true)} />
        ) : (
          <User className="text-gray-600" style={{ width: '50%', height: '50%' }} />
        )}
      </div>
      <p className="text-white font-semibold" style={{ fontSize: `${name}cqmin`, marginTop: '2cqmin', lineHeight: 1.1 }}>
        {person.name || 'Unnamed'}
      </p>
      {person.role && (
        <p className="text-violet-300" style={{ fontSize: `${role}cqmin`, lineHeight: 1.1 }}>{person.role}</p>
      )}
    </div>
  );
}
