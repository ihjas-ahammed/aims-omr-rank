# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AIMS Plus Lab is a React application for evaluating OMR (Optical Mark Recognition) sheets using Google's Gemini AI. It processes exam answer sheets, extracts student names and answers, calculates scores, and generates ranklists with topic-wise analysis.

## Commands

```bash
npm install        # Install dependencies
npm run dev        # Start dev server on port 3000
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # TypeScript type checking
```

**Environment:** Requires `GEMINI_API_KEY` in `.env.local` for AI features.

## Architecture

### State Management
App.tsx is the central state hub. All application state lives here and is passed down to child components. Settings are persisted to localStorage.

### View Routing
The app uses a `ViewState` type to manage navigation between different views (home, lab, ranklist, detail, lab-course-progress, lab-timetable, lab-atr-list, lab-qp-maker, exam-*, study-progress-*, improvement-*, aims-present-*, etc.). URL paths are synced via `window.history.pushState`.

### Services Layer
- `src/services/geminiService.ts` - All Gemini API interactions: OMR evaluation (`evaluateOMR`/`evaluateOMRBatch`), name correction (`correctNamesBatch`), text extraction, auto-crop
- `src/services/db.ts` - IndexedDB wrapper for image persistence across two stores: `images` (OMR sheets) and `student-images`
- `src/services/firebaseService.ts` - Firebase integration for exams, study progress, and cloud sessions
- `src/services/studyProgressService.ts` - Service managing study progress tracking, box checkpoints, and statistics calculation

### Utils
- `src/utils/topicParser.ts` - Parses markdown-formatted topic mapping into `Chapter[]`/`Topic[]` structures
- `src/utils/imageProcessing.ts` - Image manipulation: base64 encoding, cropping, rotation
- `src/utils/fileUtils.ts` - File ↔ dataURL conversions
- `src/utils/cropUtils.ts` - Crop coordinate utilities

### Components
Key components include `Lab`, `RankList`, `StudentDetail`, `ReviewModal`, and feature-specific components under `src/components/lab/` (course-progress, timetable, atr-list, qp-maker, online-exams, study-progress, fee-logger, cloud-sessions, descriptive, aims-present, score-analysis, improvement).

### OMR Processing Flow
1. Images uploaded and stored in IndexedDB
2. Optional auto-crop via Gemini lite model
3. Batch evaluation via Gemini with configurable sampling (multiple attempts for consensus)
4. Names corrected against attendance sheet
5. Results exported as CSV or reviewed in modal

### Multi-Key Concurrency
The app supports multiple API keys with rotation (`getNextKey`). Concurrency is configurable: `baseConcurrency × requestsPerKey × numKeys` total parallel requests. Sampling runs verification passes beyond the initial attempts.

### Key Types
- `OMRResult` - Evaluation output: `{ name, right, wrong, scores: q1-q25, confidence, confidences[], nameConfidence? }`
- `AutoCropResult` - Crop coordinates and rotation: `{ ymin, xmin, ymax, xmax, rotation }`

## Study Day Posters (`src/components/lab/study-day-poster/`)

Canvas posters (800×1160 logical at 2×, Montserrat) with a page per cohort, routed via `ViewState` in `App.tsx`. Shared helpers live in `posterRenderer.ts` (`drawBackgroundAndCorners`, `layoutRichTextLines`/`drawRichTextLine` for `_`/`^` sub/superscripts) and `biology/biologyPosterRenderer.ts` (`rasteriseIcon`, `drawIconContain`, `setLetterSpacing`). Do not change the shared CS/Biology card code when restyling one poster; give it its own renderer. Deploy with `~/.claude/skills/study-day/scripts/deploy_all.sh [/route]` (three hosting sites); no Firestore writes.

- **FYUG** (`fyug/`, `/fyug-timetable`, `/fyug-timetable/topics`): timetable poster with future-events footer and a syllabus progress bar. Topics tab (`FyugTopics.tsx`, syllabus from STUDY-PLAN-V6 in `syllabus.ts`) has a per-unit percentage slider (step 5); total progress is computed from the sliders (`progress.ts`, localStorage, old array format migrated). Special timetable editor (`FyugDayEditor.tsx`, `specialDays.ts`, localStorage `fyug-special-days-v1`, "Practicals only" preset, max 8 hours) overrides a day's slots. The renderer shrinks titles/teacher lines and keeps minimum padding; the page is optimised for mobile.
- **Plus Two** (`plus-two-phy/`, `/study-day-posters/plus-two-phy3`): one subject per week. Data is in `phyData.ts` (Physics 09–15 Nov 2026) and `mathData.ts` (Mathematics 16–22 Nov 2026, from the PDF), unified in `plusTwoData.ts` (`PLUS_TWO_CYCLES`, `getPlusTwoDay`). Own renderer `plusTwoPosterRenderer.ts`: logo + subject, navy date panel (Physics has a lightning badge, Mathematics none), Mon–Sun week strip, chapter cards (Monday has two), exam day card. No "tomorrow" footer. Single-chapter days get a shorter canvas (the renderer sets the canvas size and returns the height). Topic names carry no bracketed terms. Icons: `phyIcons.ts`, `mathIcons.ts`.

## Note Checking (`src/components/lab/note-checking/`, `/note-checking`, password gate)

Data in Realtime Database `note_checking/{enrollNumber}` = `{name, batch, updatedAt, chapters/{chapterId}: {done, at, partial?}}`; students come from `attendance/by_student` (primary), `attendance/users`, then `note_checking` itself (`noteCheckingService.ts`). The page does one read of all ticks and derives everything client-side.

- **Subject-wise classification:** a chapter is "expected" when more than half of the batch's checked students (those with at least one tick) completed it. A student's missing chapters = expected and not done. Subject status: green none missing, yellow up to half missing, red more than half. Batch list has subject buttons with incomplete counts, an "incomplete only" filter, per-subject chips, and a missing-chapters line.
- **Batch print:** portrait A4, exactly 50 students per page, one line each: progress bar, done/total, missing chapter numbers as ranges (✓ when none), overall Done and last tick. Prints the current filter. The single-student print is unchanged.
- **Partial check mode:** switch inside a student; tapping marks a chapter `partial: true` (not done, still counts as incomplete). "Partial checks" tab lists students by the day marked (for notes submitted after leave) and can be printed.

## Backups

Full Realtime Database exports go in `backups/` (gitignored, contains student data): `curl "https://aims-plus-evaluation-default-rtdb.asia-southeast1.firebasedatabase.app/.json?print=pretty"`. Latest: `backups/rtdb_aims-plus-evaluation_2026-11-15_075208.json` (41 MB, 15 top-level nodes), taken before the attendance name-sync work. Firestore is not included. RTDB rules are open (`.read`/`.write` true), so take a backup before any bulk write.
