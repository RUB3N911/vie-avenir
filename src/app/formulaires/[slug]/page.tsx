import { randomUUID } from "node:crypto";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicCustomForm } from "@/lib/custom-form-data";
import { CustomFormFields } from "@/components/custom-form-fields";
import "../formulaires.css";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const form = await getPublicCustomForm(slug);
  return {
    title: form?.title ?? "Formulaire",
    description: form?.description || "Un formulaire VIE AVENIR.",
    alternates: { canonical: `/formulaires/${form?.slug ?? slug}` },
    robots: { index: false, follow: false },
  };
}

export default async function PublicCustomFormPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const form = await getPublicCustomForm(slug);
  if (!form) notFound();
  return <main className="custom-form-page"><div className="custom-form-container">
    <Link href="/" aria-label="VIE AVENIR — Accueil" className="custom-form-brand"><Image src="/images/brand/logo-vie-avenir.webp" alt="VIE AVENIR" width={180} height={120} priority /></Link>
    <section className="custom-form-surface"><header><p className="custom-form-eyebrow">VIE AVENIR · Formulaire</p><h1>{form.title}</h1>{form.description ? <p className="custom-form-description">{form.description}</p> : null}</header>
      {form.status === "published" ? <CustomFormFields form={form} submissionId={randomUUID()} /> : <div className="custom-form-success"><h2>Ce formulaire est fermé.</h2><p>Il n’accepte plus de nouvelles réponses. Merci pour votre intérêt.</p></div>}
    </section><footer><Link href="/contact">Contacter l’association</Link><Link href="/politique-confidentialite">Confidentialité</Link></footer>
  </div></main>;
}
