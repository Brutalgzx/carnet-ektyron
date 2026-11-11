/* Animations d'exercices : vidéos 3D « mauvais / bon mouvement » (renders/<id>.mp4, générées par renders/gen.py). */
/* Vidéos : chargées et lues seulement quand elles sont à l'écran ; si la vidéo ne se charge pas (hors ligne), elle est retirée. */
(function(){if(!("IntersectionObserver" in window))return;
 const io=new IntersectionObserver(es=>es.forEach(en=>{const v=en.target;if(en.isIntersecting){if(!v.getAttribute("src"))v.src=v.dataset.src;const p=v.play();if(p)p.catch(()=>{})}else v.pause()}),{rootMargin:"200px"});
 const fb=v=>{io.unobserve(v);v.remove()};
 const scan=r=>{const l=r.querySelectorAll?[...r.querySelectorAll("video.anim-v")]:[];if(r.matches&&r.matches("video.anim-v"))l.push(r);
  for(const v of l)if(!v._io){v._io=1;v.addEventListener("error",()=>fb(v));io.observe(v)}};
 scan(document);new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1)scan(n)}).observe(document.body,{childList:true,subtree:true})})();
