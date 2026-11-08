import { POSTER_H, POSTER_SCALE, POSTER_W, drawBackgroundAndCorners } from '../posterRenderer';
import { drawStudyHeader, rasteriseIcon, type IconImage } from '../biology/biologyPosterRenderer';
import { drawChapter, drawExam } from '../cs/csPosterRenderer';
import { PHY_HERO, PHY_ICONS } from './phyIcons';
import type { PhyDay } from './phyData';

export interface PhyAssets {
  logo: HTMLImageElement | null;
  icons: Record<string, IconImage>;
}

export async function loadPhyIcons(): Promise<Record<string, IconImage>> {
  const entries: [string, { viewBox: string; svg: string }][] = [...Object.entries(PHY_ICONS), ['phy_hero', PHY_HERO]];
  const loaded = await Promise.all(entries.map(([, i]) => rasteriseIcon(i.viewBox, i.svg)));
  return Object.fromEntries(entries.map(([k], i) => [k, loaded[i]]));
}

export interface PhyRenderOptions {
  date: Date;
  day: PhyDay;
  assets: PhyAssets;
}

// Same AIMS PLUS poster design as the Plus One pages: logo, date row, subtitle bar, one chapter card.
export function renderPhyPoster(canvas: HTMLCanvasElement, { date, day, assets }: PhyRenderOptions) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.save();
  ctx.setTransform(POSTER_SCALE, 0, 0, POSTER_SCALE, 0, 0);
  ctx.clearRect(0, 0, POSTER_W, POSTER_H);

  drawBackgroundAndCorners(ctx, POSTER_W, POSTER_H, 'corners_physics');

  const subtitle =
    'topics' in day ? `PLUS TWO PHYSICS  •  DAY ${String(day.dayNo).padStart(2, '0')}` : 'PLUS TWO  •  PHYSICS';
  drawStudyHeader(ctx, { date, logo: assets.logo, hero: assets.icons.phy_hero, subtitle });

  const top = 408;
  const bottom = 1100;
  if ('topics' in day) drawChapter(ctx, day, assets.icons, top, bottom - top);
  else drawExam(ctx, day.label, assets.icons, top, bottom - top, 'phy_exam');

  ctx.restore();
}
