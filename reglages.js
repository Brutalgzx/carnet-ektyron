/* ================= Paramètres : sauvegarde (fichiers, synchro en ligne), notifications push, affinage du profil =================
   Chargé avant app.js : uniquement des fonctions et des écouteurs. */
/* Toutes les clés à sauvegarder : une seule liste pour l'export, l'import, la synchro et l'effacement. */
const BK_KEYS=["coach-profile","carnet","carnet-xp","coach-weights","coach-kadj","coach-kadj-t","coach-week","coach-msg","coach-eaten","coach-shop","carnet-rest","coach-meas","coach-check","coach-notif","coach-set","coach-deload"];
const GUIDE="https://github.com/brutalgzx/carnet-ektyron/blob/main/worker/README.md";
const lk=(t=Date.now())=>{const d=new Date(t);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`};
const dfr=t=>new Date(t).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"});
const hsh=s=>{let h=0;for(let i=0;i<s.length;i++)h=Math.imul(31,h)+s.charCodeAt(i)|0;return h};

/* ---------- Export / import ---------- */
function bkData(){const o={};for(const k of BK_KEYS){const v=LS.get(k,null);if(v!=null)o[k]=v}return o}
const bkJSON=()=>JSON.stringify({app:"ektyron-coach",v:17,date:new Date().toISOString(),data:bkData()});
function bkMD(){const p=PROF||{},W=LS.get("coach-weights",[]),M=LS.get("coach-meas",[]),C=LS.get("coach-check",[]),X=xpProf(),row=a=>`| ${a.join(" | ")} |\n`,d=t=>new Date(t).toLocaleDateString("fr-FR");
 let s=`---\ntags: [ektyron, muscu]\ndate: ${lk()}\n---\n# Ektyron Coach : sauvegarde du ${dfr(Date.now())}\n\n`;
 if(p.name)s+=`## Profil\n- Prénom : ${p.name}\n- Objectif : ${(GOALS.find(g=>g.v===p.goal)||{}).l||"?"}${p.tw!=null?` · ${p.tw} kg en ${p.months} mois`:""}\n- Taille : ${p.h} cm · Âge : ${p.age} ans\n- Séances : ${(p.days||[]).map(x=>DN[x]).join(", ")} · ${p.dur} min\n\n`;
 if(W.length)s+=`## Poids\n`+row(["Date","Poids (kg)"])+row(["---","---"])+W.map(w=>row([d(w.t),fr(w.kg,1)])).join("")+"\n";
 if(M.length){const ks=MEAS.filter(([k])=>M.some(m=>m[k]!=null));s+=`## Mensurations (cm)\n`+row(["Date",...ks.map(x=>x[1].replace("Tour de ","")),"Gras %"])+row(["---",...ks.map(()=>"---"),"---"])+M.map(m=>row([d(m.t),...ks.map(([k])=>m[k]!=null?fr(m[k],1):""),m.bf!=null?fr(m.bf,1):""])).join("")+"\n"}
 const R=Object.keys(store).filter(id=>EX[id]&&store[id].length).map(id=>{let top=null,be=0;for(const h of store[id])for(const x of h.sets){if(!top||x.k>top.k||(x.k===top.k&&x.r>top.r))top=x;be=Math.max(be,e1rm(x))}return[EX[id][0],`${top.k} kg × ${top.r}`,fr(be,1),store[id].length]});
 if(R.length)s+=`## Records\n`+row(["Exercice","Meilleure série","1RM estimé (kg)","Séances"])+row(["---","---","---","---"])+R.map(row).join("")+"\n";
 if(X.games.length)s+=`## Séances (${X.games.length})\n`+row(["Date","Séance","Séries","Volume (kg)"])+row(["---","---","---","---"])+X.games.slice(-60).reverse().map(g=>row([d(g.t),TRAIN&&TRAIN[g.day]?TRAIN[g.day].t:DLONG[g.day]||"",g.sets||"",fr(g.vol||0)])).join("")+"\n";
 if(C.length)s+=`## Bilans\n`+row(["Date","Sommeil","Énergie","Faim","Courbatures","Motivation"])+row(["---","---","---","---","---","---"])+C.slice(-20).map(c=>row([d(c.t),c.sommeil,c.energie,c.faim,c.courb,c.moral])).join("")+"\n";
 s+=`\n> Pour restaurer : Ektyron → Paramètres → Importer, puis choisis le fichier .json du même jour.\n`;return s}
const bkMark=k=>{const B=LS.get("coach-bk",{});B[k]=Date.now();LS.set("coach-bk",B)};
const bkLast=()=>{const B=LS.get("coach-bk",{});return Math.max(B.file||0,B.code||0,syncCfg().last||0)};
function bkDue(){const f=SET().bk;if(!f)return false;const last=bkLast();if(!last)return xpProf().games.length>0||LS.get("coach-weights",[]).length>1;return Date.now()-last>=f*DAY}
async function bkExport(){const d=lk(),files=[new File([bkJSON()],`ektyron-${d}.json`,{type:"application/json"}),new File([bkMD()],`Ektyron ${d}.md`,{type:"text/plain"})];
 try{if(navigator.canShare&&navigator.canShare({files})){await navigator.share({files,title:"Sauvegarde Ektyron"});bkMark("file");render();toast("Sauvegarde exportée.");return}}catch(e){if(e.name==="AbortError")return}
 for(const f of files){const a=document.createElement("a");a.href=URL.createObjectURL(f);a.download=f.name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},2000)}
 bkMark("file");render();toast("Fichiers téléchargés.")}
/* Accepte le fichier .json exporté, l'ancien code de sauvegarde et le tout premier format (historique seul). */
function bkApply(o){if(o&&o.app==="ektyron-coach"&&o.data)o=o.data;if(!o||typeof o!=="object"||Array.isArray(o))throw new Error("format");
 if(o["coach-profile"]||o.carnet){for(const k in o)if(o[k]!=null&&BK_KEYS.includes(k))LS.set(k,o[k])}else{const c=LS.get("carnet",{});for(const id in o)if(Array.isArray(o[id]))c[id]=[...(c[id]||[]),...o[id]];LS.set("carnet",c)}
 PROF=migrate(LS.get("coach-profile",PROF));if(PROF)LS.set("coach-profile",PROF);store=LS.get("carnet",{});TRAIN=null;if(PROF&&view==="ob"){view="today";LS.del("coach-draft");FLOW=STEPS}render();toast("Données restaurées.")}
function bkFile(f){const r=new FileReader();r.onload=()=>{try{bkApply(JSON.parse(r.result))}catch(e){toast("Fichier illisible : rien n'a été modifié.")}};r.readAsText(f)}

/* ---------- Synchro en ligne (Cloudflare Worker + KV, code personnel) ---------- */
const SYNC_URL="https://ektyron-coach.ektyron.workers.dev";
const syncCfg=()=>{const c={url:"",code:"",auto:true,last:0,h:0,push:false,ps:"",...LS.get("coach-sync",{})};if(!c.url)c.url=SYNC_URL;return c};
const syncOk=()=>{const S=syncCfg();return !!(S.url&&S.code)};
async function api(path,opt={}){const S=syncCfg();if(!S.url||!S.code)throw new Error("serveur non configuré");
 const r=await fetch(S.url.replace(/\/+$/,"")+path,{...opt,headers:{"Content-Type":"application/json","X-Code":S.code}});
 if(r.status===404&&path==="/backup")return null;if(!r.ok)throw new Error(`le serveur répond ${r.status}`);return r.json()}
let syncT,syncBusy=false;
async function syncUp(force){const S=syncCfg();if(!S.url||!S.code||syncBusy)return;const h=hsh(JSON.stringify(bkData()));if(!force&&h===S.h)return;syncBusy=true;
 try{await api("/backup",{method:"PUT",body:bkJSON()});const N=syncCfg();N.last=Date.now();N.h=h;LS.set("coach-sync",N)}finally{syncBusy=false}}
async function syncDown(){const o=await api("/backup");if(!o)throw new Error("aucune sauvegarde en ligne pour ce code");bkApply(o)}
function syncSoon(){const S=syncCfg();if(!S.url||!S.code||!S.auto)return;clearTimeout(syncT);syncT=setTimeout(()=>syncUp().catch(()=>{}),4000)}
function newCode(){const a="abcdefghjkmnpqrstuvwxyz23456789",b=crypto.getRandomValues(new Uint8Array(16));return [...b].map(x=>a[x%a.length]).join("").match(/.{4}/g).join("-")}

/* ---------- Notifications push ---------- */
const ub64=s=>Uint8Array.from(atob(s.replace(/-/g,"+").replace(/_/g,"/")+"===".slice((s.length+3)%4)),c=>c.charCodeAt(0));
/* Programme des rappels envoyé au serveur : jours fixes (séances, pesée) ou « à partir du » (mensurations, bilan, sauvegarde), une fois par jour jusqu'à ce que ce soit fait. */
function pushSched(){const N=notifCfg(),T=N.types,items=[],done={},lm=lastT("coach-meas"),lc=lastT("coach-check"),from=t=>t?lk(Math.max(t,Date.now())):lk();
 if(T.seance&&TRAIN)for(const d of WEEK)if(TRAIN[d])items.push({id:"seance"+d,k:"seance",days:[d],h:N.shour,t:"C'est l'heure de ta séance 💪",b:`${TRAIN[d].t} : ${TRAIN[d].x.length} exercices, environ ${sessMin(TRAIN[d])} min.`,go:"today"});
 if(T.pesee)items.push({id:"pesee",k:"pesee",days:[N.wday],h:N.hour,t:"C'est le jour de ta pesée ⚖️",b:"Le matin à jeun, toujours sur la même balance.",go:"prog"});
 if(T.mesures)items.push({id:"mesures",k:"mesures",from:lm?from(lm+N.mf*DAY):lk(),h:N.hour,t:"Prends tes mesures pour le bilan 📏",b:"Taille, bras, cuisse : 2 minutes avec un mètre ruban.",go:"prog"});
 if(T.bilan)items.push(N.cf===7?{id:"bilan",k:"bilan",days:[N.wday],h:N.hour,t:"Ton bilan de la semaine 📝",b:"Sommeil, énergie, faim : 20 secondes pour que ton coach t'ajuste.",go:"prog"}:{id:"bilan",k:"bilan",from:from(lc+N.cf*DAY),h:N.hour,t:"Ton bilan 📝",b:"Sommeil, énergie, faim : 20 secondes pour que ton coach t'ajuste.",go:"prog"});
 const f=SET().bk;if(T.save&&f&&!(syncCfg().auto&&syncOk()))items.push({id:"save",k:"save",from:from((bkLast()||Date.now())+f*DAY),h:N.hour,t:"Sauvegarde tes données 💾",b:"Exporte-les vers Fichiers ou Obsidian : 10 secondes, et rien n'est perdu.",go:"set"});
 if(xpProf().games.some(g=>sameDay(g.t)))done.seance=lk();if(sameDay(lastT("coach-weights")))done.pesee=lk();if(sameDay(lm))done.mesures=lk();if(sameDay(lc))done.bilan=lk();if(sameDay(bkLast()))done.save=lk();
 return{tz:Intl.DateTimeFormat().resolvedOptions().timeZone||"Europe/Paris",items,done}}
async function pushPublish(){const S=syncCfg();if(!S.push||!S.url||!S.code||!PROF)return;const s=JSON.stringify(pushSched());if(s===S.ps)return;
 try{await api("/push",{method:"PUT",body:JSON.stringify({sched:JSON.parse(s)})});const N=syncCfg();N.ps=s;LS.set("coach-sync",N)}catch(e){}}
async function pushOn(){if(!("PushManager"in window)||!canNotif())return toast(IOS&&!STANDALONE?"Sur iPhone : installe d'abord l'appli sur l'écran d'accueil (iOS 16.4 ou plus).":"Ce navigateur ne gère pas le push.");
 if(!syncOk())return toast("Renseigne d'abord l'adresse de ton serveur et ton code (Synchro en ligne).");
 const p=await Notification.requestPermission();if(p!=="granted")return toast("Notifications refusées : autorise-les dans Réglages → Notifications → Ektyron.");
 try{const {key}=await api("/vapid");if(!key)throw new Error("clés VAPID absentes sur le serveur");const r=await navigator.serviceWorker.ready;let sub=await r.pushManager.getSubscription();
  if(!sub)sub=await r.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:ub64(key)});const sched=pushSched();
  await api("/push",{method:"PUT",body:JSON.stringify({sub:sub.toJSON(),sched})});const S=syncCfg();S.push=true;S.ps=JSON.stringify(sched);LS.set("coach-sync",S);toast("Push activé : ton coach te prévient même appli fermée.");render()}
 catch(e){toast("Push impossible : "+e.message)}}
async function pushOff(){try{const r=await navigator.serviceWorker.ready,s=await r.pushManager.getSubscription();if(s)await s.unsubscribe()}catch(e){}
 try{await api("/push",{method:"DELETE"})}catch(e){}const S=syncCfg();S.push=false;S.ps="";LS.set("coach-sync",S);toast("Push coupé.");render()}

/* ---------- Affine ton profil ---------- */
function refineList(){if(!PROF)return[];const r=PROF.refined||{},o=[];
 if(!r.taste)o.push({k:"taste",e:"❤️",t:"Allergies et goûts",s:"Ce que tu adores, ce que tu ne manges jamais, tes allergies."});
 if(!r.food)o.push({k:"food",e:"🛒",t:"Repas et courses",s:"Nombre de repas, magasin, budget et style de plats."});
 if(!r.equip)o.push({k:"equip",e:"🏋️",t:"Le matériel de ta salle",s:"Décoche ce qui manque, coche ce qu'elle a en plus."});
 if(!LS.get("coach-meas",[]).length)o.push({k:"meas",e:"📏",t:"Tes mensurations",s:"Taille, bras, cuisse : ce que la balance ne voit pas."});
 if(!notifCfg().on&&!syncCfg().push)o.push({k:"notif",e:"🔔",t:"Tes rappels",s:"Séance, pesée, bilan : choisis quand ton coach te prévient."});
 return o}
function refineCard(one){const L=refineList();if(!L.length)return"";const it=one?L.slice(0,1):L,btn=x=>x.k==="meas"?`data-go="mesures"`:x.k==="notif"?`data-tab="set"`:`data-ref="${x.k}"`;
 return `<div class="card stack"><div class="row"><div class="lab sp">Affine ton profil</div><span class="small muted">${5-L.length}/5</span></div>${it.map(x=>`<button class="hintbox" ${btn(x)} style="text-align:left;width:100%;color:inherit"><span style="font-size:26px">${x.e}</span><span><b>${x.t}</b><br><small class="muted">${x.s}</small></span></button>`).join("")}${one&&L.length>1?`<small class="muted">Et ${L.length-1} autre${L.length>2?"s":""} dans Profil.</small>`:""}</div>`}

/* ---------- Écran Paramètres ---------- */
function vSet(){const N=notifCfg(),T=N.types,S=syncCfg(),C=SET(),last=bkLast(),pushOK="PushManager"in window;
 const chips=(attr,list,cur,fmt)=>`<div class="row" style="flex-wrap:wrap">${list.map(v=>`<button class="chip" data-${attr}="${v}" aria-pressed="${cur===v}" style="flex:1">${fmt(v)}</button>`).join("")}</div>`;
 const card=(lab,body,id="")=>`<div class="card stack"${id?` id="${id}"`:""}><div class="lab">${lab}</div>${body}</div>`;
 const TY=[["seance","🏋️ Séance"],["pesee","⚖️ Pesée"],["mesures","📏 Mesures"],["bilan","📝 Bilan"],["save","💾 Sauvegarde"]];
 const notif=card("Notifications",`<div class="row"><span class="sp small"><b>Rappels de l'appli</b><br><span class="muted">${N.on?"Activés.":"Coupés."} ${IOS?"Sur iPhone, ils arrivent quand tu ouvres l'appli.":"Sur Android, Chrome peut les envoyer appli fermée."}</span></span><button class="chip" id="nt-tog" aria-pressed="${N.on}">${N.on?"Activés":"Activer"}</button></div>
  <div class="row"><span class="sp small"><b>Vrai push, appli fermée</b><br><span class="muted">${S.push?"Actif : le serveur t'envoie tes rappels à l'heure.":!syncOk()?"Demande ton serveur gratuit (Synchro en ligne, plus bas).":IOS&&!STANDALONE?"Installe d'abord l'appli sur l'écran d'accueil (iOS 16.4+).":"Prêt à activer."}</span></span>${S.push?`<button class="chip" id="ps-test">Tester</button><button class="chip" id="ps-off">Couper</button>`:`<button class="chip" id="ps-on"${!pushOK||!syncOk()?" disabled":""}>Activer</button>`}</div>
  <div class="lab">Me rappeler</div><div class="row" style="flex-wrap:wrap">${TY.map(([k,l])=>`<button class="chip" data-nty="${k}" aria-pressed="${!!T[k]}">${l}</button>`).join("")}</div>
  <div class="lab">Heure de la séance</div>${chips("nsh",[6,7,12,17,18,19,20],N.shour,h=>h+" h")}
  <div class="lab">Heure des autres rappels</div>${chips("nh",[7,8,9,12,18,20],N.hour,h=>h+" h")}
  <div class="lab">Jour de pesée et de bilan</div><div class="week">${WEEK.map(d=>`<button data-nw="${d}" aria-pressed="${N.wday===d}">${DN[d]}</button>`).join("")}</div>
  <div class="lab">Mensurations</div>${chips("nmf",[7,14,28],N.mf,v=>v===7?"Chaque semaine":v===14?"Toutes les 2 sem.":"Chaque mois")}
  <div class="lab">Bilan</div>${chips("ncf",[7,14],N.cf,v=>v===7?"Chaque semaine":"Toutes les 2 sem.")}`,"sec-notif");
 const save=card("Sauvegarde",`<p class="small muted" style="margin:0">Tout est sur ce téléphone. ${last?`Dernière sauvegarde le <b>${dfr(last)}</b>.`:"<b>Aucune sauvegarde pour l'instant.</b>"} L'export crée un fichier .json (pour restaurer) et une fiche .md lisible (poids, mensurations, records, séances) : enregistre-les dans Fichiers, iCloud Drive ou ton coffre Obsidian.</p>
  <div class="row"><button class="btn sm" id="bk-exp" style="flex:1">⬆️ Exporter</button><button class="btn ghost sm" id="bk-imp" style="flex:1">⬇️ Importer</button></div><input type="file" id="bk-file" accept=".json,application/json,text/plain" hidden>
  <div class="lab">Me rappeler de sauvegarder</div>${chips("bkf",[0,7,14,30],C.bk,v=>v?v===7?"Chaque semaine":v===14?"2 semaines":"Chaque mois":"Jamais")}
  <details><summary class="small" style="cursor:pointer">Code de sauvegarde (copier-coller)</summary><textarea id="bk-t" aria-label="Code de sauvegarde" style="width:100%;margin-top:8px"></textarea><div class="row" style="margin-top:8px"><button class="btn ghost sm" id="bk-x" style="flex:1">Copier mes données</button><button class="btn ghost sm" id="bk-i" style="flex:1">Restaurer</button></div><p class="small" id="bk-m"></p></details>`,"sec-save");
 const sync=card("Synchro en ligne",`<p class="small muted" style="margin:0">Une copie automatique sur ton propre serveur gratuit (Cloudflare), protégée par ton code personnel. Sur un nouveau téléphone : mêmes adresse et code, puis « Récupérer ». <a href="${GUIDE}" target="_blank" rel="noopener" style="color:var(--pink)">Guide d'installation</a></p>
  <label class="stack" style="gap:4px"><b class="small">Adresse du serveur</b><input class="txt" id="sy-url" inputmode="url" autocomplete="off" placeholder="https://ektyron-coach.toi.workers.dev" value="${esc(S.url)}" style="font-size:15px;padding:10px"></label>
  <label class="stack" style="gap:4px"><b class="small">Ton code personnel (garde-le précieusement)</b><div class="row"><input class="txt" id="sy-code" autocomplete="off" placeholder="au moins 8 caractères" value="${esc(S.code)}" style="flex:1;font-size:15px;padding:10px"><button class="chip" id="sy-gen">Générer</button></div></label>
  <div class="row"><span class="sp small">Synchroniser automatiquement</span><button class="chip" id="sy-auto" aria-pressed="${S.auto}">${S.auto?"Oui":"Non"}</button></div>
  <div class="row"><button class="btn sm" id="sy-save" style="flex:1">Enregistrer et envoyer</button><button class="btn ghost sm" id="sy-get" style="flex:1">Récupérer</button></div>
  <p class="small" id="sy-m" style="margin:0">${S.last?`Dernière synchro : ${new Date(S.last).toLocaleString("fr-FR",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}`:""}</p>`,"sec-sync");
 const coach=card("Coach",`<div class="lab">Semaine de décharge</div>${chips("dlw",[5,6],C.dlw,v=>`Toutes les ${v} semaines`)}<p class="small muted" style="margin:0">Une semaine plus légère après ${C.dlw-1} semaines d'entraînement, ou plus tôt si plusieurs exercices stagnent.</p>`);
 const units=card("Unités",`<div class="lab">Charges et poids</div>${chips("wu",["kg","lb"],C.wu,v=>v==="kg"?"Kilos (kg)":"Livres (lb)")}<div class="lab">Mensurations</div>${chips("lu",["cm","in"],C.lu,v=>v==="cm"?"Centimètres":"Pouces (in)")}`);
 const data=card("Données",`<p class="small muted" style="margin:0">Efface ton profil, tes séances, tes pesées et tes mesures de ce téléphone. Exporte d'abord si tu veux les garder.</p><button class="link" id="wipe">Tout effacer et recommencer</button>`);
 return `<div class="row" style="margin-top:-8px"><button class="chip" data-tab="me">‹ Profil</button></div>${notif}${save}${sync}${coach}${units}${data}`}

document.addEventListener("change",e=>{if(e.target.id==="bk-file"&&e.target.files[0])bkFile(e.target.files[0])});
document.addEventListener("click",e=>{const t=e.target.closest("button");if(!t)return;const D=t.dataset;
 if(t.id==="bk-imp"){$("#bk-file").click();return}
 if(t.id==="ob-file"){$("#ob-f").click();return}
 if(!PROF)return;
 if(t.id==="bk-exp"){bkExport();return}
 if(D.ref){startRefine(D.ref);return}
 const setN=f=>{const N=notifCfg();f(N);LS.set("coach-notif",N);notifPublish();notifCheck();render()},setC=f=>{const C=SET();f(C);LS.set("coach-set",C);notifPublish();render()};
 if(D.nty){setN(N=>{N.types={...N.types,[D.nty]:N.types[D.nty]?0:1}});return}
 if(D.nsh){setN(N=>{N.shour=+D.nsh});return}
 if(D.nmf){setN(N=>{N.mf=+D.nmf});return}
 if(D.ncf){setN(N=>{N.cf=+D.ncf});return}
 if(D.bkf!==undefined){setC(C=>{C.bk=+D.bkf});return}
 if(D.dlw){setC(C=>{C.dlw=+D.dlw});return}
 if(D.wu){setC(C=>{C.wu=D.wu});return}
 if(D.lu){setC(C=>{C.lu=D.lu});return}
 if(t.id==="ps-on"){pushOn();return}
 if(t.id==="ps-off"){pushOff();return}
 if(t.id==="ps-test"){api("/push/test",{method:"POST"}).then(()=>toast("Notification de test envoyée."),err=>toast("Test raté : "+err.message));return}
 if(t.id==="sy-gen"){$("#sy-code").value=newCode();return}
 if(t.id==="sy-auto"){const S=syncCfg();S.auto=!S.auto;LS.set("coach-sync",S);render();return}
 const readSync=()=>{const S=syncCfg(),u=$("#sy-url").value.trim(),c=$("#sy-code").value.trim();if(!/^https:\/\/\S+$/.test(u)){$("#sy-m").textContent="L'adresse doit commencer par https://";return null}if(c.length<8){$("#sy-m").textContent="Ton code doit faire au moins 8 caractères.";return null}
  if(c!==S.code){S.h=0;S.push=false;S.ps=""}S.url=u;S.code=c;LS.set("coach-sync",S);return S};
 if(t.id==="sy-save"){if(!readSync())return;$("#sy-m").textContent="Envoi…";syncUp(true).then(()=>{toast("Données envoyées sur ton serveur.");render()},err=>{$("#sy-m").textContent="Échec : "+err.message});return}
 if(t.id==="sy-get"){if(!readSync())return;$("#sy-m").textContent="Récupération…";syncDown().catch(err=>{$("#sy-m").textContent="Échec : "+err.message});return}});
/* Dans le questionnaire : restaurer depuis un fichier. */
document.addEventListener("change",e=>{if(e.target.id==="ob-f"&&e.target.files[0])bkFile(e.target.files[0])});

/* Lancé à la fin d'app.js : chaque donnée sauvegardée déclenche une synchro (regroupée), et la sortie de l'appli aussi. */
function reglagesInit(){const set=LS.set;LS.set=(k,v)=>{set(k,v);if(BK_KEYS.includes(k))syncSoon()};
 document.addEventListener("visibilitychange",()=>{if(document.hidden&&syncCfg().auto)syncUp().catch(()=>{})});
 if(syncCfg().auto)syncUp().catch(()=>{})}
