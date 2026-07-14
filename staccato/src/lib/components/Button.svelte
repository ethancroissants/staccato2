<script>
  // Generic button with primary/secondary/ghost/success/danger variants.
  let {
    variant = 'primary',
    size = 'md',
    type = 'button',
    disabled = false,
    onclick = null,
    href = null,
    children,
    ...rest
  } = $props();
</script>

{#if href}
  <a
    {href}
    class="btn btn-{variant} {size === 'lg' ? 'btn-lg' : size === 'sm' ? 'btn-sm' : ''}"
    onclick={(e) => { if (onclick) onclick(e); }}
    {...rest}
  >
    {@render children?.()}
  </a>
{:else}
  <button
    {type}
    {disabled}
    class="btn btn-{variant} {size === 'lg' ? 'btn-lg' : size === 'sm' ? 'btn-sm' : ''}"
    onclick={onclick}
    {...rest}
  >
    {@render children?.()}
  </button>
{/if}
