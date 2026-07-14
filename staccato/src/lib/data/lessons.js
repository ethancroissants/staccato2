// Lesson content for the Music Notation Learner.
// Lessons are grouped by clef. The intro quiz assigns a starting clef.

import { CLEFS, notesInClefRange, yForNote } from './clefs.js';

function buildNotationLessons() {
  const lessons = [];

  for (const clef of CLEFS) {
    const range = notesInClefRange(clef).filter((n) => {
      return n.spn >= clef.rangeBottom && n.spn <= clef.rangeTop;
    });

    const lowerHalf = range.slice(0, Math.ceil(range.length / 2));
    const upperHalf = range.slice(Math.ceil(range.length / 2));

    // Lesson 1: tour of the staff — show several anchor notes
    lessons.push({
      id: `${clef.id}-tour`,
      clef: clef.id,
      title: `Reading the ${clef.name}`,
      blurb:
        clef.description +
        '\n\nTap each note name to hear it and see how it sits on the staff. We will start with the basic natural notes.',
      type: 'tour',
      notes: lowerHalf.slice(0, 8),
    });

    // Lesson 2: lines only
    const lines = range.filter((n) => n.y % 2 === 0 && n.y >= 0 && n.y <= 8);
    lessons.push({
      id: `${clef.id}-lines`,
      clef: clef.id,
      title: `Lines on the ${clef.label} staff`,
      blurb:
        'The five horizontal lines of the staff each hold a note. Look closely at the position — every line is one diatonic step above the next.',
      type: 'tour',
      notes: lines,
    });

    // Lesson 3: spaces only
    const spaces = range.filter((n) => n.y % 2 === 1 && n.y >= 1 && n.y <= 7);
    lessons.push({
      id: `${clef.id}-spaces`,
      clef: clef.id,
      title: `Spaces on the ${clef.label} staff`,
      blurb:
        'Each space sits between two lines. Together the spaces spell out every other note of the diatonic scale.',
      type: 'tour',
      notes: spaces,
    });

    // Lesson 4: ledger lines
    const ledgers = range.filter((n) => n.y < 0 || n.y > 8);
    lessons.push({
      id: `${clef.id}-ledgers`,
      clef: clef.id,
      title: `Ledger lines on the ${clef.label} staff`,
      blurb:
        "When notes go above or below the staff we draw short extra lines, called ledger lines. They're just temporary anchors for notes outside the staff.",
      type: 'tour',
      notes: ledgers.length ? ledgers : range.filter((n) => n.y === 0 || n.y === 8),
    });

    // Lesson 5: upper half of staff
    lessons.push({
      id: `${clef.id}-upper`,
      clef: clef.id,
      title: `Upper register on the ${clef.label} staff`,
      blurb:
        "Now we'll cover the higher notes in this clef. These are commonly encountered as you move up the range of your instrument.",
      type: 'tour',
      notes: upperHalf,
    });

    // Lesson 6: recap & spillover quiz
    lessons.push({
      id: `${clef.id}-recap`,
      clef: clef.id,
      title: `${clef.label} recap quiz`,
      blurb: "Time to put it together. I'll show notes — you name them.",
      type: 'quiz',
      notes: range.slice(),
    });
  }
  return lessons;
}

export const NOTATION_LESSONS = buildNotationLessons();

export function lessonsByClef(clefId) {
  return NOTATION_LESSONS.filter((l) => l.clef === clefId);
}

// A small set of intro quiz questions used at first launch.
export const INTRO_QUIZ = [
  {
    id: 'never-read-music',
    type: 'binary',
    question: 'Have you ever read sheet music before?',
    options: [
      { label: 'No, never', score: 0 },
      { label: 'Yes, sometimes', score: 1 },
    ],
  },
  {
    id: 'treble-clef',
    type: 'multiple-choice',
    question: 'Which of these describes a treble clef?',
    options: [
      { label: 'Two dots around the F line', score: 0, correct: false },
      { label: "A swirl that curls around the G line", score: 1, correct: true },
      { label: 'A square box with a tail', score: 0, correct: false },
    ],
  },
  {
    id: 'middle-c',
    type: 'multiple-choice',
    question: 'On a piano, middle C is the note…',
    options: [
      { label: 'Right in the middle of the keyboard', score: 1, correct: true },
      { label: 'Either the lowest or highest C', score: 0, correct: false },
      { label: 'A C below the piano entirely', score: 0, correct: false },
    ],
  },
  {
    id: 'sharp-flat',
    type: 'multiple-choice',
    question: 'A sharp (♯) tells us to…',
    options: [
      { label: 'Make the note quieter', score: 0, correct: false },
      { label: 'Raise the note by a half step', score: 1, correct: true },
      { label: 'Hold the note longer', score: 0, correct: false },
    ],
  },
  {
    id: 'brass-q',
    type: 'multiple-choice',
    question: 'Which of these is a brass instrument?',
    options: [
      { label: 'Violin', score: 0, correct: false },
      { label: 'Trumpet', score: 1, correct: true },
      { label: 'Flute', score: 0, correct: false },
    ],
  },
  {
    id: 'goal',
    type: 'multiple-choice',
    question: 'What would you most like to learn?',
    options: [
      { label: 'Reading notes on a staff', score: 2, tag: 'notation' },
      { label: 'Fingering my brass instrument', score: 2, tag: 'fingering' },
      { label: 'A bit of both', score: 1, tag: 'both' },
    ],
  },
];
