// PoolDrive service worker: makes the app installable and receives files shared from other apps.
const SHARE_DB = 'pooldrive-share';
function db() {
  return new Promise((ok, bad) => {
    const r = indexedDB.open(SHARE_DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore('inbox');
    r.onsuccess = () => ok(r.result); r.onerror = () => bad(r.error);
  });
}
async function keep(entry) {
  const d = await db();
  await new Promise((ok, bad) => { const t = d.transaction('inbox', 'readwrite'); t.objectStore('inbox').put(entry, 'pending'); t.oncomplete = ok; t.onerror = () => bad(t.error); });
}
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method === 'POST' && u.pathname.endsWith('/share')) {
    e.respondWith((async () => {
      try {
        const f = await e.request.formData();
        const files = f.getAll('files').filter(x => x && typeof x === 'object' && x.size >= 0);
        await keep({ at: Date.now(), files, title: f.get('title') || '', text: f.get('text') || '', url: f.get('url') || '' });
      } catch (err) {}
      return Response.redirect('./?share=1', 303);
    })());
    return;
  }
  // pages: network first, so updates show straight away; the saved copy is used when offline
  const home = new URL('./', self.registration.scope).pathname;   // only the PoolDrive page itself, not privacy.html or the app download
  if (e.request.mode === 'navigate' && u.origin === location.origin && u.pathname === home) {
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open('pd-pages').then(k => k.put('./', c)); return r; })
      .catch(() => caches.match('./')));
  }
});
