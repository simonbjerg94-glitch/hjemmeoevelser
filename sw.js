/* Service worker: gemmer appen og billedserierne, så de virker offline.
   Tempo-filmene tegnes i appen og virker offline. Egne videoer/fotos ligger i IndexedDB og virker offline.
   Billedlisten og versionen opdateres af tools/sync_images.py. */
const CACHE = 'hjemmeoevelser-v18';
// images-hash: eb2e0aa722d8
const ASSETS = ['./', 'index.html', 'style.css', 'app.js', 'data.js', 'data-haelspore.js', 'hael.js', 'rutine-anim.js', 'haeloeft-figur.js', 'film-engine.js', 'film-defs.js', 'paamindelser.js', 'manifest.json',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png'];
const IMAGES = ["images/knae-1-laarmuskel/1.webp", "images/knae-1-laarmuskel/2.webp", "images/knae-1-rejse-hoej/1.webp", "images/knae-1-rejse-hoej/2.webp", "images/knae-1-rejse-hoej/3.webp", "images/knae-1-knaestraek-siddende/1.webp", "images/knae-1-knaestraek-siddende/2.webp", "images/knae-1-knaestraek-siddende/3.webp", "images/knae-2-rejse-uden-arme/1.webp", "images/knae-2-rejse-uden-arme/2.webp", "images/knae-2-rejse-uden-arme/3.webp", "images/knae-2-trin-op/1.webp", "images/knae-2-trin-op/2.webp", "images/knae-2-trin-op/3.webp", "images/knae-2-minisquat/1.webp", "images/knae-2-minisquat/2.webp", "images/knae-2-minisquat/3.webp", "images/knae-3-rejse-et-ben/1.webp", "images/knae-3-rejse-et-ben/2.webp", "images/knae-3-rejse-et-ben/3.webp", "images/knae-3-udfald-frem/1.webp", "images/knae-3-udfald-frem/2.webp", "images/knae-3-udfald-frem/3.webp", "images/knae-3-trin-ned/1.webp", "images/knae-3-trin-ned/2.webp", "images/hofte-1-broen/1.webp", "images/hofte-1-broen/2.webp", "images/hofte-1-sideloeft-liggende/1.webp", "images/hofte-1-sideloeft-liggende/2.webp", "images/hofte-1-benet-bagud/1.webp", "images/hofte-1-benet-bagud/2.webp", "images/hofte-2-hoftehaengsel/1.webp", "images/hofte-2-hoftehaengsel/2.webp", "images/hofte-2-hoftehaengsel/3.webp", "images/hofte-2-sideloeft-staaende/1.webp", "images/hofte-2-sideloeft-staaende/2.webp", "images/hofte-2-sidegang/1.webp", "images/hofte-2-sidegang/2.webp", "images/hofte-2-sidegang/3.webp", "images/hofte-3-broen-et-ben/1.webp", "images/hofte-3-broen-et-ben/2.webp", "images/hofte-3-sideloeft-elastik/1.webp", "images/hofte-3-sideloeft-elastik/2.webp", "images/hofte-3-udfald-bagud/1.webp", "images/hofte-3-udfald-bagud/2.webp", "images/hofte-3-udfald-bagud/3.webp", "images/balance-1-samlede-foedder/1.webp", "images/balance-1-samlede-foedder/2.webp", "images/balance-2-tandem/1.webp", "images/balance-2-tandem/2.webp", "images/balance-3-et-ben/1.webp", "images/balance-3-et-ben/2.webp", "images/hael-1-fascie-straek/1.webp", "images/hael-1-fascie-straek/2.webp", "images/hael-1-fascie-straek/3.webp", "images/hael-1-rul-under-foden/1.webp", "images/hael-1-rul-under-foden/2.webp", "images/hael-1-rul-under-foden/3.webp", "images/hael-1-laeg-straek-strakt/1.webp", "images/hael-1-laeg-straek-strakt/2.webp", "images/hael-1-laeg-straek-boejet/1.webp", "images/hael-1-laeg-straek-boejet/2.webp", "images/hael-1-isometrisk-pres/1.webp", "images/hael-1-isometrisk-pres/2.webp", "images/hael-1-isometrisk-pres/3.webp", "images/hael-2-haandklaede-kroel/1.webp", "images/hael-2-haandklaede-kroel/2.webp", "images/hael-2-haandklaede-kroel/3.webp", "images/hael-2-haeloeft-begge/1.webp", "images/hael-2-haeloeft-begge/2.webp", "images/hael-2-haeloeft-begge/3.webp", "images/hael-2-haeloeft-trin-begge/1.webp", "images/hael-2-haeloeft-trin-begge/2.webp", "images/hael-3-tungt-haeloeft-et-ben/1.webp", "images/hael-3-tungt-haeloeft-et-ben/2.webp", "images/hael-4-smaa-hop/1.webp", "images/hael-4-smaa-hop/2.webp", "images/hael-4-smaa-hop/3.webp", "images/hael-info/anatomi.webp"]; /* auto: tools/sync_images.py */

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => c.addAll(ASSETS).then(() => Promise.all(IMAGES.map(u => c.add(u).catch(() => null)))))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => e.request.mode === 'navigate' ? caches.match('index.html') : Response.error()))
  );
});
