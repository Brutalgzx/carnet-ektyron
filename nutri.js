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
 nouilles:[1.6,0.1,0.2,0.1,0.7,18,12,30,0,0,0,90], champi:[1,1.7,0.1,0.01,0.5,3,9,320,2,0.2,0.04,150],
 parmesan:[0,0,18,1.6,0.7,1100,40,100,0,0.5,1.5,20], bacon:[0,0.5,1.8,2.5,0.8,8,20,330,0,0.5,0.7,30], chevre:[0,2,9,1.2,0.3,150,20,180,0,0.3,0.4,30], butternut:[2,2.2,0,0.01,0.7,48,34,350,21,0,0,250],
 cottage:[0,3,2.7,0.8,0.1,80,8,100,0,0.1,0.4,100], ffrais:[0,3.5,4,0.8,0.1,100,10,140,0,0.1,0.4,30], farine:[3,1,0.2,0,1.2,15,22,140,0,0,0,30], farriz:[2.4,0.1,0.3,0,0.4,10,35,76,0,0,0,30],
 sarrasin:[8,1,0.6,0,4,40,230,580,0,0,0,30], crevette:[0,0,0.3,1.2,0.5,70,35,170,0,0,1.1,100], truite:[0,0,1.5,1.5,0.4,20,28,450,0,10,4,100], feuilriz:[1,0,0.1,0.6,1.2,20,20,30,0,0,0,10],
 cornfl:[3,8,0.2,1.3,8,5,15,100,0,4,0,20], cacao:[30,1,7,0.05,13,130,500,1500,0,0,0,10], chocnoir:[11,24,25,0.02,8,60,170,600,0,0,0,10], chocblanc:[0,58,20,0.25,0.2,200,13,280,0,0,0.6,10],
 dattes:[8,64,0,0,1,40,43,690,0,0,0,30], chia:[34,0,3.3,0,7.7,630,335,400,1.6,0,0,15], mangue:[1.6,14,0.1,0,0.2,11,10,170,36,0,0,150], ananas:[1.4,10,0,0,0.3,13,12,110,48,0,0,150],
 cocorap:[16,7,55,0.04,3.3,26,90,540,1.5,0,0,10], noisettes:[10,4,4.5,0,4.7,114,163,680,6,0,0,15], cajou:[3.3,6,8,0,6.7,37,290,660,0.5,0,0,20], peche:[1.5,8,0,0,0.2,6,9,190,7,0,0,150],
 concombre:[0.5,1.7,0,0.01,0.3,16,13,150,3,0,0,100], tomfr:[1.2,2.6,0,0.01,0.3,10,11,240,14,0,0,100], chou:[2.1,3.8,0,0.03,0.8,45,16,240,57,0,0,100], betterave:[2,7,0,0.2,0.8,16,23,300,4,0,0,100],
 biscuit:[2.5,35,9,0.7,2,30,30,150,0,0,0,15],
 creme:[0,3.5,2.6,0.1,0.1,90,9,130,0.5,0.1,0.3,30], cancoillotte:[0,2,4,1.5,0.1,300,15,100,0,0.1,0.5,50], raclette:[0,0,17,1.8,0.2,700,30,90,0,0.3,1.5,40], gnocchi:[1.5,0.5,0.1,1,0.5,10,15,200,2,0,0,200],
 pinsa:[2.5,2,0.6,1.2,1,20,20,120,0,0,0,230], udon:[1,0.3,0.1,0.8,0.4,8,10,40,0,0,0,200], saumfume:[0,0,2,3,0.5,12,28,350,0,8,3,50], panko:[3,5,0.6,1,1.5,40,30,150,0,0,0,30],
 sardine:[0,0,3,0.8,2,350,40,400,0,5,8,90], chorizo:[0,1,14,4,1.5,15,20,350,0,0.5,1,40], maizena:[0.9,0,0,0,0.5,2,3,3,0,0,0,20], cremriz:[1,0.2,0.3,0,0.4,5,30,80,0,0,0,50]
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
/* « Modifier » : choisir les repas pris dans la journée, puis recomposer la semaine. */
function mealSheet(){const s=mealsOf(PROF);pkSheet(`<h2 style="margin:18px 0 0">Mes repas de la journée</h2><p class="small muted" style="margin:0">Décoche ceux que tu ne prends pas : tes calories et tes protéines sont réparties sur les autres.</p>
 <ul class="list">${MEALS4.map(([k,l])=>`<li><button class="chk ${s.includes(k)?"on":""}" data-msel="${k}" aria-label="${l}">${s.includes(k)?"✓":""}</button><span class="sp">${l}</span></li>`).join("")}</ul>
 <button class="btn" id="meal-ok">Recomposer ma semaine</button><button class="btn ghost" data-close>Annuler</button>`,"Mes repas de la journée")}
function pkList(){PKS=PKS||new Set(PROF.pick||[]);const only=!!PROF.pickOnly,no=PROF.nope||[];
 pkSheet(`<h2 style="margin:18px 0 0">Choisir mes plats</h2><p class="small muted" style="margin:0">Coche les plats que tu veux manger cette semaine.</p>
 <div class="seg"><button data-pkm="0" aria-pressed="${!only}">Les mettre en priorité</button><button data-pkm="1" aria-pressed="${only}">Seulement eux</button></div>
 ${PK_G.map(([m,l])=>`<div><div class="lab" style="margin-top:6px">${l}</div><ul class="list">${safeRec(m).map(r=>`<li><button class="chk ${PKS.has(r.id)?"on":""}" data-pk="${r.id}" aria-label="${esc(r.n)}">${PKS.has(r.id)?"✓":""}</button><span style="font-size:24px">${r.e}</span><span class="sp">${esc(r.n)}${no.includes(r.id)?`<br><small class="muted">Exclu pour l'instant</small>`:""}</span></li>`).join("")}</ul></div>`).join("")}
 <button class="btn" id="pk-ok">Composer ma semaine</button><button class="btn ghost" id="pk-clr">Tout effacer et recommencer le tri</button><button class="btn ghost" data-close>Annuler</button>`,"Choisir mes plats en liste")}
function pkCardHtml(r){return `<div id="pk-card" style="touch-action:none;user-select:none;border-radius:28px;padding:18px;background:rgba(255,255,255,.07);border:1px solid var(--line);text-align:center;transition:transform .25s"><div style="font-size:110px;line-height:1.2;position:relative;aspect-ratio:1/1;max-height:42vh;margin:0 auto;border-radius:20px;overflow:hidden;display:grid;place-items:center">${r.e}<img src="img/rec/${r.id}.webp" alt="" draggable="false" onerror="this.remove()" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"></div><h2 style="margin:6px 0">${esc(r.n)}</h2><div class="small muted">${({pdj:"Petit-déjeuner",main:"Plat",snack:"Collation"})[r.m]} · ${r.min} min</div>${(()=>{const m=rmac(r);return `<div class="mono" style="margin-top:6px"><b>${fr(m.k)}</b> kcal · <b>${fr(m.P)} g</b> prot. · ${fr(m.C)} g gluc. · ${fr(m.F)} g lip.</div><div class="small muted">pour la recette de base, ajustée à tes besoins dans ta semaine</div>`})()}<ul class="small" style="text-align:left;margin:12px 0 0;padding-left:18px">${r.i.map(([i])=>`<li>${esc(typeof ingName==="function"?ingName(i):ING[i][0])}</li>`).join("")}</ul></div>`}
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
 if(t.id==="meal-edit"){mealSheet();return}
 if(D.msel){t.classList.toggle("on");t.textContent=t.classList.contains("on")?"✓":"";return}
 if(t.id==="meal-ok"){const sel=MEALK.filter(k=>$(`#sheet [data-msel="${k}"]`)?.classList.contains("on"));if(!sel.length)return toast("Garde au moins un repas.");PROF.mealSel=sel;PROF.meals=sel.length;LS.set("coach-profile",PROF);LS.set("coach-week",{...genWeek(Date.now()%1e9),v:2});LS.set("coach-shop",{});$("#sheet")?.remove();nutTab="week";render();toast("Repas mis à jour : nouvelle semaine composée.");return}
 if(t.id==="pk-list"){PKS=null;pkList();return}
 if(t.id==="pk-swipe"){PKD=null;pkSwipe();return}
 if(D.pk){PKS.has(D.pk)?PKS.delete(D.pk):PKS.add(D.pk);t.classList.toggle("on");t.textContent=PKS.has(D.pk)?"✓":"";return}
 if(D.pkm){$("#sheet").querySelectorAll("[data-pkm]").forEach(b=>b.setAttribute("aria-pressed",b===t));return}
 if(D.pkv){pkVote(D.pkv==="1");return}
 if(t.id==="pk-clr"){if(!confirm("Effacer tous les plats gardés et refusés, et recommencer le tri depuis le début ?"))return;PKS=new Set();PROF.nope=[];PKD=null;pkSave(PKS,false);return}
 if(t.id==="pk-ok"){const m=$("#sheet [data-pkm='1']"),only=m?m.getAttribute("aria-pressed")==="true":!!PROF.pickOnly;pkSave(PKS||new Set(),only);return}});

/* Compléments : 4e case du jour (whey, créatine, boissons, barres, yaourts protéinés…). PROF.supp = {id: portions/jour}, PROF.suppX = produits perso. */
function supRows(){const L=supList(),T=supTot();
 return `<div class="row" style="margin-top:4px"><div class="lab sp">Compléments</div>${L.length?`<small class="muted mono">${fr(T.k)} kcal · ${fr(T.P)} g prot.</small>`:""}</div>
 ${L.map(x=>`<button class="meal" data-supe="1"><span class="ph">${x.e||"🧴"}</span><span class="sp"><small>${x.q>1?x.q+" × ":""}${esc(x.u||"portion")}</small><b>${esc(x.n)}</b><small>${eur((x.eur||0)*x.q)}</small></span><span class="k">${fr(x.k*x.q)} kcal</span></button>`).join("")}
 <button class="btn ghost" id="sup-edit">${L.length?"Modifier mes compléments":"＋ Ajouter mes compléments (whey, créatine, barres…)"}</button>`}
let SUPQ=null;
function supSheet(){SUPQ=SUPQ||{...(PROF.supp||{})};const all=[...SUP,...(PROF.suppX||[]).map(x=>({...x,g:"Mes produits"}))],G=[...new Set(all.map(x=>x.g))];
 $("#sheet")?.remove();const el=document.createElement("div");el.id="sheet";el.innerHTML=`<div class="in stack" role="dialog" aria-label="Mes compléments"><h2 style="margin:18px 0 0">Mes compléments</h2><p class="small muted" style="margin:0">Indique combien tu en prends par jour. Ils comptent dans tes calories et tes protéines : tes repas s'ajustent pour laisser la place, et ils s'ajoutent à ta liste de courses.</p>
 ${G.map(g=>`<div><div class="lab" style="margin-top:6px">${g}</div><ul class="list">${all.filter(x=>x.g===g).map(x=>`<li><span style="font-size:24px">${x.e||"🧴"}</span><span class="sp">${esc(x.n)}<br><small class="muted">${esc(x.u||"portion")} · ${fr(x.k)} kcal · ${fr(x.P)} g prot.</small></span><button class="chk" data-supm="${x.id}" aria-label="Moins">−</button><b class="mono" style="min-width:18px;text-align:center" id="supq-${x.id}">${SUPQ[x.id]||0}</b><button class="chk" data-supp="${x.id}" aria-label="Plus">+</button></li>`).join("")}</ul></div>`).join("")}
 <div class="lab" style="margin-top:6px">Ajouter un autre produit</div>
 <input class="txt" id="sx-n" maxlength="40" placeholder="Nom (ex. : Barre Myprotein cookie)">
 <div class="row"><input class="txt sp" id="sx-k" type="number" inputmode="decimal" placeholder="kcal / portion"><input class="txt sp" id="sx-p" type="number" inputmode="decimal" placeholder="Protéines (g)"><input class="txt sp" id="sx-e" type="number" inputmode="decimal" placeholder="Prix (€)"></div>
 <button class="btn ghost" id="sx-add">Ajouter ce produit</button>
 <button class="btn" id="sup-ok">Enregistrer</button><button class="btn ghost" data-close>Annuler</button></div>`;document.body.appendChild(el)}
document.addEventListener("click",e=>{const t=e.target.closest("button");if(!t||!PROF)return;const D=t.dataset;
 if(t.id==="sup-edit"||D.supe){SUPQ=null;supSheet();return}
 if(D.supp||D.supm){const id=D.supp||D.supm;SUPQ[id]=Math.max(0,Math.min(9,(SUPQ[id]||0)+(D.supp?1:-1)));$("#supq-"+id).textContent=SUPQ[id];return}
 if(t.id==="sx-add"){const n=$("#sx-n").value.trim(),k=+$("#sx-k").value||0,P=+$("#sx-p").value||0,eu=+$("#sx-e").value||0;if(!n){toast("Donne un nom au produit.");return}
  const id="x"+Date.now().toString(36);PROF.suppX=[...(PROF.suppX||[]),{id,n,e:"🧴",u:"portion",k,P,C:0,F:0,eur:eu}];SUPQ[id]=1;LS.set("coach-profile",PROF);supSheet();return}
 if(t.id==="sup-ok"){const S={};for(const k in SUPQ)if(SUPQ[k]>0)S[k]=SUPQ[k];PROF.supp=S;LS.set("coach-profile",PROF);$("#sheet")?.remove();render();toast(Object.keys(S).length?"Compléments enregistrés : tes repas sont ajustés.":"Aucun complément.");return}});

/* Extras : un petit plat en plus (yaourt, fruit…) noté sur un repas d'un jour de la semaine en cours, compté dans les totaux du jour.
   Rangés par date dans « coach-extra » (gardés 14 jours) : ils ne reviennent pas la semaine suivante. */
const exDate=d=>new Date(Date.now()+(wIdx(+d)-wIdx(new Date().getDay()))*DAY).toISOString().slice(0,10);
function exList(d,slot){const E=LS.get("coach-extra",{})[exDate(d)]||{};return slot?E[slot]||[]:Object.values(E).flat()}
function exTot(d,slot){return exList(d,slot).reduce((a,x)=>({k:a.k+x.k,P:a.P+x.P,C:a.C+x.C,F:a.F+x.F}),{k:0,P:0,C:0,F:0})}
function exSave(d,slot,f){const E=LS.get("coach-extra",{}),k=exDate(d),lim=new Date(Date.now()-14*DAY).toISOString().slice(0,10);E[k]=E[k]||{};E[k][slot]=f(E[k][slot]||[]);if(!E[k][slot].length)delete E[k][slot];
 for(const x in E)if(x<lim||!Object.keys(E[x]).length)delete E[x];LS.set("coach-extra",E)}
function exBlock(slot,d){const L=exList(d,slot);return `<div class="lab">En plus à ce repas</div>${L.length?`<ul class="list">${L.map((x,i)=>`<li><span class="sp">${esc(x.n)}<br><small class="muted">${x.g?x.g+" g · ":""}${fr(x.k)} kcal · ${fr(x.P)} g protéines</small></span><button class="chip" data-exdel="${i}" data-slot="${slot}" data-day="${d}" aria-label="Retirer ${esc(x.n)}">✕</button></li>`).join("")}</ul>`:""}<button class="btn ghost" data-exadd="${slot}" data-day="${d}">＋ J'ai mangé un petit extra</button>`}
let exBase=null;
function exForm(slot,d){exBase=null;const f=(id,l)=>`<label class="small" style="flex:1">${l}<input class="txt" id="ex-${id}" type="number" inputmode="decimal" min="0" style="font-size:17px;padding:10px"></label>`;
 pkSheet(`<div class="row" style="padding-top:18px"><h2 class="sp" style="margin:0">Un petit extra</h2><button class="chip" data-exback aria-label="Retour">✕</button></div>
 <p class="small muted" style="margin:0">Tape ce que tu as mangé : s'il est dans la liste, le calcul est fait tout seul. Sinon, cherche-le en ligne ou recopie l'étiquette (valeurs pour la quantité mangée).</p>
 <input class="txt" id="ex-n" list="ex-ing" maxlength="60" placeholder="Ex. : yaourt nature, banane, carré de chocolat" style="font-size:17px;padding:12px"><datalist id="ex-ing">${Object.keys(ING).map(i=>`<option value="${esc(ING[i][0])}">`).join("")}</datalist>
 <label class="small">Quantité mangée (g)<input class="txt" id="ex-g" type="number" inputmode="decimal" min="0" value="125" style="font-size:17px;padding:10px"></label>
 <button class="btn ghost" id="ex-find">🔎 Chercher les valeurs en ligne</button><div id="ex-res" class="stack small muted"></div>
 <div class="row" style="gap:8px">${f("k","kcal")}${f("P","Protéines (g)")}</div><div class="row" style="gap:8px">${f("C","Glucides (g)")}${f("F","Lipides (g)")}</div>
 <button class="btn" id="ex-ok" data-slot="${slot}" data-day="${d}">Ajouter à ce repas</button>`,"Ajouter un extra")}
function exFill(){if(!exBase)return;const g=+$("#ex-g").value||0;for(const k of ["k","P","C","F"])$("#ex-"+k).value=Math.round(exBase[k]*g/100*(k==="k"?1:10))/(k==="k"?1:10)}
document.addEventListener("input",e=>{if(!$("#ex-ok"))return;if(e.target.id==="ex-n"){const v=e.target.value.trim().toLowerCase(),i=Object.keys(ING).find(i=>ING[i][0].toLowerCase()===v);
 if(i){const x=ING[i];exBase={k:x[1],P:x[2],C:x[3],F:x[4]};$("#ex-res").textContent="Trouvé dans la liste : valeurs calculées pour la quantité.";exFill()}}
 else if(e.target.id==="ex-g")exFill();else if(/^ex-[kPCF]$/.test(e.target.id))exBase=null});
let exOff=[];
document.addEventListener("click",e=>{const t=e.target.closest("button");if(!t||!PROF)return;const D=t.dataset;
 if(D.exadd){exForm(D.exadd,D.day);return}
 if(D.exback!==undefined){recBack?openRecipe(...recBack):$("#sheet")?.remove();return}
 if(D.exdel){exSave(D.day,D.slot,L=>L.filter((_,i)=>i!==+D.exdel));openRecipe(...recBack);render();return}
 if(t.id==="ex-find"){const n=$("#ex-n").value.trim(),R=$("#ex-res");if(n.length<2)return toast("Écris d'abord ce que tu as mangé.");R.textContent="Recherche…";
  /* Open Food Facts : ancienne recherche (ouverte à tous les sites), sinon la nouvelle ; en cas d'échec, saisie de l'étiquette. */
  const q=encodeURIComponent(n),get=u=>fetch(u).then(r=>{if(!r.ok)throw 0;return r.json()});
  get(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${q}&search_simple=1&action=process&json=1&page_size=8&fields=product_name,brands,nutriments`).catch(()=>get(`https://search.openfoodfacts.org/search?q=${q}&page_size=8&fields=product_name,brands,nutriments`)).then(j=>{
   exOff=(j.products||j.hits||[]).map(p=>({...p,brands:Array.isArray(p.brands)?p.brands.join(","):p.brands})).filter(p=>p.product_name&&p.nutriments&&p.nutriments["energy-kcal_100g"]!=null).slice(0,5);
   R.innerHTML=exOff.length?`<span>Choisis le bon produit (valeurs pour 100 g, Open Food Facts) :</span>${exOff.map((p,i)=>`<button class="btn ghost" data-exoff="${i}" style="text-align:left">${esc(p.product_name)}${p.brands?" · "+esc(p.brands.split(",")[0]):""}<br><small class="muted">${fr(p.nutriments["energy-kcal_100g"])} kcal · ${fr(p.nutriments.proteins_100g||0,1)} g protéines</small></button>`).join("")}`:"Rien trouvé : recopie l'étiquette ci-dessous."}).catch(()=>{R.textContent="Pas de connexion : recopie l'étiquette ci-dessous."});return}
 if(D.exoff){const p=exOff[+D.exoff],n=p.nutriments;exBase={k:+n["energy-kcal_100g"]||0,P:+n.proteins_100g||0,C:+n.carbohydrates_100g||0,F:+n.fat_100g||0};$("#ex-n").value=p.product_name.slice(0,60);$("#ex-res").textContent="Valeurs reprises pour la quantité mangée.";exFill();return}
 if(t.id==="ex-ok"){const n=$("#ex-n").value.trim(),v=k=>Math.max(0,+$("#ex-"+k).value||0),x={n,g:Math.round(+$("#ex-g").value||0),k:v("k"),P:v("P"),C:v("C"),F:v("F")};
  if(!n)return toast("Écris ce que tu as mangé.");if(!x.k)return toast("Indique au moins les calories.");
  exSave(D.day,D.slot,L=>[...L,x]);openRecipe(...recBack);render();toast(`${n} ajouté : +${fr(x.k)} kcal, +${fr(x.P)} g de protéines.`)}});
