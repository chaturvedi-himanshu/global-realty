/**
 * Tiny client-side helper that persists large media (currently the hero video)
 * in the browser's Cache Storage so it survives reloads, tab restarts, and
 * navigations without going back to the network.
 *
 * Falls back gracefully when:
 *   - SSR / Node (no `window`)
 *   - Browsers without the Cache API
 *   - Cross-origin responses that opt out of caching
 *
 * Bump VIDEO_CACHE_NAME if the cached payload schema or expiry semantics need
 * to change — old entries become unreachable on next deploy.
 */

const VIDEO_CACHE_NAME = "global-realty-hero-video-v1";

function isCacheSupported() {
  return typeof window !== "undefined" && "caches" in window;
}

/**
 * Returns a blob URL backed by the cached response if the video is already
 * cached, otherwise `null`. Callers should `URL.revokeObjectURL` the returned
 * URL when the component unmounts.
 */
export async function getCachedVideoBlobUrl(url) {
  if (!url || !isCacheSupported()) return null;
  try {
    const cache = await caches.open(VIDEO_CACHE_NAME);
    const match = await cache.match(url);
    if (!match) return null;
    const blob = await match.blob();
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

/**
 * Fetches and stores the video in Cache Storage. Safe to call repeatedly —
 * a no-op if the URL is already cached.
 */
export async function populateVideoCache(url) {
  if (!url || !isCacheSupported()) return;
  try {
    const cache = await caches.open(VIDEO_CACHE_NAME);
    const existing = await cache.match(url);
    if (existing) return;
    const res = await fetch(url, { cache: "default" });
    if (res && res.ok) {
      await cache.put(url, res);
    }
  } catch {
    // Network/CORS/quota issues — silently skip; HTTP cache still applies.
  }
}
