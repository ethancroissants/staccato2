<script>
  // Visual instrument display.
  // kind: 'valve' -> three valves
  //       'slide' -> trombone with 7 positions
  //
  // activeValves: array of 0/1s (valve inst) or a single position number (slide)

  let { instrument, activeValves = [0, 0, 0], activePosition = null } = $props();

  const isValve = $derived(instrument.kind === 'valve');
</script>

<div class="instrument" aria-label={instrument.name}>
  <div class="meta">
    <span class="badge">{instrument.transposition}</span>
    <span class="tiny muted">clef · {instrument.clef}</span>
  </div>

  {#if isValve}
    <div class="valves">
      {#each instrument.keys ?? ['1','2','3'] as key, i}
        {@const on = activeValves?.[i] === 1}
        <div class="valve-col">
          <div class="valve-key" class:on aria-pressed={on}>
            <span class="key-cap">{key}</span>
          </div>
          <div class="cap-pipe" class:on></div>
          <div class="valve-body" class:on></div>
          <div class="valve-base"></div>
        </div>
      {/each}
    </div>
    <div class="bell" aria-hidden="true"></div>
  {:else}
    <!-- Trombone slide -->
    <div class="slide">
      <div class="bell-small"></div>
      <div class="slide-track" class:active={activePosition != null}>
        {#each Array(7) as _, i}
          {@const pos = i + 1}
          <div class="slide-tick" class:on={activePosition === pos}>
            <span class="tick-label">{pos}</span>
          </div>
        {/each}
      </div>
      <div class="slide-mouthpiece"></div>
    </div>
  {/if}
</div>

<style>
  .instrument {
    position: relative;
    background: linear-gradient(180deg, #fff8ef, #fbf2e7);
    border: 1px solid var(--rule);
    border-radius: 16px;
    padding: 1.5rem 1.2rem;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 1rem;
    align-items: center;
    min-height: 160px;
    overflow: hidden;
  }
  .meta {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    align-items: flex-start;
  }
  .badge {
    display: inline-block;
    padding: 0.18em 0.7em;
    border-radius: 999px;
    background: var(--spark-orange);
    color: white;
    font-weight: 700;
    font-size: 0.75rem;
    letter-spacing: 0.04em;
  }

  /* ==== Valve layout ==== */
  .valves {
    display: flex;
    gap: 0.7rem;
    align-items: flex-end;
    justify-content: flex-end;
  }
  .valve-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 36px;
  }
  .valve-key {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid #b6aba0;
    display: grid;
    place-items: center;
    font-weight: 700;
    color: var(--muted-ink);
    transition: all var(--t-fast);
    box-shadow: var(--shadow-sm);
    position: relative;
    z-index: 2;
  }
  .valve-key.on {
    background: var(--spark-orange);
    border-color: var(--deep-spark);
    color: white;
    transform: translateY(4px);
    box-shadow: 0 6px 0 var(--deep-spark), 0 8px 12px rgba(255, 91, 20, 0.25);
  }
  .key-cap {
    pointer-events: none;
  }
  .cap-pipe {
    width: 6px;
    height: 12px;
    background: #c1b6a8;
    margin-top: -2px;
    border-radius: 2px;
  }
  .cap-pipe.on { background: var(--deep-spark); }
  .valve-body {
    width: 28px;
    height: 60px;
    border-radius: 14px;
    background: linear-gradient(180deg, #e6dccd, #c1b6a8);
    margin-top: 2px;
    transition: background var(--t-fast);
  }
  .valve-body.on {
    background: linear-gradient(180deg, var(--tangerine), var(--deep-spark));
    box-shadow: inset 0 2px 8px rgba(255, 91, 20, 0.4);
  }
  .valve-base {
    width: 30px;
    height: 6px;
    border-radius: 2px;
    background: #b6aba0;
    margin-top: 1px;
  }
  .bell {
    width: 50px;
    height: 70px;
    background: radial-gradient(circle at 30% 30%, #fff7eb, #fbf2e7);
    border: 2px solid #b6aba0;
    border-radius: 50% 50% 30% 30%;
    transform: rotate(0deg);
    box-shadow: inset -4px -4px 10px rgba(0,0,0,0.06);
  }

  /* ==== Trombone slide layout ==== */
  .slide {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: 30px 1fr 30px;
    align-items: center;
    gap: 0.6rem;
    margin-top: 0.6rem;
  }
  .bell-small {
    width: 28px;
    height: 36px;
    background: radial-gradient(circle at 30% 30%, #fff7eb, #fbf2e7);
    border: 2px solid #b6aba0;
    border-radius: 50%;
  }
  .slide-mouthpiece {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: var(--gold);
    border: 2px solid #b07d0c;
  }
  .slide-track {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 0.6rem;
    height: 60px;
    background: linear-gradient(180deg, #f3e8db, #ecdccd);
    border: 1px solid #d6cabb;
    border-radius: 12px;
    position: relative;
  }
  .slide-track.active {
    background: linear-gradient(180deg, #fde3d2, #f8d6bf);
    border-color: var(--spark-orange);
  }
  .slide-tick {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid var(--muted-ink);
    display: grid;
    place-items: center;
    font-weight: 700;
    font-size: 0.78rem;
    color: var(--muted-ink);
    transition: all var(--t-fast);
  }
  .slide-tick.on {
    background: var(--spark-orange);
    color: white;
    border-color: var(--deep-spark);
    transform: scale(1.18);
    box-shadow: 0 4px 12px rgba(255, 91, 20, 0.4);
  }
</style>
