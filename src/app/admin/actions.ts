"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import type { AdminActionState } from "@/lib/admin-action-state";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const optionalUrl = z
  .string()
  .trim()
  .refine((value) => value === "" || URL.canParse(value), "Adresse web invalide.");

const loginSchema = z.object({
  email: z.email("Saisissez une adresse e-mail valide.").trim(),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères."),
});

const associationSchema = z.object({
  legal_name: z.string().trim().min(2, "Le nom de l’association est requis."),
  public_email: z.union([z.literal(""), z.email("Adresse e-mail invalide.")]),
  phone: z.string().trim().max(30),
  whatsapp: z.string().trim().max(30),
  address: z.string().trim().max(200),
  postal_code: z.string().trim().max(12),
  city: z.string().trim().min(2, "La commune ou le territoire est requis."),
  rna_number: z.string().trim().max(30),
  instagram_url: optionalUrl,
  tiktok_url: optionalUrl,
  website_url: optionalUrl,
});

const eventSchema = z
  .object({
    title: z.string().trim().min(4, "Le titre doit contenir au moins 4 caractères."),
    summary: z.string().trim().min(20, "Ajoutez un résumé d’au moins 20 caractères."),
    description: z.string().trim().max(4000),
    starts_at: z.string().min(1, "La date de début est requise."),
    ends_at: z.string(),
    venue_name: z.string().trim().max(160),
    venue_address: z.string().trim().max(240),
    city: z.string().trim().min(2, "La commune ou le territoire est requis."),
    age_min: z.coerce.number().int().min(0).max(99),
    age_max: z.coerce.number().int().min(0).max(99),
    capacity: z.union([z.literal(""), z.coerce.number().int().positive()]),
    price_label: z.string().trim().min(2, "Précisez la gratuité ou le tarif."),
    access_details: z.string().trim().max(1500),
    registration_url: optionalUrl,
    registration_deadline: z.string(),
    registration_status: z.enum(["coming_soon", "open", "full", "cancelled", "closed"]),
    publication_status: z.enum(["draft", "published", "archived"]),
    program: z.string().max(2000),
  })
  .refine((value) => value.age_max >= value.age_min, {
    message: "L’âge maximum doit être supérieur ou égal à l’âge minimum.",
  });

function emptyToNull(value: string) {
  return value === "" ? null : value;
}

function dateTimeInMartinique(value: string) {
  if (!value) return null;
  const normalized = value.length === 16 ? `${value}:00` : value;
  const date = new Date(`${normalized}-04:00`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 72);
}

export async function signInAdmin(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  if (!isSupabaseConfigured()) {
    return {
      status: "error",
      message: "L’espace administrateur doit encore être raccordé à sa base sécurisée.",
    };
  }

  const result = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!result.success) {
    return { status: "error", message: result.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: "Connexion indisponible." };

  const { data, error } = await supabase.auth.signInWithPassword(result.data);
  if (error || !data.user) {
    return { status: "error", message: "E-mail ou mot de passe incorrect." };
  }

  const { data: admin } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!admin) {
    await supabase.auth.signOut();
    return { status: "error", message: "Ce compte n’est pas autorisé à administrer le site." };
  }

  redirect("/admin");
}

export async function signOutAdmin() {
  const supabase = await createSupabaseServerClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/admin/connexion");
}

export async function saveAssociationSettings(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const raw = Object.fromEntries(formData);
  const result = associationSchema.safeParse(raw);

  if (!result.success) {
    return { status: "error", message: result.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: "Base de données indisponible." };

  const values = result.data;
  const { error } = await supabase.from("association_settings").upsert({
    id: true,
    legal_name: values.legal_name,
    public_email: emptyToNull(values.public_email),
    phone: emptyToNull(values.phone),
    whatsapp: emptyToNull(values.whatsapp),
    address: emptyToNull(values.address),
    postal_code: emptyToNull(values.postal_code),
    city: values.city,
    rna_number: emptyToNull(values.rna_number),
    instagram_url: emptyToNull(values.instagram_url),
    tiktok_url: emptyToNull(values.tiktok_url),
    website_url: emptyToNull(values.website_url),
    updated_by: admin.id,
  });

  if (error) return { status: "error", message: `Enregistrement impossible : ${error.message}` };

  revalidatePath("/admin");
  revalidatePath("/admin/informations");
  revalidatePath("/mentions-legales");
  revalidatePath("/politique-confidentialite");
  return { status: "success", message: "Les informations de l’association sont enregistrées." };
}

export async function saveEvent(
  eventId: string | null,
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const result = eventSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return { status: "error", message: result.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const startsAt = dateTimeInMartinique(result.data.starts_at);
  const endsAt = dateTimeInMartinique(result.data.ends_at);
  const registrationDeadline = dateTimeInMartinique(result.data.registration_deadline);
  if (!startsAt) return { status: "error", message: "La date de début est invalide." };
  if (result.data.ends_at && !endsAt) return { status: "error", message: "La date de fin est invalide." };
  if (endsAt && new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
    return { status: "error", message: "La fin de l’événement doit être postérieure à son début." };
  }
  if (result.data.registration_deadline && !registrationDeadline) {
    return { status: "error", message: "La date limite d’inscription est invalide." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: "Base de données indisponible." };

  const id = eventId ?? randomUUID();
  let imageUrl: string | null = null;

  if (eventId) {
    const { data: existing } = await supabase
      .from("events")
      .select("image_url")
      .eq("id", eventId)
      .maybeSingle();
    imageUrl = existing?.image_url ?? null;
  }

  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    const allowedTypes = new Map([
      ["image/jpeg", "jpg"],
      ["image/png", "png"],
      ["image/webp", "webp"],
    ]);
    const extension = allowedTypes.get(image.type);

    if (!extension) {
      return { status: "error", message: "Le visuel doit être au format JPG, PNG ou WebP." };
    }
    if (image.size > 5 * 1024 * 1024) {
      return { status: "error", message: "Le visuel ne doit pas dépasser 5 Mo." };
    }

    const path = `${id}/${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("event-images").upload(path, image, {
      cacheControl: "3600",
      contentType: image.type,
      upsert: false,
    });

    if (uploadError) {
      return { status: "error", message: `Envoi du visuel impossible : ${uploadError.message}` };
    }

    imageUrl = supabase.storage.from("event-images").getPublicUrl(path).data.publicUrl;
  }

  const program = result.data.program
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
  const slugBase = slugify(result.data.title) || "evenement";
  const slug = `${slugBase}-${startsAt.slice(0, 10)}`;

  const { error } = await supabase.from("events").upsert({
    id,
    slug,
    title: result.data.title,
    summary: result.data.summary,
    description: emptyToNull(result.data.description),
    starts_at: startsAt,
    ends_at: endsAt,
    venue_name: emptyToNull(result.data.venue_name),
    venue_address: emptyToNull(result.data.venue_address),
    city: result.data.city,
    age_min: result.data.age_min,
    age_max: result.data.age_max,
    capacity: result.data.capacity === "" ? null : result.data.capacity,
    price_label: result.data.price_label,
    access_details: emptyToNull(result.data.access_details),
    registration_url: emptyToNull(result.data.registration_url),
    registration_deadline: registrationDeadline,
    registration_status: result.data.registration_status,
    publication_status: result.data.publication_status,
    image_url: imageUrl,
    program,
    updated_by: admin.id,
  });

  if (error) return { status: "error", message: `Enregistrement impossible : ${error.message}` };

  revalidatePath("/");
  revalidatePath("/evenements");
  revalidatePath("/admin");
  revalidatePath("/admin/evenements");
  redirect(eventId ? `/admin/evenements/${id}?enregistre=1` : "/admin/evenements?cree=1");
}

export async function deleteEvent(
  eventId: string,
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  if (formData.get("confirmation") !== "SUPPRIMER") {
    return { status: "error", message: "Saisissez SUPPRIMER pour confirmer." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: "Base de données indisponible." };

  const { data: event } = await supabase
    .from("events")
    .select("image_url")
    .eq("id", eventId)
    .maybeSingle();
  const { error } = await supabase.from("events").delete().eq("id", eventId);

  if (error) return { status: "error", message: `Suppression impossible : ${error.message}` };

  const marker = "/event-images/";
  const imagePath = event?.image_url?.includes(marker)
    ? event.image_url.split(marker)[1]
    : null;
  if (imagePath) await supabase.storage.from("event-images").remove([imagePath]);

  revalidatePath("/");
  revalidatePath("/evenements");
  revalidatePath("/admin");
  revalidatePath("/admin/evenements");
  redirect("/admin/evenements?supprime=1");
}
