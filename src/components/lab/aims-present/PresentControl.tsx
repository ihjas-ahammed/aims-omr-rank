import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown, Type, Image as ImageIcon, Images, Users, ChevronLeft, ChevronRight, Radio, Link2, GripVertical, Mic, Award, Heading, Settings as SettingsIcon, X, GraduationCap } from 'lucide-react';
import {
  getPresentation,
  updatePresentation,
  Presentation,
  Slide,
  Person,
  PresentationSettings,
  DEFAULT_PRESENTATION_SETTINGS,
  AnchorV,
  AnchorH,
  isFirebaseConfigured,
} from '../../../services/firebaseService';
import SlideStage from './SlideStage';
import GalleryController from './GalleryController';
import { CATEGORY_LABEL } from './students';

interface PresentControlProps {
  presentationId: string;
  onBack: () => void;
}

const uuid = () =>
  (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

export default function PresentControl({ presentationId, onBack }: PresentControlProps) {
  const [presentation, setPresentation] = useState<Presentation | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'notfound'>('loading');
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const dragIndex = useRef<number | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured) { setStatus('error'); return; }
    getPresentation(presentationId)
      .then(p => { setPresentation(p); setStatus('ready'); })
      .catch(() => setStatus('notfound'));
  }, [presentationId]);

  // Persist a patch and update local state optimistically.
  const persist = (patch: Partial<Presentation>) => {
    setPresentation(prev => (prev ? { ...prev, ...patch } : prev));
    updatePresentation(presentationId, patch).catch(err => console.error('Save failed', err));
  };

  const setSlides = (slides: Slide[], extra: Partial<Presentation> = {}) =>
    persist({ slides, ...extra });

  const addSlide = (type: Slide['type']) => {
    if (!presentation) return;
    let slide: Slide;
    if (type === 'text') slide = { id: uuid(), type: 'text', text: 'New slide' };
    else if (type === 'image') slide = { id: uuid(), type: 'image', imageUrl: '' };
    else if (type === 'slideshow') slide = { id: uuid(), type: 'slideshow', images: [''], slideshowDelay: 4, slideshowAnimation: 'slide' };
    else if (type === 'speaker') slide = { id: uuid(), type: 'speaker', segment: 'Programme', persons: [], activePersonId: null };
    else if (type === 'congrats') slide = { id: uuid(), type: 'congrats', congratsTitle: 'Congratulations', congratsSubtitle: '', congratsMessage: '' };
    else if (type === 'title') slide = { id: uuid(), type: 'title', congratsTitle: 'Title', congratsSubtitle: '', congratsMessage: '' };
    else if (type === 'gallery') slide = { id: uuid(), type: 'gallery', galleryCategory: 'all', galleryTitle: 'Congratulations', gallerySubtitle: '', slideshowDelay: 5, galleryCurrentKey: '', galleryQueue: [], footerCaption: '' };
    else slide = { id: uuid(), type: 'persons', persons: [], activePersonId: null };
    const slides = [...presentation.slides, slide];
    // First slide added becomes active automatically.
    setSlides(slides, presentation.activeSlideId ? {} : { activeSlideId: slide.id });
  };

  // --- persons-slide helpers ---
  const addPerson = (slideId: string) => {
    if (!presentation) return;
    const person: Person = { id: uuid(), name: '', role: '', photoUrl: '' };
    setSlides(presentation.slides.map(s => {
      if (s.id !== slideId) return s;
      const persons = [...(s.persons || []), person];
      // First person becomes the active speaker.
      return { ...s, persons, activePersonId: s.activePersonId ?? person.id };
    }));
  };

  const editPerson = (slideId: string, personId: string, patch: Partial<Person>) => {
    if (!presentation) return;
    setSlides(presentation.slides.map(s =>
      s.id !== slideId ? s : { ...s, persons: (s.persons || []).map(p => p.id === personId ? { ...p, ...patch } : p) }
    ));
  };

  const deletePerson = (slideId: string, personId: string) => {
    if (!presentation) return;
    setSlides(presentation.slides.map(s => {
      if (s.id !== slideId) return s;
      const persons = (s.persons || []).filter(p => p.id !== personId);
      const activePersonId = s.activePersonId === personId ? (persons[0]?.id ?? null) : s.activePersonId;
      return { ...s, persons, activePersonId };
    }));
  };

  const setActivePerson = (slideId: string, personId: string) => {
    if (!presentation) return;
    setSlides(presentation.slides.map(s => s.id !== slideId ? s : { ...s, activePersonId: personId }));
  };

  // --- slideshow-slide helpers ---
  const addImage = (slideId: string) => {
    if (!presentation) return;
    setSlides(presentation.slides.map(s =>
      s.id !== slideId ? s : { ...s, images: [...(s.images || []), ''] }
    ));
  };

  const editImage = (slideId: string, idx: number, value: string) => {
    if (!presentation) return;
    setSlides(presentation.slides.map(s => {
      if (s.id !== slideId) return s;
      const images = [...(s.images || [])];
      images[idx] = value;
      return { ...s, images };
    }));
  };

  const deleteImage = (slideId: string, idx: number) => {
    if (!presentation) return;
    setSlides(presentation.slides.map(s =>
      s.id !== slideId ? s : { ...s, images: (s.images || []).filter((_, i) => i !== idx) }
    ));
  };

  const moveImage = (slideId: string, from: number, to: number) => {
    if (!presentation) return;
    setSlides(presentation.slides.map(s => {
      if (s.id !== slideId) return s;
      const images = [...(s.images || [])];
      if (to < 0 || to >= images.length) return s;
      const [item] = images.splice(from, 1);
      images.splice(to, 0, item);
      return { ...s, images };
    }));
  };

  const settings: PresentationSettings = { ...DEFAULT_PRESENTATION_SETTINGS, ...(presentation?.settings || {}) };
  const updateSettings = (patch: Partial<PresentationSettings>) =>
    persist({ settings: { ...settings, ...patch } });

  const deleteSlide = (id: string) => {
    if (!presentation) return;
    const slides = presentation.slides.filter(s => s.id !== id);
    const activeSlideId = presentation.activeSlideId === id
      ? (slides[0]?.id ?? null)
      : presentation.activeSlideId;
    setSlides(slides, { activeSlideId });
  };

  const editSlide = (id: string, patch: Partial<Slide>) => {
    if (!presentation) return;
    setSlides(presentation.slides.map(s => (s.id === id ? { ...s, ...patch } : s)));
  };

  const move = (from: number, to: number) => {
    if (!presentation) return;
    if (to < 0 || to >= presentation.slides.length) return;
    const slides = [...presentation.slides];
    const [item] = slides.splice(from, 1);
    slides.splice(to, 0, item);
    setSlides(slides);
  };

  const setActive = (id: string) => persist({ activeSlideId: id });

  const copyViewLink = () => {
    const url = `${window.location.origin}/aims-present/view/${presentationId}`;
    navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (status === 'loading') return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading…</div>;
  if (status === 'error') return <div className="min-h-screen flex items-center justify-center text-red-500">Firebase is not configured.</div>;
  if (status === 'notfound' || !presentation) return <div className="min-h-screen flex items-center justify-center text-gray-500">Presentation not found.</div>;

  const slides = presentation.slides;
  const activeIndex = slides.findIndex(s => s.id === presentation.activeSlideId);
  const activeSlide = activeIndex >= 0 ? slides[activeIndex] : null;

  const goPrev = () => { if (activeIndex > 0) setActive(slides[activeIndex - 1].id); };
  const goNext = () => { if (activeIndex >= 0 && activeIndex < slides.length - 1) setActive(slides[activeIndex + 1].id); };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 h-14 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={onBack} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <input
            value={presentation.title}
            onChange={(e) => persist({ title: e.target.value })}
            className="font-semibold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-200 focus:border-violet-400 focus:outline-none px-1 py-0.5 min-w-0"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(true)}
            title="Presentation settings"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
          <button
            onClick={copyViewLink}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-violet-600 text-white rounded-md hover:bg-violet-700"
          >
            <Link2 className="w-4 h-4" />
            {copied ? 'Copied!' : 'Copy view link'}
          </button>
        </div>
      </header>

      {showSettings && (
        <SettingsPanel settings={settings} onChange={updateSettings} onClose={() => setShowSettings(false)} />
      )}

      <div className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Slide list */}
        <aside className="w-full lg:w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-3 grid grid-cols-3 gap-2 border-b border-gray-200">
            <button onClick={() => addSlide('text')} className="flex items-center justify-center gap-1.5 px-2 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
              <Type className="w-4 h-4" /> Text
            </button>
            <button onClick={() => addSlide('image')} className="flex items-center justify-center gap-1.5 px-2 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
              <ImageIcon className="w-4 h-4" /> Image
            </button>
            <button onClick={() => addSlide('slideshow')} className="flex items-center justify-center gap-1.5 px-2 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
              <Images className="w-4 h-4" /> Slideshow
            </button>
            <button onClick={() => addSlide('persons')} className="flex items-center justify-center gap-1.5 px-2 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
              <Users className="w-4 h-4" /> Persons
            </button>
            <button onClick={() => addSlide('speaker')} className="flex items-center justify-center gap-1.5 px-2 py-2 text-sm font-medium bg-amber-50 text-amber-700 rounded-md hover:bg-amber-100">
              <Mic className="w-4 h-4" /> Speaker
            </button>
            <button onClick={() => addSlide('congrats')} className="flex items-center justify-center gap-1.5 px-2 py-2 text-sm font-medium bg-amber-50 text-amber-700 rounded-md hover:bg-amber-100">
              <Award className="w-4 h-4" /> Congrats
            </button>
            <button onClick={() => addSlide('title')} className="flex items-center justify-center gap-1.5 px-2 py-2 text-sm font-medium bg-amber-50 text-amber-700 rounded-md hover:bg-amber-100">
              <Heading className="w-4 h-4" /> Title
            </button>
            <button onClick={() => addSlide('gallery')} className="flex items-center justify-center gap-1.5 px-2 py-2 text-sm font-medium bg-amber-50 text-amber-700 rounded-md hover:bg-amber-100">
              <GraduationCap className="w-4 h-4" /> Gallery
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {slides.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-8">No slides yet. Add one above.</p>
            )}
            {slides.map((slide, idx) => {
              const isActive = slide.id === presentation.activeSlideId;
              return (
                <div
                  key={slide.id}
                  draggable
                  onDragStart={() => { dragIndex.current = idx; }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => { if (dragIndex.current !== null) { move(dragIndex.current, idx); dragIndex.current = null; } }}
                  onDragEnd={() => { dragIndex.current = null; }}
                  className={`rounded-lg border p-2 ${isActive ? 'border-violet-500 ring-2 ring-violet-200 bg-violet-50' : 'border-gray-200 bg-white'}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <GripVertical className="w-4 h-4 text-gray-300 cursor-grab shrink-0" />
                    <span className="text-xs font-semibold text-gray-400 shrink-0">{idx + 1}</span>
                    <span className="text-xs uppercase tracking-wide text-gray-400 shrink-0">{slide.type}</span>
                    <div className="flex-1" />
                    <button onClick={() => move(idx, idx - 1)} disabled={idx === 0} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30">
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button onClick={() => move(idx, idx + 1)} disabled={idx === slides.length - 1} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30">
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteSlide(slide.id)} className="p-1 text-gray-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {slide.type === 'text' && (
                    <textarea
                      value={slide.text || ''}
                      onChange={(e) => editSlide(slide.id, { text: e.target.value })}
                      rows={2}
                      placeholder="Slide text…"
                      className="w-full text-sm border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-violet-400 resize-y"
                    />
                  )}

                  {slide.type === 'image' && (
                    <input
                      value={slide.imageUrl || ''}
                      onChange={(e) => editSlide(slide.id, { imageUrl: e.target.value })}
                      placeholder="https://image-url…"
                      className="w-full text-sm border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:border-violet-400"
                    />
                  )}

                  {slide.type === 'slideshow' && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex flex-col gap-0.5 text-xs text-gray-500">
                          Delay (sec)
                          <input
                            type="number"
                            min={0.5}
                            step={0.5}
                            value={slide.slideshowDelay ?? 4}
                            onChange={(e) => editSlide(slide.id, { slideshowDelay: Math.max(0.5, parseFloat(e.target.value) || 0.5) })}
                            className="w-full text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-violet-400"
                          />
                        </label>
                        <label className="flex flex-col gap-0.5 text-xs text-gray-500">
                          Animation
                          <select
                            value={slide.slideshowAnimation || 'slide'}
                            onChange={(e) => editSlide(slide.id, { slideshowAnimation: e.target.value as any })}
                            className="w-full text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-violet-400 bg-white"
                          >
                            <option value="slide">Slide</option>
                            <option value="fade">Fade</option>
                            <option value="zoom">Zoom</option>
                          </select>
                        </label>
                      </div>
                      {(slide.images || []).map((url, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-gray-400 w-4 shrink-0">{i + 1}</span>
                          <input
                            value={url}
                            onChange={(e) => editImage(slide.id, i, e.target.value)}
                            placeholder="https://image-url…"
                            className="flex-1 min-w-0 text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-violet-400"
                          />
                          <button onClick={() => moveImage(slide.id, i, i - 1)} disabled={i === 0} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 shrink-0">
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => moveImage(slide.id, i, i + 1)} disabled={i === (slide.images || []).length - 1} className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 shrink-0">
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteImage(slide.id, i)} className="p-1 text-gray-400 hover:text-red-500 shrink-0">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      <button onClick={() => addImage(slide.id)} className="w-full flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 rounded-md border border-dashed border-gray-300 text-gray-500 hover:bg-gray-50">
                        <Plus className="w-3.5 h-3.5" /> Add image
                      </button>
                    </div>
                  )}

                  {(slide.type === 'congrats' || slide.type === 'title') && (
                    <div className="space-y-1.5">
                      <input
                        value={slide.congratsTitle || ''}
                        onChange={(e) => editSlide(slide.id, { congratsTitle: e.target.value })}
                        placeholder="Title"
                        className="w-full text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-violet-400"
                      />
                      <input
                        value={slide.congratsSubtitle || ''}
                        onChange={(e) => editSlide(slide.id, { congratsSubtitle: e.target.value })}
                        placeholder="Subtitle (e.g. SSLC 2026 · Full A+)"
                        className="w-full text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-violet-400"
                      />
                      <textarea
                        value={slide.congratsMessage || ''}
                        onChange={(e) => editSlide(slide.id, { congratsMessage: e.target.value })}
                        rows={3}
                        placeholder="Message…"
                        className="w-full text-sm border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-violet-400 resize-y"
                      />
                    </div>
                  )}

                  {slide.type === 'gallery' && (
                    <div className="space-y-1.5">
                      <label className="flex flex-col gap-0.5 text-xs text-gray-500">
                        Student set
                        <select
                          value={slide.galleryCategory || 'full-aplus'}
                          onChange={(e) => editSlide(slide.id, { galleryCategory: e.target.value as any, galleryCurrentKey: '' })}
                          className="w-full text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-violet-400 bg-white"
                        >
                          <option value="full-aplus">{CATEGORY_LABEL['full-aplus']}</option>
                          <option value="5-aplus">{CATEGORY_LABEL['5-aplus']}</option>
                          <option value="90-above">{CATEGORY_LABEL['90-above']}</option>
                          <option value="all">All students</option>
                        </select>
                      </label>
                      <label className="flex flex-col gap-0.5 text-xs text-gray-500">
                        Delay per student (sec)
                        <input
                          type="number"
                          min={0.5}
                          step={0.5}
                          value={slide.slideshowDelay ?? 5}
                          onChange={(e) => editSlide(slide.id, { slideshowDelay: Math.max(0.5, parseFloat(e.target.value) || 0.5) })}
                          className="w-full text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-violet-400"
                        />
                      </label>
                      <input
                        value={slide.galleryTitle || ''}
                        onChange={(e) => editSlide(slide.id, { galleryTitle: e.target.value })}
                        placeholder="Eyebrow (e.g. Congratulations)"
                        className="w-full text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-violet-400"
                      />
                      <input
                        value={slide.gallerySubtitle || ''}
                        onChange={(e) => editSlide(slide.id, { gallerySubtitle: e.target.value })}
                        placeholder="Subtitle (e.g. Plus Two 2026 · Full A+)"
                        className="w-full text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-violet-400"
                      />
                      <input
                        value={slide.footerCaption ?? ''}
                        onChange={(e) => editSlide(slide.id, { footerCaption: e.target.value })}
                        placeholder="Footer caption (e.g. Plus Two Awards 2026)"
                        className="w-full text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-violet-400"
                      />
                      <p className="text-[11px] text-gray-400">Set live, then use the search &amp; queue below the preview to run the show.</p>
                    </div>
                  )}

                  {(slide.type === 'persons' || slide.type === 'speaker') && (
                    <div className="space-y-2">
                      {slide.type === 'speaker' && (
                        <input
                          value={slide.segment || ''}
                          onChange={(e) => editSlide(slide.id, { segment: e.target.value })}
                          placeholder="Programme (e.g. Welcome Address)"
                          className="w-full text-sm font-medium border border-amber-200 bg-amber-50/50 rounded px-2 py-1.5 focus:outline-none focus:border-amber-400"
                        />
                      )}
                      {(slide.persons || []).map(person => {
                        const talking = person.id === slide.activePersonId;
                        return (
                          <div key={person.id} className={`rounded-md border p-2 space-y-1.5 ${talking ? 'border-violet-400 bg-violet-50/60' : 'border-gray-200'}`}>
                            <div className="flex items-center gap-1.5">
                              <input
                                value={person.name}
                                onChange={(e) => editPerson(slide.id, person.id, { name: e.target.value })}
                                placeholder="Name"
                                className="flex-1 min-w-0 text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-violet-400"
                              />
                              <button onClick={() => deletePerson(slide.id, person.id)} className="p-1 text-gray-400 hover:text-red-500 shrink-0">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <input
                              value={person.role}
                              onChange={(e) => editPerson(slide.id, person.id, { role: e.target.value })}
                              placeholder="Role (e.g. Director)"
                              className="w-full text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-violet-400"
                            />
                            <input
                              value={person.photoUrl}
                              onChange={(e) => editPerson(slide.id, person.id, { photoUrl: e.target.value })}
                              placeholder="https://photo-url…"
                              className="w-full text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-violet-400"
                            />
                            <button
                              onClick={() => setActivePerson(slide.id, person.id)}
                              disabled={talking}
                              className={`w-full flex items-center justify-center gap-1.5 text-xs font-medium py-1 rounded ${talking ? 'bg-violet-200 text-violet-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                              <Mic className="w-3 h-3" /> {talking ? 'Talking' : 'Set talking'}
                            </button>
                          </div>
                        );
                      })}
                      <button onClick={() => addPerson(slide.id)} className="w-full flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 rounded-md border border-dashed border-gray-300 text-gray-500 hover:bg-gray-50">
                        <Plus className="w-3.5 h-3.5" /> Add person
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => setActive(slide.id)}
                    disabled={isActive}
                    className={`mt-2 w-full flex items-center justify-center gap-1.5 text-xs font-medium py-1.5 rounded-md ${isActive ? 'bg-violet-100 text-violet-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    <Radio className="w-3.5 h-3.5" /> {isActive ? 'Live' : 'Set live'}
                  </button>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Main: preview + nav */}
        <main className="flex-1 flex flex-col items-center justify-center p-6 gap-4 min-h-0">
          <div className="w-full max-w-3xl aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
            <SlideStage slide={activeSlide} preview settings={settings} />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={goPrev} disabled={activeIndex <= 0} className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <span className="text-sm text-gray-500 w-16 text-center">
              {activeIndex >= 0 ? `${activeIndex + 1} / ${slides.length}` : `– / ${slides.length}`}
            </span>
            <button onClick={goNext} disabled={activeIndex < 0 || activeIndex >= slides.length - 1} className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-40">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-400">Live preview — this is what viewers see right now.</p>

          {/* Gallery cockpit: drives the live gallery, or lets you preset the
              up-next queue for the gallery slide while another slide is live. */}
          {(() => {
            const galleryNow = activeSlide?.type === 'gallery' ? activeSlide : slides.find(s => s.type === 'gallery');
            if (!galleryNow) return null;
            return (
              <GalleryController
                key={galleryNow.id}
                slide={galleryNow}
                isLive={galleryNow.id === presentation.activeSlideId}
                onPatch={(patch) => editSlide(galleryNow.id, patch)}
              />
            );
          })()}
        </main>
      </div>
    </div>
  );
}

function SettingsPanel({ settings, onChange, onClose }: {
  settings: PresentationSettings;
  onChange: (patch: Partial<PresentationSettings>) => void;
  onClose: () => void;
}) {
  const vRows: AnchorV[] = ['top', 'center', 'bottom'];
  const hCols: AnchorH[] = ['left', 'center', 'right'];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-5 space-y-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Persons display</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
        </div>

        {/* Photo size */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">Photo size</label>
            <span className="text-sm text-gray-500">{Math.round(settings.personScale * 100)}%</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={1.5}
            step={0.05}
            value={settings.personScale}
            onChange={(e) => onChange({ personScale: parseFloat(e.target.value) })}
            className="w-full accent-violet-600"
          />
        </div>

        {/* Position — 3×3 anchor grid */}
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">Position</label>
          <div className="grid grid-cols-3 gap-1.5 w-32">
            {vRows.flatMap(v => hCols.map(h => {
              const selected = settings.personAnchorV === v && settings.personAnchorH === h;
              return (
                <button
                  key={`${v}-${h}`}
                  onClick={() => onChange({ personAnchorV: v, personAnchorH: h })}
                  title={`${v} ${h}`}
                  className={`aspect-square rounded border flex items-center justify-center ${selected ? 'border-violet-500 bg-violet-100' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${selected ? 'bg-violet-600' : 'bg-gray-300'}`} />
                </button>
              );
            }))}
          </div>
        </div>

        <p className="text-xs text-gray-400">Applies to all persons slides. Changes are live.</p>
      </div>
    </div>
  );
}
