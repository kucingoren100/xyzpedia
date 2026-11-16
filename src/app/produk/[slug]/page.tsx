import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import ProductCustomizerClient from "@/components/ProductCustomizerClient";
import { ArrowLeft, Clock, ShieldCheck, Zap } from "lucide-react";
import { GameCurrencyIcon, getGameCurrencyMeta } from "@/components/GameCurrencyIcon";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!product) {
    return {
      title: "Produk Tidak Ditemukan — XYZPEDIA",
    };
  }

  const title = `Top Up ${product.name} Murah & Legal — XYZPEDIA`;
  const description =
    product.tagline ||
    product.description ||
    `Layanan resmi ${product.name} proses instan 24 jam nonstop via QRIS di XYZPEDIA.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: product.thumbnailUrl,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [product.thumbnailUrl],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      items: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6 space-y-6">
      {/* Back button */}
      <div className="flex items-center gap-3">
        <Link
          href="/katalog"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white ink-border rounded-full text-xs font-black shadow-[2px_2px_0px_0px_#000000] hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 stroke-[3]" />
          <span>Kembali ke Katalog</span>
        </Link>
        <span className="text-xs font-bold text-gray-500">
          Katalog / {product.category.name} / {product.name}
        </span>
      </div>

      {/* STITCH HEADER BAR (Exact from xyzpedia_game_top_up_direct_customizer_checkout) */}
      <div className="bg-white ink-border rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-[4px_4px_0px_0px_#000000]">
        {/* Background decorative stickers */}
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-[#e9ccff] ink-border rounded-full -rotate-6 pointer-events-none opacity-40" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start md:items-center gap-5">
            {/* Tilted Thumbnail (Unified 4:5 Aspect Ratio matching new 960x1200 assets) */}
            <div
              className="w-20 aspect-[4/5] md:w-24 rounded-2xl ink-border bg-[#5c4ade] flex-shrink-0 overflow-hidden relative rotate-[-2deg] shadow-[2px_2px_0px_0px_#000000]"
            >
              <img
                src={product.thumbnailUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.categorySlug === "akun-premium" ? (
                product.developer?.toLowerCase() === "manual" ? (
                  <div className="absolute bottom-0 inset-x-0 bg-[#4b5563] text-white text-[9px] text-center py-0.5 font-black uppercase flex items-center justify-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    <span>MANUAL</span>
                  </div>
                ) : (
                  <div className="absolute bottom-0 inset-x-0 bg-[#4338ca] text-white text-[9px] text-center py-0.5 font-black uppercase flex items-center justify-center gap-1">
                    <Zap className="w-2.5 h-2.5 fill-white" />
                    <span>INSTAN</span>
                  </div>
                )
              ) : (
                <div className="absolute bottom-0 inset-x-0 bg-carbon text-white text-[9px] text-center py-0.5 font-black uppercase">
                  {product.developer || "OFFICIAL"}
                </div>
              )}
            </div>

            {/* Product Meta */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="bg-[#ffd731] text-carbon font-black text-[10px] uppercase px-2 py-0.5 rounded ink-border">
                  {product.category.name}
                </span>
                <span className="bg-[#55db9c] text-carbon font-black text-[10px] uppercase px-2 py-0.5 rounded ink-border">
                  100% LEGAL & RESMI
                </span>
                {product.categorySlug === "akun-premium" && (
                  product.developer?.toLowerCase() === "manual" ? (
                    <span className="bg-[#4b5563] text-white font-black text-[10px] uppercase px-2 py-0.5 rounded ink-border flex items-center gap-1 shadow-[1px_1px_0px_#000]">
                      <Clock className="w-3 h-3" />
                      <span>PROSES MANUAL (VIA WHATSAPP)</span>
                    </span>
                  ) : (
                    <span className="bg-[#4338ca] text-white font-black text-[10px] uppercase px-2 py-0.5 rounded ink-border flex items-center gap-1 shadow-[1px_1px_0px_#000]">
                      <Zap className="w-3 h-3 fill-white" />
                      <span>KREDENSIAL INSTAN 24/7</span>
                    </span>
                  )
                )}
                {product.categorySlug === "game-topup" && (
                  <span className="bg-white text-carbon font-black text-[10px] uppercase px-2 py-0.5 rounded ink-border flex items-center gap-1 shadow-[1px_1px_0px_#000]">
                    <GameCurrencyIcon slugOrName={product.slug} className="w-3.5 h-3.5" />
                    <span>Mata Uang: {getGameCurrencyMeta(product.slug).label}</span>
                  </span>
                )}
              </div>
              <h1 className="font-[var(--font-bricolage)] text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-carbon">
                {product.name}
              </h1>
              <p className="text-xs font-semibold text-gray-600 max-w-lg mt-0.5">
                {product.tagline || product.description}
              </p>
            </div>
          </div>

          {/* Server Status Live Indicator Box (Stitch style) */}
          <div className="flex items-center gap-3 bg-[#e9e9e9] ink-border rounded-2xl p-3 self-start md:self-center rotate-1 shadow-[2px_2px_0px_0px_#000000]">
            <div className="w-3 h-3 rounded-full bg-[#55db9c] ink-border animate-pulse flex-shrink-0" />
            <div>
              <span className="text-[10px] uppercase font-black text-gray-500 block">Server Gateway</span>
              <span className="text-xs font-black text-carbon">ONLINE (0.8s avg)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Checkout Experience */}
      <ProductCustomizerClient product={product} />
    </div>
  );
}
