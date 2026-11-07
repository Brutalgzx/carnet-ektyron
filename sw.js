const CACHE="ektyron-v15";
const ASSETS=["./", "index.html", "fonts.css","app.css","data.js","app.js","suivi.js","prep.js","anim.js", "manifest.webmanifest", "vendor/three.min.js", "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png", "fonts/BarlowCondensed-600.woff2", "fonts/BarlowCondensed-800.woff2", "fonts/IBMPlexMono-500.woff2", "fonts/IBMPlexSans-400.woff2", "fonts/IBMPlexSans-600.woff2"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS.map(u=>new Request(u,{cache:"reload"})))).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!=="ektyron-data").map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
/* Réseau d'abord (toujours la dernière version), cache seulement hors ligne. */
self.addEventListener("fetch",e=>{if(e.request.method!=="GET"||new URL(e.request.url).origin!==location.origin)return;
  const nav=e.request.mode==="navigate";
  e.respondWith(fetch(e.request,{cache:"no-cache"}).then(r=>{if(r.ok){const k=r.clone();caches.open(CACHE).then(c=>c.put(nav?"./":e.request,k))}return r})
   .catch(()=>caches.match(nav?"./":e.request,{ignoreSearch:true})))});
/* Rappels en arrière-plan (Chrome Android, appli installée) : l'appli recopie l'état utile dans le cache « ektyron-data ». */
self.addEventListener("periodicsync",e=>{if(e.tag==="coach-reminders")e.waitUntil(remind())});
async function remind(){const c=await caches.open("ektyron-data"),r=await c.match("reminders");if(!r)return;const D=await r.json();if(!D.on)return;
  const n=new Date(),wd=n.getDay(),day=864e5,now=Date.now(),tk=n.toISOString().slice(0,10),same=t=>!!t&&new Date(t).toDateString()===n.toDateString();if(n.getHours()<D.hour)return;D.last=D.last||{};const out=[];
  if(!same(D.lastW)&&(wd===D.wday||now-D.lastW>8*day))out.push(["pesee","C'est le jour de ta pesée","Le matin à jeun, toujours sur la même balance."]);
  if(!same(D.lastM)&&now-D.lastM>=13*day&&(wd===D.wday||now-D.lastM>16*day))out.push(["mesures","Jour de mensurations","Taille, bras, cuisse : 2 minutes avec un mètre ruban."]);
  if(!same(D.lastC)&&now-D.lastC>=6*day&&(wd===D.wday||now-D.lastC>9*day))out.push(["bilan","Ton bilan de la semaine","Sommeil, énergie, faim : 20 secondes pour que ton coach t'ajuste."]);
  const s=(D.train||[]).find(x=>x[0]===wd);if(s&&!same(D.lastG))out.push(["seance","Séance du jour : "+s[1],"Ton programme t'attend."]);
  for(const [k,t,b] of out){if(D.last[k]===tk)continue;D.last[k]=tk;await self.registration.showNotification(t,{body:b,tag:k,icon:"icons/icon-192.png",badge:"icons/icon-192.png",data:{go:k==="seance"?"today":"prog"}})}
  await c.put("reminders",new Response(JSON.stringify(D)))}
self.addEventListener("notificationclick",e=>{e.notification.close();const go=(e.notification.data||{}).go||"prog";
  e.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(cs=>{if(cs[0]){cs[0].postMessage({go});return cs[0].focus()}return clients.openWindow("./#"+go)}))});
