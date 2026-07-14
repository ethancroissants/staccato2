// User profile & score store. Tracks onboarding state, points, streaks, per-clef progress.
import { persisted } from './persisted.js';

const initial = {
  onboarded: false,
  introQuizResults: null,
  recommendedClef: 'treble',
  recommendedPath: 'notation',
  points: 0,
  streak: 0,
  bestStreak: 0,
  lessonsCompleted: [], // lesson ids
  notesLearned: [], // spns the user has answered correctly at least once
  achievements: [],
};

export const user = persisted('staccato.user.v1', initial);

export function addPoints(amount) {
  user.update((u) => ({
    ...u,
    points: u.points + amount,
    streak: u.streak + 1,
    bestStreak: Math.max(u.bestStreak, u.streak + 1),
  }));
}

export function loseStreak() {
  user.update((u) => ({ ...u, streak: 0 }));
}

export function markLessonComplete(lessonId) {
  user.update((u) =>
    u.lessonsCompleted.includes(lessonId)
      ? u
      : { ...u, lessonsCompleted: [...u.lessonsCompleted, lessonId] }
  );
}

export function markNoteLearned(spn) {
  user.update((u) =>
    u.notesLearned.includes(spn) ? u : { ...u, notesLearned: [...u.notesLearned, spn] }
  );
}

export function completeOnboarding({ recommendedClef, recommendedPath, results }) {
  user.update((u) => ({
    ...u,
    onboarded: true,
    introQuizResults: results,
    recommendedClef,
    recommendedPath,
  }));
}

export function resetUser() {
  user.set(initial);
}
