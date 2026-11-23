/**
 * Unified site URL helper for metadata, sitemaps, emails, callbacks, and redirects.
 * Prioritizes NEXT_PUBLIC_APP_URL, then NEXT_PUBLIC_SITE_URL, with a safe production fallback.
 */
export function siteUrl(path = ""): string {
  let base =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://www.xyzpedia.my.id");

  // Vercel production enforces canonical redirect to www.xyzpedia.my.id (HTTP 308 on non-www).
  // Ensure webhook callbacks and redirects use the canonical domain so POST requests are never redirected.
  if (base.includes("xyzpedia.my.id") && !base.includes("www.xyzpedia.my.id")) {
    base = base.replace("xyzpedia.my.id", "www.xyzpedia.my.id");
  }

  const cleanBase = base.replace(/\/+$/, "");
  if (!path) return cleanBase;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}
