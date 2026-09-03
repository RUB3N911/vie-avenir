"use client";

export default function PublicCustomFormError({ reset }: { reset: () => void }) {
  return <main className="page-section"><div className="page-container" role="alert"><h1>Le formulaire est momentanément indisponible.</h1><p>Veuillez réessayer dans un instant.</p><button className="button button-pink" onClick={reset}>Réessayer</button></div></main>;
}
