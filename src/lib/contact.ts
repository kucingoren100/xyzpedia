/**
 * Centralized Contact & Brand Helpers for XYZPEDIA
 * Ensures consistent WhatsApp number, URLs, and support email across all components.
 */

export const OFFICIAL_WA_RAW =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/[^0-9]/g, "") || "6289517367660";

export const OFFICIAL_WA_FORMATTED = "+62 895-1736-7660";

export const OFFICIAL_SUPPORT_EMAIL = "support@xyzpedia.my.id";

export function getWhatsAppUrl(customText?: string): string {
  const text = customText || "Halo Admin XYZPEDIA, saya butuh bantuan terkait transaksi";
  return `https://wa.me/${OFFICIAL_WA_RAW}?text=${encodeURIComponent(text)}`;
}
