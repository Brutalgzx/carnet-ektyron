/* Historique des séances : calendrier du mois, détail de chaque séance, suppression définitive.
   Une séance supprimée est notée dans « coach-del » (synchronisé) : aucune sauvegarde ni aucun autre téléphone ne peut la faire revenir. */
const MOIS=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
let hMonth=null,hDay=null;
const delCfg=()=>({g:[],e:[],...LS.get("coach-del",{})});
/* Retire partout ce qui a été supprimé (au lancement et après chaque synchro). */
function delPurge(){const D=delCfg();if(!D.g.length&&!D.e.length)return false;const G=new Set(D.g),E=new Set(D.e);let ch=false;
 const X=xpProf(),n=X.games.length;X.games=X.games.filter(g=>!G.has(g.t));if(X.games.length!==n){LS.set("carnet-xp",X);ch=true}
 const S=LS.get("carnet",{});let cs=false;for(const id in S){if(!Array.isArray(S[id]))continue;const m=S[id].length;S[id]=S[id].filter(h=>!E.has(h.t));if(S[id].length!==m)cs=true;if(!S[id].length)delete S[id]}
 if(cs){LS.set("carnet",S);store=S;ch=true}return ch}

/* Séances jouées, chacune avec les exercices notés pendant (entre la séance précédente et la fin, 4 h au plus). */
function histSessions(){const G=[...xpProf().games].sort((a,b)=>a.t-b.t),E=[];
 for(const id in store)if(Array.isArray(store[id]))for(const h of store[id])if(h&&h.t&&(h.sets||[]).some(s=>s&&s.r>0))E.push({id,...h});
 return G.map((g,i)=>{const from=Math.max(i?G[i-1].t:0,g.t-4*3600e3),ex=E.filter(e=>e.t>from&&e.t<=g.t).sort((a,b)=>a.t-b.t);
  return{...g,ex,start:ex.length?ex[0].t:null}})}
const dKey=t=>{const d=new Date(t);return d.getFullYear()+"-"+d.getMonth()+"-"+d.getDate()};

function vHist(){const S=histSessions(),by={};for(const s of S)(by[dKey(s.t)]=by[dKey(s.t)]||[]).push(s);
 const last=S.length?new Date(S[S.length-1].t):new Date();if(!hMonth)hMonth=[last.getFullYear(),last.getMonth()];if(hDay==null&&S.length)hDay=dKey(S[S.length-1].t);
 const [y,m]=hMonth,first=new Date(y,m,1),pad=(first.getDay()+6)%7,nd=new Date(y,m+1,0).getDate(),today=dKey(Date.now());
 const nMonth=S.filter(s=>{const d=new Date(s.t);return d.getFullYear()===y&&d.getMonth()===m}).length;
 let cells="";for(let i=0;i<pad;i++)cells+="<span></span>";
 for(let d=1;d<=nd;d++){const k=y+"-"+m+"-"+d,n=(by[k]||[]).length;
  cells+=`<button class="hc${n?" on":""}${k===hDay?" sel":""}${k===today?" today":""}" data-hday="${k}" aria-label="${d} ${MOIS[m]}${n?`, ${n} séance${n>1?"s":""}`:""}">${d}${n>1?`<i>${n}</i>`:""}</button>`}
 const day=(by[hDay]||[]).slice().reverse();
 const det=day.map(s=>{const T=TRAIN&&TRAIN[s.day],dur=s.start?Math.round((s.t-s.start)/60000):null,hh=t=>new Date(t).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});
  const ex=s.ex.map(e=>{const sets=e.sets.filter(x=>x&&x.r>0);return `<li><span class="sp"><b class="small">${esc((EX[e.id]||[e.id])[0])}</b>${e.dl?' <small class="muted">· décharge</small>':""}<br><small class="muted">${sets.map(x=>x.k>0?`${kgS(x.k)} × ${x.r}`:`${x.r} reps`).join(" · ")}</small></span><small class="muted">${sets.length} série${sets.length>1?"s":""}</small></li>`}).join("");
  return `<div class="card stack"><div class="row"><span class="sp"><div class="lab">${s.start?hh(s.start)+" – ":""}${hh(s.t)}</div><b style="font-size:18px">${esc(T?T.t:"Séance")}</b></span></div>
  <div class="kpis"><div><strong>${s.sets||0}</strong><small>séries</small></div><div><strong>${fr(toU(s.vol||0))}</strong><small>volume (${wU()})</small></div><div><strong>${dur!=null?dur+" min":"–"}</strong><small>durée</small></div></div>
  ${ex?`<ul class="list">${ex}</ul>`:'<p class="small muted" style="margin:0">Détail des exercices non disponible pour cette séance.</p>'}
  <button class="link" data-hdel="${s.t}" style="color:var(--bad)">Supprimer cette séance</button></div>`}).join("");
 const lbl=hDay?(()=>{const [a,b,c]=hDay.split("-").map(Number);return new Date(a,b,c).toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})})():"";
 return `<div class="row" style="margin-top:-8px"><button class="chip" data-tab="prog">‹ Progrès</button></div>
 <div class="card stack"><div class="row"><button class="chip" data-hm="-1" aria-label="Mois précédent">‹</button><b class="sp" style="text-align:center;text-transform:capitalize">${MOIS[m]} ${y}</b><button class="chip" data-hm="1" aria-label="Mois suivant">›</button></div>
 <div class="hcal">${["L","M","M","J","V","S","D"].map(x=>`<small>${x}</small>`).join("")}${cells}</div>
 <p class="small muted" style="margin:0;text-align:center">${nMonth} séance${nMonth>1?"s":""} ce mois-ci · ${S.length} au total</p></div>
 ${hDay?`<div class="lab" style="text-transform:none">${lbl}</div>${det||'<p class="small muted">Pas de séance ce jour-là.</p>'}`:""}`}

document.addEventListener("click",e=>{const t=e.target.closest("button");if(!t||!PROF)return;const D=t.dataset;
 if(D.hday){hDay=D.hday;render();return}
 if(D.hm){let [y,m]=hMonth;m+=+D.hm;if(m<0){m=11;y--}if(m>11){m=0;y++}hMonth=[y,m];render();return}
 if(D.hdel){const s=histSessions().find(x=>x.t===+D.hdel);if(!s||!confirm(`Supprimer définitivement cette séance (${s.ex.length} exercice${s.ex.length>1?"s":""}) ?`))return;
  const Dl=delCfg();Dl.g.push(s.t);Dl.e.push(...s.ex.map(x=>x.t));LS.set("coach-del",Dl);delPurge();toast("Séance supprimée.");render();return}});
