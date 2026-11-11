/* Mode jeu entre potes : personnage à 6 stats, groupe « Où il en est », Roi de la machine.
   Le serveur ne reçoit que des scores (pseudo, %, séries, XP par stat, records rapportés au poids) : jamais les séances ni les repas. */
const JEU_STATS=[["pecs","Pecs","🦍"],["dos","Dos","🦅"],["jambes","Jambes","🦵"],["bras","Bras","💪"],["reg","Régularité","📅"],["nut","Nutrition","🥗"]];
const JEU_GRP={pecs:"pecs",lats:"dos",dos:"dos",lomb:"dos",arr:"bras",ant:"bras",lat:"bras",bic:"bras",tri:"bras",quad:"jambes",isch:"jambes",fess:"jambes",add:"jambes",moll:"jambes"};
const JEU_SHARE=[["goal","Objectif en %"],["streak","Série de semaines"],["week","Séances de la semaine"],["stats","Personnage"],["rec","Records (Roi de la machine)"],["kg","Mon poids"]];
const JEU_TIP={pecs:"ajoute une série de développé ou d'écarté sur tes séances haut du corps",dos:"ajoute une série de tirage ou de rowing",jambes:"ne zappe pas la séance jambes, ajoute une série de squat ou de presse",bras:"ajoute une série de curl et d'extension triceps en fin de séance",reg:"fais toutes tes séances prévues cette semaine",nut:"coche tes repas et vise ta cible de protéines"};
const jeuCfg=()=>{const c={code:"",nick:"",nd:{},last:null,held:[],...LS.get("coach-jeu",{})};c.share={goal:1,streak:1,week:1,stats:1,rec:1,kg:0,...c.share};return c};
/* Niveau d'une stat : niv. 2 à 400 XP (≈ 40 séries du muscle, ou 10 séances pour la Régularité), niv. 3 à 1 600, niv. 4 à 3 600. */
const statLv=xp=>Math.floor(Math.sqrt(xp/400))+1;
const jeuPlan=()=>Math.max(1,(PROF.days||[]).length||PROF.freq||3);
let jeuSel=null,jeuT=null,jeuBusy=false;

/* Groupe musculaire d'un exercice (MUSC de data.js, sinon la catégorie de l'exercice). */
function jeuGroupOf(id){const g=JEU_GRP[MUSCOF[id]];if(g)return g;const c=((EX[id]||[])[1]||"").toLowerCase();
 return /pec/.test(c)?"pecs":/dos|lomb/.test(c)?"dos":/jamb|quad|isch|fess|moll|cuisse/.test(c)?"jambes":/bras|bic|tri|épaule|epaule/.test(c)?"bras":null}

/* Semaines tenues (séances faites ≥ prévues) : série en cours et séances manquées depuis le début. */
function jeuWeeks(){const G=xpProf().games,plan=jeuPlan(),now=mondayOf(Date.now());if(!G.length)return{streak:0,missed:0,done:0};
 const cnt={};for(const g of G){const m=mondayOf(g.t);cnt[m]=(cnt[m]||0)+1}
 let missed=0;for(let w=mondayOf(G[0].t);w<now;w=mondayOf(w+8*DAY))missed+=Math.max(0,plan-(cnt[w]||0));
 let streak=(cnt[now]||0)>=plan?1:0;for(let w=mondayOf(now-DAY);(cnt[w]||0)>=plan;w=mondayOf(w-DAY))streak++;
 return{streak,missed,done:cnt[now]||0}}

/* Jours où les repas cochés atteignent la cible (protéines ≥ 90 %, kcal à ±15 %) : retenus pour toujours, car « coach-eaten » ne garde que 14 jours. */
function jeuNutDays(c){const E=LS.get("coach-eaten",{}),T=targets();let ch=false;
 for(const k in E){if(c.nd[k]||!Object.values(E[k]).some(Boolean))continue;
  const M=dayMeals(new Date(k+"T12:00").getDay()),sum=L=>L.reduce((a,m)=>({k:a.k+m.k,P:a.P+m.P}),{k:0,P:0}),got=sum(M.filter(m=>E[k][m.slot])),plan=sum(M);
  if(got.P>=Math.min(T.p,plan.P)*.9&&got.k>=Math.min(T.kcal,plan.k)*.85&&got.k<=T.kcal*1.15){c.nd[k]=1;ch=true}}
 if(ch)LS.set("coach-jeu",c);return Object.keys(c.nd).length}

/* XP réelle par stat : 10 par série, +50 par record ; Régularité +40 par séance, −20 par séance prévue sautée ; Nutrition +30 par jour à l'objectif. */
function jeuXP(){const X={pecs:0,dos:0,jambes:0,bras:0,reg:0,nut:0};
 for(const id in store){const g=jeuGroupOf(id);if(!g)continue;let best=0;
  for(const h of store[id]){const S=(h.sets||[]).filter(s=>s&&s.r>0);X[g]+=S.length*10;const b=S.length?Math.max(...S.map(e1rm)):0;if(best&&!h.dl&&b>best*1.005)X[g]+=50;best=Math.max(best,b)}}
 const W=jeuWeeks();X.reg=Math.max(0,xpProf().games.length*40-W.missed*20);X.nut=jeuNutDays(jeuCfg())*30;return X}
const jeuTotal=X=>Object.values(X).reduce((a,b)=>a+b,0);

/* Progression vers l'objectif : par le poids si l'objectif en vise un, sinon par le temps écoulé sur la durée prévue. */
function jeuGoal(){const p=PROF,w=curWeight();if(p.tw!=null&&Math.abs(p.tw-p.w)>=.5)return Math.max(0,Math.min(100,Math.round((w-p.w)/(p.tw-p.w)*100)));
 const G=xpProf().games,t0=G.length?G[0].t:Date.now();return Math.max(0,Math.min(100,Math.round((Date.now()-t0)/((p.months||6)*30.4*DAY)*100)))}

/* Records rapportés au poids de corps : 1RM estimé ÷ poids actuel. */
function jeuRec(){const w=curWeight(),R={};
 for(const id in store){if(!EX[id])continue;const S=store[id].filter(h=>!h.dl).flatMap(h=>(h.sets||[]).filter(s=>s&&s.r>0&&s.k>0));if(!S.length)continue;
  R[id]=[Math.round(Math.max(...S.map(e1rm))/w*100)/100,EX[id][0]]}return R}

function jeuSnap(){const c=jeuCfg(),s=c.share,X=jeuXP(),W=jeuWeeks(),o={nick:c.nick||PROF.name,lvl:level(xpProf().xp).l};
 if(s.goal)o.goal=jeuGoal();if(s.streak)o.streak=W.streak;if(s.week){o.wDone=W.done;o.wPlan=jeuPlan()}if(s.stats)o.stats=X;if(s.rec)o.rec=jeuRec();if(s.kg)o.kg=Math.round(curWeight()*10)/10;return o}

/* Meilleur du groupe sur chaque machine. */
function jeuKings(L){const K={};for(const m of (L&&L.members)||[])for(const [e,[r,n]] of Object.entries(m.rec||{}))if(!K[e]||r>K[e].r)K[e]={r,n,id:m.id,nick:m.nick};return K}

/* ---------- Échanges avec le serveur (même adresse et code que la synchro) ---------- */
function jeuEnsureCode(){const S=syncCfg();if(S.code)return;S.code=newCode();S.auto=false;LS.set("coach-sync",S)}
function jeuGot(L){const c=jeuCfg(),K=jeuKings(L),held=Object.keys(K).filter(e=>K[e].id===L.me),lost=c.held.filter(e=>K[e]&&K[e].id!==L.me);
 c.last={...L,t:Date.now()};c.held=held;LS.set("coach-jeu",c);
 if(lost.length)toast(`👑 ${K[lost[0]].nick} t'a pris ${lost.length>1?lost.length+" machines":K[lost[0]].n} !`);if(view==="jeu")render()}
async function jeuSync(){const c=jeuCfg();if(!c.code||!PROF||jeuBusy)return;jeuBusy=true;
 try{jeuGot(await api("/group/"+c.code,{method:"PUT",body:JSON.stringify(jeuSnap())}))}finally{jeuBusy=false}}
function jeuSoon(){if(!jeuCfg().code)return;clearTimeout(jeuT);jeuT=setTimeout(()=>jeuSync().catch(()=>{}),5000)}
async function jeuJoin(code,nick){jeuEnsureCode();const c=jeuCfg();c.code=code;c.nick=nick;c.held=[];LS.set("coach-jeu",c);
 try{await jeuSync();toast("Bienvenue dans le groupe "+code+" !")}catch(e){const C=jeuCfg();C.code="";LS.set("coach-jeu",C);toast("Impossible de rejoindre : "+jeuErr(e));render()}}
async function jeuCreate(nick){jeuEnsureCode();try{const {code}=await api("/group",{method:"POST"});await jeuJoin(code,nick)}catch(e){toast("Création impossible : "+jeuErr(e))}}
async function jeuLeave(){const c=jeuCfg();try{await api("/group/"+c.code,{method:"DELETE"})}catch(e){}c.code="";c.last=null;c.held=[];LS.set("coach-jeu",c);jeuSel=null;render()}

const jeuErr=e=>/404/.test(e.message)?"le serveur n'a pas encore la fonction groupes (mise à jour du serveur à faire), ou ce code n'existe pas.":/Failed to fetch|NetworkError|Load failed/i.test(e.message)?"pas de connexion au serveur.":e.message;

/* ---------- Affichage ---------- */
const jeuBar=(p,c="var(--pink)")=>`<div class="bar"><i style="width:${Math.max(0,Math.min(100,p))}%;background:${c}"></i></div>`;
function jeuSheet(name,X,lvl,me){const L=JEU_STATS.map(([k,l,i])=>{const xp=X[k]||0,v=statLv(xp),a=(v-1)**2*400,b=v*v*400;
  return `<div><div class="row small"><span class="sp">${i} ${l}</span><b>Niv. ${v}</b></div>${jeuBar((xp-a)/(b-a)*100)}</div>`}).join("");
 return `<div class="card stack"><div class="row"><span style="font-size:34px">${me?"🧙":"🥷"}</span><span class="sp"><div class="lab">Personnage</div><b style="font-size:20px">${esc(name)}</b></span><div class="lvl"><b>Niv. ${lvl}</b>${me?fr(xpProf().xp)+" XP":""}</div></div>${L}</div>`}
function vJeu(){const c=jeuCfg(),X=jeuXP(),me=jeuSheet(c.nick||PROF.name,X,level(xpProf().xp).l,1),back=`<div class="row" style="margin-top:-8px"><button class="chip" data-tab="me">‹ Profil</button></div>`;
 if(!c.code)return `${back}${me}<div class="card stack"><div class="lab">Jouer entre potes</div><p class="small muted" style="margin:0">Crée un groupe et envoie le code à tes potes, ou rejoins le leur. Chacun voit où en sont les autres et qui est le Roi de chaque machine. Seuls des scores sont partagés, ton poids reste privé.</p>
  <label class="stack" style="gap:4px"><b class="small">Ton pseudo</b><input class="txt" id="jeu-nick" maxlength="24" value="${esc(c.nick||PROF.name)}" style="font-size:15px;padding:10px"></label>
  <button class="btn" id="jeu-new">Créer un groupe</button><div class="row"><input class="txt" id="jeu-code" maxlength="6" placeholder="CODE" autocapitalize="characters" style="flex:1;font-size:15px;padding:10px;text-transform:uppercase"><button class="btn ghost sm" id="jeu-join">Rejoindre</button></div></div>`;
 const L=c.last||{members:[]},K=jeuKings(L),mine=Object.entries(K).filter(([,k])=>k.id===L.me),M=[...L.members].sort((a,b)=>(b.lvl||0)-(a.lvl||0));
 const sel=jeuSel&&M.find(m=>m.id===jeuSel);
 const who=M.map(m=>`<li><button class="meal" data-jsel="${m.id}" style="width:100%"><span class="sp"><b>${esc(m.nick)}${m.id===L.me?" (toi)":""}</b> <small class="muted">Niv. ${m.lvl||1}${m.kg?` · ${fr(m.kg,1)} kg`:""}</small>
  ${m.goal!=null?`<small>Objectif ${m.goal} %</small>${jeuBar(m.goal,"var(--good)")}`:""}<small>${m.streak!=null?`🔥 ${m.streak} sem.`:""}${m.wPlan?` · ${m.wDone}/${m.wPlan} séances cette semaine`:""}</small></span></button></li>`).join("");
 const all=Object.entries(K).sort((a,b)=>a[1].n.localeCompare(b[1].n)).map(([,k])=>`<li><span class="sp small">${k.id===L.me?"👑 ":""}${esc(k.n)}</span><small class="muted">${esc(k.nick)} · ×${fr(k.r,2)}</small></li>`).join("");
 return `${back}${sel?jeuSheet(sel.nick,sel.stats||{},sel.lvl||1,sel.id===L.me).replace('<div class="card stack">','<div class="card stack" id="jeu-fiche"><button class="chip" data-jsel="">✕ Fermer</button>'):""}
 <div class="card stack" id="sec-group"><div class="row"><span class="sp"><div class="lab">Où il en est</div><b>Groupe ${esc(c.code)}</b></span><button class="chip" id="jeu-ref">↻</button></div><ul class="list">${who||'<li class="small muted">Personne pour l\'instant.</li>'}</ul></div>
 <div class="card stack" id="sec-roi"><div class="lab">Roi de la machine</div><p class="small" style="margin:0"><b>👑 ${mine.length} machine${mine.length>1?"s":""} tenue${mine.length>1?"s":""}</b>${mine.length?" : "+mine.map(([,k])=>esc(k.n)).join(", "):""}</p><p class="small muted" style="margin:0">Record = 1RM estimé ÷ poids de corps (×1,00 = ton propre poids). Tu es prévenu quand on te prend une machine.</p>${all?`<ul class="list">${all}</ul>`:""}</div>
 ${me}<div class="card stack"><div class="lab">Ce que je partage</div><div class="row" style="flex-wrap:wrap">${JEU_SHARE.map(([k,l])=>`<button class="chip" data-jsh="${k}" aria-pressed="${!!c.share[k]}">${c.share[k]?"✓ ":""}${l}</button>`).join("")}</div>
 <p class="small muted" style="margin:0">Code d'invitation : <b>${esc(c.code)}</b>. Pseudo : <b>${esc(c.nick)}</b>.</p><div class="row"><button class="btn ghost sm" id="jeu-inv" style="flex:1">Inviter</button><button class="btn ghost sm" id="jeu-quit" style="flex:1">Quitter le groupe</button></div></div>`}

/* Le coach signale la stat en retard (au moins un niveau d'écart). */
function jeuCoach(){if(!PROF)return"";const X=jeuXP();if(jeuTotal(X)<200)return"";const L=JEU_STATS.map(([k,l])=>[k,l,statLv(X[k])]).sort((a,b)=>a[2]-b[2]),lo=L[0],hi=L[L.length-1];
 return hi[2]-lo[2]>=1?`<p class="small" style="margin:0" id="jeu-coach">🎮 Stat en retard : <b>${lo[1]}</b> (niv. ${lo[2]} contre ${hi[2]} en ${hi[1]}). Pour la remonter, ${JEU_TIP[lo[0]]}.</p>`:""}

document.addEventListener("click",e=>{const t=e.target.closest("button");if(!t||!PROF)return;const D=t.dataset;
 if(D.tab==="jeu"&&jeuCfg().code)setTimeout(()=>jeuSync().catch(()=>{}),0);
 if(D.jsel!==undefined){jeuSel=D.jsel||null;render();if(jeuSel)window.scrollTo(0,0);return}
 if(D.jsh){const c=jeuCfg();c.share[D.jsh]=c.share[D.jsh]?0:1;LS.set("coach-jeu",c);render();jeuSync().catch(()=>{});return}
 const nick=()=>($("#jeu-nick").value.trim()||PROF.name).slice(0,24);
 if(t.id==="jeu-new"){jeuCreate(nick());return}
 if(t.id==="jeu-join"){const k=$("#jeu-code").value.trim().toUpperCase();if(!/^[A-Z0-9]{6}$/.test(k))return toast("Le code fait 6 caractères.");jeuJoin(k,nick());return}
 if(t.id==="jeu-ref"){jeuSync().then(()=>toast("Groupe à jour."),err=>toast("Échec : "+err.message));return}
 if(t.id==="jeu-quit"){if(confirm("Quitter le groupe ?"))jeuLeave();return}
 if(t.id==="jeu-inv"){const c=jeuCfg(),txt=`Rejoins mon groupe sur Ektyron Coach : code ${c.code} (Profil → Entre potes). https://brutalgzx.github.io/carnet-ektyron/`;
  if(navigator.share)navigator.share({text:txt}).catch(()=>{});else navigator.clipboard.writeText(txt).then(()=>toast("Invitation copiée."),()=>toast(txt));return}});

/* Lancé à la fin d'app.js : séance, pesée ou repas coché → instantané envoyé au groupe (regroupé). */
function jeuInit(){const set=LS.set;LS.set=(k,v)=>{set(k,v);if(["carnet","carnet-xp","coach-weights","coach-eaten"].includes(k))jeuSoon()};
 if(jeuCfg().code)setTimeout(()=>jeuSync().catch(()=>{}),2000);
 document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"&&jeuCfg().code)jeuSync().catch(()=>{})})}

/* Carte d'accueil : le personnage et le groupe en premier plan. */
function jeuHome(){if(!PROF)return"";const acc=acUser()?"":`<button class="hintbox" data-tab="me" id="ac-nudge" style="width:100%;text-align:left;cursor:pointer;border-color:var(--warn)"><span style="font-size:24px">🔐</span><span class="small"><b>Crée ton identifiant</b><br><span class="muted">Tes données seront sauvegardées et restaurées toutes seules.</span></span></button>`;const c=jeuCfg(),X=jeuXP(),L=c.last,K=jeuKings(L),mine=L?Object.values(K).filter(k=>k.id===L.me).length:0;
 const st=JEU_STATS.map(([k,l,i])=>`<span class="small" style="white-space:nowrap;flex:1 0 30%">${i} ${l} <b>niv. ${statLv(X[k])}</b></span>`).join("");
 const grp=c.code&&L?[...L.members].sort((a,b)=>(b.goal||0)-(a.goal||0)).slice(0,3).map(m=>`<div><div class="row small"><span class="sp">${esc(m.nick)}${m.id===L.me?" (toi)":""}${m.streak?` · 🔥 ${m.streak}`:""}</span><b>${m.goal!=null?m.goal+" %":""}</b></div>${m.goal!=null?jeuBar(m.goal,"var(--good)"):""}</div>`).join(""):"";
 return `${acc}<button class="card stack" data-tab="jeu" id="jeu-home" style="text-align:left;width:100%;cursor:pointer"><div class="row"><span style="font-size:30px">🧙</span><span class="sp"><div class="lab">Mon personnage et mes potes</div><b>${esc(c.nick||PROF.name)} · Niv. ${level(xpProf().xp).l}</b></span><span style="font-size:22px">›</span></div>
 <div class="row" style="flex-wrap:wrap;gap:6px 10px">${st}</div>
 ${c.code?`<div class="small"><b>Groupe ${esc(c.code)}</b> · 👑 ${mine} machine${mine>1?"s":""}</div>${grp}`:`<div class="small muted">🎮 Crée ton groupe ou rejoins celui de tes potes : qui tient sa série, qui est le Roi de chaque machine.</div>`}</button>`}
