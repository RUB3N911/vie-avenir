"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { AdminActionState } from "@/lib/admin-action-state";
import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const optionalWebUrl = z.string().trim().max(2048, "Le lien est trop long.").refine((value) => {
  if (!value) return true;
  if (!URL.canParse(value)) return false;
  const protocol = new URL(value).protocol;
  return protocol === "https:" || protocol === "http:";
}, "Utilisez une adresse commençant par https:// ou http://.");

const templateSchema = z.object({
  profile: z.enum(["young", "parent", "professional", "partner"]),
  label: z.string().trim().min(2, "Le nom du modèle est requis.").max(80),
  subject: z.string().trim().min(3, "L’objet doit contenir au moins 3 caractères.").max(160)
    .refine((value) => !/[\r\n]/.test(value), "L’objet doit tenir sur une seule ligne."),
  heading: z.string().trim().min(3, "Le titre doit contenir au moins 3 caractères.").max(180),
  body: z.string().trim().min(10, "Le message doit contenir au moins 10 caractères.").max(5000),
  cta_label: z.string().trim().max(80, "Le texte du bouton est trop long."),
  cta_url: optionalWebUrl,
  display_order: z.coerce.number().int().min(0).max(999),
}).superRefine((value, context) => {
  if (Boolean(value.cta_label) !== Boolean(value.cta_url)) {
    context.addIssue({
      code: "custom",
      path: [value.cta_label ? "cta_url" : "cta_label"],
      message: "Renseignez à la fois le texte et le lien du bouton, ou laissez les deux champs vides.",
    });
  }
});

export async function saveContactReplyTemplate(
  templateId: string | null,
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  if (templateId && !z.uuid().safeParse(templateId).success) return { status: "error", message: "Modèle invalide." };

  const parsed = templateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Formulaire invalide." };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: "Base de données indisponible." };

  const payload = {
    ...parsed.data,
    cta_label: parsed.data.cta_label || null,
    cta_url: parsed.data.cta_url || null,
    updated_by: admin.id,
  };

  if (templateId) {
    const { data, error } = await supabase
      .from("contact_reply_templates")
      .update(payload)
      .eq("id", templateId)
      .select("id")
      .maybeSingle();
    if (error || !data) return { status: "error", message: `Mise à jour impossible${error ? ` : ${error.message}` : "."}` };
  } else {
    const { error } = await supabase.from("contact_reply_templates").insert({
      id: randomUUID(),
      ...payload,
      created_by: admin.id,
    });
    if (error) return { status: "error", message: `Création impossible : ${error.message}` };
  }

  revalidatePath("/admin/demandes");
  return { status: "success", message: templateId ? "Le modèle est mis à jour." : "Le nouveau modèle est enregistré." };
}

export async function deleteContactReplyTemplate(
  templateId: string,
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  if (!z.uuid().safeParse(templateId).success) return { status: "error", message: "Modèle invalide." };
  if (formData.get("confirmation") !== "SUPPRIMER") {
    return { status: "error", message: "Saisissez SUPPRIMER pour confirmer." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: "Base de données indisponible." };
  const { error } = await supabase.from("contact_reply_templates").delete().eq("id", templateId);
  if (error) return { status: "error", message: `Suppression impossible : ${error.message}` };

  revalidatePath("/admin/demandes");
  return { status: "success", message: "Le modèle a été supprimé." };
}
