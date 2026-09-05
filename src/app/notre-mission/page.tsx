import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Arrow, Callout, SectionLabel, SiteFooter, SiteHeader } from "@/layouts/site-shell";
import { getAssociationSettings, getPublishedTeamMembers, getPublishedTestimonials, getSitePresentation } from "@/lib/cms-data";

export const metadata: Metadata = {
  title: "Notre mission",
  description: "Découvrez la mission, la conviction et la façon d’agir de l’association VIE AVENIR en Martinique.",
  alternates: { canonical: "/notre-mission" },
};

const reasons = [
  { number: "01", title: "Des repères", text: "Voir des parcours vrais et comprendre qu’il n’existe pas une seule route pour avancer.", tone: "pink" },
  { number: "02", title: "Des clés concrètes", text: "Décoder la vie active : emploi, logement, budget, démarches et autonomie.", tone: "orange" },
  { number: "03", title: "Une voix", text: "Pouvoir poser ses questions, exprimer ses besoins et contribuer aux projets jeunesse.", tone: "green" },
] as const;

const principles = [
  { title: "Proche", text: "Des formats itinérants, pensés avec les réalités des jeunes et des territoires.", tone: "pink" },
  { title: "Concret", text: "Des échanges simples, des mises en situation et des outils que l’on peut réutiliser.", tone: "orange" },
  { title: "Collectif", text: "Des jeunes, des professionnels, des associations, des entreprises et des communes qui avancent ensemble.", tone: "green" },
] as const;

const testimonialLabels = { young: "Jeune", parent: "Parent", professional: "Professionnel", partner: "Partenaire" } as const;

export default async function MissionPage() {
  const [presentation, team, testimonials, settings] = await Promise.all([
    getSitePresentation(),
    getPublishedTeamMembers(),
    getPublishedTestimonials(),
    getAssociationSettings(),
  ]);
  const address = [settings.address, settings.postal_code, settings.city].filter(Boolean).join(", ");
  const facts = [
    settings.association_status ? ["Statut", settings.association_status] : null,
    settings.rna_number ? ["RNA", settings.rna_number] : null,
    address ? ["Siège", address] : null,
  ].filter((fact): fact is string[] => Boolean(fact));
  return (
    <main>
      <SiteHeader activePath="/notre-mission" />

      <section className="page-hero page-hero-mission">
        <div className="mission-hero-visual">
          <Image
            src="/images/mission/mission-hero-card.webp"
            alt="Quatre jeunes Martiniquais échangent autour d’un projet"
            width={530}
            height={572}
            priority
            sizes="(max-width: 760px) calc(100vw - 36px), 530px"
          />
        </div>
        <div className="page-hero-copy">
          <SectionLabel>Qui sommes-nous ?</SectionLabel>
          <h1>Nous créons les rencontres qui permettent d’imaginer autrement.</h1>
          <p>VIE AVENIR est une association martiniquaise qui rapproche les jeunes de professionnels, d’expériences concrètes et de ressources utiles pour construire la suite avec confiance.</p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/nos-actions">Découvrir nos actions <Arrow /></Link>
            <Link className="text-link text-link-pink" href="/contact">Va et deviens ! <span>→</span></Link>
          </div>
        </div>
      </section>

      {presentation.story_body ? (
        <section className="page-section association-story-section">
          <div className="page-container association-story-grid">
            <div><SectionLabel>Notre histoire</SectionLabel><h2>{presentation.story_title ?? "Pourquoi VIE AVENIR est née"}</h2></div>
            <div className="association-story-copy">{presentation.story_body.split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
          </div>
          {facts.length ? <dl className="association-facts page-container">{facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl> : null}
        </section>
      ) : facts.length ? <section className="association-facts-only"><dl className="association-facts page-container">{facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section> : null}

      <section className="page-section page-section-tinted mission-reasons">
        <div className="page-container">
          <SectionLabel>Pourquoi VIE AVENIR ?</SectionLabel>
          <h2>Parce qu’un déclic peut changer une trajectoire.</h2>
          <div className="reason-grid">
            {reasons.map((reason) => (
              <article className={`mini-card tone-${reason.tone}`} key={reason.number}>
                <div><strong>{reason.number}</strong><h3>{reason.title}</h3></div>
                <p>{reason.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section mission-principles">
        <div className="page-container">
          <SectionLabel>Notre façon d’agir</SectionLabel>
          <h2>Proche. Concret. Collectif.</h2>
          <p className="section-intro">Trois principes pour que chaque rencontre soit vraiment utile.</p>
          <div className="principle-grid">
            {principles.map((principle) => (
              <article className={`principle tone-${principle.tone}`} key={principle.title}>
                <span aria-hidden="true">✦</span>
                <h3>{principle.title}</h3>
                <p>{principle.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {team.length ? (
        <section className="page-section page-section-tinted team-section">
          <div className="page-container"><SectionLabel>Celles et ceux qui portent VIE AVENIR</SectionLabel><h2>L’équipe fondatrice et le bureau.</h2>{presentation.team_intro ? <p className="section-intro">{presentation.team_intro}</p> : null}<div className="team-grid">{team.map((member) => <article key={member.id}>{member.image_url ? <Image src={member.image_url} alt={`Portrait de ${member.name}`} width={420} height={480} sizes="(max-width: 760px) 100vw, 33vw" /> : <div className="team-initials" aria-hidden="true">{member.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div>}<div><p>{member.role}</p><h3>{member.name}</h3>{member.bio ? <span>{member.bio}</span> : null}</div></article>)}</div></div>
        </section>
      ) : null}

      {testimonials.length ? <section className="page-section testimonial-section"><div className="page-container"><SectionLabel>Leurs mots</SectionLabel><h2>Des expériences racontées simplement.</h2><div className="testimonial-grid">{testimonials.map((testimonial) => <blockquote key={testimonial.id}>{testimonial.image_url ? <Image src={testimonial.image_url} alt="" width={72} height={72} /> : null}<p>« {testimonial.quote} »</p><footer><strong>{testimonial.author_name}</strong><span>{testimonialLabels[testimonial.author_role]}</span></footer></blockquote>)}</div></div></section> : null}

      {presentation.minor_charter_published && presentation.minor_charter_body ? <section className="minor-charter-section"><div className="page-container"><div><SectionLabel>Notre cadre d’accueil</SectionLabel><h2>{presentation.minor_charter_title ?? "Protection des mineurs"}</h2></div><div>{presentation.minor_charter_body.split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div></div></section> : null}

      <Callout
        eyebrow="L’histoire ne fait que commencer"
        title="Et si vous en faisiez partie ?"
        description="Jeune, professionnel, entreprise ou collectivité : il y a une place pour vous."
        buttonLabel="Nous rejoindre"
        href="/contact#parcours"
      />
      <SiteFooter />
    </main>
  );
}
