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
The app uses a `ViewState` type to manage navigation between different views (home, lab, ranklist, detail, lab-course-progress, lab-timetable, lab-atr-list, lab-qp-maker, exam-*, etc.). URL paths are synced via `window.history.pushState`.

### Services Layer
- `src/services/geminiService.ts` - All Gemini API interactions: OMR evaluation (`evaluateOMR`/`evaluateOMRBatch`), name correction (`correctNamesBatch`), text extraction, auto-crop
- `src/services/db.ts` - IndexedDB wrapper for image persistence across two stores: `images` (OMR sheets) and `student-images`
- `src/services/firebaseService.ts` - Firebase integration for exams

### Utils
- `src/utils/topicParser.ts` - Parses markdown-formatted topic mapping into `Chapter[]`/`Topic[]` structures
- `src/utils/imageProcessing.ts` - Image manipulation: base64 encoding, cropping, rotation
- `src/utils/fileUtils.ts` - File ↔ dataURL conversions
- `src/utils/cropUtils.ts` - Crop coordinate utilities

### Components
Key components include `Lab`, `RankList`, `StudentDetail`, `ReviewModal`, and feature-specific components under `src/components/lab/` (course-progress, timetable, atr-list, qp-maker, online-exams).

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
