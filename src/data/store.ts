import { useSyncExternalStore } from "react";

// Tiny persistent store backed by localStorage (demo persistence).
// To move to Lovable Cloud, replace these stores with queries in src/data/repository.ts.
export interface PersistentStore<T> {
  get: () => T;
  getServerSnapshot: () => T;
  set: (updater: T | ((prev: T) => T)) => void;
  subscribe: (cb: () => void) => () => void;
  reset: () => void;
}

export function createPersistentStore<T>(key: string, initial: () => T): PersistentStore<T> {
  let serverSnapshot: T | undefined;
  let state: T | undefined;
  const listeners = new Set<() => void>();
  const isBrowser = typeof window !== "undefined";

  const load = (): T => {
    if (state !== undefined) return state;
    if (!isBrowser) {
      serverSnapshot ??= initial();
      return serverSnapshot;
    }
    try {
      const raw = window.localStorage.getItem(key);
      state = raw ? (JSON.parse(raw) as T) : initial();
    } catch {
      state = initial();
    }
    return state;
  };

  const persist = () => {
    if (!isBrowser) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // Storage full (e.g. large uploaded images) — keep in memory only.
    }
  };

  if (isBrowser) {
    window.addEventListener("storage", (e) => {
      if (e.key !== key) return;
      state = e.newValue ? (JSON.parse(e.newValue) as T) : initial();
      listeners.forEach((l) => l());
    });
  }

  const getServerSnapshot = () => {
    serverSnapshot ??= initial();
    return serverSnapshot;
  };

  return {
    get: load,
    getServerSnapshot,
    set: (updater) => {
      const prev = load();
      state = typeof updater === "function" ? (updater as (p: T) => T)(prev) : updater;
      persist();
      listeners.forEach((l) => l());
    },
    subscribe: (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    reset: () => {
      state = initial();
      persist();
      listeners.forEach((l) => l());
    },
  };
}

// During hydration React uses the deterministic seed snapshot, then re-renders with
// the persisted localStorage state — no hydration mismatch.
export function useStore<T>(store: PersistentStore<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.getServerSnapshot);
}
