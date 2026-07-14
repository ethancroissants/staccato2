<script>
  // Lesson runner — handles both 'tour' (interactive exploration) and 'quiz'
  // lesson types. Tour shows all notes on a staff at once; user clicks each
  // to hear and reveal its name. Quiz cycles through multiple choice.

  import { onMount } from 'svelte';
  import { navigate } from '../stores/router.js';
  import { user, markLessonComplete, addPoints, loseStreak, markNoteLearned } from '../stores/user.js';
  import { settings } from '../stores/settings.js';
  import Staff from '../components/Staff.svelte';
  import Button from '../components/Button.svelte';
  import { playNote, chime } from '../audio/synth.js';
  import { spn } from '../data/clefs.js';

  let { lesson } = $props();

  // ==== Tour mode state ====
  let revealed = $state(new Set());
  let completed = $state(false);

  // ==== Quiz mode state ====
  let qIndex = $state(0);
  let qCorrect = $state(0);
  const qTotal = $derived(Math.min(10, lesson.notes.length));
  let quizEnded = $state(false);
  let choice = $state(null); // {label, isCorrect}
  let lastAnswer = $state(null); // {note, choice, correct}

  // Build a quiz question: pick a target note and 3 distractors that share the same
  // letter (different octave or accidentals) where possible, otherwise pick from
  // the same pool. This makes the choices sensible instead of arbitrary.
  function buildQuestion(target) {
    // Choose 3 distractors from the same clef's natural notes (and some sharps/flats
    // if difficulty > natural).
    const pool = expandPool(lesson.notes, $settings.notationDifficulty);
    const others = pool.filter((p) => p.spn !== target.spn);
    const shuffled = [...others].sort(() => Math.random() - 0.5);
    const distractors = shuffled.slice(0, 3);
    const all = [target, ...distractors].sort(() => Math.random() - 0.5);
    return { target, options: all };
  }

  // Difficulty-modulated pool: original lessons are mostly natural notes.
  // We do this by mapping a target note's SPN to alternatives.
  function expandPool(notes, difficulty) {
    if (difficulty === 'natural') return notes;
    const base = [];
    for (const n of notes) {
      base.push(n);
      // Append chromatic neighbours if any
      const m = n.spn.match(/^([A-G])(#|b)?(-?\d+)$/);
      if (!m) continue;
      const name = m[1];
      const oct = m[3];
      if (difficulty === 'sharps') {
        base.push({ spn: `${name}#${oct}`, accidental: '#' });
      } else if (difficulty === 'flats') {
        base.push({ spn: `${name}b${oct}`, accidental: 'b' });
      } else {
        base.push({ spn: `${name}#${oct}`, accidental: '#' });
        base.push({ spn: `${name}b${oct}`, accidental: 'b' });
      }
    }
    return base;
  }

  let quiz = $derived.by(() => {
    if (lesson.type !== 'quiz') return null;
    if (qIndex >= qTotal) return null;
    const pool = expandPool(lesson.notes, $settings.notationDifficulty);
    const target = pool[Math.floor(Math.random() * pool.length)];
    return buildQuestion(target);
  });

  onMount(() => {
    if (lesson.type === 'quiz' && qIndex >= qTotal) quizEnded = true;
  });

  async function onTourClick(note) {
    revealed.add(note.spn);
    revealed = new Set(revealed); // trigger reactivity
    await playNote(note.spn, '4n');
  }

  function completeTour() {
    completed = true;
    markLessonComplete(lesson.id);
    addPoints(20);
    // Mark every note as seen at least once for vocabulary tracking
    for (const n of lesson.notes) markNoteLearned(n.spn);
    chime('success');
  }

  async function pickAnswer(opt) {
    if (choice) return; // already answered
    const correct = opt.spn === quiz.target.spn;
    choice = { ...opt, isCorrect: correct };
    lastAnswer = { note: quiz.target, choice: opt, correct };
    if (correct) {
      qCorrect += 1;
      addPoints(correct ? 10 : 0);
      markNoteLearned(quiz.target.spn);
      chime('success');
    } else {
      loseStreak();
      chime('fail');
    }
    await new Promise((res) => setTimeout(res, 700));
    choice = null;
    if (qIndex + 1 >= qTotal) {
      quizEnded = true;
      markLessonComplete(lesson.id);
    } else {
      qIndex += 1;
    }
  }

  function restart() {
    qIndex = 0;
    qCorrect = 0;
    quizEnded = false;
    lastAnswer = null;
  }

  const revealedCount = $derived(revealed.size);
  const totalNotes = $derived(lesson.notes.length);

  function prettyName(spn) {
    return spn.replaceAll('#', '♯').replaceAll('b', '♭');
  }
</script>

<div class="container runner fade-in">
  <div class="between">
    <Button variant="ghost" onclick={() => navigate('/notation')}>← All lessons</Button>
    <span class="tag">{lesson.type === 'quiz' ? 'quiz' : 'explore'}</span>
  </div>

  <h1 style="margin-top: 0.6rem;">{lesson.title}</h1>
  <p class="lead">{lesson.blurb}</p>

  {#if lesson.type === 'tour'}
    <section class="card card-pad-lg staff-card">
      <div class="instructions">
        <span class="tag gold">tap a note</span>
        <span class="tiny muted">Click any note to hear it and reveal its name.</span>
      </div>
      <Staff
        clefId={lesson.clef}
        notes={lesson.notes.map((n) => ({
          ...n,
          label: revealed.has(n.spn) || completed ? (n.label ?? prettyName(n.spn)) : '?',
          showName: revealed.has(n.spn) || completed,
        }))}
        interactive
        onNoteClick={onTourClick}
      />
      <div class="tour-foot">
        <div class="row gap-md">
          <div class="bar" style="flex: 1; min-width: 200px;">
            <span style:width={Math.min(100, (revealedCount / totalNotes) * 100) + '%'}></span>
          </div>
          <span class="tiny muted">{revealedCount} / {totalNotes} revealed</span>
        </div>
        <div class="row gap-md">
          <Button variant="secondary" onclick={() => { revealed = new Set(); }}>
            Reset
          </Button>
          <Button
            disabled={!completed && revealedCount < totalNotes * 0.7}
            onclick={completeTour}
          >{completed ? '✓ Marked complete' : 'I’ve explored them all →'}</Button>
        </div>
      </div>
    </section>

    {#if completed}
      <section class="card card-warm complete-card">
        <h3>Nice work! 🎶</h3>
        <p>We've marked this lesson complete and added 20 points. Ready for the next one?</p>
        <Button onclick={() => navigate('/notation')}>Back to lessons →</Button>
      </section>
    {/if}
  {:else}
    <!-- Quiz mode -->
    {#if !quizEnded && quiz}
      <section class="card card-pad-lg">
        <div class="quiz-meta">
          <span class="tag">question {qIndex + 1} / {qTotal}</span>
          <span class="tiny muted">streak: {$user.streak}</span>
        </div>
        <h2>What note is shown?</h2>
        <Staff
          clefId={lesson.clef}
          notes={[{ ...quiz.target, label: '?' }]}
          showLabels={false}
          showAccidentals={false}
        />
        <div class="choices">
          {#each quiz.options as opt}
            <button
              class="choice"
              class:correct={choice && opt.spn === quiz.target.spn}
              class:wrong={choice && opt === choice && !choice.isCorrect}
              disabled={!!choice}
              onclick={() => pickAnswer(opt)}
            >{prettyName(opt.spn)}</button>
          {/each}
        </div>
      </section>
    {:else}
      <section class="card card-pad-lg result">
        <div class="circle-score serif" style="--pct: {(qCorrect / qTotal) * 100};">
          <div>
            <div class="big" style="font-size: 2rem;">{Math.round((qCorrect / qTotal) * 100)}%</div>
            <div class="tiny muted">{qCorrect} / {qTotal}</div>
          </div>
        </div>
        <h3>{qCorrect === qTotal ? 'Perfect run!' : qCorrect >= qTotal * 0.7 ? 'Solid!' : 'Keep at it.'}</h3>
        <p>
          You scored {qCorrect} out of {qTotal}. Streak: <strong>{$user.streak}</strong>.
        </p>
        <div class="row gap-md" style="margin-top: 1rem;">
          <Button onclick={restart}>Retry</Button>
          <Button variant="secondary" onclick={() => navigate('/notation')}>Back to lessons</Button>
        </div>
      </section>
    {/if}
  {/if}
</div>

<style>
  .runner { padding: 1.4rem 1.2rem 4rem; max-width: 920px; }
  .lead {
    color: var(--soft-ink);
    max-width: 60ch;
  }
  .staff-card {
    margin-top: 1rem;
  }
  .instructions {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-bottom: 0.6rem;
  }
  .tour-foot {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 0.8rem;
    margin-top: 1rem;
  }
  .complete-card {
    margin-top: 1rem;
    text-align: center;
  }
  .quiz-meta {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.6rem;
  }
  .choices {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.6rem;
    margin-top: 1rem;
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
  .circle-score > div {
    position: relative;
    z-index: 1;
  }
</style>
