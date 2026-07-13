/* Bookshelf — service worker
 *
 * Cache-first for the app shell (HTML/CSS/JS/icons/manifest).
 * Network-first for live data hosts (Google Books covers, Firestore — added later).
 *
 * IMPORTANT: bump CACHE_NAME (e.g. 'bookshelf-v1' -> 'bookshelf-v2') any time you change
 * an asset that's listed in CORE_ASSETS. Otherwise browsers will serve the stale version.
 */
const CACHE_NAME = 'bookshelf-v28';

const CORE_ASSETS = [
  './',
  './index.html',
  './classics.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Hosts we always want fresh data from — fall back to cache only if offline.
const NETWORK_FIRST_HOSTS = new Set([
  'books.google.com',
  'books.googleusercontent.com',
  'www.googleapis.com',
  'firestore.googleapis.com',
  'firebaseio.com',
  'firebasestorage.googleapis.com'
]);

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Defensive: one bad URL must NOT take down the whole install.
    // cache.addAll() is atomic; allSettled lets each asset succeed/fail independently.
    const results = await Promise.allSettled(CORE_ASSETS.map(url => cache.add(url)));
    results.forEach((r, i) => {
      if (r.status === 'rejected') {
        console.warn('[sw] precache failed for', CORE_ASSETS[i], r.reason);
      }
    });
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Clean up any stale caches from previous versions.
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch { return; }

  // Only handle http(s) — skip chrome-extension, etc.
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  if (NETWORK_FIRST_HOSTS.has(url.hostname)) {
    event.respondWith(networkFirst(req));
    return;
  }

  event.respondWith(cacheFirst(req));
});

async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const fresh = await fetch(req);
    if (fresh && fresh.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(req, fresh.clone());
    }
    return fresh;
  } catch {
    return cached || new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

async function networkFirst(req) {
  try {
    const fresh = await fetch(req);
    if (fresh && fresh.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(req, fresh.clone());
    }
    return fresh;
  } catch {
    const cached = await caches.match(req);
    return cached || new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}
