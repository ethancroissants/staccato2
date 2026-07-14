# Staccato 🎵

A friendly music education app — learn to read music on the staff and to finger brass
instruments, all in the browser. Built with **Svelte 5 (runes)** and **Tone.js**.

> "An expert Svelte 6 developer and UI/UX designer..." — that's the brief. We kept
> the same shape with Svelte 5's runes API and didn't ship any audio samples, so
> the whole experience stays under 400 KB.

## What's in here

- **Music Notation Learner** — interactive lessons for all 7 clefs (treble, bass,
  alto, tenor, soprano, mezzo-soprano, baritone). Tap notes on the staff to hear
  them; take randomized multiple-choice quizzes.
- **Fingering Trainer** — supports **trumpet, french horn, tuba** (valves) and
  **trombone** (slide). Press keyboard keys `1`, `2`, `3` to play real notes
  through a brassy Tone.js synth.
- **Three practice modes** per instrument: **Free Play** (just explore), **Learn**
  (show a note, you play it), **Association** (drill fingering ↔ note).
- **Onboarding intro quiz** — 6 friendly questions that pick a starting clef and
  recommend a module based on what you say you already know.
- **Personalized dashboard** — shows your points, streak, notes-learned, and a
  daily-review prompt.
- **Persistent progress** stored in localStorage. No backend.
- **Zero-knowledge defaults** — every term gets explained the first time it
  appears. Plain language, no jargon.
- **Spark color system** — the hand-crafted "Spark Family" palette
  (`#FF5B14`, `#E0470A`, `#FF7A2D`, `#FB8B00`, `#F59E0B`, `#C2410C`,
  `#FFEDE0`, `#FFFDF9`, `#FBF5EC`, `#FFF`, `#17120E`, `#443B33`, `#8A7E72`,
  `#B6ABA0`) is applied through CSS variables, with semantic colors for
  success / danger / warning / info.
- **Responsive** mobile-first layout — works on phone, tablet, desktop.
- **Accessible** — keyboard navigation, focus rings, screen-reader-friendly
  semantics, `prefers-reduced-motion` honored, optional high-contrast mode.

## Project layout

```
staccato/
├── src/
│   ├── app.css                       — Spark color system + base styles
│   ├── App.svelte                    — root + tiny hash-based router
│   ├── main.js                       — mount point
│   └── lib/
│       ├── data/
│       │   ├── clefs.js              — clef definitions + staff math
│       │   ├── instruments.js        — trumpet/horn/tuba/trombone fingerings
│       │   └── lessons.js            — intro quiz + per-clef lesson catalog
│       ├── stores/
│       │   ├── persisted.js          — localStorage-backed writable()
│       │   ├── router.js             — hash-based router
│       │   ├── settings.js           — user settings
│       │   └── user.js               — onboarding, points, streaks
│       ├── audio/synth.js            — Tone.js brass-like voice
│       ├── components/
│       │   ├── Button.svelte
│       │   ├── InstrumentVisual.svelte
│       │   ├── Modal.svelte
│       │   ├── ProgressBar.svelte
│       │   └── Staff.svelte          — pure-SVG staff renderer
│       └── views/
│           ├── Intro.svelte          — onboarding + 6-question quiz
│           ├── Dashboard.svelte
│           ├── Notation.svelte       — module landing
│           ├── LessonRunner.svelte   — tour / quiz lesson runner
│           ├── QuizRunner.svelte     — ad-hoc randomized quiz
│           ├── Fingering.svelte      — combined fingering modes
│           └── Settings.svelte
├── public/favicon.svg
├── index.html
├── vite.config.js                    — allowedHosts: true for tunnel previews
├── package.json
└── README.md
```

## Local development

```bash
cd staccato
npm install         # only first time
npm run dev         # http://localhost:5173
```

For a production build:

```bash
npm run build
npm run preview
```

The bundled JS is **349 KB** unminified / 107 KB gzipped. CSS is **23 KB**.
That leaves plenty of headroom under the 500 KB cap from the brief.

## How to use the app

1. **First launch** — a welcome card and a 6-question quiz. We use the answers
   to pick a starting clef and recommend a module.
2. **Dashboard** — your home base: points, streak, the next lesson, plus links
   into both modules and a daily review quiz.
3. **Notation module**:
   - Pick clefs and difficulty (natural, sharps, flats, all).
   - Try the *tour* lessons to learn the staff, then take the *recap quiz*.
   - Or skip to the random quiz for a 10-question drill.
4. **Fingering module**:
   - Pick an instrument. For **trumpet / horn / tuba** the keys `1/2/3` map
     to the three valves.
   - For **trombone** the same keys step the slide between three rough
     positions (`1`=close / `2`=middle / `3`=far). Real slide positions are
     still shown in the chart.
   - Switch between **Free Play**, **Learn** (note is shown, you play it) and
     **Association** (note + fingering side by side).

## Keyboard shortcuts (Fingering Trainer)

- `1` / `2` / `3` — press valves (or step slide)
- release the keys to return to "open"
- `P` — replay the currently held note

## Notes on the implementation

- **No audio samples.** We synthesise a brassy tone with a `Tone.PolySynth`
  (sawtooth wave + bandpass filter + light distortion + reverb + a short
  noise transient for the "tongue"). Keeps the bundle under the cap.
- **Staff math.** `clefs.js` defines `c4Y` per clef — the staff-line index
  that holds middle C. The y-position of any note on a given staff is then
  `(octave-4)*7 + diatonicIndex + c4Y`. Treble's `c4Y` is `-2`, bass is `+10`,
  alto is `+4`, etc. This means the entire renderer is one small helper
  function rather than per-clef tables.
- **Svelte 5 runes throughout** (`$state`, `$derived`, `$props`, `$effect`,
  snippets like `{#snippet footer()}`).
- **No external router** — the app's URL schema (`#/dashboard`, `#/notation/lesson/...`)
  uses a 50-line store I wrote.

## Accessibility notes

- All interactive elements are buttons or links, never opaque divs.
- The h1 / h2 / h3 hierarchy stays consistent.
- Color contrast: the Spark palette was picked with WCAG AA in mind for body text.
- The optional `high-contrast` mode (Settings → Accessibility) deepens the ink
  colors further.
- Animation pauses under `prefers-reduced-motion`.
- Focus rings are visible via the global `:focus-visible` style.

## Resetting progress

Settings → **Reset everything…** wipes localStorage. You'll go back through the
intro quiz on the next visit.
