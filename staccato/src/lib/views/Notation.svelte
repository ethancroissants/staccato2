<script>
  // Music Notation Learner — module landing page. Lets the user choose a clef,
  // pick difficulty, browse the lesson catalog, or jump into quiz mode.

  import { settings, setNotationClefs, setNotationDifficulty } from '../stores/settings.js';
  import { CLEFS } from '../data/clefs.js';
  import { NOTATION_LESSONS } from '../data/lessons.js';
  import { user } from '../stores/user.js';
  import { navigate } from '../stores/router.js';
  import Button from '../components/Button.svelte';
  import ProgressBar from '../components/ProgressBar.svelte';

  let tab = $state('learn'); // 'learn' | 'quiz'

  const lessonsByClef = $derived.by(() => {
    const map = {};
    for (const lesson of NOTATION_LESSONS) {
      (map[lesson.clef] ??= []).push(lesson);
    }
    return map;
  });

  function toggleClef(id) {
    const cur = $settings.notationClefs;
    const next = cur.includes(id) ? cur.filter((c) => c !== id) : [...cur, id];
    if (next.length === 0) return; // require at least one
    setNotationClefs(next);
  }

  function lessonPct(lesson) {
    // Each "tour" lesson is one chunk; "quiz" lessons test all of them.
    return $user.lessonsCompleted.includes(lesson.id) ? 100 : 0;
  }
</script>

<div class="container notation fade-in">
  <header class="head">
    <div>
      <span class="tag">module 1</span>
      <h1 style="margin-top: 0.4rem;">Music Notation Learner</h1>
      <p class="muted small" style="max-width: 56ch;">
        Each lesson shows notes on the staff. Tap a note to hear it and reveal its name.
        When you're ready, take a randomized quiz to test yourself.
      </p>
    </div>
    <div class="tabs">
      <button class="tab" class:active={tab === 'learn'} onclick={() => (tab = 'learn')}>Learn</button>
      <button class="tab" class:active={tab === 'quiz'}  onclick={() => (tab = 'quiz')}>Quiz</button>
    </div>
  </header>

  <section class="config card">
    <div class="config-block">
      <span class="tiny muted" style="text-transform: uppercase; letter-spacing: 0.05em;">Clefs</span>
      <div class="clef-row">
        {#each CLEFS as clef}
          <button
            class="clef-pill"
            class:active={$settings.notationClefs.includes(clef.id)}
            onclick={() => toggleClef(clef.id)}
            aria-pressed={$settings.notationClefs.includes(clef.id)}
          >
            <span class="clef-symbol">{clef.symbol}</span>
            <span>{clef.label}</span>
          </button>
        {/each}
      </div>
    </div>
    <div class="config-block">
      <span class="tiny muted" style="text-transform: uppercase; letter-spacing: 0.05em;">Difficulty</span>
      <div class="diff-row">
        {#each [
          { id: 'natural', label: 'Natural notes', blurb: 'Just letters — no sharps or flats.' },
          { id: 'sharps',  label: 'Add sharps',   blurb: 'Practice ♯ accidentals.' },
          { id: 'flats',   label: 'Add flats',    blurb: 'Practice ♭ accidentals.' },
          { id: 'all',     label: 'All accidentals', blurb: 'Mix sharps & flats together.' },
        ] as d}
          <button
            class="diff-pill"
            class:active={$settings.notationDifficulty === d.id}
            onclick={() => setNotationDifficulty(d.id)}
          >
            <strong>{d.label}</strong>
            <span class="tiny muted">{d.blurb}</span>
          </button>
        {/each}
      </div>
    </div>
  </section>

  {#if tab === 'learn'}
    {#each $settings.notationClefs as clefId (clefId)}
      {@const clef = CLEFS.find((c) => c.id === clefId)}
      <section class="card">
        <div class="between" style="margin-bottom: 0.6rem;">
          <div class="row gap-md">
            <span class="clef-glyph serif">{clef.symbol}</span>
            <div>
              <h2>{clef.name}</h2>
              <p class="muted small" style="margin: 0;">Range covered: {clef.rangeBottom} – {clef.rangeTop}</p>
            </div>
          </div>
        </div>
        <div class="lesson-list">
          {#each lessonsByClef[clefId] ?? [] as lesson}
            <button class="lesson-row" onclick={() => navigate(`/notation/lesson/${lesson.id}`)}>
              <div>
                <strong>{lesson.title}</strong>
                <p class="tiny muted" style="margin: 0.2rem 0 0;">{lesson.blurb}</p>
              </div>
              <div class="row gap-md" style="min-width: 130px;">
                <div style="flex: 1;">
                  <ProgressBar value={lessonPct(lesson)} max={100} thin />
                </div>
                <span class="tiny muted">{lesson.notes.length} notes</span>
                <span aria-hidden="true">→</span>
              </div>
            </button>
          {/each}
        </div>
      </section>
    {/each}
  {:else}
    <section class="card">
      <h2>Quiz yourself</h2>
      <p class="muted small">
        Randomized questions drawn from your chosen clefs and difficulty. Earn points and
        build streaks — finish a streak of five and you'll earn a small bonus.
      </p>
      <div class="quiz-launch">
        <Button size="lg" onclick={() => navigate('/notation/quiz/random')}>
          Start a randomized quiz →
        </Button>
        <span class="tiny muted">{ $settings.notationClefs.length } clef(s) · { $settings.notationDifficulty }</span>
      </div>
    </section>
  {/if}
</div>

<style>
  .notation { padding: 1.6rem 1.2rem 4rem; }
  .head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  .tabs {
    display: inline-flex;
    background: var(--soft-paper);
    border-radius: 12px;
    padding: 4px;
    border: 1px solid var(--rule);
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
  .config {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.4rem;
    margin-bottom: 1.2rem;
  }
  @media (min-width: 760px) {
    .config { grid-template-columns: 1fr 1fr; }
  }
  .config-block { display: flex; flex-direction: column; gap: 0.6rem; }
  .clef-row, .diff-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .clef-pill, .diff-pill {
    background: var(--soft-paper);
    border: 1px solid var(--rule);
    color: var(--soft-ink);
    border-radius: 999px;
    padding: 0.45rem 0.9rem;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    transition: all var(--t-fast);
    cursor: pointer;
  }
  .clef-pill.active, .diff-pill.active {
    background: var(--spark-orange);
    color: white;
    border-color: var(--deep-spark);
  }
  .clef-pill .clef-symbol {
    font-size: 1.2rem;
  }
  .diff-pill {
    flex-direction: column;
    align-items: flex-start;
    border-radius: 12px;
    padding: 0.6rem 0.9rem;
    text-align: left;
  }
  .diff-pill.active {
    background: var(--soft-spark);
    color: var(--rust);
    border-color: var(--spark-orange);
  }
  .diff-pill strong {
    font-size: 0.95rem;
  }
  .clef-glyph {
    font-size: 2rem;
    color: var(--rust);
  }
  .lesson-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 0.6rem;
  }
  .lesson-row {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.2rem;
    border-radius: 12px;
    background: var(--soft-paper);
    border: 1px solid var(--rule-soft);
    text-align: left;
    color: var(--ink);
    transition: all var(--t-fast);
    cursor: pointer;
  }
  .lesson-row:hover {
    background: var(--soft-spark);
    border-color: var(--spark-orange);
    transform: translateX(2px);
  }
  .quiz-launch {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
  }
</style>
