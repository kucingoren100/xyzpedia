/**
 * Centralized Contact & Brand Helpers for XYZPEDIA
 * Ensures consistent WhatsApp number, URLs, and support email across all components.
 * Automatically respects environment variables configured in Vercel (.env).
 */

export const OFFICIAL_WA_RAW =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/[^0-9]/g, "") || "6289517367660";

export function formatWaNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("62")) {
    const rest = digits.slice(2);
    if (rest.length >= 10) {
      return `+62 ${rest.slice(0, 3)}-${rest.slice(3, 7)}-${rest.slice(7)}`;
    }
    if (rest.length >= 7) {
      return `+62 ${rest.slice(0, 3)}-${rest.slice(3)}`;
    }
    return `+62 ${rest}`;
  }
  if (digits.startsWith("08")) {
    const rest = digits.slice(2);
    return `+62 8${rest.slice(0, 2)}-${rest.slice(2, 6)}-${rest.slice(6)}`;
  }
  return raw.startsWith("+") ? raw : `+${raw}`;
}

export const OFFICIAL_WA_FORMATTED = formatWaNumber(OFFICIAL_WA_RAW);

export const OFFICIAL_SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@xyzpedia.my.id";

export function getWhatsAppUrl(customText?: string): string {
  const text = customText || "Halo Admin XYZPEDIA, saya butuh bantuan terkait transaksi";
  return `https://wa.me/${OFFICIAL_WA_RAW}?text=${encodeURIComponent(text)}`;
}
