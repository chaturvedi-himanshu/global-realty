"use client";

// Minimal in-house replacement for the `swr` package, supporting only the
// surface area we actually use in this codebase:
//   - useSWR(key)
//   - useSWR(key, fetcher)
//   - useSWR(null) / useSWR(falsy key)  -> idle, no fetch
//   - mutate(key)                        -> revalidate one key
//   - mutate(predicate)                  -> revalidate every cached key matching
//   - useSWR result exposes `mutate` bound to its key
//
// Behavior intentionally mirrors swr defaults:
//   - Module-level cache shared across components.
//   - In-flight dedupe: concurrent revalidations for the same key share one promise.
//   - Default fetcher uses global fetch + JSON parsing (matches swr's documented default).
//   - isLoading is true only on the initial fetch (no cached data yet); subsequent
//     revalidations keep isLoading false (so existing UI doesn't flash spinners).

import { useEffect, useSyncExternalStore } from "react";

const cache = new Map();
const subscribers = new Map();
const fetchers = new Map();
const inflight = new Map();

const IDLE = Object.freeze({ data: undefined, error: undefined, isLoading: false });
const INITIAL = Object.freeze({ data: undefined, error: undefined, isLoading: true });

const defaultFetcher = (url) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error(`Request failed: ${r.status}`);
    return r.json();
  });

function getOrInit(key) {
  let entry = cache.get(key);
  if (!entry) {
    entry = INITIAL;
    cache.set(key, entry);
  }
  return entry;
}

function setEntry(key, next) {
  cache.set(key, next);
  const subs = subscribers.get(key);
  if (subs) subs.forEach((cb) => cb());
}

function subscribe(key, cb) {
  let subs = subscribers.get(key);
  if (!subs) {
    subs = new Set();
    subscribers.set(key, subs);
  }
  subs.add(cb);
  return () => {
    subs.delete(cb);
    if (subs.size === 0) subscribers.delete(key);
  };
}

async function revalidate(key, fetcher) {
  if (key === null || key === undefined || key === false || key === "") return;
  if (inflight.has(key)) return inflight.get(key);

  const fn = fetcher || fetchers.get(key) || defaultFetcher;
  const prev = cache.get(key) || INITIAL;
  // Preserve any existing data; only flip isLoading on the very first fetch.
  setEntry(key, {
    data: prev.data,
    error: prev.error,
    isLoading: prev.data === undefined && prev.error === undefined,
  });

  const promise = (async () => {
    try {
      const data = await fn(key);
      setEntry(key, { data, error: undefined, isLoading: false });
    } catch (error) {
      setEntry(key, { data: prev.data, error, isLoading: false });
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, promise);
  return promise;
}

export function mutate(matcher) {
  if (typeof matcher === "function") {
    const matched = [];
    for (const k of cache.keys()) {
      try {
        if (matcher(k)) matched.push(k);
      } catch {
        /* ignore matcher errors per-key */
      }
    }
    return Promise.all(matched.map((k) => revalidate(k)));
  }
  if (matcher === null || matcher === undefined || matcher === false || matcher === "") {
    return Promise.resolve();
  }
  return revalidate(matcher);
}

const noopUnsubscribe = () => {};

export default function useSWR(key, fetcher) {
  const validKey =
    key === null || key === undefined || key === false || key === "" ? null : key;

  if (validKey !== null && fetcher) {
    fetchers.set(validKey, fetcher);
  }

  const subscribeFn =
    validKey === null ? () => noopUnsubscribe : (cb) => subscribe(validKey, cb);
  const getSnapshot = () => (validKey === null ? IDLE : getOrInit(validKey));
  // SSR: nothing to render from cache; treat as idle to avoid hydration churn.
  const getServerSnapshot = () => IDLE;

  const state = useSyncExternalStore(subscribeFn, getSnapshot, getServerSnapshot);

  useEffect(() => {
    if (validKey === null) return;
    revalidate(validKey, fetcher);
    // We intentionally only re-run when the key changes; fetcher is stored in
    // the registry on every render so the latest one is used on next mutate().
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validKey]);

  const boundMutate = (...args) =>
    validKey === null ? Promise.resolve() : mutate(validKey, ...args);

  return {
    data: state.data,
    error: state.error,
    isLoading: validKey === null ? false : state.isLoading,
    mutate: boundMutate,
  };
}
