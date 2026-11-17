/**
 * Helper to fetch in-game nickname for popular games (Mobile Legends, Free Fire, etc.)
 * Fallback when supplier API hasn't delivered SN yet or for pre-order verification.
 */
export async function fetchGameNickname(
  userId: string,
  zoneId?: string | null,
  gameSlug?: string
): Promise<string | null> {
  if (!userId) return null;

  const slug = (gameSlug || "").toLowerCase();

  // 1. Mobile Legends & Magic Chess
  if (slug.includes("mobile-legends") || slug.includes("magic-chess") || slug.includes("mlbb")) {
    if (!zoneId) return null;
    try {
      const res = await fetch(
        `https://api.isan.eu.org/nickname/ml?id=${encodeURIComponent(userId)}&zone=${encodeURIComponent(zoneId)}`,
        {
          headers: { "User-Agent": "XYZPEDIA-DirectFulfillment/1.0" },
          next: { revalidate: 3600 },
        }
      );
      const data = await res.json().catch(() => null);
      if (data && data.success && data.name) {
        return String(data.name).trim();
      }
    } catch (e) {
      // Silent error fallback
    }
  }

  // 2. Free Fire
  if (slug.includes("free-fire") || slug.includes("ff")) {
    try {
      const res = await fetch(
        `https://api.isan.eu.org/nickname/ff?id=${encodeURIComponent(userId)}`,
        {
          headers: { "User-Agent": "XYZPEDIA-DirectFulfillment/1.0" },
          next: { revalidate: 3600 },
        }
      );
      const data = await res.json().catch(() => null);
      if (data && data.success && data.name) {
        return String(data.name).trim();
      }
    } catch (e) {
      // Silent error fallback
    }
  }

  return null;
}
