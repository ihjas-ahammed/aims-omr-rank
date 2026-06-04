# Aims Presenter — Design

**Date:** 2026-06-04
**Status:** Approved for planning

## Overview

A new Lab tool that lets one device (the **control** screen) drive slides shown
live on any number of other devices (the **view** screens), like real-time
streaming. Each presentation is addressed by an ID, so many independent
presentations can run at once.

Two slide types ship initially: `text` (a single large centered text box) and
`image` (an externally-hosted image URL).

## Decisions (from brainstorming)

- **Realtime sync:** Firestore `onSnapshot` (push-based). No polling. The view
  screen subscribes and re-renders the instant the control screen writes.
- **Image storage:** External image URL only. The user pastes a URL; nothing is
  uploaded. Keeps presentation docs tiny and realtime updates cheap.
- **Access:** Open by ID, no auth — same model as the existing online-exams
  (`?examId=`).
- **Entry point:** A dashboard listing presentations, reached from a Lab tile.
- **Text slide:** Plain text, one box, rendered centered and large. No markdown.
- **Control features:** add / delete / reorder / inline-edit slides, plus a live
  preview of the current view screen.
- **Reorder:** Both native HTML5 drag-and-drop AND up/down arrow buttons. No new
  dependency (project has no drag library).
- **View screen:** Full-screen, chrome-less, black background.

## Data Model

Firestore collection `presentations`, one document per presentation.

```ts
interface Slide {
  id: string;                    // uuid (crypto.randomUUID())
  type: 'text' | 'image';
  text?: string;                 // text slides
  imageUrl?: string;             // image slides (external URL)
}

interface Presentation {
  id?: string;
  title: string;
  slides: Slide[];
  activeSlideId: string | null;  // the slide viewers currently see
  createdAt: any;                // serverTimestamp
  updatedAt: any;                // serverTimestamp
}
```

Whole-document model: the control screen patches the doc on every change via
`updateDoc`/`setDoc(merge)`; the view screen receives the full `slides` array and
`activeSlideId` on each snapshot. Docs stay small (text + URLs only), so this is
cheap and simple. No subcollections.

## Routes

Parsed in `App.tsx` exactly like the existing `examId` / `/course-progress`
checks (path-based, `pushState` + `popstate`).

- `/aims-present` — dashboard (list / create / delete). Reached via the Lab tile.
- `/aims-present/control/:id` — control screen. Full page, no Lab chrome.
- `/aims-present/view/:id` — view screen. Fullscreen black, active slide only.

`App.tsx` detects a `/aims-present/...` path early and renders the standalone
component **before** the normal Lab shell — the same way `view === 'exam-take'`
short-circuits today. The `:id` segment is parsed from `window.location.pathname`.

A new `ViewState` member `lab-aims-present` covers the dashboard inside the Lab
shell; control and view render standalone via path detection.

## Components

New folder `src/components/lab/aims-present/`:

- **`types.ts`** — `Slide`, `Presentation`, `SlideType` (re-exported from the
  service or defined here and imported by the service; service is the source of
  truth).
- **`SlideView.tsx`** — pure renderer for one slide. `text` → big centered text;
  `image` → `<img>` contained within the viewport. Takes a `slide` prop and an
  optional `scale`/`preview` flag. Shared by the view screen and the control's
  live preview so they never drift.
- **`PresentView.tsx`** — subscribes via `subscribePresentation(id, cb)`,
  renders the active slide fullscreen on black. Shows a neutral placeholder when
  there is no active slide. Unsubscribes on unmount.
- **`PresentControl.tsx`** — left: slide list with drag-and-drop reorder +
  up/down buttons + add (text/image) + delete + inline edit (textarea for text,
  URL input for image). Right/main: next/prev navigation, "Set as active"
  control, current active indicator, a **live preview** (reuses `SlideView`), and
  a "Copy view link" button. All edits write through the service.
- **`PresentDashboard.tsx`** — lists presentations (newest first), "New
  presentation" (creates a doc, navigates to its control page), open control,
  copy view link, delete. Modeled on `ExamDashboard`.
- **`index.ts`** — barrel exports.

## Service Layer

Extend `src/services/firebaseService.ts`:

```ts
export interface Slide { ... }
export interface Presentation { ... }

createPresentation(title: string): Promise<string>
getPresentation(id: string): Promise<Presentation>
subscribePresentation(id: string, cb: (p: Presentation | null) => void): () => void  // wraps onSnapshot, returns unsubscribe
updatePresentation(id: string, patch: Partial<Presentation>): Promise<void>          // setDoc(merge) + updatedAt
listPresentations(): Promise<Presentation[]>                                          // ordered by createdAt desc
deletePresentation(id: string): Promise<void>
```

`subscribePresentation` is the only new realtime primitive; everything else mirrors
the existing exam/app-data helpers. Import `onSnapshot` from `firebase/firestore`.

## Lab Integration

Add an "Aims Presenter" tile to `src/components/Lab.tsx` (lucide `Presentation`
icon, a distinct color e.g. violet). Clicking it does
`window.history.pushState({}, '', '/aims-present')` and `onNavigate('lab-aims-present')`.
Extend the `LabProps.onNavigate` union and the `ViewState` type accordingly, and
add the render branch + popstate handling in `App.tsx`.

## Data Flow

1. Control screen mutates slides/active → `updatePresentation` writes the doc.
2. Firestore pushes the change to every subscribed view screen via `onSnapshot`.
3. `SlideView` renders the active slide identically on view screens and in the
   control's live preview.

## Error Handling

- Firebase not configured (`isFirebaseConfigured` false): dashboard/control show
  the same "Firebase is not configured" message used elsewhere; view screen shows
  a centered error.
- Presentation not found / deleted while open: view screen shows "Presentation
  not found"; control redirects to the dashboard.
- Broken image URL: `<img onError>` shows a fallback "image failed to load"
  state instead of a broken icon.
- `activeSlideId` pointing at a deleted slide: treated as "no active slide".

## Testing

- Manual cross-device test: open control in one tab/device and view in two
  others; confirm next/prev/set-active propagate within ~instant.
- Reorder via both drag-and-drop and arrow buttons persists and reflects on view.
- Add/delete/edit text and image slides propagate live.
- View screen survives the active slide being deleted, and the presentation being
  deleted, without crashing.
- `npm run lint` (tsc) passes.

## Out of Scope (YAGNI)

- Slide transitions/animations, themes, speaker notes.
- Image upload / hosting (URL only by decision).
- Auth/permissions on control.
- Slide types beyond text and image (the renderer is a `switch` on `type`, so
  adding more later is localized to `SlideView` + the control's add menu).
