"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { ContactProfile } from "@/lib/cms-types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ContactActionState = {
  status: "idle" | "error" | "success";
  message: string;
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
  website: z.string().max(0),
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
  const result = contactSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return { status: "error", message: result.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const values = result.data;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: "L’envoi est momentanément indisponible." };

  const details: Record<string, string> = {
    request_type: values.request_type,
  };
  if (values.role_or_job) details.role_or_job = values.role_or_job;

  const { error } = await supabase.from("contact_requests").insert({
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
    consent_at: new Date().toISOString(),
  });

  if (error) {
    console.error("Impossible d’enregistrer la demande", error.message);
    return { status: "error", message: "Votre demande n’a pas pu être envoyée. Réessayez dans quelques instants." };
  }

  revalidatePath("/admin/demandes");
  return { status: "success", message: "Merci, votre demande a bien été transmise à VIE AVENIR." };
}
