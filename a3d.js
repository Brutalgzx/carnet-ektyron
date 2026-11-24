/* Fiches exercices 3D (moteur d'Atlas Fitness 3D, atlas3d/atlas3d.js chargé seulement quand une fiche 3D est à l'écran).
   Une seule scène 3D vivante à la fois : la fiche la plus visible. Sans WebGL ou si le chargement échoue → vidéo d'avant. */
/* Exercice Ektyron → exercice Atlas (donne l'animation et les muscles principal / secondaire / stabilisateur). */
const A3D_MAP={incl:"~incline-dumbbell-press",dbinc:"incline-dumbbell-press",benchx:"bench-press",dch:"~bench-press",
 pompes:"push-up",pompesd:"~push-up",diam:"diamond-push-up",pfly:"pec-deck",ecbh:"cable-crossover",dips:"~dips",dipsb:"dips",
 tvert:"lat-pulldown",tract:"pull-up",rowm:"~seated-row-machine",rowc:"~seated-row-machine",rowx:"barbell-row",rowinv:"australian-pull-up",
 dmil:"~shoulder-press-machine",elmac:"lateral-raise-machine",elath:"lateral-raise-dumbbell",elat:"~lateral-raise-dumbbell",
 pupi:"biceps-curl-machine",curld:"barbell-curl",triv:"triceps-pushdown",tri1:"~triceps-pushdown",
 hack:"hack-squat",smsq:"smith-squat",press:"leg-press",squatpdc:"bodyweight-squat",lext:"leg-extension",lcurl1:"seated-leg-curl",lcurl2:"lying-leg-curl",
 hipt:"hip-thrust-barbell",moll:"calf-raise-machine",crun:"~abdominal-crunch-machine",bext:"back-extension",
 abd:"hip-abductor",abdp:"~hip-abductor",addab:"~hip-abductor",gain:"plank"};
/* « ~ » = mouvement proche mais pas identique : on montre l'animation sans la fiche technique d'Atlas. */
function a3dOf(id,a){return A3D_MAP[id]||A3D_MAP[a]||null}
(function(){
 const ok=(()=>{try{const c=document.createElement("canvas");return !!(window.WebGLRenderingContext&&(c.getContext("webgl2")||c.getContext("webgl")))}catch(e){return false}})();
 if(!ok){window.A3D_OFF=true;return}
 let eng=null,loading=null,cur=null,stop=null;const vis=new Map();
 const load=()=>eng?Promise.resolve(eng):loading||(loading=new Promise((res,rej)=>{const s=document.createElement("script");s.src="atlas3d/atlas3d.js?v=3";
  s.onload=()=>window.A3D_ENGINE?res(eng=window.A3D_ENGINE):rej();s.onerror=rej;document.head.appendChild(s)}));
 const fallback=el=>{const v=el.dataset.v;el.outerHTML=v?`<video class="anim anim-v${el.classList.contains("g-anim")?" g-anim":""}" data-src="renders/${v}.mp4?v=${v==="rowu"?2:1}" muted loop playsinline preload="none"></video>`:""};
 /* Emplacement au repos = même gabarit que le lecteur (scène + barre de boutons + crédit) : la hauteur ne change pas au montage, la page ne saute pas. */
 const idle=(el,txt="◐ Vue 3D")=>{const t=(el.dataset.a3d||"")[0]!=="~";el.innerHTML=`<div class="a3d-box"><div class="a3d-idle">${txt}</div><div class="a3d-ctl a3d-ghost">${["❚❚","×0,5","face","profil","dos","3/4","Muscles"].concat(t?["Technique"]:[]).map(b=>`<button tabindex="-1">${b}</button>`).join("")}</div><div class="a3d-cred">Anatomie : BodyParts3D © DBCLS, CC BY 4.0 (modifié)</div></div>`};
 const off=()=>{if(stop){try{stop()}catch(e){}}stop=null;if(cur&&cur.isConnected)idle(cur);cur=null};
 const on=el=>{if(el===cur)return;off();cur=el;const i=el.querySelector(".a3d-idle");if(i)i.textContent="Chargement 3D…";else idle(el,"Chargement 3D…");
  load().then(E=>{if(cur!==el)return;const x=el.dataset.a3d;stop=E.mount(el,x.replace("~",""),x[0]!=="~")}).catch(()=>{window.A3D_OFF=true;cur=null;document.querySelectorAll(".a3d").forEach(fallback)})};
 /* Pendant un défilement on ne monte / démonte rien (pas de gel sous le doigt) : on attend que la page soit immobile. */
 let lastScroll=0,tm=0;const later=()=>{clearTimeout(tm);tm=setTimeout(()=>Date.now()-lastScroll<200?later():pick(),220)};
 addEventListener("scroll",()=>{lastScroll=Date.now();later()},{passive:true,capture:true});
 const pick=()=>{let b=null,m=.35;for(const [el,r] of vis)if(el.isConnected&&r>m){m=r;b=el}if(b)on(b);else if(cur&&!(vis.get(cur)>0))off()};
 const io=new IntersectionObserver(es=>{for(const e of es)vis.set(e.target,e.intersectionRatio);Date.now()-lastScroll<200?later():pick()},{threshold:[0,.2,.35,.5,.75,1]});
 const add=el=>{if(el._a3d)return;el._a3d=1;idle(el);io.observe(el);el.addEventListener("click",()=>{if(el!==cur)on(el)})};
 const scan=n=>{if(n.nodeType!==1)return;if(n.matches(".a3d"))add(n);n.querySelectorAll&&n.querySelectorAll(".a3d").forEach(add)};
 new MutationObserver(ms=>{for(const m of ms){m.addedNodes.forEach(scan);for(const n of m.removedNodes)if(n.nodeType===1&&(n===cur||n.contains&&cur&&n.contains(cur))){vis.delete(cur);off()}}
  for(const el of vis.keys())if(!el.isConnected)vis.delete(el)}).observe(document.body,{childList:true,subtree:true});
 scan(document.body);
 document.addEventListener("visibilitychange",()=>{if(document.hidden)off();else pick()});
})();
