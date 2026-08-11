"use client";

import Image from "next/image";
import { useActionState } from "react";
import { deleteContentEntry, savePartner, saveTeamMember, saveTestimonial } from "@/app/admin/content-actions";
import { ActionMessage } from "@/components/admin/action-message";
import { SubmitButton } from "@/components/admin/submit-button";
import type { ConfirmedPartner, TeamMember, Testimonial } from "@/lib/cms-types";
import { initialAdminActionState } from "@/lib/admin-action-state";

function DeleteEntryForm({ kind, id }: { kind: "team" | "partner" | "testimonial"; id: string }) {
  const boundAction = deleteContentEntry.bind(null, kind, id);
  const [state, action] = useActionState(boundAction, initialAdminActionState);
  return <form className="admin-inline-delete" action={action}><label><span>Suppression</span><input name="confirmation" placeholder="Saisissez SUPPRIMER" /></label><button type="submit">Supprimer</button><ActionMessage state={state} /></form>;
}

function ExistingImage({ src, alt }: { src: string | null; alt: string }) {
  return src ? <div className="admin-current-image"><Image src={src} alt={alt} width={120} height={120} /></div> : null;
}

export function TeamMemberForm({ member }: { member?: TeamMember }) {
  const boundAction = saveTeamMember.bind(null, member?.id ?? null);
  const [state, action] = useActionState(boundAction, initialAdminActionState);
  return <div className="admin-entry-editor"><form className="admin-form-card" action={action} encType="multipart/form-data"><div className="admin-entry-heading"><div><p className="admin-eyebrow">{member ? "Membre de l’équipe" : "Nouveau membre"}</p><h3>{member?.name ?? "Ajouter une personne"}</h3></div><label className="admin-switch-field"><input name="published" type="checkbox" defaultChecked={member?.published ?? false} /><span>Publié</span></label></div><ExistingImage src={member?.image_url ?? null} alt={member ? `Portrait de ${member.name}` : ""} /><div className="admin-fields-grid"><label className="admin-field"><span>Prénom et nom <b>*</b></span><input name="name" defaultValue={member?.name ?? ""} required /></label><label className="admin-field"><span>Fonction dans l’association <b>*</b></span><input name="role" defaultValue={member?.role ?? ""} required /></label><label className="admin-field admin-field-full"><span>Présentation courte</span><textarea name="bio" rows={4} defaultValue={member?.bio ?? ""} /></label><label className="admin-field admin-file-field"><span>Portrait authentique</span><input name="image" type="file" accept="image/jpeg,image/png,image/webp" /></label><label className="admin-field"><span>Ordre d’affichage</span><input name="display_order" type="number" min="0" defaultValue={member?.display_order ?? 0} /></label></div><div className="admin-entry-actions"><ActionMessage state={state} /><SubmitButton>{member ? "Mettre à jour" : "Ajouter à l’équipe"}</SubmitButton></div></form>{member ? <DeleteEntryForm kind="team" id={member.id} /> : null}</div>;
}

export function PartnerForm({ partner }: { partner?: ConfirmedPartner }) {
  const boundAction = savePartner.bind(null, partner?.id ?? null);
  const [state, action] = useActionState(boundAction, initialAdminActionState);
  return <div className="admin-entry-editor"><form className="admin-form-card" action={action} encType="multipart/form-data"><div className="admin-entry-heading"><div><p className="admin-eyebrow">{partner ? "Partenaire confirmé" : "Nouveau partenaire"}</p><h3>{partner?.name ?? "Ajouter une structure"}</h3></div><label className="admin-switch-field"><input name="published" type="checkbox" defaultChecked={partner?.published ?? false} /><span>Publié</span></label></div><ExistingImage src={partner?.logo_url ?? null} alt={partner ? `Logo de ${partner.name}` : ""} /><div className="admin-fields-grid"><label className="admin-field"><span>Nom <b>*</b></span><input name="name" defaultValue={partner?.name ?? ""} required /></label><label className="admin-field"><span>Catégorie <b>*</b></span><input name="category" defaultValue={partner?.category ?? ""} placeholder="Entreprise, collectivité, association…" required /></label><label className="admin-field admin-field-full"><span>Présentation</span><textarea name="description" rows={4} defaultValue={partner?.description ?? ""} /></label><label className="admin-field"><span>Site internet</span><input name="website_url" type="url" defaultValue={partner?.website_url ?? ""} /></label><label className="admin-field"><span>Ordre d’affichage</span><input name="display_order" type="number" min="0" defaultValue={partner?.display_order ?? 0} /></label><label className="admin-field admin-field-full admin-file-field"><span>Logo</span><input name="image" type="file" accept="image/jpeg,image/png,image/webp" /></label></div><div className="admin-entry-actions"><ActionMessage state={state} /><SubmitButton>{partner ? "Mettre à jour" : "Ajouter le partenaire"}</SubmitButton></div></form>{partner ? <DeleteEntryForm kind="partner" id={partner.id} /> : null}</div>;
}

export function TestimonialForm({ testimonial }: { testimonial?: Testimonial }) {
  const boundAction = saveTestimonial.bind(null, testimonial?.id ?? null);
  const [state, action] = useActionState(boundAction, initialAdminActionState);
  return <div className="admin-entry-editor"><form className="admin-form-card" action={action} encType="multipart/form-data"><div className="admin-entry-heading"><div><p className="admin-eyebrow">{testimonial ? "Témoignage" : "Nouveau témoignage"}</p><h3>{testimonial?.author_name ?? "Préparer un témoignage"}</h3></div><label className="admin-switch-field"><input name="published" type="checkbox" defaultChecked={testimonial?.published ?? false} /><span>Publié</span></label></div><ExistingImage src={testimonial?.image_url ?? null} alt={testimonial ? `Portrait de ${testimonial.author_name}` : ""} /><div className="admin-fields-grid"><label className="admin-field"><span>Nom affiché <b>*</b></span><input name="author_name" defaultValue={testimonial?.author_name ?? ""} required /></label><label className="admin-field"><span>Profil <b>*</b></span><select name="author_role" defaultValue={testimonial?.author_role ?? "young"}><option value="young">Jeune</option><option value="parent">Parent</option><option value="professional">Professionnel / intervenant</option><option value="partner">Partenaire</option></select></label><label className="admin-field admin-field-full"><span>Témoignage <b>*</b></span><textarea name="quote" rows={5} defaultValue={testimonial?.quote ?? ""} required /></label><label className="admin-field admin-file-field"><span>Portrait facultatif</span><input name="image" type="file" accept="image/jpeg,image/png,image/webp" /></label><label className="admin-field"><span>Ordre d’affichage</span><input name="display_order" type="number" min="0" defaultValue={testimonial?.display_order ?? 0} /></label></div><div className="admin-entry-actions"><ActionMessage state={state} /><SubmitButton>{testimonial ? "Mettre à jour" : "Ajouter le témoignage"}</SubmitButton></div></form>{testimonial ? <DeleteEntryForm kind="testimonial" id={testimonial.id} /> : null}</div>;
}
