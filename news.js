/* Nouveautés : à l'ouverture, une fenêtre explique ce qui a changé depuis la dernière visite.
   À CHAQUE MISE À JOUR visible : ajouter une entrée EN HAUT de NEWS (id unique croissant, date, titre, 1 à 4 phrases simples).
   Un nouvel utilisateur ne voit rien (tout est marqué « vu » à sa première ouverture). */
const NEWS=[
 {id:4,d:"17/11",t:"👯 Séance duo : la même séance pour les deux",x:[
  "Dans Séance duo, vous choisissez ensemble le type de séance : haut du corps, bas du corps, push, pull ou full body.",
  "L'appli prend les exercices que vous avez tous les deux dans vos programmes, et complète avec des exercices des mêmes muscles.",
  "Vous faites exactement la même séance en alternant les séries ; chacun garde ses charges et ses répétitions."]},
 {id:3,d:"17/11",t:"💧 Rappels pour boire de l'eau",x:[
  "Dans les réglages des notifications, coche « Eau » pour recevoir un rappel toutes les 2 h ou 3 h, de 9 h à 21 h.",
  "Chaque rappel dit où tu en es, et ils s'arrêtent dès que ton objectif du jour est atteint."]},
 {id:2,d:"17/11",t:"🍪 Noter un petit extra",x:[
  "Dans la fiche d'un repas, « J'ai mangé un petit extra » ajoute ce que tu as grignoté : il compte dans tes calories et protéines du jour."]},
 {id:1,d:"16/11",t:"🔁 Remplacer un plat pour un seul jour",x:[
  "Dans la fiche d'un plat, « Remplacer (ce jour seulement) » change ce plat juste ce jour-là, sans le retirer de tes repas possibles."]}
];
const NK="coach-news-seen",newsTop=()=>NEWS.length?NEWS[0].id:0;
function newsShow(){let seen=LS.get(NK,null);
 if(!PROF){LS.set(NK,newsTop());return}if(seen==null)seen=newsTop()-1;
 const L=NEWS.filter(n=>n.id>seen);if(!L.length)return;
 if(document.body.classList.contains("g-on")||document.body.classList.contains("duo-on"))return;
 let el=$("#news");if(!el){el=document.createElement("div");el.id="news";document.body.appendChild(el)}
 el.innerHTML=`<div class="news-in stack"><div class="lab">Nouveau dans l'appli</div><h2>Ce qui a changé</h2>
  ${L.slice(0,5).map(n=>`<div class="card stack"><b>${esc(n.t)}</b><small class="muted">${esc(n.d)}</small>${n.x.map(p=>`<div class="small">${esc(p)}</div>`).join("")}</div>`).join("")}
  <button class="btn" data-news="ok">J'ai compris</button></div>`;el.hidden=false}
document.addEventListener("click",e=>{if(!e.target.closest("[data-news]"))return;LS.set(NK,newsTop());const el=$("#news");if(el)el.hidden=true});
(function(){const st=document.createElement("style");st.textContent=`
#news{position:fixed;inset:0;z-index:70;overflow:auto;background:rgba(0,0,0,.55);padding:calc(24px + env(safe-area-inset-top)) 16px calc(24px + env(safe-area-inset-bottom))}
.news-in{max-width:480px;margin:0 auto;background:var(--bg,#0b0d10);border-radius:22px;padding:18px}`;document.head.appendChild(st)})();
setTimeout(newsShow,800);
