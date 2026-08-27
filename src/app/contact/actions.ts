"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { z } from "zod";
import type { ContactProfile } from "@/lib/cms-types";
import { sendContactRequestEmails } from "@/lib/contact-email";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ContactActionState = {
  status: "idle" | "error" | "success";
  message: string;
  field?: string;
};

const optionalAge = z.preprocess(
  (value) => value === "" || value == null ? null : Number(value),
  z.number().int().min(0).max(99).nullable(),
);

const contactSchema = z.object({
  profile: z.enum(["young", "parent", "professional", "partner"]),
  name: z.string().trim().min(2, "Indiquez votre prénom et votre nom.").max(120),
  email: z.email("Saisissez une adresse e-mail valide.").trim(),
  phone: z.string().trim().max(30),
  age: optionalAge,
  organization: z.string().trim().max(160),
  role_or_job: z.string().trim().max(160),
  request_type: z.string().trim().min(2, "Choisissez l’objet de votre demande.").max(160),
  subject: z.string().trim().min(3, "Ajoutez un objet à votre demande.").max(160),
  message: z.string().trim().min(20, "Votre message doit contenir au moins 20 caractères.").max(5000),
  consent: z.string().refine((value) => value === "on", "Vous devez accepter l’utilisation de vos informations pour recevoir une réponse."),
  guardian_ack: z.string().optional(),
  website: z.string().max(0, "Une vérification anti-spam a bloqué l’envoi. Rechargez la page puis réessayez."),
}).superRefine((value, context) => {
  if (value.profile === "young" && (value.age == null || value.age < 14 || value.age > 25)) {
    context.addIssue({ code: "custom", path: ["age"], message: "Ce parcours est réservé aux jeunes de 14 à 25 ans." });
  }
  if (value.profile === "young" && value.age === 14 && value.guardian_ack !== "on") {
    context.addIssue({ code: "custom", path: ["guardian_ack"], message: "À 14 ans, utilisez ce formulaire avec l’aide d’un responsable légal." });
  }
  if (value.profile === "parent" && value.age == null) {
    context.addIssue({ code: "custom", path: ["age"], message: "Indiquez l’âge du jeune concerné." });
  }
  if (value.profile === "professional" && !value.role_or_job) {
    context.addIssue({ code: "custom", path: ["role_or_job"], message: "Indiquez votre métier ou votre fonction." });
  }
  if (value.profile === "partner" && !value.organization) {
    context.addIssue({ code: "custom", path: ["organization"], message: "Indiquez le nom de votre structure." });
  }
});

export async function submitContactRequest(
  _previousState: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  const startedAt = Date.now();
  const result = contactSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    const issue = result.error.issues[0];
    console.warn(JSON.stringify({
      level: "warn",
      message: "contact.validation_failed",
      profile: String(formData.get("profile") ?? "unknown").slice(0, 32),
      field: String(issue?.path[0] ?? "form"),
      code: issue?.code ?? "unknown",
      duration_ms: Date.now() - startedAt,
    }));
    return {
      status: "error",
      message: issue?.message ?? "Formulaire invalide.",
      field: String(issue?.path[0] ?? "form"),
    };
  }

  const values = result.data;
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    console.error(JSON.stringify({
      level: "error",
      message: "contact.supabase_unavailable",
      profile: values.profile,
      duration_ms: Date.now() - startedAt,
    }));
    return { status: "error", message: "L’envoi est momentanément indisponible." };
  }

  const details: Record<string, string> = {
    request_type: values.request_type,
  };
  if (values.role_or_job) details.role_or_job = values.role_or_job;

  const requestId = randomUUID();
  const createdAt = new Date().toISOString();

  const { error } = await supabase.from("contact_requests").insert({
    id: requestId,
    profile: values.profile satisfies ContactProfile,
    name: values.name,
    email: values.email,
    phone: values.phone || null,
    age: values.age,
    organization: values.organization || null,
    subject: values.subject,
    message: values.message,
    details,
    status: "new",
    consent_at: createdAt,
  });

  if (error) {
    console.error(JSON.stringify({
      level: "error",
      message: "contact.insert_failed",
      profile: values.profile,
      error_code: error.code,
      duration_ms: Date.now() - startedAt,
    }));
    return { status: "error", message: "Votre demande n’a pas pu être envoyée. Réessayez dans quelques instants." };
  }

  console.info(JSON.stringify({
    level: "info",
    message: "contact.insert_succeeded",
    profile: values.profile,
    duration_ms: Date.now() - startedAt,
  }));

  after(async () => {
    await sendContactRequestEmails({
      id: requestId,
      createdAt,
      profile: values.profile,
      name: values.name,
      email: values.email,
      phone: values.phone || null,
      age: values.age,
      organization: values.organization || null,
      roleOrJob: values.role_or_job || null,
      requestType: values.request_type,
      subject: values.subject,
      message: values.message,
    });
  });

  revalidatePath("/admin/demandes");
  return { status: "success", message: "Merci, votre demande a bien été transmise à VIE AVENIR." };
}
