import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EventRegistrationForm } from "@/components/event-registration-form";
import { Arrow, Callout, SectionLabel, SiteFooter, SiteHeader } from "@/layouts/site-shell";
import { formatEventDate, getPublishedEventBySlug, isEventRegistrationAvailable } from "@/lib/cms-data";
import type { EventRecord } from "@/lib/cms-types";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

type EventPageProps = { params: Promise<{ slug: string }> };

function registrationLabel(event: EventRecord) {
  if (event.registration_status === "open" && event.registration_url) return "Je m’inscris";
  if (event.registration_status === "open") return "Je m’inscris";
  if (event.registration_status === "full" && !event.registration_url) return "Rejoindre la liste d’attente";
  if (event.registration_status === "full") return "Événement complet";
  if (event.registration_status === "cancelled") return "Événement annulé";
  if (event.registration_status === "closed") return "Inscriptions closes";
  return "Être informé·e";
}

function RegistrationAction({ event, available }: { event: EventRecord; available: boolean }) {
  const label = registrationLabel(event);
  if (!available && (event.registration_status === "open" || event.registration_status === "full")) return <span className="button button-disabled" aria-disabled="true">Inscriptions closes</span>;
  if (event.registration_status === "open" && event.registration_url) {
    return <a className="button button-pink" href={event.registration_url} target="_blank" rel="noreferrer">{label} <Arrow /></a>;
  }
  if ((event.registration_status === "open" || event.registration_status === "full") && !event.registration_url) {
    return <a className="button button-pink" href="#inscription">{label} <Arrow /></a>;
  }
  const disabled = event.registration_status === "full" || event.registration_status === "cancelled" || event.registration_status === "closed";
  return disabled
    ? <span className="button button-disabled" aria-disabled="true">{label}</span>
    : <Link className="button button-pink" href="/contact?profil=young#formulaire">{label} <Arrow /></Link>;
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getPublishedEventBySlug(slug);
  if (!event) return { title: "Événement introuvable" };

  return {
    title: event.title,
    description: event.summary,
    alternates: { canonical: `/evenements/${event.slug}` },
    openGraph: {
      title: event.title,
      description: event.summary,
      type: "article",
      images: event.image_url ? [{ url: event.image_url, alt: event.title }] : [],
    },
  };
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = await getPublishedEventBySlug(slug);
  if (!event) notFound();

  const registrationAvailable = isEventRegistrationAvailable(event);
  const nativeRegistrationAvailable = registrationAvailable && !event.registration_url;

  const date = formatEventDate(event.starts_at);
  const location = [event.venue_name, event.venue_address, event.city].filter(Boolean).join(", ");
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description ?? event.summary,
    startDate: event.starts_at,
    endDate: event.ends_at ?? undefined,
    eventStatus: event.registration_status === "cancelled"
      ? "https://schema.org/EventCancelled"
      : "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.venue_name ?? "Lieu à confirmer",
      address: [event.venue_address, event.city, "Martinique"].filter(Boolean).join(", "),
    },
    image: event.image_url ? [event.image_url] : undefined,
    url: `${getSiteUrl()}/evenements/${event.slug}`,
    organizer: { "@type": "Organization", name: "VIE AVENIR", url: getSiteUrl() },
    offers: event.registration_url || nativeRegistrationAvailable ? {
      "@type": "Offer",
      url: event.registration_url ?? `${getSiteUrl()}/evenements/${event.slug}#inscription`,
      price: event.price_label.toLowerCase().includes("gratuit") ? 0 : undefined,
      priceCurrency: "EUR",
      availability: event.registration_status === "full"
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
    } : undefined,
  };

  return (
    <main>
      <SiteHeader activePath="/evenements" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />

      <section className={`event-detail-hero ${event.image_url ? "has-image" : ""}`}>
        {event.image_url ? (
          <div className="event-detail-image"><Image src={event.image_url} alt={`Visuel de ${event.title}`} fill priority sizes="100vw" /></div>
        ) : null}
        <div className="event-detail-hero-copy">
          <Link className="event-detail-back" href="/evenements">← Tous les événements</Link>
          <p>Rendez-vous VIE AVENIR</p>
          <div className="event-detail-date"><strong>{date.day}</strong><span>{date.month}<br />{date.year}</span></div>
          <h1>{event.title}</h1>
          <span>{event.summary}</span>
          <div className="event-detail-actions">
            <RegistrationAction event={event} available={registrationAvailable} />
            <a className="button button-outline" href={`/evenements/${event.slug}/calendrier`}>Ajouter au calendrier ↓</a>
          </div>
        </div>
      </section>

      <section className="page-section event-detail-content">
        <div className="page-container event-detail-layout">
          <article>
            <SectionLabel>À propos</SectionLabel>
            <h2>Ce qui t’attend.</h2>
            <p className="event-detail-description">{event.description ?? event.summary}</p>

            {event.program.length ? (
              <>
                <SectionLabel>Au programme</SectionLabel>
                <ol className="event-detail-program">
                  {event.program.map((item, index) => (
                    <li key={`${item.title}-${index}`}><strong>{String(index + 1).padStart(2, "0")}</strong><div><h3>{item.title}</h3>{item.description ? <p>{item.description}</p> : null}</div></li>
                  ))}
                </ol>
              </>
            ) : null}
          </article>

          <aside className="event-detail-facts" aria-label="Informations pratiques">
            <h2>En pratique</h2>
            <dl>
              <div><dt>Quand</dt><dd><time dateTime={event.starts_at}>{date.long}</time></dd></div>
              <div><dt>Où</dt><dd>{event.venue_name ?? "Lieu à confirmer"}<br />{event.venue_address}{event.venue_address ? <br /> : null}{event.city}</dd></div>
              <div><dt>Pour qui</dt><dd>Jeunes de {event.age_min} à {event.age_max} ans</dd></div>
              <div><dt>Tarif</dt><dd>{event.price_label}</dd></div>
              {event.capacity ? <div><dt>Capacité</dt><dd>{event.capacity} places</dd></div> : null}
            </dl>
            {location ? <a className="event-detail-map" href={mapUrl} target="_blank" rel="noreferrer">Voir l’itinéraire ↗</a> : null}
            {event.access_details ? <p>{event.access_details}</p> : null}
            <RegistrationAction event={event} available={registrationAvailable} />
          </aside>
        </div>
      </section>

      {nativeRegistrationAvailable ? (
        <section className="event-registration-section" id="inscription">
          <div className="page-container event-registration-layout">
            <div className="event-registration-intro">
              <SectionLabel>Inscription</SectionLabel>
              <h2>{event.registration_status === "full" ? "Rejoins la liste d’attente." : "Réserve ta place."}</h2>
              <p>{event.registration_status === "full" ? "L’événement est complet, mais une place peut se libérer. Les demandes sont traitées dans leur ordre d’arrivée." : "Quelques informations suffisent. L’équipe te confirmera immédiatement ta place par e-mail."}</p>
              <ul>
                <li>Coordonnées visibles uniquement par l’équipe autorisée</li>
                <li>Autorisation du responsable légal pour les mineurs</li>
                <li>Réponse automatique à l’adresse e-mail indiquée</li>
              </ul>
            </div>
            <EventRegistrationForm event={event} />
          </div>
        </section>
      ) : null}

      <Callout eyebrow="Une question avant de venir ?" title="On est là pour t’aider." buttonLabel="Nous contacter" href="/contact?profil=young#formulaire" />
      <SiteFooter />
    </main>
  );
}
