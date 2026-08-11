import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Arrow, Callout, SectionLabel, SiteFooter, SiteHeader } from "@/layouts/site-shell";
import { formatEventDate, getPublishedEvents, pickNextEvent } from "@/lib/cms-data";
import type { EventRecord } from "@/lib/cms-types";

export const metadata: Metadata = {
  title: "Événements",
  description: "Retrouvez les prochains ateliers et rendez-vous VIE AVENIR pour les jeunes de 14 à 25 ans en Martinique.",
};

export const dynamic = "force-dynamic";

const tones = ["pink", "orange", "yellow", "green"] as const;

const formats = [
  ["Rencontres métiers", "Découvrir des métiers grâce à celles et ceux qui les vivent vraiment.", "pink"],
  ["La vie active", "Comprendre la paie, le logement, le budget et les démarches essentielles.", "orange"],
  ["La Voix de l’Avenir", "Partager ses idées et contribuer aux projets qui concernent la jeunesse.", "green"],
] as const;

function registrationLabel(event: EventRecord) {
  if (event.registration_status === "open" && event.registration_url) return "Je m’inscris";
  if (event.registration_status === "full") return "Événement complet";
  if (event.registration_status === "cancelled") return "Événement annulé";
  if (event.registration_status === "closed") return "Inscriptions closes";
  return "Être informé·e";
}

function EventAction({ event, className }: { event: EventRecord; className: string }) {
  const label = registrationLabel(event);
  if (event.registration_status === "open" && event.registration_url) {
    return <a className={className} href={event.registration_url} target="_blank" rel="noreferrer">{label} <Arrow /></a>;
  }
  return <Link className={className} href="/contact">{label} <Arrow /></Link>;
}

export default async function EventsPage() {
  const events = await getPublishedEvents();
  const nextEvent = pickNextEvent(events);
  const date = nextEvent ? formatEventDate(nextEvent.starts_at) : null;
  const program = nextEvent?.program.length
    ? nextEvent.program.slice(0, 4)
    : ["Rencontrer", "Questionner", "Essayer", "Repartir avec une prochaine étape"];

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
              <EventAction className="button button-pink" event={nextEvent} />
            </div>
          </div>
        </section>
      ) : (
        <section className="event-page-empty-hero"><p>Événements</p><h1>La suite se prépare.</h1><span>Revenez bientôt pour découvrir les prochains rendez-vous VIE AVENIR.</span></section>
      )}

      {nextEvent ? (
        <section className="page-section">
          <div className="page-container">
            <SectionLabel>Au programme</SectionLabel>
            <h2>Un atelier qui bouge avec toi.</h2>
            <ol className="event-steps">
              {program.map((title, index) => (
                <li className={`tone-${tones[index]}`} key={`${title}-${index}`}>
                  <strong>{index + 1}</strong>
                  <h3>{title}</h3>
                  <p>{index === 0 ? "Des parcours vrais et des rencontres accessibles." : index === 1 ? "Sans filtre et sans mauvaise question." : index === 2 ? "Des activités et des mises en situation concrètes." : "Des idées plus claires et une action à tenter."}</p>
                </li>
              ))}
            </ol>
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
                  <article className="published-event-card" id={`fiche-${event.slug}`} key={event.id}>
                    <div className={`published-event-visual ${event.image_url ? "has-image" : ""}`}>
                      {event.image_url ? <Image src={event.image_url} alt={`Visuel de l’événement ${event.title}`} fill sizes="(max-width: 780px) 100vw, 50vw" /> : <><span>{itemDate.day}</span><strong>{itemDate.month}<br />{itemDate.year}</strong></>}
                    </div>
                    <div className="published-event-body">
                      <div className="published-event-meta"><span>{itemDate.long}</span><span>{event.price_label}</span></div>
                      <h3>{event.title}</h3>
                      <p>{event.summary}</p>
                      <ul><li>{event.age_min} à {event.age_max} ans</li><li>{event.venue_name ?? "Lieu à confirmer"} · {event.city}</li>{event.capacity ? <li>{event.capacity} places</li> : null}</ul>
                      {event.access_details ? <small>{event.access_details}</small> : null}
                      <EventAction className="button button-dark" event={event} />
                    </div>
                  </article>
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
                <Link href="/contact">Être informé·e <b aria-hidden="true">→</b></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {nextEvent ? (
        <section className="page-section practical-section">
          <div className="page-container">
            <SectionLabel>En pratique</SectionLabel>
            <div className="practical-grid">
              <article><h3>Pour qui ?</h3><p>Jeunes de {nextEvent.age_min} à {nextEvent.age_max} ans</p></article>
              <article><h3>Où ?</h3><p>{nextEvent.venue_name ?? "Lieu à confirmer"} · {nextEvent.city}</p></article>
              <article><h3>Quand ?</h3><p>{formatEventDate(nextEvent.starts_at).long}</p></article>
              <article><h3>Tarif</h3><p>{nextEvent.price_label}</p></article>
            </div>
          </div>
        </section>
      ) : null}

      <Callout eyebrow="Ne manque pas le prochain rendez-vous" title="Ton avenir vient de t’appeler." buttonLabel="Je reste informé·e" href="/contact" />
      <SiteFooter />
    </main>
  );
}
