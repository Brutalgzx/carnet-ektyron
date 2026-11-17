/* Nouveautés : à l'ouverture, une fenêtre explique ce qui a changé depuis la dernière visite.
   À CHAQUE MISE À JOUR visible : ajouter une entrée EN HAUT de NEWS (id unique croissant, date, titre, 1 à 4 phrases simples).
   Un nouvel utilisateur ne voit rien (tout est marqué « vu » à sa première ouverture). */
const NEWS=[
 {id:16,d:"17/11",t:"🔀 Ton ordre d'exercices est gardé",x:[
  "Refaire le questionnaire ou adapter ton programme ne remet plus tes séances dans l'ordre du coach.",
  "Chaque séance garde l'ordre que tu lui avais donné ; seuls les exercices des zones que tu ne veux plus travailler sont retirés.",
  "Si le type d'une séance change (nouveau découpage), elle repart de la proposition du coach."]},
 {id:15,d:"17/11",t:"💶 Ton budget courses est fait pour être dépensé",x:[
  "Le coach ne cherche plus les économies : il vise ton budget de la semaine (sans le dépasser nettement) et le met dans la qualité.",
  "Plus ton budget est large, plus la gamme monte : viande et poisson Label Rouge, produits frais, bio, plats plus riches en protéines.",
  "Dans Nutrition › Liste de courses, « Recomposer mes repas » refait ta semaine pour coller au budget choisi."]},
 {id:14,d:"17/11",t:"🚫 Les zones que tu ne veux pas travailler",x:[
  "Dans « Refaire le questionnaire » ou « Adapter », à l'étape des zones : 1 appui = priorité, 2 appuis = 🚫 je ne veux pas la travailler, 3 appuis = normal.",
  "Ton coach ne te propose plus aucun exercice sur ces zones. En séance personnalisée, tu restes libre de les ajouter."]},
 {id:13,d:"17/11",t:"🏋️ Gainage : ton lest compte aussi",x:[
  "À côté du temps que tu tiens déjà au gainage, tu peux indiquer le lest que tu tiens (ex. 40 s avec 10 kg).",
  "Ton coach part de là : +5 s par séance jusqu'à 60 s, puis 5 kg de plus."]},
 {id:12,d:"17/11",t:"⏱ Gainage au chrono, 0 kg accepté",x:[
  "Le gainage se fait maintenant au chrono : plus de reps, tu lances le chrono, tu tiens, et les secondes se notent toutes seules.",
  "Ton coach te dit combien de temps tenir selon ton niveau, et quand ajouter du lest (seulement quand tu tiens 60 s sur toutes les séries).",
  "Tu sais déjà combien de temps tu tiens ? Indique-le pendant la série : ton coach part de là, et si tu tiens déjà 60 s, il te fait passer au lest ou à un exercice plus dur.",
  "Pour les exercices au poids du corps (relevés de jambes, tractions…), laisse les kilos vides ou à 0 : la série est acceptée."]},
 {id:11,d:"17/11",t:"🔎 Recherche d'exercices",x:[
  "Dans « Séance personnalisée », une barre de recherche en haut de la liste trouve un exercice en tapant son nom ou le muscle (ex. « curl », « pecs », « ischios »)."]},
 {id:10,d:"17/11",t:"🧩 Séance personnalisée",x:[
  "Dans Séances, le bouton « Séance personnalisée » te laisse composer ta séance : choisis tes exercices muscle par muscle, parmi ceux faisables avec ton matériel.",
  "Tu peux aussi partir d'un type de séance (Push, Pull, Jambes, Full body…) puis la modifier. Elle se joue et s'enregistre comme une séance normale."]},
 {id:9,d:"17/11",t:"🧍 Un vrai corps humain dans « Mon corps »",x:[
  "L'avatar est maintenant un corps humain réaliste : visage, mains, muscles dessinés, peau.",
  "Chaque curseur gonfle le vrai muscle (pecs, dos, épaules, bras, abdos, trapèzes, jambes, fessiers, mollets), et « À X kg » montre ta silhouette au poids visé."]},
 {id:8,d:"17/11",t:"✂️ Moins de questions en double",x:[
  "« Configurer ma nutrition » ne repose plus ce que tu as déjà dit au questionnaire (poids, objectif, activité, régime) : seulement tes goûts, tes repas, ton magasin et ton budget."]},
 {id:7,d:"17/11",t:"🥗 Des repas seulement quand tu as dit ce que tu aimes",x:[
  "Après le questionnaire, Aujourd'hui montre tes calories et macros du jour, avec un bouton « Configurer ma nutrition ».",
  "Les plats n'apparaissent qu'une fois tes goûts, allergies et magasin renseignés, choisis parmi les recettes qui te correspondent."]},
 {id:6,d:"17/11",t:"🔄 Tout recommencer avec de nouveaux objectifs",x:[
  "En bas de Séances et de Nutrition, « Recommencer tout le questionnaire » repart de zéro, comme une nouvelle installation : nouveaux objectifs, nouveau programme, nouveaux repas.",
  "Tout ce que tu as déjà enregistré reste : séances faites, charges, pesées, mensurations."]},
 {id:5,d:"17/11",t:"🧍 Trapèzes au programme et avatar de ton corps",x:[
  "Dans « Les zones à travailler en priorité », tu peux maintenant choisir Trapèzes : shrugs aux haltères avec sangles et prise neutre (le poignet ne travaille pas), avec leur vidéo.",
  "Choisir Abdos ajoute maintenant jusqu'à 2 exercices par séance, en fin de séance : abdos, obliques et gainage en alternance.",
  "Profil → « Mon corps à l'objectif » : un avatar 3D montre ta silhouette au poids visé, et un curseur par muscle te laisse tout régler."]},
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
