"use client";

import { useActionState } from "react";
import { registerForEvent } from "@/app/evenements/[slug]/registration-actions";
import type { EventRecord } from "@/lib/cms-types";
import { initialEventRegistrationState } from "@/lib/event-registration-state";

export function EventRegistrationForm({ event }: { event: EventRecord }) {
  const actionWithEvent = registerForEvent.bind(null, event.id, event.slug);
  const [state, action, pending] = useActionState(actionWithEvent, initialEventRegistrationState);
  const complete = state.status === "confirmed" || state.status === "waitlisted";

  if (complete) {
    return (
      <div className={`event-registration-result is-${state.status}`} role="status">
        <span aria-hidden="true">{state.status === "confirmed" ? "✓" : "⌛"}</span>
        <div>
          <h3>{state.status === "confirmed" ? "Ta place est réservée." : "Tu es sur la liste d’attente."}</h3>
          <p>{state.message}</p>
        </div>
      </div>
    );
  }

  return (
    <form className="event-registration-form" action={action}>
      <div className="event-registration-fields">
        <label><span>Prénom <b>*</b></span><input name="first_name" autoComplete="given-name" required maxLength={80} /></label>
        <label><span>Nom <b>*</b></span><input name="last_name" autoComplete="family-name" required maxLength={80} /></label>
        <label><span>Date de naissance <b>*</b></span><input name="birth_date" type="date" autoComplete="bday" required /></label>
        <label><span>Commune</span><input name="city" autoComplete="address-level2" maxLength={120} /></label>
        <label><span>E-mail de contact <b>*</b></span><input name="contact_email" type="email" autoComplete="email" required maxLength={254} /></label>
        <label><span>Téléphone / WhatsApp <b>*</b></span><input name="contact_phone" type="tel" autoComplete="tel" required maxLength={30} /></label>
      </div>

      <fieldset className="event-registration-guardian">
        <legend>Participant mineur</legend>
        <p>Ces informations sont obligatoires si le participant aura moins de 18 ans le jour de l’événement.</p>
        <div className="event-registration-fields">
          <label><span>Nom du responsable légal</span><input name="guardian_name" autoComplete="name" maxLength={160} /></label>
          <label><span>E-mail du responsable</span><input name="guardian_email" type="email" maxLength={254} /></label>
          <label><span>Téléphone du responsable</span><input name="guardian_phone" type="tel" maxLength={30} /></label>
        </div>
        <label className="event-registration-check"><input name="guardian_consent" type="checkbox" /><span>Je confirme avoir l’autorisation du responsable légal pour cette inscription.</span></label>
      </fieldset>

      <label className="event-registration-wide"><span>Besoins particuliers ou informations utiles</span><textarea name="accessibility_needs" rows={3} maxLength={1000} placeholder="Accessibilité, allergie, accompagnement…" /></label>
      <label className="event-registration-check"><input name="photo_consent" type="checkbox" /><span>J’autorise la prise et l’utilisation de photos ou vidéos dans le cadre de la communication de VIE AVENIR. Cette autorisation est facultative.</span></label>
      <label className="event-registration-check"><input name="privacy_consent" type="checkbox" required /><span>J’accepte que ces données soient utilisées pour gérer l’inscription et les informations liées à cet événement. <a href="/politique-confidentialite" target="_blank">Politique de confidentialité ↗</a></span></label>
      <label className="event-registration-honeypot" aria-hidden="true"><span>Site web</span><input name="website" tabIndex={-1} autoComplete="off" /></label>

      {state.status === "error" ? <p className="event-registration-error" role="alert">{state.message}</p> : null}
      <button className="button button-pink" type="submit" disabled={pending}>{pending ? "Inscription en cours…" : event.registration_status === "full" ? "Rejoindre la liste d’attente" : "Confirmer mon inscription"}</button>
      <small>Après validation, un e-mail est envoyé à l’adresse de contact indiquée.</small>
    </form>
  );
}
