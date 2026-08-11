import "server-only";

import { defaultAssociationSettings, defaultEvent } from "@/data/cms-defaults";
import type { AssociationSettings, EventRecord } from "@/lib/cms-types";
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

  return (data ?? []) as EventRecord[];
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
  return (data ?? []) as EventRecord[];
}

export async function getEventForAdmin(id: string): Promise<EventRecord | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase.from("events").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data as EventRecord | null;
}

export async function getAssociationSettings(): Promise<AssociationSettings> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return defaultAssociationSettings;

  const { data, error } = await supabase
    .from("association_settings")
    .select(
      "legal_name, public_email, phone, whatsapp, address, postal_code, city, rna_number, instagram_url, tiktok_url, website_url",
    )
    .eq("id", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as AssociationSettings | null) ?? defaultAssociationSettings;
}

export const getAssociationSettingsForAdmin = getAssociationSettings;

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
