import "server-only";

import { cache } from "react";
import { defaultAssociationSettings, defaultEvent, defaultProgram } from "@/data/cms-defaults";
import { legalPageDefaults } from "@/data/legal-page-defaults";
import { defaultSitePresentation } from "@/data/trust-content-defaults";
import { defaultLinkHubLinks } from "@/data/link-hub-defaults";
import type {
  AssociationSettings,
  ConfirmedPartner,
  ContactRequestRecord,
  EventRecord,
  GalleryAlbum,
  GalleryAlbumEvent,
  GalleryMedia,
  LegalPageRecord,
  LegalPageSection,
  LegalPageSlug,
  LinkHubLink,
  ProgramItem,
  SitePresentation,
  TeamMember,
  Testimonial,
} from "@/lib/cms-types";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getPublishedEvents(): Promise<EventRecord[]> {
  if (!isSupabaseConfigured()) return [defaultEvent];

  const supabase = await createSupabaseServerClient();
  if (!supabase) return [defaultEvent];

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("publication_status", "published")
    .order("starts_at", { ascending: true });

  if (error) {
    console.error("Impossible de charger les événements publiés", error.message);
    return [defaultEvent];
  }

  return (data ?? []).map(normalizeEventRecord);
}

export async function getNextPublishedEvent() {
  const events = await getPublishedEvents();
  return pickNextEvent(events);
}

export async function getUpcomingPublishedEvent() {
  const events = await getPublishedEvents();
  const now = Date.now();
  return events.find((event) => new Date(event.starts_at).getTime() >= now) ?? null;
}

export const getPublishedEventBySlug = cache(async function getPublishedEventBySlug(slug: string): Promise<EventRecord | null> {
  if (!isSupabaseConfigured()) return defaultEvent.slug === slug ? defaultEvent : null;

  const supabase = await createSupabaseServerClient();
  if (!supabase) return defaultEvent.slug === slug ? defaultEvent : null;

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .eq("publication_status", "published")
    .maybeSingle();

  if (error) {
    console.error(`Impossible de charger l’événement ${slug}`, error.message);
    return null;
  }

  return data ? normalizeEventRecord(data) : null;
});

export function pickNextEvent(events: EventRecord[]) {
  const now = Date.now();
  return events.find((event) => new Date(event.starts_at).getTime() >= now) ?? events.at(-1) ?? null;
}

export async function getAllEventsForAdmin(): Promise<EventRecord[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("starts_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(normalizeEventRecord);
}

export async function getEventForAdmin(id: string): Promise<EventRecord | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase.from("events").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? normalizeEventRecord(data) : null;
}

function normalizeProgram(program: unknown): ProgramItem[] {
  if (!Array.isArray(program)) return [];

  return program.slice(0, 4).flatMap((item, index) => {
    if (typeof item === "string") {
      const title = item.trim();
      return title
        ? [{ title, description: defaultProgram[index]?.description ?? "" }]
        : [];
    }

    if (!item || typeof item !== "object") return [];
    const title = "title" in item && typeof item.title === "string" ? item.title.trim() : "";
    const description =
      "description" in item && typeof item.description === "string"
        ? item.description.trim()
        : "";
    return title ? [{ title, description }] : [];
  });
}

function normalizeEventRecord(record: Record<string, unknown>): EventRecord {
  return {
    ...record,
    program: normalizeProgram(record.program),
  } as EventRecord;
}

type GalleryAlbumRow = Omit<GalleryAlbum, "event" | "media"> & {
  events: GalleryAlbumEvent | GalleryAlbumEvent[] | null;
};

function normalizeGalleryAlbum(row: GalleryAlbumRow, media: GalleryMedia[]): GalleryAlbum {
  const event = Array.isArray(row.events) ? row.events[0] ?? null : row.events;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    event_id: row.event_id,
    published: row.published,
    display_order: row.display_order,
    created_at: row.created_at,
    updated_at: row.updated_at,
    event,
    media: media.filter((item) => item.album_id === row.id),
  };
}

async function getGalleryAlbums(publishedOnly: boolean): Promise<GalleryAlbum[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  let albumsQuery = supabase
    .from("gallery_albums")
    .select("*, events(id, slug, title, starts_at)")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
  let mediaQuery = supabase
    .from("gallery_media")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (publishedOnly) {
    albumsQuery = albumsQuery.eq("published", true);
    mediaQuery = mediaQuery.eq("published", true).eq("consent_confirmed", true);
  }

  const [{ data: albumRows, error: albumError }, { data: mediaRows, error: mediaError }] =
    await Promise.all([albumsQuery, mediaQuery]);

  if (albumError || mediaError) {
    const message = albumError?.message ?? mediaError?.message ?? "Erreur inconnue";
    if (publishedOnly) {
      console.error("Impossible de charger la galerie", message);
      return [];
    }
    throw new Error(message);
  }

  const media = (mediaRows ?? []) as GalleryMedia[];
  return ((albumRows ?? []) as GalleryAlbumRow[]).map((row) => normalizeGalleryAlbum(row, media));
}

export function getPublishedGalleryAlbums() {
  return getGalleryAlbums(true);
}

export function getGalleryAlbumsForAdmin() {
  return getGalleryAlbums(false);
}

export const getPublishedGalleryAlbumBySlug = cache(async function getPublishedGalleryAlbumBySlug(slug: string): Promise<GalleryAlbum | null> {
  const albums = await getPublishedGalleryAlbums();
  return albums.find((album) => album.slug === slug) ?? null;
});

export async function getGalleryAlbumForAdmin(id: string): Promise<GalleryAlbum | null> {
  const albums = await getGalleryAlbumsForAdmin();
  return albums.find((album) => album.id === id) ?? null;
}

export async function getAssociationSettings(): Promise<AssociationSettings> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return defaultAssociationSettings;

  const { data, error } = await supabase
    .from("association_settings")
    .select(
      "legal_name, association_status, public_email, phone, whatsapp, address, postal_code, city, rna_number, instagram_url, tiktok_url, facebook_url, linkedin_url, website_url",
    )
    .eq("id", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as AssociationSettings | null) ?? defaultAssociationSettings;
}

export const getAssociationSettingsForAdmin = getAssociationSettings;

export async function getPublishedLinkHubLinks(): Promise<LinkHubLink[]> {
  if (!isSupabaseConfigured()) return defaultLinkHubLinks;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return defaultLinkHubLinks;

  const { data, error } = await supabase
    .from("link_hub_links")
    .select("*")
    .eq("published", true)
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Impossible de charger la page de liens", error.message);
    return defaultLinkHubLinks;
  }

  return (data ?? []) as LinkHubLink[];
}

export async function getLinkHubLinksForAdmin(): Promise<LinkHubLink[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("link_hub_links")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as LinkHubLink[];
}

function normalizeLegalSections(value: unknown, fallback: LegalPageSection[]) {
  if (!Array.isArray(value)) return fallback;

  const sections = value.flatMap((section, index) => {
    if (!section || typeof section !== "object") return [];
    const defaultSection = fallback[index];
    const id = defaultSection?.id ?? `section-${index + 1}`;
    const title =
      "title" in section && typeof section.title === "string" ? section.title.trim() : "";
    const body = "body" in section && typeof section.body === "string" ? section.body.trim() : "";
    const note = "note" in section && typeof section.note === "string" ? section.note.trim() : "";
    return title && body ? [{ id, title, body, note }] : [];
  });

  return sections.length ? sections : fallback;
}

function normalizeLegalPage(value: Record<string, unknown>, slug: LegalPageSlug): LegalPageRecord {
  const fallback = legalPageDefaults[slug];
  const summaryItems = Array.isArray(value.summary_items)
    ? value.summary_items.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : fallback.summary_items;

  return {
    slug,
    eyebrow: typeof value.eyebrow === "string" && value.eyebrow.trim() ? value.eyebrow : fallback.eyebrow,
    title: typeof value.title === "string" && value.title.trim() ? value.title : fallback.title,
    description:
      typeof value.description === "string" && value.description.trim()
        ? value.description
        : fallback.description,
    summary_title:
      typeof value.summary_title === "string" ? value.summary_title.trim() || null : fallback.summary_title,
    summary_items: summaryItems,
    sections: normalizeLegalSections(value.sections, fallback.sections),
    updated_at: typeof value.updated_at === "string" ? value.updated_at : fallback.updated_at,
  };
}

export async function getLegalPage(slug: LegalPageSlug): Promise<LegalPageRecord> {
  if (!isSupabaseConfigured()) return legalPageDefaults[slug];

  const supabase = await createSupabaseServerClient();
  if (!supabase) return legalPageDefaults[slug];

  const { data, error } = await supabase.from("legal_pages").select("*").eq("slug", slug).maybeSingle();
  if (error) {
    console.error(`Impossible de charger la page juridique ${slug}`, error.message);
    return legalPageDefaults[slug];
  }

  return data ? normalizeLegalPage(data, slug) : legalPageDefaults[slug];
}

export async function getAllLegalPagesForAdmin() {
  return Promise.all([
    getLegalPage("mentions-legales"),
    getLegalPage("politique-confidentialite"),
  ]);
}

export const getLegalPageForAdmin = getLegalPage;

export function formatLegalUpdatedAt(value: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeZone: "America/Martinique",
  }).format(new Date(value));
}

export async function getSitePresentation(): Promise<SitePresentation> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return defaultSitePresentation;

  const { data, error } = await supabase
    .from("site_presentation")
    .select("story_title, story_body, team_intro, minor_charter_title, minor_charter_body, minor_charter_published")
    .eq("id", true)
    .maybeSingle();

  if (error) {
    console.error("Impossible de charger la présentation de l’association", error.message);
    return defaultSitePresentation;
  }
  return (data as SitePresentation | null) ?? defaultSitePresentation;
}

export const getSitePresentationForAdmin = getSitePresentation;

export async function getPublishedTeamMembers(): Promise<TeamMember[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("team_members").select("*").eq("published", true).order("display_order");
  if (error) {
    console.error("Impossible de charger l’équipe", error.message);
    return [];
  }
  return (data ?? []) as TeamMember[];
}

export async function getTeamMembersForAdmin(): Promise<TeamMember[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("team_members").select("*").order("display_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as TeamMember[];
}

export async function getPublishedPartners(): Promise<ConfirmedPartner[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("confirmed_partners").select("*").eq("published", true).order("display_order");
  if (error) {
    console.error("Impossible de charger les partenaires confirmés", error.message);
    return [];
  }
  return (data ?? []) as ConfirmedPartner[];
}

export async function getPartnersForAdmin(): Promise<ConfirmedPartner[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("confirmed_partners").select("*").order("display_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as ConfirmedPartner[];
}

export async function getPublishedTestimonials(): Promise<Testimonial[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("testimonials").select("*").eq("published", true).order("display_order");
  if (error) {
    console.error("Impossible de charger les témoignages", error.message);
    return [];
  }
  return (data ?? []) as Testimonial[];
}

export async function getTestimonialsForAdmin(): Promise<Testimonial[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("testimonials").select("*").order("display_order");
  if (error) throw new Error(error.message);
  return (data ?? []) as Testimonial[];
}

export async function getContactRequestsForAdmin(): Promise<ContactRequestRecord[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("contact_requests").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as ContactRequestRecord[];
}

export function formatEventDate(date: string) {
  const value = new Date(date);
  return {
    day: new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      timeZone: "America/Martinique",
    }).format(value),
    month: new Intl.DateTimeFormat("fr-FR", {
      month: "short",
      timeZone: "America/Martinique",
    })
      .format(value)
      .replace(".", "")
      .toUpperCase(),
    year: new Intl.DateTimeFormat("fr-FR", {
      year: "numeric",
      timeZone: "America/Martinique",
    }).format(value),
    long: new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "long",
      timeStyle: "short",
      timeZone: "America/Martinique",
    }).format(value),
  };
}
