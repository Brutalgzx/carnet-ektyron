"use strict";
/* « Mon corps » : avatar 3D à curseurs de muscles et aperçu de la silhouette au poids visé.
   Maillage et déformations construits par renders/avatar.py (Blender, métaballes, aucun modèle tiers) → avatar/avatar_m.bin, avatar_f.bin.
   three.js (vendor/three.min.js) n'est chargé qu'à l'ouverture de la page. Les curseurs libres sont gardés dans « coach-avatar ». */

const AV_M=[["pecs","Pecs","🛡️"],["dos","Dos","🦅"],["epaules","Épaules","🎯"],["bras","Bras","💪"],["abdos","Abdos","🧱"],["trapezes","Trapèzes","🏔️"],["jambes","Jambes","🦵"],["fessiers","Fessiers","🍑"],["mollets","Mollets","🦶"],["gras","Masse grasse","🫧"]];
const AV_FILE="avatar/avatar_%.bin?v=2";
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
let AV3=null;
function avLoadThree(){return window.THREE?Promise.resolve():new Promise((ok,ko)=>{const s=document.createElement("script");s.src="vendor/three.min.js";s.onload=ok;s.onerror=ko;document.head.appendChild(s)})}
const AV_BIN={};
function avLoadBin(sex){return AV_BIN[sex]||(AV_BIN[sex]=fetch(AV_FILE.replace("%",sex)).then(r=>{if(!r.ok)throw 0;return r.arrayBuffer()}).then(avParse))}
/* Format AVT1 : en-tête (nv, nt, nm), boîte (min xyz, taille xyz), positions u16, triangles u16, puis par déformation : échelle f32 + valeurs i8 le long de la normale. */
function avParse(buf){const dv=new DataView(buf),nv=dv.getUint32(4,1),nt=dv.getUint32(8,1),nm=dv.getUint32(12,1),lo=[0,1,2].map(i=>dv.getFloat32(16+4*i,1)),sz=[0,1,2].map(i=>dv.getFloat32(28+4*i,1));
 let o=40;const q=new Uint16Array(buf,o,nv*3);o+=nv*6;const idx=new Uint16Array(buf.slice(o,o+nt*6));o+=nt*6;if(nt%2)o+=2;
 const P=new Float32Array(nv*3);for(let i=0;i<nv;i++){const x=lo[0]+q[i*3]/65535*sz[0],y=lo[1]+q[i*3+1]/65535*sz[1],z=lo[2]+q[i*3+2]/65535*sz[2];P[i*3]=x;P[i*3+1]=z;P[i*3+2]=-y}
 const D=[];for(let m=0;m<nm;m++){const sc=dv.getFloat32(o,1);o+=4;const a=new Int8Array(buf,o,nv),f=new Float32Array(nv);for(let i=0;i<nv;i++)f[i]=a[i]*sc;D.push(f);o+=nv+(nv%4?4-nv%4:0)}
 return{nv,P,idx,D,h:sz[2]}}

function corpsMount(){const cv=$("#av-cv");if(!cv)return;const sex=PROF.sex==="f"?"f":"m";
 Promise.all([avLoadThree(),avLoadBin(sex)]).then(([,M])=>{if(!document.body.contains(cv))return;avBuild(cv,M);$("#av-load")?.remove()})
  .catch(()=>{const l=$("#av-load");if(l)l.textContent="Avatar indisponible hors ligne. Reviens avec du réseau."})}

function avBuild(cv,M){const T=THREE,box=cv.parentNode,W=box.clientWidth,H=box.clientHeight;
 const R=new T.WebGLRenderer({canvas:cv,antialias:true,alpha:true});R.setPixelRatio(Math.min(2,devicePixelRatio||1));R.setSize(W,H,false);
 R.outputEncoding=T.sRGBEncoding;R.toneMapping=T.ACESFilmicToneMapping;R.toneMappingExposure=1.05;
 const sc=new T.Scene(),cam=new T.PerspectiveCamera(30,W/H,.1,20);cam.position.set(0,.98,4.1);cam.lookAt(0,.9,0);
 sc.add(new T.HemisphereLight(0xfff4ea,0x24262c,.75));
 const key=new T.DirectionalLight(0xffffff,1.6);key.position.set(1.6,2.6,2.4);sc.add(key);
 const rim=new T.DirectionalLight(0xffb27a,1.1);rim.position.set(-2.2,1.6,-2.4);sc.add(rim);
 const fill=new T.DirectionalLight(0x9fb7ff,.35);fill.position.set(-2,.6,2);sc.add(fill);
 const g=new T.BufferGeometry(),pos=new Float32Array(M.P);g.setAttribute("position",new T.BufferAttribute(pos,3));g.setIndex(new T.BufferAttribute(M.idx,1));g.computeVertexNormals();
 const N0=avSmoothN(g.attributes.normal.array,M.idx,M.nv),col=new Float32Array(M.nv*3).fill(1);g.setAttribute("color",new T.BufferAttribute(col,3));
 const mat=new T.MeshStandardMaterial({color:0xd9d2ca,roughness:.52,metalness:.04,vertexColors:true});
 const mesh=new T.Mesh(g,mat),grp=new T.Group();grp.add(mesh);sc.add(grp);
 const floor=new T.Mesh(new T.CircleGeometry(.55,48),new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.06}));floor.rotation.x=-Math.PI/2;floor.position.y=0;grp.add(floor);
 let rot=.5,auto=true,drag=null,dirty=true,raf=0,glow=0;
 const update=()=>{const S=AVS,k=AV_M.map(([m])=>av_toM(S.v[m]));for(let i=0;i<M.nv;i++){let d=0;for(let j=0;j<k.length;j++)d+=M.D[j][i]*k[j];pos[i*3]=M.P[i*3]+N0[i*3]*d;pos[i*3+1]=M.P[i*3+1]+N0[i*3+1]*d;pos[i*3+2]=M.P[i*3+2]+N0[i*3+2]*d}
  const si=S.sel?AV_M.findIndex(([m])=>m===S.sel):-1;if(si>=0){const D=M.D[si];let mx=1e-4;for(let i=0;i<M.nv;i++)if(D[i]>mx)mx=D[i];for(let i=0;i<M.nv;i++){const t=Math.max(0,Math.min(1,D[i]/mx*1.6))*glow;col[i*3]=1;col[i*3+1]=1-.45*t;col[i*3+2]=1-.85*t}}else col.fill(1);
  g.attributes.position.needsUpdate=true;g.attributes.color.needsUpdate=true;g.computeVertexNormals()};
 const loop=()=>{if(!document.body.contains(cv)){R.dispose();g.dispose();AV3=null;return}raf=requestAnimationFrame(loop);
  if(auto)rot+=.004;if(AVS.sel&&glow<1){glow=Math.min(1,glow+.08);dirty=true}else if(!AVS.sel&&glow>0){glow=Math.max(0,glow-.06);dirty=true}
  if(dirty){update();dirty=false}grp.rotation.y=rot;R.render(sc,cam)};
 cv.addEventListener("pointerdown",e=>{drag={x:e.clientX,r:rot};auto=false;cv.setPointerCapture(e.pointerId)});
 cv.addEventListener("pointermove",e=>{if(drag)rot=drag.r+(e.clientX-drag.x)*.012});
 const up=()=>{drag=null};cv.addEventListener("pointerup",up);cv.addEventListener("pointercancel",up);
 AV3={refresh:()=>{dirty=true}};loop()}

/* Direction de gonflement : normales moyennées avec les voisins, non renormalisées. Dans les plis (aisselle, entrejambe)
   les normales s'opposent, la moyenne raccourcit et le gonflement s'y atténue au lieu de faire des pointes. */
function avSmoothN(n0,idx,nv){const nb=Array.from({length:nv},()=>new Set());for(let t=0;t<idx.length;t+=3){const a=idx[t],b=idx[t+1],c=idx[t+2];nb[a].add(b).add(c);nb[b].add(a).add(c);nb[c].add(a).add(b)}
 const L=nb.map(s=>[...s]);let n=Float32Array.from(n0);for(let it=0;it<6;it++){const o=new Float32Array(nv*3);for(let i=0;i<nv;i++){let x=n[i*3],y=n[i*3+1],z=n[i*3+2];for(const j of L[i]){x+=n[j*3];y+=n[j*3+1];z+=n[j*3+2]}const k=1/(L[i].length+1);o[i*3]=x*k;o[i*3+1]=y*k;o[i*3+2]=z*k}n=o}
 return n}
function avRefresh(){if(AV3)AV3.refresh()}
function avSync(){for(const [k] of AV_M){const i=$("#av-"+k),b=$("#avv-"+k);if(i)i.value=AVS.v[k];if(b)b.textContent=AVS.v[k]}avRefresh()}

document.addEventListener("input",e=>{const k=e.target.dataset&&e.target.dataset.avm;if(!k||!AVS)return;AVS.v[k]=+e.target.value;AVS.sel=k;$("#avv-"+k).textContent=AVS.v[k];
 if(AVS.mode!=="free"){AVS.mode="free";document.querySelectorAll("[data-av]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.av==="free"));const i=$("#av-info");if(i)i.textContent="Tu règles chaque muscle toi-même. Touche un curseur : le muscle s'allume sur l'avatar."}
 AVS.free={...AVS.v};LS.set("coach-avatar",{v:AVS.free});avRefresh()});
document.addEventListener("change",e=>{if(e.target.dataset&&e.target.dataset.avm&&AVS){clearTimeout(AVS.t);AVS.t=setTimeout(()=>{AVS.sel=null},1200)}});
document.addEventListener("click",e=>{const b=e.target.closest("[data-av],#av-reset");if(!b||!AVS)return;
 if(b.id==="av-reset"){avSet(PROF.tw!=null?"goal":"now");render();return}
 avSet(b.dataset.av);render()});
