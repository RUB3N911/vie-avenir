"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { submitContactRequest, type ContactActionState } from "@/app/contact/actions";
import { contactJourneys, contactProfiles } from "@/data/contact-journeys";
import type { ContactProfile } from "@/lib/cms-types";

const initialState: ContactActionState = { status: "idle", message: "" };

function ContactSubmitButton() {
  const { pending } = useFormStatus();
  return <button className="button button-pink" type="submit" disabled={pending}>{pending ? "Envoi…" : "Envoyer ma demande"} <span aria-hidden="true">↗</span></button>;
}

export function ContactForm({ initialProfile = "young" }: { initialProfile?: ContactProfile }) {
  const [profile, setProfile] = useState<ContactProfile>(initialProfile);
  const [state, action] = useActionState(submitContactRequest, initialState);
  const feedbackRef = useRef<HTMLParagraphElement>(null);
  const journey = contactJourneys[profile];
  const isYoung = profile === "young";
  const isParent = profile === "parent";

  useEffect(() => {
    if (state.status === "idle") return;
    feedbackRef.current?.focus({ preventScroll: true });
    feedbackRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [state]);

  return (
    <form className="contact-form" id="formulaire" aria-describedby="form-privacy" action={action}>
      <input type="hidden" name="profile" value={profile} />
      <label className="contact-honeypot" aria-hidden="true">Votre site<input name="website" tabIndex={-1} autoComplete="off" /></label>

      <fieldset className="journey-selector">
        <legend>Choisissez votre parcours</legend>
        <div>
          {contactProfiles.map((item) => (
            <button type="button" className={item === profile ? "is-active" : ""} onClick={() => setProfile(item)} aria-pressed={item === profile} key={item}>{contactJourneys[item].title}</button>
          ))}
        </div>
      </fieldset>

      <div className={`journey-form-heading tone-${journey.tone}`}><span>{journey.title}</span><h3>{journey.formTitle}</h3></div>
      {state.message ? <p className={`form-notice is-${state.status}`} role={state.status === "error" ? "alert" : "status"} aria-live="polite" tabIndex={-1} ref={feedbackRef}>{state.message}</p> : null}

      <div className="form-grid">
        <label>{isYoung ? "Ton prénom et ton nom" : "Prénom et nom"}<input name="name" type="text" autoComplete="name" placeholder="Votre réponse" minLength={2} maxLength={120} required /></label>
        <label>{isYoung ? "Ton adresse e-mail" : "Adresse e-mail"}<input name="email" type="email" autoComplete="email" placeholder="Votre réponse" required /></label>
        {(isYoung || isParent) ? (
          <label>{isYoung ? "Ton âge" : "Âge du jeune concerné"}<input name="age" type="number" min={isYoung ? 14 : 0} max={25} required /></label>
        ) : <input type="hidden" name="age" value="" />}
        {!isYoung ? <label>Téléphone <small>— facultatif</small><input name="phone" type="tel" autoComplete="tel" placeholder="Votre réponse" /></label> : <input type="hidden" name="phone" value="" />}
        {(profile === "professional" || profile === "partner") ? <label>Structure {profile === "partner" ? <b>*</b> : <small>— facultatif</small>}<input name="organization" autoComplete="organization" required={profile === "partner"} placeholder="Nom de la structure" maxLength={160} /></label> : <input type="hidden" name="organization" value="" />}
        {profile === "professional" ? <label>Métier ou fonction <b>*</b><input name="role_or_job" required placeholder="Votre métier / fonction" maxLength={160} /></label> : <input type="hidden" name="role_or_job" value="" />}
        <fieldset
          className={`contact-request-options${state.field === "request_types" ? " has-error" : ""}`}
          aria-describedby={state.field === "request_types" ? "contact-request-error" : undefined}
        >
          <legend>Votre demande <b>*</b><small>Plusieurs choix possibles</small></legend>
          <div key={profile}>
            {journey.requestOptions.map((option) => (
              <label key={option}>
                <input name="request_type" type="checkbox" value={option} />
                <span>{option}</span>
              </label>
            ))}
          </div>
          {state.field === "request_types" ? <small className="field-error" id="contact-request-error">{state.message}</small> : null}
        </fieldset>
        <label>Objet<input name="subject" type="text" placeholder="En quelques mots" minLength={3} maxLength={160} required /></label>
      </div>

      <label>{journey.messageLabel}<small>20 caractères minimum</small><textarea name="message" placeholder={journey.messagePlaceholder} rows={7} minLength={20} maxLength={5000} required /></label>

      {isYoung ? <label className="consent-field"><input name="guardian_ack" type="checkbox" /> <span>Si j’ai 14 ans, je remplis ce formulaire avec l’aide d’un parent ou responsable légal.</span></label> : null}
      <label className="consent-field"><input name="consent" type="checkbox" required /> <span>J’accepte que VIE AVENIR utilise ces informations uniquement pour répondre à ma demande.</span></label>

      <ContactSubmitButton />
      <p className="form-privacy" id="form-privacy">Vos informations ne sont ni vendues ni utilisées pour de la publicité. En savoir plus dans notre <Link href="/politique-confidentialite">politique de confidentialité</Link>.</p>
    </form>
  );
}
