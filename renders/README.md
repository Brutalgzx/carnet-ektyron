# Animations 3D « mauvais ✗ / bon ✓ »

Chaque exercice a une vidéo `renders/<id>.mp4` (6 s, boucle, 720×1280, < 300 Ko) :
moitié haute = mauvais mouvement (zones à risque en rouge), moitié basse = bon mouvement (muscle visé en vert).
Tout est construit par nos scripts (aucun modèle ni vidéo tiers). L'ancien moteur canvas / three.js est supprimé.

## Fichiers
| Fichier | Rôle |
|---|---|
| `gen.py` | Générateur Blender commun : studio, mannequin, matériel, cadrage auto, zones, bandeau |
| `exos.py` | Une entrée par exercice : poses A/B (C si alterné), version `bad`, zones, textes, matériel. Listes `ROMY`, `LOT2`, `LOT3`, alias `ALIAS` |
| `sheet.sh` + `tile.py` | Planche de contrôle (BON départ, BON fin, MAUVAIS fin) |
| `build_all.sh` | Rendu vidéo des exercices passés en argument |
| `vids.py` | Met à jour la liste `VIDS` / `VALIAS` de `data.js` d'après les .mp4 présents |
| `hipt.py`, `build.sh` | Premier essai validé (hip thrust), gardé tel quel |

## Côté app
- `data.js` : `animTag(id, anim, nom, classe)` renvoie la balise `<video>` (exercice, sinon son animation, sinon alias), ou rien.
- `anim.js` : lecture seulement quand la vidéo est à l'écran ; si elle ne charge pas, elle est retirée.
- `sw.js` : les .mp4 passent par le réseau seulement (trop lourds pour le cache hors ligne).

## Procédure pour un lot
1. Planche : `sh renders/sheet.sh <dossier> <ids…>` puis `python3 renders/tile.py <dossier> <ids…>`, relire, corriger `exos.py`.
2. Rendu : `sh renders/build_all.sh <dossier_tmp> <ids…>` (≈ 3,5 min par exercice).
3. `python3 renders/vids.py`, augmenter les `?v=` de `index.html` et `CACHE` de `sw.js`.
4. Test local (`python3 -m http.server`), commit, **accord de l'utilisateur avant `git push origin main`**.

## Suivi
- [x] Lot Romy (22 + hip thrust) : en ligne
- [x] Lot 2 (52 exercices) : rendu
- [x] Lot 3 (25 échauffements / étirements) : rendu
- [ ] Fin : `vids.py`, versions, test, commit, accord, push
