<script>
  let { value = 0, max = 100, label = '', thin = false } = $props();
  const pct = $derived(Math.min(100, Math.max(0, (value / max) * 100)));
</script>

<div class="wrap">
  {#if label}
    <div class="row spread tiny muted" style="margin-bottom: 4px;">
      <span>{label}</span>
      <span class="mono">{Math.round(pct)}%</span>
    </div>
  {/if}
  <div class="bar {thin ? 'thin' : ''}">
    <span style:width={pct + '%'}></span>
  </div>
</div>
