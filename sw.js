const CACHE="ektyron-v4";
const ASSETS=["./", "index.html", "fonts.css","app.css","data.js","app.js","anim.js", "manifest.webmanifest", "vendor/three.min.js", "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png", "fonts/BarlowCondensed-600.woff2", "fonts/BarlowCondensed-800.woff2", "fonts/IBMPlexMono-500.woff2", "fonts/IBMPlexSans-400.woff2", "fonts/IBMPlexSans-600.woff2"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",e=>{if(e.request.method!=="GET"||new URL(e.request.url).origin!==location.origin)return;
  if(e.request.mode==="navigate"){e.respondWith(fetch(e.request).then(r=>{const k=r.clone();caches.open(CACHE).then(c=>c.put("./",k));return r}).catch(()=>caches.match("./")));return}
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))});
