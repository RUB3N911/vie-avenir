"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import type { AdminActionState } from "@/lib/admin-action-state";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const albumSchema = z.object({
  title: z.string().trim().min(3, "Le titre doit contenir au moins 3 caractères.").max(160),
  description: z.string().trim().max(2000),
  event_id: z.union([z.literal(""), z.uuid("L’événement associé est invalide.")]),
  display_order: z.coerce.number().int().min(0).max(999),
});

const mediaSchema = z.object({
  title: z.string().trim().max(160),
  caption: z.string().trim().max(1000),
  alt_text: z.string().trim().max(240),
  display_order: z.coerce.number().int().min(0).max(999),
});

function emptyToNull(value: string) {
  return value === "" ? null : value;
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

function revalidateGallery(albumSlug?: string) {
  revalidatePath("/galerie");
  if (albumSlug) revalidatePath(`/galerie/${albumSlug}`);
  revalidatePath("/admin");
  revalidatePath("/admin/galerie");
}

export async function saveGalleryAlbum(
  albumId: string | null,
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const result = albumSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) return { status: "error", message: result.error.issues[0]?.message ?? "Formulaire invalide." };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: "Base de données indisponible." };

  const id = albumId ?? randomUUID();
  let slug = "";
  if (albumId) {
    const { data } = await supabase.from("gallery_albums").select("slug").eq("id", albumId).maybeSingle();
    if (!data) return { status: "error", message: "Cet album n’existe plus." };
    slug = data.slug;
  } else {
    const base = slugify(result.data.title) || "album";
    const { data } = await supabase.from("gallery_albums").select("slug").like("slug", `${base}%`);
    const existing = new Set((data ?? []).map((item) => item.slug));
    slug = base;
    let suffix = 2;
    while (existing.has(slug)) slug = `${base}-${suffix++}`;
  }

  const { error } = await supabase.from("gallery_albums").upsert({
    id,
    slug,
    title: result.data.title,
    description: emptyToNull(result.data.description),
    event_id: emptyToNull(result.data.event_id),
    display_order: result.data.display_order,
    published: formData.get("published") === "on",
    updated_by: admin.id,
  });

  if (error) return { status: "error", message: `Enregistrement impossible : ${error.message}` };
  revalidateGallery(slug);
  if (!albumId) redirect(`/admin/galerie/${id}?cree=1`);
  return { status: "success", message: "Les informations de l’album sont enregistrées." };
}

export async function saveGalleryMedia(
  mediaId: string,
  albumSlug: string,
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const result = mediaSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) return { status: "error", message: result.error.issues[0]?.message ?? "Formulaire invalide." };

  const published = formData.get("published") === "on";
  const consentConfirmed = formData.get("consent_confirmed") === "on";
  if (published && !consentConfirmed) {
    return { status: "error", message: "Confirmez l’autorisation de diffusion avant de publier ce média." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: "Base de données indisponible." };
  const { data: media } = await supabase.from("gallery_media").select("album_id").eq("id", mediaId).maybeSingle();
  if (!media) return { status: "error", message: "Ce média n’existe plus." };

  const isCover = formData.get("is_cover") === "on";
  if (isCover) {
    const { error: coverError } = await supabase
      .from("gallery_media")
      .update({ is_cover: false, updated_by: admin.id })
      .eq("album_id", media.album_id)
      .eq("is_cover", true);
    if (coverError) return { status: "error", message: `Mise à jour de la couverture impossible : ${coverError.message}` };
  }

  const { error } = await supabase.from("gallery_media").update({
    title: emptyToNull(result.data.title),
    caption: emptyToNull(result.data.caption),
    alt_text: emptyToNull(result.data.alt_text),
    display_order: result.data.display_order,
    is_cover: isCover,
    published,
    consent_confirmed: consentConfirmed,
    updated_by: admin.id,
  }).eq("id", mediaId);

  if (error) return { status: "error", message: `Enregistrement impossible : ${error.message}` };
  revalidateGallery(albumSlug);
  return { status: "success", message: "Le média est mis à jour." };
}

export async function deleteGalleryMedia(
  mediaId: string,
  albumSlug: string,
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  if (formData.get("confirmation") !== "SUPPRIMER") return { status: "error", message: "Saisissez SUPPRIMER pour confirmer." };
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: "Base de données indisponible." };
  const { data } = await supabase.from("gallery_media").select("storage_path").eq("id", mediaId).maybeSingle();
  const { error } = await supabase.from("gallery_media").delete().eq("id", mediaId);
  if (error) return { status: "error", message: `Suppression impossible : ${error.message}` };
  if (data?.storage_path) await supabase.storage.from("gallery-media").remove([data.storage_path]);
  revalidateGallery(albumSlug);
  return { status: "success", message: "Le média a été supprimé." };
}

export async function deleteGalleryAlbum(
  albumId: string,
  _previousState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  if (formData.get("confirmation") !== "SUPPRIMER") return { status: "error", message: "Saisissez SUPPRIMER pour confirmer." };
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error", message: "Base de données indisponible." };
  const { data: media } = await supabase.from("gallery_media").select("storage_path").eq("album_id", albumId);
  const { error } = await supabase.from("gallery_albums").delete().eq("id", albumId);
  if (error) return { status: "error", message: `Suppression impossible : ${error.message}` };
  const paths = (media ?? []).map((item) => item.storage_path).filter(Boolean);
  if (paths.length) await supabase.storage.from("gallery-media").remove(paths);
  revalidateGallery();
  redirect("/admin/galerie?supprime=1");
}
