"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Calculator, Sparkles, Star, ArrowRight, RotateCcw } from "lucide-react";

type TabType = "winrate" | "magicwheel" | "zodiac";

export default function KalkulatorPage() {
  const [activeTab, setActiveTab] = useState<TabType>("winrate");

  // 1. Win Rate Calculator States
  const [totalMatches, setTotalMatches] = useState("100");
  const [currentWr, setCurrentWr] = useState("50");
  const [targetWr, setTargetWr] = useState("60");

  // 2. Magic Wheel States (max 200 Magic Core; ~5 draws = 270 DM, 1 draw = 60 DM)
  const [magicPoint, setMagicPoint] = useState(100);

  // 3. Zodiac States (max 100 Star Power; 1x summon = 20 DM, 5x = 100 DM -> ~20 DM per point avg)
  const [zodiacPoint, setZodiacPoint] = useState(50);

  const wrResult = useMemo(() => {
    const tMatch = parseFloat(totalMatches);
    const tCurrent = parseFloat(currentWr);
    const tTarget = parseFloat(targetWr);

    if (
      isNaN(tMatch) ||
      isNaN(tCurrent) ||
      isNaN(tTarget) ||
      tMatch <= 0 ||
      tCurrent < 0 ||
      tCurrent > 100 ||
      tTarget <= 0 ||
      tTarget >= 100
    ) {
      return { valid: false, message: "Masukkan angka yang valid (Target WR harus di bawah 100%)." };
    }

    if (tTarget <= tCurrent) {
      return {
        valid: false,
        message: "Target Win Rate harus lebih tinggi dari Win Rate kamu saat ini.",
      };
    }

    const totalWin = tMatch * (tCurrent / 100);
    const needed = Math.ceil((tMatch * (tTarget / 100) - totalWin) / (1 - tTarget / 100));

    return {
      valid: true,
      needed: Math.max(0, needed),
      message: `Kamu butuh sekitar ${Math.max(0, needed).toLocaleString("id-ID")} kemenangan beruntun (Win Streak) tanpa kalah untuk mencapai ${tTarget}% Win Rate.`,
    };
  }, [totalMatches, currentWr, targetWr]);

  const magicResult = useMemo(() => {
    const remaining = Math.max(0, 200 - magicPoint);
    // Estimasi konservatif 5x draw = 270 DM (rata-rata ~54 DM per 1 poin)
    const minDiamond = remaining <= 0 ? 0 : Math.ceil(remaining * 54);
    const maxDiamond = remaining <= 0 ? 0 : remaining * 60;
    return { remaining, minDiamond, maxDiamond };
  }, [magicPoint]);

  const zodiacResult = useMemo(() => {
    const remaining = Math.max(0, 100 - zodiacPoint);
    // 1x summon = 20 DM (1-5 poin)
    const maxDiamond = remaining * 20;
    const avgDiamond = Math.ceil(remaining * 17);
    return { remaining, avgDiamond, maxDiamond };
  }, [zodiacPoint]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6 space-y-6">
      {/* Header */}
      <section className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-3xl p-5 sm:p-8 shadow-[4px_4px_0px_0px_#000000] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-[#dceeff] dark:bg-[#20202e] ink-border flex items-center justify-center p-1 shrink-0 shadow-[2px_2px_0px_0px_#000000]">
            <img
              src="/brand/stiker/xyzi-stiker-berpikir.png"
              alt="XYZI Kalkulator"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="font-[var(--font-bricolage)] text-2xl sm:text-3xl font-black uppercase text-carbon dark:text-white leading-tight">
              Kalkulator MLBB
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 mt-0.5">
              Hitung target Win Rate, estimasi Magic Wheel, dan Zodiac sebelum top up.
            </p>
          </div>
        </div>

        <Link
          href="/produk/mobile-legends"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#ffd731] text-black hover:bg-black hover:text-white rounded-full ink-border text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000] transition-colors shrink-0"
        >
          <span>Top Up MLBB</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </section>

      {/* Tabs + Card */}
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("winrate")}
            className={`py-2.5 px-3 rounded-2xl ink-border text-xs font-black uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              activeTab === "winrate"
                ? "bg-carbon text-white dark:bg-[#ffd731] dark:text-black shadow-[2px_2px_0px_0px_#000000]"
                : "bg-white dark:bg-[#181824] text-carbon dark:text-white hover:bg-gray-100 dark:hover:bg-[#222232]"
            }`}
          >
            <Calculator className="w-3.5 h-3.5 shrink-0" />
            <span>Win Rate</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("magicwheel")}
            className={`py-2.5 px-3 rounded-2xl ink-border text-xs font-black uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              activeTab === "magicwheel"
                ? "bg-carbon text-white dark:bg-[#ffd731] dark:text-black shadow-[2px_2px_0px_0px_#000000]"
                : "bg-white dark:bg-[#181824] text-carbon dark:text-white hover:bg-gray-100 dark:hover:bg-[#222232]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Magic Wheel</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("zodiac")}
            className={`py-2.5 px-3 rounded-2xl ink-border text-xs font-black uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
              activeTab === "zodiac"
                ? "bg-carbon text-white dark:bg-[#ffd731] dark:text-black shadow-[2px_2px_0px_0px_#000000]"
                : "bg-white dark:bg-[#181824] text-carbon dark:text-white hover:bg-gray-100 dark:hover:bg-[#222232]"
            }`}
          >
            <Star className="w-3.5 h-3.5 shrink-0" />
            <span>Zodiac</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-3xl p-5 sm:p-7 shadow-[4px_4px_0px_0px_#000000] space-y-5">
          {activeTab === "winrate" && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="font-[var(--font-bricolage)] text-lg font-black uppercase text-carbon dark:text-white">
                  Hitung Target Win Rate
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setTotalMatches("100");
                    setCurrentWr("50");
                    setTargetWr("60");
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 dark:text-gray-400 hover:text-carbon dark:hover:text-white cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-carbon dark:text-gray-200 block">
                    Total Match
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={totalMatches}
                    onChange={(e) => setTotalMatches(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border text-xs font-bold text-carbon dark:text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-carbon dark:text-gray-200 block">
                    Win Rate Saat Ini (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={currentWr}
                    onChange={(e) => setCurrentWr(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border text-xs font-bold text-carbon dark:text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase text-carbon dark:text-gray-200 block">
                    Target Win Rate (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="99.9"
                    step="0.1"
                    value={targetWr}
                    onChange={(e) => setTargetWr(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border text-xs font-bold text-carbon dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div
                className={`p-4 rounded-2xl ink-border text-xs font-bold leading-relaxed ${
                  wrResult.valid
                    ? "bg-[#55db9c]/20 text-emerald-900 dark:text-[#55db9c] border-emerald-500/50"
                    : "bg-[#ffdad6] dark:bg-[#3d141a] text-[#93000a] dark:text-[#fca5a5]"
                }`}
              >
                {wrResult.message}
              </div>
            </>
          )}

          {activeTab === "magicwheel" && (
            <>
              <div className="space-y-1">
                <h2 className="font-[var(--font-bricolage)] text-lg font-black uppercase text-carbon dark:text-white">
                  Estimasi Magic Wheel
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">
                  Geser sesuai jumlah Magic Core kamu saat ini (maksimal 200 untuk Skin Legend).
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-black text-carbon dark:text-white">
                  <span>Poin Kamu: {magicPoint} / 200</span>
                  <span className="text-[#fb4903] dark:text-[#ffd731]">
                    Kurang {magicResult.remaining} Poin
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={magicPoint}
                  onChange={(e) => setMagicPoint(Number(e.target.value))}
                  className="w-full accent-[#fb4903] cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-2xl bg-[#fbfbfd] dark:bg-[#12121a] ink-border dark:border-[#38384a] flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 block">
                    Estimasi Maksimal Diamond
                  </span>
                  <p className="text-xl font-black text-[#fb4903] dark:text-[#ffd731] font-[var(--font-bricolage)]">
                    {magicResult.minDiamond.toLocaleString("id-ID")} – {magicResult.maxDiamond.toLocaleString("id-ID")} 💎
                  </p>
                </div>
                <Link
                  href="/produk/mobile-legends"
                  className="px-4 py-2 bg-[#ffd731] text-black rounded-xl ink-border text-xs font-black uppercase shrink-0 hover:bg-black hover:text-white transition-colors"
                >
                  Isi Diamond
                </Link>
              </div>
            </>
          )}

          {activeTab === "zodiac" && (
            <>
              <div className="space-y-1">
                <h2 className="font-[var(--font-bricolage)] text-lg font-black uppercase text-carbon dark:text-white">
                  Estimasi Skin Zodiac
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">
                  Geser sesuai jumlah Star Power kamu saat ini (maksimal 100 untuk klaim Skin Zodiac).
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-black text-carbon dark:text-white">
                  <span>Star Power: {zodiacPoint} / 100</span>
                  <span className="text-[#fb4903] dark:text-[#ffd731]">
                    Kurang {zodiacResult.remaining} Poin
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={zodiacPoint}
                  onChange={(e) => setZodiacPoint(Number(e.target.value))}
                  className="w-full accent-[#fb4903] cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-2xl bg-[#fbfbfd] dark:bg-[#12121a] ink-border dark:border-[#38384a] flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 block">
                    Estimasi Kebutuhan Diamond
                  </span>
                  <p className="text-xl font-black text-[#fb4903] dark:text-[#ffd731] font-[var(--font-bricolage)]">
                    {zodiacResult.avgDiamond.toLocaleString("id-ID")} – {zodiacResult.maxDiamond.toLocaleString("id-ID")} 💎
                  </p>
                </div>
                <Link
                  href="/produk/mobile-legends"
                  className="px-4 py-2 bg-[#ffd731] text-black rounded-xl ink-border text-xs font-black uppercase shrink-0 hover:bg-black hover:text-white transition-colors"
                >
                  Isi Diamond
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
