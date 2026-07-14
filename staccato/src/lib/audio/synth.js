// Brass-like audio synth using Tone.js.
//
// We synthesise a brassy tone with a PolySynth of sawtooth voices, processed
// through a band-pass filter and an amplitude envelope. A short noise burst at
// the start of each note gives the "tongue" of a brass attack.

import * as Tone from 'tone';
import { midiFromSpn } from '../data/clefs.js';

let started = false;

async function ensureAudio() {
  if (started) return;
  started = true;
  await Tone.start();
}

// Build the brass voice lazily so we don't initialise audio on page load.
let voice = null;
function getVoice() {
  if (voice) return voice;
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.04, decay: 0.2, sustain: 0.4, release: 0.18 },
    volume: -8,
  });
  const filter = new Tone.Filter({ type: 'bandpass', frequency: 1200, Q: 2 });
  const distortion = new Tone.Distortion({ distortion: 0.12, oversample: '2x' });
  const reverb = new Tone.Reverb({ decay: 1.2, wet: 0.18 });
  synth.connect(filter);
  filter.connect(distortion);
  distortion.connect(reverb);
  reverb.toDestination();

  const noise = new Tone.Noise({ type: 'pink', volume: -28 });
  const noiseAmp = new Tone.AmplitudeEnvelope({
    attack: 0.001,
    decay: 0.05,
    sustain: 0,
    release: 0.08,
  });
  const noiseFilter = new Tone.Filter({ type: 'bandpass', frequency: 2500, Q: 2 });
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseAmp);
  noiseAmp.toDestination();

  voice = { synth, noise, noiseAmp };
  return voice;
}

function midi(spn) {
  return midiFromSpn(spn);
}

function freq(spn) {
  return Tone.Frequency(midi(spn), 'midi').toFrequency();
}

// Trigger an attack on the brass voice, plus a short noise tongue.
function trigger(spn, durationSeconds) {
  const v = getVoice();
  const f = freq(spn);
  v.synth.triggerAttackRelease(f, Math.max(0.08, durationSeconds));
  v.noise.triggerAttackRelease(0.06);
}

// Play one SPN for a duration string ("8n", "4n", or seconds).
export async function playNote(spn, duration = '8n') {
  await ensureAudio();
  trigger(spn, typeof duration === 'number' ? duration : Tone.Time(duration).toSeconds());
}

// Two- or three-note chime for success / fail feedback.
export async function chime(kind = 'success') {
  await ensureAudio();
  const sequence =
    kind === 'success' ? ['C5', 'E5', 'G5']
      : kind === 'fail' ? ['E4', 'C4']
      : ['C5'];
  for (const n of sequence) {
    trigger(n, 0.12);
    await new Promise((res) => setTimeout(res, 100));
  }
}

// Adjust master volume in dB (-40 .. 6 ish).
export function setMasterVolumeDb(db) {
  try {
    Tone.getDestination().volume.value = db;
  } catch (_) {}
}

export function stopAll() {
  try {
    Tone.getTransport().stop();
    Tone.getDestination().volume.value = -60;
  } catch (_) {}
}
