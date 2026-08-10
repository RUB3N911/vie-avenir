# VIE AVENIR

Site vitrine de l’association martiniquaise **VIE AVENIR**, qui crée des rencontres entre les jeunes de 14 à 25 ans et des professionnels inspirants.

> **VA ET DEVIENS !**

## Le socle technique

- Next.js 16 et React 19
- TypeScript
- CSS responsive avec la charte graphique VIE AVENIR
- GitHub pour versionner, relire et valider les évolutions
- Vercel pour les aperçus automatiques et la mise en production

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
app/
  layout.tsx       Métadonnées et structure générale
  page.tsx         Page d’accueil
  globals.css      Identité visuelle et responsive
public/            Logo, favicon et images publiques
.github/           Contrôles automatiques et modèle de pull request
```

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
