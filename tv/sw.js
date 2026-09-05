// Service worker for the TV menu board.
// Cache-first for the board and everything it references, refreshed in the
// background, so a Wi-Fi drop mid-evening does not black out the screen.
var CACHE = 'swizzle-tv-v1';

self.addEventListener('install', function () { self.skipWaiting(); });

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; })
                           .map(function (k) { return caches.delete(k); }));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(e.request).then(function (hit) {
      var net = fetch(e.request).then(function (res) {
        if (res && res.status === 200 && res.type !== 'opaque') { c.put(e.request, res.clone()); }
        return res;
      }).catch(function () { return hit; });
      return hit || net;
    });
  }));
});
