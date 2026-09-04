# Notifications e-mail des demandes

Lorsqu'une demande est validée sur la page Contact, elle est d'abord enregistrée dans Supabase. Deux e-mails sont ensuite envoyés en arrière-plan :

- une notification envoyée à `contact@vieavenir.fr`, avec l'adresse du demandeur en réponse directe ;
- un accusé de réception au demandeur, dont l'adresse de réponse est `contact@vieavenir.fr`.

Si le service d'e-mail est momentanément indisponible, la demande reste consultable dans **Administration → Demandes**.

## Accusé de réception des professionnels

Pour le profil **Professionnel** uniquement, l’accusé de réception propose de compléter le [formulaire de préparation des interventions](https://www.vieavenir.fr/formulaires/devenez-une-voix-de-l-avenir-avec-l-association-vie-avenir). Un bouton et un lien à copier sont inclus dans la version HTML ; la version texte contient aussi le lien complet.

Les messages des profils Jeune, Parent et Partenaire, la notification à l’association et les adresses de réponse ne sont pas modifiés. Cet ajout s’applique aux prochains accusés de réception : les anciens messages ne sont pas renvoyés.

Si l’adresse du formulaire change, mettre à jour `professionalInterventionFormUrl` dans `src/lib/professional-followup.ts`. Les tests ciblés s’exécutent avec `node --experimental-strip-types --test tests/contact-email.test.mjs`, sans envoi d’e-mail réel.

## Activation sur Vercel

1. Dans le projet Vercel, ouvrir **Integrations**, connecter **Resend** et créer une clé API.
2. Dans Resend, ajouter le domaine `vieavenir.fr`.
3. Recopier dans la zone DNS IONOS les enregistrements DKIM et SPF fournis par Resend, puis attendre que le domaine soit indiqué comme vérifié.
4. Dans **Vercel → Settings → Environment Variables**, ajouter les variables suivantes pour l'environnement Production :

   - `RESEND_API_KEY` : la clé créée dans Resend ;
   - `RESEND_FROM_EMAIL` : `VIE AVENIR <notifications@vieavenir.fr>` ;
   - `CONTACT_NOTIFICATION_EMAIL` : `contact@vieavenir.fr`.

5. Redéployer la dernière version de Production afin que les nouvelles variables soient prises en compte.
6. Envoyer une demande de test avec une adresse e-mail accessible et vérifier les deux boîtes de réception ainsi que **Administration → Demandes**.

Les variables Resend ne doivent jamais commencer par `NEXT_PUBLIC_` : la clé API doit rester accessible uniquement au serveur.
