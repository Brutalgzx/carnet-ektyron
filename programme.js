"use strict";
/* Zones prioritaires, objectifs précis, pondération du programme et analyse d'un programme collé en texte libre.
   Chargé après data.js et avant app.js (scripts classiques, globales partagées). */

/* ================= Zones et objectifs ================= */
const ZONES=PRIOS.filter(z=>z.v!=="none");
const AIMS=[{v:"esth",e:"✨",l:"Esthétique",s:"Un physique dessiné, de belles proportions"},{v:"force",e:"🏋️",l:"Force",s:"Soulever plus lourd"},{v:"gras",e:"🔥",l:"Perte de gras",s:"Affiner la silhouette"},
 {v:"posture",e:"🧍",l:"Posture",s:"Dos droit, épaules ouvertes, moins de douleurs"},{v:"sport",e:"⚽",l:"Performance sportive",s:"Course, foot, combat, ski…"},{v:"sante",e:"❤️",l:"Santé et forme",s:"Bouger mieux, avoir plus d'énergie"}];
const zoneL=v=>(ZONES.find(z=>z.v===v)||{l:v}).l;

/* Zones visées par chaque emplacement de séance, et emplacements ajoutés quand une zone est prioritaire. */
const SLOTZ={chestInc:["pecs"],chestFlat:["pecs"],chestIso:["pecs"],dips:["pecs"],backVert:["dos"],backRow:["dos","posture"],backUp:["dos","posture"],lowb:["dos","posture"],
 rear:["epaules","posture"],shPress:["epaules"],side:["epaules"],bic:["bras"],bic2:["bras"],tri:["bras"],triOvh:["bras"],
 quad:["jambes","sport"],quad2:["jambes"],quadIso:["jambes"],curl:["jambes"],calf:["jambes"],add:["fessiers","jambes"],hinge:["fessiers","jambes","sport"],
 glute:["fessiers","jambes"],glute2:["fessiers","jambes"],glute3:["fessiers"],abs:["abdos","sport"]};
const ZEXTRA={fessiers:["glute","glute2","glute3"],jambes:["quad2","curl","quadIso"],dos:["backRow","backVert","backUp"],pecs:["chestInc","chestIso"],
 epaules:["side","rear","shPress"],bras:["bic","tri","bic2"],abdos:["abs"],posture:["rear","backUp","lowb"],sport:["quad","hinge","abs"]};
const ZW=[4,3,2,1.5,1,1,1,1,1];
/* Liste ordonnée des zones à pousser : choix de la personne, puis posture et sport s'ils font partie de ses objectifs. */
function zoneList(p){const z=(p.prio||[]).filter(k=>ZEXTRA[k]);for(const a of ["posture","sport"])if((p.aims||[]).includes(a)&&!z.includes(a))z.push(a);return z}
const lowFocus=p=>["fessiers","jambes"].includes((p.prio||[])[0]);
const slotRank=(sl,zl)=>{let r=99;for(const z of SLOTZ[sl]||[]){const i=zl.indexOf(z);if(i>=0&&i<r)r=i}return r};
/* Rang de priorité d'un exercice (0 = priorité n°1), -1 si aucune. */
function prioRank(id,p){const zl=(p.prio||[]).filter(k=>ZEXTRA[k]);let r=-1;zl.forEach((k,i)=>{if(r<0&&(k==="fessiers"?GLUTE.includes(id)||id==="kick"||id==="addab":EX[id][1]===PRIOG[k]))r=i});return r}

/* Choix des exercices d'une séance : modèle de base + emplacements des zones prioritaires, notés puis triés.
   Un tiers des places reste aux muscles non prioritaires pour garder un corps équilibré. */
function pickSlots(k,p,nMax){const T=TPL[k],zl=zoneList(p),likes=p.likes||[],used=new Set();
 const cnt={},free=i=>!used.has(i)&&exOk(i,p)&&(!zl.length&&!likes.length||(cnt[MUSCOF[i]]||0)<2);
 const resolve=sl=>{const L=SLOT[sl]||[];return L.find(i=>likes.includes(i)&&MUSCOF[i]===MUSCOF[L[0]]&&free(i))||L.find(free)};
 if(!zl.length&&!likes.length){const ids=[];for(const sl of T.s){if(ids.length>=nMax)break;const id=resolve(sl);if(!id)continue;used.add(id);ids.push(id)}return ids}
 const full=/^full/.test(k),touch=z=>full||z==="abdos"||T.s.some(sl=>(SLOTZ[sl]||[]).includes(z));
 const C=T.s.map((sl,i)=>({sl,i,r:slotRank(sl,zl),b:8-.4*i}));
 zl.forEach((z,ri)=>{if(!touch(z))return;const n=ri===0?2:ri<3?1:0;ZEXTRA[z].filter(sl=>!T.s.includes(sl)).slice(0,n).forEach((sl,j)=>C.push({sl,i:50+ri*5+j,r:slotRank(sl,zl),b:6-.4*j}))});
 C.forEach(c=>c.sc=c.b+(c.r<99?ZW[c.r]:0));
 const non=C.filter(c=>c.r===99),reserve=zl.length&&non.length?Math.min(non.length,Math.ceil(nMax*(full?.4:.34))):0,out=[];
 const take=c=>{if(out.length>=nMax||out.includes(c))return;const id=resolve(c.sl);if(!id)return;used.add(id);cnt[MUSCOF[id]]=(cnt[MUSCOF[id]]||0)+1;c.id=id;out.push(c)};
 non.sort((a,b)=>b.sc-a.sc).slice(0,reserve).forEach(take);
 [...C].sort((a,b)=>b.sc-a.sc).forEach(take);
 const KO={H:0,M:1,I:2};
 return out.sort((a,b)=>Math.min(a.r,9)-Math.min(b.r,9)||(a.r<99&&b.r<99?KO[EX[a.id][3]]-KO[EX[b.id][3]]:0)||a.i-b.i).map(c=>c.id)}

/* ================= Questions du questionnaire ================= */
const rankTiles=(key,list)=>{const sel=A[key]||[];return `<div class="grid2">${list.map(o=>{const r=sel.indexOf(o.v);return `<button class="tile" data-m="${key}" data-v="${o.v}" aria-pressed="${r>=0}" style="position:relative"><span class="e">${o.e}</span><b>${o.l}</b>${r>=0?`<small>Priorité n°${r+1}</small>`:"<small>&nbsp;</small>"}</button>`}).join("")}</div>`};
const QZONES={t:"Les zones à travailler en priorité",s:"Touche-les dans l'ordre : la première est ta priorité n°1. Elles reçoivent plus d'exercices et plus de séries. Rien de coché : un programme équilibré.",
 h:()=>rankTiles("prio",ZONES)+`<div class="hintbox"><span style="font-size:26px">🎯</span><span><small class="muted">${(A.prio||[]).length?"Ordre : "+A.prio.map(zoneLabel).join(" → ")+(lowFocus(A)?". Ta semaine aura 2 séances bas du corps pour 1 de haut.":""):"Aucune zone choisie : tout le corps au même niveau."}</small></span></div>`,ok:()=>true};
function zoneLabel(v){return zoneL(v)}
const QAIMS={t:"Ce que tu veux vraiment",s:"Coche tout ce qui compte pour toi. Ton coach ajuste les exercices, les reps et les repos.",h:()=>opts("aims",AIMS,true),ok:()=>true};
const QPROG={t:"As-tu déjà un programme ?",s:"Si oui, colle-le : ton coach garde ce qui marche et corrige le reste.",
 h:()=>opts("hasProg",[{v:"non",e:"🆕",l:"Non, je pars de zéro"},{v:"oui",e:"📋",l:"Oui, je le colle ici",s:"Jours, exercices, séries × reps"}])+(A.hasProg==="oui"?`<textarea class="txt" id="i-prog" rows="9" maxlength="4000" placeholder="Lundi : jambes&#10;Squat 4x8&#10;Hip thrust 3x10&#10;Leg curl 3x12&#10;&#10;Mercredi : haut&#10;Développé couché 4x8&#10;Tirage vertical 3x10" style="font-size:15px;padding:12px;margin-top:12px;width:100%;resize:vertical">${esc(A.progTxt||"")}</textarea><div id="prog-hit" class="small muted" style="margin-top:6px">${progHint(A.progTxt)}</div>`:""),
 ok:()=>A.hasProg==="non"||(A.hasProg==="oui"&&(A.progTxt||"").trim().length>=8)};

/* ================= Lecture d'un programme collé ================= */
const norm=s=>String(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");
/* Ordre important : les règles précises d'abord. */
const ALIAS=[
 [/hip ?thrust|poussee de hanche/,["hipt"]],[/barre au front|skull|french press|extension.*(nuque|derriere la tete|au dessus)|overhead.*tri/,["ovh","extd"]],
 [/triceps|pushdown|push down|extension.*corde/,["tri1","triv","extd","dipsbanc"]],[/kick ?back|ruade|extension de hanche/,["kick","pont"]],
 [/pont fessier|glute bridge|\bpont\b/,["pont","hipt"]],[/bulgare|bulgarian|split squat/,["bulg","fentes"]],[/fente|lunge|step ?up/,["fentes","bulg"]],
 [/roumain|rdl|jambes tendues|stiff|good ?morning/,["rdlx","rdl"]],[/souleve de terre|deadlift|\bsdt\b/,["rdlx","rdl"]],[/hack/,["hack","smsq"]],
 [/presse|leg press/,["press","hack"]],[/goblet/,["gobsq"]],[/squat/,["smsq","hack","gobsq","squatpdc"]],
 [/leg ext|extension (des )?(jambes|quadri)|quadriceps/,["lext"]],[/leg curl.*assis|curl.*assis.*ischio/,["lcurl1","lcurl2"]],[/nordic/,["nordic"]],
 [/leg curl|curl (des )?ischio|ischio/,["lcurl2","lcurl1","nordic"]],[/adduct|abduct/,["addab"]],[/mollet|calf|calves/,["moll","moll2","mollh","mollpdc"]],
 [/oiseau|reverse fly|rear delt|arriere d.?epaule|reverse pec/,["rfly","oiseau","facep"]],[/face ?pull/,["facep","rfly"]],
 [/incline/,["incl","dbinc","pompesd"]],[/developpe couche|bench|couche/,["benchx","dch","pompes"]],
 [/pec ?deck|butterfly|pec fly|ecarte|\bfly\b|vis.?a.?vis|crossover|cable cross/,["pfly","ecbh","dbfly"]],[/dips/,["dips","dipsb"]],[/pompe|push.?up/,["pompes"]],
 [/traction|pull.?up|\bchin/,["tract","tvert"]],[/tirage vertical|lat ?pull|tirage (poitrine|nuque|haut|dos)|pulldown|pull down/,["tvert","tract"]],
 [/rowing|\brow\b|tirage horizontal|tirage (assis|poulie basse|buste)/,["rowm","rowu","rowx","rowinv"]],
 [/developpe (militaire|epaule|nuque|assis)|militaire|overhead press|shoulder press|\bohp\b|arnold|elevations? frontales?|front raise/,["dmil","pike"]],
 [/elevations? lat|lateral|elevations? (sur les )?cotes/,["elat","elmac","elath"]],[/marteau|hammer/,["mart","marth"]],[/curl/,["cpou","pupi","curlh","curlpdc"]],
 [/lombaire|back ext|hyperext|superman/,["bext","superman"]],[/crunch|abdo|relev|gainage|planche|plank|russian|oblique|sit.?up/,["crun","releve"]]];
const DAYRX=/^(jour|j\s*\d|lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|seance|day|push|pull|legs?\b|jambes|upper|lower|haut|bas|full|pecs?\b|dos\b|bras\b|epaules?\b|fessiers?\b|semaine|s\d)/;
const SRX=/(\d+)\s*(?:x|×|\*|series? de|sets? of|sets? de)\s*(\d+)(?:\s*(?:-|à|a|–|\/)\s*(\d+))?/;
function progMatch(name,p){const n=norm(name);for(const [rx,ids] of ALIAS)if(rx.test(n)){
  const sc=id=>{const eq=EX[id][2];return(p&&exOk(id,p)?4:0)+(/halt|dumbbell|\bdb\b/.test(n)&&eq.includes("d")?2:0)+(/barre|\bbar\b/.test(n)&&eq.includes("x")?2:0)+(/machine|poulie|cable/.test(n)&&/[mc]/.test(eq)?1:0)-ids.indexOf(id)*.1};
  return [...ids].sort((a,b)=>sc(b)-sc(a))[0]}return null}
function progParse(txt,p){const days=[];let cur=null;
 for(let raw of String(txt||"").split(/\n|;/)){let l=raw.replace(/^\s*([-•*–·>]+|\d+[.)])\s*/,"").trim();if(!l)continue;const n=norm(l),m=n.match(SRX);
  if(!m&&(/:\s*$/.test(l)||DAYRX.test(n))&&l.length<60&&!progMatch(l.replace(/:.*$/,""),p)){cur={t:l.replace(/:\s*$/,""),x:[]};days.push(cur);continue}
  let name=l;if(m)name=l.slice(0,n.indexOf(m[0]))+l.slice(n.indexOf(m[0])+m[0].length);
  if(!m&&/:/.test(l)&&DAYRX.test(n)){cur={t:l.split(":")[0].trim(),x:[]};days.push(cur);name=l.split(":").slice(1).join(":")}
  name=name.replace(/\(?\s*(repos|rest|recup)[^)]*\)?/i,"").replace(/[:,\-–]+\s*$/,"").trim();if(!/[a-z]/i.test(name))continue;
  if(!cur){cur={t:"Séance 1",x:[]};days.push(cur)}
  const s=m?+m[1]:3,lo=m?+m[2]:10,hi=m&&m[3]?+m[3]:lo;cur.x.push({raw:name,id:progMatch(name,p),s:Math.min(10,s),r:[Math.min(lo,hi),Math.max(lo,hi)]})}
 return days.filter(d=>d.x.length)}
function progHint(txt){const D=progParse(txt,A),X=D.flatMap(d=>d.x);if(!X.length)return "Un exercice par ligne, avec ses séries × reps. Les jours sur leur propre ligne.";
 const ok=X.filter(x=>x.id).length;return `✅ ${D.length} séance${D.length>1?"s":""}, ${ok} exercice${ok>1?"s":""} reconnu${ok>1?"s":""} sur ${X.length}${ok<X.length?" (les autres seront remplacés)":""}.`}
/* Exercices reconnus à garder : ton coach les place en priorité dans les séances qui les prévoient. */
const progLikes=p=>p.hasProg==="oui"?[...new Set(progParse(p.progTxt,p).flatMap(d=>d.x).filter(x=>x.id&&exOk(x.id,p)).map(x=>x.id))]:[];

/* ================= Analyse ================= */
const UPM=["pecs","lats","dos","arr","ant","lat","bic","tri"],LOWM=["quad","isch","fess","add","moll"],SMALL=["bic","tri","lat","arr","ant","moll","abs"];
const ZMUS={pecs:["pecs"],dos:["lats","dos"],epaules:["arr","ant","lat"],bras:["bic","tri"],jambes:["quad","isch","moll","add"],fessiers:["fess"],abdos:["abs"]};
function weekSets(days){const S={},F={};days.forEach((d,di)=>d.x.forEach(x=>{const m=x.id&&MUSCOF[x.id];if(!m)return;S[m]=(S[m]||0)+x.s;(F[m]=F[m]||new Set).add(di);if(x.id==="hipt"||x.id==="rdl"||x.id==="rdlx"||x.id==="bulg"||x.id==="fentes"){const k=x.id==="hipt"?"isch":"fess";S[k]=(S[k]||0)+x.s*.5;(F[k]=F[k]||new Set).add(di)}}));
 const sum=L=>Math.round(L.reduce((t,m)=>t+(S[m]||0),0));return{S,F,up:sum(UPM),low:sum(LOWM),core:sum(["abs","lomb"])}}
function progAnalyze(p){const D=progParse(p.progTxt,p);if(!D.length)return null;const X=D.flatMap(d=>d.x),W=weekSets(D),tot=W.up+W.low+W.core||1,lowPct=Math.round(W.low/tot*100);
 const good=[],bad=[],ML=k=>MUSC[k][0],zl=(p.prio||[]).filter(k=>ZMUS[k]),zs=k=>Math.round(ZMUS[k].reduce((t,m)=>t+(W.S[m]||0),0)),nMax={45:5,60:6,75:7,90:8}[p.dur]||6;
 if(D.length>=2&&D.length<=6)good.push(`${D.length} séances par semaine : une fréquence qui permet de progresser.`);
 const H=[...new Set(X.filter(x=>x.id&&EX[x.id][3]==="H").map(x=>EX[x.id][0]))];if(H.length)good.push(`De vrais exercices de base : ${H.slice(0,3).join(", ")}.`);
 const inR=X.filter(x=>x.r[0]>=5&&x.r[1]<=15).length;if(inR>=X.length*.7)good.push("Des séries de 5 à 15 répétitions : la bonne zone pour construire du muscle.");
 if(lowPct>=40)good.push(`Le bas du corps a sa place : ${lowPct} % des séries.`);
 const twice=Object.keys(W.F).filter(m=>W.F[m].size>=2&&MUSC[m]).map(ML);if(twice.length&&D.length>=3)good.push(`Travaillés au moins 2 fois par semaine : ${twice.slice(0,4).join(", ")}.`);
 zl.forEach((k,i)=>{const n=zs(k);if(n>=10&&n<=22)good.push(`Ta priorité n°${i+1} (${zoneL(k)}) a déjà un bon volume : ${n} séries par semaine.`)});
 if(!good.length)good.push("Tu t'entraînes déjà avec un plan : le plus dur, la régularité, est en place.");
 const unk=X.filter(x=>!x.id).map(x=>x.raw);if(unk.length)bad.push(["Exercices non reconnus",`${[...new Set(unk)].slice(0,5).join(", ")}${unk.length>5?"…":""} : ton coach les remplace par des équivalents qu'il sait suivre et animer.`]);
 const nok=[...new Set(X.filter(x=>x.id&&!exOk(x.id,p)).map(x=>x.id))];nok.forEach(id=>{const pain=(p.pain||[]).some(z=>EX[id][6].includes(z));bad.push([EX[id][0],pain?"Sollicite la zone que tu as demandé de ménager.":"Demande du matériel que tu n'as pas coché."])});
 D.forEach(d=>{const seen={},per={};d.x.forEach(x=>{if(!x.id)return;seen[x.id]=(seen[x.id]||0)+1;const m=MUSCOF[x.id];per[m]=(per[m]||0)+1});
  Object.keys(seen).filter(id=>seen[id]>1).forEach(id=>bad.push([`Doublon (${esc(d.t)})`,`${EX[id][0]} apparaît ${seen[id]} fois dans la même séance.`]));
  Object.keys(per).filter(m=>MUSC[m]&&per[m]>=3&&SMALL.includes(m)).forEach(m=>bad.push([`Doublon (${esc(d.t)})`,`${per[m]} exercices de ${ML(m)} dans la même séance : au-delà de 2, la fatigue monte sans plus de résultat.`]));
  if(d.x.length>nMax+1)bad.push([`Séance trop longue (${esc(d.t)})`,`${d.x.length} exercices : l'intensité chute en fin de séance. Ton coach en garde ${nMax}.`])});
 const lowNeed=lowFocus(p)?50:35;if(lowPct<lowNeed)bad.push(["Pas assez de bas du corps",`Seulement ${lowPct} % des séries pour les jambes et les fessiers${lowFocus(p)?", alors que c'est ta priorité":""}. Ton coach vise au moins ${lowNeed} %.`]);
 zl.forEach((k,i)=>{const n=zs(k);if(n<10)bad.push([`Priorité n°${i+1} sous-dosée`,`${zoneL(k)} : ${n} séries par semaine. Pour faire progresser une zone prioritaire, il en faut 10 à 20.`])});
 Object.keys(W.S).filter(m=>MUSC[m]&&W.S[m]>22).forEach(m=>bad.push(["Volume déséquilibré",`${Math.round(W.S[m])} séries de ${ML(m)} par semaine : au-delà de 20, tu ne récupères plus et le gain stagne.`]));
 const push=(W.S.pecs||0)+(W.S.ant||0),pull=(W.S.dos||0)+(W.S.lats||0)+(W.S.arr||0);if(push>8&&push>pull*1.5)bad.push(["Plus de poussée que de tirage",`${Math.round(push)} séries de pecs et d'épaules contre ${Math.round(pull)} pour le dos : les épaules finissent par s'enrouler.`]);
 const once=["fess","isch","quad","pecs","dos"].filter(m=>W.F[m]&&W.F[m].size===1);if(D.length>=3&&once.length)bad.push(["Une seule fois par semaine",`${once.map(ML).join(", ")} : travaillés une seule fois. 2 fois par semaine fait mieux progresser.`]);
 if(X.some(x=>x.r[1]>20))bad.push(["Séries trop longues","Au-delà de 20 répétitions, c'est de l'endurance. Ton coach revient à 8–15."]);
 if(X.some(x=>x.r[0]<4)&&!(p.aims||[]).includes("force")&&p.goal!=="force")bad.push(["Séries trop lourdes","Moins de 4 répétitions sans objectif de force : plus de risque que de muscle."]);
 const t=norm(p.progTxt);if(!/echauff|mobilit|etire|stretch/.test(t))bad.push(["Ni échauffement ni étirements","Ton coach ajoute un échauffement ciblé avant chaque séance et des étirements après."]);
 if(!/repos|rest|recup|\d\s*(s|sec|min|')\b/.test(t))bad.push(["Temps de repos non précisés","Chaque exercice a maintenant son repos, selon qu'il est lourd ou d'isolation."]);
 return{D,X,W,lowPct,good,bad}}

/* ================= Garder son propre programme ================= */
const WDRX=/^(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|jour\s*\d+|j\s*\d+|s[ée]ance\s*\d+|day\s*\d+)\s*[:\-–·]?\s*/i;
/* Programme collé → séances gardées telles quelles. Les exercices non reconnus deviennent des exercices perso suivis comme les autres. */
function ownSetup(p){const D=progParse(p.progTxt,p).slice(0,6),ex={};
 p.ownDays=D.map((d,i)=>{let t=d.t.replace(WDRX,"").trim();t=t?t[0].toUpperCase()+t.slice(1):`Séance ${i+1}`;
  return{t,x:d.x.map(x=>{let id=x.id;if(!id){id="u_"+norm(x.raw).replace(/[^a-z0-9]+/g,"_").replace(/^_|_$/g,"").slice(0,24);ex[id]=[x.raw.slice(0,50),"Autre","0","M","","Ton exercice, gardé tel quel. Amplitude complète, descente contrôlée, pas d'élan.",""]}return{id,s:x.s,r:x.r}})}});
 p.ownEx=ex;regOwn(p);return p}
const regOwn=p=>{if(p&&p.ownEx)Object.assign(EX,p.ownEx)};
const ownDaysFor=p=>spreadDays(Math.min(6,Math.max(1,(p.ownDays||[]).length)),p.avail&&p.avail.length>=2?p.avail:WEEK);
/* Fourchette pour la double progression : un nombre fixe de reps devient « reps → reps + 2 ». */
function mkOwn(o,p){const [n,g,,kind,a,c]=EX[o.id],S=SCHEME[p.goal][kind],r=o.r[0]===o.r[1]?[o.r[0],o.r[0]+2]:[o.r[0],o.r[1]];return{id:o.id,n,g,a,c,s:o.s,r,rest:S[3],kind}}
function buildOwn(p){regOwn(p);const days={},L=p.ownDays,ds=[...p.days].sort((a,b)=>(a+6)%7-(b+6)%7);
 ds.forEach((d,i)=>{const k="own"+(i%L.length),O=L[i%L.length],cu=(p.custom||{})[d],own=!!(cu&&cu.k===k);
  const x=own?cu.ids.filter(id=>EX[id]).map(id=>{const o=O.x.find(y=>y.id===id);return o?mkOwn(o,p):mkEx(id,p)}):O.x.map(o=>mkOwn(o,p));
  days[d]={k,t:O.t,f:"Ton programme",x,own}});return days}
const ownTip=e=>{const inc=e.kind==="I"?"1 kg":"2,5 kg",out=[`Teste ta charge à ${e.r[0]} reps avec 2 reps en réserve, monte jusqu'à ${e.r[1]} sur toutes les séries, puis +${inc} et retour à ${e.r[0]}.`];
 if(e.r[1]>20)out.push("Beaucoup de reps : quand ça devient facile, ajoute du poids plutôt que des reps.");if(e.r[0]<4)out.push("Très lourd : garde 1 à 2 reps en réserve, la technique avant la charge.");if(e.s>5)out.push("Beaucoup de séries : si tu stagnes 2 semaines, enlèves-en une.");return out.join(" ")};
function trainList(T,p,tips){return p_days(T).map(d=>{const S=T[d],w=warmList(S),st=stretchList(S);return `<div class="card stack"><div class="lab">${DLONG[d]} · ${esc(S.t)}</div>
  <small class="muted">🔥 Échauffement ${prepMin(w)} min : ${w.map(x=>x.n).join(", ")}</small>
  <ul class="list">${S.x.map(e=>`<li style="flex-wrap:wrap"><span class="sp">${esc(e.n)}${!tips&&(p.likes||[]).includes(e.id)?" ✓":""}</span><b>${e.s} × ${e.r[0]}–${e.r[1]}</b><small class="muted" style="margin-left:8px">${fmtT(e.rest)}</small>${tips?`<small class="muted" style="flex-basis:100%;margin-top:2px">📈 ${ownTip(e)}${e.c?` 🎯 ${esc(e.c)}`:""}</small>`:""}</li>`).join("")}</ul>
  <small class="muted">🧘 Étirements ${prepMin(st)} min : ${st.map(x=>x.n).join(", ")}</small></div>`}).join("")}
const p_days=T=>Object.keys(T).map(Number).sort((a,b)=>(a+6)%7-(b+6)%7);
/* Les deux versions côte à côte : celle du coach et la sienne avec les progressions. */
function coachPreview(p){const c=JSON.parse(JSON.stringify(p));coachDecide(c);c.mode="coach";c.likes=p.likes;return{c,T:buildTraining(c)}}
function ownPreview(p){const c=JSON.parse(JSON.stringify(p));c.mode="own";if(p.mode!=="own"){c.days=ownDaysFor(p);c.custom={}}return{c,T:buildTraining(c)}}
function progCard(p){if(p.hasProg!=="oui"||!p.progTxt||!TRAIN)return "";const R=progAnalyze(p);if(!R)return "";
 const CP=p.mode==="coach"?{c:p,T:TRAIN}:coachPreview(p),OP=p.mode==="own"?{c:p,T:TRAIN}:ownPreview(p);
 const pn=Object.values(CP.T),W2=weekSets(pn.map(s=>({x:s.x.map(e=>({id:e.id,s:e.s}))}))),t2=W2.up+W2.low+W2.core||1,kept=[...new Set(pn.flatMap(s=>s.x.map(e=>e.id)))].filter(id=>(p.likes||[]).includes(id));
 const li=(e,h,s)=>`<li style="display:flex;gap:10px;align-items:flex-start;margin:8px 0"><span>${e}</span><span>${h?`<b>${h}</b><br>`:""}<small class="muted">${s}</small></span></li>`,ul=a=>`<ul style="list-style:none;padding:0;margin:0">${a}</ul>`;
 const analysis=`<div class="card"><b>✅ Ce qui est bien dans ton programme</b>${ul(R.good.map(g=>li("👍","",g)).join(""))}</div>
 ${R.bad.length?`<div class="card"><b>✂️ Ce que le coach changerait, et pourquoi</b>${ul(R.bad.map(([h,s])=>li("⚠️",h,s)).join(""))}</div>`:""}`;
 const coachB=`<div class="card"><b>🔁 La version du coach</b><br><small class="muted">${CP.c.days.length} séances. Bas du corps : ${R.lowPct} % → ${Math.round(W2.low/t2*100)} % des séries.${kept.length?` Gardés de ton programme (✓) : ${kept.map(id=>EX[id][0]).join(", ")}.`:""}</small></div><div class="stack">${trainList(CP.T,p,false)}</div>`;
 const ownB=`<div class="card"><b>📋 Ton programme, avec les progressions</b><br><small class="muted">Tes exercices, tes séries et tes jours restent les mêmes. Ton coach ajoute l'échauffement, les étirements, le repos et la progression : à chaque séance il propose ta charge, et chaque semaine il fait le bilan pour savoir quand augmenter.</small></div><div class="stack">${trainList(OP.T,p,true)}</div>`;
 const det=(s,b)=>`<details class="card" style="margin-top:10px"><summary><b>${s}</b></summary><div class="stack" style="margin-top:10px">${b}</div></details>`;
 if(p.mode==="choose")return `<div class="lab" style="margin-top:18px">Ton programme analysé</div>${analysis}
  <div class="lab" style="margin-top:18px">Compare les deux avant de choisir</div>${det("🔁 Aperçu : la version du coach",coachB)}${det("📋 Aperçu : ton programme avec les progressions",ownB)}`;
 if(p.mode==="own")return `<div class="lab" style="margin-top:18px">Ton programme</div>${ownB}${det("Voir la version proposée par le coach",analysis+coachB+`<button class="btn ghost" id="pick-coach">Passer au programme du coach</button>`)}`;
 return `<div class="lab" style="margin-top:18px">Ton programme analysé</div>${analysis}${coachB}${det("Voir ton programme d'origine avec les progressions",ownB+`<button class="btn ghost" id="pick-own">Revenir à mon programme</button>`)}`}
function pickProg(m){const p=PROF;p.custom={};if(m==="own"){p.mode="own";p.days=ownDaysFor(p)}else{coachDecide(p);p.mode="coach"}p.freq=p.days.length;
 LS.set("coach-profile",p);TRAIN=buildTraining(p);showPlan();toast(m==="own"?"Ton programme est gardé, avec les progressions du coach":"Programme du coach activé")}
document.addEventListener("click",e=>{const t=e.target.closest("#pick-own,#pick-coach");if(t&&PROF)pickProg(t.id==="pick-own"?"own":"coach")});
