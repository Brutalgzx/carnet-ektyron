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
