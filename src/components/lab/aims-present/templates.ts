import { Slide, Person, Presentation } from '../../../services/firebaseService';

// AIMS brand palette, taken from logo1.png: white background + navy wordmark + green leaves.
// White is the canvas (so the white-background logo blends in), navy is the primary text,
// green is the accent.
export const AWARDS = {
  bg: '#ffffff',
  panel: '#eef4f8',     // faint cool tint for subtle depth
  navy: '#1b4a68',      // primary text / titles
  ink: '#15384e',
  muted: '#5e7689',     // body / secondary text
  green: '#6cb33f',
  greenBright: '#8cc63f',
  greenDark: '#3f7e25', // green that stays readable on white (eyebrows, accents)
  accent: '#3f7e25',
  white: '#ffffff',
};

// Elegant display serif for award titles (loaded in index.html), with graceful fallbacks.
export const SERIF = "'Playfair Display', Georgia, 'Times New Roman', serif";

const uid = () =>
  (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

const person = (name: string, role = ''): Person => ({ id: uid(), name, role, photoUrl: '' });

const speakerSlide = (segment: string, people: Person[]): Slide => ({
  id: uid(),
  type: 'speaker',
  segment,
  persons: people,
  activePersonId: people[0]?.id ?? null,
});

export interface PresentationTemplate {
  id: string;
  name: string;
  description: string;
  build: () => Pick<Presentation, 'title' | 'slides' | 'activeSlideId' | 'settings'>;
}

const sslcAwards2026: PresentationTemplate = {
  id: 'sslc-awards-2026',
  name: 'SSLC Awards 2026 · AIMS',
  description: 'Animated red & gold awards ceremony: title, themed speaker slides for each program, and a celebration slide. Fully editable.',
  build: () => {
    const slides: Slide[] = [
      // Title
      {
        id: uid(),
        type: 'title',
        congratsTitle: 'SSLC Awards',
        congratsSubtitle: '2026',
        congratsMessage: 'AIMS · Annual Ceremony',
      },
      speakerSlide('Welcome Address', [person('Labeed Sir')]),
      speakerSlide('Presidential Address', [person('Nooru Sir')]),
      speakerSlide('Inauguration', [person('')]),
      speakerSlide('Felicitation', [person('Ansar Sir')]),
      speakerSlide('Vote of Thanks', [person('Basim Sir')]),
      // Celebration — keep this live during the ceremony.
      {
        id: uid(),
        type: 'congrats',
        congratsTitle: 'Heartiest Congratulations',
        congratsSubtitle: 'SSLC 2026 · Full A+ Achievers',
        congratsMessage: 'To all our brilliant achievers — your dedication and hard work have made AIMS proud. Wishing you a future as bright as this moment.',
      },
    ];
    const stamped = slides.map(s => ({ ...s, footerCaption: 'SSLC Awards 2026' }));
    return { title: 'SSLC Awards 2026', slides: stamped, activeSlideId: slides[0].id };
  },
};

const plusTwoAwards2026: PresentationTemplate = {
  id: 'plus-two-awards-2026',
  name: 'Plus Two Awards 2026 · AIMS',
  description: 'Awards ceremony for Plus Two 2026: title, themed speaker slides, auto-playing student galleries (Full A+, 5 A+, 90% & above) with live search, and a celebration slide.',
  build: () => {
    const slides: Slide[] = [
      // Title
      {
        id: uid(),
        type: 'title',
        congratsTitle: 'Plus Two Awards',
        congratsSubtitle: '2026',
        congratsMessage: 'AIMS · Annual Ceremony',
      },
      speakerSlide('Welcome Address', [person('Labeed Sir')]),
      speakerSlide('Presidential Address', [person('Nooru Sir')]),
      speakerSlide('Inauguration', [person('')]),
      speakerSlide('Felicitation', [person('Ansar Sir')]),
      speakerSlide('Vote of Thanks', [person('Basim Sir')]),
      // Student gallery — all three sets in one slide. Each student shows with
      // their own category (Full A+ / 5 A+ / 90% & above). Auto-plays A→Z; the
      // up-next queue (presettable before going live) jumps people forward.
      {
        id: uid(),
        type: 'gallery',
        galleryCategory: 'all',
        galleryTitle: 'Congratulations',
        gallerySubtitle: '',
        slideshowDelay: 5,
        galleryCurrentKey: '',
        galleryQueue: [],
      },
      // Celebration — keep this live during the ceremony.
      {
        id: uid(),
        type: 'congrats',
        congratsTitle: 'Heartiest Congratulations',
        congratsSubtitle: 'Plus Two 2026 · Achievers',
        congratsMessage: 'To all our brilliant achievers — your dedication and hard work have made AIMS proud. Wishing you a future as bright as this moment.',
      },
    ];
    const stamped = slides.map(s => ({ ...s, footerCaption: 'Plus Two Awards 2026' }));
    return { title: 'Plus Two Awards 2026', slides: stamped, activeSlideId: slides[0].id };
  },
};

export const TEMPLATES: PresentationTemplate[] = [sslcAwards2026, plusTwoAwards2026];
