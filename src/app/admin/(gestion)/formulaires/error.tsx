"use client";

export default function CustomFormsError({ reset }: { reset: () => void }) {
  return <main className="admin-page"><div className="admin-form-card" role="alert"><h1>Formulaires momentanément indisponibles</h1><p>Les données n’ont pas pu être chargées. Réessayez dans un instant.</p><button className="admin-primary-button" onClick={reset}>Réessayer</button></div></main>;
}
