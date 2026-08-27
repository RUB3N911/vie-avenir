"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getPublishedEventBySlug } from "@/lib/cms-data";
import { sendRegistrationCreatedEmails } from "@/lib/event-email";
import type { EventRegistrationActionState } from "@/lib/event-registration-state";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const registrationSchema = z.object({
  first_name: z.string().trim().min(2, "Le prénom est requis.").max(80),
  last_name: z.string().trim().min(2, "Le nom est requis.").max(80),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La date de naissance est invalide."),
  contact_email: z.email("L’adresse e-mail est invalide.").trim().max(254),
  contact_phone: z.string().trim().min(6, "Le numéro de téléphone est requis.").max(30),
  city: z.string().trim().max(120),
  guardian_name: z.string().trim().max(160),
  guardian_email: z.union([z.literal(""), z.email("L’adresse e-mail du responsable est invalide.")]),
  guardian_phone: z.string().trim().max(30),
  accessibility_needs: z.string().trim().max(1000, "Le message ne doit pas dépasser 1 000 caractères."),
  website: z.string().max(0),
});

function registrationError(message: string): EventRegistrationActionState {
  const knownErrors: Record<string, string> = {
    privacy_consent_required: "Vous devez accepter la politique de confidentialité pour vous inscrire.",
    invalid_registration_data: "Certaines informations sont invalides. Vérifiez le formulaire.",
    event_not_found: "Cet événement n’est plus disponible.",
    registrations_not_open: "Les inscriptions ne sont pas ouvertes pour cet événement.",
    registration_deadline_passed: "La date limite d’inscription est dépassée.",
    event_started: "L’événement a déjà commencé.",
    participant_age_not_eligible: "L’âge du participant ne correspond pas au public de cet événement.",
    guardian_details_required: "Pour un participant mineur, renseignez le responsable légal et confirmez son autorisation.",
    registration_email_limit_reached: "Cette adresse a déjà été utilisée pour plusieurs inscriptions. Contactez-nous si vous inscrivez un groupe.",
  };
  const key = Object.keys(knownErrors).find((candidate) => message.includes(candidate));
  if (key) return { status: "error", message: knownErrors[key] };
  if (message.includes("duplicate") || message.includes("event_registrations_active_identity_idx")) {
    return { status: "error", message: "Cette personne est déjà inscrite à l’événement avec cette adresse e-mail." };
  }
  return { status: "error", message: "L’inscription n’a pas pu être enregistrée. Réessayez ou contactez l’association." };
}

export async function registerForEvent(
  eventId: string,
  eventSlug: string,
  _previousState: EventRegistrationActionState,
  formData: FormData,
): Promise<EventRegistrationActionState> {
  const parsed = registrationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const event = await getPublishedEventBySlug(eventSlug);
  if (!event || event.id !== eventId) return { status: "error", message: "Cet événement n’est plus disponible." };
  if (event.registration_url) return { status: "error", message: "Utilisez le lien d’inscription indiqué pour cet événement." };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: "Le service d’inscription est momentanément indisponible." };

  const values = parsed.data;
  const { data, error } = await supabase.rpc("register_for_event", {
    p_event_id: event.id,
    p_first_name: values.first_name,
    p_last_name: values.last_name,
    p_birth_date: values.birth_date,
    p_contact_email: values.contact_email,
    p_contact_phone: values.contact_phone,
    p_city: values.city,
    p_guardian_name: values.guardian_name,
    p_guardian_email: values.guardian_email,
    p_guardian_phone: values.guardian_phone,
    p_accessibility_needs: values.accessibility_needs,
    p_photo_consent: formData.get("photo_consent") === "on",
    p_privacy_consent: formData.get("privacy_consent") === "on",
    p_guardian_consent: formData.get("guardian_consent") === "on",
  });

  if (error) return registrationError(error.message);
  const registration = (data as Array<{ registration_id: string; registration_status: "confirmed" | "waitlisted" }> | null)?.[0];
  if (!registration) return { status: "error", message: "L’inscription n’a pas pu être confirmée." };

  after(async () => {
    await sendRegistrationCreatedEmails({
      registrationId: registration.registration_id,
      firstName: values.first_name,
      lastName: values.last_name,
      email: values.contact_email,
      phone: values.contact_phone,
      status: registration.registration_status,
      event,
    });
  });

  revalidatePath(`/evenements/${event.slug}`);
  revalidatePath(`/admin/evenements/${event.id}/inscriptions`);

  return registration.registration_status === "confirmed"
    ? { status: "confirmed", message: "Inscription confirmée ! Un e-mail récapitulatif vient de vous être envoyé." }
    : { status: "waitlisted", message: "Votre demande est enregistrée sur la liste d’attente. Nous vous écrirons si une place se libère." };
}
