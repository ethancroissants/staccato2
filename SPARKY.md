# Staccato — project notes

## Tech
- Vite + Svelte 5 (runes: $state, $derived, $props, $effect, snippets)
- Tone.js for brass-like audio synth (no samples; sawtooth + bandpass + reverb + noise transient)
- Pure SVG staff renderer (`c4Y` + diatonic step formula handles all 7 clefs)
- Hash-based router (no svelte-spa-router dep)
- localStorage-backed persisted stores

## Layout
- `staccato/src/App.svelte` — root + router
- `staccato/src/lib/views/` — Intro, Dashboard, Notation, LessonRunner, QuizRunner, Fingering, Settings
- `staccato/src/lib/data/` — clefs.js, instruments.js, lessons.js (pure data, easy to extend)
- `staccato/src/lib/components/` — Staff, InstrumentVisual, Button, Modal, ProgressBar
- `staccato/src/lib/audio/synth.js` — Tone.js-based brass voice

## Design constraints
- Spark Family palette (#FF5B14 etc.) is in `app.css :root` CSS variables
- Bundle must stay under 500 KB. Tone.js biggest chunk ~245 KB. Total ~380 KB JS + 24 KB CSS ✓
- Tunnels (Cloudflare) need `allowedHosts: true` in vite.config ✓
- Audio context: started lazily on first user gesture (Tone.start())

## Conventions
- snake-cased file names for data, PascalCase for components, camelCase for stores
- "spn" = scientific pitch notation string e.g. "C4", "F#5"
- "y" position on staff = step from bottom line; treble c4Y is -2, bass is +10, alto +4, etc.
