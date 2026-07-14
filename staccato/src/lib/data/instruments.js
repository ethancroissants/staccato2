// Brass instrument definitions and fingering charts.
//
// Each instrument declares:
//   id, name, icon (emoji placeholder — keeps bundle small)
//   kind: 'valve' (tuba / trumpet / horn) or 'slide' (trombone)
//   valves: 3 means three finger keys; layout describes how to render them.
//   notes: array of fingering entries per pitch in SPN.
//     For 'valve' instruments, fingerings is a [n0,n1,n2,n3] array of 1/0.
//     For 'slide' instruments, fingerings is the slide position (1..7).

export const INSTRUMENTS = [
  {
    id: 'trumpet',
    name: 'Trumpet',
    kind: 'valve',
    clef: 'treble',
    transposition: 'Bb',
    blurb:
      "Three valves give eight fingering combinations. The same valve combinations repeat every octave, but the patterns you use day-to-day live mostly between G3 and C6.",
    // key mapping: numeric keys 1..3 for the three valves
    keys: ['1', '2', '3'],
    keyHint: 'Use the keys 1, 2 and 3 to press valves',
    notes: [
      { spn: 'F#3', valves: [0, 1, 1], label: '1-2-3' }, // pedal
      { spn: 'G3',  valves: [1, 1, 1], label: '1-2-3' },
      { spn: 'A3',  valves: [1, 1, 0], label: '1-2'   },
      { spn: 'B3',  valves: [1, 0, 0], label: '1'     },
      { spn: 'C4',  valves: [0, 1, 1], label: '2-3'   },
      { spn: 'D4',  valves: [1, 1, 0], label: '1-2'   },
      { spn: 'E4',  valves: [1, 0, 0], label: '1'     },
      { spn: 'F4',  valves: [0, 1, 1], label: '2-3'   },
      { spn: 'G4',  valves: [1, 1, 0], label: '1-2'   },
      { spn: 'A4',  valves: [1, 0, 0], label: '1'     },
      { spn: 'B4',  valves: [0, 1, 1], label: '2-3'   },
      { spn: 'C5',  valves: [0, 0, 0], label: 'open'  },
      { spn: 'D5',  valves: [1, 0, 1], label: '1-3'   },
      { spn: 'E5',  valves: [1, 0, 0], label: '1'     },
      { spn: 'F5',  valves: [0, 1, 1], label: '2-3'   },
      { spn: 'G5',  valves: [1, 1, 0], label: '1-2'   },
      { spn: 'A5',  valves: [1, 0, 0], label: '1'     },
      { spn: 'B5',  valves: [0, 1, 1], label: '2-3'   },
      { spn: 'C6',  valves: [1, 1, 1], label: '1-2-3' },
      { spn: 'D6',  valves: [1, 1, 0], label: '1-2'   },
    ],
  },
  {
    id: 'french-horn',
    name: 'French Horn',
    kind: 'valve',
    clef: 'treble',
    transposition: 'F',
    blurb:
      "Three rotary valves, same 1-2-3 pattern — but the horn is in F, so written notes sound a fifth lower. Mostly used in concert and band music.",
    keys: ['1', '2', '3'],
    keyHint: 'Use the keys 1, 2 and 3 to press valves',
    notes: [
      { spn: 'F3',  valves: [0, 1, 1], label: '2-3'   },
      { spn: 'G3',  valves: [1, 1, 0], label: '1-2'   },
      { spn: 'A3',  valves: [1, 0, 0], label: '1'     },
      { spn: 'B3',  valves: [0, 0, 0], label: 'open'  },
      { spn: 'C4',  valves: [0, 1, 1], label: '2-3'   },
      { spn: 'D4',  valves: [1, 1, 0], label: '1-2'   },
      { spn: 'E4',  valves: [1, 0, 0], label: '1'     },
      { spn: 'F4',  valves: [0, 0, 0], label: 'open'  },
      { spn: 'G4',  valves: [0, 1, 1], label: '2-3'   },
      { spn: 'A4',  valves: [1, 1, 0], label: '1-2'   },
      { spn: 'B4',  valves: [1, 0, 0], label: '1'     },
      { spn: 'C5',  valves: [0, 0, 0], label: 'open'  },
      { spn: 'D5',  valves: [0, 1, 1], label: '2-3'   },
      { spn: 'E5',  valves: [1, 1, 0], label: '1-2'   },
      { spn: 'F5',  valves: [1, 0, 0], label: '1'     },
      { spn: 'G5',  valves: [0, 0, 0], label: 'open'  },
    ],
  },
  {
    id: 'tuba',
    name: 'Tuba',
    kind: 'valve',
    clef: 'bass',
    transposition: 'Bb',
    blurb:
      "Three or four valves — large bore, deep sound. The same 1-2-3 valve pattern, but read in bass clef and with much lower pitches.",
    keys: ['1', '2', '3'],
    keyHint: 'Use the keys 1, 2 and 3 to press valves',
    notes: [
      { spn: 'D2',  valves: [1, 1, 0], label: '1-2'   },
      { spn: 'E2',  valves: [1, 0, 0], label: '1'     },
      { spn: 'F2',  valves: [0, 0, 0], label: 'open'  },
      { spn: 'G2',  valves: [0, 1, 1], label: '2-3'   },
      { spn: 'A2',  valves: [1, 1, 0], label: '1-2'   },
      { spn: 'B2',  valves: [1, 0, 0], label: '1'     },
      { spn: 'C3',  valves: [0, 0, 0], label: 'open'  },
      { spn: 'D3',  valves: [0, 1, 1], label: '2-3'   },
      { spn: 'E3',  valves: [1, 1, 0], label: '1-2'   },
      { spn: 'F3',  valves: [1, 0, 0], label: '1'     },
      { spn: 'G3',  valves: [0, 0, 0], label: 'open'  },
      { spn: 'A3',  valves: [1, 1, 1], label: '1-2-3' },
      { spn: 'B3',  valves: [1, 1, 0], label: '1-2'   },
      { spn: 'C4',  valves: [1, 0, 0], label: '1'     },
    ],
  },
  {
    id: 'trombone',
    name: 'Trombone',
    kind: 'slide',
    clef: 'bass',
    transposition: 'Bb',
    blurb:
      "No valves — instead a slide with seven positions. Position 1 is the shortest and position 7 is the longest; each position shifts the pitch down a half-step.",
    keys: ['1', '2', '3'],
    keyHint:
      "Keys 1, 2 and 3 step the slide in and out: 1→close, 2→middle, 3→far",
    notes: [
      // positions: array of slide positions that play the note.
      // For trombone, same pitch = same fingering, so this maps position->pitch.
      // We represent each pitch using multiple accessible positions where applicable.
      { spn: 'E2',  positions: [7] },
      { spn: 'F2',  positions: [6] },
      { spn: 'Gb2', positions: [6], accidental: true, label: 'F#2' },
      { spn: 'G2',  positions: [5] },
      { spn: 'A2',  positions: [4] },
      { spn: 'Bb2', positions: [3], accidental: true, label: 'B♭2' },
      { spn: 'B2',  positions: [3] },
      { spn: 'C3',  positions: [2] },
      { spn: 'D3',  positions: [1] },
      { spn: 'Eb3', positions: [1], accidental: true, label: 'E♭3' },
      { spn: 'E3',  positions: [7] },
      { spn: 'F3',  positions: [6] },
      { spn: 'G3',  positions: [5] },
      { spn: 'A3',  positions: [4] },
      { spn: 'B3',  positions: [3] },
      { spn: 'C4',  positions: [2] },
      { spn: 'D4',  positions: [1] },
      { spn: 'E4',  positions: [7] },
      { spn: 'F4',  positions: [6] },
      { spn: 'G4',  positions: [5] },
      { spn: 'A4',  positions: [4] },
      { spn: 'B4',  positions: [3] },
    ],
  },
];

export function instrumentById(id) {
  return INSTRUMENTS.find((i) => i.id === id);
}
