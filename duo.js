/* Mode duo : deux amis, chacun son programme et ses charges, qui alternent série par série.
   Rencontre : le « check » (on se tape les téléphones) ou un code de 4 lettres en secours.
   Chacun garde SA séance (TRAIN, carnet, profil) : on n'écrit jamais dans le profil de l'autre.
   Le serveur ne sert qu'à se dire « à qui le tour » ; sans réseau, chacun continue seul. */
const DK="coach-duo";let DUO=LS.get(DK,null),duoS=null,duoT=null,duoFail=0,duoMot=null,duoPane="card",duoBusy=false;
const duoDev=()=>{let d=LS.get("coach-duo-id","");if(!d){d=Math.random().toString(36).slice(2)+Date.now().toString(36);LS.set("coach-duo-id",d)}return d};
const duoUrl=()=>syncCfg().url.replace(/\/+$/,"");
async function duoApi(path,body){const r=await fetch(duoUrl()+path,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({dev:duoDev(),...(DUO?{code:DUO.code}:{}),...body})});
 const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||"le serveur répond "+r.status);return j}

/* Jour de séance proposé : aujourd'hui s'il y en a une, sinon la prochaine de la semaine. */
function duoDays(){return Object.keys(TRAIN||{}).map(Number).filter(d=>TRAIN[d])}
function duoDefDay(){const t=new Date().getDay(),D=duoDays();for(let i=0;i<7;i++){const d=(t+i)%7;if(D.includes(d))return d}return D[0]}
/* Ce que l'autre voit : la fiche du jeu (respecte tes réglages de partage) + ta séance choisie avec tes charges. */
function duoCard(day){const S=TRAIN[day],o={...jeuSnap(),day,t:S?S.t:"",x:S?S.x.map(e=>{const l=lastLog(e.id),s=l&&l.sets[0];return{id:e.id,n:e.n,g:e.g,s:e.s,r:e.r,k:s?s.k:(e.kg??null)}}):[]};return o}

function duoOpen(){let el=$("#duo");if(!el){el=document.createElement("div");el.id="duo";document.body.appendChild(el)}el.hidden=false;document.body.classList.add("duo-on");duoPane="card";duoDraw()}
function duoHideSheet(){const el=$("#duo");if(el)el.hidden=true;document.body.classList.remove("duo-on");duoMotOff()}
function duoSave(){DUO?LS.set(DK,DUO):LS.del(DK)}
function duoReset(){clearTimeout(duoT);DUO=null;duoS=null;duoSave();duoMotOff()}

/* ---------- le check ---------- */
async function duoMotOn(){if(duoMot)return;try{if(window.DeviceMotionEvent&&DeviceMotionEvent.requestPermission&&await DeviceMotionEvent.requestPermission()!=="granted"){toast("Autorise « Mouvement » pour le check, ou utilise le code.");return}}catch(e){}
 let last=0;duoMot=e=>{const a=e.acceleration&&e.acceleration.x!=null?e.acceleration:null,g=e.accelerationIncludingGravity;
  const m=a?Math.hypot(a.x,a.y,a.z):g?Math.abs(Math.hypot(g.x,g.y,g.z)-9.81):0,now=performance.now();
  if(m>16&&now-last>2000&&!duoBusy){last=now;duoBump(now)}};
 window.addEventListener("devicemotion",duoMot);duoDraw()}
function duoMotOff(){if(duoMot)window.removeEventListener("devicemotion",duoMot);duoMot=null}
async function duoBump(at){duoBusy=true;try{navigator.vibrate&&navigator.vibrate(60)}catch(e){}duoMsg("Check ! On cherche ton pote…");
 try{const j=await duoApi("/duo/bump",{ago:Math.round(performance.now()-at),card:duoCard(duoDefDay())});
  if(j.none){duoMsg("Personne en face. Tapez-vous les téléphones en même temps, appli ouverte des deux côtés.")}
  else{beep(988,.12);beep(1319,.2,.14);try{navigator.vibrate&&navigator.vibrate([80,60,160])}catch(e){}duoJoined(j,1)}}
 catch(e){duoMsg("Pas de réseau ? Utilise le code. ("+e.message+")")}duoBusy=false}

function duoJoined(st,bump){DUO={code:st.code,day:duoDefDay(),bump:!!bump};duoS=st;duoSave();duoMotOff();duoPane="card";duoDraw();duoPoll()}
function duoMsg(t){const m=$("#duo-msg");if(m)m.textContent=t}
const duoMe=()=>duoS&&duoS.m[duoS.me], duoHim=()=>{if(!duoS)return null;const k=Object.keys(duoS.m).find(k=>k!==duoS.me);return k?{id:k,...duoS.m[k]}:null};

/* ---------- synchro : on demande l'état toutes les 2 s (et tout de suite après chaque action) ---------- */
async function duoPoll(){clearTimeout(duoT);if(!DUO)return;
 try{const r=await fetch(`${duoUrl()}/duo/state?code=${DUO.code}&dev=${duoDev()}`);if(r.status===404||r.status===403){duoLost();return}const st=await r.json();if(!r.ok)throw 0;duoFail=0;duoUpdate(st)}
 catch(e){duoFail++;duoRefresh()}
 duoT=setTimeout(duoPoll,document.visibilityState==="visible"?2000:8000)}
async function duoAct(op,x){try{const st=await duoApi("/duo/act",{op,...x});if(st.code){duoFail=0;duoUpdate(st)}}catch(e){duoFail++;duoRefresh()}}
function duoLost(){const inGame=G&&G.duo;duoReset();if(G&&G.duo){delete G.duo;gSave()}if(inGame)toast("Séance duo terminée de l'autre côté : tu continues seul.");duoRefresh()}
function duoUpdate(st){const was=duoS,turnWas=was&&was.turn;duoS=st;
 if(st.ph==="play"&&!(G&&G.duo===st.code)&&!(DUO&&DUO.ended))duoLaunch();
 if(G&&G.duo&&turnWas&&turnWas!==st.turn&&st.turn===st.me&&G.ph==="rest"){beep(1047,.15);try{navigator.vibrate&&navigator.vibrate(120)}catch(e){}}
 duoRefresh()}
function duoRefresh(){if($("#duo")&&!$("#duo").hidden)duoDraw();if(G&&G.duo&&!$("#game").hidden)duoDecor()}

/* ---------- lancement : chacun démarre SA séance, réordonnée pour être dans la même zone que l'autre ---------- */
function duoOrder(mine,his,host){if(host||!his||!his.length)return null;const left=[...mine.keys()],ord=[];
 for(const h of his){const i=left.findIndex(k=>mine[k].g===h.g);if(i>=0)ord.push(left.splice(i,1)[0])}
 const o=[...ord,...left];return o.every((v,i)=>v===i)?null:o}
function duoLaunch(){if(!DUO||!TRAIN[DUO.day])return;const H=duoHim();if(G&&G.ph!=="done")gDrop();
 gStart(DUO.day);G.duo=DUO.code;const o=duoOrder(TRAIN[DUO.day].x,H&&H.card.x,duoS.host===duoS.me);if(o){G.ord=o;G.si=0}gSave();duoHideSheet();gShow();
 toast(H?`Séance duo avec ${H.card.nick} : c'est parti !`:"Séance duo lancée")}

/* Pendant la séance : bandeau « à qui le tour » + on prévient l'autre de ce qu'on va faire. */
let duoCurK="";
function duoDecor(){const box=$("#g-in");if(!box||!G||!G.duo)return;let b=$("#duo-bar");if(!b){b=document.createElement("div");b.id="duo-bar";box.prepend(b)}
 const H=duoHim(),off=duoFail>=3;
 if(G.ph==="set"){const ex=gEx(),k=$("#g-k"),cur={n:ex.n,si:G.si+1,s:ex.s,k:k?gNum(k.value):null,r:ex.r},key=JSON.stringify(cur);if(key!==duoCurK){duoCurK=key;duoAct("cur",{cur})}}
 if(!duoS||!H){b.className="duo-bar";b.innerHTML=off?"📡 Pas de réseau : tu continues seul, ça se recale tout seul.":"👯 En attente de ton pote…";return}
 const nick=esc(H.card.nick||"Ton pote"),c=H.cur,l=H.last,mine=duoS.turn===duoS.me;
 let t=H.done?`✅ ${nick} a fini sa séance. Continue à ton rythme.`:H.away||off?`📡 ${nick} ne répond plus. Tu continues seul.`:mine?`🔥 À toi ! ${nick} récupère${l?` (dernière série : ${kgS(l.k)} × ${l.r})`:""}.`:`⏳ ${nick} : ${c?`${esc(c.n)} · série ${c.si}/${c.s}${c.k!=null&&!isNaN(c.k)?` · ${kgS(c.k)}`:""}`:"à sa série"}`;
 b.className="duo-bar"+(mine?" me":"");b.innerHTML=t+(H.away||off?` <button class="link" data-duo="solo">Finir seul</button>`:"")}
/* Le repos dure tant que l'autre fait sa série (sauf s'il a fini, ne répond plus, ou pas de réseau). */
function duoHold(){if(!G||!G.duo||!duoS||duoFail>=3)return false;const H=duoHim();return!!H&&!H.done&&!H.away&&duoS.turn!==duoS.me}

const _gShow=gShow;gShow=function(){_gShow();duoDecor()};
const _gTick=gTick;gTick=function(){if(G&&G.ph==="rest"&&G.restEnd<=Date.now()&&duoHold()){const t=$("#g-t"),a=$("#g-arc");if(t)t.textContent="⏳";if(a)a.setAttribute("stroke-dashoffset","326.7");return}_gTick()};
const _gNext=gNext;gNext=function(rest){if(G&&G.duo&&rest){const ex=gEx(),s=(G.sets[ex.id]||[])[G.si-1];if(s)duoAct("set",{set:{n:ex.n,k:s.k,r:s.r}})}_gNext(rest);if(G&&G.duo&&G.ph==="done")duoEnd()};
const _gClose=gClose;gClose=function(){if(G&&G.duo)duoEnd();_gClose()};
function duoEnd(){if(!DUO)return;duoAct("end");DUO.ended=1;duoSave();setTimeout(()=>{if(DUO&&DUO.ended&&!(G&&G.duo&&G.ph!=="done"))duoAct("leave").finally(duoReset)},4000)}

/* ---------- la feuille duo ---------- */
function duoDraw(){const el=$("#duo");if(!el)return;const H=duoHim(),top=`<div class="row"><button class="chip" data-duo="close">✕ Fermer</button><span class="sp"></span>${DUO?`<span class="small muted">Salle ${DUO.code}</span>`:""}</div>`;
 if(!DUO){el.innerHTML=`<div class="duo-in stack">${top}<h2>Séance duo</h2>
  <div class="card stack duo-check ${duoMot?"on":""}"><div class="duo-ph"><span>📱</span><span>📱</span></div>
   <b>Faites un check avec vos téléphones</b><div class="small muted">Appli ouverte des deux côtés, sur cet écran. Tapez-vous les téléphones l'un contre l'autre, d'un coup sec.</div>
   ${duoMot?`<div class="small"><b>Prêt.</b> On attend le choc…</div>`:`<button class="btn" data-duo="mot">Activer le check</button>`}<div class="small muted" id="duo-msg"></div></div>
  <div class="card stack"><b>Ou avec un code</b><button class="btn ghost" data-duo="new">Créer une salle</button>
   <div class="row"><input id="duo-code" maxlength="4" placeholder="CODE" autocapitalize="characters" style="text-transform:uppercase;letter-spacing:.3em;font-size:20px;flex:1"><button class="btn" data-duo="join" style="width:auto">Rejoindre</button></div></div></div>`;return}
 if(!H){el.innerHTML=`<div class="duo-in stack">${top}<h2>Ta salle est prête</h2><div class="card stack" style="text-align:center"><div class="small muted">Ton pote ouvre Séance duo et tape ce code :</div><div class="duo-code">${DUO.code}</div><div class="small muted">${duoFail>=3?"📡 Pas de réseau pour l'instant…":"En attente…"}</div></div><button class="link" data-duo="leave">Annuler</button></div>`;return}
 const C=H.card,me=duoCard(DUO.day),pane=duoPane;
 const face=(c,who)=>`<div class="duo-face"><span class="duo-av">${esc((c.nick||"?")[0].toUpperCase())}</span><b>${esc(c.nick||who)}</b><small>Niv. ${c.lvl||1}${c.streak?` · 🔥 ${c.streak} sem.`:""}</small><small class="muted">${esc(c.t||"Pas de séance")}</small></div>`;
 let body="";
 if(pane==="prof")body=C.stats?jeuSheet(C.nick,C.stats,C.lvl,0):`<div class="card small muted">${esc(C.nick)} ne partage pas ses statistiques.</div>`;
 if(pane==="det")body=`<div class="card stack"><div class="lab">${esc(C.nick)} · ${esc(C.t||"")}</div>${C.wPlan?`<div class="small muted">${C.wDone||0}/${C.wPlan} séances cette semaine</div>`:""}<ul class="list">${(C.x||[]).map(e=>`<li><span class="sp">${esc(e.n)}</span><b>${e.s} × ${e.r[0]}–${e.r[1]}${e.k!=null?` · ${kgS(e.k)}`:""}</b></li>`).join("")}</ul></div>`;
 const days=duoDays();
 el.innerHTML=`<div class="duo-in stack">${top}<div class="duo-pair">${face(me,"Toi")}<span class="duo-x">🤝</span>${face(C,"Ton pote")}</div>
  ${H.away?`<div class="hintbox small">📡 ${esc(C.nick)} ne répond plus pour l'instant.</div>`:""}
  <div class="duo-tabs"><button class="chip" data-duo="prof" aria-pressed="${pane==="prof"}">Voir le profil</button><button class="chip" data-duo="det" aria-pressed="${pane==="det"}">Voir les détails</button></div>${body}
  <div class="card stack"><div class="lab">Ta séance</div><div class="row" style="flex-wrap:wrap;gap:6px">${days.map(d=>`<button class="chip" data-duo="day" data-d="${d}" aria-pressed="${d===DUO.day}">${esc(TRAIN[d].t)}</button>`).join("")}</div>
   <div class="small muted">Vous alternez : pendant que l'un fait sa série, l'autre récupère. L'app range vos exercices pour rester dans la même zone de la salle.</div></div>
  <button class="btn" data-duo="go">▶ Lancer la séance duo</button><button class="link" data-duo="leave">Quitter la salle</button></div>`}

document.addEventListener("click",async e=>{const t=e.target.closest("[data-duo]");if(!t)return;const a=t.dataset.duo;auUnlock();
 if(a==="open"){duoOpen();if(DUO)duoPoll();return}
 if(a==="close"){duoHideSheet();return}
 if(a==="mot"){duoMotOn();return}
 if(a==="new"){try{duoJoined(await duoApi("/duo/new",{card:duoCard(duoDefDay())}))}catch(er){duoMsg("Impossible : "+er.message)}return}
 if(a==="join"){const c=($("#duo-code").value||"").trim().toUpperCase();if(c.length!==4){duoMsg("Le code fait 4 lettres.");return}
  try{const st=await duoApi("/duo/join",{code:c,card:duoCard(duoDefDay())});DUO={code:c,day:duoDefDay()};duoJoined(st)}catch(er){duoMsg(er.message)}return}
 if(a==="prof"||a==="det"){duoPane=duoPane===a?"card":a;duoDraw();return}
 if(a==="day"){DUO.day=+t.dataset.d;duoSave();duoAct("card",{card:duoCard(DUO.day)});duoDraw();return}
 if(a==="go"){if(!TRAIN[DUO.day])return;DUO.ended=0;duoSave();await duoAct("card",{card:duoCard(DUO.day)});duoAct("start");if(!(G&&G.duo))duoLaunch();return}
 if(a==="leave"){duoApi("/duo/act",{op:"leave"}).catch(()=>{});duoReset();duoDraw();return}
 if(a==="solo"){const code=DUO&&DUO.code;duoApi("/duo/act",{op:"leave"}).catch(()=>{});duoReset();if(G&&G.duo===code){delete G.duo;gSave()}const b=$("#duo-bar");if(b)b.remove();gTick();toast("Tu continues seul.");return}});

/* Bouton d'accueil (appelé par vToday) */
function duoBtn(){return `<button class="card row" data-duo="open" style="width:100%;text-align:left;cursor:pointer"><span style="font-size:26px">👯</span><span class="sp"><b>Séance duo</b><br><small class="muted">${DUO?`Salle ${DUO.code} en cours`:"Check avec ton pote et alternez vos séries"}</small></span><span class="muted">›</span></button>`}

(function(){const st=document.createElement("style");st.textContent=`
#duo{position:fixed;inset:0;z-index:60;overflow:auto;background:var(--bg,#0b0d10);padding:calc(14px + env(safe-area-inset-top)) 16px 24px}
.duo-in{max-width:520px;margin:0 auto}
.duo-check{text-align:center;align-items:center}.duo-ph{font-size:40px;display:flex;gap:6px;justify-content:center}
.duo-check.on .duo-ph span:first-child{animation:duoL 1.4s ease-in-out infinite}.duo-check.on .duo-ph span:last-child{animation:duoR 1.4s ease-in-out infinite}
@keyframes duoL{50%{transform:translateX(10px) rotate(8deg)}}@keyframes duoR{50%{transform:translateX(-10px) rotate(-8deg)}}
.duo-code{font-size:46px;font-weight:800;letter-spacing:.3em;margin:6px 0}
.duo-pair{display:flex;align-items:center;gap:8px}.duo-face{flex:1;display:flex;flex-direction:column;align-items:center;text-align:center;gap:2px;padding:14px 8px;border-radius:18px;background:var(--card,rgba(255,255,255,.06))}
.duo-av{width:54px;height:54px;border-radius:50%;display:grid;place-items:center;font-size:24px;font-weight:800;background:var(--acc,#3d7cff);color:#fff;margin-bottom:4px}
.duo-x{font-size:26px}.duo-tabs{display:flex;gap:8px}.duo-tabs .chip{flex:1}
.duo-bar{margin:0 0 10px;padding:10px 12px;border-radius:14px;background:var(--card,rgba(255,255,255,.07));font-size:15px}.duo-bar.me{outline:2px solid var(--acc,#3d7cff)}`;document.head.appendChild(st)})();

if(G&&G.duo&&DUO&&DUO.code===G.duo)duoPoll();else if(G&&G.duo&&!DUO){delete G.duo;gSave()}
if(PROF&&typeof view!=="undefined"&&view==="today")render();
