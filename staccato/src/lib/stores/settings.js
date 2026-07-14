// Settings: chosen clef(s) for notation practice, difficulty, instrument id.
import { persisted } from './persisted.js';

const initial = {
  notationClefs: ['treble'],
  notationDifficulty: 'natural', // 'natural' | 'sharps' | 'flats' | 'all'
  notationIncludeAccidentals: false,
  fingeringInstrument: 'trumpet',
  fingeringMode: 'free', // 'free' | 'learn' | 'association'
  soundEnabled: true,
  highContrast: false,
};

export const settings = persisted('staccato.settings.v1', initial);

export function setNotationClefs(clefs) {
  settings.update((s) => ({ ...s, notationClefs: clefs }));
}

export function setNotationDifficulty(level) {
  settings.update((s) => ({ ...s, notationDifficulty: level }));
}

export function setFingeringInstrument(id) {
  settings.update((s) => ({ ...s, fingeringInstrument: id }));
}

export function setFingeringMode(mode) {
  settings.update((s) => ({ ...s, fingeringMode: mode }));
}

export function resetSettings() {
  settings.set(initial);
}
