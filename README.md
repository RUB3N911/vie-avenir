# VIE AVENIR

Site vitrine de l’association martiniquaise **VIE AVENIR**, qui crée des rencontres entre les jeunes de 14 à 25 ans et des professionnels inspirants.

> **VA ET DEVIENS !**

## Le socle technique

- Next.js 16 et React 19
- TypeScript
- CSS responsive avec la charte graphique VIE AVENIR
- GitHub pour versionner, relire et valider les évolutions
- Vercel pour les aperçus automatiques et la mise en production
- Supabase pour l’administration, les événements et leurs visuels

## Lancer le site

Prérequis : Node.js 22 et npm.

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Le site est ensuite accessible sur `http://localhost:3000`.

## Vérifier une modification

```bash
npm run check
```

Cette commande contrôle les types, la qualité du code et la construction de la version Vercel.

## Organisation

```text
src/
  app/                    Routes, métadonnées et styles globaux Next.js
  app/admin/              Connexion et écrans de gestion privés
  components/             Composants interactifs et réutilisables
  data/                   Navigation et futures données éditoriales
  layouts/                En-tête, menu, pied de page et structures partagées
  lib/                    Configuration du site et fonctions techniques
docs/                     Identité, plan de contenu et feuille de route
public/images/            Visuels classés par usage (marque, accueil, mission)
public/favicon.svg        Icône du site
supabase/                 Schéma sécurisé et activation du compte administrateur
.github/                  Contrôles automatiques et modèle de pull request
```

Cette organisation reprend la logique des projets `lescolibris226-site` et `secret-diles`, tout en conservant les conventions de routage propres à Next.js.

## Flux GitHub → Vercel

1. Une évolution est développée sur une branche dédiée.
2. Une pull request est ouverte sur GitHub.
3. GitHub vérifie automatiquement le projet.
4. Vercel crée un lien d’aperçu pour valider visuellement la modification.
5. Après validation, la pull request est fusionnée dans `main` et Vercel met à jour le site officiel.

Le déploiement est confié à l’intégration Git native de Vercel. Aucun jeton Vercel ne doit être enregistré dans le dépôt GitHub.

## Configuration

| Variable | Rôle | Exemple |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Adresse publique du site, utile pour les futurs liens absolus et le référencement | `https://www.vie-avenir.fr` |
| `NEXT_PUBLIC_SUPABASE_URL` | Adresse de la base et du service d’authentification | Fournie par Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Clé publique utilisée avec les règles RLS | Fournie par Supabase |

Tant que Supabase n’est pas raccordé, le site conserve l’événement initial et la page `/admin/connexion` indique clairement que l’activation est en attente. La procédure complète est décrite dans [`docs/admin-setup.md`](docs/admin-setup.md).

Les secrets et les fichiers `.env.local` ne doivent jamais être ajoutés à Git.

## Commandes principales

- `npm run dev` lance le site en local.
- `npm run check` vérifie les types, le code et la construction de production.
- `npm run build:vercel` construit la version Next.js destinée à Vercel.

## Identité visuelle

- Bleu nuit : `#0D1B3D`
- Rose : `#E6007E`
- Orange : `#FF8A00`
- Jaune : `#FFD200`
- Vert : `#4CAF50`
- Typographies : Poppins, Montserrat et polices de repli système

© 2026 VIE AVENIR — Martinique
