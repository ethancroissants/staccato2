<script>
  // Settings: tweak practice preferences, audio, accessibility, and progress.

  import {
    settings,
    setNotationClefs,
    setNotationDifficulty,
    setFingeringInstrument,
    resetSettings,
  } from '../stores/settings.js';
  import { user, resetUser } from '../stores/user.js';
  import { CLEFS } from '../data/clefs.js';
  import { INSTRUMENTS } from '../data/instruments.js';
  import { navigate } from '../stores/router.js';
  import Button from '../components/Button.svelte';
  import Modal from '../components/Modal.svelte';
  import { setMasterVolumeDb, chime } from '../audio/synth.js';

  let resetOpen = $state(false);

  function toggleClef(id) {
    const cur = $settings.notationClefs;
    const next = cur.includes(id) ? cur.filter((c) => c !== id) : [...cur, id];
    if (next.length === 0) return;
    setNotationClefs(next);
  }

  function applyHighContrast(on) {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('high-contrast', on);
    }
    settings.update((s) => ({ ...s, highContrast: on }));
  }

  function clearProgress() {
    resetUser();
    resetSettings();
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('high-contrast');
    }
    resetOpen = false;
    navigate('/');
  }

  async function testSound() {
    await chime('success');
  }
</script>

<div class="container settings fade-in">
  <header>
    <span class="tag">settings</span>
    <h1>Settings</h1>
    <p class="muted small">All preferences are stored locally — nothing leaves your device.</p>
  </header>

  <section class="card">
    <h2>Notation practice</h2>
    <div class="row spread" style="margin-top: 1rem;">
      <div>
        <h4>Clefs</h4>
        <p class="tiny muted">Tick every clef you want to see in quizzes & lessons.</p>
      </div>
      <div class="row gap-sm">
        {#each CLEFS as clef}
          <button
            class="clef-pill"
            class:active={$settings.notationClefs.includes(clef.id)}
            onclick={() => toggleClef(clef.id)}
          ><span class="clef-symbol">{clef.symbol}</span> {clef.label}</button>
        {/each}
      </div>
    </div>

    <div class="hr"></div>

    <h4>Difficulty</h4>
    <div class="row gap-sm" style="margin-top: 0.6rem; flex-wrap: wrap;">
      {#each [
        { id: 'natural', label: 'Natural only' },
        { id: 'sharps', label: 'Add sharps' },
        { id: 'flats', label: 'Add flats' },
        { id: 'all', label: 'All accidentals' },
      ] as d}
        <button
          class="seg"
          class:active={$settings.notationDifficulty === d.id}
          onclick={() => setNotationDifficulty(d.id)}
        >{d.label}</button>
      {/each}
    </div>
  </section>

  <section class="card">
    <h2>Fingering</h2>
    <div class="row gap-sm" style="margin-top: 0.6rem; flex-wrap: wrap;">
      {#each INSTRUMENTS as ins}
        <button
          class="seg"
          class:active={$settings.fingeringInstrument === ins.id}
          onclick={() => setFingeringInstrument(ins.id)}
        >{ins.name} <span class="tiny muted">· {ins.transposition}</span></button>
      {/each}
    </div>
  </section>

  <section class="card">
    <h2>Audio</h2>
    <p class="muted small">Built with Tone.js — synthesised in your browser, no samples required.</p>
    <div class="row between" style="margin-top: 0.4rem;">
      <div>
        <h4>Sound</h4>
        <p class="tiny muted">Audio cues, instrument tones, success chimes.</p>
      </div>
      <button
        class="seg"
        class:active={$settings.soundEnabled}
        onclick={() => settings.update((s) => ({ ...s, soundEnabled: !s.soundEnabled }))}
      >{$settings.soundEnabled ? 'On' : 'Off'}</button>
    </div>
    <div class="row gap-md" style="margin-top: 0.6rem;">
      <Button variant="secondary" size="sm" onclick={testSound}>Test sound</Button>
    </div>
  </section>

  <section class="card">
    <h2>Accessibility</h2>
    <div class="row between">
      <div>
        <h4>High-contrast mode</h4>
        <p class="tiny muted">Increase contrast for body text and borders.</p>
      </div>
      <button
        class="seg"
        class:active={$settings.highContrast}
        onclick={() => applyHighContrast(!$settings.highContrast)}
      >{$settings.highContrast ? 'On' : 'Off'}</button>
    </div>
  </section>

  <section class="card danger-zone">
    <h2>Reset</h2>
    <p class="muted small">This wipes your points, streaks, settings, and progress. There's no undo.</p>
    <Button variant="danger" onclick={() => (resetOpen = true)}>Reset everything…</Button>
  </section>
</div>

<Modal bind:open={resetOpen} title="Reset all progress?">
  <p>This clears your points, lessons completed, streaks, and preferences. You'll go back through the intro quiz.</p>
  {#snippet footer()}
    <Button variant="ghost" onclick={() => (resetOpen = false)}>Cancel</Button>
    <Button variant="danger" onclick={clearProgress}>Yes, reset</Button>
  {/snippet}
</Modal>

<style>
  .settings { padding: 1.4rem 1.2rem 4rem; max-width: 880px; }
  header { margin-bottom: 1rem; }
  .clef-pill {
    padding: 0.4rem 0.9rem;
    border-radius: 999px;
    background: var(--soft-paper);
    border: 1px solid var(--rule);
    color: var(--soft-ink);
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    transition: all var(--t-fast);
  }
  .clef-pill .clef-symbol {
    font-size: 1.1rem;
  }
  .clef-pill.active {
    background: var(--spark-orange);
    color: white;
    border-color: var(--deep-spark);
  }
  .seg {
    padding: 0.5rem 0.9rem;
    border-radius: 999px;
    background: var(--soft-paper);
    border: 1px solid var(--rule);
    color: var(--soft-ink);
    font-weight: 500;
    transition: all var(--t-fast);
  }
  .seg.active {
    background: var(--spark-orange);
    color: white;
    border-color: var(--deep-spark);
  }
  section + section { margin-top: 1rem; }
  .danger-zone {
    border-color: rgba(224, 79, 53, 0.3);
    background: #fff8f5;
  }
</style>
