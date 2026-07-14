// Clef definitions. Each clef is described by:
// - id, label, friendly name
// - c4Y: which vertical staff position (line/space) holds middle C (C4)
// - colors / accents
// - sign: a small character used in the clef character card

export const CLEFS = [
  {
    id: 'treble',
    label: 'Treble',
    name: 'Treble Clef',
    symbol: '𝄞',
    description:
      "The most common clef. Used for most higher-pitched instruments and the right hand of the piano. The curly spiral curls around the second line, anchoring it to G4 ('Every Good Boy Deserves Fudge').",
    c4Y: -2,
    rangeTop: 'A5', // practical training range
    rangeBottom: 'C4',
  },
  {
    id: 'bass',
    label: 'Bass',
    name: 'Bass Clef',
    symbol: '𝄢',
    description:
      "Used for lower-pitched instruments like the bass guitar, tuba, and the left hand of the piano. The two dots flank the F line ('Good Boys Do Fine Always').",
    c4Y: 10,
    rangeTop: 'C5',
    rangeBottom: 'E2',
  },
  {
    id: 'alto',
    label: 'Alto',
    name: 'Alto Clef',
    symbol: '𝄡',
    description:
      "Centered on middle C. Frequently used for the viola. The center of the symbol marks the middle line as C4.",
    c4Y: 4,
    rangeTop: 'G4',
    rangeBottom: 'F3',
  },
  {
    id: 'tenor',
    label: 'Tenor',
    name: 'Tenor Clef',
    symbol: '𝄡',
    description:
      "Common for the upper ranges of the cello, bassoon, and trombone. Middle C sits on the fourth line from the bottom.",
    c4Y: 6,
    rangeTop: 'E5',
    rangeBottom: 'D3',
  },
  {
    id: 'soprano',
    label: 'Soprano',
    name: 'Soprano Clef',
    symbol: '𝄡',
    description:
      "Used historically and in some choral scores. Middle C sits on the bottom line of the staff.",
    c4Y: 0,
    rangeTop: 'G5',
    rangeBottom: 'B3',
  },
  {
    id: 'mezzo',
    label: 'Mezzo-soprano',
    name: 'Mezzo-soprano Clef',
    symbol: '𝄡',
    description:
      "Middle C is on the second line from the bottom. Often seen in choral and early music notation.",
    c4Y: 2,
    rangeTop: 'C5',
    rangeBottom: 'A3',
  },
  {
    id: 'baritone',
    label: 'Baritone',
    name: 'Baritone Clef',
    symbol: '𝄢',
    description:
      "Middle C is on the top line of the staff. Used for baritone voice and historically for low instruments.",
    c4Y: 8,
    rangeTop: 'D5',
    rangeBottom: 'B2',
  },
];

// Diatonic notes (within an octave). Used to step from C upward.
export const DIATONIC = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

// Given a clef and an integer "y" position on the staff (where lines 0..4 are the
// five staff lines and intermediate odd numbers are the spaces between), plus
// ledger positions below 0 and above 8, return the note name and octave.
//
// Step = y - c4Y. C4 = step 0. Each step up or down advances one diatonic note.
// When the step crosses 0 or 7 going up (or 0/-7 going down), the octave changes.
export function noteAtY(clef, y) {
  const step = y - clef.c4Y; // 0 means C4
  const octave = 4 + Math.floor(step / 7);
  let withinOctave = step % 7;
  if (withinOctave < 0) withinOctave += 7;
  return { name: DIATONIC[withinOctave], octave, accidental: '' };
}

// Convert a note name + accidental + octave back to a staff y for a clef.
export function yForNote(clef, name, octave = 4, accidental = '') {
  // C = 0, D = 1, ..., B = 6
  const diatonicIndex = DIATONIC.indexOf(name);
  const stepFromC4 = (octave - 4) * 7 + diatonicIndex;
  return stepFromC4 + clef.c4Y;
}

// Scientific pitch notation (e.g. "C4", "F#5", "Bb3") — used by audio engine.
export function spn({ name, octave, accidental }) {
  return `${name}${accidental || ''}${octave}`;
}

// MIDI number from SPN (e.g. "C4" -> 60). Sharps/flats handled.
const ACCIDENTAL_OFFSET = { '#': 1, '': 0, 'b': -1 };

export function midiFromSpn(pitch) {
  const m = pitch.match(/^([A-G])(#|b)?(-?\d+)$/);
  if (!m) return null;
  const [, name, acc = '', octStr] = m;
  const octave = parseInt(octStr, 10);
  const base = DIATONIC.indexOf(name);
  // C-1 = 0 in some conventions; here we use C0 = 12, so C4 = 60.
  return 12 * (octave + 1) + base + (ACCIDENTAL_OFFSET[acc] || 0);
}

// All natural-note SPNs across a clef's training range, with their y positions.
export function notesInClefRange(clef) {
  const all = [];
  for (let y = -8; y <= 16; y++) {
    const { name, octave } = noteAtY(clef, y);
    if (octave < 1 || octave > 6) continue;
    all.push({ name, octave, y, spn: `${name}${octave}` });
  }
  return all;
}

// Convenient list of SPN pitches (chromatic) for our training.
export const CHROMATIC = [
  'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4',
  'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5', 'B5',
  'C6',
];
