/* Nouveautés : à l'ouverture, une fenêtre explique ce qui a changé depuis la dernière visite.
   À CHAQUE MISE À JOUR visible : ajouter une entrée EN HAUT de NEWS (id unique croissant, date, titre, 1 à 4 phrases simples).
   Un nouvel utilisateur ne voit rien (tout est marqué « vu » à sa première ouverture). */
const NEWS=[
 {id:34,d:"24/11",t:"✓✗ Bon geste, puis geste à éviter",x:[
  "Chaque animation 3D joue maintenant en deux temps : une répétition correcte (bandeau vert « ✓ Bon geste »), puis la même avec l'erreur la plus fréquente (bandeau rouge « ✗ À éviter » : dos rond, genoux qui rentrent, élan du buste, épaules qui montent…).",
  "Le bouton ✓✗ sous la scène coupe ou remet ce mode.",
  "Onglet Anatomie : chaque exercice de la liste sous le muscle a son animation 3D quand tu le déplies."]},
 {id:33,d:"24/11",t:"↺ Réinitialiser l'anatomie",x:[
  "Onglet Anatomie : le bouton « ↺ Réinitialiser » efface le muscle choisi, revient à tes priorités et remet le mannequin de face."]},
 {id:32,d:"24/11",t:"🧍 Tous les exercices en 3D",x:[
  "Les 77 exercices du coach ont maintenant leur démonstration 3D : 35 nouveaux (fentes bulgares, soulevé roumain, face pull, dead bug, russian twist…) et 12 refaits à l'identique au lieu d'une animation approchée.",
  "Chacun a sa fiche Technique : départ, mouvement, respiration, amplitude, erreurs fréquentes et sécurité.",
  "Les exercices sur une jambe ou un bras (fentes, rowing un bras, pont une jambe…) bougent enfin d'un seul côté."]},
 {id:31,d:"24/11",t:"🏋️ Exercices par muscle",x:[
  "Dans l'onglet Anatomie, touche un muscle : une liste déroulante montre tous les exercices qui le ciblent.",
  "Ceux faisables dans ta salle passent en premier ; touche un exercice pour voir le conseil d'exécution."]},
 {id:30,d:"24/11",t:"🫀 Onglet Anatomie",x:[
  "L'anatomie 3D a maintenant son propre onglet en bas de l'écran (l'onglet Aujourd'hui s'appelle désormais Accueil pour faire de la place).",
  "Touche un muscle sur le mannequin : il s'allume, avec son nom et son rôle ; les autres muscles du même groupe s'allument en orange.",
  "Ou choisis un groupe en dessous (pecs, dos, jambes…, ou « Mes priorités »)."]},
 {id:29,d:"24/11",t:"🫀 Anatomie 3D dans Corps",x:[
  "L'onglet Corps a une nouvelle carte : le mannequin anatomique 3D, muscle par muscle.",
  "Choisis un groupe (pecs, dos, jambes…) ou « Mes priorités » : les muscles concernés s'allument.",
  "Glisse pour le tourner, ou choisis la vue face, profil, dos ou 3/4."]},
 {id:28,d:"24/11",t:"⚖️ Corriger une pesée",x:[
  "Dans le suivi du poids, « Corriger une pesée » liste tes dernières pesées : touche « Modifier » pour changer le chiffre, ou ✕ pour la supprimer.",
  "Si une pesée faite après manger avait fait changer tes calories, la correction annule ce changement : tu reviens à ton plan d'avant.",
  "Rappel : pèse-toi le matin à jeun, le poids varie d'1 à 2 kg dans la journée."]},
 {id:27,d:"24/11",t:"✊ Mains, mollets et presse en 3D",x:[
  "Les doigts se referment maintenant autour de la barre, des poignées et des haltères (main ouverte à plat pour les pompes).",
  "Mollets : le corps monte de 8 cm sur la pointe des pieds, talons qui décollent (avant : 2 cm).",
  "Presse à cuisses : la plaque reste perpendiculaire aux rails et les jambes poussent dans l'axe de la machine ; dossier plus long et plus incliné."]},
 {id:26,d:"24/11",t:"🧍 Fiches 3D corrigées",x:[
  "La page défile normalement même quand ton doigt part de la scène 3D (tourner la scène : glisser à l'horizontale), et elle ne saute plus pendant le chargement.",
  "Prises de main réalistes : pronation (mains par-dessus) pour tractions, muscle-up, rowings, développés et pompes, prise neutre pour les dips et élévations, supination pour les curls.",
  "Corrigés : sièges sous les fesses et pieds au sol sur les machines, barre du développé couché jusqu'à la poitrine, hip thrust épaules sur le banc, mains au sol aux pompes, repose-pieds du tirage horizontal, banc à lombaires, rack et appuis d'épaules ajoutés."]},
 {id:25,d:"24/11",t:"🧍 Exercices en 3D",x:[
  "Les fiches d'exercices passent en 3D pour plus de 40 mouvements : un corps anatomique qui fait le geste, muscles colorés (rouge = principal, orange = secondaire, bleu = stabilisateur).",
  "Tourne autour au doigt, choisis la vue (face, profil, dos, 3/4), ralentis ×0,5 ou mets en pause.",
  "Bouton « Technique » : départ, mouvement, respiration, amplitude, erreurs fréquentes et sécurité.",
  "Les autres exercices gardent leur vidéo."]},
 {id:24,d:"17/11",t:"🍰 Case Extras en Nutrition",x:[
  "Sous tes repas du jour, une nouvelle case « Extras » : un yaourt, une crêpe, un gâteau, des chips… mangés en plus.",
  "Cherche dans plus de 250 aliments courants, touche-le, règle la quantité (portions ou grammes) : calories, protéines, glucides et lipides sont calculés tout seuls et comptés dans ta journée.",
  "Pas dans la liste ? Cherche-le en ligne ou recopie l'étiquette."]},
 {id:23,d:"17/11",t:"🔍 Choisir un plat sans swipe",x:[
  "Dans la fiche d'un repas, « 🔍 Choisir dans tous les plats » ouvre la liste de tous les plats qui collent à tes goûts, avec une recherche.",
  "Touche un plat : il remplace le repas pour ce jour seulement, sur Aujourd'hui et Nutrition."]},
 {id:22,d:"17/11",t:"☀︎ Mode clair",x:[
  "Sur « Aujourd'hui », le petit bouton rond à côté de ton niveau change le thème : ◐ selon ton iPhone, ☀︎ clair, ☾ sombre.",
  "En « selon ton iPhone », l'appli passe en clair ou en sombre toute seule, en même temps que ton téléphone."]},
 {id:21,d:"17/11",t:"♥ Remplacer un repas par un plat que tu aimes",x:[
  "Dans la fiche d'un repas, « Choisir parmi mes plats aimés » ouvre la liste des plats gardés en swipe : celui que tu choisis remplace le repas pour ce jour seulement.",
  "Un plat que tu as gardé n'affiche plus « Je n'aime pas, remplace-la » : « Remplacer ce jour seulement » reste là."]},
 {id:20,d:"17/11",t:"🎬 Fini l'écran noir des vidéos",x:[
  "Pendant la séance, une vidéo d'exercice qui reste noire se recharge toute seule au bout de quelques secondes.",
  "En revenant dans l'appli, les vidéos à l'écran repartent : plus besoin de fermer et rouvrir l'appli."]},
 {id:19,d:"17/11",t:"🗓️ Déplacer une séance",x:[
  "Dans Séance, reste appuyé sur un jour : la case vient avec ton doigt.",
  "Lâche-la sur un autre jour pour y mettre la séance. Si ce jour a déjà une séance, les deux sont échangées.",
  "La séance garde ses exercices, même ceux que tu as changés."]},
 {id:17,d:"17/11",t:"🏋️ Développé couché toujours disponible",x:[
  "Même si tu as mis les pecs en 🚫, le développé couché (haltères ou barre) reste dans « + Ajouter un exercice ».",
  "Tu l'ajoutes toi-même à la séance et au jour que tu veux : le coach ne le met nulle part d'office."]},
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
