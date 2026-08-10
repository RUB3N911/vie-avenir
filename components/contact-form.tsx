"use client";

import { FormEvent, useState } from "react";

export function ContactForm() {
  const [notice, setNotice] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

    if (!email) {
      setNotice("L’envoi sera activé dès que l’adresse officielle de VIE AVENIR sera renseignée.");
      return;
    }

    const subject = encodeURIComponent(String(data.get("subject") || "Contact depuis le site VIE AVENIR"));
    const body = encodeURIComponent(
      `Nom : ${data.get("name")}\nE-mail : ${data.get("email")}\nProfil : ${data.get("profile")}\n\n${data.get("message")}`,
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    setNotice("Votre messagerie va s’ouvrir pour finaliser l’envoi.");
  }

  return (
    <form className="contact-form" id="formulaire" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label>
          Prénom et nom
          <input name="name" type="text" autoComplete="name" placeholder="Votre réponse" required />
        </label>
        <label>
          Adresse e-mail
          <input name="email" type="email" autoComplete="email" placeholder="Votre réponse" required />
        </label>
        <label>
          Je suis…
          <select name="profile" defaultValue="" required>
            <option value="" disabled>Choisir une option</option>
            <option>Un jeune de 14 à 25 ans</option>
            <option>Un parent</option>
            <option>Un professionnel</option>
            <option>Une entreprise</option>
            <option>Une collectivité</option>
            <option>Une association</option>
          </select>
        </label>
        <label>
          Objet de la demande
          <input name="subject" type="text" placeholder="Votre réponse" required />
        </label>
      </div>
      <label>
        Votre message
        <textarea
          name="message"
          placeholder="Parlez-nous de votre envie, de votre idée ou de votre question…"
          rows={7}
          required
        />
      </label>
      <button className="button button-pink" type="submit">Envoyer ma demande <span aria-hidden="true">↗</span></button>
      {notice && <p className="form-notice" role="status">{notice}</p>}
    </form>
  );
}
