const MARTINIQUE_COUNTRY_CODE = "596";

function normalizeWhatsAppNumber(phone: string) {
  const trimmedPhone = phone.trim();
  const digits = trimmedPhone.replace(/\D/g, "");

  if (!digits) return null;
  if (trimmedPhone.startsWith("+")) return digits;
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith(MARTINIQUE_COUNTRY_CODE)) return digits;
  if (digits.length === 10 && digits.startsWith("0")) {
    return `${MARTINIQUE_COUNTRY_CODE}${digits.slice(1)}`;
  }

  return digits;
}

export function buildWhatsAppUrl(phone: string | null, message: string | null) {
  if (!phone) return null;

  const number = normalizeWhatsAppNumber(phone);
  if (!number) return null;

  const text = message?.trim();
  return `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}
