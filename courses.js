/* Courses : budget par semaine, magasins (plusieurs choix) et prix réels issus de prix.js (relevé daté). */
const myStores=()=>{const s=(PROF&&PROF.stores&&PROF.stores.length?PROF.stores:[PROF&&PROF.store||"carrefour"]);return s.filter(v=>STORES.some(x=>x.v===v))};
const stLab=v=>(STORES.find(s=>s.v===v)||{l:v}).l;
/* Prix au kilo d'un ingrédient dans un magasin (null si l'enseigne ne vend pas ce rayon). */
function ppkAt(i,v){const P=typeof PRIX==="object"?PRIX:null,d=ING[i];if(!P)return d[5]*((STORES.find(s=>s.v===v)||{f:1}).f);
 const ry=P.rayons&&P.rayons[v];if(ry&&!ry.includes(d[6]))return null;
 const r=P.rel&&P.rel[v]&&P.rel[v][i];if(r)return r;return (P.base[i]??d[5])*(P.idx[v]??1.07)}
/* Le moins cher parmi les magasins choisis. */
function ppk(i){let best=null;for(const v of myStores()){const e=ppkAt(i,v);if(e!=null&&(!best||e<best.e))best={e,v}}
 return best||{e:ppkAt(i,"carrefour"),v:""}}
function coursesReset(){for(const k in RM)delete RM[k]}
const prixDate=()=>typeof PRIX==="object"?new Date(PRIX.date).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"}):"";
function budgetCard(wc){const B=PROF.budget||45,st=myStores(),pct=Math.min(100,wc/B*100),over=wc>B,diff=Math.abs(B-wc);
 return `<div class="card stack" id="budget-card"><div class="row"><div class="lab sp">Budget courses</div><b><span id="v-nb">${B}</span> € / semaine</b></div>
 <input type="range" id="nb-budget" min="15" max="200" step="5" value="${B}" aria-label="Budget courses par semaine">
 <div class="bbar"><i style="width:${pct}%;background:${over?"var(--warn)":"var(--acc)"}"></i></div>
 <div class="row small"><span class="sp">Total de la semaine : <b>${eur(wc)}</b></span><b style="color:${over?"var(--warn)":"var(--acc)"}">${over?`${eur(diff)} au-dessus`:`${eur(diff)} sous le budget`}</b></div>
 ${over?`<button class="btn" id="regen-b">Recomposer mes repas pour tenir ${B} €</button>`:""}
 <div class="lab" style="margin-top:6px">Mes magasins · plusieurs choix possibles</div>
 <div class="chips">${STORES.map(s=>`<button class="chip" data-nst="${s.v}" aria-pressed="${st.includes(s.v)}">${s.l}</button>`).join("")}</div>
 <div class="small muted">Pour chaque article, le coach prend le magasin le moins cher parmi ceux que tu choisis. Prix relevés le ${prixDate()}, mis à jour chaque mois.</div></div>`}
function saveCourses(){PROF.store=myStores()[0];LS.set("coach-profile",PROF);coursesReset()}
document.addEventListener("input",e=>{if(e.target.id==="nb-budget"){const v=$("#v-nb");if(v)v.textContent=e.target.value}});
document.addEventListener("change",e=>{if(e.target.id==="nb-budget"){PROF.budget=+e.target.value;saveCourses();render()}});
document.addEventListener("click",e=>{const t=e.target.closest("[data-nst],#regen-b");if(!t)return;
 if(t.id==="regen-b"){LS.set("coach-week",{...genWeek(Date.now()%1e9),v:2});LS.set("coach-shop",{});render();toast(`Repas recomposés pour tenir ${PROF.budget} €.`);return}
 const v=t.dataset.nst;let s=myStores();s=s.includes(v)?s.filter(x=>x!==v):[...s,v];if(!s.length){toast("Garde au moins un magasin.");return}
 PROF.stores=s;saveCourses();render()});
