const CACHE="ektyron-v9";
const ASSETS=["./", "index.html", "fonts.css","app.css","data.js","app.js","anim.js", "manifest.webmanifest", "vendor/three.min.js", "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png", "fonts/BarlowCondensed-600.woff2", "fonts/BarlowCondensed-800.woff2", "fonts/IBMPlexMono-500.woff2", "fonts/IBMPlexSans-400.woff2", "fonts/IBMPlexSans-600.woff2"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS.map(u=>new Request(u,{cache:"reload"})))).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
/* Réseau d'abord (toujours la dernière version), cache seulement hors ligne. */
self.addEventListener("fetch",e=>{if(e.request.method!=="GET"||new URL(e.request.url).origin!==location.origin)return;
  const nav=e.request.mode==="navigate";
  e.respondWith(fetch(e.request,{cache:"no-cache"}).then(r=>{if(r.ok){const k=r.clone();caches.open(CACHE).then(c=>c.put(nav?"./":e.request,k))}return r})
   .catch(()=>caches.match(nav?"./":e.request,{ignoreSearch:true})))});
