/* Prix des courses — fichier réécrit une fois par mois par la mise à jour automatique (ne pas éditer à la main sans changer « date »).
   base : prix au kilo (ou au litre) chez E.Leclerc drive, marque distributeur, hors promotion.
   idx : écart moyen de chaque enseigne par rapport à Leclerc (palmarès UFC-Que Choisir, comparatifs hard-discount).
   rel : prix au kilo relevés directement dans une enseigne (prioritaires sur base × idx).
   rayons : si présent, l'enseigne ne vend que ces rayons (ex. Picard = surgelés).
   gammes : produits par gamme, choisis selon le budget (courses.js). Clé = niveau : 0 premier prix, 2 qualité des protéines, 3 qualité partout (frais, bio).
     Le niveau 1 (marque distributeur) = « base ». Valeur : [nom, prix au kilo chez Leclerc, rayon si différent, étiquette]. À CONSERVER lors de la mise à jour mensuelle. */
const PRIX=
{
 "date": "2026-11-16",
 "sources": ["UFC-Que Choisir, palmarès des drives (mai 2026)", "Relevé drives 20/10/2026 (Leclerc, Intermarché, Super U, Carrefour Market)", "Comparatif hard-discount Lidl / Aldi 2026", "Catalogue Lidl 12–18/11/2026 (promos exclues)"],
 "idx": {"lidl": 0.975, "aldi": 1.02, "leclerc": 1, "inter": 1.04, "superu": 1.045, "carrefour": 1.07, "auchan": 1.11, "casino": 1.15, "franprix": 1.25, "monop": 1.28, "picard": 1.35},
 "rayons": {"picard": ["Surgelés"]},
 "base": {
  "riz": 1.05, "pates": 1.10, "semoule": 1.60, "avoine": 1.70, "painc": 3.20, "wrap": 4.80, "painb": 3.90, "pdt": 1.30, "patd": 2.80,
  "lentilles": 3.40, "poischi": 2.20, "harico": 2.20, "poulet": 9.49, "dinde": 9.90, "boeuf": 12.50, "thon": 13.00, "saumon": 22.00,
  "oeuf": 3.32, "tofu": 9.00, "fblanc": 2.30, "skyr": 4.20, "lait": 1.05, "whey": 24.00, "fromr": 9.50, "mozza": 8.50,
  "banane": 1.90, "pomme": 2.40, "frouges": 6.50, "cacah": 8.50, "amandes": 15.00, "huile": 8.90, "miel": 10.00,
  "brocoli": 2.60, "courgette": 2.50, "poivron": 3.90, "tomate": 1.90, "oignon": 1.70, "carotte": 1.30, "hverts": 2.60,
  "epinard": 2.40, "soja": 4.50, "coco": 5.00, "avocat": 6.50, "mais": 3.00, "salade": 4.50, "porc": 12.50, "jambon": 13.50,
  "cabil": 14.00, "bveg": 1.90, "galriz": 9.50, "quinoa": 7.50, "nouilles": 4.50, "champi": 4.20
 },

 "gammes": {
  "riz": {"0": ["Riz long premier prix", 0.85], "3": ["Riz basmati complet bio", 3.40, null, "Bio · Nutri-Score A"]},
  "pates": {"0": ["Pâtes premier prix", 0.85], "3": ["Pâtes complètes bio", 2.60, null, "Bio · Nutri-Score A"]},
  "avoine": {"0": ["Flocons d'avoine premier prix", 1.35], "3": ["Flocons d'avoine bio", 2.70, null, "Bio · Nutri-Score A"]},
  "painc": {"0": ["Pain de mie complet premier prix", 2.40], "3": ["Pain complet au levain (boulangerie)", 5.80, null, "Boulangerie"]},
  "pdt": {"0": ["Pommes de terre (sac de 5 kg)", 0.95]},
  "poischi": {"0": ["Pois chiches premier prix (conserve)", 1.70]},
  "harico": {"0": ["Haricots rouges premier prix (conserve)", 1.70]},
  "tomate": {"0": ["Tomates concassées premier prix", 1.40], "3": ["Tomates fraîches", 3.20, "Fruits et légumes", "Frais"]},
  "poulet": {"0": ["Filets de poulet surgelés premier prix", 7.20, "Surgelés"], "2": ["Filets de poulet fermier Label Rouge", 17.90, null, "Label Rouge"]},
  "dinde": {"0": ["Escalopes de dinde premier prix", 7.90], "2": ["Escalopes de dinde fermière Label Rouge", 16.50, null, "Label Rouge"]},
  "boeuf": {"0": ["Bœuf haché 5 % surgelé premier prix", 9.50, "Surgelés"], "2": ["Steak haché 5 % race à viande, origine France", 16.50, null, "Race à viande"]},
  "porc": {"0": ["Filet de porc premier prix", 9.50], "2": ["Filet mignon de porc Label Rouge", 18.50, null, "Label Rouge"]},
  "jambon": {"0": ["Jambon blanc premier prix", 9.50], "2": ["Jambon blanc supérieur sans nitrite", 18.90, null, "Sans nitrite"]},
  "thon": {"0": ["Thon albacore au naturel premier prix", 10.50], "2": ["Thon albacore pêché à la ligne", 19.50, null, "Pêche durable MSC"]},
  "saumon": {"0": ["Pavés de saumon surgelés premier prix", 15.90, "Surgelés"], "2": ["Pavés de saumon frais Label Rouge", 29.00, null, "Label Rouge"]},
  "cabil": {"0": ["Filets de colin d'Alaska surgelés", 8.90], "2": ["Dos de cabillaud frais", 24.00, "Viande et poisson", "Frais · MSC"]},
  "oeuf": {"0": ["Œufs premier prix (élevés au sol)", 2.70], "2": ["Œufs plein air Label Rouge", 4.40, null, "Label Rouge"], "3": ["Œufs bio", 5.20, null, "Bio"]},
  "tofu": {"0": ["Tofu nature premier prix", 7.20], "2": ["Tofu ferme bio, soja français", 12.00, null, "Bio"]},
  "whey": {"0": ["Whey premier prix (sachet 1 kg)", 19.90], "2": ["Whey isolat, marque sport", 34.00, null, "Isolat"]},
  "fblanc": {"0": ["Fromage blanc 0 % premier prix", 1.90], "3": ["Fromage blanc 0 % bio", 3.40, null, "Bio"]},
  "skyr": {"0": ["Skyr nature premier prix", 3.40], "3": ["Skyr nature bio", 5.90, null, "Bio"]},
  "lait": {"0": ["Lait demi-écrémé premier prix", 0.89], "3": ["Lait demi-écrémé bio", 1.39, null, "Bio"]},
  "fromr": {"0": ["Emmental râpé premier prix", 7.90], "3": ["Comté râpé AOP", 17.90, null, "AOP"]},
  "mozza": {"0": ["Mozzarella premier prix", 6.50], "3": ["Mozzarella di bufala", 16.00, null, "AOP"]},
  "cacah": {"0": ["Beurre de cacahuète premier prix", 6.50], "3": ["Beurre de cacahuète 100 % cacahuètes", 12.00, null, "Sans huile de palme"]},
  "amandes": {"0": ["Amandes premier prix", 12.50]},
  "huile": {"0": ["Huile de tournesol", 2.40], "3": ["Huile d'olive vierge extra bio", 13.50, null, "Bio"]},
  "banane": {"0": ["Bananes premier prix", 1.60], "3": ["Bananes bio", 2.80, null, "Bio"]},
  "pomme": {"0": ["Pommes (sac premier prix)", 1.70], "3": ["Pommes bio", 3.60, null, "Bio"]},
  "frouges": {"0": ["Fruits rouges surgelés premier prix", 4.90], "3": ["Myrtilles fraîches", 14.00, "Fruits et légumes", "Frais"]},
  "brocoli": {"3": ["Brocoli frais", 3.40, "Fruits et légumes", "Frais"]},
  "hverts": {"3": ["Haricots verts frais", 6.50, "Fruits et légumes", "Frais"]},
  "epinard": {"3": ["Pousses d'épinard fraîches", 9.50, "Fruits et légumes", "Frais"]},
  "carotte": {"3": ["Carottes bio", 2.30, null, "Bio"]},
  "courgette": {"3": ["Courgettes bio", 3.90, null, "Bio"]}
 },
 "rel": {
  "aldi": {"riz": 0.89, "pates": 0.90, "oeuf": 2.98},
  "lidl": {"riz": 0.95, "pates": 0.95, "oeuf": 3.08},
  "leclerc": {"riz": 1.05, "pates": 1.10, "oeuf": 3.32, "poulet": 9.49},
  "carrefour": {"riz": 1.09, "pates": 1.18, "oeuf": 3.48},
  "inter": {"poulet": 10.95},
  "superu": {"poulet": 11.75}
 }
}
;
