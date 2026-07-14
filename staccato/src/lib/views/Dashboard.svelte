<script>
  // Dashboard — personalized landing page after onboarding.
  // Recommends next lessons, surfaces stats, and links into both modules.

  import { onMount } from 'svelte';
  import { user } from '../stores/user.js';
  import { settings } from '../stores/settings.js';
  import { navigate } from '../stores/router.js';
  import { NOTATION_LESSONS, lessonsByClef } from '../data/lessons.js';
  import { CLEFS } from '../data/clefs.js';
  import { INSTRUMENTS, instrumentById } from '../data/instruments.js';
  import Button from '../components/Button.svelte';
  import ProgressBar from '../components/ProgressBar.svelte';

  onMount(() => {
    if (!$user.onboarded) navigate('/');
  });

  const recommendedClef = $derived($user.recommendedClef || 'treble');
  const primaryLesson = $derived(
    NOTATION_LESSONS.find(
      (l) => l.clef === recommendedClef && !$user.lessonsCompleted.includes(l.id)
    ) || NOTATION_LESSONS[0]
  );
  const completedCount = $derived($user.lessonsCompleted.length);
  const totalLessons = NOTATION_LESSONS.length;
  const recommendedInstrument = $derived(
    instrumentById($settings.fingeringInstrument) || INSTRUMENTS[0]
  );

  const recentClefs = $derived(CLEFS.slice(0, 4));

  function pct(n) {
    return Math.round((n / totalLessons) * 100);
  }

  function go(path) {
    navigate(path);
  }
</script>

<div class="container dash fade-in">
  <header class="hero card-warm card-pad-lg">
    <div class="hero-text">
      <span class="tag">your dashboard</span>
      <h1 style="margin-top: 0.4rem;">
        Keep going, you've made it <span class="serif">this far.</span>
      </h1>
      <p class="lead">
        {#if completedCount === 0}
          Try the recommended lesson below to get started — we promise to keep things gentle.
        {:else}
          You've finished {completedCount} of {totalLessons} lessons. Next up:
          <strong>{primaryLesson?.title}</strong>.
        {/if}
      </p>
      <div class="row gap-md" style="margin-top: 1rem; flex-wrap: wrap;">
        <Button onclick={() => go(`/notation/lesson/${primaryLesson?.id}`)}>
          Continue →
        </Button>
        <Button variant="secondary" onclick={() => go('/fingering')}>
          Open fingering trainer
        </Button>
      </div>
    </div>
    <div class="hero-stats">
      <div class="stat">
        <div class="stat-val serif">{$user.points}</div>
        <div class="stat-label">points</div>
      </div>
      <div class="stat">
        <div class="stat-val serif">{$user.streak}</div>
        <div class="stat-label">streak</div>
      </div>
      <div class="stat">
        <div class="stat-val serif">{$user.notesLearned.length}</div>
        <div class="stat-label">notes learned</div>
      </div>
    </div>
  </header>

  <div class="grid">
    <!-- Notation module card -->
    <div class="card module-card">
      <div class="module-head">
        <div>
          <span class="tag">module 1</span>
          <h2 style="margin-top: 0.5rem;">Music Notation Learner</h2>
        </div>
        <div class="bar thin" style="min-width: 110px;">
          <span style:width={pct(completedCount) + '%'}></span>
        </div>
      </div>
      <p class="muted">
        Read music on the staff — treble, bass, alto, and more — starting with the natural
        notes then adding sharps & flats.
      </p>
      <div class="clef-row">
        {#each recentClefs as clef}
          <button class="clef-pill" onclick={() => { settings.update((s) => ({...s, notationClefs: [clef.id]})); go(`/notation/lesson/${lessonsByClef(clef.id)[0].id}`); }}>
            <span class="clef-symbol">{clef.symbol}</span>
            <span>
              <strong>{clef.label}</strong>
              <span class="tiny muted">{clef.rangeBottom}–{clef.rangeTop}</span>
            </span>
          </button>
        {/each}
      </div>
      <div class="row between" style="margin-top: 1rem;">
        <span class="tiny muted">{completedCount}/{totalLessons} lessons · practice helps a lot</span>
        <Button size="sm" variant="ghost" onclick={() => go('/notation')}>Open module →</Button>
      </div>
    </div>

    <!-- Fingering module card -->
    <div class="card module-card">
      <div class="module-head">
        <div>
          <span class="tag">module 2</span>
          <h2 style="margin-top: 0.5rem;">Fingering Trainer</h2>
        </div>
        <span class="tag gold">{recommendedInstrument.transposition}</span>
      </div>
      <p class="muted">
        Press keys <span class="mono">1</span>, <span class="mono">2</span>, <span class="mono">3</span>
        on your keyboard to simulate valve presses for
        <strong>{recommendedInstrument.name}</strong> — and learn the slide for trombone.
      </p>
      <div class="instr-row">
        {#each INSTRUMENTS as i}
          <button
            class="instr-pill"
            class:active={i.id === $settings.fingeringInstrument}
            onclick={() => { settings.update((s) => ({...s, fingeringInstrument: i.id})); }}
            title={i.name}
          >{i.name}</button>
        {/each}
      </div>
      <div class="row between" style="margin-top: 1rem;">
        <span class="tiny muted">Free play · learn · association</span>
        <Button size="sm" variant="ghost" onclick={() => go('/fingering')}>Open module →</Button>
      </div>
    </div>
  </div>

  <!-- Quick review section -->
  <section class="card review-card">
    <div class="between">
      <div>
        <span class="tag info">daily review</span>
        <h3 style="margin-top: 0.6rem;">Sharpen the tricky notes</h3>
      </div>
      <Button variant="secondary" onclick={() => go('/notation/quiz/random')}>
        Quick 5-question quiz →
      </Button>
    </div>
    <p class="muted small">
      Notes you've seen at least once: <strong>{$user.notesLearned.length}</strong>. We
      pick a mix of natural notes from your chosen clef range so each round feels fresh
      without being overwhelming.
    </p>
    <ProgressBar value={$user.notesLearned.length} max={40} label="Vocabulary" thin />
  </section>
</div>

<style>
  .dash {
    padding: 1.6rem 1.2rem 4rem;
  }
  .hero {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
    margin-bottom: 1.4rem;
    background:
      radial-gradient(120% 120% at 100% 0%, rgba(255, 91, 20, 0.13), transparent 50%),
      var(--soft-paper);
    border-color: var(--rule);
  }
  .hero .lead {
    color: var(--soft-ink);
    margin-top: 0.6rem;
    font-size: 1.05rem;
    max-width: 56ch;
  }
  .hero-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.6rem;
  }
  .stat {
    background: var(--surface);
    border: 1px solid var(--rule);
    border-radius: 12px;
    padding: 0.8rem 1rem;
    text-align: center;
  }
  .stat-val {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--rust);
    line-height: 1;
  }
  .stat-label {
    color: var(--muted-ink);
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-top: 0.2rem;
  }
  .grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.2rem;
    margin-bottom: 1.2rem;
  }
  @media (min-width: 880px) {
    .grid {
      grid-template-columns: 1fr 1fr;
    }
    .hero {
      grid-template-columns: 1.4fr 1fr;
      align-items: center;
    }
  }
  .module-card {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }
  .module-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.8rem;
  }
  .clef-row, .instr-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .clef-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.45rem 0.7rem;
    border-radius: 999px;
    background: var(--soft-paper);
    border: 1px solid var(--rule);
    color: var(--ink);
    font-size: 0.9rem;
    transition: all var(--t-fast);
    cursor: pointer;
  }
  .clef-pill:hover {
    background: var(--soft-spark);
    border-color: var(--spark-orange);
  }
  .clef-pill .clef-symbol {
    font-size: 1.4rem;
    color: var(--rust);
  }
  .clef-pill .tiny {
    margin-left: 0.4rem;
    display: inline-block;
  }
  .instr-pill {
    padding: 0.4rem 0.8rem;
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
  .review-card {
    margin-top: 0.6rem;
  }
</style>
