/* Fiches nutrition : détail d'un aliment ou d'une recette (valeurs de référence Ciqual / USDA, arrondies).
   Pour 100 g, état d'achat (riz, pâtes, lentilles crus) : fibres g, sucres g, saturés g, sel g, fer mg, calcium mg, magnésium mg, potassium mg, vit. C mg, vit. D µg, vit. B12 µg, portion type g. */
const NUT = {
 riz:[1.3,0.2,0.3,0,0.8,10,25,110,0,0,0,80], pates:[3,3,0.3,0.01,1.3,20,50,200,0,0,0,90], semoule:[3.9,0.5,0.3,0.01,1.2,17,44,180,0,0,0,80],
 avoine:[10,1,1.2,0.01,4.3,50,140,360,0,0,0,60], painc:[7,3,0.6,1.1,2,30,70,230,0,0,0,80], wrap:[3,3,2.5,1.3,3,80,25,140,0,0,0,60],
 painb:[2.5,6,1,1.1,2,60,25,120,0,0,0,80], pdt:[2,0.8,0,0.01,0.8,10,22,420,12,0,0,250], patd:[3,4.2,0,0.1,0.6,30,25,340,2.4,0,0,250],
 lentilles:[11,2,0.2,0.02,7.5,50,90,700,1,0,0,80], poischi:[6,0.3,0.3,0.6,1.5,45,30,170,0,0,0,150], harico:[6,0.3,0.1,0.5,1.8,35,35,350,1,0,0,150],
 poulet:[0,0,0.4,0.15,0.4,10,28,330,0,0.1,0.3,150], dinde:[0,0,0.4,0.15,0.7,10,28,330,0,0.1,0.5,150], boeuf:[0,0,2.2,0.2,2.2,10,20,320,0,0.1,2.2,125],
 thon:[0,0,0.3,0.8,1.3,12,30,240,0,2,2.5,100], saumon:[0,0,2.5,0.15,0.3,10,28,360,0,8,3,130], oeuf:[0,0.7,2.8,0.35,1.8,55,12,135,0,1.9,1.1,120],
 tofu:[1,0.6,1,0.02,2.5,350,60,150,0,0,0,150], fblanc:[0,4,0.1,0.1,0.1,110,11,150,0,0,0.4,150], skyr:[0,4,0.1,0.1,0.1,120,12,150,0,0,0.5,150],
 lait:[0,4.8,1,0.1,0,120,11,150,1,0,0.4,250], whey:[0,6,3,0.5,1,450,80,500,0,0,1,30], fromr:[0,0,19,0.7,0.2,1000,35,90,0,0.6,2,30],
 mozza:[0,1,12,0.5,0.4,500,20,80,0,0.4,1.5,60], banane:[2.6,15,0.1,0,0.3,5,30,360,9,0,0,120], pomme:[2.4,10,0,0,0.1,5,5,110,5,0,0,150],
 frouges:[4,5,0,0,0.6,20,15,150,25,0,0,100], cacah:[6,6,10,0.6,1.9,45,170,650,0,0,0,20], amandes:[12,4,4,0,3.7,270,270,730,0,0,0,30],
 huile:[0,0,15,0,0.6,1,0,1,0,0,0,10], miel:[0,80,0,0,0.4,6,2,52,0.5,0,0,15], brocoli:[3,1.5,0.1,0.03,0.7,45,20,300,60,0,0,150],
 courgette:[1,2.5,0.1,0.01,0.4,16,18,260,17,0,0,200], poivron:[1.8,4.2,0,0,0.4,8,12,200,120,0,0,120], tomate:[1,3.5,0,0.3,0.9,15,15,270,10,0,0,200],
 oignon:[1.7,4.5,0,0,0.2,23,10,150,7,0,0,50], carotte:[2.8,5,0,0.1,0.3,33,12,320,6,0,0,100], hverts:[3,1.5,0,0,1,37,25,210,12,0,0,150],
 epinard:[2.5,0.4,0.1,0.2,2.7,100,80,460,15,0,0,150], soja:[0.8,1,0,14,1.9,20,40,435,0,0,0,15], coco:[0,2,16,0.05,1.6,15,45,220,1,0,0,80],
 avocat:[6.7,0.7,2.1,0,0.6,12,29,485,10,0,0,70], mais:[2.5,4,0.2,0.5,0.5,5,20,180,3,0,0,80], salade:[1.3,1,0,0.02,1,35,13,200,9,0,0,50],
 porc:[0,0,2,0.15,1,6,25,400,0,0.5,0.6,150], jambon:[0,0.8,1.2,2,0.6,8,20,300,0,0.5,0.5,80], cabil:[0,0,0.1,0.25,0.4,15,30,400,0,1,1,150],
 bveg:[0.8,4,0.2,0.1,0,120,5,40,0,0.75,0.38,250], galriz:[3,0.6,0.6,0.05,1.5,10,130,290,0,0,0,30], quinoa:[7,0.6,0.7,0.01,4.6,47,197,563,0,0,0,70],
 nouilles:[1.6,0.1,0.2,0.1,0.7,18,12,30,0,0,0,90], champi:[1,1.7,0.1,0.01,0.5,3,9,320,2,0.2,0.04,150]
};
/* Micronutriments : index dans NUT, nom, unité, apport de référence journalier (VNR européennes). */
const MICRO=[[4,"Fer","mg",14],[5,"Calcium","mg",800],[6,"Magnésium","mg",375],[7,"Potassium","mg",2000],[8,"Vitamine C","mg",80],[9,"Vitamine D","µg",5],[10,"Vitamine B12","µg",2.5]];
const RAYE={"Épicerie":"🥫","Boulangerie":"🥖","Fruits et légumes":"🥦","Viande et poisson":"🍗","Crèmerie":"🥛","Frais":"🧊","Compléments":"💪","Surgelés":"❄️","Charcuterie":"🥓"};
/* Valeurs d'une quantité q (g) d'un aliment : k P C F fib sug sat salt + micros. */
function nutOf(i,q){const d=ING[i],n=NUT[i]||[],f=q/100,o={k:d[1]*f,P:d[2]*f,C:d[3]*f,F:d[4]*f,fib:(n[0]||0)*f,sug:(n[1]||0)*f,sat:(n[2]||0)*f,salt:(n[3]||0)*f,mi:MICRO.map(m=>(n[m[0]]||0)*f)};return o}
function nutAdd(a,b){const o={};for(const k in b)o[k]=k==="mi"?b.mi.map((v,j)=>v+((a.mi||[])[j]||0)):(a[k]||0)+b[k];return o}
function nutScale(a,f){const o={};for(const k in a)o[k]=k==="mi"?a.mi.map(v=>v*f):a[k]*f;return o}
/* Mots d'usage selon les valeurs d'une portion (v) et son poids (g). */
function nutTags(v,g,food){const t=[],e=Math.max(v.k,1),pE=v.P*4/e,f100=v.fib*100/Math.max(g,1);
 if(!food&&v.P>=25&&v.C>=40)t.push("💪 Idéal après la séance");
 if(food&&pE>=.3&&v.P>=8)t.push("🥩 Riche en protéines");else if(!food&&pE>=.3)t.push("🥩 Très protéiné");
 if(food&&v.C>=25&&v.F<3&&v.fib<4)t.push("⚡ Énergie rapide, bien avant l'effort");
 if(food&&v.C>=30&&v.fib>=4)t.push("🔋 Énergie durable");
 if(f100>=6||(!food&&v.fib>=8))t.push("🌾 Riche en fibres");else if(f100>=3||(!food&&v.fib>=5))t.push("🌾 Source de fibres");
 if(v.sug>=15)t.push("🍯 Sucres rapides : plutôt autour de la séance");
 if(v.F>=10&&v.sat<v.F*.3)t.push("🫒 Bonnes graisses");
 if(v.sat>=8)t.push("🧈 Assez gras saturé : avec modération");
 if(v.salt>=2.5)t.push("🧂 Assez salé : pas de sel en plus");
 MICRO.forEach((m,j)=>{if(v.mi[j]>=m[3]*.3)t.push(`✨ Bonne source de ${m[1].toLowerCase()}`)});
 if(!food&&v.k<450)t.push("🪶 Repas léger");
 if(food&&v.k<=60&&g>=100)t.push("🪶 Très peu calorique, à volonté");
 return t.slice(0,5)}
const nf=(x,u="g")=>x<0.05?`0 ${u}`:x<10?`${fr(x,1)} ${u}`:`${fr(x)} ${u}`;
function nutTable(cols){const R=[["Calories","k","kcal",0],["Protéines","P","g",0],["Glucides","C","g",0],["dont sucres","sug","g",1],["Lipides","F","g",0],["dont saturés","sat","g",1],["Fibres","fib","g",0],["Sel","salt","g",0]];
 return `<table class="ntab"><thead><tr><th></th>${cols.map(c=>`<th>${c[0]}</th>`).join("")}</tr></thead><tbody>${R.map(([l,k,u,sub])=>`<tr class="${sub?"sub":""}"><td>${l}</td>${cols.map(c=>`<td class="mono">${k==="k"?fr(c[1][k]):nf(c[1][k],u)}</td>`).join("")}</tr>`).join("")}</tbody></table>`}
function nutMicro(v){const L=MICRO.map((m,j)=>[m,v.mi[j],v.mi[j]/m[3]]).filter(x=>x[2]>=.05);
 return L.length?`<div class="lab">Micronutriments · part de l'apport conseillé</div><ul class="list">${L.map(([m,x,p])=>`<li><span class="sp">${m[1]}</span><span class="mono small muted">${fr(x,x<10?1:0)} ${m[2]}</span><b class="mono" style="min-width:52px;text-align:right">${fr(Math.min(p,9.99)*100)} %</b></li>`).join("")}</ul>`:""}
function nutGoal(v){const T=targets(),G=[["Calories",v.k,T.kcal],["Protéines",v.P,T.p],["Glucides",v.C,T.c],["Lipides",v.F,T.f],["Fibres",v.fib,30]];
 return `<div class="lab">Part de ton objectif du jour</div><div class="ngoal">${G.map(([l,x,t])=>{const p=t?x/t*100:0;return `<div><span>${l}</span><i><b style="width:${Math.min(p,100)}%"></b></i><em class="mono">${fr(p)} %</em></div>`}).join("")}</div>`}
const nutTagsH=t=>t.length?`<div class="ntags">${t.map(x=>`<span>${x}</span>`).join("")}</div>`:"";

/* Fiche aliment. q = quantité de la recette (sinon portion type) ; back = [rid,slot,day] pour revenir à la recette. */
function openFood(i,q,back){const d=ING[i];if(!d)return;$("#sheet")?.remove();const g=q>0?q:(NUT[i]||[])[11]||100,p=nutOf(i,g),h=nutOf(i,100);
 const el=document.createElement("div");el.id="sheet";el.innerHTML=`<div class="in" role="dialog" aria-label="${esc(ingName(i))}"><div class="hero" style="height:120px;font-size:64px">${RAYE[ingRay(i)]||"🍽️"}<button class="x" data-close aria-label="Fermer">✕</button></div>
 <div class="stack" data-fiche="food"><div class="lab">${esc(ingRay(i))} · ${q>0?"quantité de ta recette":"portion type"} : ${i==="oeuf"?`${Math.max(1,Math.round(g/60))} œuf(s), `:""}${fr(g)} g</div><h2 style="text-transform:none;font-family:var(--body);font-weight:600;font-size:24px">${esc(ingName(i))}</h2>
 ${nutTagsH(nutTags(p,g,true))}
 <div class="kpis"><div><strong>${fr(p.k)}</strong><small>kcal</small></div><div><strong>${fr(p.P,p.P<10?1:0)} g</strong><small>protéines</small></div><div><strong>${fr(p.C)} / ${fr(p.F)}</strong><small>glucides / lipides</small></div></div>
 ${nutTable([["Pour 100 g",h],[`Portion ${fr(g)} g`,p]])}${nutMicro(p)}${nutGoal(p)}
 <p class="small muted" style="margin:0">Valeurs moyennes de référence (Ciqual, USDA)${["riz","pates","semoule","lentilles","quinoa","nouilles","avoine"].includes(i)?", poids cru":""}. Elles varient selon les marques.</p>
 ${back?`<button class="btn ghost" data-rec="${back[0]}" data-slot="${back[1]}" data-day="${back[2]}">← Retour à la recette</button>`:""}</div></div>`;
 document.body.appendChild(el)}

/* Bloc nutrition d'une recette : m = portion calculée (r, fi). Retourne le HTML à insérer dans la fiche recette. */
function recipeNutri(m){const r=m.r,parts=r.i.map(([i,g])=>{const q=g*m.fi(i);return{i,q,v:nutOf(i,q)}}),v=parts.reduce((a,x)=>nutAdd(a,x.v),{}),W=parts.reduce((a,x)=>a+x.q,0),c=nutScale(v,100/W);
 return `${nutTagsH(nutTags(v,W,false))}${nutGoal(v)}
 <div class="lab">Valeurs nutritionnelles</div>${nutTable([[`Ta portion (${fr(W)} g)`,v],["Pour 100 g",c]])}${nutMicro(v)}
 <div class="lab">Apport de chaque ingrédient · touche pour le détail</div>
 <table class="ntab ning"><thead><tr><th></th><th>kcal</th><th>Prot.</th><th>Gluc.</th><th>Lip.</th></tr></thead><tbody>${parts.map(x=>`<tr><td><button class="lnk" data-food="${x.i}" data-g="${Math.round(x.q)}" data-back="${r.id}">${esc(ingName(x.i))}</button><small class="muted"> ${fr(x.q)} g · ${fr(x.v.k/Math.max(v.k,1)*100)} %</small></td><td class="mono">${fr(x.v.k)}</td><td class="mono">${fr(x.v.P)}</td><td class="mono">${fr(x.v.C)}</td><td class="mono">${fr(x.v.F)}</td></tr>`).join("")}
 <tr class="tot"><td>Total</td><td class="mono">${fr(v.k)}</td><td class="mono">${fr(v.P)}</td><td class="mono">${fr(v.C)}</td><td class="mono">${fr(v.F)}</td></tr></tbody></table>`}

/* Choisir ses plats : en liste (cases à cocher) ou en swipe (droite = je garde, gauche = non → PROF.nope).
   PROF.pick = plats choisis ; PROF.pickOnly = le coach n'utilise que ceux-là (sinon il les met en priorité). */
const PK_G=[["pdj","Petits-déjeuners"],["main","Plats"],["snack","Collations"]];
function pickCard(){const n=(PROF.pick||[]).length;
 return `<div class="card stack"><div class="lab">Choisir mes plats</div><p class="small muted" style="margin:0">${n?`<b>${n} plat${n>1?"s":""} choisi${n>1?"s":""}</b> · ${PROF.pickOnly?"le coach compose ta semaine uniquement avec eux":"le coach les met en priorité dans ta semaine"}, portions ajustées à tes calories et tes protéines, dans ton budget.`:"Choisis toi-même tes plats parmi toutes les recettes. Le coach compose ta semaine avec, en ajustant les portions à tes calories et tes protéines, dans ton budget."}</p>
 <div class="row"><button class="btn ghost sp" id="pk-list">📋 En liste</button><button class="btn ghost sp" id="pk-swipe">👆 En swipe</button></div></div>`}
let PKS=null,PKD=null,PKI=0;
function pkSave(sel,only){PROF.pick=[...sel];PROF.pickOnly=!!only&&sel.size>0;PROF.nope=(PROF.nope||[]).filter(id=>!sel.has(id));LS.set("coach-profile",PROF);
 LS.set("coach-week",{...genWeek(Date.now()%1e9),v:2});LS.set("coach-shop",{});$("#sheet")?.remove();nutTab="week";render();
 toast(sel.size?`Semaine recomposée avec tes ${sel.size} plat${sel.size>1?"s":""}.`:"Sélection effacée : le coach choisit à nouveau.")}
function pkSheet(html,label){$("#sheet")?.remove();const el=document.createElement("div");el.id="sheet";el.innerHTML=`<div class="in stack" role="dialog" aria-label="${label}">${html}</div>`;document.body.appendChild(el);return el}
function pkList(){PKS=PKS||new Set(PROF.pick||[]);const only=!!PROF.pickOnly,no=PROF.nope||[];
 pkSheet(`<h2 style="margin:18px 0 0">Choisir mes plats</h2><p class="small muted" style="margin:0">Coche les plats que tu veux manger cette semaine.</p>
 <div class="seg"><button data-pkm="0" aria-pressed="${!only}">Les mettre en priorité</button><button data-pkm="1" aria-pressed="${only}">Seulement eux</button></div>
 ${PK_G.map(([m,l])=>`<div><div class="lab" style="margin-top:6px">${l}</div><ul class="list">${safeRec(m).map(r=>`<li><button class="chk ${PKS.has(r.id)?"on":""}" data-pk="${r.id}" aria-label="${esc(r.n)}">${PKS.has(r.id)?"✓":""}</button><span style="font-size:24px">${r.e}</span><span class="sp">${esc(r.n)}${no.includes(r.id)?`<br><small class="muted">Exclu pour l'instant</small>`:""}</span></li>`).join("")}</ul></div>`).join("")}
 <button class="btn" id="pk-ok">Composer ma semaine</button><button class="btn ghost" id="pk-clr">Effacer ma sélection</button><button class="btn ghost" data-close>Annuler</button>`,"Choisir mes plats en liste")}
function pkCardHtml(r){return `<div id="pk-card" style="touch-action:none;user-select:none;border-radius:28px;padding:18px;background:rgba(255,255,255,.07);border:1px solid var(--line);text-align:center;transition:transform .25s"><div style="font-size:110px;line-height:1.2">${r.e}</div><h2 style="margin:6px 0">${esc(r.n)}</h2><div class="small muted">${({pdj:"Petit-déjeuner",main:"Plat",snack:"Collation"})[r.m]} · ${r.min} min</div><ul class="small" style="text-align:left;margin:12px 0 0;padding-left:18px">${r.i.map(([i])=>`<li>${esc(typeof ingName==="function"?ingName(i):ING[i][0])}</li>`).join("")}</ul></div>`}
function pkSwipe(){if(!PKD){const all=PK_G.flatMap(([m])=>safeRec(m)),seen=new Set([...(PROF.pick||[]),...(PROF.nope||[])]),fresh=all.filter(r=>!seen.has(r.id));PKD=fresh.length?fresh:all;PKI=0;PKS=new Set(PROF.pick||[])}
 if(PKI>=PKD.length){pkSheet(`<h2 style="margin:18px 0 0">C'est tout !</h2><p class="small muted" style="margin:0">Tu as gardé ${PKS.size} plat${PKS.size>1?"s":""}.</p><button class="btn" id="pk-ok">Composer ma semaine</button><button class="btn ghost" data-close>Annuler</button>`,"Swipe terminé");return}
 const r=PKD[PKI];pkSheet(`<div class="row" style="margin-top:14px"><b class="sp">Choisir mes plats</b><small class="muted mono">${PKI+1} / ${PKD.length}</small></div><p class="small muted" style="margin:0">Glisse à droite pour le garder, à gauche s'il ne te tente pas.</p>${pkCardHtml(r)}
 <div class="row"><button class="btn ghost sp" data-pkv="0" aria-label="Non">✕ Non</button><button class="btn sp" data-pkv="1" aria-label="Je le garde">♥ Je garde</button></div><button class="btn ghost" id="pk-ok">Terminer et composer ma semaine</button>`,"Choisir mes plats en swipe");
 const c=$("#pk-card");let x0=null,dx=0;
 c.addEventListener("pointerdown",e=>{x0=e.clientX;dx=0;c.style.transition="none";c.setPointerCapture(e.pointerId)});
 c.addEventListener("pointermove",e=>{if(x0==null)return;dx=e.clientX-x0;c.style.transform=`translateX(${dx}px) rotate(${dx/20}deg)`;c.style.borderColor=dx>40?"var(--good)":dx<-40?"var(--warn)":""});
 c.addEventListener("pointerup",()=>{if(x0==null)return;x0=null;c.style.transition="transform .25s";if(Math.abs(dx)>90)pkVote(dx>0);else c.style.transform=""})}
function pkVote(keep){const r=PKD[PKI],c=$("#pk-card");if(keep)PKS.add(r.id);else{PKS.delete(r.id);PROF.nope=[...new Set([...(PROF.nope||[]),r.id])];LS.set("coach-profile",PROF)}
 if(c)c.style.transform=`translateX(${keep?120:-120}%) rotate(${keep?15:-15}deg)`;PKI++;setTimeout(pkSwipe,c?220:0)}
document.addEventListener("click",e=>{const t=e.target.closest("button");if(!t||!PROF)return;const D=t.dataset;
 if(t.id==="pk-list"){PKS=null;pkList();return}
 if(t.id==="pk-swipe"){PKD=null;pkSwipe();return}
 if(D.pk){PKS.has(D.pk)?PKS.delete(D.pk):PKS.add(D.pk);t.classList.toggle("on");t.textContent=PKS.has(D.pk)?"✓":"";return}
 if(D.pkm){$("#sheet").querySelectorAll("[data-pkm]").forEach(b=>b.setAttribute("aria-pressed",b===t));return}
 if(D.pkv){pkVote(D.pkv==="1");return}
 if(t.id==="pk-clr"){PKS=new Set();pkSave(PKS,false);return}
 if(t.id==="pk-ok"){const m=$("#sheet [data-pkm='1']"),only=m?m.getAttribute("aria-pressed")==="true":!!PROF.pickOnly;pkSave(PKS||new Set(),only);return}});
