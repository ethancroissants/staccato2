<script>
  // Root component. Wires the hash-based router to the right view component.

  import { onMount } from 'svelte';
  import { route, navigate } from './lib/stores/router.js';
  import { user } from './lib/stores/user.js';
  import { settings } from './lib/stores/settings.js';
  import { NOTATION_LESSONS } from './lib/data/lessons.js';
  import Intro from './lib/views/Intro.svelte';
  import Dashboard from './lib/views/Dashboard.svelte';
  import Notation from './lib/views/Notation.svelte';
  import LessonRunner from './lib/views/LessonRunner.svelte';
  import QuizRunner from './lib/views/QuizRunner.svelte';
  import Fingering from './lib/views/Fingering.svelte';
  import Settings from './lib/views/Settings.svelte';

  onMount(() => {
    // sync the high-contrast class with persisted setting
    if ($settings.highContrast) {
      document.documentElement.classList.add('high-contrast');
    }
  });

  // parse current route into a structured {name, params} object
  const parsed = $derived(parsePath($route));
  function parsePath(path) {
    const parts = path.split('/').filter(Boolean);
    if (parts.length === 0) return { name: 'home' };
    if (parts[0] === 'dashboard') return { name: 'dashboard' };
    if (parts[0] === 'notation') {
      if (parts[1] === 'lesson' && parts[2]) {
        return { name: 'lesson', id: parts[2] };
      }
      if (parts[1] === 'quiz') {
        return { name: 'quiz', mode: parts[2] || 'random' };
      }
      return { name: 'notation' };
    }
    if (parts[0] === 'fingering') return { name: 'fingering' };
    if (parts[0] === 'settings') return { name: 'settings' };
    if (parts[0] === 'intro') return { name: 'intro' };
    return { name: 'home' };
  }

  // for lesson resolution
  const lesson = $derived(
    parsed.name === 'lesson'
      ? NOTATION_LESSONS.find((l) => l.id === parsed.id) || NOTATION_LESSONS[0]
      : null
  );

  function isActive(prefix) {
    return $route === prefix || $route.startsWith(prefix + '/');
  }
</script>

<svelte:head>
  <title>Staccato · A friendly music education app</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Newsreader:wght@600;700&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
</svelte:head>

<div class="topbar">
  <div class="topbar-inner">
    <a class="brand" href="#/" onclick={(e) => { e.preventDefault(); navigate('/dashboard'); }}>
      <span class="brand-mark">𝅘</span>
      <span>Staccato</span>
    </a>
    <nav class="nav" aria-label="primary">
      <a href="#/dashboard" class:active={isActive('/dashboard')} onclick={(e) => { e.preventDefault(); navigate('/dashboard'); }}>Dashboard</a>
      <a href="#/notation"   class:active={isActive('/notation')}   onclick={(e) => { e.preventDefault(); navigate('/notation'); }}>Notation</a>
      <a href="#/fingering"  class:active={isActive('/fingering')}  onclick={(e) => { e.preventDefault(); navigate('/fingering'); }}>Fingering</a>
      <a href="#/settings"   class:active={isActive('/settings')}   onclick={(e) => { e.preventDefault(); navigate('/settings'); }}>Settings</a>
    </nav>
    <div class="row gap-sm" style="font-size: 0.9rem;">
      <span class="tag gold">{$user.points} pts</span>
      <span class="tag">streak {$user.streak}</span>
    </div>
  </div>
</div>

<main>
  {#if parsed.name === 'home' || parsed.name === 'intro'}
    {#key 'intro'}
      {#if !$user.onboarded}
        <Intro />
      {:else}
        <Dashboard />
      {/if}
    {/key}
  {:else if parsed.name === 'dashboard'}
    <Dashboard />
  {:else if parsed.name === 'notation'}
    <Notation />
  {:else if parsed.name === 'lesson'}
    {#if lesson}
      <LessonRunner {lesson} />
    {:else}
      <Notation />
    {/if}
  {:else if parsed.name === 'quiz'}
    <QuizRunner questionCount={10} mode={parsed.mode === 'timed' ? 'timed' : 'random'} />
  {:else if parsed.name === 'fingering'}
    <Fingering />
  {:else if parsed.name === 'settings'}
    <Settings />
  {:else}
    <Dashboard />
  {/if}
</main>
