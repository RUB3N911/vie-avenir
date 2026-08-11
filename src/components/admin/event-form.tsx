"use client";

import { useActionState } from "react";
import { saveEvent } from "@/app/admin/actions";
import { ActionMessage } from "@/components/admin/action-message";
import { SubmitButton } from "@/components/admin/submit-button";
import { defaultProgram } from "@/data/cms-defaults";
import type { EventRecord } from "@/lib/cms-types";
import { initialAdminActionState } from "@/lib/admin-action-state";

function inputDateTime(value: string | null) {
  if (!value) return "";
  const parts = new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "America/Martinique",
  }).formatToParts(new Date(value));
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

export function EventForm({ event }: { event?: EventRecord | null }) {
  const actionWithId = saveEvent.bind(null, event?.id ?? null);
  const [state, action] = useActionState(actionWithId, initialAdminActionState);
  const savedProgram = event?.program.length ? event.program : defaultProgram;
  const program = Array.from({ length: 4 }, (_, index) =>
    savedProgram[index] ?? { title: "", description: "" },
  );

  return (
    <form className="admin-form" action={action} encType="multipart/form-data">
      <section className="admin-form-card">
        <div className="admin-form-card-heading"><span>01</span><div><h2>L’essentiel</h2><p>Le titre, la promesse et le visuel vus en premier par les visiteurs.</p></div></div>
        <div className="admin-fields-grid">
          <label className="admin-field admin-field-wide"><span>Titre <b>*</b></span><input name="title" defaultValue={event?.title ?? ""} required /></label>
          <label className="admin-field admin-field-full"><span>Résumé <b>*</b></span><textarea name="summary" rows={3} defaultValue={event?.summary ?? ""} required /></label>
          <label className="admin-field admin-field-full"><span>Description</span><textarea name="description" rows={5} defaultValue={event?.description ?? ""} /></label>
          <label className="admin-field admin-field-full admin-file-field"><span>Visuel de l’événement</span><input name="image" type="file" accept="image/jpeg,image/png,image/webp" /><small>JPG, PNG ou WebP · 5 Mo maximum. L’ancien visuel reste en place si aucun fichier n’est choisi.</small></label>
        </div>
      </section>

      <section className="admin-form-card">
        <div className="admin-form-card-heading"><span>02</span><div><h2>Date et lieu</h2><p>Les heures sont enregistrées selon le fuseau de la Martinique.</p></div></div>
        <div className="admin-fields-grid">
          <label className="admin-field"><span>Début <b>*</b></span><input name="starts_at" type="datetime-local" defaultValue={inputDateTime(event?.starts_at ?? null)} required /></label>
          <label className="admin-field"><span>Fin</span><input name="ends_at" type="datetime-local" defaultValue={inputDateTime(event?.ends_at ?? null)} /></label>
          <label className="admin-field"><span>Nom du lieu</span><input name="venue_name" defaultValue={event?.venue_name ?? ""} placeholder="Lieu à confirmer" /></label>
          <label className="admin-field"><span>Commune / territoire <b>*</b></span><input name="city" defaultValue={event?.city ?? "Martinique"} required /></label>
          <label className="admin-field admin-field-full"><span>Adresse</span><input name="venue_address" defaultValue={event?.venue_address ?? ""} /></label>
        </div>
      </section>

      <section className="admin-form-card">
        <div className="admin-form-card-heading"><span>03</span><div><h2>Public et accès</h2><p>Tout ce qu’un jeune ou un parent doit savoir avant de s’inscrire.</p></div></div>
        <div className="admin-fields-grid">
          <label className="admin-field"><span>Âge minimum</span><input name="age_min" type="number" min="0" max="99" defaultValue={event?.age_min ?? 14} required /></label>
          <label className="admin-field"><span>Âge maximum</span><input name="age_max" type="number" min="0" max="99" defaultValue={event?.age_max ?? 25} required /></label>
          <label className="admin-field"><span>Nombre de places</span><input name="capacity" type="number" min="1" defaultValue={event?.capacity ?? ""} placeholder="Illimité / à confirmer" /></label>
          <label className="admin-field"><span>Tarif</span><input name="price_label" defaultValue={event?.price_label ?? "Gratuit"} required /></label>
          <fieldset className="admin-program-editor admin-field-full">
            <legend>Programme</legend>
            <p>Renseignez le gros titre et le texte affiché juste en dessous. Une étape entièrement vide ne sera pas affichée.</p>
            <div className="admin-program-list">
              {program.map((item, index) => (
                <div className="admin-program-item" key={index}>
                  <span aria-hidden="true">{index + 1}</span>
                  <label className="admin-field">
                    <span>Gros titre</span>
                    <input
                      name={`program_${index}_title`}
                      defaultValue={item.title}
                      maxLength={100}
                      placeholder={index === 0 ? "Ex. Rencontres métiers" : "Titre de l’étape"}
                    />
                  </label>
                  <label className="admin-field">
                    <span>Texte sous le titre</span>
                    <textarea
                      name={`program_${index}_description`}
                      rows={2}
                      defaultValue={item.description}
                      maxLength={300}
                      placeholder="Décrivez cette étape en une phrase courte."
                    />
                  </label>
                </div>
              ))}
            </div>
          </fieldset>
          <label className="admin-field admin-field-full"><span>Informations pratiques</span><textarea name="access_details" rows={4} defaultValue={event?.access_details ?? ""} /></label>
        </div>
      </section>

      <section className="admin-form-card">
        <div className="admin-form-card-heading"><span>04</span><div><h2>Inscription et publication</h2><p>Un brouillon n’apparaît jamais sur le site public.</p></div></div>
        <div className="admin-fields-grid">
          <label className="admin-field admin-field-wide"><span>Lien d’inscription</span><input name="registration_url" type="url" defaultValue={event?.registration_url ?? ""} placeholder="https://…" /></label>
          <label className="admin-field"><span>Date limite</span><input name="registration_deadline" type="datetime-local" defaultValue={inputDateTime(event?.registration_deadline ?? null)} /></label>
          <label className="admin-field"><span>État des inscriptions</span><select name="registration_status" defaultValue={event?.registration_status ?? "coming_soon"}><option value="coming_soon">Bientôt ouvertes</option><option value="open">Ouvertes</option><option value="full">Complet</option><option value="closed">Clôturées</option><option value="cancelled">Annulé</option></select></label>
          <label className="admin-field"><span>Visibilité</span><select name="publication_status" defaultValue={event?.publication_status ?? "draft"}><option value="draft">Brouillon — invisible</option><option value="published">Publié sur le site</option><option value="archived">Archivé</option></select></label>
        </div>
      </section>

      <div className="admin-form-actions"><ActionMessage state={state} /><SubmitButton>{event ? "Enregistrer les modifications" : "Créer l’événement"}</SubmitButton></div>
    </form>
  );
}
