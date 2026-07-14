// Lightweight hash-based router. Avoids a router dependency in the bundle.
import { writable } from 'svelte/store';

function parse() {
  const h = (typeof window !== 'undefined' ? window.location.hash : '') || '#/';
  return h.replace(/^#/, '') || '/';
}

export const route = writable(parse());

if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => route.set(parse()));
}

export function navigate(path) {
  if (typeof window !== 'undefined') {
    window.location.hash = `#${path}`;
  }
  route.set(path);
}
