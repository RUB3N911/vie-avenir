"use client";

import { useActionState, useEffect, useRef, useState, type ChangeEvent } from "react";
import { registerForEvent } from "@/app/evenements/[slug]/registration-actions";
import type { EventRecord } from "@/lib/cms-types";
import {
  initialEventRegistrationState,
  initialEventRegistrationValues,
  type EventRegistrationField,
  type EventRegistrationFormValues,
} from "@/lib/event-registration-state";
import { isMinorOnDate } from "@/lib/event-registration-validation";

function FieldError({ field, message }: { field: EventRegistrationField; message?: string }) {
  return message ? <small className="event-registration-field-error" id={`event-${field}-error`}>{message}</small> : null;
}

export function EventRegistrationForm({ event }: { event: EventRecord }) {
  const actionWithEvent = registerForEvent.bind(null, event.id, event.slug);
  const [state, action, pending] = useActionState(actionWithEvent, initialEventRegistrationState);
  const [values, setValues] = useState<EventRegistrationFormValues>(
    state.values ?? initialEventRegistrationValues,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  const complete = state.status === "confirmed" || state.status === "waitlisted";
  const isMinor = isMinorOnDate(values.birth_date, event.starts_at);
  const fieldErrors = state.fieldErrors ?? {};

  useEffect(() => {
    if (state.status !== "error") return;

    const firstField = Object.keys(state.fieldErrors ?? {})[0] as EventRegistrationField | undefined;
    const target = firstField ? formRef.current?.elements.namedItem(firstField) : null;
    if (target instanceof HTMLElement) {
      target.focus({ preventScroll: true });
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    errorSummaryRef.current?.focus({ preventScroll: true });
    errorSummaryRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [state]);

  function updateText(field: EventRegistrationField) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
    };
  }

  function updateCheckbox(field: EventRegistrationField) {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.checked }));
    };
  }

  function errorProps(field: EventRegistrationField) {
    const message = fieldErrors[field];
    return {
      "aria-invalid": Boolean(message),
      "aria-describedby": message ? `event-${field}-error` : undefined,
      className: message ? "is-invalid" : undefined,
    } as const;
  }

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
    <form className="event-registration-form" action={action} ref={formRef} noValidate>
      {state.status === "error" ? (
        <div className="event-registration-error" role="alert" tabIndex={-1} ref={errorSummaryRef}>
          <strong>Vérifiez votre inscription</strong>
          <p>{state.message}</p>
        </div>
      ) : null}

      <div className="event-registration-fields">
        <label htmlFor="event-first-name">
          <span>Prénom <b>*</b></span>
          <input id="event-first-name" name="first_name" autoComplete="given-name" maxLength={80} value={values.first_name} onChange={updateText("first_name")} {...errorProps("first_name")} />
          <FieldError field="first_name" message={fieldErrors.first_name} />
        </label>
        <label htmlFor="event-last-name">
          <span>Nom <b>*</b></span>
          <input id="event-last-name" name="last_name" autoComplete="family-name" maxLength={80} value={values.last_name} onChange={updateText("last_name")} {...errorProps("last_name")} />
          <FieldError field="last_name" message={fieldErrors.last_name} />
        </label>
        <label htmlFor="event-birth-date">
          <span>Date de naissance <b>*</b></span>
          <input id="event-birth-date" name="birth_date" type="date" autoComplete="bday" value={values.birth_date} onChange={updateText("birth_date")} {...errorProps("birth_date")} />
          <FieldError field="birth_date" message={fieldErrors.birth_date} />
        </label>
        <label htmlFor="event-city">
          <span>Commune</span>
          <input id="event-city" name="city" autoComplete="address-level2" maxLength={120} value={values.city} onChange={updateText("city")} {...errorProps("city")} />
          <FieldError field="city" message={fieldErrors.city} />
        </label>
        <label htmlFor="event-contact-email">
          <span>E-mail de contact <b>*</b></span>
          <input id="event-contact-email" name="contact_email" type="email" autoComplete="email" maxLength={254} value={values.contact_email} onChange={updateText("contact_email")} {...errorProps("contact_email")} />
          <FieldError field="contact_email" message={fieldErrors.contact_email} />
        </label>
        <label htmlFor="event-contact-phone">
          <span>Téléphone / WhatsApp <b>*</b></span>
          <input id="event-contact-phone" name="contact_phone" type="tel" autoComplete="tel" maxLength={30} value={values.contact_phone} onChange={updateText("contact_phone")} {...errorProps("contact_phone")} />
          <FieldError field="contact_phone" message={fieldErrors.contact_phone} />
        </label>
      </div>

      {isMinor ? (
        <fieldset className="event-registration-guardian">
          <legend>Participant mineur</legend>
          <p>Le participant aura moins de 18 ans le jour de l’événement. Les informations du responsable légal sont donc obligatoires.</p>
          <div className="event-registration-fields">
            <label htmlFor="event-guardian-name">
              <span>Nom du responsable légal <b>*</b></span>
              <input id="event-guardian-name" name="guardian_name" autoComplete="name" maxLength={160} value={values.guardian_name} onChange={updateText("guardian_name")} {...errorProps("guardian_name")} />
              <FieldError field="guardian_name" message={fieldErrors.guardian_name} />
            </label>
            <label htmlFor="event-guardian-email">
              <span>E-mail du responsable <b>*</b></span>
              <input id="event-guardian-email" name="guardian_email" type="email" autoComplete="email" maxLength={254} value={values.guardian_email} onChange={updateText("guardian_email")} {...errorProps("guardian_email")} />
              <FieldError field="guardian_email" message={fieldErrors.guardian_email} />
            </label>
            <label htmlFor="event-guardian-phone">
              <span>Téléphone du responsable <b>*</b></span>
              <input id="event-guardian-phone" name="guardian_phone" type="tel" autoComplete="tel" maxLength={30} value={values.guardian_phone} onChange={updateText("guardian_phone")} {...errorProps("guardian_phone")} />
              <FieldError field="guardian_phone" message={fieldErrors.guardian_phone} />
            </label>
          </div>
          <label className="event-registration-check" htmlFor="event-guardian-consent">
            <input id="event-guardian-consent" name="guardian_consent" type="checkbox" checked={values.guardian_consent} onChange={updateCheckbox("guardian_consent")} {...errorProps("guardian_consent")} />
            <span>Je confirme avoir l’autorisation du responsable légal pour cette inscription.</span>
            <FieldError field="guardian_consent" message={fieldErrors.guardian_consent} />
          </label>
        </fieldset>
      ) : null}

      <label className="event-registration-wide" htmlFor="event-accessibility-needs">
        <span>Besoins particuliers ou informations utiles</span>
        <textarea id="event-accessibility-needs" name="accessibility_needs" rows={3} maxLength={1000} placeholder="Accessibilité, allergie, accompagnement…" value={values.accessibility_needs} onChange={updateText("accessibility_needs")} {...errorProps("accessibility_needs")} />
        <FieldError field="accessibility_needs" message={fieldErrors.accessibility_needs} />
      </label>
      <label className="event-registration-check" htmlFor="event-photo-consent">
        <input id="event-photo-consent" name="photo_consent" type="checkbox" checked={values.photo_consent} onChange={updateCheckbox("photo_consent")} />
        <span>J’autorise la prise et l’utilisation de photos ou vidéos dans le cadre de la communication de VIE AVENIR. Cette autorisation est facultative.</span>
      </label>
      <label className="event-registration-check" htmlFor="event-privacy-consent">
        <input id="event-privacy-consent" name="privacy_consent" type="checkbox" checked={values.privacy_consent} onChange={updateCheckbox("privacy_consent")} {...errorProps("privacy_consent")} />
        <span>J’accepte que ces données soient utilisées pour gérer l’inscription et les informations liées à cet événement. <a href="/politique-confidentialite" target="_blank">Politique de confidentialité ↗</a></span>
        <FieldError field="privacy_consent" message={fieldErrors.privacy_consent} />
      </label>
      <label className="event-registration-honeypot" aria-hidden="true"><span>Site web</span><input name="website" tabIndex={-1} autoComplete="off" /></label>

      <button className="button button-pink" type="submit" disabled={pending}>{pending ? "Inscription en cours…" : event.registration_status === "full" ? "Rejoindre la liste d’attente" : "Confirmer mon inscription"}</button>
      <small>Après validation, un e-mail est envoyé à l’adresse de contact indiquée.</small>
    </form>
  );
}
