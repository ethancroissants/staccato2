<script>
  let { open = $bindable(false), title = '', children, footer = null, onclose = null } = $props();

  function close() {
    open = false;
    if (onclose) onclose();
  }

  function onKey(e) {
    if (e.key === 'Escape') close();
  }
</script>

<svelte:window onkeydown={onKey} />

{#if open}
  <div class="modal-backdrop" role="dialog" aria-modal="true" aria-label={title}>
    <div class="modal">
      {#if title}
        <div class="row spread" style="margin-bottom: 1rem;">
          <h3 style="margin: 0;">{title}</h3>
          <button class="btn btn-ghost btn-sm" onclick={close} aria-label="Close">✕</button>
        </div>
      {/if}
      {@render children?.()}
      {#if footer}
        <div class="row spread" style="margin-top: 1.5rem; gap: 0.6rem;">
          {@render footer?.()}
        </div>
      {/if}
    </div>
  </div>
{/if}
