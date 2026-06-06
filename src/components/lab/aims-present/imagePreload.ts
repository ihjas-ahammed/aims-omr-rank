import { Slide } from '../../../services/firebaseService';

// Collects every external image URL a slide may render, so they can be warmed
// in the browser cache before the slide goes live.
export function slideImageUrls(slide: Slide | null | undefined): string[] {
  if (!slide) return [];
  const urls: string[] = [];
  if (slide.imageUrl) urls.push(slide.imageUrl);
  if (slide.images) urls.push(...slide.images.filter(Boolean));
  if (slide.persons) urls.push(...slide.persons.map(p => p.photoUrl).filter(Boolean));
  // Gallery slides resolve their photo from the current key / queue.
  if (slide.galleryCurrentKey) urls.push(slide.galleryCurrentKey);
  if (slide.galleryQueue) urls.push(...slide.galleryQueue.filter(Boolean));
  return urls;
}

// Module-level cache so we only ever kick off one network fetch per URL across
// the whole presentation lifetime, even as slides change repeatedly.
const warmed = new Set<string>();

// Warms the given image URLs in the background by constructing detached Image
// objects. The browser caches the bytes, so when the slide later mounts its
// <img> the pixels are already decoded and there is no load-in lag.
export function preloadImages(urls: Iterable<string>): void {
  for (const url of urls) {
    if (!url || warmed.has(url)) continue;
    warmed.add(url);
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
  }
}
