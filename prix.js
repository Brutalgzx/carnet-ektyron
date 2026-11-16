/* Prix des courses — fichier réécrit une fois par mois par la mise à jour automatique (ne pas éditer à la main sans changer « date »).
   base : prix au kilo (ou au litre) chez E.Leclerc drive, marque distributeur, hors promotion.
   idx : écart moyen de chaque enseigne par rapport à Leclerc (palmarès UFC-Que Choisir, comparatifs hard-discount).
   rel : prix au kilo relevés directement dans une enseigne (prioritaires sur base × idx).
   rayons : si présent, l'enseigne ne vend que ces rayons (ex. Picard = surgelés). */
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
