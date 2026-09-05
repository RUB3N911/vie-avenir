"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getPublishedEventBySlug } from "@/lib/cms-data";
import { sendRegistrationCreatedEmails } from "@/lib/event-email";
import type {
  EventRegistrationActionState,
  EventRegistrationField,
  EventRegistrationFormValues,
} from "@/lib/event-registration-state";
import { ageOnDate, isValidBirthDate } from "@/lib/event-registration-validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const registrationSchema = z.object({
  first_name: z.string().trim().min(2, "Indiquez le prénom du participant.").max(80, "Le prénom ne doit pas dépasser 80 caractères."),
  last_name: z.string().trim().min(2, "Indiquez le nom du participant.").max(80, "Le nom ne doit pas dépasser 80 caractères."),
  birth_date: z.string().refine(isValidBirthDate, "Indiquez une date de naissance valide et non future."),
  contact_email: z.email("Saisissez une adresse e-mail valide.").trim().max(254),
  contact_phone: z.string().trim().min(6, "Indiquez un numéro de téléphone valide.").max(30),
  city: z.string().trim().max(120, "Le nom de la commune ne doit pas dépasser 120 caractères."),
  guardian_name: z.string().trim().max(160, "Le nom du responsable ne doit pas dépasser 160 caractères."),
  guardian_email: z.union([z.literal(""), z.email("Saisissez une adresse e-mail valide pour le responsable.")]),
  guardian_phone: z.string().trim().max(30, "Le numéro du responsable ne doit pas dépasser 30 caractères."),
  accessibility_needs: z.string().trim().max(1000, "Les informations utiles ne doivent pas dépasser 1 000 caractères."),
  photo_consent: z.boolean(),
  privacy_consent: z.boolean().refine(Boolean, "Vous devez accepter la politique de confidentialité."),
  guardian_consent: z.boolean(),
  website: z.string().max(0, "Une vérification anti-spam a bloqué l’inscription. Rechargez la page puis réessayez."),
});

function textValue(formData: FormData, name: string) {
  return String(formData.get(name) ?? "");
}

function formValues(formData: FormData): EventRegistrationFormValues {
  return {
    first_name: textValue(formData, "first_name"),
    last_name: textValue(formData, "last_name"),
    birth_date: textValue(formData, "birth_date"),
    city: textValue(formData, "city"),
    contact_email: textValue(formData, "contact_email"),
    contact_phone: textValue(formData, "contact_phone"),
    guardian_name: textValue(formData, "guardian_name"),
    guardian_email: textValue(formData, "guardian_email"),
    guardian_phone: textValue(formData, "guardian_phone"),
    accessibility_needs: textValue(formData, "accessibility_needs"),
    photo_consent: formData.get("photo_consent") === "on",
    privacy_consent: formData.get("privacy_consent") === "on",
    guardian_consent: formData.get("guardian_consent") === "on",
  };
}

function errorState(
  message: string,
  values: EventRegistrationFormValues,
  fieldErrors?: Partial<Record<EventRegistrationField, string>>,
): EventRegistrationActionState {
  return { status: "error", message, values, fieldErrors };
}

function zodErrorState(
  error: z.ZodError,
  values: EventRegistrationFormValues,
): EventRegistrationActionState {
  const fieldErrors: Partial<Record<EventRegistrationField, string>> = {};
  for (const issue of error.issues) {
    const fieldName = issue.path[0];
    if (typeof fieldName !== "string" || !(fieldName in values)) continue;
    const field = fieldName as EventRegistrationField;
    if (!fieldErrors[field]) fieldErrors[field] = issue.message;
  }
  const messages = Object.values(fieldErrors);
  const message = messages.length === 1
    ? messages[0]!
    : messages.length > 1
      ? `Corrigez les ${messages.length} champs signalés ci-dessous.`
      : error.issues[0]?.message ?? "Le formulaire contient une anomalie.";
  return errorState(message, values, fieldErrors);
}

function registrationError(message: string, values: EventRegistrationFormValues): EventRegistrationActionState {
  if (message.includes("privacy_consent_required")) {
    return errorState("Vous devez accepter la politique de confidentialité pour vous inscrire.", values, {
      privacy_consent: "Votre accord est obligatoire pour enregistrer l’inscription.",
    });
  }
  if (message.includes("participant_age_not_eligible")) {
    return errorState("L’âge du participant ne correspond pas au public de cet événement.", values, {
      birth_date: "Vérifiez la date de naissance et l’âge requis pour cet événement.",
    });
  }
  if (message.includes("guardian_details_required")) {
    const guardianMessage = "Cette information est obligatoire pour un participant mineur.";
    return errorState("Complétez les informations du responsable légal.", values, {
      guardian_name: guardianMessage,
      guardian_email: guardianMessage,
      guardian_phone: guardianMessage,
      guardian_consent: "Confirmez l’autorisation du responsable légal.",
    });
  }
  if (message.includes("registration_email_limit_reached")) {
    return errorState("Cette adresse a déjà été utilisée pour plusieurs inscriptions. Contactez-nous si vous inscrivez un groupe.", values, {
      contact_email: "Utilisez une autre adresse ou contactez directement l’association.",
    });
  }
  if (message.includes("duplicate") || message.includes("event_registrations_active_identity_idx")) {
    return errorState("Cette personne est déjà inscrite à l’événement avec cette adresse e-mail.", values, {
      contact_email: "Une inscription active existe déjà pour ce participant.",
    });
  }

  const knownErrors: Record<string, string> = {
    invalid_registration_data: "Certaines informations sont invalides. Vérifiez les champs du formulaire.",
    event_not_found: "Cet événement n’est plus disponible.",
    registrations_not_open: "Les inscriptions ne sont pas ouvertes pour cet événement.",
    registration_deadline_passed: "La date limite d’inscription est dépassée.",
    event_started: "L’événement a déjà commencé.",
  };
  const key = Object.keys(knownErrors).find((candidate) => message.includes(candidate));
  return errorState(
    key ? knownErrors[key] : "L’inscription n’a pas pu être enregistrée. Réessayez ou contactez l’association.",
    values,
  );
}

export async function registerForEvent(
  eventId: string,
  eventSlug: string,
  _previousState: EventRegistrationActionState,
  formData: FormData,
): Promise<EventRegistrationActionState> {
  const submittedValues = formValues(formData);
  const parsed = registrationSchema.safeParse({
    ...submittedValues,
    website: textValue(formData, "website"),
  });
  if (!parsed.success) return zodErrorState(parsed.error, submittedValues);

  const event = await getPublishedEventBySlug(eventSlug);
  if (!event || event.id !== eventId) return errorState("Cet événement n’est plus disponible.", submittedValues);
  if (event.registration_url) return errorState("Utilisez le lien d’inscription indiqué pour cet événement.", submittedValues);

  const participantAge = ageOnDate(parsed.data.birth_date, event.starts_at);
  if (participantAge == null || participantAge < event.age_min || participantAge > event.age_max) {
    return errorState(
      `Cet événement est réservé aux participants de ${event.age_min} à ${event.age_max} ans.`,
      submittedValues,
      { birth_date: "La date de naissance ne correspond pas à la tranche d’âge de cet événement." },
    );
  }

  const isMinor = participantAge < 18;
  if (isMinor) {
    const guardianErrors: Partial<Record<EventRegistrationField, string>> = {};
    if (parsed.data.guardian_name.length < 2) guardianErrors.guardian_name = "Indiquez le nom du responsable légal.";
    if (!parsed.data.guardian_email) guardianErrors.guardian_email = "Indiquez l’adresse e-mail du responsable légal.";
    if (parsed.data.guardian_phone.length < 6) guardianErrors.guardian_phone = "Indiquez le téléphone du responsable légal.";
    if (!parsed.data.guardian_consent) guardianErrors.guardian_consent = "Confirmez l’autorisation du responsable légal.";
    if (Object.keys(guardianErrors).length) {
      return errorState("Complétez les informations obligatoires du responsable légal.", submittedValues, guardianErrors);
    }
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return errorState("Le service d’inscription est momentanément indisponible.", submittedValues);

  const values = parsed.data;
  const { data, error } = await supabase.rpc("register_for_event", {
    p_event_id: event.id,
    p_first_name: values.first_name,
    p_last_name: values.last_name,
    p_birth_date: values.birth_date,
    p_contact_email: values.contact_email,
    p_contact_phone: values.contact_phone,
    p_city: values.city,
    p_guardian_name: isMinor ? values.guardian_name : "",
    p_guardian_email: isMinor ? values.guardian_email : "",
    p_guardian_phone: isMinor ? values.guardian_phone : "",
    p_accessibility_needs: values.accessibility_needs,
    p_photo_consent: values.photo_consent,
    p_privacy_consent: values.privacy_consent,
    p_guardian_consent: isMinor && values.guardian_consent,
  });

  if (error) return registrationError(error.message, submittedValues);
  const registration = (data as Array<{ registration_id: string; registration_status: "confirmed" | "waitlisted" }> | null)?.[0];
  if (!registration) return errorState("L’inscription n’a pas pu être confirmée.", submittedValues);

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
