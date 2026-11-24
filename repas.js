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
function ownList(local,online,msg){OWNR=[...local,...online];const R=$("#own-res");if(!R)return;
 R.innerHTML=`${local.length?`<ul class="list">${local.map((x,i)=>ownLi(x,i)).join("")}</ul>`:""}${online.length?`<div class="lab">Dans les magasins (Open Food Facts)</div><ul class="list">${online.map((x,i)=>ownLi(x,local.length+i)).join("")}</ul>`:""}${msg?`<p class="small muted">${msg}</p>`:""}`}
function ownSheet(slot,day){if(slot!=null){const cur=ownOf(day)[slot];OWN={slot,day,t:cur?cur.t||"s":"s",st:"",items:cur?cur.items.map(x=>({...x})):[],n:cur?cur.n:"",had:!!cur}}EXF=null;
 const {items,t}=OWN,T=ownSum(items),my=LS.get("coach-mymeals",[]),
 el=pkSheet(`<div class="row" style="padding-top:18px"><h2 class="sp" style="margin:0">Autre chose · ${esc(ownSlot(OWN.slot))}</h2><button class="chip" data-ownclose aria-label="Fermer">✕</button></div>
 <p class="small muted" style="margin:0">Un repas que tu cuisines toi-même, ou des produits tout prêts achetés en magasin (2 petits wraps, une salade en barquette…). Il remplace le plat prévu ce jour-là ; tes autres repas s'ajustent pour garder tes calories et tes protéines.</p>
 ${items.length?`<div class="card stack" style="gap:8px"><div class="lab" style="margin:0">Mon repas</div><ul class="list">${items.map((x,i)=>`<li><span style="font-size:20px">${x.e||"🍽️"}</span><span class="sp">${esc(x.n)}<br><small class="muted">${x.g?fr(x.g)+" g · ":""}${fr(x.k)} kcal · ${fr(x.P,1)} g prot.</small></span><button class="chip" data-owndel="${i}" aria-label="Retirer ${esc(x.n)}">✕</button></li>`).join("")}</ul>
  <div class="mono" style="text-align:center"><b>${fr(T.k)} kcal</b> · ${fr(T.P)} g prot. · ${fr(T.C)} g gluc. · ${fr(T.F)} g lip.</div>
  <input id="own-n" class="srch" placeholder="Nom du repas (facultatif)" value="${esc(OWN.n||"")}" maxlength="60">
  <label class="small row" style="gap:8px"><input type="checkbox" id="own-keep"> ⭐ Garder dans « Mes repas » pour le reprendre plus tard</label>
  <button class="btn" id="own-ok">Manger ça au ${esc(ownSlot(OWN.slot).toLowerCase())}</button></div>`:""}
 ${OWN.had?`<button class="btn ghost" id="own-reset">↩ Revenir au plat prévu par le coach</button>`:""}
 ${my.length?`<div class="lab">⭐ Mes repas</div><ul class="list">${my.map((m,i)=>`<li><button class="lnk sp" style="text-align:left" data-mymeal="${i}"><span style="font-size:20px">${m.e}</span> ${esc(m.n)}<br><small class="muted">${fr(m.k)} kcal · ${fr(m.P)} g prot.</small></button><button class="chip" data-mymdel="${i}" aria-label="Oublier ${esc(m.n)}">✕</button></li>`).join("")}</ul>`:""}
 <div class="row" style="gap:6px"><button class="chip" data-ownt="s" aria-pressed="${t==="s"}">🛒 Acheté tout prêt</button><button class="chip" data-ownt="m" aria-pressed="${t==="m"}">🏠 Fait maison</button></div>
 <input id="own-q" class="srch" type="search" autocomplete="off" placeholder="${t==="s"?"Produit, marque ou code-barres : wrap, Daunat, 3017…":"Ingrédient : poulet, riz, œuf, pâtes…"}">
 ${t==="s"?`<div class="row" style="gap:6px;flex-wrap:wrap">${OWN_ST.map(([k,l])=>`<button class="chip" data-ownst="${k}" aria-pressed="${OWN.st===k}">${l}</button>`).join("")}</div>`:""}
 <div id="own-res"></div>`,"Autre chose");
 ownList(ownLocal(""),[],t==="s"?"Écris un produit : la recherche couvre les catalogues des magasins (Open Food Facts, produits vendus en France).":"Ajoute chaque ingrédient avec sa quantité, comme pour une recette.");
 el.querySelector("#own-q").addEventListener("input",e=>{const q=e.target.value.trim();clearTimeout(OWNT);ownList(ownLocal(q),[],q.length>=2&&OWN.t==="s"?"Recherche dans les magasins…":"");if(q.length>=2&&OWN.t==="s")OWNT=setTimeout(()=>ownOff(q),550)})}
/* Open Food Facts : produits vendus en France, triés par popularité, filtrés par enseigne si choisie ; code-barres (8 à 14 chiffres) = fiche directe. */
function ownOff(q){const st=OWN.st,F="code,product_name_fr,product_name,brands,stores,quantity,serving_quantity,serving_size,nutriments,image_small_url",get=u=>fetch(u,AbortSignal.timeout?{signal:AbortSignal.timeout(8000)}:{}).then(r=>{if(!r.ok)throw 0;return r.json()}),
 conv=p=>{const n=p.nutriments||{},k=+n["energy-kcal_100g"],sq=+p.serving_quantity;if(!(k>=0)||n["energy-kcal_100g"]==null)return null;
  return{id:"off:"+p.code,n:(p.product_name_fr||p.product_name||"").trim().slice(0,70),b:(Array.isArray(p.brands)?p.brands.join(","):p.brands||"").split(",")[0].trim(),s:(Array.isArray(p.stores)?p.stores.join(","):p.stores||"").split(",").slice(0,2).map(x=>x.trim()).filter(Boolean).join(", "),
   e:"🛒",img:p.image_small_url||"",k,P:+n.proteins_100g||0,C:+n.carbohydrates_100g||0,F:+n.fat_100g||0,pg:sq>0&&sq<2000?sq:100,pu:sq>0&&sq<2000?"portion":"× 100 g"}},
 show=L=>{if(fold($("#own-q")?.value.trim())!==fold(q))return;const R=L.map(conv).filter(x=>x&&x.n);ownList(ownLocal(q),R,R.length?"":"Rien trouvé dans les magasins pour ça : essaie un autre mot, une marque, ou une autre enseigne.")};
 if(/^\d{8,14}$/.test(q))return get(`https://world.openfoodfacts.org/api/v2/product/${q}.json?fields=${F}`).then(j=>show(j.product?[{...j.product,code:q}]:[])).catch(()=>show([]));
 const e=encodeURIComponent(q);
 get(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${e}&search_simple=1&action=process&json=1&page_size=24&sort_by=unique_scans_n&tagtype_0=countries&tag_contains_0=contains&tag_0=france${st?`&tagtype_1=stores&tag_contains_1=contains&tag_1=${encodeURIComponent(st)}`:""}&fields=${F}`)
  /* Secours : moteur de recherche récent (sans filtre de pays) ; l'enseigne est alors filtrée ici. */
  .catch(()=>get(`https://search.openfoodfacts.org/search?q=${e}&langs=fr&page_size=40&fields=${F}`).then(j=>({products:(j.hits||[]).filter(p=>!st||fold(String(p.stores||"")+" "+(p.stores_tags||[]).join(" ")).replace(/[^a-z]/g,"").includes(st.replace(/[^a-z]/g,"").replace(/^e/,"")))})))
  .then(j=>show(j.products||j.hits||[])).catch(()=>{if(fold($("#own-q")?.value.trim())===fold(q))ownList(ownLocal(q),[],"Pas de connexion : les magasins ne répondent pas. Le rayon traiteur ci-dessus marche hors ligne.")})}
document.addEventListener("click",e=>{const t=e.target.closest("button");if(!t||!PROF)return;const D=t.dataset;
 if(D.own!==undefined&&D.day!==undefined){ownSheet(D.own,D.day);return}
 if(!OWN)return;
 if(D.ownclose!==undefined){const o=OWN;OWN=null;const r=week().days[wIdx(+o.day)][o.slot];RECI[r]&&!o.had&&recBack?openRecipe(r,o.slot,o.day):$("#sheet")?.remove();return}
 if(D.ownback!==undefined){FQ=null;ownSheet();return}
 if(D.ownt){OWN.t=D.ownt;ownSheet();return}
 if(D.ownst!==undefined){OWN.st=D.ownst;t.parentElement.querySelectorAll("[data-ownst]").forEach(b=>b.setAttribute("aria-pressed",b===t));const q=$("#own-q").value.trim();if(q.length>=2)ownOff(q);return}
 if(D.ownpick){const x=OWNR[+D.ownpick];if(x){OWN.n=$("#own-n")?.value||OWN.n;foodQty(x)}return}
 if(D.owndel){OWN.items.splice(+D.owndel,1);ownSheet();return}
 if(D.mymeal){const m=LS.get("coach-mymeals",[])[+D.mymeal];if(m){OWN.items=m.items.map(x=>({...x}));OWN.n=m.n;OWN.t=m.t;ownSheet()}return}
 if(D.mymdel){const L=LS.get("coach-mymeals",[]);L.splice(+D.mymdel,1);LS.set("coach-mymeals",L);ownSheet();return}
 if(t.id==="fq-ok"&&FQ){const {x,g}=FQ,r=v=>Math.round(v*g/10)/10;if(!g)return toast("Indique la quantité.");
  OWN.items.push({n:x.n+(x.b?` (${x.b})`:""),e:x.e,g:Math.round(g),k:Math.round(x.k*g/100),P:r(x.P),C:r(x.C),F:r(x.F)});FQ=null;ownSheet();return}
 if(t.id==="own-reset"){ownSave(OWN.day,OWN.slot,null);const o=OWN;OWN=null;$("#sheet")?.remove();render();toast(`${ownSlot(o.slot)} : retour au plat prévu.`);return}
 if(t.id==="own-ok"){const L=OWN.items;if(!L.length)return;const T=ownSum(L),n=($("#own-n").value.trim()||ownName(L)).slice(0,60),m={n,e:OWN.t==="m"?"🏠":L[0].e||"🛒",t:OWN.t,items:L,...T};
  if($("#own-keep")?.checked){const M=LS.get("coach-mymeals",[]).filter(x=>x.n!==n);LS.set("coach-mymeals",[m,...M].slice(0,30))}
  ownSave(OWN.day,OWN.slot,m);const o=OWN;OWN=null;$("#sheet")?.remove();render();toast(`${ownSlot(o.slot)} : ${n} (${fr(T.k)} kcal). Tes autres repas s'ajustent.`)}});
