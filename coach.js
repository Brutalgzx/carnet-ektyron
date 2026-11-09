/* ================= Coach : progression des charges, stagnation, décharge, unités =================
   Chargé avant app.js : uniquement des fonctions, qui utilisent les globales d'app.js et de suivi.js au moment où elles s'exécutent. */
const SET=()=>({wu:"kg",lu:"cm",bk:7,dlw:6,...LS.get("coach-set",{})});
const LB=2.20462,INCH=2.54;
const wU=()=>SET().wu,lU=()=>SET().lu;
const toU=kg=>wU()==="lb"?kg*LB:kg, fromU=v=>wU()==="lb"?v/LB:v;
const kIn=kg=>wU()==="lb"?Math.round(kg*LB*2)/2:kg;
const kgS=(kg,d=1)=>`${fr(toU(kg),d).replace(/,0+$/,"")} ${wU()}`;
const toL=cm=>lU()==="in"?cm/INCH:cm, fromL=v=>lU()==="in"?v*INCH:v;
const cmS=(cm,d=1)=>`${fr(toL(cm),d)} ${lU()==="in"?"in":"cm"}`;
const r25=k=>Math.max(0,Math.round(k/2.5)*2.5);

/* ---------- Décharge ---------- */
const dlCfg=()=>({last:0,until:0,snooze:0,...LS.get("coach-deload",{})});
const deloadOn=()=>Date.now()<dlCfg().until;
/* Semaines où tu t'es entraîné depuis la dernière décharge (ou depuis le début). */
function weeksSince(){const g=xpProf().games,D=dlCfg(),s=Math.max(D.until||0,g.length?Math.min(...g.map(x=>x.t)):0);return new Set(g.filter(x=>x.t>=s).map(x=>mondayOf(x.t))).size}
function deloadDue(){if(deloadOn()||!xpProf().games.length)return false;const D=dlCfg();if(Date.now()<D.snooze)return false;
 const w=weeksSince();return w>=SET().dlw-1||(w>=3&&coachAll().filter(a=>a.k==="stall").length>=3)}
function deloadStart(){const D=dlCfg();D.until=Date.now()+7*DAY;D.last=Date.now();LS.set("coach-deload",D)}

/* ---------- Analyse par exercice ---------- */
/* Exercices du programme actuel, avec le jour et la place où on les trouve. */
function progEx(){const m={};if(!TRAIN)return m;for(const d of WEEK){const S=TRAIN[d];if(S)S.x.forEach((e,i)=>{if(!m[e.id])m[e.id]={e,d,i}})}return m}
const hist=id=>(store[id]||[]).filter(x=>!x.dl&&x.sets&&x.sets.length);
const bestE=h=>Math.max(...h.sets.map(e1rm));
/* Double progression : toutes les séries en haut de fourchette → +2,5 kg.
   Stagnation : aucune séance des 3 dernières ne dépasse ta meilleure force estimée (Epley) d'avant. */
function exAdvice(id,e){const H=hist(id),n=H.length;if(!n)return null;const L=H[n-1],top=Math.max(...L.sets.map(s=>s.k));
 if(L.sets.length>=e.s&&L.sets.every(s=>s.r>=e.r[1]))return{k:"up",id,n:e.n,from:top,to:top?top+2.5:0};
 if(n>=3){const E=H.slice(-3).map(bestE),ref=n>3?Math.max(...H.slice(0,-3).map(bestE)):E[0],cmp=n>3?E:E.slice(1);
  if(Math.max(...cmp)<=ref*1.01)return{k:"stall",id,n:e.n,from:top,to:r25(top*.9)}}
 const miss=L.sets.filter(s=>s.r<e.r[1]).length;return{k:"go",id,n:e.n,from:top,miss,goal:e.r[1]}}
function coachAll(){const P=progEx(),out=[];for(const id in P){const a=exAdvice(id,P[id].e);if(a){a.d=P[id].d;a.i=P[id].i;out.push(a)}}return out}
const advTxt=a=>a.k==="up"?(a.to?`<b>${a.n}</b> : toutes tes séries en haut de fourchette. Passe à <b>${kgS(a.to)}</b> à la prochaine séance.`:`<b>${a.n}</b> : fourchette validée. Ajoute un lest ou ralentis la descente.`)
 :a.k==="stall"?`<b>${a.n}</b> : même force depuis 3 séances. Redescends à <b>${kgS(a.to)}</b> et remonte, ou change d'exercice.`:"";

/* ---------- Bilan de la semaine ---------- */
function weekStats(off=0){const a=mondayOf(Date.now())-off*7*DAY,b=a+7*DAY,g=xpProf().games.filter(x=>x.t>=a&&x.t<b);
 let prs=0;for(const id in store){const H=store[id].filter(x=>x.sets&&x.sets.length);H.forEach((h,i)=>{if(h.t>=a&&h.t<b&&!h.dl&&i>0){const before=Math.max(...H.slice(0,i).map(bestE));if(bestE(h)>before*1.005)prs++}})}
 return{n:g.length,vol:g.reduce((s,x)=>s+(x.vol||0),0),prs}}
function coachWeekMsg(){const p=PROF,A=weekStats(0),B=weekStats(1),W=LS.get("coach-weights",[]),wk=weeksSince(),o=[];
 if(!xpProf().games.length)return "Joue ta première séance : ton coach suit ensuite chaque série et te dit quand monter les charges.";
 o.push(`${A.n}/${p.freq} séance${p.freq>1?"s":""} cette semaine${A.n>=p.freq?" : objectif rempli 👏":A.n?"":" : il est encore temps"}.`);
 if(A.vol&&B.vol)o.push(`Volume ${A.vol>=B.vol?"+":"−"}${fr(Math.abs(A.vol-B.vol)/B.vol*100)} % par rapport à la semaine dernière.`);
 if(A.prs)o.push(`${A.prs} record${A.prs>1?"s":""} de force battu${A.prs>1?"s":""}.`);
 const w7=W.filter(w=>Date.now()-w.t<=7*DAY),w14=W.filter(w=>Date.now()-w.t>7*DAY&&Date.now()-w.t<=14*DAY);
 if(w7.length&&w14.length){const d=w7.reduce((s,w)=>s+w.kg,0)/w7.length-w14.reduce((s,w)=>s+w.kg,0)/w14.length;o.push(`Poids ${d>=0?"+":"−"}${kgS(Math.abs(d))} en moyenne.`)}
 const ups=coachAll().filter(a=>a.k==="up").length;if(ups)o.push(`${ups} exercice${ups>1?"s":""} prêt${ups>1?"s":""} à monter.`);
 if(deloadOn())o.push("Semaine de décharge en cours : on récupère pour mieux repartir.");else o.push(`Semaine ${wk} du cycle${SET().dlw-wk>0?`, décharge dans ${SET().dlw-wk} semaine${SET().dlw-wk>1?"s":""}`:""}.`);
 return o.join(" ")}

/* ---------- Affichage ---------- */
function deloadBox(){if(deloadOn()){const u=dlCfg().until;return `<div class="hintbox"><span style="font-size:26px">🔋</span><span><b>Semaine de décharge</b><br><small class="muted">Jusqu'au ${new Date(u).toLocaleDateString("fr-FR",{weekday:"long",day:"numeric"})} : charges −15 % (déjà proposées en séance), arrête-toi à 2-3 reps de l'échec. Tes articulations et ton système nerveux récupèrent.</small><br><button class="chip" id="dl-stop" style="margin-top:6px">Arrêter la décharge</button></span></div>`}
 if(!deloadDue())return "";return `<div class="hintbox" style="border-color:var(--warn)"><span style="font-size:26px">🔋</span><span><b>Place à une semaine de décharge</b><br><small class="muted">${weeksSince()} semaines d'entraînement d'affilée : ta fatigue s'accumule. Une semaine plus légère (−15 % sur les charges) et tu repars plus fort.</small><div class="row" style="margin-top:8px"><button class="btn sm" id="dl-go" style="flex:1">Commencer cette semaine</button><button class="chip" id="dl-later">Plus tard</button></div></span></div>`}
function coachCard(){const all=coachAll(),ups=all.filter(a=>a.k==="up"),st=all.filter(a=>a.k==="stall");
 return `<div class="card stack" id="sec-coach"><div class="lab">Ton coach</div><div class="coachmsg" style="margin:0">${coachWeekMsg()}</div>${jeuCoach()}${deloadBox()}
 ${ups.length?`<div><div class="small"><b>📈 À monter</b></div><ul class="list">${ups.map(a=>`<li><span class="sp small">${advTxt(a)}</span></li>`).join("")}</ul></div>`:""}
 ${st.length?`<div><div class="small"><b>⏸️ En stagnation</b></div><ul class="list">${st.map(a=>`<li><span class="sp small">${advTxt(a)}</span><button class="chip" data-cswap="${a.d},${a.i}">🔄 Changer</button></li>`).join("")}</ul></div>`:""}
 ${!ups.length&&!st.length&&all.length?`<p class="small muted" style="margin:0">Aucune charge à changer : vise une rep de plus par série, à charge égale. Quand toutes tes séries atteignent le haut de la fourchette, ton coach te fait monter de 2,5 kg.</p>`:""}</div>`}
function coachToday(){const b=deloadBox();return b?`<div class="card stack"><div class="lab">Ton coach</div>${b}</div>`:""}
/* Fin de séance : ce que le coach retient des exercices joués. */
function coachEnd(){const P=progEx(),L=[];for(const e of gList()){if(!(G.sets[e.id]||[]).some(Boolean))continue;const a=exAdvice(e.id,(P[e.id]||{e}).e);if(a&&a.k!=="go")L.push(advTxt(a))}
 const tail=deloadOn()?"Semaine de décharge : c'est normal de soulever moins.":deloadDue()?"Ton coach te propose une semaine de décharge : regarde l'onglet Progrès.":"";
 return L.length||tail?`<div class="card stack"><div class="lab">Le coach pour la prochaine fois</div>${L.map(x=>`<div class="small">${x}</div>`).join("")}${tail?`<div class="small muted">${tail}</div>`:""}</div>`:""}

document.addEventListener("click",e=>{const t=e.target.closest("button");if(!t||!PROF)return;const D=t.dataset;
 if(t.id==="dl-go"){deloadStart();toast("Semaine de décharge lancée : charges −15 %.");render();return}
 if(t.id==="dl-later"){const C=dlCfg();C.snooze=Date.now()+7*DAY;LS.set("coach-deload",C);render();return}
 if(t.id==="dl-stop"){const C=dlCfg();C.until=Date.now();LS.set("coach-deload",C);render();return}
 if(D.cswap){const [d,i]=D.cswap.split(",").map(Number);selDay=d;autoSwap(i);return}});
