<script>
  // Random quiz — picks notes from the user's selected clefs & difficulty, with
  // multiple-choice distractors. Tracks score & streak. Used both for ad-hoc
  // practice and as the "end-of-lesson" quiz for {@type 'quiz'} lessons.

  import { onMount, onDestroy } from 'svelte';
  import { navigate } from '../stores/router.js';
  import { user, addPoints, loseStreak, markNoteLearned, markLessonComplete } from '../stores/user.js';
  import { settings } from '../stores/settings.js';
  import Staff from '../components/Staff.svelte';
  import Button from '../components/Button.svelte';
  import { playNote, chime } from '../audio/synth.js';
  import { CLEFS, notesInClefRange, midiFromSpn } from '../data/clefs.js';

  let { lesson = null, questionCount = 10, mode = 'random' } = $props();

  // Build a pool of SPNs from the chosen clefs & difficulty. For each selected
  // clef we draw from its training range; for accidentals we add chromatic
  // neighbours near each natural note.
  function buildPool() {
    const clefs = $settings.notationClefs;
    const difficulty = $settings.notationDifficulty;
    const pool = [];
    for (const clefId of clefs) {
      const clef = CLEFS.find((c) => c.id === clefId);
      if (!clef) continue;
      const all = notesInClefRange(clef).filter(
        (n) => n.spn >= clef.rangeBottom && n.spn <= clef.rangeTop
      );
      for (const n of all) {
        pool.push({ spn: `${n.name}${n.octave}`, clefId });
        if (difficulty === 'sharps' || difficulty === 'all') {
          pool.push({ spn: `${n.name}#${n.octave}`, clefId });
        }
        if (difficulty === 'flats' || difficulty === 'all') {
          pool.push({ spn: `${n.name}b${n.octave}`, clefId });
        }
      }
    }
    // de-dupe by spn (preferring the first clef encountered)
    const seen = new Set();
    const uniq = [];
    for (const p of pool) {
      if (seen.has(p.spn)) continue;
      seen.add(p.spn);
      uniq.push(p);
    }
    return uniq;
  }

  const pool = $derived(buildPool());

  let qIndex = $state(0);
  let qCorrect = $state(0);
  let choice = $state(null);
  let quizEnded = $state(false);
  const timerOn = $derived(mode === 'timed');
  let seconds = $state(20);
  let timer = null;

  function startTimer() {
    if (!timerOn) return;
    timer = setInterval(() => {
      if (seconds <= 0) {
        loseStreak();
        next();
      } else {
        seconds -= 1;
      }
    }, 1000);
  }

  function stopTimer() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  function next() {
    stopTimer();
    if (qIndex + 1 >= questionCount) {
      quizEnded = true;
      markLessonComplete('quiz-' + Date.now());
      return;
    }
    qIndex += 1;
    choice = null;
    seconds = 20;
    startTimer();
  }

  onMount(() => {
    startTimer();
  });
  onDestroy(() => stopTimer());

  // Build the current question: pick target, plus 3 distractors.
  const currentQ = $derived.by(() => {
    if (qIndex >= questionCount || quizEnded) return null;
    const target = pool[Math.floor(Math.random() * pool.length)];
    // Find distractors: nearby pitches (within an octave ideally) to avoid trivial answers.
    const targetMidi = midiFromSpn(target.spn);
    const candidates = pool.filter((p) => p.spn !== target.spn && Math.abs(midiFromSpn(p.spn) - targetMidi) > 1);
    const shuffled = [...candidates].sort(() => Math.random() - 0.5);
    const distractors = shuffled.slice(0, 3);
    const options = [target, ...distractors].sort(() => Math.random() - 0.5);
    return { target, options };
  });

  async function pickAnswer(opt) {
    if (choice) return;
    const correct = opt.spn === currentQ.target.spn;
    choice = { ...opt, isCorrect: correct };
    if (correct) {
      qCorrect += 1;
      addPoints(timerOn ? 15 : 10);
      markNoteLearned(currentQ.target.spn);
      await chime('success');
    } else {
      loseStreak();
      await chime('fail');
    }
    await new Promise((res) => setTimeout(res, 700));
    next();
  }

  function restart() {
    qIndex = 0;
    qCorrect = 0;
    quizEnded = false;
    choice = null;
    seconds = 20;
    startTimer();
  }

  function prettyName(spn) {
    return spn.replaceAll('#', '♯').replaceAll('b', '♭');
  }

  // We derived `currentQ` based on qIndex — but we want a derived value that
  // recomputes when qIndex changes. The `$derived.by` block above handles that.
</script>

<div class="container runner fade-in">
  <div class="between">
    <Button variant="ghost" onclick={() => { stopTimer(); navigate('/notation'); }}>← Back</Button>
    <div class="row gap-sm">
      <span class="tag">{mode === 'timed' ? 'timed' : 'practice'}</span>
      <span class="tag info">{qIndex + 1}/{questionCount}</span>
      {#if timerOn && !quizEnded}
        <span class="tag" class:warn={seconds < 5}>⏱ {seconds}s</span>
      {/if}
    </div>
  </div>

  {#if !quizEnded && currentQ}
    <section class="card card-pad-lg">
      <h2>What note is shown?</h2>
      <p class="muted small">Listen carefully — tap a note to hear it before answering.</p>
      <div class="row gap-md" style="margin-top: 0.6rem; align-items: flex-end;">
        <div style="flex: 1;">
          <Staff
            clefId={currentQ.target.clefId}
            notes={[{ spn: currentQ.target.spn, label: '?', showName: false }]}
            showLabels={false}
            showAccidentals={true}
            interactive
            onNoteClick={async (n) => { await playNote(n.spn, '8n'); }}
          />
        </div>
        <Button variant="secondary" onclick={async () => await playNote(currentQ.target.spn, '8n')}>
          🔊 Hear it
        </Button>
      </div>

      <div class="choices">
        {#each currentQ.options as opt}
          <button
            class="choice"
            class:correct={choice && opt.spn === currentQ.target.spn}
            class:wrong={choice && opt === choice && !choice.isCorrect}
            disabled={!!choice}
            onclick={() => pickAnswer(opt)}
          >{prettyName(opt.spn)}</button>
        {/each}
      </div>
    </section>
  {:else}
    <section class="card card-pad-lg result">
      <div class="circle-score serif" style="--pct: {(qCorrect / questionCount) * 100};">
        <div>
          <div style="font-size: 2rem;">{Math.round((qCorrect / questionCount) * 100)}%</div>
          <div class="tiny muted">{qCorrect} / {questionCount}</div>
        </div>
      </div>
      <h3>{qCorrect === questionCount ? 'Perfect run!' : qCorrect >= questionCount * 0.7 ? 'Solid work!' : 'Keep at it!'}</h3>
      <p>Points earned: <strong>{$user.points}</strong> · Streak: <strong>{$user.streak}</strong></p>
      <div class="row gap-md" style="justify-content: center; margin-top: 1rem;">
        <Button onclick={restart}>Try again</Button>
        <Button variant="secondary" onclick={() => navigate('/notation')}>Back to lessons</Button>
      </div>
    </section>
  {/if}
</div>

<style>
  .runner { padding: 1.4rem 1.2rem 4rem; max-width: 920px; }
  .choices {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.6rem;
    margin-top: 1.2rem;
  }
  @media (max-width: 520px) {
    .choices { grid-template-columns: 1fr; }
  }
  .result {
    text-align: center;
    margin-top: 1rem;
  }
  .circle-score {
    width: 120px; height: 120px;
    border-radius: 50%;
    background: conic-gradient(var(--spark-orange) calc(var(--pct) * 1%), var(--rule-soft) 0);
    display: grid; place-items: center;
    margin: 0 auto 1rem;
    position: relative;
  }
  .circle-score::before {
    content: '';
    position: absolute;
    inset: 6px;
    border-radius: 50%;
    background: var(--surface);
  }
  .circle-score > div { position: relative; z-index: 1; }
  .tag.warn { background: #ffe2c2; color: #c2410c; }
</style>
