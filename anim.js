/* Animations d'exercices : vidéos 3D « mauvais / bon mouvement » (renders/<id>.mp4, générées par renders/gen.py). */
/* Vidéos : chargées et lues seulement quand elles sont à l'écran ; si la vidéo ne se charge pas (hors ligne), elle est retirée.
   iPhone : chaque vidéo chargée garde un lecteur ; trop de lecteurs ou un retour dans l'appli = écran noir. Donc une vidéo
   qui sort de l'écran est vidée (lecteur libéré), et une vidéo à l'écran qui n'avance pas est rechargée toute seule. */
(function(){if(!("IntersectionObserver" in window))return;
 const vis=new Set(),T=new WeakMap();
 const free=v=>{v.pause();if(v.getAttribute("src")){v.removeAttribute("src");try{v.load()}catch(e){}}};
 const go=v=>{if(!v.getAttribute("src"))v.src=v.dataset.src;const p=v.play();if(p)p.catch(()=>{});watch(v)};
 /* Relance : vide puis recharge la vidéo (le lecteur iOS repart de zéro). */
 const reload=v=>{v._try=(v._try||0)+1;free(v);setTimeout(()=>{if(vis.has(v)&&v.isConnected)go(v)},60)};
 /* Garde : 3 s après le lancement, si l'image n'avance pas alors que la vidéo est à l'écran, on recharge (3 essais). */
 const watch=v=>{clearTimeout(T.get(v));const t0=v.currentTime;T.set(v,setTimeout(()=>{if(!vis.has(v)||document.hidden||!v.isConnected)return;
  if(v.readyState<2||v.paused||v.currentTime===t0){if((v._try||0)<3)reload(v)}else v._try=0},3000))};
 const io=new IntersectionObserver(es=>es.forEach(en=>{const v=en.target;if(en.isIntersecting){vis.add(v);go(v)}else{vis.delete(v);clearTimeout(T.get(v));free(v)}}),{rootMargin:"200px"});
 const fb=v=>{io.unobserve(v);vis.delete(v);v.remove()};
 /* Erreur : on retente si on a du réseau ; on retire la vidéo seulement hors ligne ou après 3 essais. */
 const err=v=>{if(!v.getAttribute("src"))return;if(navigator.onLine!==false&&(v._try||0)<3&&vis.has(v))setTimeout(()=>reload(v),800);else fb(v)};
 const scan=r=>{const l=r.querySelectorAll?[...r.querySelectorAll("video.anim-v")]:[];if(r.matches&&r.matches("video.anim-v"))l.push(r);
  for(const v of l)if(!v._io){v._io=1;if(!v._er){v._er=1;v.addEventListener("error",()=>err(v))}io.observe(v)}};
 const drop=n=>{const l=n.matches&&n.matches("video.anim-v")?[n]:n.querySelectorAll?[...n.querySelectorAll("video.anim-v")]:[];
  for(const v of l)if(!v.isConnected){v._io=0;vis.delete(v);io.unobserve(v);clearTimeout(T.get(v));free(v)}};
 /* Retour dans l'appli : iOS a souvent perdu le lecteur des vidéos à l'écran, on les recharge. */
 const back=()=>{if(document.hidden)return;for(const v of [...vis]){if(!v.isConnected){vis.delete(v);continue}v._try=0;reload(v)}};
 document.addEventListener("visibilitychange",()=>{if(document.hidden)vis.forEach(v=>v.pause());else back()});
 window.addEventListener("pageshow",e=>{if(e.persisted)back()});
 scan(document);new MutationObserver(ms=>{for(const m of ms){for(const n of m.removedNodes)if(n.nodeType===1)drop(n);for(const n of m.addedNodes)if(n.nodeType===1)scan(n)}})
  .observe(document.body,{childList:true,subtree:true})})();
