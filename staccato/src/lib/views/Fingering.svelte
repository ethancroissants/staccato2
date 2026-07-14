<script>
  // Fingering Trainer — three modes: free play, learn, association.
  // Free play: user presses keys 1/2/3 to play notes via the chosen fingering.
  //            No feedback, just exploration.
  // Learn: app shows a note; user must press the correct keys.
  // Association: app shows note + fingering; user repeats to drill the connection.

  import { onMount, onDestroy } from 'svelte';
  import { settings, setFingeringInstrument, setFingeringMode } from '../stores/settings.js';
  import { user, addPoints, loseStreak, markNoteLearned } from '../stores/user.js';
  import { INSTRUMENTS, instrumentById } from '../data/instruments.js';
  import InstrumentVisual from '../components/InstrumentVisual.svelte';
  import Button from '../components/Button.svelte';
  import { playNote, chime } from '../audio/synth.js';

  const instrument = $derived(instrumentById($settings.fingeringInstrument) || INSTRUMENTS[0]);

  // ==== Free Play ====
  // Show all playable notes. User clicks or presses keys to play them.
  let pressedKeys = $state([0, 0, 0]);
  let activeSpn = $state(null);
  let activePosition = $state(null);

  function setKey(i, on) {
    pressedKeys[i] = on ? 1 : 0;
    pressedKeys = [...pressedKeys];
    if (instrument.kind === 'valve') {
      const match = instrument.notes.find((n) => n.valves.every((v, j) => v === pressedKeys[j]));
      if (match) {
        activeSpn = match.spn;
        activePosition = null;
        playNote(match.spn, '8n');
      } else {
        activeSpn = null;
      }
    } else {
      // slide instrument: 1=close, 2=mid, 3=far
      const posMap = { 1: 1, 2: 4, 3: 7 };
      const pos = posMap[i + 1];
      if (pos != null && on) {
        activePosition = pos;
        const match = instrument.notes.find((n) => n.positions.includes(pos));
        if (match) {
          activeSpn = match.spn;
          playNote(match.spn, '8n');
        }
      } else if (!on) {
        activeSpn = null;
        activePosition = null;
      }
    }
  }

  // Keyboard 1/2/3 listeners
  function onKeyDown(e) {
    if (e.repeat) return;
    if (['1', '2', '3'].includes(e.key)) {
      const idx = parseInt(e.key, 10) - 1;
      setKey(idx, 1);
    } else if (e.key.toLowerCase() === 'p') {
      playCurrent();
    }
  }
  function onKeyUp(e) {
    if (['1', '2', '3'].includes(e.key)) {
      const idx = parseInt(e.key, 10) - 1;
      setKey(idx, 0);
    }
  }

  onMount(() => {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
  });
  onDestroy(() => {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
  });

  async function playCurrent() {
    if (activeSpn) await playNote(activeSpn, '4n');
  }

  // ==== Learn Mode ====
  let target = $state(null);
  let feedback = $state(null); // 'correct' | 'wrong' | null
  let targetIndex = 0;

  function newTarget() {
    target = instrument.notes[Math.floor(Math.random() * instrument.notes.length)];
    feedback = null;
    pressedKeys = [0, 0, 0];
    activeSpn = null;
    activePosition = null;
  }

  function checkAnswer() {
    if (!target) return;
    let correct = false;
    if (instrument.kind === 'valve') {
      correct = target.valves.every((v, i) => v === pressedKeys[i]);
    } else {
      const posMap = { 1: 1, 2: 4, 3: 7 };
      const curPos = posMap[pressedKeys.findIndex((v) => v === 1) + 1] ?? 0;
      correct = target.positions.includes(curPos);
    }
    if (correct) {
      feedback = 'correct';
      addPoints(15);
      markNoteLearned(target.spn);
      chime('success');
      setTimeout(() => newTarget(), 900);
    } else {
      feedback = 'wrong';
      loseStreak();
      chime('fail');
    }
  }

  // ==== Association Mode ====
  let assocQueue = $state([]);
  let assocIndex = $state(0);
  let assocRunning = $state(false);

  function startAssoc() {
    assocQueue = [...instrument.notes].sort(() => Math.random() - 0.5).slice(0, 8);
    assocIndex = 0;
    assocRunning = true;
  }

  function nextAssoc() {
    if (assocIndex + 1 >= assocQueue.length) {
      assocRunning = false;
      return;
    }
    assocIndex += 1;
  }

  // Switch mode resets state
  function switchMode(m) {
    setFingeringMode(m);
    target = null;
    pressedKeys = [0, 0, 0];
    activeSpn = null;
    feedback = null;
    assocRunning = false;
  }

  // Display labels
  function valveLabel(note) {
    if (!note.valves) return '';
    const on = note.valves.map((v, i) => (v ? instrument.keys?.[i] ?? (i + 1) : null)).filter(Boolean);
    return on.length ? on.join('-') : 'open';
  }
  function slidePosition(note) {
    return note.positions?.[0] ?? '?';
  }
</script>

<div class="container finger fade-in">
  <header class="head">
    <div>
      <span class="tag">module 2</span>
      <h1 style="margin-top: 0.4rem;">Fingering Trainer</h1>
      <p class="muted small" style="max-width: 60ch;">Press the keys <span class="mono">1</span>, <span class="mono">2</span>, <span class="mono">3</span> on your keyboard to play notes for {instrument.name}. Each fingering shown is a real, playable combination.</p>
    </div>
    <div class="row gap-sm">
      {#each INSTRUMENTS as ins}
        <button
          class="instr-pill"
          class:active={ins.id === $settings.fingeringInstrument}
          onclick={() => { setFingeringInstrument(ins.id); target = null; pressedKeys = [0,0,0]; activeSpn = null; feedback = null; assocRunning = false; }}
        >{ins.name}</button>
      {/each}
    </div>
  </header>

  <div class="tabs">
    <button class="tab" class:active={$settings.fingeringMode === 'free'}        onclick={() => switchMode('free')}>Free Play</button>
    <button class="tab" class:active={$settings.fingeringMode === 'learn'}       onclick={() => switchMode('learn')}>Learn</button>
    <button class="tab" class:active={$settings.fingeringMode === 'association'} onclick={() => switchMode('association')}>Association</button>
  </div>

  <div class="grid">
    <div class="col">
      <InstrumentVisual {instrument} activeValves={pressedKeys} activePosition={activePosition} />

      <div class="card key-helper">
        <h4>Keyboard map</h4>
        <p class="muted small" style="margin-top: 0.2rem;">{instrument.keyHint}</p>
        <div class="keys">
          {#each instrument.keys ?? ['1','2','3'] as key, i}
            <kbd class:on={pressedKeys[i]}>{key}</kbd>
          {/each}
        </div>
        {#if $settings.fingeringMode === 'free'}
          <p class="tiny muted" style="margin-top: 0.6rem;">
            {#if instrument.kind === 'valve'}
              Released keys = open. The {instrument.notes.length} notes shown in the chart are
              all reachable with just these three valves.
            {:else}
              Trombone slide positions — the closer the slide, the higher the pitch.
            {/if}
          </p>
        {/if}
      </div>

      {#if $settings.fingeringMode === 'free'}
        <div class="card">
          <h4>Now playing</h4>
          <div class="now">
            {#if activeSpn}
              <span class="serif" style="font-size: 2.4rem; color: var(--rust);">{activeSpn.replace('#', '♯').replace('b', '♭')}</span>
              <Button size="sm" variant="secondary" onclick={playCurrent}>🔊</Button>
            {:else}
              <span class="muted small">Press a key combination to sound a note…</span>
            {/if}
          </div>
        </div>
      {/if}

      {#if $settings.fingeringMode === 'learn'}
        <div class="card card-pad-lg" class:pulse-success={feedback === 'correct'} class:pulse-fail={feedback === 'wrong'}>
          {#if !target}
            <h4>Ready to drill some fingerings?</h4>
            <p class="muted small">I'll show a note. Press <span class="mono">1</span>, <span class="mono">2</span>, <span class="mono">3</span> in the right combination to play it.</p>
            <Button onclick={newTarget}>Start →</Button>
          {:else}
            <div class="row spread">
              <h4 style="margin: 0;">Play this note:</h4>
              <span class="serif target-note">{target.spn.replace('#', '♯').replace('b', '♭')}</span>
            </div>
            <p class="muted tiny">
              {#if instrument.kind === 'valve'}
                Correct fingering: <strong>{valveLabel(target)}</strong>
              {:else}
                Slide position: <strong>{slidePosition(target)}</strong>
              {/if}
            </p>
            <div class="row gap-md" style="margin-top: 1rem;">
              <Button variant="secondary" onclick={() => playNote(target.spn, '8n')}>🔊 Hear it</Button>
              <Button onclick={checkAnswer}>Check answer</Button>
              <Button variant="ghost" onclick={newTarget}>Skip →</Button>
            </div>
            {#if feedback}
              <p class="feedback {feedback}">{feedback === 'correct' ? '✓ Correct! +15 points' : '✗ Try again — listen for the right fingering.'}</p>
            {/if}
          {/if}
        </div>
      {/if}

      {#if $settings.fingeringMode === 'association'}
        <div class="card card-pad-lg">
          {#if !assocRunning}
            <h4>Association drill</h4>
            <p class="muted small">I'll show a note and its fingering side by side. Your job is to memorise them and reproduce the fingering without looking.</p>
            <Button onclick={startAssoc}>Start drill →</Button>
          {:else}
            {@const note = assocQueue[assocIndex]}
            <div class="row spread">
              <span class="tag">card {assocIndex + 1} / {assocQueue.length}</span>
            </div>
            <div class="assoc-grid">
              <div class="assoc-staff">
                <h4>Note</h4>
                <span class="serif" style="font-size: 3rem; color: var(--rust);">{note.spn.replace('#','♯').replace('b','♭')}</span>
                <Button variant="secondary" size="sm" onclick={async () => await playNote(note.spn, '8n')}>🔊</Button>
              </div>
              <div class="assoc-fing">
                <h4>Fingering</h4>
                {#if instrument.kind === 'valve'}
                  <div class="row gap-sm">
                    {#each instrument.keys ?? ['1','2','3'] as k, i}
                      <span class="fing-chip" class:on={note.valves[i]}>{k}</span>
                    {/each}
                  </div>
                  <span class="tiny muted" style="margin-top: 0.4rem; display: block;">
                    {valveLabel(note)}
                  </span>
                {:else}
                  <div class="row gap-sm">
                    {#each Array(7) as _, i}
                      {@const pos = i + 1}
                      <span class="fing-chip" class:on={note.positions.includes(pos)}>{pos}</span>
                    {/each}
                  </div>
                  <span class="tiny muted" style="margin-top: 0.4rem; display: block;">
                    Position {slidePosition(note)}
                  </span>
                {/if}
              </div>
            </div>
            <div class="row gap-md" style="margin-top: 1rem;">
              <Button variant="secondary" onclick={nextAssoc}>{assocIndex + 1 >= assocQueue.length ? 'Finish' : 'Next card →'}</Button>
            </div>
          {/if}
        </div>
      {/if}
    </div>

    <div class="col">
      <div class="card">
        <h4>Fingering chart — {instrument.name}</h4>
        <p class="muted small" style="margin-top: 0.4rem;">
          Tap a row to play and highlight it.
        </p>
        <div class="chart">
          {#each instrument.notes as note}
            {@const isActive = (activeSpn === note.spn)}
            <button
              class="chart-row"
              class:active={isActive}
              class:pulse-success={isActive}
              onclick={async () => { await playNote(note.spn, '8n'); activeSpn = note.spn; }}
            >
              <span class="serif note-name">{note.spn.replace('#', '♯').replace('b', '♭')}</span>
              <span class="fing-row">
                {#if instrument.kind === 'valve'}
                  {#each instrument.keys ?? ['1','2','3'] as k, i}
                    <span class="fing-dot" class:on={note.valves[i]} title={k}></span>
                  {/each}
                  <span class="lbl">{valveLabel(note)}</span>
                {:else}
                  {#each Array(7) as _, i}
                    {@const pos = i + 1}
                    <span class="fing-dot slide" class:on={note.positions.includes(pos)} title={'P' + pos}>
                      <span class="tiny">{pos}</span>
                    </span>
                  {/each}
                  <span class="lbl">pos {slidePosition(note)}</span>
                {/if}
              </span>
            </button>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .finger { padding: 1.4rem 1.2rem 4rem; max-width: 1100px; }
  .head {
    display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; justify-content: space-between;
    margin-bottom: 1rem;
  }
  .instr-pill {
    padding: 0.45rem 0.9rem;
    border-radius: 999px;
    border: 1px solid var(--rule);
    background: var(--soft-paper);
    color: var(--soft-ink);
    font-weight: 500;
    transition: all var(--t-fast);
  }
  .instr-pill.active {
    background: var(--spark-orange);
    color: white;
    border-color: var(--deep-spark);
  }
  .instr-pill:not(.active):hover {
    background: var(--soft-spark);
    border-color: var(--spark-orange);
    color: var(--rust);
  }
  .tabs {
    display: inline-flex;
    background: var(--soft-paper);
    border-radius: 12px;
    padding: 4px;
    border: 1px solid var(--rule);
    margin-bottom: 1rem;
  }
  .tab {
    padding: 0.45em 1.1em;
    border-radius: 9px;
    color: var(--soft-ink);
    font-weight: 600;
    transition: all var(--t-fast);
  }
  .tab.active {
    background: var(--surface);
    color: var(--rust);
    box-shadow: var(--shadow-sm);
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.2rem;
  }
  @media (min-width: 1000px) {
    .grid { grid-template-columns: 1.2fr 1fr; }
  }
  .key-helper kbd {
    display: inline-grid;
    place-items: center;
    width: 36px; height: 36px;
    border-radius: 8px;
    background: #fffdf9;
    border: 1.5px solid var(--rule);
    font-family: var(--font-mono);
    font-weight: 700;
    color: var(--soft-ink);
    margin-right: 0.3rem;
    transition: all var(--t-fast);
  }
  .key-helper kbd.on {
    background: var(--spark-orange);
    color: white;
    border-color: var(--deep-spark);
    transform: translateY(2px);
  }
  .keys {
    margin-top: 0.6rem;
  }
  .now {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 0.4rem;
  }
  .target-note {
    font-size: 2.4rem;
    color: var(--rust);
  }
  .feedback {
    margin-top: 0.6rem;
    padding: 0.5rem 0.8rem;
    border-radius: 10px;
    font-weight: 600;
  }
  .feedback.correct { background: #dceed9; color: var(--success); }
  .feedback.wrong { background: #f8d8d2; color: var(--danger); }

  .chart {
    margin-top: 0.6rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    max-height: 460px;
    overflow-y: auto;
    padding-right: 4px;
  }
  .chart-row {
    display: grid;
    grid-template-columns: 60px 1fr;
    align-items: center;
    gap: 0.6rem;
    background: var(--soft-paper);
    border: 1px solid var(--rule-soft);
    border-radius: 10px;
    padding: 0.45rem 0.7rem;
    color: var(--ink);
    text-align: left;
    transition: all var(--t-fast);
  }
  .chart-row:hover {
    background: var(--soft-spark);
    border-color: var(--spark-orange);
  }
  .chart-row.active {
    background: var(--soft-spark);
    border-color: var(--spark-orange);
    box-shadow: 0 0 0 3px rgba(255, 91, 20, 0.15);
  }
  .note-name {
    font-size: 1.2rem;
    color: var(--ink);
  }
  .fing-row {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    flex-wrap: wrap;
  }
  .fing-dot {
    width: 22px; height: 22px;
    border-radius: 50%;
    background: var(--surface);
    border: 2px solid var(--muted-ink);
    color: var(--muted-ink);
    font-size: 0.7rem;
    display: grid;
    place-items: center;
    transition: all var(--t-fast);
  }
  .fing-dot.slide {
    width: 20px; height: 20px;
  }
  .fing-dot.on {
    background: var(--spark-orange);
    color: white;
    border-color: var(--deep-spark);
    box-shadow: 0 2px 6px rgba(255, 91, 20, 0.3);
  }
  .fing-chip {
    width: 28px; height: 28px;
    border-radius: 8px;
    background: var(--soft-paper);
    border: 1.5px solid var(--rule);
    display: grid;
    place-items: center;
    font-weight: 700;
    font-family: var(--font-mono);
    color: var(--muted-ink);
    transition: all var(--t-fast);
  }
  .fing-chip.on {
    background: var(--spark-orange);
    color: white;
    border-color: var(--deep-spark);
  }
  .lbl {
    margin-left: 0.4rem;
    color: var(--muted-ink);
    font-size: 0.85rem;
    font-weight: 500;
  }
  .assoc-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-top: 1rem;
  }
  @media (max-width: 520px) {
    .assoc-grid { grid-template-columns: 1fr; }
  }
  .assoc-staff, .assoc-fing {
    background: var(--soft-paper);
    border-radius: 12px;
    padding: 1.2rem;
    text-align: center;
  }
  .assoc-fing .fing-chip { width: 36px; height: 36px; font-size: 1rem; }
</style>
