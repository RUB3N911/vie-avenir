import "server-only";

import Image from "next/image";
import { createFormQrCode } from "@/lib/form-qr-code";
import type { CustomForm } from "@/lib/custom-forms";

export async function CustomFormShare({ form, shareUrl }: { form: Pick<CustomForm, "title" | "slug" | "status">; shareUrl: string }) {
  let qrCode: string | null = null;
  try {
    qrCode = await createFormQrCode(shareUrl);
  } catch {
    // Keep the link and editor available if image generation fails.
    console.error("Impossible de générer le QR code du formulaire.");
  }

  return (
    <aside className="custom-form-share" aria-label="Partager le formulaire">
      <div className="custom-form-share-copy">
        <strong>Lien à partager</strong>
        <a href={shareUrl} target="_blank" rel="noreferrer">{shareUrl} ↗</a>
        <p>Copiez ce lien ou utilisez le QR code sur vos affiches et vos supports.</p>
        {form.status === "draft" ? <p className="custom-form-share-warning">Ce formulaire est en brouillon. Publiez-le avant de diffuser le lien ou le QR code.</p> : null}
        {form.status === "closed" ? <p className="custom-form-share-warning">Ce formulaire est fermé : le lien et le QR code restent valides, mais aucune réponse ne peut être envoyée.</p> : null}
        <small>Si vous changez l’adresse du formulaire, téléchargez le nouveau QR code. L’ancien ne fonctionnera plus.</small>
      </div>
      <div className="custom-form-share-qr">
        {qrCode ? <>
          <Image src={qrCode} alt={`QR code vers le formulaire « ${form.title} »`} width={224} height={224} unoptimized />
          <a className="custom-form-qr-download" href={qrCode} download={`qr-code-formulaire-${form.slug}.png`}>Télécharger le QR code</a>
          <small>PNG · 1 024 × 1 024 pixels</small>
        </> : <p role="status">Le QR code est momentanément indisponible. Rechargez la page ou utilisez le lien à partager.</p>}
      </div>
    </aside>
  );
}
