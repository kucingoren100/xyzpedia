import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://xyzpedia.my.id";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/katalog",
          "/produk/",
          "/pulsa-ewallet",
          "/bantuan",
          "/kebijakan",
          "/cek-transaksi",
        ],
        disallow: ["/admin/", "/api/"],
      },
      {
        userAgent: "Googlebot",
        allow: [
          "/",
          "/katalog",
          "/produk/",
          "/pulsa-ewallet",
          "/bantuan",
          "/kebijakan",
          "/cek-transaksi",
        ],
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
