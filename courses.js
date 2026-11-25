/* Courses : budget par semaine, magasins (plusieurs choix) et prix réels issus de prix.js (relevé daté). */
const myStores=()=>{const s=(PROF&&PROF.stores&&PROF.stores.length?PROF.stores:[PROF&&PROF.store||"carrefour"]);return s.filter(v=>STORES.some(x=>x.v===v))};
const stLab=v=>(STORES.find(s=>s.v===v)||{l:v}).l;
/* Gamme des produits selon le budget : 0 premier prix, 1 marque distributeur, 2 qualité des protéines, 3 qualité partout.
   Le budget est à dépenser, pas à économiser : on part de la meilleure gamme et on ne redescend que si la semaine dépasse nettement le budget. */
const GAM=["Premier prix","Marque distributeur","Qualité · viande et poisson","Qualité · frais et bio"];
let GL=null;
const B_TOL=1.03;/* « environ le budget » : jusqu'à 3 % au-dessus */
/* GX : produits montés d'un cran au-dessus de la gamme de base, un par un (protéines d'abord, puis les plus chers), tant que la semaine tient dans le budget. */
let GX=new Set();const gTier=(g,L)=>{let k=L>=1?1:-1;for(const x in g)if(+x<=L&&+x>k)k=+x;return k};
function gLvl(){if(GL!=null)return GL;const B=(PROF.budget||45)*B_TOL,clr=()=>{for(const k in RM)delete RM[k]};let L=3;GX=new Set();
 for(;L>0;L--){GL=L;clr();if(weekCost()<=B)break}
 GL=L;clr();const G=typeof PRIX==="object"&&PRIX.gammes||{};
 if(L<3&&weekCost()<=B){const c=Object.keys(G).filter(i=>ING[i]&&gTier(G[i],L+1)!==gTier(G[i],L)).sort((a,b)=>(("2" in G[b])-("2" in G[a]))||ppkAt(b,"leclerc")-ppkAt(a,"leclerc"));
  for(const i of c){GX.add(i);clr();if(weekCost()>B){GX.delete(i);clr()}}}
 return L}
const iLvl=i=>gLvl()+(GX.has(i)?1:0);
/* Produit de la gamme pour un ingrédient (null = marque distributeur, prix « base »). */
function gItem(i){const g=typeof PRIX==="object"&&PRIX.gammes&&PRIX.gammes[i];if(!g)return null;const k=gTier(g,iLvl(i));return k<0||k===1?null:g[k]}
const ingName=i=>{const g=gItem(i);return g?g[0]:ING[i][0]};
const ingRay=i=>{const g=gItem(i);return g&&g[2]||ING[i][6]};
const ingTag=i=>{const g=gItem(i);return g?(g[3]||"Premier prix"):"Marque distributeur"};
/* Prix au kilo d'un ingrédient dans un magasin (null si l'enseigne ne vend pas ce rayon). */
function ppkAt(i,v){const P=typeof PRIX==="object"?PRIX:null,d=ING[i];if(!P)return d[5]*((STORES.find(s=>s.v===v)||{f:1}).f);
 const ry=P.rayons&&P.rayons[v];if(ry&&!ry.includes(ingRay(i)))return null;
 const g=gItem(i);if(g)return g[1]*(P.idx[v]??1.07);
 const r=P.rel&&P.rel[v]&&P.rel[v][i];if(r)return r;return (P.base[i]??d[5])*(P.idx[v]??1.07)}
/* Le moins cher parmi les magasins choisis. */
function ppk(i){let best=null;for(const v of myStores()){const e=ppkAt(i,v);if(e!=null&&(!best||e<best.e))best={e,v}}
 return best||{e:ppkAt(i,"carrefour"),v:""}}
function coursesReset(){GL=null;GX=new Set();for(const k in RM)delete RM[k]}
const prixDate=()=>typeof PRIX==="object"?new Date(PRIX.date).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"}):"";
function budgetCard(wc){const B=PROF.budget||45,st=myStores(),pct=Math.min(100,wc/B*100),over=wc>B,diff=Math.abs(B-wc);
 return `<div class="card stack" id="budget-card"><div class="row"><div class="lab sp">Budget courses</div><b><span id="v-nb">${B}</span> € / semaine</b></div>
 <input type="range" id="nb-budget" min="15" max="200" step="5" value="${B}" aria-label="Budget courses par semaine">
 <div class="bbar"><i style="width:${pct}%;background:${over?"var(--warn)":"var(--acc)"}"></i></div>
 <div class="row small"><span class="sp">Total de la semaine : <b>${eur(wc)}</b></span><b style="color:${over?"var(--warn)":"var(--acc)"}">${over?`${eur(diff)} au-dessus`:`${eur(diff)} sous le budget`}</b></div>
 <div class="small">Gamme choisie pour ton budget : <b>${GAM[gLvl()]}</b>${GX.size?` <span class="muted">+ ${GX.size} produit${GX.size>1?"s":""} en gamme au-dessus pour finir le budget</span>`:""}</div>
 <div class="small muted">Ton budget est fait pour être dépensé : le coach vise environ ${B} € et y met la meilleure qualité possible (gamme au-dessus, viande et poisson Label Rouge, produits frais ou bio). Il ne cherche pas les petites économies.${!over&&gLvl()===3&&wc<B*.9?` Même en meilleure gamme, ta semaine coûte ${eur(wc)} : il te reste de la marge.`:""}</div>
 ${over||wc<B*.9?`<button class="btn" id="regen-b">${over?`Recomposer mes repas pour tenir ${B} €`:`Recomposer mes repas pour mieux utiliser mes ${B} €`}</button>`:""}
 <div class="lab" style="margin-top:6px">Mes magasins · plusieurs choix possibles</div>
 <div class="chips">${STORES.map(s=>`<button class="chip" data-nst="${s.v}" aria-pressed="${st.includes(s.v)}">${s.l}</button>`).join("")}</div>
 <div class="small muted">Pour un même article, le coach prend le magasin le moins cher parmi ceux que tu choisis : ce qui est gagné part dans la qualité. Prix relevés le ${prixDate()}, mis à jour chaque mois.</div></div>`}
function saveCourses(){PROF.store=myStores()[0];LS.set("coach-profile",PROF);coursesReset()}
document.addEventListener("input",e=>{if(e.target.id==="nb-budget"){const v=$("#v-nb");if(v)v.textContent=e.target.value}});
document.addEventListener("change",e=>{if(e.target.id==="nb-budget"){PROF.budget=+e.target.value;saveCourses();render()}});
document.addEventListener("click",e=>{const t=e.target.closest("[data-nst],#regen-b");if(!t)return;
 if(t.id==="regen-b"){LS.set("coach-week",{...genWeek(Date.now()%1e9),v:2});LS.set("coach-shop",{});render();toast(`Repas recomposés pour ton budget de ${PROF.budget} €.`);return}
 const v=t.dataset.nst;let s=myStores();s=s.includes(v)?s.filter(x=>x!==v):[...s,v];if(!s.length){toast("Garde au moins un magasin.");return}
 PROF.stores=s;saveCourses();render()});

/* ===== Courses réelles : on achète des paquets entiers, seulement pour les repas qui restent, moins ce qu'il y a déjà à la maison ===== */
/* Taille d'un paquet en magasin (g, ou ml pour les liquides) et son nom. Les fruits et légumes vendus à la pièce : poids d'une pièce. */
const PACK={riz:[1000,"paquet de 1 kg"],pates:[500,"paquet de 500 g"],semoule:[500,"paquet de 500 g"],avoine:[500,"sachet de 500 g"],painc:[500,"pain de 500 g"],wrap:[370,"paquet de 6 wraps"],painb:[300,"paquet de 4 pains"],
 pdt:[2500,"filet de 2,5 kg"],patd:[1000,"sachet de 1 kg"],lentilles:[500,"paquet de 500 g"],poischi:[265,"boîte de 400 g"],harico:[250,"boîte de 400 g"],
 poulet:[500,"barquette de 500 g"],dinde:[400,"barquette de 4 escalopes"],boeuf:[500,"barquette de 500 g"],thon:[112,"boîte de 140 g"],saumon:[250,"paquet de 2 pavés"],oeuf:[360,"boîte de 6 œufs"],
 tofu:[200,"bloc de 200 g"],fblanc:[1000,"pot de 1 kg"],skyr:[450,"pot de 450 g"],lait:[1000,"brique de 1 L"],whey:[1000,"pot de 1 kg"],fromr:[200,"sachet de 200 g"],mozza:[125,"boule de 125 g"],
 banane:[120,"banane"],pomme:[150,"pomme"],frouges:[500,"sachet de 500 g"],cacah:[350,"pot de 350 g"],amandes:[200,"sachet de 200 g"],huile:[690,"bouteille de 75 cl"],miel:[250,"pot de 250 g"],
 brocoli:[1000,"sachet de 1 kg"],courgette:[250,"courgette"],poivron:[500,"filet de 3 poivrons"],tomate:[400,"boîte de 400 g"],oignon:[1000,"filet de 1 kg"],carotte:[1000,"sachet de 1 kg"],
 hverts:[1000,"sachet de 1 kg"],epinard:[750,"sachet de 750 g"],soja:[250,"bouteille de 25 cl"],coco:[400,"boîte de 40 cl"],avocat:[170,"avocat"],mais:[285,"boîte de 285 g"],salade:[250,"sachet de 250 g"],
 porc:[500,"filet mignon (~500 g)"],jambon:[160,"paquet de 4 tranches"],cabil:[500,"sachet de 500 g"],bveg:[1000,"brique de 1 L"],galriz:[130,"paquet de 130 g"],quinoa:[500,"paquet de 500 g"],
 nouilles:[250,"paquet de 250 g"],champi:[250,"barquette de 250 g"],parmesan:[100,"sachet de 100 g"],bacon:[120,"paquet de 120 g"],chevre:[180,"bûche de 180 g"],butternut:[1200,"courge (~1,2 kg)"],
 cottage:[200,"pot de 200 g"],ffrais:[150,"pot de 150 g"],farine:[1000,"paquet de 1 kg"],farriz:[500,"paquet de 500 g"],sarrasin:[500,"paquet de 500 g"],crevette:[200,"barquette de 200 g"],
 truite:[250,"paquet de 250 g"],feuilriz:[200,"paquet de 200 g"],cornfl:[500,"boîte de 500 g"],cacao:[250,"boîte de 250 g"],chocnoir:[100,"tablette de 100 g"],chocblanc:[100,"tablette de 100 g"],
 dattes:[250,"sachet de 250 g"],chia:[250,"sachet de 250 g"],mangue:[300,"mangue"],ananas:[900,"ananas"],cocorap:[125,"sachet de 125 g"],noisettes:[200,"sachet de 200 g"],cajou:[200,"sachet de 200 g"],
 peche:[150,"pêche"],concombre:[300,"concombre"],tomfr:[500,"barquette de 500 g"],chou:[1000,"chou (~1 kg)"],betterave:[500,"paquet de 500 g"],biscuit:[250,"paquet de 250 g"],creme:[200,"brique de 20 cl"],
 cancoillotte:[250,"pot de 250 g"],raclette:[400,"barquette de 400 g"],gnocchi:[500,"paquet de 500 g"],pinsa:[230,"pâte (~230 g)"],udon:[200,"sachet de 200 g"],saumfume:[150,"paquet de 150 g"],
 panko:[200,"sachet de 200 g"],sardine:[100,"boîte de 135 g"],chorizo:[100,"paquet de 100 g"],maizena:[400,"boîte de 400 g"],cremriz:[500,"sachet de 500 g"]};
const packOf=i=>PACK[i]||[500,"paquet de 500 g"];
function packQ(i,n){const l=packOf(i)[1];if(n<=1)return "1 "+l;const w=l.split(" ");w[0]=w[0]==="chou"?"choux":/[sx]$/.test(w[0])?w[0]:w[0]+"s";return n+" "+w.join(" ")}
/* Quantité lisible : œufs à la pièce, lait en litres, sinon g / kg. */
function gtxt(i,g){if(i==="oeuf"){const n=Math.max(1,Math.round(g/60));return n+" œuf"+(n>1?"s":"")}
 if(i==="lait"||i==="bveg")return fr(g/1000,2)+" L";return g>=1000?fr(g/1000,1)+" kg":Math.max(5,Math.round(g/5)*5)+" g"}
const PERI=new Set(["Viande et poisson","Fruits et légumes","Frais","Crèmerie","Charcuterie","Boulangerie"]);
/* Semaine = lundi 0 h (clé des réglages qui ne valent que pour une semaine). */
const wkKey=(t=Date.now())=>{const d=new Date(t);d.setHours(0,0,0,0);d.setDate(d.getDate()-(d.getDay()+6)%7);return d.getTime()};
/* « Mes courses couvrent à partir de… » : jour (index dans WEEK) et repas ; null = toute la semaine. */
function shopFrom(){const f=LS.get("coach-shopfrom",null);return f&&f.wk===wkKey()?f:null}
/* Ce qu'il y a à la maison au moment des courses de cette semaine (confirmé par toi). */
function stockNow(){const s=LS.get("coach-stock",null);return s&&s.wk===wkKey()?s.g||{}:{}}
/* Fin de semaine : le reste prévu de la semaine passée attend ta confirmation. */
function invDue(){const L=LS.get("coach-left",null),S=LS.get("coach-stock",null),cw=wkKey();return !!(L&&L.wk<cw&&!(S&&S.wk===cw)&&Object.keys(L.g||{}).length)}
let INV=null;
function invCard(){if(!INV&&invDue())INV={wk:wkKey(),g:{...LS.get("coach-left",{}).g},due:1};if(!INV)return "";
 const ks=Object.keys(INV.g).filter(i=>ING[i]).sort((a,b)=>ingName(a).localeCompare(ingName(b)));
 return `<div class="card hot stack" id="inv"><div class="lab">🏠 Ce qu'il te reste à la maison</div>
 <div class="small muted">${INV.due?"Ta semaine est finie. D'après tes courses et tes repas, il devrait te rester ceci : c'est bien ça ? Corrige les quantités (0 si tu n'en as plus) ou ajoute ce qui manque, puis confirme.":"Indique ce que tu as déjà : la liste n'achètera que ce qui manque."} Ta liste de courses ne te fera pas racheter ce que tu as.</div>
 ${ks.length?`<ul class="list">${ks.map(i=>`<li><span class="sp">${ingName(i)}${PERI.has(ING[i][6])?`<br><small class="muted">Frais : vérifie la date</small>`:""}</span><input class="txt" type="number" inputmode="decimal" min="0" data-inv="${i}" value="${i==="oeuf"?Math.round(INV.g[i]/60):Math.round(INV.g[i])}" style="width:92px;padding:8px;font-size:16px;text-align:right"><small style="width:36px">${i==="oeuf"?"œufs":i==="lait"||i==="bveg"?"ml":"g"}</small><button class="chip" data-invx="${i}" aria-label="Retirer ${esc(ingName(i))}">✕</button></li>`).join("")}</ul>`:`<div class="small muted">Rien pour l'instant.</div>`}
 <select class="txt" id="inv-add" style="font-size:16px;padding:12px"><option value="">＋ Il me reste aussi…</option>${Object.keys(ING).filter(i=>!(i in INV.g)).sort((a,b)=>ingName(a).localeCompare(ingName(b))).map(i=>`<option value="${i}">${ingName(i)}</option>`).join("")}</select>
 <button class="btn" id="inv-ok">${INV.due?"Oui, c'est bien ce qu'il me reste":"Enregistrer"}</button>
 <button class="btn ghost" id="inv-none">${INV.due?"Il ne me reste rien":"Annuler"}</button></div>`}
document.addEventListener("input",e=>{const i=e.target.dataset&&e.target.dataset.inv;if(i&&INV){const v=Math.max(0,+e.target.value||0);INV.g[i]=i==="oeuf"?v*60:v}});
document.addEventListener("change",e=>{if(e.target.id==="inv-add"&&INV&&e.target.value){INV.g[e.target.value]=packOf(e.target.value)[0];render()}
 if(e.target.id==="shop-from"){const v=e.target.value;if(v==="all")LS.set("coach-shopfrom",null);else{const [di,si]=v.split(":").map(Number);LS.set("coach-shopfrom",{wk:wkKey(),di,si})}render()}});
document.addEventListener("click",e=>{const t=e.target.closest("[data-invx],#inv-ok,#inv-none,#inv-open");if(!t)return;
 if(t.id==="inv-open"){INV={wk:wkKey(),g:{...stockNow()}};render();return}
 if(t.dataset.invx){delete INV.g[t.dataset.invx];render();return}
 if(t.id==="inv-none"&&!INV.due){INV=null;render();return}
 const g={};if(t.id==="inv-ok")for(const i in INV.g)if(INV.g[i]>0)g[i]=Math.round(INV.g[i]);
 const due=INV.due;LS.set("coach-stock",{wk:INV.wk,g});if(due)LS.set("coach-shop",{});INV=null;render();
 toast(Object.keys(g).length?`Noté : ${Object.keys(g).length} aliment${Object.keys(g).length>1?"s":""} à la maison, ta liste en tient compte.`:"Noté : rien à la maison, liste complète.")});
/* Choix « mes courses couvrent… » : toute la semaine ou à partir d'un repas d'aujourd'hui ou d'après. */
function shopFromSel(){const F=shopFrom(),SA=mealSlots(),td=(new Date().getDay()+6)%7,d0=F?Math.min(F.di,td):td;let o=`<option value="all">Toute la semaine (lundi → dimanche)</option>`;
 for(let di=d0;di<7;di++)SA.forEach(([k,l],si)=>{o+=`<option value="${di}:${si}" ${F&&F.di===di&&F.si===si?"selected":""}>À partir ${/^collation/i.test(l)?"de la":"du"} ${l.toLowerCase()} de ${DLONG[WEEK[di]].toLowerCase()}${di===td?" (aujourd'hui)":""}</option>`});
 return `<label class="lab" for="shop-from">Mes courses couvrent</label><select class="txt" id="shop-from" style="font-size:16px;padding:12px">${o}</select>`}
