# Ton serveur Ektyron : sauvegarde en ligne et notifications push

Ce petit serveur gratuit (Cloudflare Worker) fait deux choses :

1. **Il garde une copie de tes données.** L'appli l'envoie toute seule après chaque changement. Sur un nouveau téléphone, tu récupères tout avec ton adresse et ton code.
2. **Il envoie les notifications à l'heure, même quand l'appli est fermée** : séance, pesée, mensurations, bilan.

Comptes 15 minutes, une seule fois. L'offre gratuite de Cloudflare suffit largement.

## 1. Créer le compte Cloudflare

Va sur <https://dash.cloudflare.com/sign-up> et crée un compte gratuit, puis confirme ton e-mail.

## 2. Générer tes clés VAPID

Ces clés signent tes notifications. Sur ton Mac, dans le Terminal :

```bash
cd ~/chemin/vers/carnet-ektyron/worker
node vapid.mjs
```

La commande affiche deux lignes, `VAPID_PUBLIC` et `VAPID_PRIVATE`. Garde-les de côté. **La clé privée ne se partage avec personne.**

## 3. Créer l'espace de stockage (KV)

1. Dans le tableau de bord Cloudflare, va dans **Storage & Databases → KV**.
2. Clique sur **Create a namespace** et nomme-le `ektyron`.

## 4. Créer le Worker

1. Va dans **Compute (Workers) → Workers & Pages → Create → Create Worker**.
2. Nomme-le `ektyron-coach`, puis clique sur **Deploy**.
3. Clique sur **Edit code**, efface tout le code d'exemple et colle le contenu de [`worker.js`](worker.js).
4. Clique sur **Deploy**.

## 5. Brancher le stockage, les clés et l'horloge

Dans le Worker, ouvre l'onglet **Settings** :

- **Bindings → Add → KV namespace** : mets `EK` comme nom de variable et choisis `ektyron`.
- **Variables and Secrets → Add** :
  - `VAPID_PUBLIC` (type *Text*) : ta clé publique ;
  - `VAPID_PRIVATE` (type *Secret*) : ta clé privée ;
  - `VAPID_SUBJECT` (type *Text*) : `mailto:` suivi de ton e-mail, par exemple `mailto:raphael@exemple.fr`.
- **Trigger Events → Add → Cron Triggers** : saisis `*/15 * * * *` (toutes les 15 minutes).

Clique sur **Deploy** si Cloudflare te le demande.

Pour vérifier, ouvre l'adresse du Worker (du type `https://ektyron-coach.TON-NOM.workers.dev`) dans Safari. Tu dois voir `"ok":true` et `"kv":true`, avec ta clé.

## 6. Dans l'appli, sur l'iPhone

L'appli doit être **installée sur l'écran d'accueil** : Safari → Partager → « Sur l'écran d'accueil ». Il faut iOS 16.4 ou plus.

1. Va dans **Profil → ⚙️ Paramètres → Synchro en ligne**.
2. Colle l'adresse du Worker.
3. Touche **Générer** pour créer ton code personnel. **Note-le** (dans Obsidian, ton gestionnaire de mots de passe…) : sans lui, impossible de récupérer tes données.
4. Touche **Enregistrer et envoyer**.
5. Plus haut, dans **Notifications**, à la ligne « Vrai push », touche **Activer** et accepte les notifications.
6. Touche **Tester** : une notification doit arriver en quelques secondes.

## Questions

- **Changement de téléphone :** installe l'appli, puis va dans Paramètres → Synchro en ligne. Mets la même adresse et le même code, puis touche **Récupérer**.
- **Sécurité :** le serveur ne stocke que l'empreinte de ton code, jamais le code lui-même. Choisis un code long (le bouton Générer en fait un de 16 caractères).
- **Coût :** l'offre gratuite donne 100 000 requêtes par jour et 1 000 écritures par jour. L'appli en utilise quelques dizaines.
