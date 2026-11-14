import { useSyncExternalStore } from 'react';

/** Tiny persisted external store (localStorage + useSyncExternalStore). */
export function createStore<T extends object>(key: string, init: T) {
  let state: T = (() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return { ...init, ...(JSON.parse(raw) as Partial<T>) };
    } catch { /* ignore */ }
    return init;
  })();
  const subs = new Set<() => void>();
  const subscribe = (cb: () => void) => { subs.add(cb); return () => { subs.delete(cb); }; };
  const get = () => state;
  const set = (f: (s: T) => T) => {
    state = f(state);
    try { localStorage.setItem(key, JSON.stringify(state)); } catch { /* ignore */ }
    subs.forEach((cb) => cb());
  };
  const useValue = () => useSyncExternalStore(subscribe, get);
  return { get, set, useValue };
}
