/* Fiches exercices 3D (moteur d'Atlas Fitness 3D, atlas3d/atlas3d.js préchargé en tâche de fond à l'ouverture de l'appli).
   Les scènes sont montées un peu avant d'arriver à l'écran et gardées en vie (rendu en pause hors écran) :
   l'animation joue déjà quand on arrive dessus. Sans WebGL ou si le chargement échoue → vidéo d'avant. */
/* Exercice Ektyron → exercice Atlas (donne l'animation et les muscles principal / secondaire / stabilisateur). */
const A3D_MAP={dbinc:"incline-dumbbell-press",benchx:"bench-press",
 pompes:"push-up",diam:"diamond-push-up",pfly:"pec-deck",ecbh:"cable-crossover",dipsb:"dips",
 tvert:"lat-pulldown",tract:"pull-up",rowx:"barbell-row",rowinv:"australian-pull-up",elmac:"lateral-raise-machine",elath:"lateral-raise-dumbbell",
 pupi:"biceps-curl-machine",curld:"barbell-curl",triv:"triceps-pushdown",
 hack:"hack-squat",smsq:"smith-squat",press:"leg-press",squatpdc:"bodyweight-squat",lext:"leg-extension",lcurl1:"seated-leg-curl",lcurl2:"lying-leg-curl",
 hipt:"hip-thrust-barbell",moll:"calf-raise-machine",bext:"back-extension",
 abd:"hip-abductor",gain:"plank",
 dbfly:"ek-dbfly",dch:"ek-dch",incl:"ek-incl",pompesd:"ek-pompesd",dips:"ek-dips",rowu:"ek-rowu",rowm:"ek-rowm",rowc:"ek-rowc",tlarg:"ek-tlarg",rfly:"ek-rfly",facep:"ek-facep",oiseau:"ek-oiseau",ytw:"ek-ytw",dmil:"ek-dmil",elat:"ek-elat",pike:"ek-pike",shrug:"ek-shrug",cpou:"ek-cpou",curlh:"ek-curlh",mart:"ek-mart",marth:"ek-marth",curlpdc:"ek-curlpdc",tri1:"ek-tri1",ovh:"ek-ovh",extd:"ek-extd",dipsbanc:"ek-dipsbanc",gobsq:"ek-gobsq",sumosq:"ek-sumosq",bulg:"ek-bulg",fentes:"ek-fentes",stepup:"ek-stepup",rdl:"ek-rdl",rdlx:"ek-rdlx",nordic:"ek-nordic",pont:"ek-pont",kick:"ek-kick",addab:"ek-addab",abdp:"ek-abdp",moll2:"ek-moll2",crun:"ek-crun",releve:"ek-releve",hlr:"ek-hlr",deadbug:"ek-deadbug",heeltap:"ek-heeltap",rtwist:"ek-rtwist",suitc:"ek-suitc",superman:"ek-superman"};
/* « ~ » = mouvement proche mais pas identique : on montre l'animation sans la fiche technique d'Atlas. */
function a3dOf(id,a){return A3D_MAP[id]||A3D_MAP[a]||null}
(function(){
 const ok=(()=>{try{const c=document.createElement("canvas");return !!(window.WebGLRenderingContext&&(c.getContext("webgl2")||c.getContext("webgl")))}catch(e){return false}})();
 if(!ok){window.A3D_OFF=true;return}
 let eng=null,loading=null;
 const load=()=>eng?Promise.resolve(eng):loading||(loading=new Promise((res,rej)=>{const s=document.createElement("script");s.src="atlas3d/atlas3d.js?v=9";
  s.onload=()=>window.A3D_ENGINE?res(eng=window.A3D_ENGINE):rej();s.onerror=rej;document.head.appendChild(s)}));
 /* Préchargement du moteur et du modèle dès que l'appli est au repos (le service worker les garde ensuite en cache). */
 const warm=()=>load().catch(()=>{});
 const idleRun=f=>window.requestIdleCallback?requestIdleCallback(f,{timeout:4000}):setTimeout(f,1500);
 if(document.readyState==="complete")idleRun(warm);else addEventListener("load",()=>idleRun(warm),{once:true});
 /* Nombre de scènes vivantes à la fois (contextes WebGL) : moins sur téléphone. */
 const MAX=matchMedia("(pointer:coarse)").matches||(navigator.deviceMemory||8)<4?4:6;
 const live=new Map();/* el → {stop,seen} */const near=new Set(),vis=new Set();let anat=null;
 window.a3dAnatomy=(el,roles,pick)=>load().then(E=>{el.innerHTML="";return anat=E.anatomy(el,roles,pick)});
 const fallback=el=>{const v=el.dataset.v;el.outerHTML=v?`<video class="anim anim-v${el.classList.contains("g-anim")?" g-anim":""}" data-src="renders/${v}.mp4?v=${v==="rowu"?2:1}" muted loop playsinline preload="none"></video>`:""};
 /* Emplacement au repos = même gabarit que le lecteur (scène + barre de boutons + crédit) : la hauteur ne change pas au montage, la page ne saute pas. */
 const idle=el=>{const t=(el.dataset.a3d||"")[0]!=="~";el.innerHTML=`<div class="a3d-box"><div class="a3d-idle">◐ Vue 3D</div><div class="a3d-ctl a3d-ghost">${["❚❚","×0,5","face","profil","dos","3/4","Muscles","✓✗"].concat(t?["Technique"]:[]).map(b=>`<button tabindex="-1">${b}</button>`).join("")}</div><div class="a3d-cred">Anatomie : BodyParts3D © DBCLS, CC BY 4.0 (modifié)</div></div>`};
 const off=el=>{const l=live.get(el);if(!l)return;live.delete(el);if(l.stop){try{l.stop()}catch(e){}}if(el.isConnected)idle(el)};
 const sync=el=>{const l=live.get(el);if(l&&l.stop&&l.stop.active)l.stop.active(vis.has(el)&&!document.hidden)};
 /* Trop de scènes : on libère d'abord celles qui sont loin de l'écran, les plus anciennes en premier. */
 const trim=()=>{if(live.size<=MAX)return;const c=[...live].filter(([el])=>!vis.has(el)).sort((a,b)=>(near.has(a[0])-near.has(b[0]))||a[1].seen-b[1].seen);
  while(live.size>MAX&&c.length)off(c.shift()[0])};
 const on=el=>{if(live.has(el)||!el.isConnected)return;const l={stop:null,seen:Date.now()};live.set(el,l);trim();
  load().then(E=>{if(live.get(el)!==l||!el.isConnected)return;const x=el.dataset.a3d;l.stop=E.mount(el,x.replace("~",""),x[0]!=="~");
   /* Premières images rendues même hors écran (shaders compilés), puis pause si la scène n'est pas visible. */
   setTimeout(()=>sync(el),700)}).catch(()=>{window.A3D_OFF=true;live.clear();document.querySelectorAll(".a3d").forEach(fallback)})};
 /* Zone large (une hauteur et demie d'écran au-dessus et au-dessous) : on monte en avance. Zone visible : on fait tourner le rendu. */
 const ioNear=new IntersectionObserver(es=>{for(const e of es){if(e.isIntersecting){near.add(e.target);on(e.target)}else near.delete(e.target)}trim()},{rootMargin:"150% 0px 150% 0px"});
 const ioVis=new IntersectionObserver(es=>{for(const e of es){if(e.isIntersecting){vis.add(e.target);const l=live.get(e.target);if(l)l.seen=Date.now();else on(e.target)}else vis.delete(e.target);sync(e.target)}},{threshold:0});
 const add=el=>{if(el._a3d)return;el._a3d=1;idle(el);ioNear.observe(el);ioVis.observe(el);el.addEventListener("click",()=>on(el))};
 const scan=n=>{if(n.nodeType!==1)return;if(n.matches(".a3d"))add(n);n.querySelectorAll&&n.querySelectorAll(".a3d").forEach(add)};
 new MutationObserver(ms=>{let gone=false;for(const m of ms){m.addedNodes.forEach(scan);if(m.removedNodes.length)gone=true}
  if(gone)for(const el of [...live.keys()])if(!el.isConnected){off(el);near.delete(el);vis.delete(el);ioNear.unobserve(el);ioVis.unobserve(el)}}).observe(document.body,{childList:true,subtree:true});
 scan(document.body);
 document.addEventListener("visibilitychange",()=>{for(const el of live.keys())sync(el)});
})();
