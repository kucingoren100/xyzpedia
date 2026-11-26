"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Rocket,
  Gamepad2,
  Tv,
  Ticket,
  QrCode,
  Flame,
  Sparkles,
  Star,
} from "lucide-react";

interface SlideData {
  id: string;
  tabLabel: string;
  tabDotColor: string;
  bgWash: string;
  bubbleColors: [string, string];
  badges: {
    text: string;
    bg: string;
    textCol: string;
    tilt: string;
  }[];
  headlineFirst: string;
  headlineHighlight: string;
  headlineHighlightCol: string;
  subtext: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  metric: string;
  card: {
    bg: string;
    rotation: string;
    topLabel: string;
    topBadge: string;
    float1: { text: string; bg: string; textCol: string; tilt: string };
    float2: { text: string; bg: string; textCol: string; tilt: string };
    float3: { text: string; bg: string; textCol: string; tilt: string };
    centerIcon: "rocket" | "gamepad" | "streaming" | "voucher";
    centerTitle: string;
    centerSubtitle: string;
    bottomText: string;
    bottomTag: string;
    overlayBadge: { text: string; bg: string; textCol: string; tilt: string };
  };
}

const SLIDES: SlideData[] = [
  {
    id: "01",
    tabLabel: "01 Promo Utama",
    tabDotColor: "bg-[#fb4903]",
    bgWash: "bg-[#dceeff]", // Sky Wash
    bubbleColors: ["bg-[#e9ccff]", "bg-[#55db9c]"],
    badges: [
      {
        text: "★ Injeksi Instan",
        bg: "bg-[#ffd731]",
        textCol: "text-black",
        tilt: "-rotate-2",
      },
      {
        text: "✓ 0.4s Moonton & Riot API",
        bg: "bg-[#55db9c]",
        textCol: "text-black",
        tilt: "rotate-1",
      },
      {
        text: "⚡ QRIS 0% Biaya Admin",
        bg: "bg-white",
        textCol: "text-carbon dark:text-white",
        tilt: "rotate-0",
      },
    ],
    headlineFirst: "PUSAT TOP UP & AKUN, ",
    headlineHighlight: "SERBA INSTAN.",
    headlineHighlightCol: "text-[#fb4903]",
    subtext:
      "Layanan Game Top Up dan akun langganan premium otomatis terkirim dalam 5 detik. Checkout langsung tanpa password, tanpa registrasi, 100% jalur resmi API publisher.",
    primaryCta: { label: "Jelajahi Katalog", href: "/katalog" },
    secondaryCta: { label: "Lacak Pesanan", href: "/cek-transaksi" },
    metric: "Dinilai 4.9/5 oleh 500.000+ gamers & pembeli puas di Indonesia",
    card: {
      bg: "bg-[#4da2ff]", // Electric Blue
      rotation: "rotate-1",
      topLabel: "API Moonton & Riot Aktif",
      topBadge: "0.4s Rata-rata",
      float1: {
        text: "💎 TANPA LOGIN",
        bg: "bg-[#ffd731]",
        textCol: "text-black",
        tilt: "-rotate-6",
      },
      float2: {
        text: "⚡ SISTEM OTOMATIS",
        bg: "bg-[#5c4ade]",
        textCol: "text-white",
        tilt: "rotate-6",
      },
      float3: {
        text: "DISKON 40%",
        bg: "bg-[#fb4903]",
        textCol: "text-white",
        tilt: "-rotate-12",
      },
      centerIcon: "rocket",
      centerTitle: "INJEKSI API OTOMATIS",
      centerSubtitle: "Pengiriman Instan Tanpa Perlu Login",
      bottomText: "PEMBAYARAN QRIS OTOMATIS",
      bottomTag: "Aktif 24 Jam",
      overlayBadge: {
        text: "Garansi Penuh 30 Hari",
        bg: "bg-[#e9ccff]",
        textCol: "text-black",
        tilt: "rotate-3",
      },
    },
  },
  {
    id: "02",
    tabLabel: "02 Game Top-Up",
    tabDotColor: "bg-[#ffd731]",
    bgWash: "bg-[#fff6d6]", // Warm Sunburst Wash
    bubbleColors: ["bg-[#4da2ff]", "bg-[#ffd731]"],
    badges: [
      {
        text: "🎮 Injeksi Akun Game Resmi",
        bg: "bg-[#fb4903]",
        textCol: "text-white",
        tilt: "-rotate-1",
      },
      {
        text: "⚡ Di Bawah 3 Detik",
        bg: "bg-[#55db9c]",
        textCol: "text-black",
        tilt: "rotate-2",
      },
      {
        text: "💎 100% Legal & Aman",
        bg: "bg-white",
        textCol: "text-carbon dark:text-white",
        tilt: "rotate-0",
      },
    ],
    headlineFirst: "TOP UP DIAMOND & VP, ",
    headlineHighlight: "AUTO INJEKSI.",
    headlineHighlightCol: "text-[#5c4ade]",
    subtext:
      "Game Top Up Mobile Legends, Free Fire, PUBG Mobile, & Honor of Kings via ID & Server Zone. Terkoneksi otomatis dengan API publisher resmi 24 jam nonstop.",
    primaryCta: { label: "Top Up Game Sekarang", href: "/katalog?cat=game-topup" },
    secondaryCta: { label: "Lacak Pesanan ID", href: "/cek-transaksi" },
    metric: "99.98% transaksi top up diamond berhasil masuk dalam 3 detik",
    card: {
      bg: "bg-[#ffd731]", // Sunburst
      rotation: "-rotate-1",
      topLabel: "Jalur Resmi Publisher",
      topBadge: "Auto Sync",
      float1: {
        text: "💎 MLBB 86 DM: Rp 21K",
        bg: "bg-white",
        textCol: "text-black",
        tilt: "-rotate-6",
      },
      float2: {
        text: "🎯 FF 140 DM",
        bg: "bg-[#fb4903]",
        textCol: "text-white",
        tilt: "rotate-6",
      },
      float3: {
        text: "PROSES KILAT",
        bg: "bg-black",
        textCol: "text-white",
        tilt: "-rotate-12",
      },
      centerIcon: "gamepad",
      centerTitle: "GAME TOP UP INSTAN",
      centerSubtitle: "Moonton, Garena & Level Infinite Aktif",
      bottomText: "CUKUP USER ID & ZONE ID",
      bottomTag: "Anti Banned",
      overlayBadge: {
        text: "Terverifikasi Resmi Publisher",
        bg: "bg-[#55db9c]",
        textCol: "text-black",
        tilt: "-rotate-2",
      },
    },
  },
  {
    id: "03",
    tabLabel: "03 Akun Premium",
    tabDotColor: "bg-[#5c4ade]",
    bgWash: "bg-[#f4ecff]", // Lavender Wash
    bubbleColors: ["bg-[#ffd731]", "bg-[#e9ccff]"],
    badges: [
      {
        text: "🍿 4K Ultra HD & HiFi",
        bg: "bg-[#5c4ade]",
        textCol: "text-white",
        tilt: "-rotate-2",
      },
      {
        text: "🛡️ Garansi Full 30 Hari",
        bg: "bg-[#ffd731]",
        textCol: "text-black",
        tilt: "rotate-1",
      },
      {
        text: "✨ Kredensial Instan",
        bg: "bg-white",
        textCol: "text-carbon dark:text-white",
        tilt: "rotate-0",
      },
    ],
    headlineFirst: "STREAMING & KREATIF, ",
    headlineHighlight: "HEMAT 70%.",
    headlineHighlightCol: "text-[#55db9c]",
    subtext:
      "Langganan Netflix 4K UHD Private/Shared, Spotify Premium Individual/Family, YouTube Premium & Canva Pro. Kredensial akun langsung muncul di layar setelah pembayaran!",
    primaryCta: { label: "Pilih Akun Premium", href: "/katalog?cat=akun-premium" },
    secondaryCta: { label: "Pusat Bantuan & Garansi", href: "/bantuan" },
    metric: "100% garansi replace & kotak kredensial langsung di invoice",
    card: {
      bg: "bg-[#5c4ade]", // Voltage Violet
      rotation: "rotate-2",
      topLabel: "Stok Akun Siap Pakai",
      topBadge: "Instan",
      float1: {
        text: "🍿 NETFLIX 4K UHD",
        bg: "bg-[#fb4903]",
        textCol: "text-white",
        tilt: "-rotate-6",
      },
      float2: {
        text: "🎵 SPOTIFY HIFI",
        bg: "bg-[#55db9c]",
        textCol: "text-black",
        tilt: "rotate-6",
      },
      float3: {
        text: "SALIN 1-KLIK",
        bg: "bg-white",
        textCol: "text-black",
        tilt: "-rotate-12",
      },
      centerIcon: "streaming",
      centerTitle: "PENGIRIMAN AKUN PREMIUM",
      centerSubtitle: "Kredensial Login Otomatis",
      bottomText: "KREDENSIAL LANGSUNG TAMPIL",
      bottomTag: "30 Hari",
      overlayBadge: {
        text: "Garansi Uang Kembali 100%",
        bg: "bg-[#dceeff]",
        textCol: "text-black",
        tilt: "rotate-2",
      },
    },
  },
  {
    id: "04",
    tabLabel: "04 Voucher Digital",
    tabDotColor: "bg-[#55db9c]",
    bgWash: "bg-[#eafaf1]", // Mint Pop Wash
    bubbleColors: ["bg-[#dceeff]", "bg-[#55db9c]"],
    badges: [
      {
        text: "🎟️ Kode Voucher & PIN",
        bg: "bg-[#55db9c]",
        textCol: "text-black",
        tilt: "-rotate-1",
      },
      {
        text: "⚡ 0% Biaya Admin QRIS",
        bg: "bg-[#ffd731]",
        textCol: "text-black",
        tilt: "rotate-2",
      },
      {
        text: "🔥 Promo Spesial Terbatas",
        bg: "bg-[#fb4903]",
        textCol: "text-white",
        tilt: "rotate-0",
      },
    ],
    headlineFirst: "KODE VOUCHER DIGITAL, ",
    headlineHighlight: "REDEEM INSTAN.",
    headlineHighlightCol: "text-[#fb4903]",
    subtext:
      "Steam Wallet IDR, Google Play Voucher, PlayStation Network & voucher resmi dengan kurs terhemat. Kode SN langsung keluar otomatis tanpa antri.",
    primaryCta: { label: "Katalog Voucher", href: "/katalog?cat=voucher-digital" },
    secondaryCta: { label: "Panduan Redeem PIN", href: "/bantuan" },
    metric: "Kode voucher digital 100% valid dari distributor resmi",
    card: {
      bg: "bg-[#55db9c]", // Mint Pop
      rotation: "-rotate-2",
      topLabel: "Pusat Kode Resmi",
      topBadge: "24/7",
      float1: {
        text: "🎮 STEAM WALLET",
        bg: "bg-black",
        textCol: "text-white",
        tilt: "-rotate-6",
      },
      float2: {
        text: "📱 GOOGLE PLAY",
        bg: "bg-[#5c4ade]",
        textCol: "text-white",
        tilt: "rotate-6",
      },
      float3: {
        text: "100% VALID",
        bg: "bg-[#ffd731]",
        textCol: "text-black",
        tilt: "-rotate-12",
      },
      centerIcon: "voucher",
      centerTitle: "KODE REDEEM RESMI",
      centerSubtitle: "Kode Otomatis Terbit di Invoice",
      bottomText: "SALIN KODE DENGAN 1 KLIK",
      bottomTag: "Resmi",
      overlayBadge: {
        text: "Stok Resmi Distributor",
        bg: "bg-[#e9ccff]",
        textCol: "text-black",
        tilt: "rotate-1",
      },
    },
  },
];

const AUTOPLAY_SECONDS = 4; // Bergulir otomatis setiap 4 detik
const INTERVAL_MS = AUTOPLAY_SECONDS * 1000;
const TICK_MS = 50;

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0); // 0 to 100%
  const slideCount = SLIDES.length;

  // Auto-scroll loop every 4 seconds with smooth progress bar
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentSlide((curr) => (curr + 1) % slideCount);
          return 0;
        }
        return prev + (TICK_MS / INTERVAL_MS) * 100;
      });
    }, TICK_MS);

    return () => clearInterval(timer);
  }, [slideCount]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setProgress(0);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slideCount) % slideCount);
    setProgress(0);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slideCount);
    setProgress(0);
  };

  const activeSlide = SLIDES[currentSlide];

  return (
    <section
      className="relative w-full overflow-hidden select-none"
      id="hero"
    >
      {/* Outer Shell with dynamic pastel background transition */}
      <div
        className={`relative ${activeSlide.bgWash} dark:bg-[#12121a] rounded-[24px] sm:rounded-[36px] ink-border dark:border-[#38384a] p-4 sm:p-8 md:p-10 lg:p-12 overflow-hidden transition-colors duration-700 shadow-[4px_4px_0px_0px_#000000]`}
      >
        {/* Decorative background inflatable blobs */}
        <div
          className={`absolute -top-12 -right-12 w-64 h-64 ${activeSlide.bubbleColors[0]} dark:opacity-5 rounded-full ink-border dark:border-[#2b2b3a] pointer-events-none opacity-40 transition-colors duration-700`}
        />
        <div
          className={`absolute -bottom-16 left-1/3 w-80 h-80 ${activeSlide.bubbleColors[1]} dark:opacity-5 rounded-full ink-border dark:border-[#2b2b3a] pointer-events-none opacity-30 transition-colors duration-700`}
        />

        {/* 
          HORIZONTAL SLIDING TRACK ("BERGULIR")
          Transisi geser horizontal penuh antar slide dengan CSS transform 700ms 
        */}
        <div className="relative z-10 overflow-hidden w-full">
          <div
            className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {SLIDES.map((slide) => (
              <div
                key={slide.id}
                className="w-full shrink-0 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center px-1"
              >
                {/* Left Column: Headlines, Badges, CTAs (7 Cols) */}
                <div className="lg:col-span-7 flex flex-col items-start space-y-3.5 sm:space-y-5">
                  {/* Badges Cluster */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    {slide.badges.map((b, idx) => (
                      <span
                        key={idx}
                        className={`inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1 rounded-full ${b.bg} ${b.textCol} text-[11px] sm:text-xs font-black uppercase tracking-wider ink-border ${b.tilt} shadow-[1.5px_1.5px_0px_0px_#000000]`}
                      >
                        {b.text}
                      </span>
                    ))}
                  </div>

                  {/* Huge Monolithic Expressive Headline */}
                  <h1 className="font-[var(--font-bricolage)] text-2xl xs:text-3xl sm:text-4xl lg:text-[46px] xl:text-[52px] font-black uppercase text-carbon dark:text-white leading-[0.96] tracking-tight">
                    {slide.headlineFirst}
                    <span
                      className={`${slide.headlineHighlightCol} underline decoration-4 decoration-carbon dark:decoration-white underline-offset-4`}
                    >
                      {slide.headlineHighlight}
                    </span>
                  </h1>

                  {/* Descriptive Body */}
                  <p className="hero-subtext font-[var(--font-hanken)] text-xs sm:text-base font-semibold text-carbon/80 dark:text-gray-200 max-w-xl leading-relaxed">
                    {slide.subtext}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto pt-1">
                    <Link
                      href={slide.primaryCta.href}
                      className="px-6 py-3 rounded-full bg-carbon text-white dark:bg-[#ffd731] dark:text-black ink-border text-xs sm:text-sm font-black uppercase tracking-wider hover:scale-105 active:scale-98 transition-transform duration-150 flex items-center justify-center gap-2 shadow-[3px_3px_0px_0px_#ffd731] dark:shadow-[3px_3px_0px_0px_#ffffff]"
                    >
                      <span>{slide.primaryCta.label}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <Link
                      href={slide.secondaryCta.href}
                      className="px-6 py-3 rounded-full bg-white dark:bg-[#1f1f2e] text-carbon dark:text-white ink-border dark:border-[#38384a] text-xs sm:text-sm font-black uppercase tracking-wider hover:scale-105 active:scale-98 transition-transform duration-150 flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_#000000]"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{slide.secondaryCta.label}</span>
                    </Link>
                  </div>

                  {/* Rating / Social Proof Pill */}
                  <div className="inline-flex items-center gap-2.5 bg-white dark:bg-[#1f1f2e] px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full ink-border dark:border-[#38384a] text-xs font-bold shadow-[2px_2px_0px_0px_#000000] mt-1 max-w-full">
                    <div className="flex -space-x-1.5 shrink-0">
                      <div className="w-5 h-5 rounded-full bg-[#fb4903] text-white ink-border flex items-center justify-center text-[9px] font-black">
                        ★
                      </div>
                      <div className="w-5 h-5 rounded-full bg-[#ffd731] text-black ink-border flex items-center justify-center text-[8px] font-black">
                        99%
                      </div>
                      <div className="w-5 h-5 rounded-full bg-[#55db9c] text-black ink-border flex items-center justify-center text-[9px] font-black">
                        ✓
                      </div>
                    </div>
                    <span className="hero-rating-text text-black dark:text-gray-100 text-[11px] sm:text-xs font-semibold leading-tight">
                      {slide.metric}
                    </span>
                  </div>
                </div>

                {/* Right Column: 3D Pop-Brutalism Inflatable Card Montage (5 Cols) */}
                <div className="lg:col-span-5 relative flex items-center justify-center py-2 sm:py-4">
                  {/* The Tactile Card */}
                  <div
                    className={`relative w-full max-w-[270px] xs:max-w-[300px] sm:max-w-sm aspect-square ${slide.card.bg} rounded-[24px] sm:rounded-[28px] ink-border p-4 sm:p-6 flex flex-col justify-between overflow-hidden ${slide.card.rotation} shadow-[4px_4px_0px_0px_#000000] sm:shadow-[5px_5px_0px_0px_#000000] transition-all duration-300`}
                  >
                    {/* Top Bar of the Card */}
                    <div className="flex items-center justify-between z-10">
                      <div className="hero-card-white-pill flex items-center gap-1.5 bg-white !bg-white px-2.5 sm:px-3 py-1 rounded-full ink-border shadow-[1.5px_1.5px_0px_0px_#000000]">
                        <span className="w-2 h-2 bg-[#55db9c] rounded-full animate-pulse ink-border" />
                        <span className="text-[10px] sm:text-[11px] font-black uppercase text-black">
                          {slide.card.topLabel}
                        </span>
                      </div>
                      <span className="bg-carbon text-white text-[10px] sm:text-[11px] font-black px-2.5 py-1 rounded-full ink-border">
                        {slide.card.topBadge}
                      </span>
                    </div>

                    {/* Center Canvas with Floating Die-Cut Stickers */}
                    <div className="my-auto relative flex flex-col items-center justify-center text-center py-2 sm:py-4 z-10">
                      {/* Floating Die-Cut Sticker 1 (Desktop only to prevent clutter on mobile) */}
                      <div
                        className={`hidden sm:block absolute -top-3 -left-3 ${slide.card.float1.bg} ${slide.card.float1.textCol} px-3 py-1.5 rounded-2xl ink-border ${slide.card.float1.tilt} shadow-[2px_2px_0px_0px_#000000] transition-transform hover:rotate-0`}
                      >
                        <span className="text-xs font-black">
                          {slide.card.float1.text}
                        </span>
                      </div>

                      {/* Floating Die-Cut Sticker 2 (Desktop only to prevent clutter on mobile) */}
                      <div
                        className={`hidden sm:block absolute -bottom-2 -right-2 ${slide.card.float2.bg} ${slide.card.float2.textCol} px-3 py-1.5 rounded-2xl ink-border ${slide.card.float2.tilt} shadow-[2px_2px_0px_0px_#000000] transition-transform hover:rotate-0`}
                      >
                        <span className="text-xs font-black">
                          {slide.card.float2.text}
                        </span>
                      </div>

                      {/* Floating Die-Cut Sticker 3 (Desktop only to prevent clutter on mobile) */}
                      <div
                        className={`hidden sm:block absolute top-1/2 -right-4 ${slide.card.float3.bg} ${slide.card.float3.textCol} px-2.5 py-1 rounded-full ink-border ${slide.card.float3.tilt} shadow-[2px_2px_0px_0px_#000000]`}
                      >
                        <span className="text-[10px] font-black uppercase">
                          {slide.card.float3.text}
                        </span>
                      </div>

                      {/* Central Emblem Circle with Official XYZI Mascot Sticker */}
                      <div className="hero-card-white-circle w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-white !bg-white ink-border flex items-center justify-center p-2 mb-1.5 sm:mb-2 shadow-[3px_3px_0px_0px_#000000] relative">
                        {slide.card.centerIcon === "rocket" && (
                          <img
                            src="/brand/stiker/xyzi-stiker-keren.png"
                            alt="XYZI Keren"
                            className="w-full h-full object-contain drop-shadow hover:scale-110 transition-transform"
                          />
                        )}
                        {slide.card.centerIcon === "gamepad" && (
                          <img
                            src="/brand/stiker/xyzi-stiker-rayakan.png"
                            alt="XYZI Gamers"
                            className="w-full h-full object-contain drop-shadow hover:scale-110 transition-transform"
                          />
                        )}
                        {slide.card.centerIcon === "streaming" && (
                          <img
                            src="/brand/stiker/xyzi-stiker-cinta.png"
                            alt="XYZI Streaming"
                            className="w-full h-full object-contain drop-shadow hover:scale-110 transition-transform"
                          />
                        )}
                        {slide.card.centerIcon === "voucher" && (
                          <img
                            src="/brand/stiker/xyzi-stiker-senang.png"
                            alt="XYZI Voucher"
                            className="w-full h-full object-contain drop-shadow hover:scale-110 transition-transform"
                          />
                        )}
                      </div>

                      <h3 className="font-[var(--font-bricolage)] text-sm sm:text-xl text-black uppercase font-extrabold tracking-tight">
                        {slide.card.centerTitle}
                      </h3>
                      <p className="text-[10px] sm:text-xs font-bold text-black/90 mt-0.5">
                        {slide.card.centerSubtitle}
                      </p>
                    </div>

                    {/* Bottom Card Bar */}
                    <div className="hero-card-white-bar bg-white !bg-white p-2 sm:p-2.5 rounded-2xl ink-border flex items-center justify-between z-10 shadow-[2px_2px_0px_0px_#000000]">
                      <div className="flex items-center gap-1.5">
                        <QrCode className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" />
                        <span className="text-[9px] sm:text-[10px] font-black text-black uppercase tracking-wider">
                          {slide.card.bottomText}
                        </span>
                      </div>
                      <span className="bg-[#55db9c] text-black text-[8px] sm:text-[9px] font-black px-2 py-0.5 rounded-full ink-border uppercase">
                        {slide.card.bottomTag}
                      </span>
                    </div>
                  </div>

                  {/* Floating Warranty / Authorized Sticker Overlay */}
                  <div
                    className={`absolute -bottom-4 -left-4 sm:-left-6 ${slide.card.overlayBadge.bg} ${slide.card.overlayBadge.textCol} px-4 py-2 rounded-2xl ink-border ${slide.card.overlayBadge.tilt} hidden sm:flex items-center gap-2 z-20 shadow-[3px_3px_0px_0px_#000000]`}
                  >
                    <ShieldCheck className="w-4 h-4 text-[#5c4ade]" />
                    <span className="text-xs font-black uppercase">
                      {slide.card.overlayBadge.text}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Footer Bar (Kilavox Style Pill Switcher & Controls) */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-carbon dark:border-[#38384a] flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
          {/* Slide Switcher Indicator Pills with Progress Bar on Active Tab (2x2 grid on mobile, flex row on sm+) */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 sm:gap-2 w-full md:w-auto">
            {SLIDES.map((s, idx) => {
              const isActive = idx === currentSlide;
              return (
                <button
                  key={s.id}
                  onClick={() => goToSlide(idx)}
                  className={`relative overflow-hidden px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider ink-border dark:border-[#38384a] transition-all duration-150 flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 cursor-pointer ${
                    isActive
                      ? "bg-carbon text-white dark:bg-[#ffd731] dark:text-black shadow-[2px_2px_0px_0px_#ffd731] scale-[1.02] sm:scale-105"
                      : "bg-white text-carbon hover:bg-gray-100 dark:bg-[#1f1f2e] dark:text-white dark:hover:bg-[#2b2b3d] shadow-[1px_1px_0px_0px_#000000]"
                  }`}
                >
                  <span
                    className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${
                      isActive ? s.tabDotColor : "bg-[#cccccc] dark:bg-[#555566]"
                    } ink-border shrink-0`}
                  />
                  <span className="relative z-10 truncate">{s.tabLabel}</span>

                  {/* Active Slide Timer Progress Fill Line */}
                  {isActive && (
                    <span
                      className="absolute bottom-0 left-0 h-[3px] bg-[#fb4903] transition-all duration-75 ease-linear pointer-events-none"
                      style={{ width: `${progress}%` }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Controls: Prev / Next Buttons + Slide Counter */}
          <div className="flex items-center justify-between w-full md:w-auto gap-3 pt-1 md:pt-0">
            <span className="text-xs font-black uppercase text-carbon dark:text-white tracking-wider">
              SLIDE{" "}
              <span className="text-[#fb4903]">
                0{currentSlide + 1}
              </span>{" "}
              / 0{slideCount}
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous Slide"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-[#1f1f2e] ink-border dark:border-[#38384a] flex items-center justify-center text-carbon dark:text-white hover:bg-carbon hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors shadow-[2px_2px_0px_0px_#000000] active:translate-y-0.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next Slide"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-[#1f1f2e] ink-border dark:border-[#38384a] flex items-center justify-center text-carbon dark:text-white hover:bg-carbon hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors shadow-[2px_2px_0px_0px_#000000] active:translate-y-0.5 cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
