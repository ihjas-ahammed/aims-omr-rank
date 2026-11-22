const STOP = new Set(['the', 'of', 'and', 'in', 'to', 'a', 'an', 'on', 'for', 'with', 'by', 'is', 'chapter', 'number', 'no']);
const PARTIAL_WORDS = new Set(['partial', 'partially', 'half', 'incomplete']);

const tokens = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);

// Spoken word matches a title word when equal, or one is a prefix (>= 4 letters) of the other
// (speech engines drop or add plural/-ing endings).
const same = (spoken: string, word: string) =>
  spoken === word || (spoken.length >= 4 && word.length >= 4 && (word.startsWith(spoken) || spoken.startsWith(word)));

export interface VoiceMatch {
  chapterId: string | null;
  partial: boolean;
  reason?: 'none' | 'ambiguous';
}

// Matches a spoken phrase to one chapter of the current subject. A phrase ending in "partial" marks it partial.
export function matchChapter(
  transcript: string,
  chapters: { id: string; number: number; title: string }[]
): VoiceMatch {
  const all = tokens(transcript);
  const partial = all.some(t => PARTIAL_WORDS.has(t));
  const spoken = all.filter(t => !PARTIAL_WORDS.has(t));

  // A bare number picks the chapter by its number.
  const nums = spoken.filter(t => /^\d+$/.test(t));
  const words = spoken.filter(t => !STOP.has(t) && !/^\d+$/.test(t));
  if (words.length === 0 && nums.length === 1) {
    const c = chapters.find(ch => ch.number === Number(nums[0]));
    return c ? { chapterId: c.id, partial } : { chapterId: null, partial, reason: 'none' };
  }
  if (words.length === 0) return { chapterId: null, partial, reason: 'none' };

  const scored = chapters
    .map(c => {
      const title = tokens(c.title).filter(t => !STOP.has(t));
      return { id: c.id, score: words.filter(w => title.some(t => same(w, t))).length };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) return { chapterId: null, partial, reason: 'none' };
  if (scored.length > 1 && scored[1].score === scored[0].score) return { chapterId: null, partial, reason: 'ambiguous' };
  return { chapterId: scored[0].id, partial };
}
