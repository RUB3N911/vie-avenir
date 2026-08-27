# Notifications e-mail des demandes

Lorsqu'une demande est validée sur la page Contact, elle est d'abord enregistrée dans Supabase. Deux e-mails sont ensuite envoyés en arrière-plan :

- une notification à l'association, avec l'adresse du demandeur en réponse directe ;
- un accusé de réception au demandeur.

Si le service d'e-mail est momentanément indisponible, la demande reste consultable dans **Administration → Demandes**.

## Activation sur Vercel

1. Dans le projet Vercel, ouvrir **Integrations**, connecter **Resend** et créer une clé API.
2. Dans Resend, ajouter le domaine `vieavenir.fr`.
3. Recopier dans la zone DNS IONOS les enregistrements DKIM et SPF fournis par Resend, puis attendre que le domaine soit indiqué comme vérifié.
4. Dans **Vercel → Settings → Environment Variables**, ajouter les variables suivantes pour l'environnement Production :

   - `RESEND_API_KEY` : la clé créée dans Resend ;
   - `RESEND_FROM_EMAIL` : `VIE AVENIR <notifications@vieavenir.fr>` ;
   - `CONTACT_NOTIFICATION_EMAIL` : `mouvementvieavenir@gmail.com`.

5. Redéployer la dernière version de Production afin que les nouvelles variables soient prises en compte.
6. Envoyer une demande de test avec une adresse e-mail accessible et vérifier les deux boîtes de réception ainsi que **Administration → Demandes**.

Les variables Resend ne doivent jamais commencer par `NEXT_PUBLIC_` : la clé API doit rester accessible uniquement au serveur.
