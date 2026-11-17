/* Séance personnalisée : l'utilisateur choisit librement ses exercices (filtrés par son matériel), ou part d'un type de séance du coach,
   puis la joue comme une séance du programme. Jour fictif 7 (TRAIN[7] n'existe pas) : G.list et G.t portent la séance. */
const CUS_DAY=7;let cusOn=false,CUS=LS.get("coach-cus",[]);
const cusIds=()=>CUS.filter(id=>EX[id]), cusSave=()=>LS.set("coach-cus",CUS);
function cusList(){return cusIds().map(id=>mkEx(id,PROF))}
function cusBtn(){return `<button class="btn ghost" id="cus-open">🧩 Séance personnalisée</button>`}
function cusView(){const L=cusList();let min="";try{min=L.length?` · environ ${sessMin({x:L})} min`:""}catch(e){}
 return `<div class="row" style="margin-top:-8px"><h2 class="sp" style="margin:0">Séance personnalisée</h2><button class="chip" id="cus-close">✕ Fermer</button></div>
 <div class="card stack"><div class="lab">Partir d'un type de séance</div><p class="small muted" style="margin:0">Le coach la remplit avec ton matériel, puis tu modifies comme tu veux.</p>
  <div class="row" style="flex-wrap:wrap;gap:6px">${Object.entries(TPL).map(([k,T])=>`<button class="chip" data-cust="${k}">${esc(T.t)}</button>`).join("")}</div></div>
 <div class="card hot stack"><h2>Mes exercices</h2><div class="small muted">${L.length?`${L.length} exercice${L.length>1?"s":""}${min}`:"Aucun exercice pour l'instant : ajoute ceux que tu veux faire."}</div>
  ${L.length?gBtns(CUS_DAY,"▶ Jouer cette séance"):""}<button class="btn ghost" id="cus-add">+ Ajouter des exercices</button>${L.length?`<button class="link" id="cus-clear" style="color:var(--bad)">Tout vider</button>`:""}</div>
 ${L.map((e,i)=>{const l=lastLog(e.id);return `<article class="ex"><div class="hd"><b>${esc(e.n)}</b><span class="sc">${e.s}×${e.r[0]}–${e.r[1]}</span></div><div class="small">${e.c}</div><div class="small muted mono">Repos ${fmtT(e.rest)} · ${l?`dernière fois ${l.sets.map(s=>`${s.k}×${s.r}`).join(" · ")}`:"pas encore de données"}</div>
  <div class="row" style="margin-top:8px"><button class="chip" data-cmv="${i},-1" aria-label="Monter">↑</button><button class="chip" data-cmv="${i},1" aria-label="Descendre">↓</button><span class="sp"></span><button class="chip" data-crm="${i}">🗑️ Retirer</button></div></article>`}).join("")}`}
function cusSheetHtml(){const cur=cusIds(),ok=Object.keys(EX).filter(id=>exOk(id,PROF)),seen=new Set(),
  groups=Object.values(MUSC).map(([n,ids])=>[n,ids.filter(id=>ok.includes(id)&&!seen.has(id)&&seen.add(id))]).filter(g=>g[1].length);
 const rest=ok.filter(id=>!seen.has(id));if(rest.length)groups.push(["autres",rest]);
 return `<div class="in" role="dialog" aria-label="Choisir mes exercices"><div class="row" style="padding-top:18px;position:sticky;top:0;background:var(--bg2);z-index:1"><h2 class="sp" style="margin:0">Choisir mes exercices</h2><button class="chip" data-close aria-label="Fermer">✓ ${cur.length}</button></div>
  <p class="small muted">Touche un exercice pour l'ajouter ou le retirer. Seulement ceux faisables avec ton matériel${(PROF.pain||[]).length?" et sans gêne pour ta zone à ménager":""}.</p>
  <input class="txt" id="cus-q" type="search" placeholder="🔎 Rechercher un exercice ou un muscle" autocomplete="off" style="width:100%;padding:12px;font-size:16px" value="${esc(cusQ)}">
  <p class="small muted" id="cus-none" hidden>Aucun exercice trouvé.</p>
  ${groups.map(([n,ids])=>`<div class="cgrp" data-m="${esc(cusNorm(n))}"><div class="lab" style="margin-top:12px">${esc(n[0].toUpperCase()+n.slice(1))}</div><div class="opts">${ids.map(id=>{const on=cur.includes(id);return `<button class="opt" data-ctog="${id}" aria-pressed="${on}" style="min-height:48px;padding:10px 14px${on?";border-color:var(--acc)":""}"><span><b>${on?"✓ ":""}${esc(EX[id][0])}</b><small>${esc(EX[id][5])}</small></span></button>`}).join("")}</div></div>`).join("")}</div>`}
/* Recherche : sans accents ni majuscules, sur le nom, le groupe et le muscle. */
let cusQ="";const cusNorm=t=>String(t).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
function cusFilter(){const el=$("#sheet");if(!el)return;const w=cusNorm(cusQ).split(/\s+/).filter(Boolean);let any=0;
 for(const g of el.querySelectorAll(".cgrp")){let n=0;for(const b of g.querySelectorAll("[data-ctog]")){const id=b.dataset.ctog,h=g.dataset.m+" "+cusNorm(EX[id][0]+" "+EX[id][1]),ok=w.every(x=>h.includes(x));b.hidden=!ok;n+=ok}g.hidden=!n;any+=n}
 $("#cus-none").hidden=!!any}
document.addEventListener("input",e=>{if(e.target.id==="cus-q"){cusQ=e.target.value;cusFilter()}});
function cusSheet(){let el=$("#sheet");const top=el?el.querySelector(".in").scrollTop:0;if(!el){el=document.createElement("div");el.id="sheet";document.body.append(el)}
 el.innerHTML=cusSheetHtml();cusFilter();el.querySelector(".in").scrollTop=top}
document.addEventListener("click",e=>{const t=e.target.closest("button");if(!t)return;const D=t.dataset;
 if(t.id==="cus-open"){cusOn=true;render();return}
 if(t.id==="cus-close"){cusOn=false;render();return}
 if(t.id==="cus-add"){cusQ="";cusSheet();return}
 if(t.id==="cus-clear"){if(confirm("Vider la séance personnalisée ?")){CUS=[];cusSave();render()}return}
 if(D.ctog){const i=CUS.indexOf(D.ctog);i>=0?CUS.splice(i,1):CUS.push(D.ctog);cusSave();cusSheet();render();return}
 if(D.cust){const T=TPL[D.cust];if(cusIds().length&&!confirm(`Remplacer tes exercices par la séance « ${T.t} » ?`))return;
  CUS=pickSlots(D.cust,PROF,{45:5,60:6,75:7,90:8}[PROF.dur]||6);cusSave();render();toast(`${T.t} : ${CUS.length} exercices. Modifie-la comme tu veux.`);return}
 if(D.cmv){const [i,d]=D.cmv.split(",").map(Number),L=cusIds(),j=i+d;if(j<0||j>=L.length)return;[L[i],L[j]]=[L[j],L[i]];CUS=L;cusSave();render();return}
 if(D.crm!==undefined){const L=cusIds();L.splice(+D.crm,1);CUS=L;cusSave();render();return}});
