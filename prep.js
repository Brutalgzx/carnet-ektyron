/* Échauffement et étirements chronométrés, choisis selon les muscles de la séance.
   d = durée en secondes ; side = un côté puis l'autre (le chrono double, bip au changement). */
const WARM=[
 {n:"Cardio léger",e:"🚲",d:300,c:"Vélo, rameur ou tapis. Tu dois pouvoir parler : tu chauffes, tu ne te fatigues pas.",m:[]},
 {n:"Cercles de bras",e:"🔄",d:30,c:"Bras tendus, petits cercles puis grands, vers l'avant puis vers l'arrière.",m:["ant","lat","arr","pecs"]},
 {n:"Passages d'épaules au bâton",e:"🥢",d:40,c:"Bâton ou élastique, prise large : passe-le de devant à derrière la tête, bras tendus, sans forcer.",m:["ant","lat","pecs","arr"]},
 {n:"Écartés à l'élastique",e:"🎗️",d:30,c:"Bras tendus devant toi, écarte l'élastique jusqu'à la poitrine en serrant les omoplates.",m:["arr","dos","lat"]},
 {n:"Pompes lentes",e:"🙌",d:30,c:"Contre un banc ou au sol, 3 secondes pour descendre. Juste pour réveiller pecs et triceps.",m:["pecs","tri","ant"]},
 {n:"Ouvertures thoraciques",e:"🌀",d:20,side:1,c:"À quatre pattes, main derrière la tête : ouvre le coude vers le plafond en suivant du regard.",m:["dos","lats","pecs"]},
 {n:"Chat-vache",e:"🐈",d:30,c:"À quatre pattes : creuse le dos en inspirant, arrondis-le en soufflant. Lentement.",m:["lomb","dos","abs","lats"]},
 {n:"Rotations poignets et coudes",e:"✋",d:20,c:"Fais tourner poignets et avant-bras dans les deux sens pour préparer les prises.",m:["bic","tri"]},
 {n:"Squats au poids du corps",e:"🏋️",d:40,c:"Descends le plus bas possible en gardant le dos droit et les talons au sol.",m:["quad","fess","add"]},
 {n:"Fentes avec rotation",e:"🚶",d:40,c:"Fente avant, puis tourne le buste vers la jambe de devant. Alterne les côtés.",m:["quad","fess","add","isch"]},
 {n:"Balancements de jambe avant-arrière",e:"🦵",d:20,side:1,c:"Tiens-toi à un support, balance la jambe tendue d'avant en arrière, de plus en plus haut.",m:["isch","fess","quad"]},
 {n:"Balancements de jambe latéraux",e:"↔️",d:20,side:1,c:"Face au support, balance la jambe de gauche à droite devant toi.",m:["add","fess"]},
 {n:"Pont fessier",e:"🌉",d:30,c:"Allongé, pieds au sol : monte le bassin en serrant les fesses, 1 seconde en haut.",m:["fess","isch","lomb"]},
 {n:"Montées sur pointes",e:"🦶",d:30,c:"Monte sur la pointe des pieds, redescends lentement. Sur une marche si possible.",m:["moll"]},
 {n:"Gainage planche",e:"🧱",d:30,c:"Sur les avant-bras, corps bien aligné, ventre et fesses serrés.",m:["abs","lomb"]}];
const STRETCH={
 pecs:{n:"Pecs contre un mur",e:"🧱",d:30,side:1,c:"Avant-bras contre un mur, coude à hauteur d'épaule, tourne doucement le buste à l'opposé."},
 lats:{n:"Dorsaux bras tendus",e:"🙇",d:30,side:1,c:"Attrape un support à hauteur de hanche, recule les fesses et laisse le flanc s'étirer."},
 dos:{n:"Posture de l'enfant",e:"🧎",d:40,c:"À genoux, fesses sur les talons, bras loin devant. Respire dans le dos."},
 arr:{n:"Bras croisé devant la poitrine",e:"🤗",d:30,side:1,c:"Ramène le bras tendu contre la poitrine avec l'autre main, épaule basse."},
 lat:{n:"Bras croisé devant la poitrine",e:"🤗",d:30,side:1,c:"Ramène le bras tendu contre la poitrine avec l'autre main, épaule basse."},
 ant:{n:"Mains jointes derrière le dos",e:"🙆",d:30,c:"Croise les doigts derrière toi, bras tendus, remonte doucement les mains en ouvrant la poitrine."},
 bic:{n:"Biceps contre un mur",e:"💪",d:30,side:1,c:"Paume à plat sur le mur derrière toi, bras tendu, tourne lentement le corps à l'opposé."},
 tri:{n:"Triceps derrière la tête",e:"🤚",d:30,side:1,c:"Main dans le dos par-dessus l'épaule, l'autre main pousse doucement le coude."},
 quad:{n:"Quadriceps debout",e:"🦩",d:30,side:1,c:"Attrape ton pied, talon vers la fesse, genoux serrés, bassin en avant."},
 quad2:{n:"Fente basse (avant de hanche)",e:"🧎‍♂️",d:30,side:1,c:"Un genou au sol, avance le bassin jusqu'à sentir l'avant de la hanche s'étirer."},
 isch:{n:"Ischios jambe tendue",e:"🦵",d:30,side:1,c:"Talon sur un banc, jambe tendue, penche-toi en avant dos droit."},
 fess:{n:"Pigeon",e:"🕊️",d:40,side:1,c:"Jambe avant pliée devant toi au sol, jambe arrière tendue, penche le buste en avant."},
 add:{n:"Papillon assis",e:"🦋",d:40,c:"Assis, plantes de pieds collées, pousse doucement les genoux vers le sol avec les coudes."},
 moll:{n:"Mollet contre un mur",e:"🦶",d:30,side:1,c:"Mains au mur, jambe arrière tendue, talon bien au sol."},
 abs:{n:"Cobra",e:"🐍",d:30,c:"Allongé sur le ventre, pousse sur les mains pour lever le buste, hanches au sol."},
 lomb:{n:"Genoux à la poitrine",e:"🫶",d:30,c:"Allongé sur le dos, serre les genoux contre la poitrine et respire."}};

/* Muscles de la séance, du plus travaillé au moins travaillé */
function prepMus(S){const c={};(S?.x||[]).forEach((e,i)=>{const m=MUSCOF[e.id];if(m)c[m]=(c[m]||0)+e.s+(i<2?1:0)});return Object.keys(c).sort((a,b)=>c[b]-c[a])}
function warmList(S){const mus=prepMus(S),sc=w=>w.m.reduce((t,m)=>t+(mus.includes(m)?3-Math.min(2,mus.indexOf(m)/3):0),0);
 return [WARM[0],...WARM.slice(1).filter(w=>sc(w)>0).sort((a,b)=>sc(b)-sc(a)).slice(0,5)]}
function stretchList(S){const out=[],seen=new Set();for(const m of prepMus(S)){for(const k of m==="quad"?["quad","quad2"]:[m]){const s=STRETCH[k];if(s&&!seen.has(s.n)){seen.add(s.n);out.push(s)}}if(out.length>=6)break}
 if(!out.length)out.push(STRETCH.dos);return out}
const prepDur=L=>L.reduce((t,x)=>t+x.d*(x.side?2:1),0);
const prepMin=L=>Math.max(1,Math.round(prepDur(L)/60));

/* ===== Partie : phases « warm » (avant) et « str » (après) ===== */
let pInt=null;
const pList=()=>G.ph==="warm"?warmList(TRAIN[G.day]):stretchList(TRAIN[G.day]);
function pStartItem(i){const L=pList();G.pi=i;G.pz=0;const it=L[i];G.pTot=it.d*(it.side?2:1);G.pEnd=Date.now()+G.pTot*1000;G.pHalf=0;gSave()}
function pLeave(){clearInterval(pInt);if(G.ph==="warm"){G.ph="set";G.fb="";gSave();gShow()}else{G.ph="done";G.strDone=1;gSave();gShow()}$("#game").scrollTop=0}
function pShow(){clearInterval(gInt);clearInterval(pInt);const L=pList(),i=G.pi||0,it=L[i],nx=L[i+1],warm=G.ph==="warm",run=!!G.pEnd;
 $("#g-in").innerHTML=gTop()+`<div class="lab" style="text-align:center">${warm?"🔥 Échauffement":"🧘 Étirements"} · ${i+1}/${L.length} · ~${prepMin(L)} min</div>
 <h2 class="g-name" style="text-align:center">${it.e} ${it.n}</h2><p class="small muted" style="text-align:center;margin:0 0 6px">${it.c}</p>
 <div class="g-ring"><svg viewBox="0 0 120 120"><circle class="bg" cx="60" cy="60" r="52"/><circle class="fg" id="p-arc" cx="60" cy="60" r="52" stroke-dasharray="326.7" stroke-dashoffset="0"/></svg><b id="p-t" role="timer">${fmtT(it.d*(it.side?2:1))}</b></div>
 <p class="small" id="p-side" style="text-align:center;min-height:1.4em;margin:0 0 8px;color:var(--warn)">${it.side?"Côté gauche puis côté droit":""}</p>
 <div class="g-adj"><button id="p-pz" aria-label="Pause">${run?(G.pz?"▶":"⏸"):"⏸"}</button><button id="p-go" style="font:800 20px var(--display);text-transform:uppercase;background:var(--grad);border:0;color:#fff">${run?"Suivant ⏭":"Démarrer"}</button><button id="p-skip" style="font:600 13px var(--mono)">Passer</button></div>
 ${nx?`<div class="g-next"><small>Ensuite</small><b>${nx.e} ${nx.n}</b><span>${fmtT(nx.d*(nx.side?2:1))}${nx.side?" · 2 côtés":""}</span></div>`:""}
 ${warm&&!nx?`<div class="coachmsg">Ensuite : 1 à 2 séries d'approche légères sur ton premier exercice avant les vraies séries.</div>`:""}
 <button class="link" id="p-all">${warm?"Je suis déjà chaud : passer l'échauffement":"Passer les étirements"}</button>`;
 if(run){pInt=setInterval(pTick,200);pTick()}}
function pTick(){if(!G||(G.ph!=="warm"&&G.ph!=="str")||!G.pEnd)return;const L=pList(),it=L[G.pi];
 const ms=G.pz?G.pz:G.pEnd-Date.now(),left=Math.ceil(ms/1000),t=$("#p-t"),arc=$("#p-arc"),sd=$("#p-side");
 if(ms<=0){clearInterval(pInt);beep(1175,.35);try{navigator.vibrate&&navigator.vibrate(300)}catch(e){}
  if(G.pi+1<L.length){pStartItem(G.pi+1);pShow()}else pLeave();return}
 if(t)t.textContent=fmtT(left)+(G.pz?" ⏸":"");if(arc)arc.setAttribute("stroke-dashoffset",(326.7*(1-ms/(G.pTot*1000))).toFixed(1));
 if(it.side){const half=ms<=it.d*1000;if(sd)sd.textContent=half?"Côté droit":"Côté gauche";if(half&&!G.pHalf&&!G.pz){G.pHalf=1;gSave();beep(988,.25);beep(988,.25,.3);try{navigator.vibrate&&navigator.vibrate([200,100,200])}catch(e){}}}
 if(!G.pz&&left<=3&&left!==pTick.l){pTick.l=left;beep(880,.1)}}

{const start=gStart,show=gShow,close=gClose;
 gStart=function(day){start(day);if(!G)return;G.ph="warm";G.pi=0;G.pEnd=0;gSave();gShow()};
 gShow=function(){if(G&&G.ph==="done"&&!G.strDone&&!G.saved){G.ph="str";G.pi=0;G.pEnd=0;gSave()}
  if(G&&(G.ph==="warm"||G.ph==="str"))return pShow();clearInterval(pInt);show()};
 gClose=function(){clearInterval(pInt);close()}}
document.addEventListener("click",e=>{const t=e.target.closest("button");if(!t||!G||(G.ph!=="warm"&&G.ph!=="str"))return;
 if(t.id==="p-go"){if(!G.pEnd){pStartItem(G.pi||0);pShow()}else if(G.pi+1<pList().length){pStartItem(G.pi+1);pShow()}else pLeave()}
 else if(t.id==="p-skip"){if(G.pi+1<pList().length){G.pi++;G.pEnd=0;G.pz=0;gSave();pShow()}else pLeave()}
 else if(t.id==="p-pz"&&G.pEnd){if(G.pz){G.pEnd=Date.now()+G.pz;G.pz=0}else G.pz=Math.max(500,G.pEnd-Date.now());gSave();pShow()}
 else if(t.id==="p-all")pLeave()});

/* Aperçu dans l'onglet Séance */
{const vt=vTrain;vTrain=function(){let h=vt();const S=TRAIN[selDay];if(!S?.x?.length)return h;
 const li=L=>L.map(x=>`<li><span class="sp">${x.e} ${x.n}${x.side?" <small class=\"muted\">(2 côtés)</small>":""}</span><b class="mono">${fmtT(x.d)}</b></li>`).join(""),W=warmList(S),T=stretchList(S);
 const card=(ic,t,L,note)=>`<details class="card"><summary style="cursor:pointer"><b>${ic} ${t}</b> <span class="small muted">· ~${prepMin(L)} min · ${L.length} mouvements</span></summary><ul class="list" style="margin-top:8px">${li(L)}</ul>${note?`<p class="small muted" style="margin:6px 0 0">${note}</p>`:""}</details>`;
 const a=h.indexOf('<article class="ex">'),z=h.lastIndexOf("</article>");if(a<0)return h;
 h=h.slice(0,a)+card("🔥","Échauffement",W,"Chronométré dans la séance. Puis 1 à 2 séries d'approche légères sur le premier exercice.")+h.slice(a);
 const z2=h.lastIndexOf("</article>")+10;return h.slice(0,z2)+card("🧘","Étirements",T,"À la fin, chronométrés aussi. Doux, sans à-coups, en respirant.")+h.slice(z2)}}
