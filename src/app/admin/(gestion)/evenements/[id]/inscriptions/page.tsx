import Link from "next/link";
import { notFound } from "next/navigation";
import { EventParticipantMessageForm } from "@/components/admin/event-participant-message-form";
import { EventRegistrationActions } from "@/components/admin/event-registration-actions";
import { requireAdmin } from "@/lib/admin-auth";
import {
  formatEventDate,
  getEventForAdmin,
  getEventRegistrationMessagesForAdmin,
  getEventRegistrationsForAdmin,
} from "@/lib/cms-data";
import type { EventParticipantStatus, EventRegistrationAudience } from "@/lib/cms-types";

const statusLabels: Record<EventParticipantStatus, string> = {
  confirmed: "Confirmé",
  waitlisted: "En attente",
  cancelled: "Annulé",
  attended: "Présent",
  no_show: "Absent",
};

const audienceLabels: Record<EventRegistrationAudience, string> = {
  confirmed: "Confirmés",
  waitlisted: "Liste d’attente",
  all: "Tous les inscrits actifs",
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Martinique",
  }).format(new Date(value));
}

function ageOnDate(birthDate: string, eventDate: string) {
  const birth = new Date(`${birthDate}T12:00:00Z`);
  const event = new Date(eventDate);
  let age = event.getUTCFullYear() - birth.getUTCFullYear();
  const beforeBirthday = event.getUTCMonth() < birth.getUTCMonth()
    || (event.getUTCMonth() === birth.getUTCMonth() && event.getUTCDate() < birth.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
}

export default async function EventRegistrationsAdminPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [event, registrations, messages] = await Promise.all([
    getEventForAdmin(id),
    getEventRegistrationsForAdmin(id),
    getEventRegistrationMessagesForAdmin(id),
  ]);
  if (!event) notFound();

  const confirmed = registrations.filter((item) => item.status === "confirmed" || item.status === "attended").length;
  const waitlisted = registrations.filter((item) => item.status === "waitlisted").length;
  const attended = registrations.filter((item) => item.status === "attended").length;

  return (
    <main className="admin-page admin-registrations-page">
      <Link className="admin-breadcrumb" href={`/admin/evenements/${event.id}`}>← Retour à l’événement</Link>
      <header className="admin-page-header">
        <div>
          <p className="admin-eyebrow">Inscriptions · {formatEventDate(event.starts_at).long}</p>
          <h1>{event.title}</h1>
          <span>Suivez les participants, gérez la liste d’attente et écrivez aux personnes inscrites.</span>
        </div>
        <a className="admin-primary-button" href={`/admin/evenements/${event.id}/inscriptions/export`}>Exporter en CSV ↓</a>
      </header>

      <section className="admin-registration-stats" aria-label="Résumé des inscriptions">
        <article><span>Places confirmées</span><strong>{confirmed}{event.capacity ? ` / ${event.capacity}` : ""}</strong><small>{event.capacity ? `${Math.max(event.capacity - confirmed, 0)} place(s) disponible(s)` : "Capacité illimitée"}</small></article>
        <article><span>Liste d’attente</span><strong>{waitlisted}</strong><small>Dans l’ordre d’arrivée</small></article>
        <article><span>Présences</span><strong>{attended}</strong><small>À renseigner le jour J</small></article>
      </section>

      <section className="admin-panel admin-registration-panel">
        <div className="admin-panel-heading"><div><p className="admin-eyebrow">Participants</p><h2>Liste des inscriptions</h2></div><span>{registrations.length} demande(s)</span></div>
        {registrations.length ? (
          <div className="admin-registration-table-wrap">
            <table className="admin-registration-table">
              <thead><tr><th>Participant</th><th>Contact</th><th>Responsable légal</th><th>Statut</th><th>Actions</th></tr></thead>
              <tbody>
                {registrations.map((registration) => (
                  <tr key={registration.id}>
                    <td><strong>{registration.participant_first_name} {registration.participant_last_name}</strong><span>{ageOnDate(registration.birth_date, event.starts_at)} ans · {registration.city ?? "Commune non renseignée"}</span><small>Inscrit le {formatDateTime(registration.created_at)}</small>{registration.accessibility_needs ? <details><summary>Information utile</summary><p>{registration.accessibility_needs}</p></details> : null}</td>
                    <td><a href={`mailto:${registration.contact_email}`}>{registration.contact_email}</a><a href={`tel:${registration.contact_phone}`}>{registration.contact_phone}</a><small>Photo / vidéo : {registration.photo_consent ? "autorisé" : "non autorisé"}</small></td>
                    <td>{registration.guardian_name ? <><strong>{registration.guardian_name}</strong>{registration.guardian_email ? <a href={`mailto:${registration.guardian_email}`}>{registration.guardian_email}</a> : null}{registration.guardian_phone ? <a href={`tel:${registration.guardian_phone}`}>{registration.guardian_phone}</a> : null}</> : <span>Non concerné</span>}</td>
                    <td><span className={`admin-badge participant-${registration.status}`}>{statusLabels[registration.status]}</span></td>
                    <td><EventRegistrationActions eventId={event.id} registrationId={registration.id} status={registration.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="admin-empty-state"><strong>Aucune inscription pour le moment.</strong><p>Les nouvelles demandes apparaîtront automatiquement ici.</p></div>}
      </section>

      <section className="admin-form-card admin-participant-message-card">
        <div className="admin-form-card-heading"><span>✉</span><div><h2>Écrire aux participants</h2><p>Choisissez un groupe, rédigez le message puis envoyez-le depuis l’administration.</p></div></div>
        <EventParticipantMessageForm eventId={event.id} />
      </section>

      <section className="admin-panel admin-message-history">
        <div className="admin-panel-heading"><div><p className="admin-eyebrow">Historique</p><h2>Derniers envois</h2></div></div>
        {messages.length ? <div className="admin-message-list">{messages.map((message) => <article key={message.id}><div><strong>{message.subject}</strong><span>{audienceLabels[message.audience]} · {formatDateTime(message.sent_at)}</span></div><p>{message.body}</p><small className={`delivery-${message.delivery_status}`}>{message.delivered_count} remis · {message.failed_count} en échec</small></article>)}</div> : <p className="admin-empty-copy">Aucun message n’a encore été envoyé pour cet événement.</p>}
      </section>
    </main>
  );
}
