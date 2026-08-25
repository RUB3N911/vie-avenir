import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EventsCalendar } from "@/components/events-calendar";
import { Arrow, Callout, SectionLabel, SiteFooter, SiteHeader } from "@/layouts/site-shell";
import { formatEventDate, getPublishedEvents, pickNextEvent } from "@/lib/cms-data";

export const metadata: Metadata = {
  title: "Événements",
  description: "Retrouvez les prochains ateliers et rendez-vous VIE AVENIR pour les jeunes de 14 à 25 ans en Martinique.",
};

export const dynamic = "force-dynamic";

const formats = [
  ["Rencontres métiers", "Découvrir des métiers grâce à celles et ceux qui les vivent vraiment.", "pink"],
  ["La vie active", "Comprendre la paie, le logement, le budget et les démarches essentielles.", "orange"],
  ["La Voix de l’Avenir", "Partager ses idées et contribuer aux projets qui concernent la jeunesse.", "green"],
] as const;

export default async function EventsPage() {
  const events = await getPublishedEvents();
  const nextEvent = pickNextEvent(events);
  const date = nextEvent ? formatEventDate(nextEvent.starts_at) : null;

  return (
    <main>
      <SiteHeader activePath="/evenements" />
      {nextEvent && date ? (
        <section className="event-page-hero" id={nextEvent.slug}>
          <div className="event-page-date">
            <p>Prochain rendez-vous</p>
            <div><strong>{date.day}</strong><span>{date.month}<br />{date.year}</span></div>
          </div>
          <div className="event-page-copy">
            <h1>{nextEvent.title}</h1>
            <p>{nextEvent.summary}</p>
            <div className="event-page-actions">
              <span>{nextEvent.venue_name ?? "Lieu à confirmer"} · {nextEvent.city}</span>
              <Link className="button button-pink" href={`/evenements/${nextEvent.slug}`}>Voir le détail <Arrow /></Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="event-page-empty-hero"><p>Événements</p><h1>La suite se prépare.</h1><span>Revenez bientôt pour découvrir les prochains rendez-vous VIE AVENIR.</span></section>
      )}

      {events.length ? (
        <section className="page-section">
          <div className="page-container">
            <SectionLabel>Calendrier</SectionLabel>
            <div className="section-heading-row">
              <h2>Tous les rendez-vous, en un coup d’œil.</h2>
              <p>Choisis une date puis ouvre la fiche de l’événement pour retrouver toutes les informations.</p>
            </div>
            <EventsCalendar events={events} initialDate={nextEvent?.starts_at} />
          </div>
        </section>
      ) : null}

      {events.length ? (
        <section className="page-section page-section-tinted">
          <div className="page-container">
            <SectionLabel>Les rendez-vous</SectionLabel>
            <h2>Choisis ta prochaine expérience.</h2>
            <div className="published-event-grid">
              {events.map((event) => {
                const itemDate = formatEventDate(event.starts_at);
                return (
                  <Link className="published-event-card" href={`/evenements/${event.slug}`} id={`fiche-${event.slug}`} key={event.id}>
                    <div className={`published-event-visual ${event.image_url ? "has-image" : ""}`}>
                      {event.image_url ? <Image src={event.image_url} alt={`Visuel de l’événement ${event.title}`} fill sizes="(max-width: 780px) 100vw, 50vw" /> : <><span>{itemDate.day}</span><strong>{itemDate.month}<br />{itemDate.year}</strong></>}
                    </div>
                    <div className="published-event-body">
                      <div className="published-event-meta"><span>{itemDate.long}</span><span>{event.price_label}</span></div>
                      <h3>{event.title}</h3>
                      <p>{event.summary}</p>
                      <ul><li>{event.age_min} à {event.age_max} ans</li><li>{event.venue_name ?? "Lieu à confirmer"} · {event.city}</li>{event.capacity ? <li>{event.capacity} places</li> : null}</ul>
                      <span className="button button-dark">Voir le détail <Arrow /></span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <section className="page-section">
        <div className="page-container">
          <SectionLabel>Les formats VIE AVENIR</SectionLabel>
          <h2>D’autres expériences se préparent.</h2>
          <div className="format-grid">
            {formats.map(([title, text, tone]) => (
              <article className={`format-card tone-${tone}`} key={title}>
                <p>À découvrir</p><h3>{title}</h3><span>{text}</span>
                <Link href="/contact?profil=young#formulaire">Être informé·e <b aria-hidden="true">→</b></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Callout eyebrow="Ne manque pas le prochain rendez-vous" title="Ton avenir vient de t’appeler." buttonLabel="Je reste informé·e" href="/contact?profil=young#formulaire" />
      <SiteFooter />
    </main>
  );
}
