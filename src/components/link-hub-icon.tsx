import type { LinkHubIconName } from "@/lib/cms-types";

export function LinkHubIcon({ name }: { name: LinkHubIconName }) {
  if (name === "calendar") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4.5h14a2 2 0 0 1 2 2V20H3V6.5a2 2 0 0 1 2-2Z" /><path d="M7 2v5M17 2v5M3 9h18" /></svg>;
  }
  if (name === "users") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3" /><path d="M3.5 19c.4-4 2.1-6 5.5-6s5.1 2 5.5 6M16 5.5a3 3 0 0 1 0 5.8M16.5 13c2.5.3 3.8 2.3 4 6" /></svg>;
  }
  if (name === "briefcase") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V4h8v3M3 12h18M10 12v2h4v-2" /></svg>;
  }
  if (name === "heart") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 5.8a5.2 5.2 0 0 0-7.4 0L12 7.2l-1.4-1.4a5.2 5.2 0 1 0-7.4 7.4L12 22l8.8-8.8a5.2 5.2 0 0 0 0-7.4Z" /></svg>;
  }
  if (name === "gallery") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8" cy="9" r="1.5" /><path d="m5 18 5-5 3 3 2-2 4 4" /></svg>;
  }
  if (name === "globe") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></svg>;
  }
  if (name === "spark") {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" /><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" /></svg>;
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.2" /><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.2-1.2" /></svg>;
}
