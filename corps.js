"use strict";
/* « Mon corps » : avatar 3D à curseurs de muscles et aperçu de la silhouette au poids visé.
   Corps humain MakeHuman (CC0) préparé par renders/avatar_mh.py → avatar/mh_m.bin, mh_f.bin.
   three.js (vendor/three.min.js) n'est chargé qu'à l'ouverture de la page. Les curseurs libres sont gardés dans « coach-avatar ». */

const AV_M=[["pecs","Pecs","🛡️"],["dos","Dos","🦅"],["epaules","Épaules","🎯"],["bras","Bras","💪"],["abdos","Abdos","🧱"],["trapezes","Trapèzes","🏔️"],["jambes","Jambes","🦵"],["fessiers","Fessiers","🍑"],["mollets","Mollets","🦶"],["gras","Masse grasse","🫧"]];
let AVS=null; /* état de la page : {mode, v:{muscle:curseur 0..100}} */
const av_toM=s=>(s-20)/57, av_toS=m=>Math.max(0,Math.min(100,Math.round(20+m*57)));

/* Estimation (repère, pas une promesse) : masse grasse par l'IMC (Deurenberg), masse maigre → indice de masse non grasse (FFMI).
   Prise de poids : une part en muscle selon le niveau, le reste en gras. Perte : surtout du gras. Les zones prioritaires reçoivent plus du muscle gagné. */
function avEstimate(target){const p=PROF,m=p.sex!=="f",h=(p.h||175)/100,w=curWeight()||p.w||70,bmi=w/(h*h);
 const bf=Math.max(6,Math.min(45,1.2*bmi+.23*(p.age||30)-10.8*(m?1:0)-5.4))/100;let fm=w*bf,lbm=w-fm;
 if(target&&p.tw!=null){const d=p.tw-w,lv={deb:.6,int:.5,av:.4}[p.level]||.5;
  if(d>=0){lbm+=d*lv;fm+=d*(1-lv)}else{lbm+=d*.15;fm+=d*.85}
  if(p.goal==="recompo"){const r=Math.min(3,(p.months||4)*.3*lv);lbm+=r;fm=Math.max(w*.05,fm-r)}fm=Math.max(p.tw*.05,fm)}
 const ffmi=lbm/(h*h),wt=lbm+fm,base=(ffmi-(m?17:14))/5.5,fat=((fm/wt)*100-(m?15:24))/(m?15:14),v={};
 const zl=(p.prio||[]).filter(z=>z!=="none"),gain=target?base-avEstimate0():0,fz={0:1.6,1:1.35,2:1.2};
 for(const [k] of AV_M){if(k==="gras"){v[k]=av_toS(fat);continue}
  const zk=k==="mollets"?"jambes":k,i=zl.indexOf(zk),f=i>=0?(fz[i]||1.1)*(k==="mollets"?.8:1):zl.length?.85:1;
  v[k]=av_toS(avEstimate0()+gain*f)}
 return{v,kg:wt,bf:fm/wt}}
function avEstimate0(){const p=PROF,m=p.sex!=="f",h=(p.h||175)/100,w=curWeight()||p.w||70,bmi=w/(h*h),bf=Math.max(6,Math.min(45,1.2*bmi+.23*(p.age||30)-10.8*(m?1:0)-5.4))/100;return(w*(1-bf)/(h*h)-(m?17:14))/5.5}

function avState(){if(!AVS){const s=LS.get("coach-avatar",null);AVS={mode:PROF.tw!=null?"goal":"now",v:null,sel:null};if(s&&s.v)AVS.free=s.v;avSet(AVS.mode)}return AVS}
function avSet(mode){AVS.mode=mode;AVS.v=mode==="free"&&AVS.free?{...AVS.free}:avEstimate(mode==="goal").v}

function vCorps(){const p=PROF,S=avState(),now=avEstimate(false),go=p.tw!=null?avEstimate(true):null,pct=x=>fr(x*100,0)+" %";
 const back=`<div class="row" style="margin-top:-8px"><button class="chip" data-tab="me">‹ Profil</button></div>`;
 const seg=`<div class="seg"><button data-av="now" aria-pressed="${S.mode==="now"}">Aujourd'hui</button>${go?`<button data-av="goal" aria-pressed="${S.mode==="goal"}">À ${fr(p.tw,1)} kg</button>`:""}<button data-av="free" aria-pressed="${S.mode==="free"}">Libre</button></div>`;
 const info=S.mode==="free"?"Tu règles chaque muscle toi-même. Touche un curseur : le muscle s'allume sur l'avatar."
  :S.mode==="goal"?`${fr(curWeight(),1)} kg → ${fr(p.tw,1)} kg · environ ${pct(go.bf)} de masse grasse${(p.prio||[]).length?" · plus de muscle sur "+p.prio.map(zoneL).join(", ").toLowerCase():""}.`
  :`${fr(curWeight(),1)} kg · environ ${pct(now.bf)} de masse grasse.`;
 return back+`<div class="card stack av-card"><div class="av-view" id="av-view"><canvas id="av-cv" aria-label="Avatar 3D : glisse pour le faire tourner"></canvas><div class="av-load small muted" id="av-load">Chargement de l'avatar…</div></div>
  ${seg}<p class="small muted" style="margin:0" id="av-info">${info}</p></div>
 <div class="card stack"><div class="row"><div class="lab sp">Muscles</div><button class="lnk small" id="av-reset">${go?"Revenir à l'objectif":"Revenir à aujourd'hui"}</button></div>
  ${AV_M.map(([k,l,e])=>`<div class="sl av-sl"><div class="row"><label for="av-${k}" class="sp">${e} ${l}</label><b id="avv-${k}">${S.v[k]}</b></div><input type="range" id="av-${k}" data-avm="${k}" min="0" max="100" step="1" value="${S.v[k]}"></div>`).join("")}
  <p class="small muted" style="margin:0">Estimation à partir de ta taille, ton âge, ton poids et ton niveau : la génétique, le sommeil et la régularité changent beaucoup le résultat. Pas un avis médical.</p></div>`}

/* ================= Rendu 3D ================= */
/* Corps humain MakeHuman (CC0), exporté par renders/avatar_mh.py → avatar/mh_m.bin, mh_f.bin.
   Chaque curseur ajoute sa cible (vecteurs de déplacement des sommets), comme les curseurs de MakeHuman. */
let AV3=null;
const AV_FILE="avatar/mh_%.bin?v=2",AV_GAIN={pecs:1.1,dos:1,epaules:1.5,bras:1.7,abdos:1.6,trapezes:1.6,jambes:1.7,fessiers:1,mollets:1,gras:1.1};
function avLoadThree(){return window.THREE?Promise.resolve():new Promise((ok,ko)=>{const s=document.createElement("script");s.src="vendor/three.min.js";s.onload=ok;s.onerror=ko;document.head.appendChild(s)})}
const AV_BIN={};
function avLoadBin(sex){return AV_BIN[sex]||(AV_BIN[sex]=fetch(AV_FILE.replace("%",sex)).then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()}).then(avParse))}
/* Format AVT2 : en-tête (nv, triangles corps / short / yeux, nb cibles), boîte, positions u16, triangles u16,
   puis par cible : n, échelle, indices u16, déplacements i16 ×3. Ordre des cibles : AV_M puis « musc » (muscle global). */
function avParse(buf){const dv=new DataView(buf),u=o=>dv.getUint32(o,1),nv=u(4),tb=u(8),ts=u(12),te=u(16),nm=u(20),lo=[0,1,2].map(i=>dv.getFloat32(24+4*i,1)),sz=[0,1,2].map(i=>dv.getFloat32(36+4*i,1));
 let o=48;const q=new Uint16Array(buf,o,nv*3);o+=nv*6;const all=new Uint16Array(buf.slice(o,o+(tb+ts+te)*6));o+=(tb+ts+te)*6;if((tb+ts+te)%2)o+=2;
 const P=new Float32Array(nv*3);for(let i=0;i<nv*3;i++)P[i]=lo[i%3]+q[i]/65535*sz[i%3];
 const D=[];for(let m=0;m<nm;m++){const n=u(o),sc=dv.getFloat32(o+4,1);o+=8;const ids=new Uint16Array(buf.slice(o,o+n*2));o+=n*2+(n%2?2:0);const d=new Int16Array(buf.slice(o,o+n*6));o+=n*6+(n%2?2:0);
  const f=new Float32Array(n*3);let mx=0;for(let i=0;i<n*3;i++){f[i]=d[i]*sc}for(let i=0;i<n;i++)mx=Math.max(mx,Math.hypot(f[i*3],f[i*3+1],f[i*3+2]));D.push({ids,f,mx})}
 return{nv,P,body:all.subarray(0,tb*3),shorts:all.subarray(tb*3,(tb+ts)*3),eyes:all.subarray((tb+ts)*3),D,h:sz[1]}}

function corpsMount(){const cv=$("#av-cv");if(!cv)return;const sex=PROF.sex==="f"?"f":"m";
 Promise.all([avLoadThree(),avLoadBin(sex)]).then(([,M])=>{if(!document.body.contains(cv))return;avBuild(cv,M,sex);$("#av-load")?.remove()})
  .catch(()=>{const l=$("#av-load");if(l)l.textContent="Avatar indisponible hors ligne. Reviens avec du réseau."})}

function avBuild(cv,M,sex){const T=THREE,box=cv.parentNode,W=box.clientWidth,H=box.clientHeight;
 const R=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true});R.setPixelRatio(Math.min(2,devicePixelRatio||1));R.setSize(W,H,false);
 R.outputEncoding=T.sRGBEncoding;R.toneMapping=T.ACESFilmicToneMapping;R.toneMappingExposure=1.1;R.shadowMap.enabled=false;
 const sc=new T.Scene(),cam=new T.PerspectiveCamera(26,W/H,.1,20),cy=M.h*.53;cam.position.set(0,cy+.05,M.h*2.55);cam.lookAt(0,cy,0);
 sc.add(new T.HemisphereLight(0xfff1e6,0x2a2622,.65));
 const key=new T.DirectionalLight(0xfff4ea,1.9);key.position.set(1.4,2.4,2.2);sc.add(key);
 const rim=new T.DirectionalLight(0xffb27a,1.3);rim.position.set(-2.2,1.8,-2.2);sc.add(rim);
 const rim2=new T.DirectionalLight(0xbfd2ff,.6);rim2.position.set(2.4,1.2,-1.8);sc.add(rim2);
 const pos=new T.BufferAttribute(new Float32Array(M.P),3);
 const geo=ix=>{const g=new T.BufferGeometry();g.setAttribute("position",pos);g.setIndex(new T.BufferAttribute(ix,1));return g};
 const gb=geo(M.body),gs=geo(M.shorts),ge=geo(M.eyes),col=new Float32Array(M.nv*3);
 /* Teinte de peau, brassière pour le modèle femme (bande autour de la poitrine), lueur orange du muscle réglé. */
 const skin=[.78,.52,.39],cloth=[.13,.13,.15],top=new Uint8Array(M.nv);
 if(sex==="f")for(let i=0;i<M.nv;i++){const x=M.P[i*3],y=M.P[i*3+1]/M.h;if(y>.695&&y<.778&&Math.abs(x)<.15+(y-.695)*.2)top[i]=1}
 gb.setAttribute("color",new T.BufferAttribute(col,3));
 const grp=new T.Group();sc.add(grp);
 grp.add(new T.Mesh(gb,new T.MeshStandardMaterial({vertexColors:true,roughness:.58,metalness:0})));
 grp.add(new T.Mesh(gs,new T.MeshStandardMaterial({color:0x1c1d22,roughness:.85,metalness:0,polygonOffset:true,polygonOffsetFactor:-1})));
 grp.add(new T.Mesh(ge,new T.MeshStandardMaterial({color:0x2b2018,roughness:.25,metalness:0})));
 const floor=new T.Mesh(new T.CircleGeometry(.5,48),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.06}));floor.rotation.x=-Math.PI/2;grp.add(floor);
 let rot=0,auto=true,drag=null,dirty=true,glow=0,t0=performance.now();
 const update=()=>{const S=AVS,a=pos.array;a.set(M.P);const mus=AV_M.filter(([m])=>m!=="gras");let mean=0;
  AV_M.forEach(([m],j)=>{const k=av_toM(S.v[m])*AV_GAIN[m];if(m!=="gras")mean+=av_toM(S.v[m])/mus.length;if(!k)return;const {ids,f}=M.D[j];for(let n=0;n<ids.length;n++){const i=ids[n]*3;a[i]+=f[n*3]*k;a[i+1]+=f[n*3+1]*k;a[i+2]+=f[n*3+2]*k}});
  {const {ids,f}=M.D[AV_M.length],k=mean*.7;for(let n=0;n<ids.length;n++){const i=ids[n]*3;a[i]+=f[n*3]*k;a[i+1]+=f[n*3+1]*k;a[i+2]+=f[n*3+2]*k}}
  for(let i=0;i<M.nv;i++){const c=top[i]?cloth:skin;col[i*3]=c[0];col[i*3+1]=c[1];col[i*3+2]=c[2]}
  const si=S.sel?AV_M.findIndex(([m])=>m===S.sel):-1;if(si>=0&&glow>0){const {ids,f,mx}=M.D[si];for(let n=0;n<ids.length;n++){const i=ids[n],t=Math.min(1,Math.hypot(f[n*3],f[n*3+1],f[n*3+2])/mx*2.2)*glow;
   col[i*3]+=(1-col[i*3])*t;col[i*3+1]+=(.48-col[i*3+1])*t;col[i*3+2]+=(.1-col[i*3+2])*t}}
  pos.needsUpdate=true;gb.attributes.color.needsUpdate=true;gb.computeVertexNormals();gs.computeVertexNormals()};
 const loop=()=>{if(!document.body.contains(cv)){R.dispose();[gb,gs,ge].forEach(g=>g.dispose());AV3=null;return}requestAnimationFrame(loop);
  if(auto)rot=Math.sin((performance.now()-t0)/2600)*.65;if(AVS.sel&&glow<1){glow=Math.min(1,glow+.08);dirty=true}else if(!AVS.sel&&glow>0){glow=Math.max(0,glow-.06);dirty=true}
  if(dirty){update();dirty=false}grp.rotation.y=rot;R.render(sc,cam)};
 ge.computeVertexNormals();
 cv.addEventListener("pointerdown",e=>{drag={x:e.clientX,r:rot};auto=false;cv.setPointerCapture(e.pointerId)});
 cv.addEventListener("pointermove",e=>{if(drag)rot=drag.r+(e.clientX-drag.x)*.012});
 const up=()=>{drag=null};cv.addEventListener("pointerup",up);cv.addEventListener("pointercancel",up);
 AV3={refresh:()=>{dirty=true}};loop()}

function avRefresh(){if(AV3)AV3.refresh()}
function avSync(){for(const [k] of AV_M){const i=$("#av-"+k),b=$("#avv-"+k);if(i)i.value=AVS.v[k];if(b)b.textContent=AVS.v[k]}avRefresh()}

document.addEventListener("input",e=>{const k=e.target.dataset&&e.target.dataset.avm;if(!k||!AVS)return;AVS.v[k]=+e.target.value;AVS.sel=k;$("#avv-"+k).textContent=AVS.v[k];
 if(AVS.mode!=="free"){AVS.mode="free";document.querySelectorAll("[data-av]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.av==="free"));const i=$("#av-info");if(i)i.textContent="Tu règles chaque muscle toi-même. Touche un curseur : le muscle s'allume sur l'avatar."}
 AVS.free={...AVS.v};LS.set("coach-avatar",{v:AVS.free});avRefresh()});
document.addEventListener("change",e=>{if(e.target.dataset&&e.target.dataset.avm&&AVS){clearTimeout(AVS.t);AVS.t=setTimeout(()=>{AVS.sel=null},1200)}});
document.addEventListener("click",e=>{const b=e.target.closest("[data-av],#av-reset");if(!b||!AVS)return;
 if(b.id==="av-reset"){avSet(PROF.tw!=null?"goal":"now");render();return}
 avSet(b.dataset.av);render()});

/* Onglet Anatomie (moteur Atlas) : mannequin anatomique ; un groupe ou un muscle touché s'allume, avec son nom et son rôle. */
const A3D_GROUPS={pecs:["grand-pectoral","petit-pectoral","dentele-anterieur"],dos:["grand-dorsal","grand-rond","rhomboides","erecteurs-rachis"],epaules:["deltoide-anterieur","deltoide-moyen","deltoide-posterieur","supra-epineux","infra-epineux","petit-rond","subscapulaire"],bras:["biceps-brachial","brachial","triceps-brachial","brachio-radial"],abdos:["grand-droit","oblique-externe"],trapezes:["trapeze"],jambes:["droit-femoral","vaste-lateral","vaste-medial","vaste-intermediaire","biceps-femoral","semi-tendineux","semi-membraneux","grand-adducteur","sartorius","ilio-psoas"],fessiers:["grand-fessier","moyen-fessier","tenseur-fascia-lata"],mollets:["gastrocnemien","soleaire","fibulaires","tibial-anterieur"]};
const A3D_MUS={"grand-pectoral":["Grand pectoral","Rapproche le bras du corps et pousse vers l'avant : développé, pompes, écarté."],"petit-pectoral":["Petit pectoral","Sous le grand pectoral, abaisse et avance l'omoplate."],"dentele-anterieur":["Dentelé antérieur","Plaque l'omoplate contre les côtes : finit les pompes, protège l'épaule."],
"grand-dorsal":["Grand dorsal","Tire le bras vers le bas et l'arrière : tractions, tirages, rowings. Donne la largeur du dos."],"grand-rond":["Grand rond","Aide le grand dorsal à tirer le bras vers le bas."],"rhomboides":["Rhomboïdes","Serrent les omoplates : rowings, face pull. Bons pour la posture."],"erecteurs-rachis":["Érecteurs du rachis","Tiennent le dos droit : soulevé de terre, squat, extensions lombaires."],
"deltoide-anterieur":["Deltoïde antérieur","Avant de l'épaule : lève le bras devant, travaille aux développés."],"deltoide-moyen":["Deltoïde moyen","Côté de l'épaule : lève le bras sur le côté (élévations latérales). Élargit la carrure."],"deltoide-posterieur":["Deltoïde postérieur","Arrière de l'épaule : tire le bras vers l'arrière (oiseau, face pull)."],"supra-epineux":["Supra-épineux","Coiffe des rotateurs : démarre l'élévation du bras, stabilise l'épaule."],"infra-epineux":["Infra-épineux","Coiffe des rotateurs : tourne le bras vers l'extérieur."],"petit-rond":["Petit rond","Coiffe des rotateurs : rotation externe du bras."],"subscapulaire":["Subscapulaire","Coiffe des rotateurs : rotation interne du bras."],
"biceps-brachial":["Biceps","Plie le coude et tourne la paume vers le haut : curls, tractions."],"brachial":["Brachial","Sous le biceps, plie le coude quelle que soit la prise."],"triceps-brachial":["Triceps","Tend le coude : dips, extensions, développés. Les deux tiers du volume du bras."],"brachio-radial":["Brachio-radial","Avant-bras : plie le coude prise marteau."],
"grand-droit":["Grand droit","Les « tablettes » : enroule le buste (crunch), gaine le tronc."],"oblique-externe":["Oblique externe","Côtés du ventre : rotation et inclinaison du buste, gainage."],"trapeze":["Trapèze","Haut du dos et cou : hausse les épaules (shrugs) et tient les omoplates."],"sterno-cleido-mastoidien":["Sterno-cléido-mastoïdien","Cou : tourne et fléchit la tête."],
"droit-femoral":["Droit fémoral","Quadriceps : tend le genou et lève la cuisse."],"vaste-lateral":["Vaste latéral","Quadriceps, côté extérieur : tend le genou (squat, presse)."],"vaste-medial":["Vaste médial","Quadriceps, goutte au-dessus du genou : tend le genou, stabilise la rotule."],"vaste-intermediaire":["Vaste intermédiaire","Quadriceps profond : tend le genou."],"biceps-femoral":["Biceps fémoral","Ischio-jambier : plie le genou, tend la hanche (leg curl, soulevé roumain)."],"semi-tendineux":["Semi-tendineux","Ischio-jambier : plie le genou, tend la hanche."],"semi-membraneux":["Semi-membraneux","Ischio-jambier profond : plie le genou, tend la hanche."],"grand-adducteur":["Grand adducteur","Intérieur de la cuisse : serre les jambes, aide au squat."],"sartorius":["Sartorius","Le plus long muscle du corps : fléchit hanche et genou."],"ilio-psoas":["Ilio-psoas","Fléchisseur de hanche : lève la cuisse (relevés de jambes)."],
"grand-fessier":["Grand fessier","Tend la hanche : hip thrust, squat, fentes. Le plus gros muscle du corps."],"moyen-fessier":["Moyen fessier","Écarte la jambe et stabilise le bassin (abducteurs)."],"tenseur-fascia-lata":["Tenseur du fascia lata","Côté de la hanche : écarte et stabilise la jambe."],
"gastrocnemien":["Gastrocnémien","Mollet visible : monte sur la pointe des pieds jambes tendues."],"soleaire":["Soléaire","Mollet profond : travaille surtout genoux pliés (mollets assis)."],"fibulaires":["Fibulaires","Côté de la jambe : stabilisent la cheville."],"tibial-anterieur":["Tibial antérieur","Devant du tibia : relève la pointe du pied."]};
const AN={g:null,sel:null,h:null,el:null,iv:0};
const anGroupOf=id=>Object.keys(A3D_GROUPS).find(k=>A3D_GROUPS[k].includes(id))||null;
function anRoles(){const r={};if(AN.sel){const g=anGroupOf(AN.sel);if(g)for(const id of A3D_GROUPS[g])r[id]="secondaire";r[AN.sel]="principal";return r}
 const gs=AN.g==="prio"?(PROF.prio||[]).filter(k=>A3D_GROUPS[k]):AN.g?[AN.g]:[];for(const k of gs)for(const id of A3D_GROUPS[k])r[id]="principal";return r}
const anLab=k=>{const m=AV_M.find(x=>x[0]===k);return m?m[2]+" "+m[1]:k};
/* Muscle 3D → sous-groupes de MUSC (data.js), qui listent les exercices. */
const A3D_MUSC={"grand-pectoral":["pecs"],"petit-pectoral":["pecs"],"dentele-anterieur":["pecs"],"grand-dorsal":["lats","dos"],"grand-rond":["lats","dos"],"rhomboides":["dos","arr"],"erecteurs-rachis":["lomb"],
 "deltoide-anterieur":["ant"],"deltoide-moyen":["lat"],"deltoide-posterieur":["arr"],"supra-epineux":["lat"],"infra-epineux":["arr"],"petit-rond":["arr"],"subscapulaire":["arr"],
 "biceps-brachial":["bic"],"brachial":["bic"],"brachio-radial":["bic"],"triceps-brachial":["tri"],"grand-droit":["abs","core"],"oblique-externe":["obl","core"],"trapeze":["trap"],"ilio-psoas":["abs"],
 "droit-femoral":["quad"],"vaste-lateral":["quad"],"vaste-medial":["quad"],"vaste-intermediaire":["quad"],"sartorius":["quad"],"biceps-femoral":["isch"],"semi-tendineux":["isch"],"semi-membraneux":["isch"],"grand-adducteur":["add"],
 "grand-fessier":["fess"],"moyen-fessier":["add","fess"],"tenseur-fascia-lata":["add"],"gastrocnemien":["moll"],"soleaire":["moll"],"fibulaires":["moll"]};
const EXT={H:"Polyarticulaire lourd",M:"Polyarticulaire",I:"Isolation"};
function anExos(id){const ids=[...new Set((A3D_MUSC[id]||[]).flatMap(k=>MUSC[k]?MUSC[k][1]:[]))].filter(x=>EX[x]);
 const ok=x=>typeof pickOk!=="function"||pickOk(x,PROF);return ids.sort((a,b)=>ok(b)-ok(a))
  .map(x=>`<details class="an-exo"><summary><b>${esc(EX[x][0])}</b>${ok(x)?"":` <span class="small muted">· pas dans ta salle</span>`}</summary>${animTag(x,EX[x][4],esc(EX[x][0]))}<p class="small" style="margin:6px 0 0">${esc(EX[x][5])}</p><p class="small muted" style="margin:4px 0 0">${EXT[EX[x][3]]||""}</p></details>`)}
function anInfo(){if(AN.sel){const m=A3D_MUS[AN.sel]||[AN.sel,""],g=anGroupOf(AN.sel),xs=anExos(AN.sel);return `<b>${m[0]}</b>${g?` <span class="muted small">· ${anLab(g)}</span>`:""}<br><span class="small">${m[1]}</span>
  ${xs.length?`<details class="an-list" open><summary>🏋️ ${xs.length} exercice${xs.length>1?"s":""} qui le cible${xs.length>1?"nt":""}</summary>${xs.join("")}</details>`:`<p class="small muted" style="margin:6px 0 0">Pas d'exercice dédié dans le coach pour ce muscle.</p>`}`}
 return `<span class="small muted">Touche un muscle sur le mannequin pour voir son nom et son rôle. Glisse à l'horizontale pour le tourner.</span>`}
function vAnat(){const pr=(PROF.prio||[]).some(k=>A3D_GROUPS[k]);if(AN.g==null&&!AN.sel)AN.g=pr?"prio":"pecs";const g=AN.sel?null:AN.g;
 const chip=(k,l)=>`<button data-ang="${k}" aria-pressed="${g===k}">${l}</button>`;
 return `<div class="card stack">
  <div class="an3d" id="an3d"><div class="a3d-box"><div class="a3d-idle">Chargement 3D…</div><div class="a3d-ctl a3d-ghost">${["face","profil","dos","3/4"].map(v=>`<button>${v}</button>`).join("")}</div><div class="a3d-cred">Anatomie : BodyParts3D © DBCLS, CC BY 4.0 (modifié)</div></div></div>
  <div id="an-info" class="an-info">${anInfo()}</div></div>
 <div class="card stack"><div class="row"><div class="lab sp">Groupes</div><button class="lnk small" id="an-reset">↺ Réinitialiser</button></div><div class="an-chips">${(pr?chip("prio","⭐ Mes priorités"):"")+AV_M.filter(([k])=>A3D_GROUPS[k]).map(([k])=>chip(k,anLab(k))).join("")}</div></div>`}
function anRefresh(){if(AN.h)AN.h.set(anRoles());const i=$("#an-info");if(i)i.innerHTML=anInfo();document.querySelectorAll("[data-ang]").forEach(b=>b.setAttribute("aria-pressed",!AN.sel&&b.dataset.ang===AN.g))}
function an3dStop(){clearInterval(AN.iv);if(AN.h){try{AN.h.stop()}catch(e){}}AN.h=null;AN.el=null}
function anatMount(){const el=$("#an3d");if(!el)return;an3dStop();const idle=t=>{const i=el.querySelector(".a3d-idle");if(i)i.textContent=t};
 if(!window.a3dAnatomy)return idle("Anatomie 3D indisponible sur cet appareil.");
 AN.el=el;window.a3dAnatomy(el,anRoles(),id=>{AN.sel=id;anRefresh()}).then(h=>{if(AN.el!==el||!el.isConnected){h.stop();return}AN.h=h;
  AN.iv=setInterval(()=>{if(!el.isConnected)an3dStop()},1500)}).catch(()=>idle("Anatomie 3D indisponible hors ligne. Reviens avec du réseau."))}
/* Réinitialiser : plus de muscle choisi, groupe par défaut, mannequin remonté de face. */
document.addEventListener("click",e=>{if(!e.target.closest("#an-reset"))return;AN.sel=null;AN.g=(PROF.prio||[]).some(k=>A3D_GROUPS[k])?"prio":"pecs";anRefresh();anatMount()});
document.addEventListener("click",e=>{const c=e.target.closest("[data-ang]");if(!c)return;AN.g=c.dataset.ang;AN.sel=null;anRefresh()});
