// Service worker for the TV menu board.
// The page itself is fetched fresh whenever the network is up, so a rebuild
// shows on the next reload; everything (page included) is cached as a fallback
// so a Wi-Fi drop mid-evening does not black out the screen.
var CACHE = 'swizzle-tv-v7';

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
  var isPage = e.request.mode === 'navigate' || /\/tv\/?(index\.html)?(\?.*)?$/.test(e.request.url);
  e.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(e.request).then(function (hit) {
      var net = fetch(e.request).then(function (res) {
        if (res && res.status === 200 && res.type !== 'opaque') { c.put(e.request, res.clone()); }
        return res;
      }).catch(function () { return hit; });
      if (isPage) { return net; }          // network first for the board page
      return hit || net;                   // cache first for fonts and images
    });
  }));
});
