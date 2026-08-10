const Arrow = () => <span aria-hidden="true">↗</span>;

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#accueil" aria-label="VIE AVENIR — accueil">
          {/* Image WebP déjà optimisée : chargement direct pour les deux environnements. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-vie-avenir.webp"
            alt="VIE AVENIR — Va et deviens !"
            width="300"
            height="200"
            fetchPriority="high"
          />
        </a>

        <nav className="desktop-nav" aria-label="Navigation principale">
          <a href="#mission">Notre mission</a>
          <a href="#actions">Nos actions</a>
          <a href="#partenaires">Partenaires</a>
          <a href="#contact">Contact</a>
        </nav>

        <a className="button button-small button-dark" href="#contact">
          Nous rejoindre <Arrow />
        </a>
      </header>

      <section className="hero" id="accueil">
        <div className="hero-copy">
          <p className="eyebrow"><span /> Association martiniquaise · 14—25 ans</p>
          <h1>
            Des rencontres qui changent <em>des trajectoires.</em>
          </h1>
          <p className="hero-intro">
            VIE AVENIR rapproche les jeunes de professionnels inspirants pour
            découvrir des métiers, ouvrir le champ des possibles et oser se
            projeter.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#actions">
              Découvrir nos actions <Arrow />
            </a>
            <a className="text-link" href="#partenaires">
              Devenir partenaire <span aria-hidden="true">→</span>
            </a>
          </div>
          <p className="hero-signature">Rencontrer. Inspirer. Devenir.</p>
        </div>

        <div className="hero-visual" aria-label="Des jeunes échangent avec une professionnelle">
          {/* Image WebP déjà optimisée : chargement direct pour les deux environnements. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero-vie-avenir.webp"
            alt="Jeunes Martiniquais en échange avec une professionnelle"
            width="1672"
            height="941"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
          <div className="hero-badge badge-top">
            <strong>14—25</strong>
            <span>ans pour imaginer la suite</span>
          </div>
          <div className="hero-badge badge-bottom">
            <span className="badge-icon">↗</span>
            <p><strong>VA ET DEVIENS !</strong><br />Ton avenir commence ici.</p>
          </div>
        </div>
      </section>

      <section className="manifesto" id="mission">
        <p className="section-kicker">Notre conviction</p>
        <h2>
          Nous ne changeons pas l’avenir des jeunes,
          <span> nous créons les rencontres qui leur permettent de l’imaginer autrement.</span>
        </h2>
        <div className="manifesto-note">
          <span aria-hidden="true">✦</span>
          <p>Une passerelle vivante entre les jeunes, les professionnels, les familles et le territoire.</p>
        </div>
      </section>

      <section className="actions-section" id="actions">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Nos actions</p>
            <h2>Du concret pour passer de<br />« je ne sais pas » à <em>« pourquoi pas moi ? »</em></h2>
          </div>
          <p>
            Des formats courts, participatifs et sans tabou, conçus pour la vraie
            vie des jeunes en Martinique.
          </p>
        </div>

        <div className="action-grid">
          <article className="action-card card-pink">
            <div className="card-number">01</div>
            <div className="card-icon" aria-hidden="true">◎</div>
            <p className="card-label">Rencontrer</p>
            <h3>Des professionnels inspirants</h3>
            <p>Des parcours vrais, des métiers racontés autrement et des échanges où toutes les questions ont leur place.</p>
            <a href="#evenement">Voir les rencontres <span>↗</span></a>
          </article>

          <article className="action-card card-orange">
            <div className="card-number">02</div>
            <div className="card-icon" aria-hidden="true">↗</div>
            <p className="card-label">Comprendre</p>
            <h3>La vie active, sans mode d’emploi compliqué</h3>
            <p>Fiche de paie, budget, logement, APL, impôts : des ateliers utiles pour devenir autonome avec confiance.</p>
            <a href="#evenement">Découvrir les ateliers <span>↗</span></a>
          </article>

          <article className="action-card card-green">
            <div className="card-number">03</div>
            <div className="card-icon" aria-hidden="true">✦</div>
            <p className="card-label">Prendre la parole</p>
            <h3>La Voix de l’Avenir</h3>
            <p>Un espace pour partager ses idées, faire entendre ses besoins et contribuer aux projets qui concernent la jeunesse.</p>
            <a href="#contact">Rejoindre l’aventure <span>↗</span></a>
          </article>
        </div>
      </section>

      <section className="journey-section" aria-labelledby="journey-title">
        <div className="journey-intro">
          <p className="section-kicker">L’expérience VIE AVENIR</p>
          <h2 id="journey-title">Une rencontre.<br />Un déclic.<br /><em>Un premier pas.</em></h2>
        </div>
        <ol className="journey-list">
          <li>
            <span className="journey-number">1</span>
            <div><h3>Tu rencontres</h3><p>Des personnes accessibles qui racontent leur parcours sans filtre.</p></div>
          </li>
          <li>
            <span className="journey-number">2</span>
            <div><h3>Tu explores</h3><p>Tu poses tes questions, testes, échanges et découvres de nouvelles possibilités.</p></div>
          </li>
          <li>
            <span className="journey-number">3</span>
            <div><h3>Tu avances</h3><p>Tu repars avec une idée plus claire et une prochaine action concrète.</p></div>
          </li>
        </ol>
      </section>

      <section className="event-section" id="evenement">
        <div className="event-date" aria-label="3 octobre 2026">
          <span>03</span>
          <p>OCT<br />2026</p>
        </div>
        <div className="event-content">
          <p className="event-label">Prochain rendez-vous · Martinique</p>
          <h2>L’aventure commence maintenant.</h2>
          <p>Un premier atelier vivant pour rencontrer, questionner, essayer et voir son avenir autrement.</p>
          <div className="event-tags" aria-label="Programme">
            <span>Rencontres métiers</span><span>Défis</span><span>Échanges sans tabou</span>
          </div>
        </div>
        <a className="event-cta" href="#contact">
          <span>Être informé·e</span>
          <strong>↗</strong>
        </a>
      </section>

      <section className="partner-section" id="partenaires">
        <div className="partner-copy">
          <p className="section-kicker">Agir avec VIE AVENIR</p>
          <h2>Vous pouvez devenir le déclic d’un jeune.</h2>
          <p>
            Entreprises, professionnels, communes, établissements et associations :
            chaque expérience partagée peut ouvrir une voie que le jeune n’avait
            jamais envisagée.
          </p>
          <a className="button button-primary" href="#contact">Construire une action ensemble <Arrow /></a>
        </div>
        <div className="partner-choices">
          <article><span>01</span><div><h3>Partager un parcours</h3><p>Intervenir lors d’une rencontre et raconter le vrai quotidien de votre métier.</p></div><strong>↗</strong></article>
          <article><span>02</span><div><h3>Accueillir une découverte</h3><p>Ouvrir les portes de votre entreprise, atelier ou structure le temps d’une immersion.</p></div><strong>↗</strong></article>
          <article><span>03</span><div><h3>Soutenir une action</h3><p>Mettre à disposition un lieu, du matériel, des compétences ou un financement.</p></div><strong>↗</strong></article>
        </div>
      </section>

      <section className="contact-section" id="contact">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-vie-avenir.webp"
          alt=""
          aria-hidden="true"
          width="380"
          height="253"
          loading="lazy"
          decoding="async"
        />
        <p className="section-kicker">Prêt·e à faire un pas ?</p>
        <h2>Ton avenir vient<br /><em>juste de t’appeler.</em></h2>
        <p>Jeune, parent, professionnel ou partenaire : l’aventure se construit avec toi.</p>
        <div className="contact-actions">
          <a className="button button-light" href="#accueil">Je suis un jeune <Arrow /></a>
          <a className="button button-outline" href="#partenaires">Je veux contribuer <Arrow /></a>
        </div>
        <p className="coming-soon">Inscriptions et contact bientôt disponibles</p>
      </section>

      <footer>
        <a className="footer-brand" href="#accueil">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-vie-avenir.webp"
            alt="VIE AVENIR"
            width="300"
            height="200"
            loading="lazy"
            decoding="async"
          />
        </a>
        <p>Des rencontres qui changent des trajectoires.</p>
        <div className="footer-links"><a href="#mission">Mission</a><a href="#actions">Actions</a><a href="#partenaires">Partenaires</a></div>
        <p className="copyright">© 2026 VIE AVENIR · Martinique</p>
      </footer>
    </main>
  );
}
