/* Mini-fenêtre de séance : vignette flottante (Picture-in-Picture) + contrôles écran verrouillé (Media Session).
   La vignette est une vidéo muette tirée d'un canvas : elle ne coupe pas la musique.
   Les contrôles écran verrouillé jouent un son silencieux en boucle : ils mettent la musique en pause. */
const MINI={cv:null,vid:null,au:null,int:null,lock:false};
const miniPipOk=()=>{const v=document.createElement("video");return !!HTMLCanvasElement.prototype.captureStream&&(document.pictureInPictureEnabled||typeof v.webkitSetPresentationMode==="function")};
const miniInPip=()=>!!(document.pictureInPictureElement||(MINI.vid&&MINI.vid.webkitPresentationMode==="picture-in-picture"));

function miniState(){if(!G||!TRAIN)return null;const L=gList(),ex=gEx();
 if(G.ph==="done"||!ex)return{ph:"done",t:"Séance terminée",s:"Ouvre l'appli pour valider",big:"✓"};
 const pos=`Exo ${G.ei+1}/${L.length} · Série ${G.si+1}/${ex.s}`;
 if(G.ph==="rest"){const left=G.pz?Math.ceil(G.pz/1000):Math.max(0,Math.ceil((G.restEnd-Date.now())/1000));
  return{ph:"rest",t:ex.n,s:pos,big:fmtT(left),sub:G.pz?"En pause":"Repos",left,tot:G.restTotal}}
 const k=$("#g-k")?.value,r=$("#g-r")?.value;
 return{ph:"set",t:ex.n,s:pos,big:"À toi",sub:k!==undefined&&k!==""?`${k} kg × ${r} reps`:`${ex.r[0]}–${ex.r[1]} reps`}}

function miniDraw(){const c=MINI.cv;if(!c)return;const x=c.getContext("2d"),st=miniState(),W=c.width,H=c.height;
 x.fillStyle="#120A0B";x.fillRect(0,0,W,H);if(!st)return;
 const fit=(t,max)=>{while(x.measureText(t).width>max&&t.length>4)t=t.slice(0,-2)+"…";return t};
 x.textAlign="left";x.fillStyle="#B8A0A0";x.font="600 22px 'IBM Plex Sans',sans-serif";x.fillText(st.s,20,36);
 x.fillStyle="#F6EEEE";x.font="800 30px 'Barlow Condensed',sans-serif";x.fillText(fit(st.t,W-40),20,72);
 x.textAlign="center";x.fillStyle=st.ph==="rest"?(st.left<=3?"#FFB547":"#FF2E3A"):"#3DDC97";x.font="800 92px 'Barlow Condensed',sans-serif";x.fillText(st.big,W/2,180);
 x.fillStyle="#B8A0A0";x.font="600 22px 'IBM Plex Sans',sans-serif";if(st.sub)x.fillText(st.sub,W/2,214);
 if(st.ph==="rest"&&st.tot){x.fillStyle="#40262A";x.fillRect(20,238,W-40,10);x.fillStyle="#FF2E3A";x.fillRect(20,238,(W-40)*Math.max(0,1-st.left/st.tot),10)}
 else{x.fillStyle="#B8A0A0";x.font="500 18px 'IBM Plex Mono',monospace";x.fillText(st.ph==="set"?"⏭ série faite":"",W/2,250)}}

function miniMeta(){const ms=navigator.mediaSession,st=miniState();if(!ms||!st)return;
 try{ms.metadata=new MediaMetadata({title:st.ph==="rest"?`Repos ${st.big} · ${st.t}`:st.t,artist:st.ph==="set"?`${st.s} · ${st.sub}`:st.s,album:"Ektyron",artwork:[{src:"icons/icon-512.png",sizes:"512x512",type:"image/png"}]});
  ms.playbackState=st.ph==="rest"&&G.pz?"paused":"playing";
  if(st.ph==="rest"&&st.tot&&ms.setPositionState)ms.setPositionState({duration:st.tot,position:Math.min(st.tot,Math.max(0,st.tot-st.left)),playbackRate:G.pz?0:1});
  else if(ms.setPositionState)ms.setPositionState()}catch(e){}}

/* Actions communes à la vignette et à l'écran verrouillé */
function miniAct(a){if(!G)return;const click=id=>$("#"+id)?.click();
 if(a==="next"){if(G.ph==="set")click("g-done");else if(G.ph==="rest"){if(G.pz)delete G.pz;click("g-go")}}
 else if(a==="pause"&&G.ph==="rest"&&!G.pz){G.pz=Math.max(1000,G.restEnd-Date.now());gSave()}
 else if(a==="play"&&G.pz){G.restEnd=Date.now()+G.pz;delete G.pz;gSave();gTick()}
 else if((a==="fwd"||a==="back")&&G.ph==="rest"){if(G.pz)G.pz=Math.max(1000,G.pz+(a==="fwd"?15000:-15000));else click(a==="fwd"?"g-p":"g-m")}
 miniUpd()}
function miniHandlers(){const ms=navigator.mediaSession;if(!ms)return;const H={play:"play",pause:"pause",nexttrack:"next",seekforward:"fwd",seekbackward:"back",previoustrack:"back"};
 for(const k in H)try{ms.setActionHandler(k,()=>miniAct(H[k]))}catch(e){}}

function miniUpd(){miniDraw();miniMeta();const t=$("#g-t");if(t&&G&&G.pz)t.textContent=fmtT(Math.ceil(G.pz/1000))+" ⏸";
 const b=$("#mini-pz");if(b)b.textContent=G&&G.pz?"▶ Reprendre":"⏸ Pause"}

function miniBuild(){if(MINI.cv)return;const c=MINI.cv=document.createElement("canvas");c.width=480;c.height=270;
 const v=MINI.vid=document.createElement("video");v.muted=true;v.playsInline=true;v.setAttribute("playsinline","");v.autoPictureInPicture=true;
 v.id="mini-vid";v.style.cssText="display:block;width:100%;max-width:260px;aspect-ratio:16/9;margin:0 auto 10px;border-radius:12px;border:1px solid var(--line);background:#120A0B";($("#game")||document.body).appendChild(v);
 miniDraw();try{v.srcObject=c.captureStream(4)}catch(e){}
 v.addEventListener("pause",()=>{if(miniInPip()&&G&&G.ph==="rest")miniAct("pause");setTimeout(()=>v.play().catch(()=>{}),50)});
 v.play().catch(()=>{});miniHandlers();MINI.int=setInterval(miniUpd,250)}

function miniPip(){miniBuild();const v=MINI.vid,ok=()=>toast("Mini-fenêtre ouverte : tu peux quitter l'appli."),ko=e=>toast(`La mini-fenêtre ne s'ouvre pas sur ce téléphone (${e&&e.name||"?"}). Utilise 🔒 Écran verrouillé.`);
 try{if(miniInPip()){document.pictureInPictureElement?document.exitPictureInPicture():v.webkitSetPresentationMode("inline");return}
  if(typeof v.webkitSetPresentationMode==="function"&&v.webkitSupportsPresentationMode?.("picture-in-picture")){v.webkitSetPresentationMode("picture-in-picture");setTimeout(()=>miniInPip()?ok():ko({name:"refus iOS"}),700)}
  else v.requestPictureInPicture().then(ok,ko);
  v.play().catch(()=>{})}catch(e){ko(e)}}

/* Son silencieux en boucle : indispensable pour que le téléphone affiche les contrôles sur l'écran verrouillé */
function miniSilence(){const n=8000*30,b=new ArrayBuffer(44+n),d=new DataView(b),w=(o,s)=>[...s].forEach((ch,i)=>d.setUint8(o+i,ch.charCodeAt(0)));
 w(0,"RIFF");d.setUint32(4,36+n,true);w(8,"WAVEfmt ");d.setUint32(16,16,true);d.setUint16(20,1,true);d.setUint16(22,1,true);d.setUint32(24,8000,true);d.setUint32(28,8000,true);d.setUint16(32,1,true);d.setUint16(34,8,true);w(36,"data");d.setUint32(40,n,true);
 for(let i=0;i<n;i++)d.setUint8(44+i,128);return URL.createObjectURL(new Blob([b],{type:"audio/wav"}))}
async function miniLock(){miniBuild();
 if(MINI.lock){MINI.au?.pause();MINI.lock=false;miniUpd();miniBtns();toast("Contrôles écran verrouillé coupés.");return}
 if(!MINI.au){MINI.au=new Audio(miniSilence());MINI.au.loop=true;MINI.au.setAttribute("playsinline","");MINI.au.hidden=true;document.body.appendChild(MINI.au)}
 try{await MINI.au.play();MINI.lock=true;miniHandlers();miniUpd();toast("Contrôles affichés sur l'écran verrouillé.")}catch(e){toast(`Impossible d'afficher les contrôles ici (${e.name}).`)}
 miniBtns()}

function miniStop(){clearInterval(MINI.int);try{if(document.pictureInPictureElement)document.exitPictureInPicture();else MINI.vid?.webkitSetPresentationMode?.("inline")}catch(e){}
 MINI.au?.pause();MINI.au?.remove();MINI.vid?.remove();Object.assign(MINI,{cv:null,vid:null,au:null,int:null,lock:false});
 const ms=navigator.mediaSession;if(ms){try{ms.metadata=null;ms.playbackState="none"}catch(e){}for(const k of["play","pause","nexttrack","previoustrack","seekforward","seekbackward"])try{ms.setActionHandler(k,null)}catch(e){}}}

function miniBtns(){const box=$("#g-in");if(!box||!G||G.ph==="done")return;let bar=$("#mini-bar");
 if(!bar){bar=document.createElement("div");bar.id="mini-bar";bar.className="row";bar.style.cssText="gap:6px;margin:6px 0 10px;flex-wrap:wrap";box.querySelector(".g-top")?.after(bar)}
 bar.innerHTML=`${miniPipOk()?`<button class="chip" id="mini-pip" style="flex:1">📌 Mini-fenêtre</button>`:""}<button class="chip" id="mini-lock" style="flex:1" aria-pressed="${MINI.lock}">🔒 ${MINI.lock?"Écran verrouillé : oui":"Écran verrouillé"}</button>${G.ph==="rest"?`<button class="chip" id="mini-pz">${G.pz?"▶ Reprendre":"⏸ Pause"}</button>`:""}`}

/* Branchement sur la partie existante */
{const show=gShow,close=gClose,tick=gTick;
 gShow=function(){if(G&&G.ph!=="rest"&&G.pz)delete G.pz;show();if(G&&G.ph!=="done"&&miniPipOk())miniBuild();miniBtns();if(MINI.cv)miniUpd()};
 gClose=function(){miniStop();close()};
 gTick=function(){if(G&&G.pz)return;tick()}}
document.addEventListener("click",e=>{const t=e.target.closest("button");if(!t)return;
 if(t.id==="mini-pip")miniPip();else if(t.id==="mini-lock")miniLock();else if(t.id==="mini-pz")miniAct(G&&G.pz?"play":"pause")});
