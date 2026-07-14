<script>
  // SVG staff renderer. Pure presentational. Parents pass `notes`, an optional
  // `activeSpn` for highlighting, and may receive click events via onNoteClick.

  import { CLEFS, yForNote } from '../data/clefs.js';

  let {
    clefId = 'treble',
    notes = [],
    activeSpn = null,
    showLabels = true,
    showClef = true,
    width = 720,
    interactive = false,
    onNoteClick = null,
    showAccidentals = true,
  } = $props();

  const clef = $derived(CLEFS.find((c) => c.id === clefId) || CLEFS[0]);

  // SVG geometry. Lines drawn at y = 30, 50, 70, 90, 110 (5 lines, 20px apart).
  // Staff positions: line 0 = bottom (y 110), line 4 = top (y 30).
  // A "y step" of 1 maps to 10px vertical movement (each line/space = 10px).
  const STAFF_TOP = 30;
  const LINE_GAP = 20;
  const STEP_PX = 10;

  // Pixel y of a given clef staff y position (line/space index).
  function yPx(clefY) {
    // cleffY 0 = bottom line. negative = below staff (in spaces/ledgers).
    return STAFF_TOP + 4 * LINE_GAP - clefY * STEP_PX;
  }

  // Each note renders at a fixed x position (we step by 50px).
  const NOTE_DX = 52;
  const STAFF_PADDING_X = 80;

  function noteInfo(note) {
    const m = note.spn.match(/^([A-G])(#|b)?(-?\d+)$/);
    if (!m) return null;
    const name = m[1];
    const acc = m[2] || '';
    const oct = parseInt(m[3], 10);
    const y = yForNote(clef, name, oct, acc);
    return { name, acc, oct, y };
  }

  // Renders the clef as a stylized character using a unicode symbol + hand-
  // drawn SVG decorative shapes layered on top for personality.
  function clefIcon(cx) {
    return { cx, cy: yPx(0) - LINE_GAP * 2 };
  }

  // Determine if a note is above or below the staff — affects ledger rendering.
  function ledgerCount(y) {
    if (y >= 0 && y <= 8) return 0;
    if (y < 0) return Math.ceil(-y / 2);
    return Math.ceil((y - 8) / 2);
  }

  // Render the five staff lines.
  const lineYs = [0, 2, 4, 6, 8].map(yPx);
  // Bar lines to delimit measures? keep simple: no bars.

  let hovered = $state(null);

  function clickNote(note, idx) {
    if (interactive && onNoteClick) onNoteClick(note, idx);
  }

  // Total width based on number of notes.
  const totalWidth = $derived(
    Math.max(width, STAFF_PADDING_X * 2 + Math.max(1, notes.length) * NOTE_DX + 60)
  );
</script>

<div class="staff-wrap" style:--staff-w={totalWidth + 'px'}>
  <svg viewBox={`0 0 ${totalWidth} 200`} width="100%" height="200" role="img" aria-label="Musical staff" class="staff-svg">
    <!-- background -->
    <rect x="0" y="0" width={totalWidth} height="200" fill="#fffdf9" />

    <!-- staff lines -->
    {#each lineYs as ly, i}
      <line x1="20" x2={totalWidth - 20} y1={ly} y2={ly} stroke="#17120e" stroke-width="1.4" stroke-linecap="round" opacity="0.88" />
    {/each}

    <!-- clef at left -->
    {#if showClef}
      <text
        x="50"
        y={yPx(0) - LINE_GAP * 2 + 60}
        text-anchor="middle"
        font-size="86"
        font-family="serif"
        fill="#17120e"
        aria-label={clef.name}
      >{clef.symbol}</text>
    {/if}

    <!-- notes -->
    {#each notes as note, i (i + ':' + note.spn)}
      {@const info = noteInfo(note)}
      {#if info}
        {@const px = STAFF_PADDING_X + i * NOTE_DX}
        {@const py = yPx(info.y)}
        {@const ledgers = ledgerCount(info.y)}
        {@const isActive = note.spn === activeSpn}
        {@const isHover = hovered === i}

        <!-- ledger lines -->
        {#if ledgers > 0}
          {#each Array(ledgers) as _, li}
            {@const sign = info.y < 0 ? -1 : 1}
            {@const ly = py + sign * (li + 1) * STEP_PX}
            <line x1={px - 12} x2={px + 12} y1={ly} y2={ly} stroke="#17120e" stroke-width="1.4" />
          {/each}
        {/if}

        <!-- accidental -->
        {#if showAccidentals && info.acc}
          <text
            x={px - 22}
            y={py + 7}
            text-anchor="middle"
            font-size="26"
            font-family="serif"
            font-weight="700"
            fill="#17120e"
          >{info.acc === 'b' ? '♭' : '♯'}</text>
        {/if}

        <!-- note head -->
        <g
          class="note-group"
          class:interactive
          role={interactive ? 'button' : null}
          aria-label={note.spn + (note.label ? ' ' + note.label : '')}
          onmouseenter={() => (interactive && (hovered = i))}
          onmouseleave={() => (hovered = null)}
          onclick={() => clickNote(note, i)}
          onkeydown={(e) => { if (interactive && (e.key === 'Enter' || e.key === ' ')) clickNote(note, i); }}
        >
          <!-- subtle warm glow when active -->
          {#if isActive || isHover}
            <ellipse cx={px + 2} cy={py + 2} rx="14" ry="10" fill="rgba(255, 91, 20, 0.18)" />
          {/if}
          <!-- whole / half / filled notehead -->
          <ellipse
            cx={px + 2}
            cy={py + 2}
            rx="11"
            ry="9"
            fill={isActive ? '#ff5b14' : '#17120e'}
            transform={`rotate(-22 ${px + 2} ${py + 2})`}
            stroke={isActive ? '#fff' : 'none'}
            stroke-width="1.5"
          />
          <!-- stem up by default -->
          <line x1={px + 11} y1={py + 2} x2={px + 11} y2={py - 38} stroke={isActive ? '#ff5b14' : '#17120e'} stroke-width="2" />
        </g>

        <!-- label below -->
        {#if showLabels && note.label != null}
          <text
            x={px + 2}
            y="186"
            text-anchor="middle"
            font-size="13"
            font-family="inherit"
            font-weight="600"
            fill={isActive ? '#ff5b14' : '#8a7e72'}
          >{note.label || note.spn}</text>
        {/if}
      {/if}
    {/each}
  </svg>
</div>

<style>
  .staff-wrap {
    width: 100%;
    max-width: 100%;
    background: #fffdf9;
    border-radius: 14px;
    border: 1px solid var(--rule-soft);
    padding: 8px;
    overflow-x: auto;
  }
  .staff-svg {
    display: block;
    background:
      repeating-linear-gradient(0deg, transparent 0 9px, rgba(255, 91, 20, 0.025) 9px 10px);
  }
  .interactive :global(.note-group) {
    cursor: pointer;
    transition: transform 0.15s var(--ease, ease);
  }
  .interactive :global(.note-group:hover ellipse:nth-of-type(2)) {
    transform: translate(-2px, -2px) rotate(-22deg);
  }
</style>
