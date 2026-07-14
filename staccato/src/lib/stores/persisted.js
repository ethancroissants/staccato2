// A small helper that wraps `writable` + localStorage persistence.
// Used by our stores so progress survives reloads.
import { writable } from 'svelte/store';

const isBrowser = typeof window !== 'undefined' && typeof localStorage !== 'undefined';

export function persisted(key, initial) {
  let start = initial;
  if (isBrowser) {
    try {
      const raw = localStorage.getItem(key);
      if (raw != null) start = JSON.parse(raw);
    } catch (_) {
      // ignore corrupt storage
    }
  }

  const store = writable(start);

  if (isBrowser) {
    store.subscribe((value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (_) {
        // storage might be full / disabled
      }
    });
  }

  return store;
}
