"use client";

import { useActionState } from "react";
import { saveAssociationSettings } from "@/app/admin/actions";
import { ActionMessage } from "@/components/admin/action-message";
import { SubmitButton } from "@/components/admin/submit-button";
import type { AssociationSettings } from "@/lib/cms-types";
import { initialAdminActionState } from "@/lib/admin-action-state";

export function AssociationForm({ settings }: { settings: AssociationSettings }) {
  const [state, action] = useActionState(saveAssociationSettings, initialAdminActionState);

  return (
    <form className="admin-form" action={action}>
      <section className="admin-form-card">
        <div className="admin-form-card-heading"><span>01</span><div><h2>Identité officielle</h2><p>Ces données alimenteront progressivement le site et ses pages légales.</p></div></div>
        <div className="admin-fields-grid">
          <label className="admin-field admin-field-wide"><span>Nom de l’association <b>*</b></span><input name="legal_name" defaultValue={settings.legal_name} required /></label>
          <label className="admin-field"><span>Numéro RNA</span><input name="rna_number" defaultValue={settings.rna_number ?? ""} placeholder="W9…" /></label>
          <label className="admin-field"><span>Adresse e-mail publique</span><input name="public_email" type="email" defaultValue={settings.public_email ?? ""} placeholder="contact@…" /></label>
          <label className="admin-field admin-field-wide"><span>Adresse du siège</span><input name="address" defaultValue={settings.address ?? ""} /></label>
          <label className="admin-field"><span>Code postal</span><input name="postal_code" defaultValue={settings.postal_code ?? ""} /></label>
          <label className="admin-field"><span>Commune / territoire <b>*</b></span><input name="city" defaultValue={settings.city} required /></label>
        </div>
      </section>

      <section className="admin-form-card">
        <div className="admin-form-card-heading"><span>02</span><div><h2>Contacts</h2><p>Les champs vides ne seront jamais affichés comme « à compléter ».</p></div></div>
        <div className="admin-fields-grid">
          <label className="admin-field"><span>Téléphone</span><input name="phone" type="tel" defaultValue={settings.phone ?? ""} /></label>
          <label className="admin-field"><span>WhatsApp</span><input name="whatsapp" type="tel" defaultValue={settings.whatsapp ?? ""} /></label>
          <label className="admin-field admin-field-wide"><span>Site officiel</span><input name="website_url" type="url" defaultValue={settings.website_url ?? ""} placeholder="https://…" /></label>
          <label className="admin-field"><span>Instagram</span><input name="instagram_url" type="url" defaultValue={settings.instagram_url ?? ""} placeholder="https://instagram.com/…" /></label>
          <label className="admin-field"><span>TikTok</span><input name="tiktok_url" type="url" defaultValue={settings.tiktok_url ?? ""} placeholder="https://tiktok.com/@…" /></label>
        </div>
      </section>

      <div className="admin-form-actions"><ActionMessage state={state} /><SubmitButton>Enregistrer les informations</SubmitButton></div>
    </form>
  );
}
