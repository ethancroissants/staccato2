<script>
  // Onboarding: shows a welcome, then runs the intro quiz, then sends the user
  // to the dashboard. We collect quiz answers and use them to recommend a
  // starting clef and a starting module.

  import { onMount } from 'svelte';
  import { navigate } from '../stores/router.js';
  import { user, completeOnboarding } from '../stores/user.js';
  import { settings } from '../stores/settings.js';
  import { INTRO_QUIZ, lessonsByClef } from '../data/lessons.js';
  import { CLEFS } from '../data/clefs.js';
  import Button from '../components/Button.svelte';

  // Skip onboarding if the user already onboarded.
  onMount(() => {
    if ($user.onboarded) navigate('/dashboard');
  });

  let step = $state('welcome'); // 'welcome' | 'quiz' | 'result'
  let qIndex = $state(0);
  let answers = $state({});
  let result = $state(null);

  const currentQ = $derived(INTRO_QUIZ[qIndex]);
  const total = INTRO_QUIZ.length;

  function startQuiz() {
    step = 'quiz';
    qIndex = 0;
    answers = {};
  }

  function pick(opt) {
    answers[currentQ.id] = opt;

    if (qIndex < total - 1) {
      qIndex += 1;
    } else {
      // Compute recommendation
      const r = computeRecommendation(answers);
      result = r;
      completeOnboarding({
        recommendedClef: r.clef,
        recommendedPath: r.path,
        results: answers,
      });
      settings.update((s) => ({
        ...s,
        notationClefs: [r.clef],
      }));
      step = 'result';
    }
  }

  function goAhead() {
    navigate('/dashboard');
  }

  function skip() {
    completeOnboarding({ recommendedClef: 'treble', recommendedPath: 'notation', results: answers });
    navigate('/dashboard');
  }

  function computeRecommendation(a) {
    // Determine starting knowledge
    let score = 0;
    let path = 'notation';
    for (const q of INTRO_QUIZ) {
      const ans = a[q.id];
      if (!ans) continue;
      if (typeof ans.score === 'number') score += ans.score;
      if (ans.tag) path = ans.tag === 'both' ? 'both' : ans.tag;
    }
    // Default to treble unless they specifically struggle; otherwise still treble
    // but bump them a touch if they seem more advanced.
    return {
      clef: 'treble',
      path,
      knowledge: score <= 3 ? 'beginner' : score <= 6 ? 'intermediate' : 'advanced',
    };
  }

  let knownClef = $derived(() => CLEFS.find((c) => c.id === result?.clef));
</script>

<div class="intro-shell">
  {#if step === 'welcome'}
    <div class="card card-pad-lg fade-in welcome">
      <div class="brand-mark huge">𝅘</div>
      <h1 class="big">Welcome to <span class="serif" style="color: var(--rust);">Staccato</span></h1>
      <p class="lead">
        A friendly, no-jargon journey through reading music on the staff and fingering
        brass instruments. We'll start with a 6-question check-in so we can meet you
        where you are.
      </p>
      <ul class="bullets">
        <li><strong>Zero-knowledge</strong> — every term gets explained the first time it appears.</li>
        <li><strong>Hands-on</strong> — tap notes, press the keys 1·2·3 to feel the fingering.</li>
        <li><strong>Progress that sticks</strong> — points, streaks, gentle reviews.</li>
      </ul>
      <div class="row gap-md" style="margin-top: 1.6rem;">
        <Button size="lg" onclick={startQuiz}>Take the 6-question check-in →</Button>
        <Button variant="ghost" onclick={skip}>I've done this before — skip</Button>
      </div>
    </div>
  {:else if step === 'quiz'}
    <div class="card fade-in">
      <div class="row spread">
        <span class="tag">check-in</span>
        <span class="tiny muted">{qIndex + 1} of {total}</span>
      </div>
      <h2 style="margin-top: 0.6rem;">{currentQ.question}</h2>
      <div class="col gap-md" style="margin-top: 1.2rem;">
        {#each currentQ.options as opt}
          <button
            class="choice"
            class:selected={answers[currentQ.id]?.label === opt.label}
            onclick={() => pick(opt)}
          >{opt.label}</button>
        {/each}
      </div>
    </div>
  {:else if step === 'result'}
    <div class="card card-pad-lg fade-in">
      <h1 class="big">You're all set! 🎉</h1>
      <p class="lead">
        Based on your answers we'll start you on the {knownClef()?.label ?? 'treble'} clef.
        {#if result?.knowledge === 'beginner'}
          We'll move slowly and explain each note as we go.
        {:else if result?.knowledge === 'intermediate'}
          You've got some basics — let's fill in the gaps.
        {:else}
          Looks like you know your way around a staff — we'll stretch you.
        {/if}
      </p>

      <div class="rec-grid">
        <div class="rec-card">
          <span class="tag">recommended module</span>
          <h3 style="margin-top: 0.6rem;">
            {result?.path === 'fingering' ? 'Fingering Trainer' : result?.path === 'both' ? 'Both modules' : 'Music Notation Learner'}
          </h3>
          <p class="tiny muted">
            {lessonsByClef(result?.clef ?? 'treble').length} lessons in the {knownClef()?.label} clef.
          </p>
        </div>
      </div>

      <div class="row gap-md" style="margin-top: 1.5rem;">
        <Button size="lg" onclick={goAhead}>Open the dashboard →</Button>
      </div>
    </div>
  {/if}
</div>

<style>
  .intro-shell {
    max-width: 720px;
    margin: 4vh auto;
    padding: 1rem 1.2rem;
  }
  .welcome {
    text-align: center;
    padding: 2.6rem 2rem 2rem;
  }
  .welcome h1 {
    margin: 0.8rem 0 0.4rem;
  }
  .welcome .lead {
    color: var(--soft-ink);
    max-width: 520px;
    margin: 0 auto;
  }
  .brand-mark.huge {
    margin: 0 auto;
    width: 64px; height: 64px;
    font-size: 2rem;
    border-radius: 18px;
  }
  .bullets {
    list-style: none;
    padding: 0;
    max-width: 520px;
    margin: 1.4rem auto 0;
    text-align: left;
  }
  .bullets li {
    padding: 0.5rem 0 0.5rem 1.6rem;
    position: relative;
    color: var(--soft-ink);
  }
  .bullets li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.85rem;
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--spark-orange);
  }
  .rec-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-top: 1.4rem;
  }
  .rec-card {
    background: var(--soft-spark);
    border-radius: 14px;
    padding: 1.2rem 1.4rem;
    border: 1px solid rgba(255, 91, 20, 0.18);
  }
  @media (min-width: 640px) {
    .rec-grid { grid-template-columns: 1fr 1fr; }
  }
</style>
