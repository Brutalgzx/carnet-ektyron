/* Données du coach : exercices, modèles de séances, aliments, recettes. */

/* Matériel : m machine guidée, c poulie, s Smith, d haltères, b banc, x barre libre, p barre de traction, 0 rien.
   Type : H polyarticulaire lourd, M polyarticulaire, I isolation.
   Zones à ménager : w poignet, s épaule, k genou, b bas du dos. */
const EX = {
 incl:["Développé incliné à la Smith","Pecs","sb","H","incl","Banc à 15–30°. Coudes vers les côtes, pieds ancrés, descente contrôlée jusqu'au haut des pecs.",""],
 dbinc:["Développé incliné haltères","Pecs","db","H","incl","Banc à 30°. Les haltères descendent sur les côtés de la poitrine, poignets droits.",""],
 benchx:["Développé couché barre","Pecs","xb","H","dch","Omoplates serrées, pieds au sol, la barre touche le bas des pecs.","w"],
 dch:["Développé couché haltères","Pecs","db","H","dch","Omoplates serrées, coudes à 45°, les haltères laissent le poignet trouver son angle.",""],
 pompes:["Pompes","Pecs","0","M","","Corps gainé de la tête aux pieds, mains un peu plus larges que les épaules, poitrine au sol.","w"],
 pompesd:["Pompes pieds surélevés","Pecs","0","M","","Pieds sur une chaise : l'effort passe dans le haut des pecs. Gainage serré.","w"],
 pfly:["Pec fly machine","Pecs","m","I","pfly","Poignées à hauteur des tétons. Rapproche les biceps, pas les mains.",""],
 ecbh:["Écarté poulie bas vers haut","Pecs","c","I","ecbh","Trajectoire du bas vers le haut, bras légèrement fléchis : haut des pecs.",""],
 dbfly:["Écarté haltères sur banc","Pecs","db","I","","Bras légèrement fléchis, ouvre jusqu'à sentir l'étirement, sans descendre trop bas.",""],
 dips:["Dips machine ou assistés","Pecs","m","M","dips","Légèrement penché en avant, omoplates en protraction, coudes serrés.","s"],
 dipsb:["Dips entre deux supports","Pecs","0","M","dips","Penché en avant, descends jusqu'à 90° au coude, pas plus.","sw"],
 tvert:["Tirage vertical","Dos","c","M","tvert","Baisse les omoplates avant de tirer, coudes dans les poches, devant toi.",""],
 tract:["Tractions (élastique si besoin)","Dos","p","H","tract","Gainage des pieds à la tête. Omoplates basses d'abord, menton au-dessus de la barre.",""],
 rowm:["Rowing machine poitrine appuyée","Dos","m","M","rowm","Sternum plaqué au support, coude qui frôle les côtes, envoyé loin en arrière.",""],
 rowu:["Rowing unilatéral haltère","Dos","db","M","rowu","Main et genou sur le banc, dos plat. Tire le coude vers la hanche.",""],
 rowx:["Rowing barre buste penché","Dos","x","H","","Dos neutre à 45°, la barre monte vers le nombril.","bw"],
 rowinv:["Rowing inversé sous une table","Dos","0","M","","Allongé sous une table solide, corps gainé, tire la poitrine vers le bord.",""],
 tlarg:["Tirage poulie prise large, coudes levés","Dos","c","I","tlarg","Pour l'épaisseur du haut du dos : serre les omoplates en fin de mouvement.",""],
 rfly:["Reverse pec fly","Épaules","m","I","rfly","Siège un peu haut. Recule les coudes, pas les mains.",""],
 facep:["Face pull poulie","Épaules","c","I","","Corde à hauteur du visage, tire vers le front en écartant les mains.",""],
 oiseau:["Oiseau haltères buste penché","Épaules","d","I","","Buste penché, bras légèrement fléchis, monte les coudes sur les côtés.",""],
 ytw:["Y-T-W allongé au sol","Épaules","0","I","","À plat ventre, dessine Y, puis T, puis W avec les bras, pouces vers le ciel.",""],
 dmil:["Développé épaules haltères assis","Épaules","db","M","","Dossier presque droit, abdos serrés, pousse au-dessus de la tête sans cambrer.","s"],
 pike:["Pompes piquées (pike)","Épaules","0","M","","Fesses en l'air, tête qui descend entre les mains : travaille les épaules.","sw"],
 elat:["Élévations latérales poulie","Épaules","c","I","elat","Monte le coude, pas la main. Stop à 90°.",""],
 elmac:["Élévations latérales machine","Épaules","m","I","elmac","Trajectoire guidée, stop à 90°, descente lente.",""],
 elath:["Élévations latérales haltères","Épaules","d","I","elmac","Léger penché en avant, coudes qui mènent le mouvement, stop à 90°.",""],
 pupi:["Curl pupitre","Bras","m","I","pupi","Creux de l'épaule sur le support, descente contrôlée jusqu'en bas.",""],
 cpou:["Curl poulie dos à la poulie","Bras","c","I","cpou","Tension dès le départ, coudes fixes, pas d'élan.",""],
 curlh:["Curl haltères sur banc incliné","Bras","db","I","","Bras qui pendent derrière le buste : étirement maximal du biceps.",""],
 mart:["Curl marteau corde","Bras","c","I","mart","Prise neutre, pouces vers le ciel : brachial et avant-bras. Ménage le poignet.",""],
 marth:["Curl marteau haltères","Bras","d","I","","Prise neutre, coudes collés au corps.",""],
 curlpdc:["Curl avec sac à dos chargé","Bras","0","I","","Sac rempli de livres ou bouteilles, coudes fixes, descente lente.",""],
 tri1:["Extension triceps poulie unilatérale","Bras","c","I","tri1","Coude collé au corps, seul l'avant-bras bouge.",""],
 triv:["Extension triceps barre en V","Bras","c","I","triv","Coudes fixes, tends complètement les bras en bas.",""],
 ovh:["Overhead extension poulie","Bras","c","I","ovh","Dos à la poulie, abdos serrés : étire bien le chef long.",""],
 extd:["Extension triceps haltère derrière la tête","Bras","d","I","","Assis, haltère à deux mains, coudes pointés vers le plafond.",""],
 dipsbanc:["Dips sur une chaise","Bras","0","I","","Mains sur le bord, coudes vers l'arrière, descends à 90°.","sw"],
 diam:["Pompes serrées","Bras","0","I","","Mains sous les épaules, coudes qui frôlent le corps.","w"],
 hack:["Hack squat","Jambes","m","H","hack","Pieds plus bas pour les quadriceps. Cherche la profondeur sans décoller le bassin.",""],
 smsq:["Squat à la Smith","Jambes","s","H","hack","Pieds légèrement devant, descends sous la parallèle, dos plaqué.","b"],
 press:["Presse à cuisses","Jambes","m","H","press","Descends le plus bas possible sans décoller le bassin du dossier.",""],
 gobsq:["Goblet squat haltère","Jambes","d","M","","Haltère contre la poitrine, coudes entre les genoux en bas.",""],
 squatpdc:["Squat tempo lent","Jambes","0","M","","3 secondes pour descendre, 1 seconde en bas, remontée explosive.",""],
 bulg:["Fentes bulgares","Jambes","d","M","bulg","Pied arrière sur le banc, buste légèrement penché pour les fessiers.","k"],
 fentes:["Fentes marchées","Jambes","0","M","","Grand pas, genou arrière qui frôle le sol, buste droit.","k"],
 lext:["Leg extension","Jambes","m","I","lext","Genou aligné avec l'axe de la machine, contracte 1 seconde en haut.","k"],
 lcurl1:["Leg curl assis","Jambes","m","I","lcurl1","Chauffe les genoux pour la suite. Descente contrôlée.",""],
 lcurl2:["Leg curl allongé","Jambes","m","I","lcurl2","Bassin plaqué au banc, ramène les talons vers les fesses.",""],
 nordic:["Leg curl au sol (serviette)","Jambes","0","I","","Talons sur une serviette, bassin levé, ramène les talons en glissant.",""],
 rdl:["Soulevé de terre roumain haltères","Jambes","d","H","rdl","Envoie les fesses en arrière, dos neutre, haltères le long des cuisses.","b"],
 rdlx:["Soulevé de terre roumain barre","Jambes","x","H","rdl","Barre collée aux jambes, fesses en arrière, dos neutre.","bw"],
 hipt:["Hip thrust","Jambes","db","M","","Haut du dos sur le banc, menton rentré, serre les fessiers en haut.",""],
 pont:["Pont fessier une jambe","Jambes","0","I","","Dos au sol, une jambe tendue, pousse dans le talon et serre les fessiers.",""],
 addab:["Adducteurs + abducteurs (superset)","Jambes","m","I","addab","Enchaîne les deux machines sans pause.",""],
 moll:["Mollets debout","Jambes","m","I","moll","Amplitude complète, pause en bas en étirement.",""],
 moll2:["Mollets assis","Jambes","m","I","moll2","Pour le soléaire. Pause en bas.",""],
 mollh:["Mollets sur une marche, haltère en main","Jambes","d","I","moll","Une jambe à la fois, talon qui descend sous la marche.",""],
 mollpdc:["Mollets sur une marche","Jambes","0","I","moll","Une jambe à la fois, pause en bas, monte sur la pointe.",""],
 crun:["Crunch poulie","Abdos","c","I","crun","Bassin immobile, enroule la poitrine vers les genoux.",""],
 releve:["Relevés de jambes allongé","Abdos","0","I","","Bas du dos plaqué au sol, monte les jambes sans élan.",""],
 bext:["Back extensions","Dos","m","I","bext","Pour les lombaires. Remonte jusqu'à l'alignement, pas au-delà.",""],
 superman:["Superman au sol","Dos","0","I","","À plat ventre, décolle bras et jambes 2 secondes.",""]
};

/* Emplacements : pour chaque rôle, les exercices par ordre de préférence. */
const SLOT = {
 chestInc:["incl","dbinc","pompesd"], chestFlat:["dch","benchx","pompes"], chestIso:["pfly","ecbh","dbfly","pompes"],
 dips:["dips","dipsb","diam"], backVert:["tvert","tract","rowinv"], backRow:["rowm","rowu","rowx","rowinv"],
 backUp:["tlarg","facep","oiseau","ytw"], rear:["rfly","facep","oiseau","ytw"], shPress:["dmil","pike"],
 side:["elat","elmac","elath","ytw"], bic:["pupi","cpou","curlh","curlpdc"], bic2:["mart","marth","curlpdc"],
 tri:["tri1","triv","extd","dipsbanc","diam"], triOvh:["ovh","extd","diam"],
 quad:["hack","smsq","press","gobsq","squatpdc"], quad2:["press","bulg","gobsq","fentes"], quadIso:["lext","fentes","squatpdc"],
 hinge:["rdl","rdlx","hipt","pont"], curl:["lcurl1","lcurl2","nordic"], glute:["hipt","pont"],
 calf:["moll","moll2","mollh","mollpdc"], abs:["crun","releve"], lowb:["bext","superman"], add:["addab"]
};

const TPL = {
 fullA:{t:"Full body A",f:"Tout le corps, accent jambes et pecs",s:["quad","chestFlat","backRow","side","curl","bic","tri","calf"]},
 fullB:{t:"Full body B",f:"Tout le corps, accent dos et ischios",s:["hinge","backVert","chestInc","quad2","rear","triOvh","bic2","abs"]},
 fullC:{t:"Full body C",f:"Tout le corps, accent épaules",s:["quad","backVert","shPress","chestIso","glute","bic","tri","calf"]},
 upA:{t:"Haut du corps A",f:"Pecs · dos · épaules · bras",s:["chestInc","backVert","chestIso","backRow","side","tri","bic","rear"]},
 upB:{t:"Haut du corps B",f:"Dos d'abord, puis pecs",s:["backRow","chestFlat","backVert","shPress","side","bic2","triOvh","backUp"]},
 lowA:{t:"Bas du corps A",f:"Quadriceps en priorité",s:["curl","quad","hinge","quadIso","calf","abs","add"]},
 lowB:{t:"Bas du corps B",f:"Ischios et fessiers en priorité",s:["hinge","quad2","curl","glute","lowb","calf","abs"]},
 push:{t:"Push",f:"Pecs · épaules · triceps",s:["chestInc","chestIso","dips","side","tri","triOvh","shPress"]},
 pull:{t:"Pull",f:"Dos · arrière d'épaule · biceps",s:["backVert","backRow","backUp","rear","bic","bic2","lowb"]},
 legs:{t:"Jambes",f:"Quadriceps · ischios · mollets",s:["curl","quad","hinge","quadIso","add","calf","abs"]}
};
/* Jours (0 = dimanche) et séances selon la fréquence. Chaque muscle travaille au moins 2 fois par semaine dès 3 séances. */
const SPLIT = {
 2:[[1,"fullA"],[4,"fullB"]],
 3:[[1,"fullA"],[3,"fullB"],[5,"fullC"]],
 4:[[1,"upA"],[2,"lowA"],[4,"upB"],[5,"lowB"]],
 5:[[1,"push"],[2,"pull"],[3,"legs"],[5,"upB"],[6,"lowB"]],
 6:[[1,"push"],[2,"pull"],[3,"legs"],[4,"push"],[5,"pull"],[6,"legs"]]
};
const GYM = {full:"mcsdbxp0",small:"dbxpc0",home:"db0",bw:"0"};

/* Aliments : kcal, protéines, glucides, lipides pour 100 g, prix moyen €/kg, rayon. */
const ING = {
 riz:["Riz",350,7,78,1,2.2,"Épicerie"], pates:["Pâtes",355,12,72,1.5,1.6,"Épicerie"], semoule:["Semoule",360,12,73,1.5,2,"Épicerie"],
 avoine:["Flocons d'avoine",370,13,60,7,1.9,"Épicerie"], painc:["Pain complet",245,9,45,3,3.5,"Boulangerie"], wrap:["Wraps de blé",300,8,50,7,5,"Épicerie"],
 painb:["Pains à burger",270,9,48,4,4.5,"Boulangerie"], pdt:["Pommes de terre",77,2,17,0.1,1.4,"Fruits et légumes"], patd:["Patates douces",86,1.6,20,0.1,2.6,"Fruits et légumes"],
 lentilles:["Lentilles corail",340,24,50,1.5,3,"Épicerie"], poischi:["Pois chiches (conserve)",140,7,18,2.5,2.4,"Épicerie"], harico:["Haricots rouges (conserve)",115,8,15,0.5,2.4,"Épicerie"],
 poulet:["Blanc de poulet",110,23,0,1.5,9.5,"Viande et poisson"], dinde:["Escalopes de dinde",105,22,0,1.5,9.9,"Viande et poisson"], boeuf:["Bœuf haché 5 %",125,21,0,5,11,"Viande et poisson"],
 thon:["Thon au naturel (boîte)",115,26,0,1,12,"Épicerie"], saumon:["Pavés de saumon",200,20,0,13,19,"Viande et poisson"], oeuf:["Œufs",145,12.5,0.7,10,4.3,"Crèmerie"],
 tofu:["Tofu ferme",120,13,2,7,8,"Frais"], fblanc:["Fromage blanc 0 %",50,8,4,0.2,2.2,"Crèmerie"], skyr:["Skyr nature",60,10,4,0.2,4,"Crèmerie"],
 lait:["Lait demi-écrémé",46,3.3,4.8,1.6,1,"Crèmerie"], whey:["Whey",380,78,8,6,25,"Compléments"], fromr:["Emmental râpé",380,27,1,30,9,"Crèmerie"],
 mozza:["Mozzarella",250,18,2,19,8,"Crèmerie"], banane:["Bananes",90,1.1,20,0.3,2,"Fruits et légumes"], pomme:["Pommes",52,0.3,14,0.2,2.3,"Fruits et légumes"],
 frouges:["Fruits rouges surgelés",45,1,8,0.3,6,"Surgelés"], cacah:["Beurre de cacahuète",600,25,15,50,8,"Épicerie"], amandes:["Amandes",600,21,9,52,14,"Épicerie"],
 huile:["Huile d'olive",900,0,0,100,8,"Épicerie"], miel:["Miel",300,0.3,80,0,9,"Épicerie"], brocoli:["Brocoli surgelé",34,2.8,7,0.4,2.6,"Surgelés"],
 courgette:["Courgettes",17,1.2,3,0.3,2.2,"Fruits et légumes"], poivron:["Poivrons",26,1,5,0.3,3.5,"Fruits et légumes"], tomate:["Tomates concassées",25,1.2,4,0.2,1.9,"Épicerie"],
 oignon:["Oignons",40,1.1,9,0.1,1.6,"Fruits et légumes"], carotte:["Carottes",41,0.9,10,0.2,1.3,"Fruits et légumes"], hverts:["Haricots verts surgelés",31,1.8,7,0.1,2.6,"Surgelés"],
 epinard:["Épinards surgelés",25,3,1.5,0.4,2.6,"Surgelés"], soja:["Sauce soja",60,6,6,0,4,"Épicerie"], coco:["Lait de coco",180,2,3,18,5,"Épicerie"],
 avocat:["Avocats",160,2,9,15,6,"Fruits et légumes"], mais:["Maïs (conserve)",85,3,15,1.5,3,"Épicerie"], salade:["Salade verte",15,1.4,2,0.2,4,"Fruits et légumes"]
};

/* Recettes : portion de base pour ~1 personne. m = pdj (petit-déj), main (déjeuner/dîner), snack. v = omni, pesco, vege. */
const REC = [
 {id:"porridge",n:"Porridge banane et whey",e:"🥣",m:"pdj",st:"simple",v:"vege",min:5,i:[["avoine",70],["lait",250],["banane",100],["whey",25]],p:"Fais chauffer l'avoine dans le lait 3 minutes, ajoute la banane en rondelles et la whey hors du feu."},
 {id:"oeufpain",n:"Œufs brouillés et pain complet",e:"🍳",m:"pdj",st:"francais",v:"vege",min:8,i:[["oeuf",180],["painc",80],["pomme",150]],p:"Bats 3 œufs, cuis-les doucement en remuant. Sers avec le pain grillé et une pomme."},
 {id:"skyrbowl",n:"Bowl skyr, avoine et fruits rouges",e:"🫐",m:"pdj",st:"healthy",v:"vege",min:3,i:[["skyr",250],["avoine",50],["frouges",100],["miel",10]],p:"Mélange le skyr et l'avoine, ajoute les fruits rouges décongelés et un filet de miel."},
 {id:"tartcacah",n:"Tartines beurre de cacahuète et banane",e:"🥜",m:"pdj",st:"simple",v:"vege",min:4,i:[["painc",90],["cacah",25],["banane",100],["lait",250]],p:"Tartine le beurre de cacahuète, ajoute la banane en rondelles. Un verre de lait à côté."},
 {id:"fbmiel",n:"Fromage blanc, miel et amandes",e:"🍯",m:"snack",st:"simple",v:"vege",min:2,i:[["fblanc",250],["miel",15],["amandes",20]],p:"Fromage blanc, miel par-dessus, amandes concassées."},
 {id:"shake",n:"Shake whey, banane et lait",e:"🥤",m:"snack",st:"simple",v:"vege",min:2,i:[["whey",30],["banane",100],["lait",300]],p:"Tout au blender 20 secondes. Idéal après la séance."},
 {id:"pommeam",n:"Pomme, skyr et amandes",e:"🍎",m:"snack",st:"healthy",v:"vege",min:1,i:[["pomme",150],["skyr",150],["amandes",20]],p:"À emporter à la salle ou au travail."},
 {id:"pthon",n:"Pâtes au thon et à la tomate",e:"🍝",m:"main",st:"simple",v:"pesco",min:15,i:[["pates",100],["thon",110],["tomate",200],["oignon",50],["huile",8]],p:"Cuis les pâtes. Fais revenir l'oignon dans l'huile, ajoute les tomates 5 minutes puis le thon émietté. Mélange."},
 {id:"rizpoulet",n:"Riz, poulet et brocoli",e:"🍗",m:"main",st:"simple",v:"omni",min:20,i:[["riz",90],["poulet",160],["brocoli",200],["huile",8],["soja",10]],p:"Cuis le riz et le brocoli. Saisis le poulet en dés dans l'huile, déglace à la sauce soja."},
 {id:"omelpdt",n:"Omelette pommes de terre et oignons",e:"🥔",m:"main",st:"francais",v:"vege",min:20,i:[["oeuf",180],["pdt",300],["oignon",60],["huile",10],["salade",60]],p:"Fais dorer les pommes de terre en dés avec l'oignon, verse les œufs battus, couvre 5 minutes. Salade à côté."},
 {id:"parment",n:"Hachis parmentier léger",e:"🥧",m:"main",st:"francais",v:"omni",min:35,i:[["boeuf",150],["pdt",350],["lait",80],["oignon",50],["fromr",20]],p:"Purée avec le lait. Fais revenir le bœuf et l'oignon. Bœuf au fond du plat, purée dessus, fromage, 15 minutes au four."},
 {id:"pouletrot",n:"Poulet rôti, haricots verts et pommes de terre",e:"🍽️",m:"main",st:"francais",v:"omni",min:30,i:[["poulet",170],["pdt",300],["hverts",200],["huile",10]],p:"Pommes de terre en quartiers et poulet au four 25 minutes à 200 °C avec l'huile. Haricots verts à la poêle."},
 {id:"saumonriz",n:"Saumon, riz et épinards",e:"🐟",m:"main",st:"healthy",v:"pesco",min:20,i:[["saumon",130],["riz",80],["epinard",200]],p:"Cuis le riz. Saumon à la poêle 4 minutes par face. Épinards réchauffés à côté."},
 {id:"curry",n:"Poulet curry coco et riz",e:"🍛",m:"main",st:"asiatique",v:"omni",min:25,i:[["poulet",160],["riz",85],["coco",80],["oignon",60],["poivron",100]],p:"Fais revenir oignon et poivron, ajoute le poulet en dés, le curry et le lait de coco. 10 minutes à feu doux. Riz à côté."},
 {id:"boeufsaute",n:"Bœuf sauté au soja et légumes",e:"🥢",m:"main",st:"asiatique",v:"omni",min:20,i:[["boeuf",150],["riz",90],["poivron",100],["carotte",100],["soja",15],["huile",8]],p:"Saisis le bœuf à feu vif, ajoute carottes et poivron en lamelles, la sauce soja. Sers sur le riz."},
 {id:"tofusaute",n:"Tofu sauté, riz et brocoli",e:"🥡",m:"main",st:"asiatique",v:"vege",min:20,i:[["tofu",200],["riz",85],["brocoli",200],["soja",15],["huile",10]],p:"Tofu en dés doré à la poêle, sauce soja en fin de cuisson. Riz et brocoli à côté."},
 {id:"bowlpoulet",n:"Bowl poulet, patate douce et avocat",e:"🥗",m:"main",st:"healthy",v:"omni",min:30,i:[["poulet",150],["patd",250],["avocat",60],["mais",60],["salade",50]],p:"Patate douce en cubes au four 25 minutes. Poulet grillé, avocat, maïs et salade dans un bol."},
 {id:"buddha",n:"Buddha bowl pois chiches",e:"🥙",m:"main",st:"healthy",v:"vege",min:25,i:[["poischi",200],["patd",200],["oeuf",120],["epinard",100],["huile",8]],p:"Patate douce rôtie, pois chiches poêlés aux épices, 2 œufs durs, épinards. Tout dans un bol."},
 {id:"chili",n:"Chili con carne et riz",e:"🌶️",m:"main",st:"oriental",v:"omni",min:30,i:[["boeuf",130],["harico",150],["tomate",200],["riz",80],["oignon",50],["poivron",60]],p:"Fais revenir oignon et bœuf, ajoute tomates, poivron, haricots et épices. 15 minutes à feu doux. Riz à côté."},
 {id:"couscous",n:"Couscous poulet et pois chiches",e:"🫕",m:"main",st:"oriental",v:"omni",min:30,i:[["poulet",140],["semoule",80],["poischi",100],["carotte",100],["courgette",120]],p:"Légumes et poulet mijotés 20 minutes avec les épices à couscous et les pois chiches. Semoule gonflée à l'eau chaude."},
 {id:"dahl",n:"Dahl de lentilles et riz",e:"🍲",m:"main",st:"oriental",v:"vege",min:25,i:[["lentilles",90],["riz",60],["coco",60],["tomate",150],["oignon",50]],p:"Oignon revenu, lentilles, tomates, lait de coco et curry, 20 minutes. Riz à côté."},
 {id:"burger",n:"Burger maison et potatoes",e:"🍔",m:"main",st:"street",v:"omni",min:30,i:[["painb",90],["boeuf",140],["fromr",20],["pdt",250],["salade",30],["huile",8]],p:"Potatoes au four 25 minutes. Steak façonné à la main, fromage dessus en fin de cuisson. Monte le burger avec la salade."},
 {id:"wrapp",n:"Wraps poulet crudités",e:"🌯",m:"main",st:"street",v:"omni",min:15,i:[["wrap",120],["poulet",150],["salade",50],["carotte",80],["fblanc",60],["mais",50]],p:"Poulet grillé en lamelles, sauce fromage blanc citron, crudités. Roule bien serré."},
 {id:"quesa",n:"Quesadillas haricots et fromage",e:"🫓",m:"main",st:"street",v:"vege",min:15,i:[["wrap",120],["harico",150],["mozza",60],["poivron",80],["mais",50]],p:"Garnis une tortilla, referme avec une autre, 3 minutes par face à la poêle."},
 {id:"pbolo",n:"Pâtes bolognaise",e:"🍝",m:"main",st:"francais",v:"omni",min:20,i:[["pates",100],["boeuf",130],["tomate",200],["oignon",50],["carotte",60]],p:"Bœuf, oignon et carotte revenus, tomates 10 minutes. Sur les pâtes."},
 {id:"riztofu",n:"Riz cantonais aux œufs",e:"🍚",m:"main",st:"asiatique",v:"vege",min:15,i:[["riz",90],["oeuf",180],["mais",60],["hverts",120],["soja",15],["huile",10]],p:"Riz cuit la veille, sauté à la poêle avec les œufs brouillés, les légumes et la sauce soja."}
];

const STYLES = [
 {v:"simple",l:"Simple et efficace",e:"⚡"},{v:"francais",l:"Traditionnel français",e:"🥖"},{v:"asiatique",l:"Asiatique",e:"🥢"},
 {v:"healthy",l:"Healthy bowls",e:"🥗"},{v:"oriental",l:"Oriental et mexicain",e:"🌶️"},{v:"street",l:"Street food maison",e:"🍔"}
];
const STORES = [
 {v:"lidl",l:"Lidl",f:.85},{v:"aldi",l:"Aldi",f:.85},{v:"leclerc",l:"E.Leclerc",f:.93},{v:"carrefour",l:"Carrefour",f:1},
 {v:"inter",l:"Intermarché",f:.97},{v:"auchan",l:"Auchan",f:.95},{v:"superu",l:"Super U",f:.97},{v:"monop",l:"Monoprix",f:1.25},
 {v:"franprix",l:"Franprix",f:1.25},{v:"casino",l:"Casino",f:1.12}
];

const TIPS = [
 "Double progression : garde la charge et ajoute des reps. Quand tu tiens le haut de la fourchette sur toutes les séries, monte d'un cran.",
 "Concentrique explosif, excentrique contrôlé : tu pousses fort, tu redescends lentement.",
 "Approche l'échec sur la dernière série seulement. L'échec à chaque série fait chuter les perfs.",
 "L'ego lifting ne fait pas de muscle : si les hanches ou l'élan aident, baisse la charge.",
 "Le muscle se construit pendant le repos. Dors 7 à 9 heures, c'est là que tu progresses.",
 "Des protéines à chaque repas : c'est plus simple que de rattraper tout le soir.",
 "Bois de l'eau tout au long de la journée : environ 2,5 à 3 litres quand tu t'entraînes.",
 "La créatine (3 à 5 g par jour) est l'un des compléments les plus étudiés. Pas besoin de phase de charge.",
 "Pèse-toi le matin à jeun, une fois par semaine, toujours dans les mêmes conditions.",
 "Le meilleur programme est celui que tu tiens. La régularité bat la perfection.",
 "Garde ta technique propre même en fin de séance : amplitude complète, pas d'élan.",
 "Un peu de marche chaque jour aide la récupération et limite la prise de gras pendant la masse."
];
