export type SocialNetwork = "instagram" | "tiktok" | "facebook" | "linkedin";

export function SocialIcon({ network }: { network: SocialNetwork }) {
  if (network === "instagram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" className="social-icon-fill" />
      </svg>
    );
  }

  if (network === "tiktok") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15 3v10.2a4.7 4.7 0 1 1-4-4.65" />
        <path d="M15 3c.45 2.7 2.1 4.2 4.5 4.5" />
      </svg>
    );
  }

  if (network === "facebook") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path className="social-icon-fill" d="M13.7 21v-8h2.8l.42-3H13.7V8.08c0-.87.24-1.46 1.5-1.46H17V3.94c-.31-.04-1.39-.13-2.64-.13-2.61 0-4.4 1.59-4.4 4.52V10H7v3h2.96v8h3.74Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle className="social-icon-fill" cx="6.5" cy="6.5" r="1.8" />
      <path className="social-icon-fill" d="M5 9.5h3V19H5zM10 9.5h2.85v1.3c.78-1.03 1.83-1.68 3.42-1.68 2.89 0 3.73 1.9 3.73 4.37V19h-3v-4.86c0-1.16-.02-2.65-1.62-2.65-1.62 0-1.87 1.26-1.87 2.57V19H10V9.5Z" />
    </svg>
  );
}
