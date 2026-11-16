import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/pulsa",
        destination: "/pulsa-ewallet",
        permanent: true,
      },
      {
        source: "/ewallet",
        destination: "/pulsa-ewallet",
        permanent: true,
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
