/* ================= Suivi : poids, mensurations, analyse corporelle, bilan, régularité, force, rappels =================
   Chargé avant app.js : uniquement des fonctions et des écouteurs, qui utilisent les globales d'app.js au moment où ils s'exécutent. */
const MEAS=[["taille","Tour de taille","Au niveau du nombril, ventre relâché, juste après avoir expiré."],["hanches","Tour de hanches","Au plus large des fesses, pieds joints."],
 ["poitrine","Tour de poitrine","Sous les aisselles, au niveau des tétons, bras le long du corps."],["bras","Tour de bras","Bras plié à 90°, biceps contracté, au plus gros."],
 ["cuisse","Tour de cuisse","Debout, jambe relâchée, au plus large (environ 15 cm sous le pli de l'aine)."],["mollet","Tour de mollet","Debout, au plus gros du mollet."],["cou","Tour de cou","Juste sous la pomme d'Adam, mètre bien à l'horizontale."]];
const CHECK=[["sommeil","😴","Ton sommeil cette semaine",["Très mauvais","Mauvais","Moyen","Bon","Excellent"],1],["energie","⚡","Ton énergie à la salle",["À plat","Faible","Normale","Bonne","Au top"],1],
 ["faim","🍽️","Ta faim dans la journée",["Aucune","Peu","Normale","Souvent faim","Affamé"],0],["courb","🦵","Courbatures ou douleurs",["Aucune","Légères","Moyennes","Fortes","Douleur"],-1],["moral","🔥","Ta motivation",["Au plus bas","Faible","Correcte","Bonne","À fond"],1]];
const sameDay=(t,d=new Date())=>!!t&&new Date(t).toDateString()===d.toDateString();
const lastT=k=>{const a=LS.get(k,[]);return a.length?a[a.length-1].t:0};
let CK={};

/* Sens souhaité d'une mensuration selon l'objectif : +1 doit monter, −1 doit baisser, 0 indifférent. */
function measDir(k){const g=PROF.goal;if(k==="taille"||k==="hanches")return g==="seche"||g==="recompo"?-1:0;if(k==="cou")return 0;return g==="seche"?0:1}
/* % de gras estimé, méthode US Navy (mesures en cm). */
function navyBF(m){const h=PROF.h;if(!m.taille||!m.cou)return null;
 if(PROF.sex==="f"){if(!m.hanches)return null;const v=495/(1.29579-.35004*Math.log10(m.taille+m.hanches-m.cou)+.221*Math.log10(h))-450;return v>3&&v<60?v:null}
 const v=495/(1.0324-.19077*Math.log10(m.taille-m.cou)+.15456*Math.log10(h))-450;return v>3&&v<60?v:null}
/* Pente en kg par semaine sur les 21 derniers jours (moindres carrés). */
function trendKgWeek(W){const now=Date.now(),P=W.filter(w=>now-w.t<=21*DAY);if(P.length<2||P[P.length-1].t-P[0].t<5*DAY)return null;
 const n=P.length,mx=P.reduce((a,w)=>a+w.t,0)/n,my=P.reduce((a,w)=>a+w.kg,0)/n;let num=0,den=0;for(const w of P){num+=(w.t-mx)*(w.kg-my);den+=(w.t-mx)**2}return den?num/den*7*DAY:null}
const e1rm=s=>s.k*(1+s.r/30);
const mondayOf=t=>{const d=new Date(t);return new Date(d.getFullYear(),d.getMonth(),d.getDate()-((d.getDay()+6)%7)).getTime()};

/* ---------- Rappels ---------- */
const notifCfg=()=>{const N={on:false,wday:1,hour:8,shour:18,mf:14,cf:7,last:{},...LS.get("coach-notif",{})};N.types={seance:1,pesee:1,mesures:1,bilan:1,save:1,...(N.types||{})};return N};
const canNotif=()=>"Notification"in window&&"serviceWorker"in navigator;
const IOS=/iPhone|iPad|iPod/.test(navigator.userAgent);
function dueList(){const N=notifCfg(),T=N.types,d=new Date(),wd=d.getDay(),now=Date.now(),out=[],lw=lastT("coach-weights"),lm=lastT("coach-meas"),lc=lastT("coach-check");
 if(T.pesee&&!sameDay(lw)&&(wd===N.wday||lw&&now-lw>8*DAY))out.push({k:"pesee",e:"⚖️",t:"C'est le jour de ta pesée",b:"Le matin à jeun, après être passé aux toilettes, toujours sur la même balance."});
 if(T.mesures&&!sameDay(lm)&&now-lm>=(N.mf-1)*DAY&&(wd===N.wday||lm&&now-lm>(N.mf+2)*DAY))out.push({k:"mesures",e:"📏",t:"Jour de mensurations",b:"Taille, bras, cuisse… 2 minutes avec un mètre ruban. Et la balance à impédance de ta salle si elle en a une."});
 if(T.bilan&&!sameDay(lc)&&now-lc>=(N.cf-1)*DAY&&(wd===N.wday||lc&&now-lc>(N.cf+2)*DAY))out.push({k:"bilan",e:"📝",t:"Ton bilan de la semaine",b:"Sommeil, énergie, faim : 20 secondes pour que ton coach t'ajuste."});
 if(T.save&&bkDue())out.push({k:"save",e:"💾",t:"Sauvegarde tes données",b:"Exporte-les vers Fichiers ou Obsidian (ou active la synchro en ligne) : rien n'est perdu si tu changes de téléphone."});
 const S=TRAIN&&TRAIN[wd];if(T.seance&&S&&!xpProf().games.some(g=>sameDay(g.t)))out.push({k:"seance",e:"🏋️",t:`Séance du jour : ${S.t}`,b:`${S.x.length} exercices, environ ${sessMin(S)} min.`});
 return out}
function dueBanner(){const L=dueList().filter(x=>x.k!=="seance");if(!L.length)return"";
 return `<div class="card stack" style="border-color:var(--warn)"><div class="lab">À faire aujourd'hui</div>${L.map(x=>`<button class="hintbox" data-go="${x.k}" style="text-align:left;width:100%;color:inherit"><span style="font-size:26px">${x.e}</span><span><b>${x.t}</b><br><small class="muted">${x.b}</small></span></button>`).join("")}</div>`}
/* Le service worker ne lit pas le localStorage : on lui recopie l'essentiel dans un cache dédié. */
async function notifPublish(){try{if(!("caches"in window))return;const c=await caches.open("ektyron-data"),old=await c.match("reminders").then(r=>r?r.json():{}).catch(()=>({})),N=notifCfg();
 const tk=todayKey(),last={...N.last};for(const k in old.last||{})if(old.last[k]===tk)last[k]=tk;
 await c.put("reminders",new Response(JSON.stringify({on:N.on,wday:N.wday,hour:N.hour,shour:N.shour,mf:N.mf,cf:N.cf,types:N.types,last,lastW:lastT("coach-weights"),lastM:lastT("coach-meas"),lastC:lastT("coach-check"),lastG:(xpProf().games.slice(-1)[0]||{}).t||0,train:PROF&&TRAIN?WEEK.filter(d=>TRAIN[d]).map(d=>[d,TRAIN[d].t]):[]})));
 if(N.on&&"serviceWorker"in navigator){const r=await navigator.serviceWorker.ready;if(r.periodicSync)try{await r.periodicSync.register("coach-reminders",{minInterval:4*3600e3})}catch(e){}}}catch(e){}
 pushPublish()}
let notifTimer;
async function notifCheck(){clearTimeout(notifTimer);const N=notifCfg();if(!PROF||!N.on||!canNotif()||Notification.permission!=="granted"||syncCfg().push)return;const now=new Date(),hOf=k=>k==="seance"?N.shour:N.hour,L=dueList(),wait=L.filter(it=>now.getHours()<hOf(it.k));
 if(wait.length){const at=new Date(now.getFullYear(),now.getMonth(),now.getDate(),Math.min(...wait.map(it=>hOf(it.k)))).getTime();notifTimer=setTimeout(notifCheck,at-now.getTime()+1000)}
 try{const r=await navigator.serviceWorker.ready,tk=todayKey();for(const it of L){if(N.last[it.k]===tk||now.getHours()<hOf(it.k))continue;N.last[it.k]=tk;await r.showNotification(it.t,{body:it.b,tag:it.k,icon:"icons/icon-192.png",badge:"icons/icon-192.png",data:{go:it.k==="seance"?"today":it.k==="save"?"set":"prog"}})}}catch(e){}
 LS.set("coach-notif",N);notifPublish()}
async function notifToggle(){const N=notifCfg();if(N.on){N.on=false;LS.set("coach-notif",N);notifPublish();toast("Rappels coupés");return render()}
 if(!canNotif()){toast(IOS&&!STANDALONE?"Sur iPhone : installe d'abord l'appli sur l'écran d'accueil (iOS 16.4 ou plus), puis active les rappels.":"Ce navigateur ne gère pas les notifications.");return}
 const p=await Notification.requestPermission();N.on=p==="granted";LS.set("coach-notif",N);
 if(N.on){toast("Rappels activés");N.last={};LS.set("coach-notif",N);await notifCheck()}else toast("Notifications refusées : autorise-les dans les réglages du téléphone.");render()}

/* ---------- Vue Progrès ---------- */
function vProg(){const p=PROF,W=LS.get("coach-weights",[]),M=LS.get("coach-meas",[]),C=LS.get("coach-check",[]),X=xpProf(),N=notifCfg(),g=goalPlan(p),cur=curWeight();
 const vol=X.games.reduce((a,x)=>a+(x.vol||0),0),card=(lab,body,extra="")=>`<div class="card stack"${extra}><div class="lab">${lab}</div>${body}</div>`;
 const kv=(l,v,c)=>`<li><span class="sp muted">${l}</span><b${c?` style="color:${c}"`:""}>${v}</b></li>`;
 const sg=(v,d=1)=>(v>0?"+":v<0?"−":"")+fr(Math.abs(v),d);
 /* Poids et projection */
 let chart="";if(W.length>=2){const ks=W.map(w=>w.kg),mn=Math.min(...ks)-1,mx=Math.max(...ks)+1,t0=W[0].t,t1=W[W.length-1].t||t0+1,X_=t=>8+(t-t0)/(t1-t0||1)*284,Y_=k=>150-(k-mn)/(mx-mn)*130;
  const pts=W.map(w=>`${X_(w.t).toFixed(1)},${Y_(w.kg).toFixed(1)}`),gl=p.tw!=null&&p.tw>=mn&&p.tw<=mx?`<line x1="8" x2="292" y1="${Y_(p.tw).toFixed(1)}" y2="${Y_(p.tw).toFixed(1)}" stroke="var(--good)" stroke-dasharray="4 4"/>`:"";
  chart=`<svg class="chart" viewBox="0 0 300 170"><defs><linearGradient id="ga" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FF2E3A" stop-opacity=".35"/><stop offset="1" stop-color="#FF2E3A" stop-opacity="0"/></linearGradient></defs>${gl}<path class="a" d="M${pts[0]} L${pts.join(" L")} L${X_(t1)},160 L8,160Z"/><path class="l" d="M${pts.join(" L")}"/><text x="4" y="14">${fr(mx,1)} kg</text><text x="4" y="166">${fr(mn,1)} kg</text></svg>`}
 const w0=W.length?W[0].kg:p.w,tr=trendKgWeek(W),want=g.pm/4.35,avg7=(()=>{const a=W.filter(w=>Date.now()-w.t<=7*DAY);return a.length?a.reduce((s,w)=>s+w.kg,0)/a.length:null})();
 let verdict="";if(tr!=null&&p.tw!=null&&Math.abs(g.diff)>=.5){const r=tr/want;verdict=r<.5?["En retard sur ton objectif : ton coach ajuste tes calories à chaque pesée.","var(--warn)"]:r>1.6?[g.diff>0?"Plus vite que prévu : attention à ne pas prendre trop de gras.":"Plus vite que prévu : attention à ne pas perdre de muscle.","var(--warn)"]:["Pile dans le bon rythme.","var(--good)"]}
 const left=p.tw!=null?p.tw-cur:0,eta=tr&&p.tw!=null&&Math.sign(tr)===Math.sign(left)&&Math.abs(left)>=.3?new Date(Date.now()+left/tr*7*DAY):null;
 const poids=card("Poids",`<div class="row"><b class="sp" style="font:800 30px var(--display)">${kgS(cur)}</b>${p.tw!=null?`<span class="small muted">objectif ${kgS(p.tw)}</span>`:""}</div>${chart||`<p class="small muted" style="margin:0">Ta courbe apparaît après deux pesées.</p>`}
  <ul class="list">${kv("Depuis le début",sg(cur-w0)+" kg")}${avg7!=null?kv("Moyenne des 7 derniers jours",fr(avg7,1)+" kg"):""}${tr!=null?kv("Rythme réel (3 semaines)",sg(tr,2)+" kg / semaine",verdict[1]):kv("Rythme réel","après 2 pesées espacées d'une semaine")}${p.tw!=null&&Math.abs(g.diff)>=.5?kv("Rythme visé",sg(want,2)+" kg / semaine"):""}${p.tw!=null?kv("Reste à faire",sg(left)+" kg"):""}${eta?kv("Objectif atteint vers",eta.toLocaleDateString("fr-FR",{month:"long",year:"numeric"})):""}</ul>
  ${verdict?`<div class="coachmsg">${verdict[0]}</div>`:""}
  <div class="row"><input class="txt" id="w-in" inputmode="decimal" placeholder="Poids du jour" style="flex:1;font-size:17px;padding:12px"><button class="btn sm" id="w-save">Ajouter</button></div>${LS.get("coach-msg","")?`<div class="coachmsg">${esc(LS.get("coach-msg",""))}</div>`:""}
  <p class="small muted" style="margin:0">Pèse-toi le même jour chaque semaine, le matin à jeun : le poids varie d'1 à 2 kg dans la journée.</p>`,` id="sec-pesee"`);
 /* Mensurations et analyse corporelle */
 const last=M[M.length-1]||{},firstOf=k=>M.find(m=>m[k]!=null),lastOf=k=>[...M].reverse().find(m=>m[k]!=null);
 const rows=MEAS.map(([k,l])=>{const f=firstOf(k),z=lastOf(k);if(!z)return"";const d=z[k]-f[k],dir=measDir(k),c=!d||!dir?"":d*dir>0?"var(--good)":"var(--warn)";return kv(l,`${cmS(z[k])}${f!==z?` <small style="color:${c||"var(--muted)"}">(${sg(toL(d))})</small>`:""}`)}).join("");
 const bfM=[...M].reverse().find(m=>m.bf!=null),bfN=(()=>{const m={};for(const [k] of MEAS){const z=lastOf(k);if(z)m[k]=z[k]}return navyBF(m)})(),bf=bfM?bfM.bf:bfN,bf0=(M.find(m=>m.bf!=null)||{}).bf;
 const wh=lastOf("taille")?lastOf("taille").taille/p.h:null;
 const compo=bf!=null?`<ul class="list">${kv(bfM?"Masse grasse (balance)":"Masse grasse estimée",`${fr(bf,1)} %${bfM&&bf0!=null&&bf0!==bf?` <small class="muted">(${sg(bf-bf0)} pt)</small>`:""}`)}${kv("Soit en gras",fr(cur*bf/100,1)+" kg")}${kv("Masse maigre",fr(cur*(1-bf/100),1)+" kg")}${bfM&&bfM.mm?kv("Masse musculaire (balance)",fr(bfM.mm,1)+" kg"):""}${wh?kv("Tour de taille / taille",`${fr(wh,2)} · ${wh<.5?"bonne zone":wh<.6?"à surveiller":"élevé"}`,wh<.5?"var(--good)":"var(--warn)"):""}</ul>
   ${!bfM?`<p class="small muted" style="margin:0">Estimation par la méthode US Navy à partir de ta taille, ton cou${p.sex==="f"?" et tes hanches":""}. Une balance à impédance donne une mesure plus directe.</p>`:""}`:`<p class="small muted" style="margin:0">Mesure ton tour de taille et ton tour de cou${p.sex==="f"?" (et tes hanches)":""} : ton coach estime ton % de gras.</p>`;
 const mesures=card("Mensurations et composition",`${rows?`<ul class="list">${rows}</ul>`:`<p class="small muted" style="margin:0">La balance ne dit pas tout : en prise de muscle, le tour de bras monte ; en sèche, le tour de taille baisse même quand le poids stagne. Mesure-toi toutes les 2 semaines.</p>`}
  ${compo}
  <details><summary class="lab" style="cursor:pointer">Ajouter mes mesures du jour${last.t?` · dernières le ${new Date(last.t).toLocaleDateString("fr-FR",{day:"numeric",month:"long"})}`:""}</summary>
  <p class="small muted">Avec un mètre ruban de couture, le matin, sans serrer, toujours au même endroit. Laisse vide ce que tu ne mesures pas.</p>
  <div class="stack">${MEAS.map(([k,l,h])=>`<label class="stack" style="gap:4px"><span><b>${l}</b> <small class="muted">${h}</small></span><input class="txt" id="m-${k}" inputmode="decimal" placeholder="${lastOf(k)?fr(toL(lastOf(k)[k]),1):lU()}" style="font-size:16px;padding:10px"></label>`).join("")}
  <div class="hintbox"><span style="font-size:26px">📟</span><span><b>Balance à impédance de ta salle</b><br><small class="muted">Beaucoup de salles en ont une (InBody, Tanita…) : chez Basic-Fit, Fitness Park ou On Air, demande à l'accueil si ton club en a une. Note ici ce qu'elle affiche, sinon laisse vide : tes mensurations suffisent.</small></span></div>
  <label class="stack" style="gap:4px"><b>Masse grasse (%)</b><input class="txt" id="m-bf" inputmode="decimal" placeholder="%" style="font-size:16px;padding:10px"></label>
  <label class="stack" style="gap:4px"><b>Masse musculaire (kg)</b><input class="txt" id="m-mm" inputmode="decimal" placeholder="kg" style="font-size:16px;padding:10px"></label>
  <button class="btn" id="m-save">Enregistrer mes mesures</button></div></details>`,` id="sec-mesures"`);
 /* Régularité */
 const m0=mondayOf(Date.now()),wk=[3,2,1,0].map(i=>{const a=m0-i*7*DAY,b=a+7*DAY,gs=X.games.filter(x=>x.t>=a&&x.t<b);return{a,n:gs.length,vol:gs.reduce((s,x)=>s+(x.vol||0),0)}});
 let streak=0;for(let i=1;i<60;i++){const a=m0-i*7*DAY;if(X.games.filter(x=>x.t>=a&&x.t<a+7*DAY).length>=p.freq)streak++;else break}
 const ek=LS.get("coach-eaten",{});let ate=0;for(let i=0;i<7;i++)ate+=Object.values(ek[new Date(Date.now()-i*DAY).toISOString().slice(0,10)]||{}).filter(Boolean).length;
 const mx=Math.max(p.freq,...wk.map(w=>w.n),1);
 const regul=card("Régularité",`<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;align-items:end;height:110px">${wk.map((w,i)=>`<div style="text-align:center"><div style="height:${Math.max(4,w.n/mx*80)}px;border-radius:6px;background:${w.n>=p.freq?"var(--good)":"var(--pink)"}"></div><small class="muted">${i===3?"Cette sem.":new Date(w.a).toLocaleDateString("fr-FR",{day:"numeric",month:"short"})}</small><br><b>${w.n}/${p.freq}</b></div>`).join("")}</div>
  <ul class="list">${kv("Semaines d'affilée à l'objectif",streak)}${kv("Volume soulevé cette semaine",fr(wk[3].vol/1000,1)+" t")}${kv("Volume semaine dernière",fr(wk[2].vol/1000,1)+" t")}${kv("Repas cochés sur 7 jours",`${ate} / ${7*p.meals} (${Math.round(ate/(7*p.meals)*100)} %)`,ate>=5.5*p.meals?"var(--good)":"var(--warn)")}</ul>`);
 /* Force : progression par exercice */
 const prog=Object.keys(store).filter(id=>EX[id]&&store[id].length).map(id=>{const H=store[id],best=h=>Math.max(...h.sets.map(e1rm)),f=best(H[0]),b=Math.max(...H.map(best));let top=null;for(const h of H)for(const s of h.sets)if(!top||s.k>top.k||(s.k===top.k&&s.r>top.r))top=s;return{n:EX[id][0],f,b,top,pct:f?(b-f)/f*100:0,n2:H.length}}).sort((a,b)=>b.pct-a.pct);
 const force=card("Force",prog.length?`<ul class="list">${prog.slice(0,8).map(r=>`<li><span class="sp">${r.n}<br><small class="muted">record ${kgS(r.top.k)} × ${r.top.r} · ${r.n2} séance${r.n2>1?"s":""}</small></span><b class="mono" style="color:${r.pct>0?"var(--good)":"var(--muted)"}">${r.pct>0?"+":""}${fr(r.pct)} %</b></li>`).join("")}</ul><p class="small muted" style="margin:0">Progression de ta force estimée (1 répétition max) depuis ta première séance sur l'exercice.</p>`:`<p class="small muted" style="margin:0">Joue ta première séance pour poser tes premières marques.</p>`);
 /* Bilan de la semaine */
 const lc=C[C.length-1],adv=lc?coachCheck(lc):"";
 const bilan=card("Bilan de la semaine",`${CHECK.map(([k,e,l,o])=>`<div><div class="small"><b>${e} ${l}</b></div><div class="row" style="flex-wrap:wrap;gap:6px;margin-top:4px">${o.map((t,i)=>`<button class="chip" data-ck="${k}" data-v="${i+1}" aria-pressed="${CK[k]===i+1}" style="flex:1;padding:8px 6px;font-size:12px">${t}</button>`).join("")}</div></div>`).join("")}
  <button class="btn" id="ck-save">Enregistrer mon bilan</button>${adv?`<div class="coachmsg">${adv}</div>`:""}
  ${C.length>=2?`<ul class="list">${C.slice(-4).reverse().map(c=>`<li><span class="sp muted">${new Date(c.t).toLocaleDateString("fr-FR",{day:"numeric",month:"short"})}</span><b class="mono">😴${c.sommeil} ⚡${c.energie} 🍽️${c.faim} 🦵${c.courb} 🔥${c.moral}</b></li>`).join("")}</ul>`:""}`,` id="sec-bilan"`);
 /* Rappels : réglages dans Paramètres */
 const S_=syncCfg(),rap=card("Rappels",`<div class="row"><span class="sp small">${S_.push?"Push actif : ton coach te prévient même appli fermée.":N.on?"Rappels activés à l'ouverture de l'appli.":"Séance, pesée, mesures, bilan : choisis quand ton coach te prévient."}</span><button class="chip" data-tab="set">Régler</button></div>`);
 return `${dueBanner()}<div class="kpis"><div><strong>${X.games.length}</strong><small>séances jouées</small></div><div><strong>${weekGames()}/${p.freq}</strong><small>cette semaine</small></div><div><strong>${fr(vol/1000,1)} t</strong><small>soulevées</small></div></div>
 ${coachCard()}${poids}${mesures}${regul}${force}${bilan}${rap}`}
function coachCheck(c){const g=PROF.goal,o=[];
 if(c.sommeil<=2)o.push("Sommeil court : vise 7 à 9 h, c'est pendant la nuit que le muscle se construit. Si ça dure, retire une série par exercice cette semaine.");
 if(c.energie<=2)o.push(g==="seche"?"Énergie basse en sèche : mange bien tes féculents dans le repas avant la séance.":"Énergie basse : vérifie que tu manges tout ton plan et que tu bois 2,5 L d'eau.");
 if(c.faim>=4&&(g==="seche"||g==="recompo"))o.push("Grosse faim : remplis ton assiette de légumes, garde les protéines hautes et bois un grand verre d'eau avant chaque repas.");
 if(c.faim<=2&&(g==="masse"||g==="force"))o.push("Peu d'appétit en prise : passe à 4 repas et ajoute un shake lait, banane et avoine.");
 if(c.courb>=4)o.push("Courbatures fortes ou douleur : garde 48 h entre deux séances du même muscle. Si une douleur articulaire dure, consulte un kiné.");
 if(c.moral<=2)o.push("Motivation en baisse : vise seulement la séance du jour. Une séance faite vaut mieux qu'une séance parfaite.");
 return o.length?o.join("<br>"):"Tout est au vert : on garde le cap."}
function saveMeas(){const e={t:Date.now()};let n=0;for(const [k] of MEAS){const v=fromL(gNum($("#m-"+k).value));if(v>10&&v<250){e[k]=v;n++}}
 const bf=gNum($("#m-bf").value),mm=gNum($("#m-mm").value);if(bf>2&&bf<70){e.bf=bf;n++}if(mm>10&&mm<150){e.mm=mm;n++}
 if(!n)return toast("Indique au moins une mesure, en cm.");const M=LS.get("coach-meas",[]);if(M.length&&sameDay(M[M.length-1].t))Object.assign(M[M.length-1],e);else M.push(e);LS.set("coach-meas",M);notifPublish();toast(`${n} mesure${n>1?"s":""} enregistrée${n>1?"s":""}.`);render()}
function saveCheck(){if(CHECK.some(([k])=>!CK[k]))return toast("Réponds aux 5 questions.");const C=LS.get("coach-check",[]),e={t:Date.now(),...CK};if(C.length&&sameDay(C[C.length-1].t))C[C.length-1]=e;else C.push(e);LS.set("coach-check",C);CK={};notifPublish();toast("Bilan enregistré.");render()}

document.addEventListener("click",e=>{const t=e.target.closest("button");if(!t||!PROF)return;const D=t.dataset;
 if(D.ck){CK[D.ck]=+D.v;$$(`[data-ck="${D.ck}"]`).forEach(b=>b.setAttribute("aria-pressed",b===t));return}
 if(t.id==="ck-save")return saveCheck();
 if(t.id==="m-save")return saveMeas();
 if(t.id==="nt-tog")return notifToggle();
 if(D.nw!==undefined||D.nh!==undefined){const N=notifCfg();if(D.nw!==undefined)N.wday=+D.nw;else N.hour=+D.nh;LS.set("coach-notif",N);notifPublish();notifCheck();render();return}
 if(D.go==="save"){view="set";render();const el=document.getElementById("sec-save");if(el)el.scrollIntoView();return}
 if(D.go){const sec={pesee:"sec-pesee",mesures:"sec-mesures",bilan:"sec-bilan"}[D.go];if(view!=="prog"){view="prog";render()}const el=sec&&document.getElementById(sec);if(el){el.scrollIntoView({behavior:"smooth"});const d=el.querySelector("details");if(d)d.open=true}}});
/* Lancé à la fin d'app.js. */
function suiviInit(){const h=location.hash.slice(1);if(PROF&&(h==="prog"||h==="today"||h==="jeu")){view=h;render();history.replaceState(null,"",location.pathname+location.search)}
 if("serviceWorker"in navigator)navigator.serviceWorker.addEventListener("message",e=>{if(e.data&&e.data.go&&PROF&&view!=="ob"){view=e.data.go;render()}});
 document.addEventListener("visibilitychange",()=>{if(document.hidden)notifPublish();else notifCheck()});
 notifCheck();notifPublish()}
