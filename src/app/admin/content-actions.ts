"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import type { AdminActionState } from "@/lib/admin-action-state";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ServerClient = NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>;

const optionalUrl = z.string().trim().refine((value) => value === "" || URL.canParse(value), "Adresse web invalide.");
const imageTypes = new Map([["image/jpeg", "jpg"], ["image/png", "png"], ["image/webp", "webp"]]);

const presentationSchema = z.object({
  story_title: z.string().trim().max(160),
  story_body: z.string().trim().max(6000),
  team_intro: z.string().trim().max(1500),
  minor_charter_title: z.string().trim().max(180),
  minor_charter_body: z.string().trim().max(8000),
});

const teamSchema = z.object({
  name: z.string().trim().min(2, "Le nom est requis.").max(120),
  role: z.string().trim().min(2, "La fonction est requise.").max(140),
  bio: z.string().trim().max(1200),
  display_order: z.coerce.number().int().min(0).max(999),
});

const partnerSchema = z.object({
  name: z.string().trim().min(2, "Le nom du partenaire est requis.").max(160),
  category: z.string().trim().min(2, "La catégorie est requise.").max(120),
  description: z.string().trim().max(1200),
  website_url: optionalUrl,
  display_order: z.coerce.number().int().min(0).max(999),
});

const testimonialSchema = z.object({
  author_name: z.string().trim().min(2, "Le prénom ou le nom d’affichage est requis.").max(120),
  author_role: z.enum(["young", "parent", "professional", "partner"]),
  quote: z.string().trim().min(20, "Le témoignage doit contenir au moins 20 caractères.").max(1500),
  display_order: z.coerce.number().int().min(0).max(999),
});

function emptyToNull(value: string) {
  return value === "" ? null : value;
}

async function uploadSiteImage(client: ServerClient, file: FormDataEntryValue | null, folder: string, id: string) {
  if (!(file instanceof File) || file.size === 0) return { imageUrl: null as string | null, error: null as string | null };
  const extension = imageTypes.get(file.type);
  if (!extension) return { imageUrl: null, error: "Le visuel doit être au format JPG, PNG ou WebP." };
  if (file.size > 5 * 1024 * 1024) return { imageUrl: null, error: "Le visuel ne doit pas dépasser 5 Mo." };

  const path = `${folder}/${id}/${Date.now()}.${extension}`;
  const { error } = await client.storage.from("site-media").upload(path, file, {
    cacheControl: "3600",
    contentType: file.type,
    upsert: false,
  });
  if (error) return { imageUrl: null, error: `Envoi du visuel impossible : ${error.message}` };
  return { imageUrl: client.storage.from("site-media").getPublicUrl(path).data.publicUrl, error: null };
}

async function removeSiteImage(client: ServerClient, url: string | null) {
  const marker = "/site-media/";
  const path = url?.includes(marker) ? url.split(marker)[1] : null;
  if (path) await client.storage.from("site-media").remove([path]);
}

function revalidateTrustContent() {
  revalidatePath("/");
  revalidatePath("/notre-mission");
  revalidatePath("/partenaires");
  revalidatePath("/admin");
  revalidatePath("/admin/contenus");
}

export async function saveSitePresentation(
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const result = presentationSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) return { status: "error", message: result.error.issues[0]?.message ?? "Formulaire invalide." };
  const client = await createSupabaseServerClient();
  if (!client) return { status: "error", message: "Base de données indisponible." };

  const values = result.data;
  const { error } = await client.from("site_presentation").upsert({
    id: true,
    story_title: emptyToNull(values.story_title),
    story_body: emptyToNull(values.story_body),
    team_intro: emptyToNull(values.team_intro),
    minor_charter_title: emptyToNull(values.minor_charter_title),
    minor_charter_body: emptyToNull(values.minor_charter_body),
    minor_charter_published: formData.get("minor_charter_published") === "on",
    updated_by: admin.id,
  });
  if (error) return { status: "error", message: `Enregistrement impossible : ${error.message}` };
  revalidateTrustContent();
  return { status: "success", message: "La présentation de l’association est enregistrée." };
}

export async function saveTeamMember(id: string | null, _previousState: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const result = teamSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) return { status: "error", message: result.error.issues[0]?.message ?? "Formulaire invalide." };
  const client = await createSupabaseServerClient();
  if (!client) return { status: "error", message: "Base de données indisponible." };
  const recordId = id ?? randomUUID();
  const { data: current } = id ? await client.from("team_members").select("image_url").eq("id", id).maybeSingle() : { data: null };
  const upload = await uploadSiteImage(client, formData.get("image"), "team", recordId);
  if (upload.error) return { status: "error", message: upload.error };
  const { error } = await client.from("team_members").upsert({ id: recordId, ...result.data, bio: emptyToNull(result.data.bio), image_url: upload.imageUrl ?? current?.image_url ?? null, published: formData.get("published") === "on", updated_by: admin.id });
  if (error) return { status: "error", message: `Enregistrement impossible : ${error.message}` };
  if (upload.imageUrl && current?.image_url) await removeSiteImage(client, current.image_url);
  revalidateTrustContent();
  return { status: "success", message: id ? "Le membre est mis à jour." : "Le membre est ajouté à l’équipe." };
}

export async function savePartner(id: string | null, _previousState: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const result = partnerSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) return { status: "error", message: result.error.issues[0]?.message ?? "Formulaire invalide." };
  const client = await createSupabaseServerClient();
  if (!client) return { status: "error", message: "Base de données indisponible." };
  const recordId = id ?? randomUUID();
  const { data: current } = id ? await client.from("confirmed_partners").select("logo_url").eq("id", id).maybeSingle() : { data: null };
  const upload = await uploadSiteImage(client, formData.get("image"), "partners", recordId);
  if (upload.error) return { status: "error", message: upload.error };
  const { error } = await client.from("confirmed_partners").upsert({ id: recordId, ...result.data, description: emptyToNull(result.data.description), website_url: emptyToNull(result.data.website_url), logo_url: upload.imageUrl ?? current?.logo_url ?? null, published: formData.get("published") === "on", updated_by: admin.id });
  if (error) return { status: "error", message: `Enregistrement impossible : ${error.message}` };
  if (upload.imageUrl && current?.logo_url) await removeSiteImage(client, current.logo_url);
  revalidateTrustContent();
  return { status: "success", message: id ? "Le partenaire est mis à jour." : "Le partenaire est ajouté." };
}

export async function saveTestimonial(id: string | null, _previousState: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const result = testimonialSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) return { status: "error", message: result.error.issues[0]?.message ?? "Formulaire invalide." };
  const client = await createSupabaseServerClient();
  if (!client) return { status: "error", message: "Base de données indisponible." };
  const recordId = id ?? randomUUID();
  const { data: current } = id ? await client.from("testimonials").select("image_url").eq("id", id).maybeSingle() : { data: null };
  const upload = await uploadSiteImage(client, formData.get("image"), "testimonials", recordId);
  if (upload.error) return { status: "error", message: upload.error };
  const { error } = await client.from("testimonials").upsert({ id: recordId, ...result.data, image_url: upload.imageUrl ?? current?.image_url ?? null, published: formData.get("published") === "on", updated_by: admin.id });
  if (error) return { status: "error", message: `Enregistrement impossible : ${error.message}` };
  if (upload.imageUrl && current?.image_url) await removeSiteImage(client, current.image_url);
  revalidateTrustContent();
  return { status: "success", message: id ? "Le témoignage est mis à jour." : "Le témoignage est ajouté." };
}

const contentTables = {
  team: { table: "team_members", imageColumn: "image_url" },
  partner: { table: "confirmed_partners", imageColumn: "logo_url" },
  testimonial: { table: "testimonials", imageColumn: "image_url" },
} as const;

export async function deleteContentEntry(kind: keyof typeof contentTables, id: string, _previousState: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdmin();
  if (formData.get("confirmation") !== "SUPPRIMER") return { status: "error", message: "Saisissez SUPPRIMER pour confirmer." };
  const client = await createSupabaseServerClient();
  if (!client) return { status: "error", message: "Base de données indisponible." };
  const config = contentTables[kind];
  const { data } = await client.from(config.table).select(config.imageColumn).eq("id", id).maybeSingle();
  const { error } = await client.from(config.table).delete().eq("id", id);
  if (error) return { status: "error", message: `Suppression impossible : ${error.message}` };
  const imageUrl = (data as Record<string, unknown> | null)?.[config.imageColumn];
  await removeSiteImage(client, typeof imageUrl === "string" ? imageUrl : null);
  revalidateTrustContent();
  return { status: "success", message: "L’élément a été supprimé." };
}

const requestStatusSchema = z.object({
  status: z.enum(["new", "in_progress", "replied", "closed"]),
  admin_notes: z.string().trim().max(3000),
});

export async function saveContactRequest(id: string, _previousState: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const result = requestStatusSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) return { status: "error", message: result.error.issues[0]?.message ?? "Formulaire invalide." };
  const client = await createSupabaseServerClient();
  if (!client) return { status: "error", message: "Base de données indisponible." };
  const { error } = await client.from("contact_requests").update({ ...result.data, admin_notes: emptyToNull(result.data.admin_notes), updated_by: admin.id }).eq("id", id);
  if (error) return { status: "error", message: `Enregistrement impossible : ${error.message}` };
  revalidatePath("/admin/demandes");
  return { status: "success", message: "Le suivi de la demande est enregistré." };
}
