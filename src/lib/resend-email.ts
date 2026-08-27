import "server-only";

export type ResendEmail = {
  to: string;
  replyTo: string;
  subject: string;
  html: string;
  text: string;
  tags: Array<{ name: string; value: string }>;
  idempotencyKey: string;
};

export type ResendResult = {
  ok: boolean;
  providerId?: string;
  reason?: "missing_config" | "provider_error" | "network_error";
};

export function hasResendConfiguration() {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.RESEND_FROM_EMAIL?.trim());
}

export async function sendResendEmail(email: ResendEmail): Promise<ResendResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();

  if (!apiKey || !from) return { ok: false, reason: "missing_config" };

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": email.idempotencyKey,
      },
      body: JSON.stringify({
        from,
        to: email.to,
        reply_to: email.replyTo,
        subject: email.subject.replace(/[\r\n]+/g, " ").trim(),
        html: email.html,
        text: email.text,
        tags: email.tags,
      }),
      cache: "no-store",
    });
    const result = await response.json().catch(() => null) as { id?: string } | null;

    if (!response.ok) return { ok: false, reason: "provider_error" };
    return { ok: true, providerId: result?.id };
  } catch {
    return { ok: false, reason: "network_error" };
  }
}
