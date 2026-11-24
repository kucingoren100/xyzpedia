"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Lock, User, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Gagal masuk. Periksa username dan password.");
        setLoading(false);
        return;
      }

      // Success
      router.push(from);
      router.refresh();
    } catch {
      setErrorMessage("Koneksi gagal. Silakan coba beberapa saat lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#181824] ink-border-thick dark:border-[#38384a] rounded-3xl p-6 sm:p-8 shadow-[6px_6px_0px_0px_#000000] space-y-5">
      {errorMessage && (
        <div className="p-3.5 bg-[#ffdad6] dark:bg-[#3d141a] ink-border dark:border-[#5c1d28] rounded-xl text-xs font-bold text-[#93000a] dark:text-[#fca5a5] flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-black uppercase text-carbon dark:text-white flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#5c4ade] dark:text-[#a78bfa]" />
            <span>Username Admin</span>
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Masukkan username admin"
            className="w-full px-4 py-3 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border dark:border-[#38384a] text-xs font-bold text-carbon dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:bg-white dark:focus:bg-[#27273a] transition-colors"
            required
            autoFocus
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-black uppercase text-carbon dark:text-white flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#fb4903]" />
            <span>Kata Sandi (Password)</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan kata sandi admin"
              className="w-full pl-4 pr-11 py-3 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border dark:border-[#38384a] text-xs font-bold text-carbon dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:bg-white dark:focus:bg-[#27273a] transition-colors"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
              aria-label="Tampilkan kata sandi"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-carbon text-white dark:bg-[#ffd731] dark:text-black ink-border rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#fb4903] dark:hover:bg-[#f59e0b] hover:shadow-[3px_3px_0px_0px_#ffd731] active:scale-98 transition-all cursor-pointer disabled:opacity-50 mt-2"
        >
          {loading ? (
            <span>Memverifikasi...</span>
          ) : (
            <>
              <span>Masuk ke Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#f9f9f9] dark:bg-[#0e0e12] flex flex-col justify-between py-10 px-4 transition-colors">
      <div className="max-w-md w-full mx-auto my-auto space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-20 h-20 mx-auto mb-1">
            <img
              src="/brand/stiker/xyzi-stiker-keren.png"
              alt="XYZI Admin Guardian"
              className="w-full h-full object-contain drop-shadow-[2px_2px_0px_#000]"
            />
          </div>
          <Link href="/" className="inline-block hover:scale-105 transition-transform">
            <BrandLogo />
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#ffd731] text-black ink-border rounded-full text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Panel Manajemen Toko</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold uppercase font-[var(--font-bricolage)] text-carbon dark:text-white">
            Masuk Admin
          </h1>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Akses dashboard kontrol transaksi dan katalog produk resmi
          </p>
        </div>

        {/* Login Card inside Suspense */}
        <Suspense fallback={
          <div className="bg-white dark:bg-[#181824] ink-border rounded-3xl p-8 text-center text-xs font-black">
            Memuat form login...
          </div>
        }>
          <LoginFormContent />
        </Suspense>

        {/* Back to store */}
        <div className="text-center">
          <Link
            href="/"
            className="text-xs font-black text-gray-600 dark:text-gray-400 hover:text-[#fb4903] dark:hover:text-[#ffd731] transition-colors"
          >
            ← Kembali ke Beranda XYZPEDIA
          </Link>
        </div>
      </div>
    </div>
  );
}
