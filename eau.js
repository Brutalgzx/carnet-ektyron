"use strict";
/* Suivi de l'eau : quota du jour selon le poids, la séance et l'activité ; saisie de ce qui a été bu ; bilan sur 7 jours. */
const WK="coach-water";
function waterQuota(train){const p=PROF,q=curWeight()*.035+(train?.5:0)+({high:.4,mid:.2}[p.act]||0);return Math.min(4.5,Math.max(1.5,Math.round(q*10)/10))}
const wDay=t=>new Date(t).toISOString().slice(0,10),wQ=t=>waterQuota(!!(TRAIN&&TRAIN[new Date(t).getDay()]));
function waterCard(){const H=LS.get(WK,{}),k=todayKey(),v=H[k]||0,q=wQ(Date.now()),pct=Math.min(100,Math.round(v/q*100));
 const past=[...Array(7)].map((_,i)=>Date.now()-(i+1)*DAY).filter(t=>H[wDay(t)]!=null),avg=past.length?past.reduce((a,t)=>a+H[wDay(t)],0)/past.length:0,qa=past.length?past.reduce((a,t)=>a+wQ(t),0)/past.length:q,ratio=avg/qa;
 const msg=past.length<3?"Note chaque jour à peu près ce que tu as bu : au bout de quelques jours, ton coach te dit s'il faut boire plus.":ratio<.8?`Sur ${past.length} jours, tu bois en moyenne ${fr(avg,1)} L pour ${fr(qa,1)} L conseillés : garde une gourde avec toi et bois un grand verre à chaque repas.`:ratio<.95?`En moyenne ${fr(avg,1)} L pour ${fr(qa,1)} L conseillés : presque, encore un verre ou deux par jour.`:`En moyenne ${fr(avg,1)} L par jour : tu es bien hydraté, continue comme ça.`;
 const bars=[...Array(7)].map((_,i)=>Date.now()-(6-i)*DAY).map(t=>{const x=H[wDay(t)],h=x==null?0:Math.min(100,x/wQ(t)*100);return `<span title="${DN[new Date(t).getDay()]}" style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px"><span style="height:34px;width:100%;display:flex;align-items:flex-end"><i style="display:block;width:100%;height:${Math.max(h,x==null?0:4)}%;background:${h>=95?"var(--good)":"var(--pink)"};border-radius:4px;opacity:${x==null?.2:1}"></i></span><small class="muted" style="font-size:10px">${DN[new Date(t).getDay()][0]}</small></span>`}).join("");
 return `<div class="card stack" id="water"><div class="row"><div class="lab sp">💧 Eau du jour</div><b>${fr(v,2).replace(/,?0+$/,"")||0} / ${fr(q,1)} L</b></div>
 <div style="height:8px;border-radius:4px;background:var(--card2);overflow:hidden"><i style="display:block;height:100%;width:${pct}%;background:${pct>=95?"var(--good)":"var(--pink)"}"></i></div>
 <div class="row" style="flex-wrap:wrap">${[[-.25,"− 25 cl"],[.25,"+ 25 cl"],[.5,"+ 50 cl"]].map(([d,l])=>`<button class="chip" data-wat="${d}" style="flex:1">${l}</button>`).join("")}</div>
 <div class="row"><label for="water-in" class="small muted sp">À peu près bu aujourd'hui</label><input class="txt" id="water-in" inputmode="decimal" placeholder="1,5" value="${v?fr(v,2).replace(/,?0+$/,""):""}" style="width:90px;font-size:17px;padding:8px"><span class="small muted">L</span></div>
 <div class="row" style="gap:4px">${bars}</div><small class="muted">${msg}</small></div>`}
function waterSet(v){const H=LS.get(WK,{});H[todayKey()]=Math.max(0,Math.min(8,Math.round(v*100)/100));LS.set(WK,H);const c=$("#water");if(c)c.outerHTML=waterCard()}
document.addEventListener("click",e=>{const b=e.target.closest("[data-wat]");if(b&&PROF)waterSet((LS.get(WK,{})[todayKey()]||0)+ +b.dataset.wat)});
document.addEventListener("change",e=>{if(e.target.id!=="water-in")return;let v=parseFloat(String(e.target.value).replace(",","."));if(v>15)v/=1000;if(v>=0&&v<=8)waterSet(v)});
