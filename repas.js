/* « Autre chose » à la place d'un plat du coach, comme dans un carnet alimentaire :
   🛒 produits tout prêts achetés en magasin (rayon traiteur d'aliments.js + catalogue Open Food Facts, filtrable par enseigne, ou code-barres),
   🏠 repas fait maison composé d'ingrédients (aliments.js + ingrédients des recettes).
   Un repas = une liste de produits avec leur quantité ; il remplace le plat prévu ce jour-là (« coach-own »), les autres repas comblent le reste.
   On peut le garder dans « Mes repas » (« coach-mymeals ») pour le reprendre en un geste. */
let OWN=null,OWNR=[],OWNT=null;
const OWN_ST=[["","Toutes"],["carrefour","Carrefour"],["e-leclerc","Leclerc"],["auchan","Auchan"],["intermarche","Intermarché"],["lidl","Lidl"],["super-u","Super U"],["monoprix","Monoprix"],["aldi","Aldi"],["franprix","Franprix"],["picard","Picard"],["casino","Casino"]];
const ownDate=d=>new Date(Date.now()+(((+d+6)%7)-((new Date().getDay()+6)%7))*864e5).toISOString().slice(0,10);
function ownOf(d){return LS.get("coach-own",{})[ownDate(d)]||{}}
function ownSum(L){const s=L.reduce((a,x)=>({k:a.k+x.k,P:a.P+x.P,C:a.C+x.C,F:a.F+x.F}),{k:0,P:0,C:0,F:0});for(const k in s)s[k]=Math.round(s[k]*10)/10;return s}
function ownName(L){const n=L.map(x=>x.n.replace(/\s*\(.*\)$/,""));return n.length>2?n.slice(0,2).join(", ")+` + ${n.length-2}`:n.join(" + ")}
function ownSave(day,slot,m){const O=LS.get("coach-own",{}),k=ownDate(day),lim=new Date(Date.now()-14*864e5).toISOString().slice(0,10);O[k]=O[k]||{};if(m)O[k][slot]=m;else delete O[k][slot];
 for(const j in O)if(j<lim||!Object.keys(O[j]).length)delete O[j];LS.set("coach-own",O)}
const ownSlot=s=>((mealSlots().find(m=>m[0]===s)||MEALS4.find(m=>m[0]===s)||[s,s])[1]);
/* Résultats locaux : rayon traiteur et tout aliments.js ; en mode maison, aussi les ingrédients bruts des recettes. */
function ownLocal(q){const W=fold(q).split(/\s+/).filter(Boolean),ok=t=>W.every(w=>fold(t).includes(w));
 let L=ALIM.slice();
 if(OWN.t==="m")L=L.concat(Object.keys(ING).map(i=>{const d=ING[i];return{id:"ing:"+i,n:typeof ingName==="function"?ingName(i):d[0],g:"Ingrédients",e:"🥕",k:d[1],P:d[2],C:d[3],F:d[4],pg:(NUT[i]||[])[11]||100,pu:"portion"}}));
 if(!W.length)return OWN.t==="m"?L.filter(x=>x.g==="Ingrédients").slice(0,30):L.filter(x=>x.g==="Rayon traiteur (tout prêt)");
 return L.filter(x=>ok(x.n+" "+x.g)).slice(0,30)}
function ownLi(x,i){return `<li><button class="lnk sp" style="text-align:left;display:flex;gap:10px;align-items:center" data-ownpick="${i}">${x.img?`<img src="${esc(x.img)}" alt="" loading="lazy" style="width:44px;height:44px;object-fit:cover;border-radius:10px;flex:none" onerror="this.remove()">`:`<span style="font-size:22px">${x.e}</span>`}<span>${esc(x.n)}${x.b?` <small class="muted">· ${esc(x.b)}</small>`:""}<br><small class="muted">${x.pu==="× 100 g"?"100 g":`1 ${esc(x.pu)} (${fr(x.pg)} g)`} · ${fr(x.k*x.pg/100)} kcal · ${fr(x.P*x.pg/100,1)} g prot.${x.s?" · "+esc(x.s):""}</small></span></button></li>`}
function ownList(local,online,msg,lab){OWNR=[...local,...online];const R=$("#own-res");if(!R)return;
 R.innerHTML=`${local.length?`${lab?`<div class="lab">${lab}</div>`:""}<ul class="list">${local.map((x,i)=>ownLi(x,i)).join("")}</ul>`:""}${online.length?`<div class="lab">Dans les magasins (Open Food Facts)</div><ul class="list">${online.map((x,i)=>ownLi(x,local.length+i)).join("")}</ul>`:""}${msg?`<p class="small muted">${msg}</p>`:""}`}
/* Ouverture : depuis la fiche d'un plat (slot connu, « à la place ») ou depuis l'Accueil (« ＋ Ajouter mon plat » : choix du repas, à la place ou en plus). */
function ownNoPlan(){return !!(PROF.refined&&PROF.refined.nut===0)}
function ownSlots(){return ownNoPlan()?MEALS4:mealSlots()}
function ownGuess(){const h=new Date().getHours(),S=ownSlots().map(x=>x[0]),w=h<10?"pdj":h<15?"dej":h<18&&S.includes("snack")?"snack":"din";return S.includes(w)?w:S[S.length-1]}
function ownStart(slot,day,home){const cur=ownOf(day)[slot];OWN={slot,day,home:!!home,mode:ownNoPlan()?"add":"rep",t:cur?cur.t||"s":"s",st:"",items:cur?cur.items.map(x=>({...x})):[],n:cur?cur.n:"",had:!!cur};ownSheet()}
function ownSheet(){EXF=null;
 const {items,t}=OWN,T=ownSum(items),my=LS.get("coach-mymeals",[]),rec=LS.get("coach-ownrec",[]),sl=ownSlot(OWN.slot).toLowerCase(),
 el=pkSheet(`<div class="row" style="padding-top:18px"><h2 class="sp" style="margin:0">${OWN.home?"Ajouter mon plat":"Autre chose · "+esc(ownSlot(OWN.slot))}</h2><button class="chip" data-ownclose aria-label="Fermer">✕</button></div>
 ${OWN.home?`<div class="row" style="gap:6px;flex-wrap:wrap">${ownSlots().map(([k,l])=>`<button class="chip" data-ownslot="${k}" aria-pressed="${OWN.slot===k}">${esc(l)}</button>`).join("")}</div>
  ${ownNoPlan()?"":`<div class="row" style="gap:6px;flex-wrap:wrap"><button class="chip" data-ownmode="rep" aria-pressed="${OWN.mode==="rep"}">À la place du plat prévu</button><button class="chip" data-ownmode="add" aria-pressed="${OWN.mode==="add"}">En plus du plat prévu</button></div>`}`
  :`<p class="small muted" style="margin:0">Un repas que tu cuisines toi-même, ou des produits tout prêts achetés en magasin. Il remplace le plat prévu ce jour-là ; tes autres repas s'ajustent.</p>`}
 ${items.length?`<div class="card stack" style="gap:8px"><div class="lab" style="margin:0">Mon plat</div><ul class="list">${items.map((x,i)=>`<li><span style="font-size:20px">${x.e||"🍽️"}</span><span class="sp">${esc(x.n)}<br><small class="muted">${x.g?fr(x.g)+" g · ":""}${fr(x.k)} kcal · ${fr(x.P,1)} g prot.</small></span><button class="chip" data-owndel="${i}" aria-label="Retirer ${esc(x.n)}">✕</button></li>`).join("")}</ul>
  <div class="mono" style="text-align:center"><b>${fr(T.k)} kcal</b> · ${fr(T.P)} g prot. · ${fr(T.C)} g gluc. · ${fr(T.F)} g lip.</div>
  <input id="own-n" class="srch" placeholder="Nom du plat (facultatif)" value="${esc(OWN.n||"")}" maxlength="60">
  <label class="small row" style="gap:8px"><input type="checkbox" id="own-keep"> ⭐ Garder dans « Mes plats » pour le reprendre plus tard</label>
  <button class="btn" id="own-ok">${OWN.mode==="add"?`Ajouter · ${esc(ownSlot(OWN.slot))}`:`Manger ça · ${esc(ownSlot(OWN.slot))}`}</button></div>`:""}
 ${ownOf(OWN.day)[OWN.slot]&&OWN.mode==="rep"?`<button class="btn ghost" id="own-reset">↩ Revenir au plat prévu par le coach</button>`:""}
 ${my.length?`<div class="lab">⭐ Mes plats</div><ul class="list">${my.map((m,i)=>`<li><button class="lnk sp" style="text-align:left" data-mymeal="${i}"><span style="font-size:20px">${m.e}</span> ${esc(m.n)}<br><small class="muted">${fr(m.k)} kcal · ${fr(m.P)} g prot.</small></button><button class="chip" data-mymdel="${i}" aria-label="Oublier ${esc(m.n)}">✕</button></li>`).join("")}</ul>`:""}
 <div class="row" style="gap:6px"><button class="chip" data-ownt="s" aria-pressed="${t==="s"}">🛒 Acheté en magasin</button><button class="chip" data-ownt="m" aria-pressed="${t==="m"}">🏠 Fait maison</button></div>
 <div class="row" style="gap:6px"><input id="own-q" class="srch" style="flex:1" type="search" autocomplete="off" placeholder="${t==="s"?"Produit, marque ou code-barres…":"Ingrédient : poulet, riz, œuf…"}"><button class="btn sm" data-ownscan aria-label="Scanner un code-barres">📷 Scan</button></div>
 <div id="own-cam" hidden></div>
 ${t==="s"?`<div class="row" style="gap:6px;flex-wrap:wrap">${OWN_ST.map(([k,l])=>`<button class="chip" data-ownst="${k}" aria-pressed="${OWN.st===k}">${l}</button>`).join("")}</div>`:""}
 <div id="own-res"></div>`,"Ajouter mon plat");
 const r0=t==="s"?rec:[];ownList(r0.length?r0:ownLocal(""),[],r0.length?"":t==="s"?"Cherche n'importe quel produit de supermarché (Carrefour, Leclerc, Lidl, Auchan…) ou scanne son code-barres.":"Ajoute chaque ingrédient avec sa quantité, comme pour une recette.",r0.length?"🕘 Récents":"");
 el.querySelector("#own-q").addEventListener("input",e=>{const q=e.target.value.trim();clearTimeout(OWNT);ownList(ownLocal(q),[],q.length>=2&&OWN.t==="s"?"Recherche dans les magasins…":"");if(q.length>=2&&OWN.t==="s")OWNT=setTimeout(()=>ownOff(q),550)})}
/* Scanner : caméra arrière, décodage par ZXing (vendor/zxing.min.js, chargé au premier scan). */
let OWNCAM=null;
function ownScanStop(){try{OWNCAM&&OWNCAM.reset()}catch(e){}OWNCAM=null;const c=$("#own-cam");if(c){c.hidden=true;c.innerHTML=""}}
function ownScan(){const c=$("#own-cam");if(!c)return;if(OWNCAM)return ownScanStop();
 c.hidden=false;c.innerHTML=`<div style="position:relative;border-radius:16px;overflow:hidden;background:#000"><video id="own-vid" playsinline muted style="width:100%;max-height:40vh;object-fit:cover;display:block"></video><div style="position:absolute;left:12%;right:12%;top:45%;height:2px;background:#FF7A1A;box-shadow:0 0 8px #FF7A1A"></div></div><p class="small muted" style="margin:6px 0 0;text-align:center">Vise le code-barres du produit… <button class="lnk" data-ownscan>Arrêter</button></p>`;
 const go=()=>{const R=new ZXing.BrowserMultiFormatReader();OWNCAM=R;R.decodeFromConstraints({video:{facingMode:"environment"}},"own-vid",(res)=>{if(!res||OWNCAM!==R)return;const code=res.getText();ownScanStop();navigator.vibrate&&navigator.vibrate(60);
  if(OWN.t!=="s"){OWN.t="s";ownSheet()}const q=$("#own-q");q.value=code;ownList([],[],"Code "+code+" : recherche du produit…");ownOff(code,true)}).catch(()=>{ownScanStop();toast("Caméra indisponible : autorise l'appareil photo, ou tape les chiffres du code-barres.")})};
 if(window.ZXing)return go();const sc=document.createElement("script");sc.src="vendor/zxing.min.js";sc.onload=go;sc.onerror=()=>{ownScanStop();toast("Scanner indisponible hors connexion : tape les chiffres du code-barres.")};document.head.appendChild(sc)}
/* Open Food Facts : produits vendus en France, triés par popularité, filtrés par enseigne si choisie ; code-barres (8 à 14 chiffres) = fiche directe. */
function ownOff(q,scan){const st=OWN.st,F="code,stores_tags,product_name_fr,product_name,brands,stores,quantity,serving_quantity,serving_size,nutriments,image_small_url",get=u=>fetch(u,AbortSignal.timeout?{signal:AbortSignal.timeout(8000)}:{}).then(r=>{if(!r.ok)throw 0;return r.json()}),
 conv=p=>{const n=p.nutriments||{},k=+n["energy-kcal_100g"],sq=+p.serving_quantity;if(!(k>=0)||n["energy-kcal_100g"]==null)return null;
  return{id:"off:"+p.code,n:(p.product_name_fr||p.product_name||"").trim().slice(0,70),b:(Array.isArray(p.brands)?p.brands.join(","):p.brands||"").split(",")[0].trim(),s:(Array.isArray(p.stores)?p.stores.join(","):p.stores||"").split(",").slice(0,2).map(x=>x.trim()).filter(Boolean).join(", "),
   e:"🛒",img:p.image_small_url||"",k,P:+n.proteins_100g||0,C:+n.carbohydrates_100g||0,F:+n.fat_100g||0,pg:sq>0&&sq<2000?sq:100,pu:sq>0&&sq<2000?"portion":"× 100 g"}},
 show=L=>{if(fold($("#own-q")?.value.trim())!==fold(q))return;const R=L.map(conv).filter(x=>x&&x.n);if(scan){ownList([],R,R.length?"":"Produit inconnu de la base : cherche-le par son nom.");if(R.length===1)foodQty(OWNR[0]);return}ownList(ownLocal(q),R,R.length?"":"Rien trouvé dans les magasins pour ça : essaie un autre mot, une marque, ou une autre enseigne.")};
 if(/^\d{8,14}$/.test(q))return get(`https://world.openfoodfacts.org/api/v2/product/${q}.json?fields=${F}`).then(j=>show(j.product?[{...j.product,code:q}]:[])).catch(()=>show([]));
 const e=encodeURIComponent(q);
 get(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${e}&search_simple=1&action=process&json=1&page_size=24&sort_by=unique_scans_n&tagtype_0=countries&tag_contains_0=contains&tag_0=france${st?`&tagtype_1=stores&tag_contains_1=contains&tag_1=${encodeURIComponent(st)}`:""}&fields=${F}`)
  /* Secours : moteur de recherche récent (sans filtre de pays) ; l'enseigne est alors filtrée ici. */
  .catch(()=>get(`https://search.openfoodfacts.org/search?q=${e}&langs=fr&page_size=40&fields=${F}`).then(j=>({products:(j.hits||[]).filter(p=>!st||fold(String(p.stores||"")+" "+(p.stores_tags||[]).join(" ")).replace(/[^a-z]/g,"").includes(st.replace(/[^a-z]/g,"").replace(/^e/,"")))})))
  .then(j=>show(j.products||j.hits||[])).catch(()=>{if(fold($("#own-q")?.value.trim())===fold(q))ownList(ownLocal(q),[],"Pas de connexion : les magasins ne répondent pas. Le rayon traiteur ci-dessus marche hors ligne.")})}
document.addEventListener("click",e=>{const t=e.target.closest("button");if(!t||!PROF)return;const D=t.dataset;
 if(D.own!==undefined&&D.day!==undefined){ownStart(D.own,D.day);return}
 if(D.addplat!==undefined){const d=D.addplat||String(new Date().getDay());ownStart(ownGuess(),d,true);OWN.items=[];OWN.n="";OWN.had=false;ownSheet();return}
 if(!OWN)return;
 if(D.ownscan!==undefined){ownScan();return}
 if(D.ownslot){OWN.slot=D.ownslot;ownSheet();return}
 if(D.ownmode){OWN.mode=D.ownmode;ownSheet();return}
 if(D.ownclose!==undefined){ownScanStop();const o=OWN;OWN=null;if(o.home){$("#sheet")?.remove();return}const r=week().days[wIdx(+o.day)][o.slot];RECI[r]&&!o.had&&recBack?openRecipe(r,o.slot,o.day):$("#sheet")?.remove();return}
 if(D.ownback!==undefined){FQ=null;ownSheet();return}
 if(D.ownt){ownScanStop();OWN.t=D.ownt;ownSheet();return}
 if(D.ownst!==undefined){OWN.st=D.ownst;t.parentElement.querySelectorAll("[data-ownst]").forEach(b=>b.setAttribute("aria-pressed",b===t));const q=$("#own-q").value.trim();if(q.length>=2)ownOff(q);return}
 if(D.ownpick){const x=OWNR[+D.ownpick];if(x){ownScanStop();OWN.n=$("#own-n")?.value||OWN.n;foodQty(x)}return}
 if(D.owndel){OWN.items.splice(+D.owndel,1);ownSheet();return}
 if(D.mymeal){const m=LS.get("coach-mymeals",[])[+D.mymeal];if(m){OWN.items=m.items.map(x=>({...x}));OWN.n=m.n;OWN.t=m.t;ownSheet()}return}
 if(D.mymdel){const L=LS.get("coach-mymeals",[]);L.splice(+D.mymdel,1);LS.set("coach-mymeals",L);ownSheet();return}
 if(t.id==="fq-ok"&&FQ){const {x,g}=FQ,r=v=>Math.round(v*g/10)/10;if(!g)return toast("Indique la quantité.");
  OWN.items.push({n:x.n+(x.b?` (${x.b})`:""),e:x.e,g:Math.round(g),k:Math.round(x.k*g/100),P:r(x.P),C:r(x.C),F:r(x.F)});
  if(String(x.id).startsWith("off:"))LS.set("coach-ownrec",[x,...LS.get("coach-ownrec",[]).filter(y=>y.id!==x.id)].slice(0,12));FQ=null;ownSheet();return}
 if(t.id==="own-reset"){ownSave(OWN.day,OWN.slot,null);const o=OWN;OWN=null;$("#sheet")?.remove();render();toast(`${ownSlot(o.slot)} : retour au plat prévu.`);return}
 if(t.id==="own-ok"){const L=OWN.items;if(!L.length)return;const T=ownSum(L),n=($("#own-n").value.trim()||ownName(L)).slice(0,60),m={n,e:OWN.t==="m"?"🏠":L[0].e||"🛒",t:OWN.t,items:L,...T};
  if($("#own-keep")?.checked){const M=LS.get("coach-mymeals",[]).filter(x=>x.n!==n);LS.set("coach-mymeals",[m,...M].slice(0,30))}
  const o=OWN;OWN=null;$("#sheet")?.remove();
  if(o.mode==="add"){exSave(o.day,o.slot,X=>[...X,...L.map(x=>({...x}))]);render();toast(`${ownSlot(o.slot)} : +${fr(T.k)} kcal, +${fr(T.P)} g de protéines.`);return}
  ownSave(o.day,o.slot,m);render();toast(`${ownSlot(o.slot)} : ${n} (${fr(T.k)} kcal). Tes autres repas s'ajustent.`)}});
/* Accueil sans plan de repas : ce que tu as noté aujourd'hui (extras) et le bouton pour ajouter un plat. */
function ownHome(d,T){const E=LS.get("coach-extra",{})[ownDate(d)]||{},rows=Object.keys(E).flatMap(s=>E[s].map((x,i)=>`<li><span style="font-size:20px">${x.e||"🍽️"}</span><span class="sp">${esc(x.n)}<br><small class="muted">${esc(s==="x"?"Hors repas":ownSlot(s))} · ${fr(x.k)} kcal · ${fr(x.P,1)} g prot.</small></span><button class="chip" data-exdel="${i}" data-slot="${s}" data-day="${d}" data-exfrom="n" aria-label="Retirer ${esc(x.n)}">✕</button></li>`)),
 got=Object.values(E).flat().reduce((a,x)=>({k:a.k+x.k,P:a.P+x.P,C:a.C+x.C,F:a.F+x.F}),{k:0,P:0,C:0,F:0});
 return `<div class="lab" style="margin-top:6px">Ce que j'ai mangé aujourd'hui</div>${rows.length?macroBlock(T,got)+`<ul class="list">${rows.join("")}</ul>`:""}<button class="btn ghost" data-addplat="${d}">＋ Ajouter mon plat</button>`}
