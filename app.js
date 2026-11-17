"use strict";
/* ================= Outils ================= */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const LS={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}},del(k){try{localStorage.removeItem(k)}catch(e){}}};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const DN=["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"], DLONG=["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"], WEEK=[1,2,3,4,5,6,0];
const fr=(n,d=0)=>Number(n).toLocaleString("fr-FR",{minimumFractionDigits:d,maximumFractionDigits:d});
const eur=n=>fr(n,2)+" €";
const fmtT=s=>`${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
const todayKey=()=>new Date().toISOString().slice(0,10);
const DAY=864e5;
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

/* ================= État ================= */
let PROF=LS.get("coach-profile",null), store=LS.get("carnet",{}), TRAIN=null, view="today", selDay=new Date().getDay(), nutDay=null, nutTab="week";
const persist=()=>LS.set("carnet",store);
/* XP toujours recalculée depuis les séances présentes (même formule que gStats) : une séance supprimée retire son XP. */
const xpProf=()=>{const X=LS.get("carnet-xp",{xp:0,games:[]});X.games=X.games||[];X.xp=X.games.reduce((a,g)=>a+Math.round((g.vol||0)/10)+50,0);return X};
function level(xp){const l=Math.floor(Math.sqrt(xp/100))+1,a=(l-1)*(l-1)*100,b=l*l*100;return{l,pct:Math.round((xp-a)/(b-a)*100),left:b-xp}}
function weekGames(){const n=new Date(),m=new Date(n.getFullYear(),n.getMonth(),n.getDate()-((n.getDay()+6)%7)).getTime();return xpProf().games.filter(g=>g.t>=m).length}

/* ================= Programme d'entraînement ================= */
const SCHEME={masse:{H:[3,6,10,180],M:[3,8,12,150],I:[3,10,15,90]},force:{H:[4,4,6,210],M:[3,6,8,180],I:[3,8,12,90]},
 seche:{H:[3,8,12,150],M:[3,8,12,120],I:[3,12,15,60]},recompo:{H:[3,6,10,150],M:[3,8,12,120],I:[3,10,15,75]}};
function exOk(id,p){const e=EX[id],eq=(p.equip||"")+"0";return [...e[2]].every(c=>eq.includes(c))&&!(p.pain||[]).some(z=>e[6].includes(z))}
function mkEx(id,p){const [n,g,,kind,a,c]=EX[id],S=SCHEME[p.goal][kind];let s=S[0];if(p.level==="deb"&&kind==="I")s=2;if(p.level==="av"&&kind!=="I")s++;const pr=prioRank(id,p);if(pr===0||pr===1)s=Math.min(5,s+1);let r=[S[1],S[2]],rest=S[3];const am=p.aims||[];
 if(am.includes("force")&&p.goal!=="force"&&kind==="H"){r=[5,8];rest=Math.max(rest,180)}if(am.includes("gras")&&p.goal!=="seche"&&kind!=="H")rest=Math.max(60,rest-30);
 return{id,n:(p.names||{})[id]||n,g,a,c,s,r,rest,kind}}
const PRIOG={pecs:"Pecs",dos:"Dos",epaules:"Épaules",bras:"Bras",jambes:"Jambes",abdos:"Abdos",trapezes:"Trapèzes"},GLUTE=["hipt","pont","bulg","rdl","rdlx","fentes"];
const isPrio=(id,p)=>(p.prio||[]).some(k=>k==="fessiers"?GLUTE.includes(id):EX[id][1]===PRIOG[k]);
const splitOf=p=>p.split&&p.split!=="auto"&&CYC[p.split]?p.split:lowFocus(p)&&p.days.length>=3?"bas":AUTO[p.days.length]||"full";
function seqFor(p){const ds=[...p.days].sort((a,b)=>(a+6)%7-(b+6)%7),c=CYC[splitOf(p)];return ds.map((d,i)=>[d,c[i%c.length]])}
const splitName=p=>p.mode==="own"?"Ton programme":SPLITS.find(x=>x.v===splitOf(p)).l;
/* Séance proposée par le coach, ou séance modifiée par l'utilisateur (gardée tant que le type de séance ne change pas). */
function buildTraining(p){if(p.mode==="own"&&p.ownDays&&p.ownDays.length)return buildOwn(p);const days={},nMax={45:5,60:6,75:7,90:8}[p.dur]||6;
 for(const [d,k] of seqFor(p)){const T=TPL[k],cu=(p.custom||{})[d],own=!!(cu&&cu.k===k);let ids;
  if(own)ids=cu.ids.filter(i=>EX[i]&&exOk(i,p));
  else{ids=pickSlots(k,p,nMax);if(!zoneList(p).length)ids.sort((a,b)=>isPrio(b,p)-isPrio(a,p))}
  days[d]={k,t:T.t,f:T.f,x:ids.map(i=>mkEx(i,p)),own}}
 return days}
function migrate(p){if(!p)return p;
 /* Romy : son profil refait le 16/11 avait perdu son poids visé (50 kg en 4 mois, dernière sauvegarde du 15/11). Remis une seule fois. */
 if(!p.fx1&&p.sex==="f"&&p.h===154&&p.age===25&&/^rom/i.test(p.name||"")&&p.tw==null){p.tw=50;p.twg="recompo";p.months=4;p.fx1=1}
regOwn(p);if(!p.mode)p.mode="coach";const old={full:"mcshldbxp",small:"dbxpc",home:"db",bw:""};
 if(p.equip==null){p.equip=old[p.gym]??"mcdbxp";if(p.gym==="full"||p.gym==="small")p.gym="autre"}
 if(!p.days)p.days=SPLIT[p.freq].map(x=>x[0]);if(!p.split)p.split="auto";if(!p.prio)p.prio=[];p.prio=p.prio.filter(k=>k!=="none");if(!p.aims)p.aims=[];if(!p.likes)p.likes=[];if(p.hasProg==null)p.hasProg="non";p.freq=p.days.length;if(!p.rec){p.rec=p.days.length;p.recDur=p.dur}if(!p.months)p.months=6;if(!p.stores&&p.store)p.stores=[p.store];if(p.refined==null)p.refined=p.store?{equip:1,food:1,taste:1}:{};if(p.refined.nut==null){const e=LS.get("coach-eaten",{}),sh=LS.get("coach-shop",{}),kj=LS.get("coach-kadj",null);p.refined.nut=p.refined.food||p.refined.taste||(e&&Object.keys(e).length)||(sh&&Object.keys(sh).length)||kj?1:0}for(const k in QDEF)if(p[k]==null||p[k]==="")p[k]=QDEF[k];
 /* v2 : programme collé relu avec le nouveau lecteur (noms sans poids, nouveaux exercices animés). L'historique suit l'exercice. */
 if(p.hasProg==="oui"&&(p.mode==="own"||p.mode==="choose")&&p.progTxt&&(p.ownV||0)<6){if(!p.progKeep)p.progKeep="tel";
  const old=JSON.parse(JSON.stringify(p.ownDays||[])),oldEx={...EX,...(p.ownEx||{})},bd=JSON.stringify(p.days),wd=/lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche/i;
  ownSetup(p);
  try{const st=LS.get("carnet",{});let ch=0;p.ownDays.forEach((d,i)=>{const ol=old[i]?old[i].x.filter(o=>!wd.test((oldEx[o.id]||[""])[0])):[];
   d.x.forEach((x,j)=>{const o=ol[j];if(o&&o.id!==x.id&&st[o.id]&&!st[x.id]){st[x.id]=st[o.id];ch=1}})});if(ch)LS.set("carnet",st)}catch(e){}
  const nd=ownDaysFor(p);if(JSON.stringify(nd)!==bd){p.days=nd;p.freq=nd.length}p.custom={};p.ownV=6}
 return p}
const sessMin=s=>Math.round(s.x.reduce((m,e)=>m+e.s*(0.75+e.rest/60),0)+8);

/* ================= Nutrition ================= */
function curWeight(){const W=LS.get("coach-weights",[]);return W.length?W[W.length-1].kg:PROF.w}
function targets(){const p=PROF,w=curWeight();
 const bmr=10*w+6.25*p.h-5*p.age+(p.sex==="f"?-161:5), act={low:1.3,mid:1.45,high:1.6}[p.act]+0.035*p.freq, tdee=bmr*act;
 const adj=goalAdj(p)+LS.get("coach-kadj",0);
 const kcal=Math.max(Math.round(bmr*1.1/10)*10,Math.round((tdee+adj)/10)*10);
 const pr=Math.round(w*(p.goal==="seche"?2.2:2)),fat=Math.round(w*(p.goal==="seche"?.8:.9)),carb=Math.max(60,Math.round((kcal-pr*4-fat*9)/4));
 return{bmr:Math.round(bmr),tdee:Math.round(tdee),kcal,p:pr,f:fat,c:carb}}
const MEALS3=[["pdj","Petit-déjeuner",.25],["dej","Déjeuner",.4],["din","Dîner",.35]];
const MEALS4=[["pdj","Petit-déjeuner",.22],["dej","Déjeuner",.33],["snack","Collation",.15],["din","Dîner",.3]];
const MEALK=["pdj","dej","snack","din"];
/* Repas pris dans la journée (mealSel). Profils plus anciens : déduits de « meals » (4 → tous, sinon les 3 principaux). Les parts sont recalculées sur les repas gardés pour que la journée atteigne toujours l'objectif. */
const mealsOf=p=>p&&Array.isArray(p.mealSel)&&p.mealSel.length?MEALK.filter(k=>p.mealSel.includes(k)):p&&p.meals===4?[...MEALK]:["pdj","dej","din"];
const mealSlots=()=>{const s=mealsOf(PROF);if(s.join()==="pdj,dej,din")return MEALS3;const L=MEALS4.filter(x=>s.includes(x[0])),t=L.reduce((a,x)=>a+x[2],0);return L.map(([k,l,f])=>[k,l,f/t])};
const RECI=Object.fromEntries(REC.map(r=>[r.id,r]));
const RM={};
function rmac(r){if(RM[r.id])return RM[r.id];let k=0,P=0,C=0,F=0,e=0;for(const [i,g] of r.i){const d=ING[i];k+=d[1]*g/100;P+=d[2]*g/100;C+=d[3]*g/100;F+=d[4]*g/100;e+=ppk(i).e*g/1000}return RM[r.id]={k,P,C,F,e}}
/* Choix des plats selon l'objectif : part de protéines (pd) et calories par gramme (ed). Sèche → plats protéinés et rassasiants ; masse → plats plus denses, plus faciles à finir. */
function goalScore(r){const m=rmac(r),g=r.i.reduce((t,x)=>t+x[1],0)||1,pd=m.P*4/(m.k||1),ed=m.k/g,G=PROF.goal;
 return G==="seche"?(pd-.25)*9-Math.max(0,ed-1.6)*1.2:G==="recompo"?(pd-.25)*6-Math.max(0,ed-2)*.6:G==="masse"?(ed-1.5)*.8+(pd-.2)*3:G==="force"?(ed-1.5)*.5+(pd-.2)*3:0}
const dietOk=r=>PROF.diet==="vege"?r.v==="vege":PROF.diet==="pesco"?r.v!=="omni":true;
const PG=new Set(["poulet","dinde","boeuf","thon","saumon","oeuf","tofu","fblanc","skyr","whey","porc","jambon","cabil","cottage","crevette","truite","saumfume","sardine"]),CG=new Set(["riz","pates","semoule","avoine","painc","wrap","painb","pdt","patd","banane","pomme","miel","lentilles","poischi","harico","mais","frouges","lait","galriz","quinoa","nouilles","bveg","farine","farriz","sarrasin","feuilriz","cornfl","butternut","dattes","mangue","ananas","peche","gnocchi","pinsa","udon","panko","maizena","cremriz"]);
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
/* Portions : on ajuste séparément les aliments protéinés et les féculents pour viser à la fois les calories et les protéines du repas. */
/* Compléments du jour (PROF.supp = {id: portions par jour}, PROF.suppX = produits ajoutés à la main) : comptés dans la journée, les repas laissent la place. */
function supList(){const S=PROF.supp||{},all=[...SUP,...(PROF.suppX||[])];return all.filter(x=>S[x.id]>0).map(x=>({...x,q:S[x.id]}))}
function supTot(){return supList().reduce((a,x)=>({k:a.k+x.k*x.q,P:a.P+x.P*x.q,C:a.C+(x.C||0)*x.q,F:a.F+(x.F||0)*x.q,e:a.e+(x.eur||0)*x.q}),{k:0,P:0,C:0,F:0,e:0})}
function portion(rid,slot,ex){let T=targets(),sl=mealSlots().find(s=>s[0]===slot)||MEALS4.find(s=>s[0]===slot)||[slot,"",.3],r=RECI[rid],St=supTot(),K=Math.max(T.kcal*.6,T.kcal-St.k)*sl[2],Pt=Math.max(T.p*.4,T.p-St.P)*sl[2];if(ex){K+=ex.k;Pt+=ex.P}
 const a={k:0,P:0},b={k:0,P:0},c={k:0,P:0};for(const [i,g] of r.i){const d=ING[i],x=PG.has(i)?a:CG.has(i)?b:c;x.k+=d[1]*g/100;x.P+=d[2]*g/100}
 let fp=1,fc=1;const det=a.P*b.k-b.P*a.k;
 if(a.k&&b.k&&Math.abs(det)>1e-6){fp=((Pt-c.P)*b.k-b.P*(K-c.k))/det;fc=(a.P*(K-c.k)-(Pt-c.P)*a.k)/det;fp=clamp(fp,.6,ex&&ex.P>0?2.6:2);fc=clamp(fc,.4,3.2);fc=clamp((K-c.k-a.k*fp)/b.k,.4,3.2)}
 else if(a.k){fp=clamp((K-c.k-b.k)/a.k,.6,2.4)}else if(b.k){fc=clamp((K-c.k)/b.k,.5,3)}
 fp=Math.round(fp*20)/20;fc=Math.round(fc*20)/20;const fi=i=>PG.has(i)?fp:CG.has(i)?fc:1;
 let k=0,P=0,C=0,F=0,e=0;for(const [i,g] of r.i){const d=ING[i],q=g*fi(i);k+=d[1]*q/100;P+=d[2]*q/100;C+=d[3]*q/100;F+=d[4]*q/100;e+=ppk(i).e*q/1000}
 return{r,fi,f:1,k,P,C,F,e}}
/* Goûts : allergies exclues d'office, aliments refusés et recettes « je n'aime pas » écartés tant qu'il reste du choix, aliments aimés favorisés. */
const TF=Object.fromEntries([...TASTE.P,...TASTE.C,...TASTE.L].map(o=>[o.v,o.i])),AF=Object.fromEntries(ALLERG.map(o=>[o.v,o.i||[]]));
const has=(r,ids)=>r.i.some(([i])=>ids.includes(i));
/* Allergies écrites à la main : mots reconnus dans les noms d'ingrédients, plus quelques synonymes. */
const nrm=s=>String(s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
function allergIng(txt){const out=new Set(),syn={arachide:["cacah"],cacahuete:["cacah"],noix:["amandes","cacah"],coque:["amandes","cacah"],amande:["amandes"],ble:AF.gluten,gluten:AF.gluten,lactose:AF.lactose,lait:AF.lactose,laitier:AF.lactose,oeuf:["oeuf"],poisson:AF.poisson,soja:AF.soja,pomme:["pomme"]};
 for(const w of nrm(txt).split(/[^a-z]+/).filter(w=>w.length>=3).map(w=>w.replace(/s$/,""))){if(syn[w]){syn[w].forEach(i=>out.add(i));continue}
  for(const [id,d] of Object.entries(ING))if(nrm(d[0]).split(/[^a-z]+/).some(x=>x.length>=4&&(x.replace(/s$/,"")===w||(w.length>=5&&x.startsWith(w)))))out.add(id)}return [...out]}
const allergHint=t=>{const ids=allergIng(t);return !nrm(t).trim()?"Écris tout aliment précis à éviter : ton coach l'exclut de toutes tes recettes.":ids.length?`Exclus de tes recettes : <b>${ids.map(i=>esc(ING[i][0])).join(", ")}</b>.`:"Aucune de nos recettes n'en contient. Vérifie quand même toujours les étiquettes."};
/* Recettes compatibles (régime + allergies), et plats choisis par l'utilisateur (liste ou swipe) : PROF.pick, PROF.pickOnly. */
/* Aliments refusés (« je n'aime pas » dans les goûts) : exclus d'office, comme une allergie, de toutes les recettes (semaine, remplacements, choix des plats). */
function safeRec(m){const p=PROF,al=[...(p.allerg||[]).flatMap(a=>AF[a]||[]),...allergIng(p.allergTxt),...hateIng()];return REC.filter(r=>r.m===m&&dietOk(r)&&!has(r,al))}
const isPick=r=>(PROF.pick||[]).includes(r.id);
const hateIng=()=>{const t=PROF.taste||{};return Object.keys(t).filter(k=>t[k]<0).flatMap(k=>TF[k]||[])};
function pool(m){const p=PROF,hate=hateIng(),ok=r=>!has(r,hate),no=p.nope||[];
 const base=REC.filter(r=>r.m===m&&dietOk(r)),safe=safeRec(m);
 let c=safe.filter(r=>!no.includes(r.id)&&!(p.spice===0&&r.hot>1));
 if(c.length<2)c=safe.filter(r=>!no.includes(r.id));if(c.length<2)c=safe;if(!c.length)c=base.filter(ok);if(!c.length)c=base;
 const mine=safe.filter(r=>isPick(r)&&!no.includes(r.id)&&ok(r));if(!mine.length)return c;
 return p.pickOnly?mine:[...mine,...c.filter(r=>!mine.includes(r))]}
function tasteScore(r){const p=PROF,t=p.taste||{};let s=0;for(const k in t)if(t[k]>0&&has(r,TF[k]||[]))s+=.5;
 if((p.cuis||[]).includes(r.cu))s+=.6;if(r.m==="pdj"&&(p.pdjT==="sucre"||p.pdjT==="sale"))s+=r.sw===p.pdjT?1.2:-1.2;
 if(r.m==="main"&&p.ckt&&p.batch!=="oui"&&r.min>p.ckt)s-=(r.min-p.ckt)/10;if(r.hot)s+=p.spice===2?.4*r.hot:p.spice===0?-.8:0;return s}
function genWeek(seed){const g0=GL;GL=gAuto();for(const k in RM)delete RM[k];try{return genWeek0(seed)}finally{GL=g0;for(const k in RM)delete RM[k]}}
function genWeek0(seed){const R=rng(seed),T=targets(),slots=mealSlots(),B=PROF.budget/(7*slots.length);
 const pick=(m,n,styled)=>{let c=pool(m);if(styled&&PROF.styles.length&&!c.some(isPick)){const s=c.filter(r=>PROF.styles.includes(r.st));if(s.length>=4)c=s;else c=[...s,...c.filter(r=>!s.includes(r))].slice(0,Math.max(6,s.length))}
  const sl=slots.find(x=>x[0]===(m==="main"?"din":m))||slots.find(x=>x[0]==="dej")||["snack","",.15],sc=c.map(r=>{const mm=rmac(r),cost=mm.e*(T.kcal*sl[2]/mm.k);return{r,s:R()-Math.max(0,cost/B-.9)*4+tasteScore(r)+goalScore(r)+(isPick(r)?2.5+mm.P*4/mm.k*3:0)}}).sort((a,b)=>b.s-a.s);
  const out=[];for(let i=0;out.length<n;i++)out.push(sc[i%sc.length].r.id);return out};
 const pdj=pick("pdj",2),snk=pick("snack",2),days=[];
 if(PROF.batch==="oui"){const M=pick("main",4,true);/* 2 plats cuisinés le dimanche pour lun–mer, 2 le mercredi soir pour jeu–dim */
  for(let i=0;i<7;i++){const [a,b]=i<3?[M[0],M[1]]:[M[2],M[3]],sw=i%2;days.push({pdj:pdj[i%2],snack:snk[i%2],dej:sw?b:a,din:sw?a:b,bt:1})}}
 else{const dinners=pick("main",8,true);for(let i=0;i<7;i++)days.push({pdj:pdj[i%2],snack:snk[i%2],din:dinners[i],dej:i===0?dinners[7]:dinners[i-1],left:i>0})}
 return{seed,days}}
/* « Je n'aime pas » : la recette est exclue pour de bon et remplacée partout dans la semaine. */
function dislike(rid){const r=RECI[rid];PROF.nope=[...new Set([...(PROF.nope||[]),rid])];LS.set("coach-profile",PROF);
 const W=week(),used=new Set(W.days.flatMap(d=>[d.pdj,d.dej,d.din,d.snack])),R=rng(Date.now()%1e9);
 const c=pool(r.m).filter(x=>x.id!==rid).map(x=>({x,s:R()*.5+tasteScore(x)-(used.has(x.id)?2:0)})).sort((a,b)=>b.s-a.s),nw=c.length?c[0].x:null;
 if(nw)for(const d of W.days)for(const k of ["pdj","dej","din","snack"])if(d[k]===rid)d[k]=nw.id;LS.set("coach-week",W);return nw}
/* « Remplacer » : change ce plat ce jour-là et à ce repas-là seulement, sans l'exclure. */
function swapMeal(rid,slot,day){const r=RECI[rid],W=week(),D=W.days[wIdx(+day)];if(!r||!D||D[slot]!==rid)return null;
 const used=new Set(W.days.flatMap(d=>[d.pdj,d.dej,d.din,d.snack])),R=rng(Date.now()%1e9);
 const c=pool(r.m).filter(x=>x.id!==rid).map(x=>({x,s:R()*.5+tasteScore(x)-(used.has(x.id)?2:0)})).sort((a,b)=>b.s-a.s),nw=c.length?c[0].x:null;
 if(nw){D[slot]=nw.id;LS.set("coach-week",W);LS.set("coach-shop",{})}return nw}
const hateN=W=>{const h=hateIng();return h.length?W.days.reduce((a,d)=>a+["pdj","dej","din","snack"].filter(k=>RECI[d[k]]&&has(RECI[d[k]],h)).length,0):0};
function week(){let W=LS.get("coach-week",null);if(!W||W.v!==2){W={...genWeek(Date.now()%1e9),v:2,hc:2};LS.set("coach-week",W)}
 /* Semaines déjà enregistrées : si un plat contient un aliment refusé, on recompose une fois (si ça fait mieux). */
 else if(W.hc!==2){const n=hateN(W);if(n){const N={...genWeek(Date.now()%1e9),v:2};if(hateN(N)<n){W=N;LS.set("coach-shop",{})}}W.hc=2;LS.set("coach-week",W)}return W}
const wIdx=d=>(d+6)%7;
/* Les portions ont des limites : ce qu'un repas ne peut pas absorber est reporté sur les autres, pour que la journée atteigne ses calories et ses protéines. */
function dayMeals(d){const D=week().days[wIdx(d)],S=mealSlots(),T=targets(),St=supTot(),gk=Math.max(T.kcal*.6,T.kcal-St.k),gp=Math.max(T.p*.4,T.p-St.P),ex={};let M,best,bE=1/0;
 for(let it=0;it<8;it++){M=S.map(([k,l])=>({slot:k,l,...portion(D[k],k,ex[k]),left:k==="dej"&&D.left,bt:k!=="pdj"&&k!=="snack"&&D.bt}));
  const dk=gk-M.reduce((a,m)=>a+m.k,0),dp=gp-M.reduce((a,m)=>a+m.P,0),er=Math.abs(dk)/gk+Math.abs(dp)/gp;if(er<bE){bE=er;best=M}if(Math.abs(dk)<gk*.02&&Math.abs(dp)<gp*.03)break;
  S.forEach(([k,,f])=>{const e=ex[k]||{k:0,P:0};ex[k]={k:e.k+dk*f,P:e.P+dp*f}})}return best}
function weekCost(){let t=supTot().e*7;for(const d of WEEK)for(const m of dayMeals(d))t+=m.e;return t}
function shopping(){const tot={};for(const d of WEEK)for(const m of dayMeals(d))for(const [i,g] of m.r.i)tot[i]=(tot[i]||0)+g*m.fi(i);
 const by={};for(const i in tot){const g=tot[i],ry=ingRay(i);(by[ry]=by[ry]||[]).push({i,n:ingName(i),tag:ingTag(i),pk:ppk(i).e,g,q:i==="oeuf"?`${Math.ceil(g/60)} œufs`:i==="lait"?`${fr(Math.ceil(g/250)/4,2)} L`:g>=1000?`${fr(Math.ceil(g/100)/10,1)} kg`:`${Math.ceil(g/50)*50} g`,e:g/1000*ppk(i).e,st:ppk(i).v})}
 for(const x of supList())(by["Compléments"]=by["Compléments"]||[]).push({i:"sup_"+x.id,n:x.n,tag:x.u,u:`${fr(x.eur||0,2)} € la portion`,g:0,q:`${fr(x.q*7)} × ${x.u.replace(/^(dose|bouteille|pot|barre|cookie|sachet|portion|cuillère) de /,"")}`,e:(x.eur||0)*x.q*7});
 return by}

/* ================= Suivi du poids et ajustement ================= */
function coachAdjust(){const W=LS.get("coach-weights",[]);if(W.length<2)return null;const last=W[W.length-1],ref=[...W].reverse().find(x=>last.t-x.t>=6*DAY);if(!ref)return null;
 const rate=(last.kg-ref.kg)/((last.t-ref.t)/(7*DAY)),g=PROF.goal,r=`${rate>0?"+":""}${fr(rate,2)} kg par semaine`;let d=0,m;
 if(g==="masse"||g==="force"){if(rate<.15){d=150;m=`Tu évolues à ${r} : c'est trop lent pour construire du muscle. J'ajoute 150 kcal par jour.`}else if(rate>.6){d=-100;m=`Tu prends ${r} : un peu trop vite, ça risque d'être du gras. Je retire 100 kcal par jour.`}else m=`Tu prends ${r} : c'est le bon rythme. On garde le cap.`}
 else if(g==="seche"){if(rate>-.25){d=-150;m=`Tu évolues à ${r} : la sèche avance trop lentement. Je retire 150 kcal par jour.`}else if(rate<-1){d=100;m=`Tu perds ${r} : trop vite, tu risques de perdre du muscle. J'ajoute 100 kcal par jour.`}else m=`Tu perds ${r} : rythme idéal pour garder ton muscle.`}
 else{if(rate>.3){d=-100;m=`Tu prends ${r} : trop pour une recomposition. Je retire 100 kcal.`}else if(rate<-.5){d=100;m=`Tu perds ${r} : trop vite. J'ajoute 100 kcal.`}else m=`Ton poids est stable (${r}) : parfait pour une recomposition. Juge plutôt au miroir et aux charges.`}
 if(d){if(last.t-LS.get("coach-kadj-t",0)>=6*DAY){LS.set("coach-kadj",LS.get("coach-kadj",0)+d);LS.set("coach-kadj-t",last.t)}else{m+=" Ajustement déjà fait cette semaine, on réévalue à la prochaine pesée.";}}
 return m}

/* ================= Questionnaire ================= */
let A=null, obI=0;
const GOALS=[{v:"masse",e:"💪",l:"Prendre du muscle",s:"Prise de masse propre"},{v:"seche",e:"🔥",l:"Perdre du gras",s:"Sèche en gardant ton muscle"},{v:"recompo",e:"⚖️",l:"Les deux à la fois",s:"Recomposition : moins de gras, plus de muscle"},{v:"force",e:"🏋️",l:"Gagner en force",s:"Charges lourdes, moins de reps"}];
const LEVELS=[{v:"deb",e:"🌱",l:"Débutant",s:"Moins de 6 mois de muscu"},{v:"int",e:"📈",l:"Intermédiaire",s:"6 mois à 2 ans"},{v:"av",e:"🦾",l:"Confirmé",s:"Plus de 2 ans, régulier"}];
const PAINS=[{v:"none",e:"✅",l:"Aucune"},{v:"w",e:"✋",l:"Poignet"},{v:"s",e:"🦴",l:"Épaule"},{v:"k",e:"🦵",l:"Genou"},{v:"b",e:"🔙",l:"Bas du dos"}];
const ACTS=[{v:"low",e:"🪑",l:"Plutôt assis",s:"Bureau, études, peu de marche"},{v:"mid",e:"🚶",l:"Souvent debout",s:"Je marche ou je bouge une partie de la journée"},{v:"high",e:"🏗️",l:"Très actif",s:"Métier physique, beaucoup de pas"}];
const DIETS=[{v:"omni",e:"🍗",l:"Je mange de tout"},{v:"pesco",e:"🐟",l:"Pas de viande, mais du poisson"},{v:"vege",e:"🥦",l:"Végétarien"}];
const opts=(key,list,multi)=>`<div class="opts">${list.map(o=>`<button class="opt" data-${multi?"m":"o"}="${key}" data-v="${o.v}" aria-pressed="${multi?(A[key]||[]).includes(o.v)||(o.v==="none"&&!(A[key]||[]).length):A[key]===o.v}"><span class="e">${o.e}</span><span><b>${o.l}</b>${o.s?`<small>${o.s}</small>`:""}</span></button>`).join("")}</div>`;
const slider=(key,label,min,max,step,unit)=>`<div class="sl"><div class="row"><label for="s-${key}" class="sp">${label}</label><b id="v-${key}">${fr(A[key],step<1?1:0)} ${unit}</b></div><input type="range" id="s-${key}" data-s="${key}" data-u="${unit}" min="${min}" max="${max}" step="${step}" value="${A[key]}"></div>`;
/* Goûts : touche une fois = j'adore, deux fois = jamais, trois fois = neutre. */
const tri=list=>`<div class="grid2">${list.map(o=>{const v=(A.taste||{})[o.v]||0;return `<button class="tile" data-t="${o.v}" aria-pressed="${v!==0}"${v<0?' style="opacity:.6"':""}><span class="e">${o.e}</span><b>${o.l}</b><small>${v>0?"❤️ J'adore":v<0?"🚫 Jamais":"Neutre"}</small></button>`}).join("")}</div>`;
const GOUTS=[
 {t:"Les protéines",s:"Touche une fois : tu adores ❤️. Deux fois : jamais 🚫. Ton coach compose tes repas avec ce que tu aimes.",h:()=>tri(TASTE.P),ok:()=>true},
 {t:"Les féculents",s:"Même principe : ❤️ tu adores, 🚫 jamais.",h:()=>tri(TASTE.C),ok:()=>true},
 {t:"Les légumes",s:"Un 🚫 sur ceux que tu ne supportes pas, un ❤️ sur ceux que tu adores.",h:()=>tri(TASTE.L),ok:()=>true},
 {t:"Allergies ou intolérances ?",s:"Les recettes qui en contiennent sont exclues, sans exception.",h:()=>opts("allerg",ALLERG,true)+`<div class="lab" style="margin-top:12px">Préciser ton allergie</div><input class="txt" id="i-allerg" maxlength="120" placeholder="Ex. : kiwi, amandes, saumon" value="${esc(A.allergTxt||"")}" style="font-size:17px;padding:12px"><div id="allerg-hit" class="small muted" style="margin-top:6px">${allergHint(A.allergTxt)}</div>`,ok:()=>true},
 {t:"Tes cuisines préférées",s:"Elles reviendront plus souvent. Rien de coché : un peu de tout.",h:()=>`<div class="grid2">${CUIS.map(c=>`<button class="tile" data-m="cuis" data-v="${c.v}" aria-pressed="${(A.cuis||[]).includes(c.v)}"><span class="e">${c.e}</span><b>${c.l}</b></button>`).join("")}</div>`,ok:()=>true},
 {t:"Le matin, plutôt…",s:"Pour un petit-déjeuner qui donne envie de se lever.",h:()=>opts("pdjT",[{v:"sucre",e:"🥞",l:"Sucré",s:"Porridge, pancakes, tartines"},{v:"sale",e:"🍳",l:"Salé",s:"Œufs, avocat, jambon"},{v:"both",e:"🔀",l:"Les deux me vont"}]),ok:()=>!!A.pdjT},
 {t:"Combien de temps pour cuisiner par jour ?",s:"Ton coach choisit des recettes qui tiennent dans ce temps.",h:()=>opts("ckt",[{v:15,e:"⚡",l:"15 min maximum",s:"Rapide, peu de vaisselle"},{v:30,e:"🍳",l:"Environ 30 min"},{v:45,e:"👨‍🍳",l:"45 min"},{v:60,e:"🧑‍🍳",l:"1 h ou plus",s:"J'aime cuisiner"}]),ok:()=>!!A.ckt},
 {t:"Batch cooking ?",s:"Cuisiner en grande quantité deux fois par semaine, et avoir ses repas prêts.",h:()=>opts("batch",[{v:"oui",e:"📦",l:"Oui, je prépare à l'avance",s:"2 plats le dimanche, 2 le mercredi soir"},{v:"non",e:"🍽️",l:"Non, au jour le jour",s:"Le dîner en double sert de déjeuner le lendemain"}]),ok:()=>!!A.batch},
 {t:"Et le piquant ?",s:"Épices et piment dans tes plats.",h:()=>opts("spice",[{v:0,e:"🧊",l:"Pas du tout"},{v:1,e:"🌶️",l:"Un peu, ça va"},{v:2,e:"🔥",l:"J'adore quand ça pique"}])+(FLOW===GOUTS&&(A.nope||[]).length?`<button class="btn ghost sm" id="nope-clr" style="margin-top:12px">Remettre les ${A.nope.length} recette${A.nope.length>1?"s":""} écartée${A.nope.length>1?"s":""}</button>`:""),ok:()=>A.spice!=null}
];
const Q=[
 {t:"Comment tu t'appelles ?",s:"Ton coach construit ton programme et tes repas à partir de tes réponses. Ça prend 2 minutes.",h:()=>`<input class="txt" id="i-name" maxlength="20" autocomplete="given-name" placeholder="Ton prénom" value="${esc(A.name)}">`,ok:()=>A.name.trim().length>0},
 {t:"Tu es…",s:"Pour calculer tes besoins en calories.",h:()=>opts("sex",[{v:"h",e:"👨",l:"Un homme"},{v:"f",e:"👩",l:"Une femme"}]),ok:()=>!!A.sex},
 {t:"Ta taille, ton poids, ton âge",s:"Le calcul de tes calories part de là.",h:()=>slider("h","Taille",140,210,1,"cm")+slider("w","Poids",40,150,.5,"kg")+slider("age","Âge",14,75,1,"ans"),ok:()=>true},
 {t:"Ton objectif ?",s:"On adapte les séries, les reps, les repos et tes calories.",h:()=>opts("goal",GOALS),ok:()=>!!A.goal},
 {t:"Ton niveau en muscu ?",s:"Pour doser le volume de chaque séance.",h:()=>opts("level",LEVELS),ok:()=>!!A.level},
 {t:"Ton objectif en chiffres",s:"Le poids que tu veux atteindre, et en combien de temps. Ton coach te dit si c'est réaliste.",live:1,
  h:()=>{if(A.tw==null||A.twg!==A.goal){A.tw=Math.round(A.w+{masse:6,seche:-5,recompo:0,force:2}[A.goal]);A.twg=A.goal}
   return slider("tw","Poids visé",Math.round(A.w-30),Math.round(A.w+30),.5,"kg")+`<div class="lab" style="margin-top:6px">En combien de temps ?</div><div class="row" style="flex-wrap:wrap">${[2,3,4,6,9,12].map(n=>`<button class="chip" data-c="months" data-v="${n}" aria-pressed="${A.months===n}" style="flex:1">${n} mois</button>`).join("")}</div><div id="gp">${gpBox(A)}</div>`},
  ok:()=>goalPlan(A).ok},
 {t:"Les jours où tu peux vraiment aller à la salle",s:"Décoche les jours impossibles. Ton coach place tes séances parmi ceux qui restent.",h:()=>{A.avail=A.avail||[...WEEK];const n=A.avail.length;return `<div class="week">${WEEK.map(d=>`<button data-av="${d}" aria-pressed="${A.avail.includes(d)}">${DN[d]}<small>${A.avail.includes(d)?"Dispo":"Non"}</small></button>`).join("")}</div><div class="hintbox"><span style="font-size:26px">🗓️</span><span><b>${n} jour${n>1?"s":""} possible${n>1?"s":""}</b><br><small class="muted">${n<2?"Il faut au moins 2 jours.":n>=6?"Presque tous les jours : ton coach peut viser plus de séances si ton objectif le demande.":"Ton coach répartit les séances pour laisser récupérer chaque muscle."}</small></span></div>`},ok:()=>(A.avail||WEEK).length>=2},
 {t:"Où tu t'entraînes ?",s:"Choisis ta salle : on pré-remplit les machines qu'on y trouve d'habitude.",h:()=>`<div class="grid2">${GYMS.slice(0,6).map(g=>`<button class="store" data-gym="${g.v}" aria-pressed="${A.gym===g.v}">${g.l}</button>`).join("")}</div><div class="opts" style="margin-top:10px">${GYMS.slice(6).map(g=>`<button class="opt" data-gym="${g.v}" aria-pressed="${A.gym===g.v}"><span class="e">${g.e}</span><span><b>${g.l}</b><small>${g.s}</small></span></button>`).join("")}</div>`,ok:()=>!!A.gym},
 {t:"Le matériel de ta salle",s:()=>A.gym==="bw"?"Sans matériel : programme au poids du corps. Coche quand même ce que tu as sous la main.":A.gym==="home"||A.gym==="autre"?"Coche tout ce que tu as à disposition.":`On a pré-coché l'équipement habituel des salles ${GYMS.find(g=>g.v===A.gym).l}. Décoche ce qui manque dans la tienne, coche ce qu'elle a en plus.`,
  h:()=>`<div class="opts">${EQUIP.map(([c,l,x])=>`<button class="opt" data-eq="${c}" aria-pressed="${A.equip.includes(c)}" style="min-height:52px;padding:10px 14px"><span class="e" style="font-size:20px">${A.equip.includes(c)?"✅":"⬜"}</span><span><b>${l}</b>${x?`<small>${x}</small>`:""}</span></button>`).join("")}</div>`,ok:()=>true},
 {t:"Une zone à ménager ?",s:"Le coach écarte les exercices qui la sollicitent trop. En cas de douleur qui dure, consulte un kiné.",h:()=>opts("pain",PAINS,true),ok:()=>true},
 {t:"En dehors de la salle, tu es…",s:"Ta dépense de la journée compte autant que tes séances.",h:()=>opts("act",ACTS),ok:()=>!!A.act},
 {t:"Ce que tu manges",s:"Les recettes de ta semaine respectent ton choix.",h:()=>opts("diet",DIETS),ok:()=>!!A.diet},
 {t:"Quels repas prends-tu dans la journée ?",s:"Décoche ceux que tu ne prends pas : tes calories et tes protéines sont réparties sur les autres.",h:()=>{const s=mealsOf(A);return `<div class="opts">${[["pdj","☕","Petit-déjeuner"],["dej","🍽️","Déjeuner"],["snack","🥤","Collation","Pratique quand les calories sont élevées"],["din","🌙","Dîner"]].map(([v,e,l,x])=>`<button class="opt" data-ms="${v}" aria-pressed="${s.includes(v)}"><span class="e">${e}</span><span><b>${l}</b>${x?`<small>${x}</small>`:""}</span></button>`).join("")}</div>`},ok:()=>mealsOf(A).length>0},
 {t:"Où fais-tu tes courses ?",s:"Plusieurs choix possibles : pour chaque article, le coach prend le moins cher.",h:()=>`<div class="grid2">${STORES.map(s=>`<button class="store" data-m="stores" data-v="${s.v}" aria-pressed="${(A.stores||[]).includes(s.v)}">${s.l}</button>`).join("")}</div>`,ok:()=>!!(A.stores||[]).length},
 {t:"Quel budget pour tes repas ?",s:"Par semaine, pour tes courses.",h:()=>{const pm=A.budget/(7*A.meals),lvl=pm<1.6?"Serré":pm<3?"Confortable":"Large";return `<div style="font:800 64px/1 var(--display);text-align:center;margin-top:10px"><span id="v-budget">${A.budget}</span> €<small class="muted" style="font:500 16px var(--body)"> / semaine</small></div>
   <input type="range" id="s-budget" data-s="budget" data-u="€" min="15" max="150" step="5" value="${A.budget}" aria-label="Budget par semaine">
   <div class="row small muted"><span class="sp">Serré</span><span>Confortable</span><span class="sp" style="text-align:right">Large</span></div>
   <div class="hintbox"><span style="font-size:30px">🍱</span><span><b id="v-pm">${eur(pm)} / repas</b> · <span id="v-lvl">${lvl}</span><br><small class="muted">${A.meals*7} repas dans la semaine. Budget serré : on mise sur les basiques (riz, pâtes, œufs, légumineuses, thon).</small></span></div>`},ok:()=>true},
 {t:"Quel style de plats ?",s:"Choisis-en un ou plusieurs. Rien de coché : un mélange de tout.",h:()=>`<div class="grid2">${STYLES.map(s=>`<button class="tile" data-m="styles" data-v="${s.v}" aria-pressed="${A.styles.includes(s.v)}"><span class="e">${s.e}</span><b>${s.l}</b></button>`).join("")}</div>`,ok:()=>true},
 ...[]
];
/* Questionnaire d'accueil : 13 questions essentielles. Le reste (matériel, repas, goûts) se règle ensuite via « Affine ton profil ». */
const STEPS=[{t:"Comment tu t'appelles ?",s:"Ton coach construit ton programme et tes repas à partir de tes réponses. 13 questions, 2 minutes.",h:()=>Q[0].h()+`<div class="lab" style="margin-top:14px">Tu es…</div>`+Q[1].h(),ok:()=>Q[0].ok()&&Q[1].ok()},Q[2],Q[3],QAIMS,Q[4],QZONES,Q[5],Q[6],Q[7],Q[9],QPROG,Q[10],Q[11]];
const REF={equip:Object.assign([Q[8]],{ref:"equip"}),food:Object.assign([Q[12],Q[13],Q[14],Q[15]],{ref:"food"}),nut:Object.assign([Q[2],Q[3],Q[5],Q[10],Q[11],Q[12],Q[13],Q[14],Q[15],...GOUTS],{ref:"nut"})};
const QDEF={store:"carrefour",stores:["carrefour"],pdjT:"both",ckt:30,batch:"non",spice:1};
/* ================= Le coach décide ================= */
/* Vitesse de progression par mois : réaliste / maximum encore sain. Prise : selon le niveau. Perte : en % du poids. */
function goalPlan(p){const diff=+(p.tw-p.w).toFixed(1),m=p.months||6,pm=diff/m,gain=diff>0;
 const [re,mx]=gain?{deb:[1,2],int:[.6,1.2],av:[.3,.7]}[p.level||"deb"]:[p.w*.03,p.w*.045];
 const a=Math.abs(pm),need=Math.ceil(Math.abs(diff)/mx);
 let ok=true,msg,tone;
 if(p.goal==="masse"&&diff<=0){ok=false;msg="Pour une prise de muscle, vise un poids au-dessus du tien.";tone="bad"}
 else if(p.goal==="seche"&&diff>=0){ok=false;msg="Pour perdre du gras, vise un poids en dessous du tien.";tone="bad"}
 else if(Math.abs(diff)<.5){msg=p.goal==="recompo"?"Poids stable : tu perds du gras et prends du muscle en même temps. La balance bouge peu, le miroir beaucoup.":"Poids stable : ton coach mise tout sur la force.";tone="good"}
 else if(a<=re){msg=`Réaliste. ${gain?"+":"−"}${fr(a,1)} kg par mois : du ${gain?"muscle":"gras"} en ${gain?"gagnant":"perdant"} le moins ${gain?"de gras":"de muscle"} possible.`;tone="good"}
 else if(a<=mx){msg=`Ambitieux mais faisable. ${gain?"+":"−"}${fr(a,1)} kg par mois : il faudra être carré sur les repas et ne rater aucune séance.`;tone="warn"}
 else{msg=`Trop rapide : ${gain?"+":"−"}${fr(a,1)} kg par mois, ce serait surtout du ${gain?"gras":"muscle et de l'eau"}. Ton coach conseille au moins ${need} mois.`;tone="bad";ok=false}
 return{ok,msg,tone,diff,pm,re,mx,need,fast:a>re}}
const gpBox=p=>{const g=goalPlan(p),c={good:"var(--good)",warn:"var(--warn)",bad:"var(--bad)"}[g.tone];
 return `<div class="hintbox" style="border-color:${c}"><span style="font-size:26px">${{good:"✅",warn:"⚡",bad:"⛔"}[g.tone]}</span><span><b style="color:${c}">${g.diff>0?"+":""}${fr(g.diff,1)} kg en ${p.months} mois</b><br><small class="muted">${g.msg}</small></span></div>`};
/* Surplus ou déficit calorique tiré de la vitesse visée (7 700 kcal ≈ 1 kg). */
function goalAdj(p){const base={masse:300,force:200,seche:-450,recompo:-150}[p.goal];if(p.tw==null)return base;
 const d=(p.tw-p.w)/(p.months*30.4)*7700,lim={masse:[200,650],force:[100,400],seche:[-800,-250],recompo:[-300,100]}[p.goal];
 return Math.round(Math.min(lim[1],Math.max(lim[0],d))/10)*10}
const DAYSET={2:[1,4],3:[1,3,5],4:[1,2,4,5],5:[1,2,3,5,6],6:[1,2,3,4,5,6]};
/* Nombre de séances, durée, répartition : décidés par le coach (principes Ektyron : 2–3 séries lourdes, 8–12 reps, 2–3 min de repos, récupération 48 h petits muscles / 72 h gros). */
function recN(p){const g=goalPlan(p),av=p.avail&&p.avail.length>=2?p.avail:WEEK,L={deb:"débutant",int:"intermédiaire",av:"confirmé"}[p.level];
 let n={deb:3,int:4,av:5}[p.level];
 if((p.goal==="masse"||p.goal==="recompo")&&g.fast)n++;
 if(p.goal==="force")n=Math.min(n,4);
 n=Math.max(3,Math.min(p.level==="deb"?4:6,n));
 let why=`en ${L}${g.fast?" avec un objectif ambitieux":""}, c'est le bon dosage : assez pour progresser vite, avec 48 h de repos pour les petits muscles et 72 h pour les gros`;
 const big=p.tw!=null&&g.diff>=8;
 if(big&&av.length>=6&&n<5){n=5;why="c'est un gros objectif et tu peux venir presque tous les jours : 5 séances donnent le volume qu'il faut, chaque muscle travaillé 2 fois par semaine"}
 else if(big&&n<4){n=4;why=`un gros objectif demande au moins 4 séances${p.level==="deb"?", même en débutant":""} : chaque muscle est travaillé 2 fois par semaine`}
 if(n>av.length){n=av.length;why=`tu n'es disponible que ${n} jours, ton coach les utilise tous`}
 return{n,why,av}}
/* Choisit n jours parmi les jours dispo, le plus espacés possible. */
function spreadDays(n,av){if(DAYSET[n]&&DAYSET[n].every(d=>av.includes(d)))return DAYSET[n];let best=av.slice(0,n),bs=-99;
 for(let m=0;m<128;m++){const ds=WEEK.filter(d=>m>>d&1);if(ds.length!==n||!ds.every(d=>av.includes(d)))continue;const o=ds.map(d=>(d+6)%7),g=o.map((x,i)=>((o[(i+1)%n]-x+7)%7)||7),sc=Math.min(...g)*10-Math.max(...g);if(sc>bs){bs=sc;best=ds}}return best}
function coachDecide(p){const {n,av}=recN(p),dur=p.level==="deb"||p.goal==="seche"?60:75;
 p.rec=n;p.recDur=dur;p.days=spreadDays(n,av);p.dur=dur;p.split="auto";p.prio=p.prio||[];p.custom={};return p}
function planWhy(p){const g=goalPlan(p),T=targets(),n=p.days.length,sp=splitName(p),L={deb:"débutant",int:"intermédiaire",av:"confirmé"}[p.level];
 const out=[];
 out.push(["🗓️",`${n} séances par semaine`,n===p.rec?(R=>R.n===p.rec?R.why[0].toUpperCase()+R.why.slice(1)+".":`En ${L}${g.fast?" avec un objectif ambitieux":""}, c'est le bon dosage : assez pour progresser vite, avec 48 h de repos pour les petits muscles et 72 h pour les gros.`)(recN(p)):`Ton coach recommandait ${p.rec} séances. Tu en as choisi ${n} pour coller à ton emploi du temps.`]);
 out.push(["🧩",sp,p.mode==="own"?"Tes séances, telles que tu les as données. Ton coach suit tes charges et te dit quand augmenter.":p.mode==="choose"?"Deux versions possibles : compare-les plus bas, puis choisis.":{full:"Tout le corps à chaque séance : chaque muscle est travaillé souvent, idéal pour apprendre les mouvements.",ul:"Haut du corps puis bas du corps : chaque muscle 2 fois par semaine, avec le temps de récupérer.",ppl:"Pousser, tirer, jambes : séances ciblées, chaque muscle 2 fois par semaine.",pplul:"Pousser, tirer, jambes, puis haut et bas : beaucoup de volume, chaque muscle 2 fois par semaine.",bas:"Jambes et fessiers 2 fois plus souvent que le haut du corps : ta priorité reçoit le plus de séances."}[splitOf(p)]]);
 if((p.prio||[]).length)out.push(["🎯",`Priorités : ${p.prio.map(zoneL).join(" → ")}`,"Ces zones reçoivent plus d'exercices et une série de plus (priorités n°1 et n°2), en début de séance. Un tiers des exercices reste pour le reste du corps, pour garder un physique équilibré."]);
 if((p.aims||[]).length)out.push(["🧭",AIMS.filter(a=>p.aims.includes(a.v)).map(a=>a.l).join(" · "),[p.aims.includes("posture")&&"Posture : plus d'arrière d'épaule et de haut du dos.",p.aims.includes("force")&&p.goal!=="force"&&"Force : 5 à 8 reps sur les gros exercices.",p.aims.includes("gras")&&p.goal!=="seche"&&"Perte de gras : repos plus courts sur l'isolation.",p.aims.includes("sport")&&"Sport : squat, soulevé de terre et gainage en avant."].filter(Boolean).join(" ")||"Ton coach en tient compte dans le choix des exercices."]);
 out.push(["⏱️",`${p.dur} min par séance`,"2 à 3 séries lourdes par exercice, 8 à 12 répétitions, 2 à 3 min de repos. Ajoute 2,5 kg dès que tu fais 12 reps sur toutes les séries."]);
 out.push(["🍽️",`${fr(T.kcal)} kcal et ${T.p} g de protéines par jour`,Math.abs(g.diff)<.5?"Calories autour de ta maintenance pour garder ton poids.":`${goalAdj(p)>0?"+":""}${goalAdj(p)} kcal par rapport à ta dépense, pour ${g.diff>0?"prendre":"perdre"} ${fr(Math.abs(g.pm),1)} kg par mois. Ton coach réajuste chaque semaine selon ta pesée.`]);
 out.push(["💊","Créatine 5 g par jour",`Tous les jours, même les jours de repos. Et ${fr(waterQuota(1),1)} L d'eau les jours de séance, ${fr(waterQuota(0),1)} L les autres : à noter chaque jour dans l'accueil.`]);
 return out}
function showPlan(){view="plan";document.body.className="ob";const p=PROF,g=goalPlan(p),end=new Date(Date.now()+p.months*30.4*864e5);
 $("#app").innerHTML=`<div class="ob"><div class="ob-body" style="padding-top:20px"><div class="lab">Ton plan</div><h1>${esc(p.name)}, voilà ce qu'il te faut</h1>
 ${p.tw!=null?`<div class="hintbox"><span style="font-size:26px">🎯</span><span><b>${fr(p.w,1)} → ${fr(p.tw,1)} kg</b><br><small class="muted">Objectif vers ${end.toLocaleDateString("fr-FR",{month:"long",year:"numeric"})} · ${g.msg}</small></span></div>`:""}
 <div class="week" style="margin:6px 0">${WEEK.map(d=>`<button tabindex="-1" aria-pressed="${p.days.includes(d)}">${DN[d]}<small>${TRAIN[d]?TRAIN[d].t.replace(/ (du corps|body)/,"").split(" ")[0]:"Repos"}</small></button>`).join("")}</div>
 <div class="stack">${planWhy(p).map(([e,h,s])=>`<div class="card" style="display:flex;gap:12px;align-items:flex-start"><span style="font-size:26px">${e}</span><span><b>${h}</b><br><small class="muted">${s}</small></span></div>`).join("")}</div>${progCard(p)}</div>
 <div class="ob-foot stack">${p.mode==="choose"?`<button class="btn" id="pick-coach">Prendre la version du coach</button><button class="btn ghost" id="pick-own">Garder mon programme</button>`:`<button class="btn" id="plan-go">C'est parti</button><button class="btn ghost" id="plan-adj">Adapter à mon emploi du temps</button>`}</div></div>`;window.scrollTo(0,0)}
function startAdjust(){A=JSON.parse(JSON.stringify(PROF));if(!A.rec){A.rec=A.days.length;A.recDur=A.dur}FLOW=ADJ;obI=0;view="ob";renderOb()}
function startTastes(){A=JSON.parse(JSON.stringify(PROF));A.taste=A.taste||{};FLOW=GOUTS;obI=0;view="ob";renderOb()}
function saveTastes(){A.refined={...(A.refined||{}),taste:1};PROF=A;LS.set("coach-profile",PROF);LS.set("coach-week",{...genWeek(Date.now()%1e9),v:2});LS.set("coach-shop",{});FLOW=STEPS;view="food";nutTab="week";render();toast("Goûts enregistrés : nouvelle semaine de repas")}
function startRefine(k){if(k==="taste")return startTastes();A=JSON.parse(JSON.stringify(PROF));A.taste=A.taste||{};if(k==="nut")for(const[x,v]of Object.entries({meals:3,budget:45,styles:[],allerg:[],cuis:[],nope:[],avail:[...WEEK],store:"carrefour",ckt:30,batch:"non",spice:1,pdjT:"both"}))if(A[x]==null)A[x]=v;if(k==="nut"&&!(A.stores||[]).length)A.stores=[A.store||"carrefour"];FLOW=REF[k];obI=0;view="ob";renderOb()}
function saveRefine(){const k=FLOW.ref;if((A.stores||[]).length)A.store=A.stores[0];coursesReset();A.refined={...(A.refined||{}),[k]:1};if(k==="nut"){A.refined.food=A.refined.taste=1;nutTab="week"}PROF=A;LS.set("coach-profile",PROF);if(k==="food"||k==="nut"){LS.set("coach-week",{...genWeek(Date.now()%1e9),v:2});LS.set("coach-shop",{})}TRAIN=buildTraining(PROF);FLOW=STEPS;view=k==="food"||k==="nut"?"food":"train";render();toast(k==="nut"?"C'est parti : ta semaine de repas est prête":k==="food"?"Enregistré : nouvelle semaine de repas":"Matériel enregistré : programme mis à jour")}
function saveAdjust(){A.freq=A.days.length;if(JSON.stringify(PROF.days)+PROF.split!==JSON.stringify(A.days)+A.split)A.custom={};PROF=A;LS.set("coach-profile",PROF);TRAIN=buildTraining(PROF);FLOW=STEPS;showPlan();toast("Programme adapté")}

/* Tout recommencer : questionnaire vierge, comme après une nouvelle installation. Seuls prénom, taille, poids et âge sont repris pour aller plus vite.
   Les séances faites, charges, pesées, mensurations, bilans, XP et compte ne sont pas touchés (autres clés). Le profil n'est remplacé qu'à la fin du questionnaire : « ‹ » à la 1re question annule. */
const restartCard=()=>`<div class="card stack"><div class="lab">Nouveau départ</div><p class="small muted" style="margin:0">Nouveaux objectifs ? Refais tout le questionnaire depuis le début : programme et repas sont recalculés avec toutes les nouveautés de l'appli. Tes séances faites, tes charges, pesées et mensurations restent enregistrées.</p><button class="btn ghost" id="restart">🔄 Recommencer tout le questionnaire</button></div>`;
function startFresh(){if(!confirm("Recommencer tout le questionnaire depuis le début ?\n\nTon programme et tes repas seront refaits avec tes nouvelles réponses. Tout ce que tu as déjà enregistré (séances, charges, pesées, mensurations) est gardé.\n\nTu peux annuler avec ‹ à la première question."))return;
 const o=PROF;startOnboarding(false);Object.assign(A,{name:o.name||"",h:o.h||A.h,w:Math.round(curWeight()*2)/2||A.w,age:o.age||A.age});for(const k in o)if(/^fx/.test(k))A[k]=o[k];renderOb()}
function startOnboarding(edit){FLOW=STEPS;const dr=!edit&&!PROF&&LS.get("coach-draft",null);if(dr&&dr.A){A=dr.A;obI=Math.min(dr.obI||0,STEPS.length-1);view="ob";return render()}A=edit&&PROF?JSON.parse(JSON.stringify(PROF)):{name:"",sex:"",h:178,w:72,age:25,goal:"",level:"",tw:null,months:6,gym:"",equip:"",days:[1,2,4,5],split:"auto",prio:[],aims:[],hasProg:"",progTxt:"",likes:[],freq:4,dur:60,pain:[],act:"",diet:"",meals:4,mealSel:[...MEALK],budget:45,styles:[],avail:[...WEEK],taste:{},allerg:[],cuis:[],ckt:30,batch:"non",spice:1,nope:[],refined:{},store:"carrefour",pdjT:"both"};obI=0;view="ob";render()}
const ADJ=[
 {t:"Quels jours tu t'entraînes ?",s:()=>{const R=recN(A),g=goalPlan(A),who=A.tw!=null&&Math.abs(g.diff)>=.5?`Pour ${g.diff>0?"+":"−"}${fr(Math.abs(g.diff),1)} kg, ton coach`:"Ton coach";return R.n===A.rec?`${who} recommande ${A.rec} séances de ${A.recDur||60} min parce que ${R.why}. Adapte à ton emploi du temps : les séances sont replacées pour que chaque muscle récupère.`:`Ton coach recommande ${A.rec||4} séances de ${A.recDur||60} min. Adapte à ton emploi du temps : les séances sont replacées pour que chaque muscle récupère.`},h:()=>`<div class="week">${WEEK.map(d=>`<button data-wd="${d}" aria-pressed="${A.days.includes(d)}">${DN[d]}<small>${A.days.includes(d)?"Séance":"Repos"}</small></button>`).join("")}</div>
   <div class="hintbox"><span style="font-size:26px">🗓️</span><span><b>${A.days.length} séance${A.days.length>1?"s":""} par semaine</b><br><small class="muted">${A.days.length<2?"Choisis au moins 2 jours.":A.days.length>6?"Garde au moins un jour de repos complet.":A.days.length<(A.rec||0)?`En dessous de la recommandation : ta progression sera plus lente que prévu.`:A.days.length>(A.rec||9)?"Au-dessus de la recommandation : veille à bien dormir et à manger tout ton plan.":"C'est ce que ton coach recommande."}</small></span></div>
   <div class="lab" style="margin-top:6px">Durée d'une séance</div><div class="row">${[45,60,75,90].map(n=>`<button class="chip" data-c="dur" data-v="${n}" aria-pressed="${A.dur===n}" style="flex:1">${n} min</button>`).join("")}</div>`,ok:()=>A.days.length>=2&&A.days.length<=6},
 {t:"Comment organiser ta semaine ?",s:"Choisis ta répartition, ou laisse le coach décider.",h:()=>opts("split",SPLITS)+`<div class="hintbox"><span style="font-size:26px">📋</span><span><b>Ta semaine</b><br><small class="muted">${seqFor(A).map(([d,k])=>`${DN[d]} : ${TPL[k].t}`).join(" · ")}</small></span></div>`,ok:()=>!!A.split},
 QZONES,
];
let FLOW=STEPS;
const INAPP=/Instagram|FBAN|FBAV|FB_IAB|Messenger|musical_ly|Bytedance|TikTok|Snapchat|Twitter|LinkedIn/i.test(navigator.userAgent),
 STANDALONE=matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
function obNotice(){return `${INAPP?`<div class="hintbox" style="border-color:var(--warn)"><span style="font-size:26px">⚠️</span><span><b>Ouvre ce lien dans Safari ou Chrome</b><br><small class="muted">Tu es dans le navigateur d'une appli (TikTok, Insta…) : il efface tout à la fermeture. Touche ⋯ puis « Ouvrir dans le navigateur ».</small></span></div>`:!STANDALONE?`<div class="hintbox"><span style="font-size:26px">📲</span><span><b>Astuce : installe l'appli</b><br><small class="muted">Partager ⬆️ puis « Sur l'écran d'accueil ». Ton profil reste enregistré sur ce téléphone.</small></span></div>`:""}`}
function renderOb(){const S=FLOW[obI];if(FLOW===STEPS&&!PROF)LS.set("coach-draft",{A,obI});document.body.className="ob";
 $("#app").innerHTML=`<div class="ob"><div class="ob-top"><button class="back" id="ob-back" aria-label="Retour" >‹</button><div class="ob-bar"><i style="width:${(obI+1)/FLOW.length*100}%"></i></div><span class="ob-step">${obI+1}/${FLOW.length}</span></div>
 <div class="ob-body"><h1>${S.t}</h1><p class="muted" style="margin:0">${typeof S.s==="function"?S.s():S.s}</p>${S.h()}${obI===0&&FLOW===STEPS&&!PROF&&INAPP?obNotice():""}</div>
 <div class="ob-foot"><button class="btn" id="ob-next" ${S.ok()?"":"disabled"}>${obI===FLOW.length-1?(FLOW===ADJ?"Valider mon programme":FLOW.ref?"Enregistrer":FLOW===GOUTS?"Enregistrer mes goûts":"Construire mon plan"):"Continuer"}</button></div></div>`;
 const n=$("#i-name");if(n&&!A.name)setTimeout(()=>n.focus(),50)}
function obRefresh(){const b=$("#ob-next");if(b)b.disabled=!FLOW[obI].ok()}
function buildScreen(){document.body.className="ob";const L=["Lecture de tes réponses","Analyse de ton objectif et de ton délai","Choix du nombre de séances et de leur durée","Choix des exercices selon ta salle","Séries, reps et repos selon ton objectif","Calcul de tes calories et macros","Choix des recettes à ton goût","Optimisation pour ton budget","Liste de courses de la semaine"];
 $("#app").innerHTML=`<div class="build"><svg viewBox="0 0 200 110" aria-hidden="true"><defs><linearGradient id="gd" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#FFE0C7"/><stop offset="1" stop-color="#FF7A1A"/></linearGradient></defs><rect x="62" y="46" width="76" height="18" rx="9" fill="url(#gd)"/><rect x="18" y="14" width="52" height="82" rx="22" fill="url(#gd)"/><rect x="130" y="14" width="52" height="82" rx="22" fill="url(#gd)"/></svg>
 <h1>${esc(A.name)}, ton coach<span>construit ton plan</span></h1><p class="muted small" style="margin:0;max-width:330px">Chaque exercice, chaque série et chaque repas sont choisis à partir de tes réponses.</p>
 <ul class="steps">${L.map(l=>`<li><i></i>${l}</li>`).join("")}</ul><div class="pbar"><i id="pb" style="width:0"></i><b id="pbt">0 %</b></div></div>`;
 const li=$$(".steps li"),t0=performance.now(),D=4200;
 (function step(){const now=performance.now(),k=Math.min(1,(now-t0)/D),n=Math.floor(k*li.length);li.forEach((x,i)=>{x.className=i<n?"ok":i===n?"now":"";x.firstChild.textContent=i<n?"✓":""});$("#pb").style.width=k*100+"%";$("#pbt").textContent=Math.round(k*100)+" %";
  if(k<1)setTimeout(step,60);else setTimeout(()=>{const first=!PROF;LS.del("coach-draft");for(const k in QDEF)if(A[k]==null||A[k]===""||(k==="ckt"&&!A[k]))A[k]=QDEF[k];if(!A.refined)A.refined=PROF?PROF.refined||{}:{};coachDecide(A);A.likes=progLikes(A);if(A.hasProg==="oui"){ownSetup(A);A.ownV=6;A.mode=!A.ownDays.length?"coach":A.progKeep==="tel"?"own":"choose";if(A.mode==="own"){A.days=ownDaysFor(A);A.custom={}}}else A.mode="coach";A.freq=A.days.length;if(PROF&&JSON.stringify(PROF.days)+PROF.split!==JSON.stringify(A.days)+A.split)A.custom={};PROF=A;LS.set("coach-profile",PROF);LS.set("coach-week",{...genWeek(Date.now()%1e9),v:2});TRAIN=buildTraining(PROF);showPlan()},350)})()}

/* ================= Écrans ================= */
const ICON={today:'<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',train:'<path d="M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12"/>',food:'<path d="M7 3v8a3 3 0 0 0 3 3v7M10 3v6M4 3v6a3 3 0 0 0 3 3M17 3c-2 0-3 3-3 6s1 4 3 4v8"/>',prog:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',me:'<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>'};
const TABS=[["today","Aujourd'hui"],["train","Séances"],["food","Nutrition"],["prog","Progrès"],["me","Profil"]];
function render(){GL=null;if(!PROF&&view!=="ob")return LS.get("coach-draft",null)?startOnboarding():vPortal();if(view==="ob")return renderOb();if(view==="plan")return showPlan();document.body.className=G&&!G.away?"g-on":"";
 TRAIN=TRAIN||buildTraining(PROF);const L=level(xpProf().xp);
 const titles={today:`Salut ${esc(PROF.name)}`,train:"Tes séances",food:"Nutrition",prog:"Progrès",me:"Profil",set:"Paramètres",jeu:"Entre potes",hist:"Historique",corps:"Mon corps"};
 $("#app").innerHTML=`<header class="top"><h1>${titles[view]}</h1><div class="lvl"><b>Niv. ${L.l}</b>${xpProf().xp} XP</div></header><main class="stack">${({today:vToday,train:vTrain,food:vFood,prog:vProg,me:vMe,set:vSet,jeu:vJeu,hist:vHist,corps:vCorps})[view]()}${view==="train"||view==="food"?restartCard():""}</main>
 <nav class="tabs">${TABS.map(([k,l])=>`<button data-tab="${k}" ${view===k||(k==="me"&&(view==="set"||view==="jeu"||view==="corps"))||(k==="prog"&&view==="hist")?'aria-current="page"':""}><svg viewBox="0 0 24 24">${ICON[k]}</svg>${l}</button>${k==="train"&&typeof duoBtn==="function"?`<button data-duo="open"${typeof DUO!=="undefined"&&DUO?' class="live"':""}><svg viewBox="0 0 24 24"><circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M2 20c0-3 3-5 6-5s6 2 6 5M14 15.5c.6-.3 1.3-.5 2-.5 3 0 6 2 6 5"/></svg>Duo</button>`:""}`).join("")}</nav>`;if(view==="corps")corpsMount()}
const lastLog=id=>{const h=(store[id]||[]).filter(x=>!x.dl);return h[h.length-1]};
function macroBlock(T,got){const r=52,C=2*Math.PI*r,k=Math.min(1,got.k/T.kcal);const b=(l,v,t,c)=>`<div>${l}<span>${Math.round(v)} / ${t} g</span><div class="bar"><i style="width:${Math.min(100,v/t*100)}%;background:${c}"></i></div></div>`;
 return `<div class="row" style="gap:16px"><div class="ring"><svg viewBox="0 0 120 120"><defs><linearGradient id="gp"><stop offset="0" stop-color="#FFAA66"/><stop offset="1" stop-color="#E85D00"/></linearGradient></defs><circle class="b" cx="60" cy="60" r="${r}"/><circle class="f" cx="60" cy="60" r="${r}" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-k)}"/></svg><div><b>${fr(got.k)}</b><small>/ ${fr(T.kcal)} kcal</small></div></div>
 <div class="mac">${b("Protéines",got.P,T.p,"#FF7A1A")}${b("Glucides",got.C,T.c,"#FFB547")}${b("Lipides",got.F,T.f,"#FF8A3D")}</div></div>`}
function mealRow(m,d,check){const ek=LS.get("coach-eaten",{})[todayKey()]||{},on=!!ek[m.slot],xs=typeof exList==="function"?exList(d,m.slot):[];
 return `<div class="row">${check?`<button class="chk ${on?"on":""}" data-eat="${m.slot}" aria-label="Repas mangé : ${esc(m.r.n)}" aria-pressed="${on}">${on?"✓":""}</button>`:""}<button class="meal" data-rec="${m.r.id}" data-slot="${m.slot}" data-day="${d}"><span class="ph">${m.r.e}<img class="pic" src="img/rec/${m.r.id}.webp" alt="" loading="lazy" onerror="this.remove()"></span><span class="sp"><small>${m.l}${m.left?" · restes d'hier":""}</small><b>${esc(m.r.n)}</b><small>${xs.length?"+ "+xs.map(x=>esc(x.n)).join(", ")+" · ":""}${m.r.min} min · ${eur(m.e)}</small></span><span class="k">${fr(m.k+xs.reduce((a,x)=>a+x.k,0))} kcal</span></button></div>`}
function vToday(){const d=new Date().getDay(),S=TRAIN[d],T=targets(),M=PROF.refined&&PROF.refined.nut===0?[]:dayMeals(d),ek=LS.get("coach-eaten",{})[todayKey()]||{};
 const got=M.filter(m=>ek[m.slot]).reduce((a,m)=>({k:a.k+m.k,P:a.P+m.P,C:a.C+m.C,F:a.F+m.F}),typeof exTot==="function"?exTot(d):{k:0,P:0,C:0,F:0});
 const W=LS.get("coach-weights",[]),needW=!W.length||Date.now()-W[W.length-1].t>6*DAY,tip=TIPS[Math.floor(Date.now()/DAY)%TIPS.length];
 return `<div class="small muted" style="margin-top:-8px">${DLONG[d]} ${new Date().toLocaleDateString("fr-FR",{day:"numeric",month:"long"})} · ${weekGames()}/${PROF.freq} séances cette semaine</div>
 ${jeuHome()}
 ${dueBanner()}${coachToday()}
 ${S?`<div class="card hot stack"><div class="lab">Séance du jour</div><h2>${S.t}</h2><div class="small muted">${S.f} · ${S.x.length} exercices · environ ${sessMin(S)} min</div>${gBtns(d,"▶ Lancer la séance")}</div>`
   :`<div class="card stack"><div class="lab">Jour de repos</div><h2>Récupération</h2><p class="small muted" style="margin:0">Le muscle se construit pendant le repos. Marche, étire-toi, mange tes repas et dors bien.${(()=>{const n=WEEK.slice(WEEK.indexOf(d)+1).concat(WEEK).find(x=>TRAIN[x]);return n!=null?` Prochaine séance : <b>${TRAIN[n].t}</b> ${DLONG[n].toLowerCase()}.`:""})()}</p></div>`}
 ${PROF.refined&&PROF.refined.nut===0?`<div class="card stack"><div class="lab">Nutrition</div><p class="small muted" style="margin:0">Pas encore de suivi : réponds à quelques questions et ton coach prépare tes repas.</p><button class="btn ghost" data-ref="nut">Démarrer mon suivi nutrition</button></div>`:`<div class="card stack"><div class="row"><div class="lab sp">Nutrition du jour</div><span class="small muted">Coche ce que tu as mangé</span></div>${macroBlock(T,got)}${M.map(m=>mealRow(m,d,true)).join("")}</div>`}
 ${waterCard()}
 ${needW?`<div class="card stack"><div class="lab">Pesée de la semaine</div><p class="small muted" style="margin:0">Le matin à jeun. Ton coach ajuste tes calories selon ta courbe.</p><div class="row"><input class="txt" id="w-in" inputmode="decimal" placeholder="${fr(toU(curWeight()),1)} ${wU()}" style="flex:1;font-size:18px;padding:12px"><button class="btn sm" id="w-save">Enregistrer</button></div></div>`:""}
 ${LS.get("coach-msg","")?`<div class="coachmsg">${esc(LS.get("coach-msg",""))}</div>`:""}
 ${refineCard(1)}
 <div class="card"><div class="lab">Conseil du coach</div><p style="margin:.4em 0 0">${tip}</p></div>`}
let edit=false,pickAt=-1;
const curIds=()=>TRAIN[selDay].x.map(e=>e.id);
function saveProg(){LS.set("coach-profile",PROF);TRAIN=buildTraining(PROF);render()}
function setCustom(ids){PROF.custom=PROF.custom||{};PROF.custom[selDay]={k:TRAIN[selDay].k,ids};saveProg()}
/* « Changer » : le coach choisit lui-même un autre exercice du même muscle, de même type d'effort si possible. Chaque appui propose l'option suivante. */
const swapSeen={};
function autoSwap(i){const cur=curIds(),id=cur[i],mk=MUSCOF[id],key=selDay+":"+i,seen=swapSeen[key]=swapSeen[key]||new Set([id]),mn=mk?MUSC[mk][0]:EX[id][1].toLowerCase();
 const pool=Object.keys(EX).filter(x=>x!==id&&!cur.includes(x)&&exOk(x,PROF)&&(mk?MUSCOF[x]===mk:EX[x][1]===EX[id][1]));
 if(!pool.length)return toast(`Aucun autre exercice pour les ${mn} avec ton matériel.`);
 const sc=x=>(EX[x][3]===EX[id][3]?4:0)+(EX[x][4]&&EX[x][4]===EX[id][4]?2:0)+(EX[x][2]!=="0"?1:0)-(seen.has(x)?20:0);
 pool.sort((a,b)=>sc(b)-sc(a));if(seen.has(pool[0])){seen.clear();seen.add(id);pool.sort((a,b)=>sc(b)-sc(a))}
 const nx=pool[0];seen.add(nx);cur[i]=nx;setCustom(cur);toast(`${EX[nx][0]} : toujours les ${mn}. Touche encore pour une autre option.`)}
function openPicker(i){pickAt=i;const cur=curIds(),g0=i>=0?EX[cur[i]][1]:null,ok=Object.keys(EX).filter(id=>!cur.includes(id)&&exOk(id,PROF)),
  groups=[...new Set(ok.map(id=>EX[id][1]))].sort((a,b)=>(b===g0)-(a===g0));
 const el=document.createElement("div");el.id="sheet";el.innerHTML=`<div class="in" role="dialog" aria-label="Choisir un exercice"><div class="row" style="padding-top:18px;position:sticky;top:0;background:var(--bg2)"><h2 class="sp" style="margin:0">${i>=0?"Remplacer "+esc(EX[cur[i]][0]):"Ajouter un exercice"}</h2><button class="chip" data-close aria-label="Fermer">✕</button></div>
  <p class="small muted">Seulement les exercices faisables avec ton matériel${(PROF.pain||[]).length?" et sans gêne pour ta zone à ménager":""}.</p>
  ${groups.map(g=>`<div class="lab" style="margin-top:12px">${g}</div><div class="opts">${ok.filter(id=>EX[id][1]===g).map(id=>`<button class="opt" data-pick="${id}" style="min-height:48px;padding:10px 14px"><span><b>${esc(EX[id][0])}</b><small>${esc(EX[id][5])}</small></span></button>`).join("")}</div>`).join("")}</div>`;
 document.body.append(el)}
function vTrain(){const S=TRAIN[selDay],td=new Date().getDay();
 return `<div class="row" style="margin-top:-8px"><div class="small muted sp">${splitName(PROF)} · ${GYMS.find(g=>g.v===PROF.gym).l} · ${GOALS.find(g=>g.v===PROF.goal).l.toLowerCase()}</div><button class="chip" id="adj">Adapter</button></div>
 <div class="week">${WEEK.map(d=>`<button data-sday="${d}" aria-pressed="${d===selDay}" class="${d===td?"today":""}">${DN[d]}<small>${TRAIN[d]?TRAIN[d].t.replace(/ (du corps|body)/,"").split(" ")[0]:"Repos"}</small></button>`).join("")}</div>
 ${S?`<div class="card hot stack"><h2>${S.t}</h2><div class="small muted">${S.f} · environ ${sessMin(S)} min${S.own?" · modifiée par toi":""}</div>${gBtns(selDay,"▶ Jouer cette séance")}<button class="btn ghost" id="ed-tog">${edit?"✓ Terminer les modifications":"✏️ Modifier cette séance"}</button></div>
  ${S.x.map((e,i)=>{const l=lastLog(e.id);return `<article class="ex">${animTag(e.id,e.a,esc(e.n))}<div class="hd"><b>${e.n}</b><span class="sc">${e.s}×${e.r[0]}–${e.r[1]}</span></div><div class="small">${e.c}</div><div class="small muted mono">Repos ${fmtT(e.rest)} · ${l?`dernière fois ${l.sets.map(s=>`${s.k}×${s.r}`).join(" · ")}`:"pas encore de données"}</div>${edit?`<div class="row" style="margin-top:8px;flex-wrap:wrap"><button class="chip" data-mv="${i},-1" aria-label="Monter">↑</button><button class="chip" data-mv="${i},1" aria-label="Descendre">↓</button><button class="chip" data-rn="${e.id}">✏️ Renommer</button><button class="chip" data-sw="${i}" style="flex:1">🔄 Changer</button><button class="chip" data-rm="${i}">🗑️ Retirer</button></div>`:""}</article>`}).join("")}${edit?`<button class="btn ghost" data-sw="-1">+ Ajouter un exercice</button>${S.own?`<button class="btn ghost" id="ed-reset">Revenir à la séance du coach</button>`:""}`:""}`
  :`<div class="card stack"><h2>Repos</h2><p class="small muted" style="margin:0">Pas de muscu aujourd'hui : de la marche ou 20 minutes de cardio léger si tu veux bouger.</p></div>`}`}
function vFood(){if(PROF.refined&&PROF.refined.nut===0)return `<div class="card hot stack" style="text-align:center"><div style="font-size:44px">🥗</div><h2>Ton suivi nutrition</h2><p class="small muted" style="margin:0">Ton coach calcule tes calories, compose tes repas de la semaine et prépare ta liste de courses. Pour ça, il a besoin de quelques réponses : poids, objectif, ce que tu manges, tes allergies, ton magasin… Environ 3 minutes.</p><button class="btn" data-ref="nut" style="min-height:56px;font-size:17px">Démarrer mon suivi nutrition</button></div>`;const T=targets(),d=nutDay??new Date().getDay(),wc=weekCost(),over=wc>PROF.budget*1.05;
 const head=`<button class="btn" id="renut" style="margin-bottom:12px">🔄 Refaire mon plan nutrition</button><div class="kpis"><div><strong>${fr(T.kcal)}</strong><small>kcal / jour</small></div><div><strong>${T.p} g</strong><small>protéines</small></div><div><strong style="color:${over?"var(--warn)":"inherit"}">${eur(wc).replace(",00","")}</strong><small>sur ${PROF.budget} € / sem.</small></div></div>
 <div class="seg"><button data-nt="week" aria-pressed="${nutTab==="week"}">Repas de la semaine</button><button data-nt="shop" aria-pressed="${nutTab==="shop"}">Liste de courses</button><button data-nt="why" aria-pressed="${nutTab==="why"}">Mes besoins</button></div>`;
 if(nutTab==="shop"){const by=shopping(),ck=LS.get("coach-shop",{}),many=myStores().length>1;return head+budgetCard(wc)+`<div class="card stack"><div class="row"><div class="lab sp">Chez ${myStores().map(stLab).join(", ")} · ${GAM[gLvl()]}</div><b>${eur(wc)}</b></div>${over?`<div class="small" style="color:var(--warn)">Ton budget de ${PROF.budget} € est serré pour ${fr(T.kcal)} kcal par jour : le coach a déjà privilégié les recettes les moins chères. Compte plutôt ${eur(Math.ceil(wc))}.</div>`:`<div class="small muted">Dans ton budget de ${PROF.budget} € par semaine. Prix relevés le ${prixDate()}, hors promotions.</div>`}
  ${Object.keys(by).sort().map(r=>`<div><div class="lab" style="margin-top:6px">${r}</div><ul class="list">${by[r].sort((a,b)=>a.n.localeCompare(b.n)).map(x=>`<li class="${ck[x.i]?"done":""}"><button class="chk ${ck[x.i]?"on":""}" data-shop="${x.i}" aria-label="${esc(x.n)}">${ck[x.i]?"✓":""}</button><button class="lnk sp" ${x.u?"":`data-food="${x.i}"`}>${x.n}<br><small class="muted">${eur(x.e)} · ${x.u||fr(x.pk,2)+" €/kg"} · ${x.tag}${many&&x.st?" · "+stLab(x.st):""}</small></button><b class="mono small">${x.q}</b></li>`).join("")}</ul></div>`).join("")}
  <button class="btn ghost" id="shop-reset">Tout décocher</button></div>`}
 if(nutTab==="why")return head+`<div class="card stack"><div class="lab">Comment ton coach calcule</div>
  <div class="list"><li><span class="sp">Métabolisme de base</span><b class="mono">${fr(T.bmr)} kcal</b></li><li><span class="sp">Avec ton activité et ${PROF.freq} séances</span><b class="mono">${fr(T.tdee)} kcal</b></li><li><span class="sp">Objectif : ${GOALS.find(g=>g.v===PROF.goal).l.toLowerCase()}</span><b class="mono">${fr(T.kcal)} kcal</b></li>
  <li><span class="sp">Protéines (${PROF.goal==="seche"?"2,2":"2"} g par kg)</span><b class="mono">${T.p} g</b></li><li><span class="sp">Lipides</span><b class="mono">${T.f} g</b></li><li><span class="sp">Glucides (le reste)</span><b class="mono">${T.c} g</b></li></div>
  <p class="small muted" style="margin:0">Formule de Mifflin-St Jeor. Ton coach réajuste à chaque pesée selon ta vitesse de progression. Ce sont des repères, pas un avis médical.</p></div>`;
 const M=dayMeals(d),St=supTot(),Ex=typeof exTot==="function"?exTot(d):{k:0,P:0,C:0,F:0},tot=M.reduce((a,m)=>({k:a.k+m.k,P:a.P+m.P,C:a.C+m.C,F:a.F+m.F}),{k:St.k+Ex.k,P:St.P+Ex.P,C:St.C+Ex.C,F:St.F+Ex.F});
 return head+`<div class="week">${WEEK.map(x=>`<button data-nday="${x}" aria-pressed="${x===d}">${DN[x]}<small>${fr(dayMeals(x).reduce((a,m)=>a+m.k,St.k+(typeof exTot==="function"?exTot(x).k:0)))}</small></button>`).join("")}</div>
 <div class="card stack"><div class="row"><div class="lab sp">${DLONG[d]}</div><button class="lnk small" id="meal-edit">Modifier</button></div>${macroBlock(T,tot)}${M.map(m=>mealRow(m,d,false)).join("")}${typeof supRows==="function"?supRows():""}</div>
 ${typeof pickCard==="function"?pickCard():""}<button class="btn ghost" id="regen">↻ Nouvelle semaine de repas</button>`}
function vMe(){const p=PROF,row=(l,v)=>`<li><span class="sp muted">${l}</span><b>${v}</b></li>`;
 return `${acCard()}${typeof admCard==="function"?admCard():""}<div class="card"><ul class="list">${row("Prénom",esc(p.name))}${row("Mensurations",`${p.h} cm · ${fr(curWeight(),1)} kg · ${p.age} ans`)}${row("Objectif",GOALS.find(g=>g.v===p.goal).l+(p.tw?` · ${fr(p.tw,1)} kg en ${p.months} mois`:""))}${row("Niveau",LEVELS.find(g=>g.v===p.level).l)}${row("Salle",GYMS.find(g=>g.v===p.gym).l)}${row("Séances",`${p.days.map(d=>DN[d]).join(", ")} · ${p.dur} min`)}${row("Organisation",splitName(p))}${row("Priorités",(p.prio||[]).length?p.prio.map(z=>PRIOS.find(x=>x.v===z).l).join(", "):"Équilibré")}${row("À ménager",(p.pain||[]).length?p.pain.map(z=>PAINS.find(x=>x.v===z).l).join(", "):"Rien")}${row("Repas",`${mealsOf(p).length} par jour · ${DIETS.find(x=>x.v===p.diet).l.toLowerCase()}`)}${row("Goûts",(t=>`${t.filter(v=>v>0).length} ❤️ · ${t.filter(v=>v<0).length} 🚫${(p.allerg||[]).length?" · sans "+p.allerg.map(a=>ALLERG.find(x=>x.v===a).l.toLowerCase()).join(", "):""}`)(Object.values(p.taste||{})))}${row("Courses",`${myStores().map(stLab).join(", ")} · ${p.budget} € / semaine`)}</ul></div>
 <button class="btn" id="plan-see">Voir mon plan et pourquoi</button><button class="btn ghost" id="tastes">Mes goûts</button><button class="btn ghost" id="adj">Adapter à mon emploi du temps</button><button class="btn ghost" id="redo">Refaire le questionnaire</button>
 <button class="btn" data-tab="corps">🧍 Mon corps à l'objectif</button>
 <button class="btn" data-tab="jeu">🎮 Mon personnage et mes potes</button>
 <button class="btn ghost" data-tab="set">⚙️ Paramètres : notifications, sauvegarde, unités</button>
 ${refineCard(0)}`}

/* ================= Fiche recette ================= */
let recBack=null;
function openRecipe(rid,slot,day){const m=dayMeals(+day).find(x=>x.slot===slot&&x.r.id===rid)||{...portion(rid,slot),l:""},r=m.r;$("#sheet")?.remove();recBack=[rid,slot,day];
 const el=document.createElement("div");el.id="sheet";el.innerHTML=`<div class="in" role="dialog" aria-label="${esc(r.n)}"><div class="hero">${r.e}<img class="pic" src="img/rec/${r.id}.webp" alt="" loading="lazy" onerror="this.remove()">${RVID[r.id]?`<button class="vid" data-vid="${RVID[r.id]}">▶ Voir le plat en vidéo</button>`:""}<button class="x" data-close aria-label="Fermer">✕</button></div>
 <div class="stack"><div class="lab">${m.l||""} · ${r.min} min · ${eur(m.e)}</div><h2 style="text-transform:none;font-family:var(--body);font-weight:600;font-size:24px">${esc(r.n)}</h2>
 <div class="kpis"><div><strong>${fr(m.k)}</strong><small>kcal</small></div><div><strong>${fr(m.P)} g</strong><small>protéines</small></div><div><strong>${fr(m.C)} / ${fr(m.F)}</strong><small>glucides / lipides</small></div></div>
 ${recipeNutri(m)}
 <div class="lab">Ce qu'il te faut · portion calculée pour toi · ≈ ${eur(m.e)}</div><ul class="list">${r.i.map(([i,g])=>`<li><button class="lnk sp" data-food="${i}" data-g="${Math.round(g*m.fi(i))}" data-back="1">${ingName(i)}<br><small class="muted">≈ ${eur(ppk(i).e*g*m.fi(i)/1000)}${myStores().length>1?" · "+stLab(ppk(i).v):""}</small></button><b class="mono">${i==="oeuf"?`${Math.max(1,Math.round(g*m.fi(i)/60))} œuf(s)`:`${Math.round(g*m.fi(i)/5)*5} g`}</b></li>`).join("")}</ul>
 <div class="lab">Préparation</div><p style="margin:0">${r.p}</p>${m.bt?`<p class="small muted">Batch cooking : cuisine 3 à 4 portions d'un coup (dimanche, puis mercredi soir). Elles se gardent 3 jours au frigo.</p>`:m.left?`<p class="small muted">Prépare une double portion la veille au dîner : c'est ton déjeuner du lendemain.</p>`:""}${recBack&&recBack[2]!=null&&recBack[2]!==""&&typeof exBlock==="function"?exBlock(slot,day):""}${recBack&&recBack[2]!=null&&recBack[2]!==""?`<button class="btn ghost" data-swap="${r.id}" data-slot="${slot}" data-day="${day}">↻ Remplacer (ce jour seulement)</button>`:""}<button class="btn ghost" data-nope="${r.id}">👎 Je n'aime pas, remplace-la</button></div></div>`;
 document.body.appendChild(el);const vb=el.querySelector("[data-vid]");if(vb)vb.onclick=()=>{const [u,id]=vb.dataset.vid.split("/"),h=vb.parentNode;h.classList.add("on");h.innerHTML=`<iframe src="https://www.tiktok.com/player/v1/${id}?embed_from=oembed&music_info=1&description=1&autoplay=1&muted=1" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen title="Vidéo de la recette par @${u}"></iframe><button class="x" data-close aria-label="Fermer">✕</button><small class="cr">Vidéo de @${u} sur TikTok</small>`}}

/* ================= Mode partie ================= */
const GK="carnet-game";let G=LS.get(GK,null),gInt=null,gArm=0,gLastS=null,auCtx=null,wake=null;
function auUnlock(){try{auCtx=auCtx||new (window.AudioContext||window.webkitAudioContext)();if(auCtx.state==="suspended")auCtx.resume();if(navigator.audioSession)navigator.audioSession.type="transient"}catch(e){}}
/* Son doux façon cloche : sinus + harmoniques légères, attaque courte et longue extinction (plus de signal carré qui agresse les oreilles). */
function beep(f,d,w=0,v=.28){if(!auCtx)return;try{const t=auCtx.currentTime+w,len=Math.max(d,.25)*2.2,g=auCtx.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(v,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+len);g.connect(auCtx.destination);
 for(const [m,a] of [[1,1],[2,.22],[3.01,.07]]){const o=auCtx.createOscillator(),h=auCtx.createGain();o.type="sine";o.frequency.value=f*m;h.gain.value=a;o.connect(h);h.connect(g);o.start(t);o.stop(t+len)}}catch(e){}}
/* Fin du repos : petit carillon montant (do, mi, sol, do), clair mais pas strident. */
function chime(w=0){[[523,0],[659,.16],[784,.32],[1047,.5]].forEach(([f,d],i)=>beep(f,i<3?.3:.9,w+d,i<3?.22:.26))}
async function lockOn(){try{if(navigator.wakeLock&&!wake&&document.visibilityState==="visible"){wake=await navigator.wakeLock.request("screen");wake.addEventListener("release",()=>{wake=null})}}catch(e){}}
function lockOff(){try{wake&&wake.release()}catch(e){}wake=null}
const gSave=()=>LS.set(GK,G), gList=()=>G.list||TRAIN[G.day].x, gEx=()=>gList()[G.ord?G.ord[G.ei]:G.ei], gNum=v=>parseFloat(String(v).replace(",","."));
const restOf=e=>(LS.get("carnet-rest",{})[e.id])||e.rest;
function gStart(day){auUnlock();G={day,ei:0,si:0,ph:"set",sets:{},start:Date.now(),fb:"",prs:[]};gSave();gOpen()}
function gOpen(){delete G.away;gSave();document.body.classList.add("g-on");$("#game").hidden=false;$("#game").scrollTop=0;lockOn();gShow()}
/* Séance en cours reprenable : même jour de programme, lancée aujourd'hui. */
const gToday=t=>new Date(t).toDateString()===new Date().toDateString(), gResumable=day=>!!G&&G.day===day&&G.ph!=="done"&&gToday(G.start);
function gBtns(d,lbl){return gResumable(d)?`<button class="btn" data-play="${d}">▶ Reprendre ma séance (${Math.min(G.ei+1,gList().length)}/${gList().length})</button><button class="btn ghost" data-gnew="${d}">Démarrer une nouvelle séance</button><button class="link" data-gcancel style="color:var(--bad)">Annuler la séance</button>`:`<button class="btn" data-play="${d}">${lbl}</button>`}
/* Quitter : on garde tout pour reprendre plus tard. */
function gHide(){clearInterval(gInt);G.away=1;gSave();$("#game").hidden=true;document.body.classList.remove("g-on");lockOff();render()}
/* Abandon d'une séance en cours : les séries déjà faites sont enregistrées dans le carnet. */
function gDrop(){if(!G)return;const L=gList();for(let i=G.ei;i<L.length;i++){const ex=L[G.ord?G.ord[i]:i];if(ex&&(G.sets[ex.id]||[]).some(Boolean))gFinishEx(ex)}clearInterval(gInt);G=null;LS.del(GK)}
/* Annuler : rien n'est gardé, y compris les exercices déjà notés pendant cette séance. */
function gCancel(){if(!G)return;const ids=new Set(gList().map(x=>x.id));let ch=false;for(const id of ids)if(store[id]){const n=store[id].length;store[id]=store[id].filter(h=>h.t<G.start);if(store[id].length!==n)ch=true;if(!store[id].length)delete store[id]}
 if(ch)persist();gClose();toast("Séance annulée : rien n'a été enregistré.")}
function gClose(){clearInterval(gInt);G=null;LS.del(GK);$("#game").hidden=true;document.body.classList.remove("g-on");lockOff();render()}
function gTop(){const n=gList().length;return `<div class="g-top"><button id="g-quit" aria-label="Quitter la partie">✕</button><div class="g-segs">${gList().map((x,i)=>`<i class="${i<G.ei?"ok":i===G.ei&&G.ph!=="done"?"now":""}"></i>`).join("")}</div><span>${Math.min(G.ei+1,n)}/${n}</span></div>`}
/* Poids à vide des machines (presse, hack squat, Smith) : valeur retenue par exercice (coach-mach, en kg), sinon celle de la salle.
   On saisit les disques ajoutés (k) ; la série garde le poids à vide (m). Progression et records restent sur les disques (comparables avec l'historique),
   le volume compte la charge totale. */
const machKg=id=>{const d=machDef(PROF&&PROF.gym,id);if(!d)return null;const v=LS.get("coach-mach",{})[id];return v!=null?v:d.kg};
const machW=id=>(machDef(PROF&&PROF.gym,id)||{}).bar?"barre":"machine";
const machTot=(kU,m,id)=>{const k=fromU(gNum(kU)||0);return `Charge totale : <b>${kgS(k+m)}</b> <span class="muted">(disques ${kgS(k)} + ${machW(id)} ${kgS(m)})</span>`};
function machBox(ex,kU){const m=machKg(ex.id);if(m==null)return"";const d=machDef(PROF.gym,ex.id),mine=LS.get("coach-mach",{})[ex.id]!=null;
 return `<div class="row small" style="gap:8px;align-items:center"><label for="g-mv" class="muted">${d.bar?"Barre":"Machine"} à vide :</label><input id="g-mv" class="txt" inputmode="decimal" value="${fr(kIn(m),1).replace(/,0$/,"")}" style="width:76px;padding:6px 8px;text-align:center" aria-label="Poids à vide de la ${machW(ex.id)}"><span>${wU()}</span>${!mine&&!d.ok?`<small class="muted">valeur indicative, vérifie sur ta machine</small>`:""}</div><div class="small" id="g-tot">${machTot(kU,m,ex.id)}</div>`}
function gSuggest(ex){const last=lastLog(ex.id),ls=last?.sets||[],prev=ls[G.si]||ls[ls.length-1],before=(G.sets[ex.id]||[])[G.si-1];
 const up=!!last&&ls.length>=ex.s&&ls.every(s=>s.r>=ex.r[1]);
 let k=before?before.k:prev?(up?prev.k+2.5:prev.k):(ex.kg??""),r=before?before.r:prev?(up?ex.r[0]:Math.min(prev.r+1,ex.r[1])):ex.r[0];
 if(!before&&prev&&deloadOn()){k=r25(prev.k*.85);r=ex.r[0]}
 return{prev,up:up&&!deloadOn(),k:G.dk??(k===""?"":kIn(k)),r:G.dr??r}}
function gShow(){clearInterval(gInt);const box=$("#g-in");
 if(G.ph==="set"){const ex=gEx(),s=gSuggest(ex);
  box.innerHTML=gTop()+`<div class="lab">Exercice ${G.ei+1} · Série ${G.si+1}/${ex.s}</div><h2 class="g-name">${ex.n}</h2>
  ${animTag(ex.id,ex.a,esc(ex.n),"g-anim")}<div class="small">${ex.c}</div>
  <div class="g-goal"><span>Objectif <b>${ex.r[0]}–${ex.r[1]} reps</b></span><span>${s.prev?`Dernière fois : ${kgS(s.prev.k)}${s.prev.m?` + ${kgS(s.prev.m)} ${machW(ex.id)}`:""} × ${s.prev.r}`:ex.kg?`Ta charge de départ : ${kgS(ex.kg)}`:"Première fois : reste léger et propre"}</span></div>
  ${s.up&&G.si===0?`<div class="g-up">Tu as tout validé la dernière fois : on monte d'un cran.</div>`:""}${deloadOn()&&G.si===0?`<div class="g-up">Semaine de décharge : charges −15 %, garde 2-3 reps en réserve.</div>`:""}
  <div class="g-step"><label for="g-k">${machKg(ex.id)!=null?"Disques":wU()==="lb"?"Livres":"Kilos"}</label><button data-gs="k" data-v="-${wU()==="lb"?5:2.5}" aria-label="Moins ${wU()==="lb"?"5 lb":"2,5 kg"}">−</button><input id="g-k" inputmode="decimal" value="${s.k}" placeholder="0"><button data-gs="k" data-v="${wU()==="lb"?5:2.5}" aria-label="Plus ${wU()==="lb"?"5 lb":"2,5 kg"}">+</button></div>
  ${machBox(ex,s.k)}<div class="g-step"><label for="g-r">Reps</label><button data-gs="r" data-v="-1" aria-label="Moins une rep">−</button><input id="g-r" inputmode="numeric" value="${s.r}"><button data-gs="r" data-v="1" aria-label="Plus une rep">+</button></div>
  <div class="g-msg" id="g-msg"></div><button class="btn" id="g-done">Série terminée</button><button class="link" id="g-skip">${G.ei<gList().length-1?"↪ Revenir dessus à la fin":"Terminer sans cet exercice"}</button><button class="link" id="g-cancel" style="color:var(--bad)">Annuler la séance</button>`;return}
 if(G.ph==="rest"){const nx=gEx();
  box.innerHTML=gTop()+`<div class="g-fb">${G.fb}</div><div class="lab" style="text-align:center">Repos</div>
  <div class="g-ring"><svg viewBox="0 0 120 120"><circle class="bg" cx="60" cy="60" r="52"/><circle class="fg" id="g-arc" cx="60" cy="60" r="52" stroke-dasharray="326.7" stroke-dashoffset="0"/></svg><b id="g-t" role="timer"></b></div>
  <div class="g-adj"><button id="g-m" aria-label="Moins 15 secondes">−15</button><button id="g-go">Je suis prêt</button><button id="g-p" aria-label="Plus 15 secondes">+15</button></div>
  <div class="g-next"><small>Ensuite</small><b>${nx.n}</b><span>Série ${G.si+1}/${nx.s} · objectif ${nx.r[0]}–${nx.r[1]} reps</span></div>`;
  gLastS=null;gInt=setInterval(gTick,200);gTick();return}
 const st=gStats(),X=xpProf();if(!G.saved&&!st.n){G.saved=1;G.xp=0}if(!G.saved){X.xp+=st.xp;X.games.push({t:Date.now(),day:G.day,vol:st.vol,sets:st.n});X.games=X.games.slice(-300);LS.set("carnet-xp",X);G.saved=1;G.xp=st.xp;gSave();beep(784,.15);beep(988,.15,.16);beep(1319,.35,.32)}
 const L=level(X.xp);
 box.innerHTML=`<div class="g-win"><div class="lab">${G.t||TRAIN[G.day].t}</div><div class="big">${st.n?"Séance validée":"Aucune série notée : séance non comptée"}</div><div class="muted small">${weekGames()}/${PROF.freq} séances cette semaine</div></div>
 <div class="g-stats"><div><strong>${fr(st.vol)}</strong><small>kg soulevés</small></div><div><strong>${st.n}</strong><small>séries</small></div><div><strong>${st.min}</strong><small>minutes</small></div><div><strong>+${G.xp}</strong><small>XP gagnés</small></div></div>
 ${G.prs.length?`<div class="g-pr">Record battu : ${G.prs.join(", ")}</div>`:""}
 <div class="card stack"><b>Niveau ${L.l}</b><div class="bar" style="height:10px"><i style="width:${L.pct}%;background:var(--warn)"></i></div><small class="muted">Encore ${L.left} XP pour le niveau ${L.l+1}</small></div>
 ${coachEnd()}
 <div class="coachmsg">Maintenant : un repas avec des protéines dans les 2 heures. Ton prochain repas prévu, c'est dans l'onglet Aujourd'hui.</div>
 <button class="btn" id="g-end">Terminer</button>`}
function gTick(){if(!G||G.ph!=="rest")return;const ms=G.restEnd-Date.now(),left=Math.ceil(ms/1000),arc=$("#g-arc");
 if(ms<=0){clearInterval(gInt);const late=ms<-5000;G.ph="set";G.fb="";gSave();
  if(!late){chime();try{navigator.vibrate&&navigator.vibrate([400,150,400])}catch(e){}const f=document.createElement("div");f.className="g-flash";f.textContent="C'est reparti !";document.body.appendChild(f);setTimeout(()=>f.remove(),1300)}
  gShow();$("#game").scrollTop=0;return}
 if(arc)arc.setAttribute("stroke-dashoffset",(326.7*(1-ms/(G.restTotal*1000))).toFixed(1));
 if(left!==gLastS){gLastS=left;const t=$("#g-t");if(t)t.textContent=fmtT(left);if(left<=3)beep(660,.08,0,.14)}}
function gFinishEx(ex){const sets=(G.sets[ex.id]||[]).filter(Boolean);if(!sets.length)return;const h=store[ex.id]||[];
 const pk=h.length?Math.max(...h.flatMap(x=>x.sets.map(s=>s.k))):null,mk=Math.max(...sets.map(s=>s.k));if(pk!==null&&mk>pk)G.prs.push(ex.n);
 (store[ex.id]=h).push({d:new Date().toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit"}),t:Date.now(),sets,...(deloadOn()?{dl:1}:{})});persist()}
/* Machine prise : l'exercice repart en fin de séance (séries déjà faites gardées) ; le dernier restant se termine tel quel. */
function gSkip(){const n=gList().length;if(G.ei>=n-1){gNext(false);return}const ex=gEx();G.ord=G.ord||[...Array(n).keys()];
 G.ord.push(G.ord.splice(G.ei,1)[0]);const nx=gEx();G.dk=G.dr=undefined;G.si=Math.min((G.sets[nx.id]||[]).length,nx.s-1);G.ph="set";gSave();gShow();$("#game").scrollTop=0;toast(`${ex.n} : remis à la fin de ta séance.`)}
function gNext(rest){const ex=gEx();G.dk=G.dr=undefined;
 if(G.si>=ex.s||!rest){gFinishEx(ex);G.ei++;G.si=0}
 if(G.ei>=gList().length){G.ph="done";gSave();gShow();return}
 if(rest){G.ph="rest";G.restTotal=restOf(ex);G.restEnd=Date.now()+G.restTotal*1000}else G.ph="set";
 gSave();gShow();$("#game").scrollTop=0}
function gStats(){let vol=0,n=0;for(const id in G.sets)for(const s of G.sets[id])if(s){vol+=(s.k+(s.m||0))*s.r;n++}vol=Math.round(vol);return{vol,n,min:Math.max(1,Math.round((Date.now()-G.start)/60000)),xp:Math.round(vol/10)+50}}
function gFeedback(ex,k,r){const ls=lastLog(ex.id)?.sets||[],p=ls[G.si]||ls[ls.length-1],xp=Math.round(k*r/10);let t;
 if(!p)t="Première marque posée";else if(k>p.k)t=`+${kgS(k-p.k)} ! Ça monte`;else if(k===p.k&&r>p.r)t=`+${r-p.r} rep ! Ça progresse`;else if(k===p.k&&r===p.r)t="Score égalé. Tiens bon";else t="Bien joué, garde la forme propre";
 if(r>=ex.r[1])t+=" · haut de fourchette";return `${t}<small>+${xp} XP</small>`}

/* ================= Événements ================= */
let toastT;function toast(m){let t=$("#toast");if(!t){t=document.createElement("div");t.id="toast";t.setAttribute("role","status");t.style.cssText="position:fixed;left:50%;bottom:calc(96px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:50;background:var(--card2);border:1px solid var(--pink);border-radius:14px;padding:10px 16px;font-size:14px;box-shadow:var(--glow);max-width:90vw";document.body.appendChild(t)}t.textContent=m;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,3200)}
function saveWeight(){const v=+fromU(gNum($("#w-in").value)).toFixed(2);if(!(v>30&&v<250)){toast(wU()==="lb"?"Indique ton poids en livres, par exemple 160.":"Indique ton poids en kg, par exemple 72,5.");return}
 const W=LS.get("coach-weights",[]),now=Date.now();if(W.length&&now-W[W.length-1].t<DAY/2)W[W.length-1].kg=v;else W.push({t:now,kg:v});LS.set("coach-weights",W);
 const m=coachAdjust();if(m)LS.set("coach-msg",m);toast(m?"Pesée enregistrée. Ton coach a analysé ta courbe.":"Pesée enregistrée.");render()}
document.addEventListener("input",e=>{const t=e.target;
 if(view==="ob"){if(t.id==="i-name"){A.name=t.value;if(!PROF)LS.set("coach-draft",{A,obI})}else if(t.id==="i-prog"){A.progTxt=t.value;const h=$("#prog-hit");if(h)h.innerHTML=progHint(t.value);if(!PROF)LS.set("coach-draft",{A,obI})}else if(t.id==="i-allerg"){A.allergTxt=t.value;$("#allerg-hit").innerHTML=allergHint(t.value);if(!PROF)LS.set("coach-draft",{A,obI})}else if(t.dataset.s){const k=t.dataset.s,v=+t.value;A[k]=v;
   if(k==="budget"){$("#v-budget").textContent=v;const pm=v/(7*A.meals);$("#v-pm").textContent=eur(pm)+" / repas";$("#v-lvl").textContent=pm<1.6?"Serré":pm<3?"Confortable":"Large"}else $("#v-"+k).textContent=`${fr(v,k==="w"||k==="tw"?1:0)} ${t.dataset.u}`;if(k==="tw"||k==="w"){const g=$("#gp");if(g)g.innerHTML=gpBox(A);obRefresh()}}
  obRefresh();return}
 if(G&&(t.id==="g-k"||t.id==="g-mv")){const ex=gEx();if(t.id==="g-k"){G.dk=t.value;gSave()}else{const v=gNum(t.value);if(!isNaN(v)&&v>=0){const M=LS.get("coach-mach",{});M[ex.id]=+fromU(v).toFixed(2);LS.set("coach-mach",M)}}
  const m=machKg(ex.id),o=$("#g-tot");if(o&&m!=null)o.innerHTML=machTot($("#g-k").value,m,ex.id)}else if(G&&t.id==="g-r"){G.dr=t.value;gSave()}});
document.addEventListener("keydown",e=>{if(e.key==="Enter"&&view==="ob"&&e.target.id==="i-name"&&FLOW[obI].ok())$("#ob-next").click()});
document.addEventListener("click",e=>{if(e.target.id==="sheet"){e.target.remove();return}const t=e.target.closest("button,[data-close]");if(!t)return;const D=t.dataset;
 if(t.id==="sheet"||D.close!==undefined){$("#sheet")?.remove();return}
 if(t.id==="plan-go"){view="today";render();return}
 if(t.id==="plan-adj"||t.id==="adj"){startAdjust();return}
 if(t.id==="plan-see"){showPlan();return}
 if(D.gym){if(A.gym!==D.gym)A.equip=GYMS.find(g=>g.v===D.gym).eq;A.gym=D.gym;renderOb();return}
 if(D.eq){A.equip=A.equip.includes(D.eq)?A.equip.replace(D.eq,""):A.equip+D.eq;renderOb();return}
 if(D.wd!==undefined){const w=+D.wd;A.days=A.days.includes(w)?A.days.filter(x=>x!==w):[...A.days,w];renderOb();return}
 if(t.id==="ed-tog"){edit=!edit;render();return}
 if(t.id==="ed-reset"){delete PROF.custom[selDay];saveProg();toast("Séance du coach remise");return}
 if(D.mv){const [i,dir]=D.mv.split(",").map(Number),ids=curIds(),j=i+dir;if(j<0||j>=ids.length)return;[ids[i],ids[j]]=[ids[j],ids[i]];setCustom(ids);return}
 if(D.rm){const ids=curIds();if(ids.length<=1)return toast("Garde au moins un exercice");ids.splice(+D.rm,1);setCustom(ids);return}
 if(D.sw!==undefined){+D.sw>=0?autoSwap(+D.sw):openPicker(-1);return}
 if(D.pick){const ids=curIds();if(pickAt>=0)ids[pickAt]=D.pick;else ids.push(D.pick);$("#sheet")?.remove();setCustom(ids);toast(pickAt>=0?"Exercice remplacé":"Exercice ajouté");return}
 /* questionnaire */
 if(view==="ob"&&t.id!=="bk-i"){
  if(D.o){A[D.o]=isNaN(+D.v)?D.v:+D.v;if(D.o==="split")return renderOb();if(D.o==="hasProg"){renderOb();if(D.v==="oui")setTimeout(()=>{const x=$("#i-prog");if(x)x.focus()},50);return}$$(`[data-o="${D.o}"]`).forEach(b=>b.setAttribute("aria-pressed",b===t));obRefresh();return}
  if(D.ms){const s=mealsOf(A);if(s.includes(D.ms)&&s.length===1)return toast("Garde au moins un repas.");A.mealSel=s.includes(D.ms)?s.filter(x=>x!==D.ms):MEALK.filter(k=>s.includes(k)||k===D.ms);A.meals=A.mealSel.length;renderOb();return}
  if(D.m){let a=A[D.m]||[];if(D.v==="none")a=[];else a=a.includes(D.v)?a.filter(x=>x!==D.v):[...a,D.v];A[D.m]=a;renderOb();return}
  if(D.c){A[D.c]=+D.v;renderOb();return}
  if(D.t){A.taste=A.taste||{};const v=A.taste[D.t]||0,n=v===0?1:v===1?-1:0;if(n)A.taste[D.t]=n;else delete A.taste[D.t];renderOb();return}
  if(D.av!==undefined){const w=+D.av,a=A.avail||[...WEEK];A.avail=a.includes(w)?a.filter(x=>x!==w):[...a,w];renderOb();return}
  if(t.id==="nope-clr"){A.nope=[];renderOb();return}
  if(t.id==="ob-back"){if(obI>0){obI--;renderOb()}else if(PROF){view=FLOW===ADJ?"train":FLOW.ref==="nut"&&PROF.refined.nut?"food":"me";render()}else{LS.del("coach-draft");view="today";vPortal()}return}
  if(t.id==="ob-next"){if(!FLOW[obI].ok())return;if(obI<FLOW.length-1){obI++;renderOb();window.scrollTo(0,0)}else if(FLOW===ADJ)saveAdjust();else if(FLOW===GOUTS)saveTastes();else if(FLOW.ref)saveRefine();else buildScreen();return}
  return}
 /* partie */
 if(G&&t.closest("#game")){auUnlock();
  if(D.gs){const inp=$("#g-"+D.gs),v=Math.max(0,(gNum(inp.value)||0)+ +D.v);inp.value=D.gs==="k"?+v.toFixed(2):Math.round(v);inp.dispatchEvent(new Event("input",{bubbles:true}));return}
  if(t.id==="g-done"){const ex=gEx(),k=+fromU(gNum($("#g-k").value)).toFixed(2),r=parseInt($("#g-r").value);if(isNaN(k)||isNaN(r)||r<1){$("#g-msg").textContent="Indique les kilos et les reps de ta série (0 kg pour le poids du corps).";return}
   const m=machKg(ex.id);(G.sets[ex.id]=G.sets[ex.id]||[])[G.si]=m!=null?{k,r,m}:{k,r};G.fb=gFeedback(ex,k,r);G.si++;if(G.si>=ex.s)G.fb=`Exercice terminé !<small>${G.fb.split("<small>")[1].replace("</small>","")}</small>`;gNext(true);return}
  if(t.id==="g-skip"){gSkip();return}
  if(t.id==="g-cancel"){if(confirm("Annuler cette séance ? Rien ne sera enregistré."))gCancel();return}
  if(t.id==="g-m"||t.id==="g-p"){G.restEnd=Math.max(Date.now()+1000,G.restEnd+(t.id==="g-p"?15000:-15000));G.restTotal=Math.max(G.restTotal,Math.ceil((G.restEnd-Date.now())/1000));gSave();gTick();return}
  if(t.id==="g-go"){G.ph="set";G.fb="";gSave();gShow();$("#game").scrollTop=0;return}
  if(t.id==="g-end"){gClose();return}
  if(t.id==="g-quit"){if(G.ph==="done"){gClose();return}gHide();toast("Séance mise en pause : reprends-la depuis l'accueil.");return}
  return}
 if(D.tab){view=D.tab;$("#sheet")?.remove();render();window.scrollTo(0,0);return}
 if(D.play!==undefined){if(gResumable(+D.play))gOpen();else{gDrop();gStart(+D.play)}return}
 if(D.gcancel!==undefined){if(confirm("Annuler cette séance ? Rien ne sera enregistré."))gCancel();return}
 if(D.gnew!==undefined){if(!confirm("Démarrer une nouvelle séance ? Les séries déjà faites restent dans ton carnet."))return;gDrop();gStart(+D.gnew);return}
 if(D.sday!==undefined){selDay=+D.sday;render();return}
 if(D.nday!==undefined){nutDay=+D.nday;render();return}
 if(D.nt){nutTab=D.nt;render();return}
 if(D.food){openFood(D.food,+D.g||0,D.back?recBack:null);return}
 if(D.rec){openRecipe(D.rec,D.slot,D.day);return}
 if(D.swap){const old=RECI[D.swap],nw=swapMeal(D.swap,D.slot,D.day);if(nw){openRecipe(nw.id,D.slot,D.day);render();toast(`${old.n} : remplacé par ${nw.n} pour ce jour.`)}else toast("Pas d'autre plat de ce type.");return}
 if(D.nope){const old=RECI[D.nope],nw=dislike(D.nope);$("#sheet")?.remove();render();toast(nw?`${old.n} : remplacé par ${nw.n}. Il ne reviendra plus.`:"Recette écartée.");return}
 if(t.id==="tastes"){startTastes();return}
 if(D.eat){const E=LS.get("coach-eaten",{}),k=todayKey();E[k]=E[k]||{};E[k][D.eat]=!E[k][D.eat];for(const d in E)if(d<new Date(Date.now()-14*DAY).toISOString().slice(0,10))delete E[d];LS.set("coach-eaten",E);render();return}
 if(D.shop){const c=LS.get("coach-shop",{});c[D.shop]=!c[D.shop];LS.set("coach-shop",c);render();return}
 if(t.id==="shop-reset"){LS.set("coach-shop",{});render();return}
 if(t.id==="renut"){$("#sheet")?.remove();const el=document.createElement("div");el.id="sheet";el.innerHTML=`<div class="in stack" role="dialog" aria-label="Refaire mon plan nutrition"><h2 style="margin:18px 0 0">Refaire ton plan nutrition ?</h2><p class="small muted" style="margin:0">Tu repasses tout le questionnaire : poids, objectif, aliments, budget, magasins… Tes réponses actuelles sont déjà remplies, change seulement ce qui a bougé. Ton coach recalcule ensuite tes calories à partir de ton programme et de ton objectif.</p><p class="small" style="margin:0;color:var(--warn)">Ta semaine de repas actuelle et ta liste de courses cochée seront remplacées.</p><button class="btn" data-ref="nut">Oui, refaire mon plan</button><button class="btn ghost" data-close>Annuler</button></div>`;document.body.appendChild(el);return}
 if(t.id==="regen"){LS.set("coach-week",{...genWeek(Date.now()%1e9),v:2});LS.set("coach-shop",{});render();toast("Nouvelle semaine de repas générée.");return}
 if(t.id==="w-save"){saveWeight();return}
 if(t.id==="redo"){startOnboarding(true);return}
 if(t.id==="restart"){startFresh();return}
 if(t.id==="bk-x"){const s=JSON.stringify(bkData());$("#bk-t").value=s;bkMark("code");
  (navigator.clipboard?navigator.clipboard.writeText(s):Promise.reject()).then(()=>$("#bk-m").textContent="Copié. Colle-le dans tes notes.",()=>$("#bk-m").textContent="Sélectionne et copie le texte ci-dessus.");return}
 if(t.id==="bk-i"){try{bkApply(JSON.parse($("#bk-t").value))}catch(err){$("#bk-m").textContent="Code illisible : rien n'a été modifié."}return}
 if(t.id==="wipe"){if(Date.now()-gArm>3000){gArm=Date.now();t.textContent="Appuie encore pour tout effacer";return}[...BK_KEYS,"coach-draft","coach-bk","coach-sync",GK].forEach(k=>LS.del(k));PROF=null;store={};TRAIN=null;startOnboarding(false)}
});
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"&&G){lockOn();if(G.ph==="rest")gTick()}});

/* ================= Démarrage ================= */
/* Alexis : séances notées avant le poids à vide (disques seuls). Presse 75,6 kg et hack squat 45 kg ajoutés une seule fois ; volumes et XP recalculés. */
function fixMach1(p){if(!p||p.fx2||!/^alexis$/i.test(p.name||"")||p.h==null)return;const M={press:75.6,hack:45},C=LS.get("carnet",{}),X=LS.get("carnet-xp",null),dy=t=>new Date(t).toDateString(),add={};
 for(const id in M)for(const e of C[id]||[])for(const s of e.sets||[])if(s&&s.m==null){s.m=M[id];add[dy(e.t)]=(add[dy(e.t)]||0)+M[id]*(s.r||0)}
 if(X&&X.games)for(const g of X.games){const a=add[dy(g.t)];if(a){g.vol=Math.round((g.vol||0)+a);X.xp=(X.xp||0)+Math.round(a/10);delete add[dy(g.t)]}}
 if(X)LS.set("carnet-xp",X);LS.set("carnet",C);store=C;const CM=LS.get("coach-mach",{});for(const id in M)if(CM[id]==null)CM[id]=M[id];LS.set("coach-mach",CM);p.fx2=1}
fixMach1(PROF);
/* Romy : une séance vide (0 série, 16/11 21 h 53) comptée en plus de sa vraie séance (16/11 23 h 21, 23 séries). On garde celle qui a des séries, la vide est supprimée pour de bon (notée dans « coach-del ») ; XP et bilan se recalculent. Une seule fois. */
function fixRomy1(p){if(!p||p.fx3||!/^rom/i.test(p.name||""))return;const X=LS.get("carnet-xp",null),g=X&&X.games||[];
 if(g.length===2){const k=[...g].sort((a,b)=>(b.sets||0)-(a.sets||0)||(b.vol||0)-(a.vol||0)||a.t-b.t)[0],o=g.find(x=>x!==k);X.games=[k];LS.set("carnet-xp",X);const D=LS.get("coach-del",{});D.g=[...(D.g||[]),o.t];LS.set("coach-del",D)}p.fx3=1}
fixRomy1(PROF);
PROF=migrate(PROF);if(PROF){LS.set("coach-profile",PROF);TRAIN=buildTraining(PROF);if(G&&!TRAIN[G.day]){G=null;LS.del(GK)}}
render();suiviInit();reglagesInit();jeuInit();
if(PROF&&G){if(G.ph!=="done"&&!gToday(G.start))gDrop();else if(!G.away)gOpen()}
try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}
if("serviceWorker"in navigator)addEventListener("load",()=>{const had=!!navigator.serviceWorker.controller;navigator.serviceWorker.register("sw.js").then(r=>r.update()).catch(()=>{});navigator.serviceWorker.addEventListener("controllerchange",()=>{if(had)location.reload()});
 /* Sur iPhone, l'appli rouverte depuis l'icône reprend sans redémarrer : on cherche la nouvelle version à chaque retour à l'écran. */
 document.addEventListener("visibilitychange",()=>{if(!document.hidden)navigator.serviceWorker.getRegistration().then(r=>r&&r.update()).catch(()=>{})})});
try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}

/* Renommer un exercice : nom perso gardé dans le profil, vide = nom d'origine. */
document.addEventListener("click",e=>{const t=e.target.closest("[data-rn]");if(!t||!PROF)return;const id=t.dataset.rn,cur=(PROF.names||{})[id]||(Object.values(TRAIN||{}).flatMap(S=>S.x).find(x=>x.id===id)||{}).n||EX[id][0];
 const v=prompt("Nouveau nom de l'exercice (vide = nom d'origine)",cur);if(v===null)return;const n=v.replace(/[<>&"]/g,"").trim().slice(0,50);
 PROF.names={...(PROF.names||{})};if(n)PROF.names[id]=n;else delete PROF.names[id];LS.set("coach-profile",PROF);TRAIN=buildTraining(PROF);render();toast(n?"Renommé : "+n:"Nom d'origine remis")});
