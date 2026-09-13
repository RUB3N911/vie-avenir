"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { AdminActionState } from "@/lib/admin-action-state";
import { requireAdmin } from "@/lib/admin-auth";
import { buildContactReplyEmail } from "@/lib/contact-reply-email";
import type { ContactProfile } from "@/lib/cms-types";
import { hasResendConfiguration, sendResendEmail } from "@/lib/resend-email";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const replySchema = z.object({
  template_id: z.union([z.literal(""), z.uuid("Modèle invalide.")]),
  reply_token: z.uuid(),
  subject: z.string().trim().min(3, "L’objet doit contenir au moins 3 caractères.").max(160)
    .refine((value) => !/[\r\n]/.test(value), "L’objet doit tenir sur une seule ligne."),
  heading: z.string().trim().min(3, "Le titre doit contenir au moins 3 caractères.").max(180),
  body: z.string().trim().min(10, "Le message doit contenir au moins 10 caractères.").max(5000),
});

export async function sendContactRequestReply(
  requestId: string,
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  if (!z.uuid().safeParse(requestId).success) return { status: "error", message: "Demande invalide." };

  const parsed = replySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  if (!hasResendConfiguration()) {
    return { status: "error", message: "L’envoi d’e-mails n’est pas encore configuré dans Resend." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: "Base de données indisponible." };

  const { data, error } = await supabase
    .from("contact_requests")
    .select("id, profile, name, email")
    .eq("id", requestId)
    .maybeSingle();
  if (error) return { status: "error", message: `Demande indisponible : ${error.message}` };
  if (!data) return { status: "error", message: "Cette demande est introuvable." };

  const profile = data.profile as ContactProfile;
  let cta: { label: string; url: string } | undefined;
  if (parsed.data.template_id) {
    const { data: template, error: templateError } = await supabase
      .from("contact_reply_templates")
      .select("cta_label, cta_url")
      .eq("id", parsed.data.template_id)
      .eq("profile", profile)
      .maybeSingle();
    if (templateError) return { status: "error", message: `Modèle indisponible : ${templateError.message}` };
    if (!template) return { status: "error", message: "Ce modèle ne correspond pas au profil de la demande." };
    if (template.cta_label && template.cta_url) cta = { label: template.cta_label, url: template.cta_url };
  }

  const delivery = await sendResendEmail(buildContactReplyEmail({
    requestId,
    replyToken: parsed.data.reply_token,
    profile,
    recipientName: data.name,
    recipientEmail: data.email,
    subject: parsed.data.subject,
    heading: parsed.data.heading,
    body: parsed.data.body,
    cta,
  }));
  if (!delivery.ok) {
    const message = delivery.reason === "missing_config"
      ? "L’envoi d’e-mails n’est pas encore configuré dans Resend."
      : delivery.reason === "network_error"
        ? "Le service d’envoi est momentanément inaccessible. Réessayez dans un instant."
        : "L’e-mail n’a pas pu être envoyé. Vérifiez la configuration Resend.";
    return { status: "error", message };
  }

  const { data: updated, error: updateError } = await supabase
    .from("contact_requests")
    .update({ status: "replied", updated_by: admin.id })
    .eq("id", requestId)
    .select("id")
    .maybeSingle();

  if (updateError || !updated) {
    return { status: "error", message: "L’e-mail a été envoyé, mais le statut de la demande n’a pas pu être actualisé." };
  }
  revalidatePath("/admin/demandes");
  return { status: "success", message: `Réponse envoyée à ${data.email}. La demande est marquée comme traitée.` };
}
