"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { z } from "zod";
import type { AdminActionState } from "@/lib/admin-action-state";
import { requireAdmin } from "@/lib/admin-auth";
import type {
  EventRecord,
  EventRegistrationAudience,
  EventRegistrationRecord,
} from "@/lib/cms-types";
import {
  sendEventBroadcast,
  sendRegistrationStatusEmail,
} from "@/lib/event-email";
import { hasResendConfiguration } from "@/lib/resend-email";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const registrationIntentSchema = z.enum(["attended", "no_show", "confirmed", "cancel", "promote"]);
const messageSchema = z.object({
  audience: z.enum(["confirmed", "waitlisted", "all"]),
  subject: z.string().trim().min(3, "L’objet doit contenir au moins 3 caractères.").max(160),
  body: z.string().trim().min(3, "Le message doit contenir au moins 3 caractères.").max(5000),
});

type EventForEmail = Pick<EventRecord, "id" | "slug" | "title" | "starts_at" | "venue_name" | "city">;

function registrationPath(eventId: string) {
  return `/admin/evenements/${eventId}/inscriptions`;
}

async function loadEventForEmail(eventId: string): Promise<EventForEmail | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("events")
    .select("id, slug, title, starts_at, venue_name, city")
    .eq("id", eventId)
    .maybeSingle();
  return data as EventForEmail | null;
}

export async function manageEventRegistration(
  registrationId: string,
  eventId: string,
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const intent = registrationIntentSchema.safeParse(formData.get("intent"));
  if (!intent.success || !z.uuid().safeParse(registrationId).success || !z.uuid().safeParse(eventId).success) {
    return { status: "error", message: "Action invalide." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: "Base de données indisponible." };

  const { data: registration } = await supabase
    .from("event_registrations")
    .select("*")
    .eq("id", registrationId)
    .eq("event_id", eventId)
    .maybeSingle();
  const current = registration as EventRegistrationRecord | null;
  if (!current) return { status: "error", message: "Inscription introuvable." };

  const event = await loadEventForEmail(eventId);
  if (!event) return { status: "error", message: "Événement introuvable." };

  if (intent.data === "cancel") {
    const { data, error } = await supabase.rpc("admin_cancel_event_registration", {
      p_registration_id: registrationId,
    });
    if (error) return { status: "error", message: `Annulation impossible : ${error.message}` };

    const promoted = (data as Array<{
      promoted_registration_id: string | null;
      promoted_email: string | null;
      promoted_first_name: string | null;
    }> | null)?.[0];

    after(async () => {
      const emails = [sendRegistrationStatusEmail({
        registrationId: current.id,
        kind: "cancelled",
        email: current.contact_email,
        firstName: current.participant_first_name,
        event,
      })];
      if (promoted?.promoted_registration_id && promoted.promoted_email && promoted.promoted_first_name) {
        emails.push(sendRegistrationStatusEmail({
          registrationId: promoted.promoted_registration_id,
          kind: "promoted",
          email: promoted.promoted_email,
          firstName: promoted.promoted_first_name,
          event,
        }));
      }
      await Promise.all(emails);
    });

    revalidatePath(registrationPath(eventId));
    revalidatePath(`/evenements/${event.slug}`);
    return {
      status: "success",
      message: promoted?.promoted_registration_id
        ? "Inscription annulée et première personne en attente confirmée."
        : "Inscription annulée.",
    };
  }

  if (intent.data === "promote") {
    const { error } = await supabase.rpc("admin_promote_event_registration", {
      p_registration_id: registrationId,
    });
    if (error) {
      const message = error.message.includes("event_capacity_reached")
        ? "Aucune place n’est disponible pour le moment."
        : `Confirmation impossible : ${error.message}`;
      return { status: "error", message };
    }
    after(async () => {
      await sendRegistrationStatusEmail({
        registrationId: current.id,
        kind: "promoted",
        email: current.contact_email,
        firstName: current.participant_first_name,
        event,
      });
    });
    revalidatePath(registrationPath(eventId));
    revalidatePath(`/evenements/${event.slug}`);
    return { status: "success", message: "La personne est maintenant confirmée et sera informée par e-mail." };
  }

  if (current.status === "waitlisted" || current.status === "cancelled") {
    return { status: "error", message: "Cette modification de statut n’est pas autorisée." };
  }

  const { error } = await supabase
    .from("event_registrations")
    .update({ status: intent.data, status_updated_at: new Date().toISOString(), updated_by: admin.id })
    .eq("id", registrationId)
    .eq("event_id", eventId);
  if (error) return { status: "error", message: `Mise à jour impossible : ${error.message}` };

  revalidatePath(registrationPath(eventId));
  const labels = { attended: "Présence enregistrée.", no_show: "Absence enregistrée.", confirmed: "Statut corrigé en confirmé." };
  return { status: "success", message: labels[intent.data] };
}

export async function sendEventParticipantMessage(
  eventId: string,
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  if (!z.uuid().safeParse(eventId).success) return { status: "error", message: "Événement invalide." };
  const parsed = messageSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  if (!hasResendConfiguration()) {
    return { status: "error", message: "L’envoi d’e-mails n’est pas encore configuré dans Resend." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: "Base de données indisponible." };
  const event = await loadEventForEmail(eventId);
  if (!event) return { status: "error", message: "Événement introuvable." };

  let recipientsQuery = supabase
    .from("event_registrations")
    .select("contact_email, participant_first_name, status")
    .eq("event_id", eventId);
  if (parsed.data.audience === "all") {
    recipientsQuery = recipientsQuery.in("status", ["confirmed", "waitlisted"]);
  } else {
    recipientsQuery = recipientsQuery.eq("status", parsed.data.audience === "confirmed" ? "confirmed" : "waitlisted");
  }
  const { data: recipientRows, error: recipientError } = await recipientsQuery;
  if (recipientError) return { status: "error", message: `Destinataires indisponibles : ${recipientError.message}` };

  const recipients = Array.from(new Map((recipientRows ?? []).map((row) => [
    row.contact_email.trim().toLowerCase(),
    { email: row.contact_email, firstName: row.participant_first_name },
  ])).values());
  if (!recipients.length) return { status: "error", message: "Aucun destinataire ne correspond à ce groupe." };

  const messageId = randomUUID();
  const audience = parsed.data.audience as EventRegistrationAudience;
  const { error: logError } = await supabase.from("event_registration_messages").insert({
    id: messageId,
    event_id: eventId,
    audience,
    subject: parsed.data.subject,
    body: parsed.data.body,
    recipient_count: recipients.length,
    delivery_status: "sending",
    sent_by: admin.id,
  });
  if (logError) return { status: "error", message: `Envoi impossible : ${logError.message}` };

  const delivery = await sendEventBroadcast({
    messageId,
    audience,
    event,
    subject: parsed.data.subject,
    body: parsed.data.body,
    recipients,
  });
  const deliveryStatus = delivery.failed === 0 ? "sent" : delivery.delivered > 0 ? "partial" : "failed";
  await supabase.from("event_registration_messages").update({
    recipient_count: delivery.recipientCount,
    delivered_count: delivery.delivered,
    failed_count: delivery.failed,
    delivery_status: deliveryStatus,
  }).eq("id", messageId);
  revalidatePath(registrationPath(eventId));

  if (deliveryStatus === "failed") return { status: "error", message: "Aucun e-mail n’a pu être remis. Vérifiez la configuration Resend." };
  if (deliveryStatus === "partial") return { status: "error", message: `${delivery.delivered} e-mail(s) envoyé(s), ${delivery.failed} en échec.` };
  return { status: "success", message: `Message envoyé individuellement à ${delivery.delivered} adresse(s).` };
}
