import "server-only";

import { defaultAssociationSettings, defaultEvent, defaultProgram } from "@/data/cms-defaults";
import { legalPageDefaults } from "@/data/legal-page-defaults";
import { defaultSitePresentation } from "@/data/trust-content-defaults";
import type {
  AssociationSettings,
  ConfirmedPartner,
  ContactRequestRecord,
  EventRecord,
  LegalPageRecord,
  LegalPageSection,
  LegalPageSlug,
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

export function pickNextEvent(events: EventRecord[]) {
  const now = Date.now();
  return events.find((event) => new Date(event.starts_at).getTime() >= now) ?? events[0] ?? null;
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

export async function getAssociationSettings(): Promise<AssociationSettings> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return defaultAssociationSettings;

  const { data, error } = await supabase
    .from("association_settings")
    .select(
      "legal_name, association_status, public_email, phone, whatsapp, address, postal_code, city, rna_number, instagram_url, tiktok_url, website_url",
    )
    .eq("id", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as AssociationSettings | null) ?? defaultAssociationSettings;
}

export const getAssociationSettingsForAdmin = getAssociationSettings;

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
