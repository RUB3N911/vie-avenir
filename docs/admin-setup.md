# Espace administrateur VIE AVENIR

L’administration utilise Supabase pour réunir dans un même service :

- la connexion du compte administrateur ;
- les informations officielles de l’association ;
- les événements et leur statut de publication ;
- les visuels des événements.

## Première activation

1. Ajouter l’intégration **Supabase** au projet Vercel `vie-avenir` depuis le Marketplace Vercel.
2. Vérifier que Vercel a créé les variables `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
3. Ouvrir l’éditeur SQL Supabase et exécuter `supabase/migrations/202608110001_admin_cms.sql`.
4. Dans **Authentication > Users**, créer le compte qui doit accéder à `/admin`.
5. Copier `supabase/seed-admin.example.sql`, remplacer l’adresse d’exemple par l’adresse de ce compte, puis exécuter la requête.
6. Relancer un déploiement Vercel afin que les variables soient prises en compte.

Il n’existe volontairement aucune page d’inscription publique à l’administration. Un compte authentifié qui n’est pas présent dans `admin_users` est immédiatement déconnecté.

## Publication des événements

- **Brouillon** : visible uniquement dans l’administration.
- **Publié** : visible sur l’accueil et sur la page Événements.
- **Archivé** : conservé dans l’administration mais retiré du site public.

Les images acceptées sont les fichiers JPG, PNG et WebP de 5 Mo maximum. Elles sont stockées dans le bucket public `event-images` ; seuls les administrateurs autorisés peuvent y ajouter, modifier ou supprimer des fichiers.

## Sécurité

La base active la sécurité au niveau des lignes (RLS). Les visiteurs peuvent uniquement lire les événements publiés et les coordonnées publiques. Toutes les mutations exigent à la fois une session authentifiée et la présence du compte dans `admin_users`.
