/**
 * Unified site URL helper for metadata, sitemaps, emails, callbacks, and redirects.
 * Prioritizes NEXT_PUBLIC_APP_URL, then NEXT_PUBLIC_SITE_URL, with a safe production fallback.
 */
export function siteUrl(path = ""): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://xyzpedia.my.id");

  const cleanBase = base.replace(/\/+$/, "");
  if (!path) return cleanBase;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}
