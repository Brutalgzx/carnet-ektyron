/* Base d'aliments pour les « Extras » (Nutrition) : valeurs moyennes pour 100 g (ou 100 ml), d'après les tables françaises courantes (Ciqual) et les étiquettes habituelles.
   Chaque groupe : [nom du groupe, emoji, [[nom, kcal, protéines, glucides, lipides, grammes d'une portion, nom de la portion], …]].
   Ce qui n'est pas ici se cherche en ligne (Open Food Facts) ou se recopie depuis l'étiquette. */
const ALIM_G=[
["Yaourts et laitages","🥛",[
["Yaourt nature",56,4.2,5.3,1.9,125,"pot"],["Yaourt nature 0 %",42,4.5,5.6,0.1,125,"pot"],["Yaourt au lait entier",72,3.6,5,4,125,"pot"],
["Yaourt aux fruits",94,3.3,14,2.6,125,"pot"],["Yaourt sucré / à la vanille",98,3.5,15,2.6,125,"pot"],["Yaourt à boire",75,2.8,12,1.6,200,"bouteille"],
["Yaourt à la grecque",120,4,4,10,150,"pot"],["Yaourt grec 0 %",57,10,4,0.2,150,"pot"],["Skyr nature",63,10,4,0.2,140,"pot"],["Skyr aux fruits",80,8.5,10,0.2,140,"pot"],
["Fromage blanc 0 %",45,7.5,4,0.1,100,"portion"],["Fromage blanc 3 %",72,7,3.8,3.2,100,"portion"],["Faisselle",98,7,3.5,6,100,"pot"],
["Petit-suisse nature",120,8.5,3.5,8,60,"2 petits-suisses"],["Petit-suisse aux fruits",120,6,13,5,50,"2 petits pots"],
["Yaourt au soja nature",50,4,2.1,2.3,125,"pot"],["Dessert au soja chocolat",85,3,13,2.2,125,"pot"],
["Crème dessert au chocolat",124,3.1,19.6,3.4,125,"pot"],["Crème dessert à la vanille",115,3,18,3.3,125,"pot"],["Liégeois au chocolat",140,3,20,5,100,"pot"],
["Flan nappé caramel",110,3,19,2.4,100,"pot"],["Mousse au chocolat",190,4.5,22,9,60,"pot"],["Riz au lait",130,3.3,21,3.6,125,"pot"],["Semoule au lait",120,3.4,19,3.3,125,"pot"],
["Île flottante",140,5.5,21,4,125,"pot"],["Crème brûlée",250,4,22,16,100,"ramequin"],["Panna cotta",220,3,20,14,100,"pot"],["Tiramisu",280,5,28,16,100,"part"],
["Lait demi-écrémé",46,3.3,4.8,1.6,250,"bol / grand verre"],["Lait entier",64,3.3,4.8,3.6,250,"bol / grand verre"],["Lait écrémé",34,3.4,4.9,0.1,250,"bol / grand verre"],
["Lait chocolaté",72,3.2,10.5,1.7,250,"verre"],["Boisson au soja",40,3.3,2.5,1.8,250,"verre"],["Boisson à l'avoine",45,0.8,7,1.4,250,"verre"],["Boisson à l'amande",24,0.5,3,1.1,250,"verre"],
["Crème fraîche épaisse",300,2.4,3,30,15,"c. à soupe"],["Crème légère 15 %",160,2.7,4,15,15,"c. à soupe"]]],
["Fromages","🧀",[
["Camembert",270,20,0.5,21,30,"portion"],["Brie",330,20,0.5,28,30,"portion"],["Comté",410,28,0,33,30,"portion"],["Emmental",380,28,0,30,30,"portion"],
["Emmental râpé",380,28,0,30,20,"poignée"],["Gouda",360,25,0,28,30,"portion"],["Raclette",350,24,0,28,30,"tranche"],["Reblochon",330,21,0,27,30,"portion"],
["Roquefort",370,20,0.5,32,30,"portion"],["Chèvre (bûche)",330,20,1,27,30,"portion"],["Chèvre frais",210,11,3,17,30,"portion"],["Feta",265,14,1,22,30,"portion"],
["Mozzarella",240,18,1,18,125,"boule"],["Burrata",280,15,1.5,24,125,"burrata"],["Parmesan râpé",400,33,0,29,10,"c. à soupe"],
["Fromage fondu en portion",240,10,6,19,17.5,"portion"],["Mini fromage (type Babybel)",300,22,0,24,22,"mini fromage"],["Fromage frais à tartiner",250,7,3,23,30,"portion"],
["Cancoillotte",120,14,1.5,6.5,30,"portion"]]],
["Gâteaux et pâtisseries","🍰",[
["Crêpe nature",200,6,26,8,60,"crêpe"],["Crêpe au sucre",240,6,34,8,65,"crêpe"],["Crêpe à la pâte à tartiner",300,6,38,13,75,"crêpe"],["Crêpe à la confiture",240,5,38,7,75,"crêpe"],
["Galette complète (jambon, œuf, fromage)",190,10,15,10,200,"galette"],["Gaufre au sucre",360,7,45,17,80,"gaufre"],["Pancake",230,6,30,9,50,"pancake"],
["Croissant",410,8,45,21,60,"croissant"],["Pain au chocolat",420,7.5,46,22,70,"pain au chocolat"],["Pain aux raisins",320,6,45,13,110,"pièce"],
["Chausson aux pommes",310,4,36,16,110,"chausson"],["Brioche",360,8.5,49,14,40,"tranche"],["Pain au lait",340,9,52,10,35,"pain au lait"],["Kouign-amann",440,5,46,27,100,"part"],
["Madeleine",450,6,55,23,25,"madeleine"],["Financier",450,8,45,26,35,"financier"],["Cookie",480,6,62,23,30,"cookie"],["Brownie",450,6,50,25,50,"part"],
["Muffin au chocolat",420,6,50,21,80,"muffin"],["Donut",420,5,50,22,60,"donut"],["Beignet (boule de Berlin)",390,7,47,19,70,"beignet"],["Churros",410,5,40,25,60,"portion"],
["Éclair au chocolat",260,6,33,11,90,"éclair"],["Religieuse",290,6,35,14,110,"religieuse"],["Mille-feuille",330,4.5,38,18,120,"part"],["Paris-brest",380,7,30,26,110,"part"],
["Tarte aux pommes",260,3,35,12,120,"part"],["Tarte au citron meringuée",320,4,45,14,110,"part"],["Tarte aux fraises",230,3,30,11,120,"part"],["Flan pâtissier",170,4.5,26,5,120,"part"],
["Clafoutis",180,5,25,7,120,"part"],["Gâteau au chocolat / fondant",400,6,45,22,80,"part"],["Gâteau au yaourt",360,6,50,15,70,"part"],["Quatre-quarts",410,5.5,50,21,50,"tranche"],
["Cake aux fruits",380,5,57,14,50,"tranche"],["Cheesecake",320,6,26,21,100,"part"],["Carrot cake",360,4.5,45,18,90,"part"],["Galette des rois",470,8,40,30,110,"part"],
["Macaron",400,6,58,17,12,"macaron"],["Pain d'épices",330,4,73,2,30,"tranche"],["Salade de fruits",60,0.6,14,0.1,150,"bol"],
["Compote sans sucre ajouté",55,0.3,12,0.2,100,"gourde / pot"],["Compote sucrée",80,0.2,19,0.2,100,"gourde / pot"]]],
["Glaces","🍦",[
["Glace à la vanille",210,3.5,24,11,50,"boule"],["Glace au chocolat",220,4,25,11,50,"boule"],["Sorbet",130,0.3,32,0,50,"boule"],
["Cône glacé",300,4,35,15,75,"cône"],["Bâtonnet glacé enrobé chocolat",320,4,30,20,80,"bâtonnet"],["Glace à l'eau",80,0,20,0,60,"bâtonnet"]]],
["Biscuits, chocolat et sucreries","🍫",[
["Biscuit sec (type petit-beurre)",440,7,73,12,8,"biscuit"],["Biscuit fourré au chocolat",470,6,68,19,12.5,"biscuit"],["Sablé",500,6,64,24,10,"sablé"],
["Speculoos",480,5,72,19,6.5,"biscuit"],["Gâteau moelleux de goûter",400,6,52,18,30,"gâteau"],["Barre de céréales",400,6,68,11,25,"barre"],
["Barre chocolat caramel",450,4,70,17,50,"barre"],["Barre chocolat cacahuètes",490,9,58,24,50,"barre"],["Barre biscuit chocolat",510,6,62,26,42,"barre"],["Barre noix de coco chocolat",490,4,57,26,57,"barre"],
["Chocolat noir 70 %",570,8,33,42,10,"carré"],["Chocolat au lait",540,7,57,31,10,"carré"],["Chocolat blanc",550,6,58,33,10,"carré"],
["Pâte à tartiner chocolat-noisette",540,6,57,31,15,"c. à soupe"],["Beurre de cacahuète",600,25,15,50,15,"c. à soupe"],["Confiture",250,0.4,60,0.1,20,"c. à soupe"],
["Miel",320,0.4,80,0,15,"c. à soupe"],["Sucre",400,0,100,0,5,"morceau / c. à café"],["Bonbons gélifiés",340,6,77,0.2,30,"poignée"],["Guimauve",330,3,80,0,30,"3 guimauves"],
["Céréales sucrées / chocolatées",390,8,75,5,40,"bol"],["Corn-flakes",380,7,84,1,30,"bol"],["Muesli",370,9,64,7,45,"bol"],["Granola",450,9,62,17,45,"bol"]]],
["Apéritif et grignotage","🥜",[
["Chips",540,6,50,34,30,"petit paquet"],["Tortilla chips",490,7,60,24,30,"poignée"],["Crackers apéritif",490,8,63,22,20,"poignée"],["Bretzels",380,10,76,3,30,"poignée"],
["Pop-corn sucré",450,5,75,15,30,"cornet"],["Pop-corn salé",480,9,55,25,30,"cornet"],["Cacahuètes grillées salées",610,26,10,50,30,"poignée"],
["Amandes",600,22,7,51,30,"poignée"],["Noix de cajou",590,18,27,46,30,"poignée"],["Noix",690,15,7,65,30,"poignée"],["Pistaches",600,21,17,47,30,"poignée"],
["Mélange noix et raisins secs",480,13,40,30,30,"poignée"],["Olives",145,1,0.5,15,30,"poignée"],["Saucisson sec",420,26,1.5,34,30,"6 rondelles"],
["Houmous",290,7.5,13,23,50,"2 c. à soupe"],["Guacamole",160,2,6,14,50,"2 c. à soupe"],["Tarama",520,4,7,53,30,"c. à soupe bombée"],["Feuilleté apéritif",400,10,25,28,30,"3 feuilletés"]]],
["Entrées et salades","🥗",[
["Carottes râpées vinaigrette",80,1,7,5,150,"assiette"],["Céleri rémoulade",170,1.2,4,16,100,"portion"],["Taboulé",170,3.5,24,6.5,150,"portion"],
["Salade verte vinaigrette",70,1.3,2,6.5,80,"bol"],["Salade de pâtes",160,5,20,6.5,200,"portion"],["Salade piémontaise",160,4,13,10,150,"portion"],
["Salade niçoise",100,6,5,6,250,"assiette"],["Salade César",150,9,6,10,250,"assiette"],["Œuf mayonnaise",230,10,1,21,100,"2 moitiés"],["Concombre à la crème",60,1.5,4,4,100,"portion"],
["Betteraves vinaigrette",70,1.5,8,3,100,"portion"],["Soupe de légumes",40,1.2,6,1.2,250,"bol"],["Velouté (avec crème)",60,1.3,6,3.5,250,"bol"],["Gaspacho",40,1,5,2,250,"bol"],
["Soupe à l'oignon gratinée",95,4,9,5,300,"bol"],["Avocat",160,2,2,15,100,"demi-avocat"],["Quiche lorraine",270,9.5,18,18,150,"part"],["Tarte salée aux légumes",230,6,18,15,150,"part"],
["Nem",230,8,22,12,50,"nem"],["Samoussa",270,7,26,15,40,"samoussa"],["Maki au saumon",150,5,27,2.5,25,"pièce"],["Sushi au saumon",170,7,26,4,30,"pièce"],["California roll",170,5,24,6,30,"pièce"],
["Jambon blanc",115,20,1,3.5,45,"tranche"],["Jambon cru",230,28,0.5,13,20,"tranche"],["Rillettes",400,15,0.5,38,30,"portion"],["Pâté de campagne",300,14,2,26,40,"tranche"],
["Saumon fumé",180,22,0,10,40,"2 tranches"],["Surimi",105,8,13,2,50,"3 bâtonnets"]]],
["Sandwichs et restauration rapide","🍔",[
["Sandwich jambon-beurre",270,12,32,10,200,"sandwich"],["Sandwich poulet crudités",210,10,26,7,250,"sandwich"],["Panini",270,12,30,11,200,"panini"],["Wrap au poulet",200,11,22,7,200,"wrap"],
["Croque-monsieur",260,13,22,13,130,"croque"],["Hot-dog",270,10,25,15,130,"hot-dog"],["Hamburger",250,12,30,9,105,"burger"],["Cheeseburger",260,13,28,11,115,"burger"],
["Gros burger (double, sauce)",232,12,19,12,220,"burger"],["Burger de restaurant",240,13,20,12,300,"burger"],["Frites",300,3.5,38,15,115,"portion moyenne"],
["Nuggets de poulet",270,15,17,16,100,"6 nuggets"],["Kebab (sandwich)",220,11,22,10,350,"kebab"],["Tacos (taille M)",230,10,22,11,400,"tacos"],
["Pizza margherita",240,10,30,9,125,"part (¼)"],["Pizza reine",230,11,27,8.5,125,"part (¼)"],["Pizza 4 fromages",270,12,28,12,125,"part (¼)"],["Pizza entière (moyenne)",250,11,29,10,450,"pizza"]]],
["Plats","🍝",[
["Lasagnes",150,8,13,7,300,"part"],["Pâtes bolognaise",150,7,20,4.5,300,"assiette"],["Pâtes carbonara",200,8,22,9,300,"assiette"],["Riz cantonais",170,6,25,5,250,"assiette"],
["Couscous",140,8,15,5,400,"assiette"],["Paëlla",150,9,17,5,350,"assiette"],["Hachis parmentier",130,7,10,7,300,"part"],["Gratin dauphinois",150,3,13,9.5,200,"part"],
["Tartiflette",200,9,12,13,300,"part"],["Chili con carne",120,8,11,5,300,"assiette"],["Curry de poulet au riz",140,9,17,4,350,"assiette"],["Poulet rôti",200,27,0,10,120,"cuisse"],
["Steak haché 5 %",150,24,0,6,100,"steak"],["Steak haché 15 %",230,21,0,16,100,"steak"],["Blanc de poulet cuit",150,30,0,3,120,"filet"],["Œuf dur",145,12.5,0.7,10,55,"œuf"],
["Œuf au plat",190,13,0.8,15,60,"œuf"],["Omelette nature",155,11,1,12,120,"2 œufs"],["Thon au naturel",115,26,0,1,80,"petite boîte"],["Sardines à l'huile",220,24,0,14,60,"3 sardines"],
["Pâtes cuites",135,5,27,0.9,200,"assiette"],["Riz cuit",130,2.7,28,0.3,150,"portion"],["Semoule cuite",115,4,23,0.2,150,"portion"],["Pommes de terre vapeur",80,2,17,0.1,150,"portion"],
["Purée",85,2,13,3,200,"portion"]]],
["Pain et accompagnements","🥖",[
["Baguette",270,9,56,1.3,50,"morceau"],["Pain complet",240,9,44,2.5,40,"tranche"],["Pain de mie",270,8.5,49,4,25,"tranche"],["Biscotte",400,11,72,6,8,"biscotte"],
["Galette de riz soufflé",390,8,81,3,8,"galette"],["Beurre",740,0.7,0.6,82,10,"noisette"],["Huile d'olive",900,0,0,100,10,"c. à soupe"],["Mayonnaise",700,1.3,1.5,76,15,"c. à soupe"],
["Ketchup",110,1.2,25,0.1,15,"c. à soupe"],["Vinaigrette",450,0.5,5,47,15,"c. à soupe"],["Sauce barbecue",150,1,35,0.5,15,"c. à soupe"]]],
["Fruits","🍎",[
["Pomme",54,0.3,12,0.3,150,"pomme"],["Banane",90,1.1,20,0.3,120,"banane"],["Orange",47,0.9,9,0.1,150,"orange"],["Clémentine",47,0.8,10,0.2,70,"clémentine"],
["Poire",55,0.4,12,0.2,150,"poire"],["Kiwi",60,1,11,0.6,80,"kiwi"],["Fraises",33,0.7,6,0.3,150,"bol"],["Raisin",70,0.7,16,0.2,125,"grappe"],["Pêche",40,0.9,9,0.1,150,"pêche"],
["Abricot",45,0.9,9,0.2,45,"abricot"],["Ananas",52,0.5,12,0.1,150,"portion"],["Mangue",65,0.8,14,0.4,150,"demi-mangue"],["Melon",35,0.8,7.5,0.2,200,"demi-melon"],
["Pastèque",30,0.6,7,0.2,300,"tranche"],["Cerises",60,1,13,0.3,150,"bol"],["Framboises",45,1.2,5,0.5,125,"barquette"],["Myrtilles",50,0.7,10,0.3,125,"barquette"],
["Dattes",290,2.5,70,0.4,25,"3 dattes"],["Abricots secs",240,3.5,55,0.5,30,"5 abricots"],["Raisins secs",300,3,69,0.5,30,"poignée"],["Pruneaux",240,2.5,57,0.4,30,"4 pruneaux"]]],
["Boissons","🥤",[
["Soda (type cola)",42,0,10.6,0,330,"canette"],["Soda zéro / light",0.5,0,0,0,330,"canette"],["Jus d'orange",45,0.7,10,0.1,200,"verre"],["Jus de pomme",46,0.1,11,0.1,200,"verre"],
["Nectar de fruits",55,0.3,13,0,200,"verre"],["Thé glacé",28,0,7,0,330,"canette"],["Sirop à l'eau",27,0,6.5,0,250,"verre"],["Smoothie",55,0.7,12,0.3,250,"bouteille"],
["Boisson énergisante",45,0,11,0,250,"canette"],["Café noir",1,0.1,0,0,100,"tasse"],["Café au lait / latte",45,3,4.5,1.7,250,"tasse"],["Cappuccino",38,2.2,3.7,1.6,180,"tasse"],
["Chocolat chaud",80,3.2,11,2.5,250,"tasse"],["Bière blonde",43,0.4,3.5,0,250,"demi"],["Vin rouge",85,0.1,0.3,0,125,"verre"],["Vin blanc / rosé",80,0.1,1,0,125,"verre"],
["Champagne",80,0.2,1.5,0,100,"coupe"],["Cidre",35,0,3.5,0,250,"bolée"],["Alcool fort (40 %)",230,0,0,0,40,"verre"],["Cocktail sucré",150,0,15,0,200,"verre"]]]];
const ALIM=ALIM_G.flatMap(([g,e,L])=>L.map(([n,k,P,C,F,pg,pu],i)=>({id:g.slice(0,3)+i,n,g,e,k,P,C,F,pg,pu})));
