import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

// Vite config for Staccato.
// - Allow any host header (for tunnelled previews).
// - Keep a single manual chunk for Tone.js so the audio engine is cached.
export default defineConfig({
  plugins: [svelte()],
  server: {
    host: true,
    allowedHosts: true,
    strictPort: false,
  },
  preview: {
    host: true,
    allowedHosts: true,
    strictPort: false,
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/tone/')) return 'tone';
          if (id.includes('node_modules/svelte/')) return 'svelte';
        },
      },
    },
  },
});
