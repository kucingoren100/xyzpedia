"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createOrder } from "@/app/actions/order";
import {
  User,
  Server,
  Zap,
  CreditCard,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  Info,
  Check,
  X,
  Tag,
  Gamepad2,
  HelpCircle,
} from "lucide-react";
import { saveRecentInvoice } from "@/lib/recentInvoices";
import { GameCurrencyIcon, getGameCurrencyMeta } from "@/components/GameCurrencyIcon";
import { getItemSubCategory, getProductSubCategories } from "@/lib/productSubCategories";
import ProductNoticeBox from "@/components/ProductNoticeBox";
import PaymentMaintenanceModal from "@/components/PaymentMaintenanceModal";
import SecurityTrustBanner from "@/components/SecurityTrustBanner";
import {
  WebConditionSettings,
  checkIsCategoryUnderMaintenance,
  DEFAULT_WEB_CONDITION,
} from "@/lib/webCondition";

interface ProductItem {
  id: string;
  name: string;
  sku?: string;
  price: number;
  originalPrice: number | null;
  discountPercent: number | null;
  bonusText: string | null;
  stockStatus: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  categorySlug?: string;
  developer: string | null;
  thumbnailUrl: string;
  badgeText: string | null;
  badgeColor: string | null;
  requiresServer: boolean;
  targetInputLabel: string;
  targetInputPlaceholder: string;
  serverInputPlaceholder: string | null;
  instructions: string | null;
  importantNotice?: string | null;
  warrantyTerms?: string | null;
  additionalNotes?: string | null;
  items: ProductItem[];
}


export default function ProductCustomizerClient({
  product,
  initialCondition,
}: {
  product: Product;
  initialCondition?: WebConditionSettings;
}) {
  const router = useRouter();

  // Dynamic Web Condition
  const condition = initialCondition || DEFAULT_WEB_CONDITION;
  const isUnderMaintenance = checkIsCategoryUnderMaintenance(condition, product.categorySlug);

  // Form State
  const [targetUserId, setTargetUserId] = useState("");
  const [targetZoneId, setTargetZoneId] = useState("");
  const [checkedNickname, setCheckedNickname] = useState<string | null>(null);
  const [nicknameStatus, setNicknameStatus] = useState<"IDLE" | "CHECKING" | "VALID" | "INVALID" | "UNVERIFIED">("IDLE");
  const [nicknameMessage, setNicknameMessage] = useState<string>("");

  // Live in-game nickname verification across all game topup products
  useEffect(() => {
    const isGame = product.categorySlug === "game-topup" || product.requiresServer;
    if (!isGame) return;

    const trimmedUser = targetUserId.trim();
    const trimmedZone = targetZoneId.trim();

    if (!trimmedUser || trimmedUser.length < 3) {
      setCheckedNickname(null);
      setNicknameStatus("IDLE");
      setNicknameMessage("");
      return;
    }

    if (product.requiresServer && (!trimmedZone || trimmedZone.length < 2)) {
      setCheckedNickname(null);
      setNicknameStatus("IDLE");
      setNicknameMessage("");
      return;
    }

    setNicknameStatus("CHECKING");

    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          userId: trimmedUser,
          game: product.slug,
        });
        if (trimmedZone) {
          params.set("zoneId", trimmedZone);
        }

        const res = await fetch(`/api/check-nickname?${params.toString()}`);
        const data = await res.json().catch(() => null);

        if (data && data.success && data.name && data.name !== trimmedUser) {
          setCheckedNickname(data.name);
          setNicknameStatus("VALID");
          setNicknameMessage("Akun terverifikasi resmi in-game.");
        } else if (data && data.isFound === false) {
          setCheckedNickname(null);
          setNicknameStatus("INVALID");
          setNicknameMessage(data.message || "Akun tidak ditemukan. Mohon cek kembali User ID & Server.");
        } else if (data && data.success) {
          setCheckedNickname(null);
          setNicknameStatus("UNVERIFIED");
          setNicknameMessage(data.message || "Format ID valid & tersimpan.");
        } else {
          setCheckedNickname(null);
          setNicknameStatus("INVALID");
          setNicknameMessage("Akun tidak ditemukan. Mohon cek kembali User ID & Server.");
        }
      } catch {
        setCheckedNickname(null);
        setNicknameStatus("UNVERIFIED");
        setNicknameMessage("Server verifikasi sedang sibuk. Data akun Anda tetap tersimpan.");
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [targetUserId, targetZoneId, product.slug, product.categorySlug, product.requiresServer]);

  const displayPlaceholder = useMemo(() => {
    const label = product.targetInputLabel?.trim();
    const rawPlaceholder = product.targetInputPlaceholder?.trim();

    if (
      label &&
      label.toLowerCase() !== "user id" &&
      (!rawPlaceholder ||
        rawPlaceholder === "Masukkan User ID akun Anda" ||
        rawPlaceholder === "Masukkan User ID akun" ||
        rawPlaceholder.toLowerCase().includes("user id"))
    ) {
      return `Masukkan ${label}`;
    }

    return rawPlaceholder || (label ? `Masukkan ${label}` : "Masukkan User ID akun Anda");
  }, [product.targetInputPlaceholder, product.targetInputLabel]);
  const firstAvailable = product.items.find(
    (i) => i.stockStatus === "AVAILABLE"
  );
  const [selectedItemId, setSelectedItemId] = useState<string>(
    firstAvailable?.id || product.items[0]?.id || ""
  );
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Promo Code States
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);

  // Mobile Pop-up Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pre-Checkout Nickname & Order Confirmation Modal
  const [isConfirmOrderOpen, setIsConfirmOrderOpen] = useState(false);

  // Payment Maintenance Modal State
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);

  // Game ID Guide Modal & Active Public Coupons Picker
  const [isIdGuideOpen, setIsIdGuideOpen] = useState(false);
  const [activeCoupons, setActiveCoupons] = useState<
    Array<{
      id: string;
      code: string;
      type: string;
      value: number;
      maxDiscount: number | null;
      minSpend: number | null;
      totalQuota: number | null;
    }>
  >([]);
  const [showCouponList, setShowCouponList] = useState(false);

  useEffect(() => {
    fetch(`/api/coupon/active?productSlug=${encodeURIComponent(product.slug)}&productId=${encodeURIComponent(product.id)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.coupons)) {
          setActiveCoupons(data.coupons);
        }
      })
      .catch(() => {});
  }, [product.slug, product.id]);

  // Sub-Category Classification & Filtering
  const [activeSubCategory, setActiveSubCategory] = useState<string>("ALL");

  const subCategories = useMemo(
    () => getProductSubCategories(product.items, product.slug),
    [product.items, product.slug]
  );

  const filteredItems = useMemo(() => {
    if (activeSubCategory === "ALL" || subCategories.length === 0) {
      return product.items;
    }
    return product.items.filter(
      (item) => getItemSubCategory(item.name, product.slug) === activeSubCategory
    );
  }, [product.items, product.slug, activeSubCategory, subCategories]);

  const handleSubCategoryChange = (subCat: string) => {
    setActiveSubCategory(subCat);
    const itemsInSubCat =
      subCat === "ALL"
        ? product.items
        : product.items.filter(
            (item) => getItemSubCategory(item.name, product.slug) === subCat
          );

    const isCurrentInSubCat = itemsInSubCat.some((i) => i.id === selectedItemId);
    if (!isCurrentInSubCat && itemsInSubCat.length > 0) {
      const firstAvailableInCat =
        itemsInSubCat.find((i) => i.stockStatus === "AVAILABLE") || itemsInSubCat[0];
      if (firstAvailableInCat) {
        setSelectedItemId(firstAvailableInCat.id);
      }
    }
  };

  const selectedItem = product.items.find((i) => i.id === selectedItemId);

  const finalPrice = useMemo(() => {
    if (!selectedItem) return 0;
    return Math.max(100, selectedItem.price - discountAmount);
  }, [selectedItem, discountAmount]);

  const handleApplyPromo = async (overridePrice?: number, overrideCode?: string) => {
    if (!selectedItem) return;
    const code = (overrideCode ?? promoInput).trim().toUpperCase();
    if (overrideCode) {
      setPromoInput(code);
    }
    if (!code) {
      setAppliedPromo(null);
      setDiscountAmount(0);
      setPromoMessage(null);
      return;
    }

    const priceToCheck = overridePrice !== undefined ? overridePrice : selectedItem.price;

    try {
      const res = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          itemPrice: priceToCheck,
          supplierPrice: 0,
          productSlug: product.slug,
          productId: product.id,
          variantSku: selectedItem.sku,
        }),
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedPromo(data.code || code);
        setDiscountAmount(data.discountAmount);
        setPromoMessage(`Kupon ${data.code || code} aktif (-Rp ${data.discountAmount.toLocaleString("id-ID")})! 🎉`);
      } else {
        setAppliedPromo(null);
        setDiscountAmount(0);
        setPromoMessage(data.message || "Kode promo tidak valid atau telah berakhir.");
      }
    } catch {
      setAppliedPromo(null);
      setDiscountAmount(0);
      setPromoMessage("Gagal memeriksa kode promo.");
    }
  };

  // Re-calculate coupon discount if buyer changes selected item while coupon is applied
  useEffect(() => {
    if (appliedPromo && selectedItem) {
      handleApplyPromo(selectedItem.price);
    }
  }, [selectedItemId]);
  const isNonGame =
    product.categorySlug === "akun-premium" ||
    product.categorySlug === "voucher-digital" ||
    product.categorySlug === "pulsa-ewallet";
  const isInstantPremium =
    product.categorySlug === "akun-premium" &&
    product.developer?.toLowerCase() !== "manual";
  const outOfStockBadge = isNonGame ? "Stok habis" : "Belum tersedia";
  const outOfStockButton = isNonGame ? "Stok Habis" : "Varian Belum Tersedia";
  const outOfStockNotice = isNonGame
    ? "⚠️ Varian ini stoknya sedang habis dari provider resmi. Silakan pilih paket lain yang tersedia."
    : "⚠️ Varian ini sedang belum tersedia dari provider pusat. Silakan pilih nominal lain yang tersedia.";

  // Validate Step 1 & 2 before opening mobile modal
  const handleOpenMobileModal = () => {
    setErrorMessage("");

    const isUnderMaintenance = checkIsCategoryUnderMaintenance(condition, product.categorySlug);
    if (isUnderMaintenance) {
      setIsMaintenanceModalOpen(true);
      return;
    }

    if (!isInstantPremium) {
      if (!targetUserId.trim()) {
        setErrorMessage(`Mohon isi ${product.targetInputLabel} terlebih dahulu.`);
        window.scrollTo({ top: 120, behavior: "smooth" });
        return;
      }

      if (product.requiresServer && !targetZoneId.trim()) {
        setErrorMessage("Mohon isi Server / Zone ID akun terlebih dahulu.");
        window.scrollTo({ top: 120, behavior: "smooth" });
        return;
      }
    }

    if (!selectedItemId) {
      setErrorMessage("Silakan pilih salah satu nominal atau varian item.");
      return;
    }

    if (selectedItem?.stockStatus === "OUT_OF_STOCK") {
      setErrorMessage(outOfStockNotice);
      return;
    }

    if (nicknameStatus === "INVALID") {
      const proceed = window.confirm(
        "Peringatan: Akun game tidak ditemukan dengan User ID & Server yang Anda masukkan. Apakah Anda yakin data akun sudah benar dan ingin tetap melanjutkan?"
      );
      if (!proceed) return;
    }

    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (selectedItem?.stockStatus === "OUT_OF_STOCK") {
      setErrorMessage(outOfStockNotice);
      return;
    }

    if (isInstantPremium) {
      const emailToCheck = customerEmail.trim();
      if (!emailToCheck || !emailToCheck.includes("@")) {
        setErrorMessage("Mohon masukkan alamat email yang valid untuk pengiriman kredensial akun.");
        return;
      }
    } else {
      if (!targetUserId.trim()) {
        setErrorMessage(`Mohon isi ${product.targetInputLabel}`);
        return;
      }

      if (product.requiresServer && !targetZoneId.trim()) {
        setErrorMessage("Mohon isi Server / Zone ID akun");
        return;
      }
    }

    const isUnderMaintenance = checkIsCategoryUnderMaintenance(condition, product.categorySlug);
    if (isUnderMaintenance) {
      if (isModalOpen) setIsModalOpen(false);
      setIsMaintenanceModalOpen(true);
      return;
    }

    if (!selectedItemId) {
      setErrorMessage("Silakan pilih salah satu nominal atau varian item.");
      return;
    }

    const effectiveEmail =
      customerEmail.trim() ||
      (targetUserId.includes("@") ? targetUserId.trim() : "");

    if (!effectiveEmail || !effectiveEmail.includes("@")) {
      setErrorMessage("Mohon masukkan alamat email yang valid untuk bukti transaksi.");
      return;
    }

    if (!customerEmail && effectiveEmail) {
      setCustomerEmail(effectiveEmail);
    }

    // Close mobile modal if open and show Pop-up Konfirmasi Data & Nickname
    if (isModalOpen) setIsModalOpen(false);
    setIsConfirmOrderOpen(true);
  };

  const handleExecuteOrder = async () => {
    setErrorMessage("");

    const effectiveEmail =
      customerEmail.trim() ||
      (targetUserId.includes("@") ? targetUserId.trim() : "");
    const finalTargetUserId = isInstantPremium
      ? effectiveEmail
      : targetUserId.trim();

    setIsSubmitting(true);

    try {
      const res = await createOrder({
        productSlug: product.slug,
        itemId: selectedItemId,
        targetUserId: finalTargetUserId,
        targetZoneId: isInstantPremium ? undefined : (targetZoneId.trim() || undefined),
        customerEmail: effectiveEmail,
        customerPhone: customerPhone.trim() || undefined,
        promoCode: appliedPromo || undefined,
      });

      if (res.success && res.invoiceNumber) {
        saveRecentInvoice({
          invoiceNumber: res.invoiceNumber,
          productName: product.name,
          itemName: selectedItem?.name,
          totalAmount: finalPrice,
        });
        setIsConfirmOrderOpen(false);
        router.push(`/transaksi/${res.invoiceNumber}`);
      } else {
        setErrorMessage(res.error || "Gagal memproses pesanan.");
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error("[handleExecuteOrder] Order error:", err);
      const errMsg = String(err?.message || "");
      if (
        errMsg.includes("Server Action") ||
        errMsg.includes("Failed to fetch") ||
        errMsg.includes("NetworkError")
      ) {
        setErrorMessage(
          "Sesi koneksi sistem diperbarui. Silakan refresh halaman browser (tekan F5 / Refresh) dan ulangi klik Bayar."
        );
      } else {
        setErrorMessage("Terjadi kesalahan koneksi saat membuat pesanan. Silakan refresh halaman dan coba kembali.");
      }
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="pb-24 lg:pb-0">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Form Steps (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* STEP 1: Account Credentials (Hidden for Instant Premium because credentials are provided by supplier) */}
          {!isInstantPremium && (
            <section className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-2xl p-5 sm:p-6 relative shadow-[3px_3px_0px_0px_#000000]">
              <div className="flex items-center justify-between pb-3 border-b border-carbon dark:border-[#38384a] mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-carbon text-white dark:bg-[#ffd731] dark:text-black flex items-center justify-center font-black text-xs">
                    1
                  </span>
                  <h3 className="font-[var(--font-bricolage)] text-base sm:text-lg font-black uppercase text-carbon dark:text-white">
                    1. Masukkan Data Akun
                  </h3>
                </div>
                <span className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">Wajib Diisi</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <label htmlFor="target-user-id" className="text-xs font-black uppercase text-carbon dark:text-white flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      <span>{product.targetInputLabel}</span>
                      <span className="text-red-500">*</span>
                    </label>
                    {!isNonGame && (
                      <button
                        type="button"
                        onClick={() => setIsIdGuideOpen(true)}
                        className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-[#5c4ade] dark:text-[#ffd731] hover:underline cursor-pointer shrink-0"
                      >
                        <HelpCircle className="w-3 h-3" />
                        <span>Cara Cek ID?</span>
                      </button>
                    )}
                  </div>
                  <input
                    id="target-user-id"
                    type="text"
                    value={targetUserId}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTargetUserId(val);
                      if (val.includes("@") && !customerEmail) {
                        setCustomerEmail(val.trim());
                      }
                    }}
                    placeholder={displayPlaceholder}
                    className="w-full px-4 py-2.5 bg-[#f3f4f6] dark:bg-[#1f1f2e] rounded-xl ink-border dark:border-[#38384a] text-xs font-bold text-carbon dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:bg-white dark:focus:bg-[#27273a] transition-colors"
                    required={!isInstantPremium}
                  />
                </div>

                {product.requiresServer && (
                  <div className="space-y-1.5">
                    <label htmlFor="target-zone-id" className="text-xs font-black uppercase text-carbon dark:text-white flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5" />
                      <span>Zone / Server ID</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="target-zone-id"
                      type="text"
                      value={targetZoneId}
                      onChange={(e) => setTargetZoneId(e.target.value)}
                      placeholder={product.serverInputPlaceholder || "Zone ID"}
                      className="w-full px-4 py-2.5 bg-[#f3f4f6] dark:bg-[#1f1f2e] rounded-xl ink-border dark:border-[#38384a] text-xs font-bold text-carbon dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:bg-white dark:focus:bg-[#27273a] transition-colors"
                      required
                    />
                  </div>
                )}
              </div>

              {/* Live Verified Game Nickname Indicator */}
              {nicknameStatus !== "IDLE" && (
                <div
                  className={`mt-3 p-3.5 rounded-xl ink-border text-xs font-bold transition-all shadow-[2px_2px_0px_#000000] ${
                    nicknameStatus === "CHECKING"
                      ? "bg-[#fffbeb] dark:bg-[#78350f]/20 text-[#92400e] dark:text-[#fde68a] border-amber-400"
                      : nicknameStatus === "VALID"
                      ? "bg-[#ecfdf5] dark:bg-[#064e3b]/30 text-[#065f46] dark:text-[#6ee7b7] border-emerald-500"
                      : nicknameStatus === "INVALID"
                      ? "bg-[#fef2f2] dark:bg-[#7f1d1d]/30 text-[#991b1b] dark:text-[#fca5a5] border-red-500"
                      : "bg-[#f0f9ff] dark:bg-[#0c4a6e]/20 text-[#0369a1] dark:text-[#7dd3fc] border-sky-400"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      {nicknameStatus === "CHECKING" && (
                        <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin shrink-0" />
                      )}
                      {nicknameStatus === "VALID" && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                      {nicknameStatus === "INVALID" && (
                        <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                      )}
                      {nicknameStatus === "UNVERIFIED" && (
                        <Info className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
                      )}

                      <span className="font-extrabold">
                        {nicknameStatus === "CHECKING" && "Sedang memeriksa akun in-game..."}
                        {nicknameStatus === "VALID" && "Nickname Akun:"}
                        {nicknameStatus === "INVALID" && "Akun Tidak Ditemukan!"}
                        {nicknameStatus === "UNVERIFIED" && "Data Akun Tersimpan"}
                      </span>

                      {nicknameStatus === "VALID" && checkedNickname && (
                        <span className="font-mono text-sm font-black text-emerald-800 dark:text-emerald-300 bg-white dark:bg-[#1a1a24] px-2.5 py-0.5 rounded ink-border">
                          {checkedNickname}
                        </span>
                      )}
                    </div>

                    <div>
                      {nicknameStatus === "VALID" && (
                        <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                          ✓ Terverifikasi
                        </span>
                      )}
                      {nicknameStatus === "INVALID" && (
                        <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-red-600 text-white">
                          ✕ ID Salah / Tidak Ada
                        </span>
                      )}
                    </div>
                  </div>

                  {nicknameStatus === "INVALID" && (
                    <p className="mt-1.5 text-[11px] text-red-600 dark:text-red-400 font-semibold">
                      {nicknameMessage || "Pastikan User ID dan Zone ID sudah sesuai dengan akun Anda di dalam game."}
                    </p>
                  )}
                  {nicknameStatus === "UNVERIFIED" && (
                    <p className="mt-1 text-[11px] text-sky-700 dark:text-sky-300 font-semibold">
                      {nicknameMessage}
                    </p>
                  )}
                </div>
              )}

              {product.instructions && (
                <div className="mt-4 p-3 product-instruction-box bg-[#dceeff] dark:bg-[#152338] ink-border dark:border-[#2d3f5e] rounded-xl flex items-center gap-2 text-xs font-semibold text-[#003a6b] dark:text-[#bae6fd]">
                  <Info className="w-4 h-4 text-[#005ea5] dark:text-[#38bdf8] shrink-0" />
                  <span>{product.instructions}</span>
                </div>
              )}
            </section>
          )}

          {/* STEP 2: Denomination Selection (Always visible on mobile & desktop) */}
          <section className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-2xl p-5 sm:p-6 relative shadow-[3px_3px_0px_0px_#000000]">
            <div className="flex items-center justify-between pb-3 border-b border-carbon dark:border-[#38384a] mb-3">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <span className="w-7 h-7 rounded-full bg-carbon text-white dark:bg-[#ffd731] dark:text-black flex items-center justify-center font-black text-xs">
                  {isInstantPremium ? "1" : "2"}
                </span>
                <h3 className="font-[var(--font-bricolage)] text-base sm:text-lg font-black uppercase text-carbon dark:text-white">
                  {isInstantPremium ? "1. Pilih Nominal / Paket" : "2. Pilih Nominal / Paket"}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {filteredItems.length > 6 && (
                  <span className="text-[10px] font-black uppercase text-gray-700 dark:text-gray-300 bg-[#f3f4f6] dark:bg-[#20202e] px-2 py-0.5 rounded ink-border dark:border-[#38384a]">
                    {filteredItems.length} Pilihan • Scroll ↕
                  </span>
                )}
                <span className="text-[10px] font-black uppercase text-black bg-[#55db9c] px-2 py-0.5 rounded ink-border">
                  Diskon Promo
                </span>
              </div>
            </div>

            {/* Sub-Category Filter Tabs (visible when product has 2+ distinct types) */}
            {subCategories.length > 0 && (
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2.5 pt-0.5 mb-3 custom-scrollbar">
                <button
                  type="button"
                  onClick={() => handleSubCategoryChange("ALL")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ink-border dark:border-[#38384a] shrink-0 transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                    activeSubCategory === "ALL"
                      ? "bg-[#ffd731] text-black shadow-[2px_2px_0px_0px_#000000] -translate-x-[0.5px] -translate-y-[0.5px]"
                      : "bg-[#f3f4f6] dark:bg-[#20202e] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2c2c3e] active:scale-95 shadow-[1px_1px_0px_0px_#000000]"
                  }`}
                >
                  <span>Semua</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md font-black ${
                      activeSubCategory === "ALL"
                        ? "bg-black text-white"
                        : "bg-gray-200 dark:bg-[#2c2c3e] text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {product.items.length}
                  </span>
                </button>

                {subCategories.map((sub) => {
                  const count = product.items.filter(
                    (i) => getItemSubCategory(i.name, product.slug) === sub
                  ).length;
                  const isActive = activeSubCategory === sub;
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => handleSubCategoryChange(sub)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ink-border dark:border-[#38384a] shrink-0 transition-all duration-150 cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? "bg-[#ffd731] text-black shadow-[2px_2px_0px_0px_#000000] -translate-x-[0.5px] -translate-y-[0.5px]"
                          : "bg-[#f3f4f6] dark:bg-[#20202e] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2c2c3e] active:scale-95 shadow-[1px_1px_0px_0px_#000000]"
                      }`}
                    >
                      <span>{sub}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-md font-black ${
                          isActive
                            ? "bg-black text-white"
                            : "bg-gray-200 dark:bg-[#2c2c3e] text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Scrollable grid container (responsive & desktop) */}
            <div className="max-h-[440px] sm:max-h-[520px] overflow-y-auto overscroll-contain pr-1 sm:pr-2 p-0.5 custom-scrollbar">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                {filteredItems.map((item) => {
                const isSelected = selectedItemId === item.id;
                const isAvailable = item.stockStatus === "AVAILABLE";
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setSelectedItemId(item.id)}
                    className={`group p-2.5 sm:p-3.5 rounded-xl ink-border text-left transition-all duration-150 relative overflow-hidden flex flex-col justify-between hover:scale-[1.02] sm:hover:scale-[1.03] hover:shadow-[3px_3px_0px_0px_#000000] active:scale-95 active:translate-x-[1px] active:translate-y-[1px] cursor-pointer ${
                      isSelected
                        ? "bg-[#ffd731] dark:bg-[#ffd731] text-black shadow-[3px_3px_0px_0px_#000000] -translate-x-[1px] -translate-y-[1px]"
                        : isAvailable
                        ? "bg-[#fbfbfd] dark:bg-[#1a1a28] dark:border-[#38384a] hover:bg-gray-50 dark:hover:bg-[#242436] shadow-[1px_1px_0px_0px_#000000]"
                        : "bg-[#f3f4f6]/90 dark:bg-[#151520] dark:border-[#2d2d3a] hover:bg-[#fee2e2]/40 shadow-[1px_1px_0px_0px_#000000]"
                    }`}
                  >
                    <div className="flex items-start gap-2 sm:gap-2.5">
                      <div
                        className={`p-1 sm:p-1.5 rounded-lg ink-border shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6 ${
                          isSelected
                            ? "bg-white text-black"
                            : isAvailable
                            ? "bg-[#f3f4f6] dark:bg-[#262638] dark:border-[#38384a]"
                            : "bg-gray-200 dark:bg-[#20202c] dark:border-[#2d2d3a]"
                        }`}
                      >
                        <GameCurrencyIcon
                          slugOrName={product.slug}
                          className={`w-5 h-5 sm:w-6 sm:h-6 ${
                            !isAvailable ? "grayscale-[40%]" : ""
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4
                          className={`text-xs font-black leading-snug line-clamp-2 ${
                            isSelected
                              ? "text-black"
                              : !isAvailable
                              ? "text-gray-500 dark:text-gray-400"
                              : "text-carbon dark:text-white"
                          }`}
                        >
                          {item.name}
                        </h4>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-carbon/15 dark:border-white/10 space-y-1.5">
                      <div className="flex items-baseline justify-between gap-1">
                        <div className="min-w-0">
                          <span
                            className={`text-xs sm:text-sm font-black block leading-tight ${
                              isSelected
                                ? "text-black"
                                : !isAvailable
                                ? "text-gray-500 dark:text-gray-400"
                                : "text-carbon dark:text-white"
                            }`}
                          >
                            Rp {item.price.toLocaleString("id-ID")}
                          </span>
                          {item.originalPrice && (
                            <span
                              className={`text-[9px] sm:text-[10px] line-through font-bold block mt-0.5 ${
                                isSelected ? "text-black/70" : "text-gray-400 dark:text-gray-500"
                              }`}
                            >
                              Rp {item.originalPrice.toLocaleString("id-ID")}
                            </span>
                          )}
                        </div>
                        {item.discountPercent &&
                        item.discountPercent > 0 &&
                        isAvailable ? (
                          <span className="text-[9px] font-black px-1.5 py-0.5 rounded ink-border bg-[#55db9c] text-black shrink-0">
                            -{item.discountPercent}%
                          </span>
                        ) : null}
                      </div>

                      {!isAvailable && (
                        <div className="w-full text-center py-1 px-1.5 rounded-lg ink-border dark:border-[#5c1d28] bg-[#fee2e2] dark:bg-[#3d141a] text-[#991b1b] dark:text-[#fca5a5] text-[9px] font-black uppercase tracking-tight shadow-[0.5px_0.5px_0px_#000000]">
                          {outOfStockBadge}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
              {filteredItems.length === 0 && (
                <div className="col-span-2 sm:col-span-3 py-10 text-center text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  Tidak ada item dalam kategori ini
                </div>
              )}
              </div>
            </div>

            {/* Custom Product Notice Box (Penting Sebelum Beli, Syarat Ketentuan & Catatan) */}
            <ProductNoticeBox
              product={product}
              selectedItemName={selectedItem?.name}
            />
          </section>

          {/* Error Message if any on main page */}
          {errorMessage && !isModalOpen && (
            <div className="p-3.5 bg-[#ffdad6] dark:bg-[#3d141a] ink-border dark:border-[#5c1d28] rounded-xl text-xs font-black text-[#93000a] dark:text-[#fca5a5] animate-in fade-in">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* STEP 3 (or 2 if Instant): Payment Method (Desktop Only: hidden on mobile) */}
          <section className="hidden lg:block bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-2xl p-6 relative shadow-[3px_3px_0px_0px_#000000]">
            <div className="flex items-center justify-between pb-3 border-b border-carbon dark:border-[#38384a] mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-carbon text-white dark:bg-[#ffd731] dark:text-black flex items-center justify-center font-black text-xs">
                  {isInstantPremium ? "2" : "3"}
                </span>
                <h3 className="font-[var(--font-bricolage)] text-lg font-black uppercase text-carbon dark:text-white">
                  {isInstantPremium ? "2. Metode Pembayaran Instan" : "3. Metode Pembayaran Instan"}
                </h3>
              </div>
              <span className="text-[10px] font-black uppercase text-black bg-[#ffd731] px-2 py-0.5 rounded ink-border">
                Biaya Rp 0
              </span>
            </div>

            <div className="p-4 bg-[#f3f4f6] dark:bg-[#1f1f2e] ink-border dark:border-[#38384a] rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#252538] ink-border dark:border-[#38384a] flex items-center justify-center font-black text-sm text-carbon dark:text-white shadow-[1.5px_1.5px_0px_0px_#000000]">
                  QRIS
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-carbon dark:text-white uppercase">
                      QRIS DINAMIS (QiosPay)
                    </span>
                    <span className="text-[9px] font-black px-1.5 py-0.5 bg-[#55db9c] text-black rounded ink-border">
                      OTOMATIS
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 dark:text-gray-400 font-semibold mt-0.5">
                    Dukung semua bank (BCA, Mandiri, BRI, BNI) & E-Wallet (GoPay, DANA, OVO, ShopeePay)
                  </p>
                </div>
              </div>
              <span className="text-xs font-black text-green-700 dark:text-green-400">GRATIS</span>
            </div>
          </section>

          {/* STEP 4 (or 3 if Instant): Buyer Contact (Desktop Only: hidden on mobile) */}
          <section className="hidden lg:block bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-2xl p-6 relative shadow-[3px_3px_0px_0px_#000000]">
            <div className="flex items-center justify-between pb-3 border-b border-carbon dark:border-[#38384a] mb-4">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-full bg-carbon text-white dark:bg-[#ffd731] dark:text-black flex items-center justify-center font-black text-xs">
                  {isInstantPremium ? "3" : "4"}
                </span>
                <h3 className="font-[var(--font-bricolage)] text-lg font-black uppercase text-carbon dark:text-white">
                  {isInstantPremium ? "3. Kontak Pengiriman Kredensial & Struk" : "4. Kontak Pengiriman Invoice"}
                </h3>
              </div>
              <span className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400">Tanpa Login</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="customer-email-desktop" className="text-xs font-black uppercase text-carbon dark:text-white flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{isInstantPremium ? "Email Penerima Kredensial Akun & Struk" : "Alamat Email"}</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  id="customer-email-desktop"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="Contoh: emailmu@gmail.com"
                  className="w-full px-4 py-2.5 bg-[#f3f4f6] dark:bg-[#1f1f2e] rounded-xl ink-border dark:border-[#38384a] text-xs font-bold text-carbon dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:bg-white dark:focus:bg-[#27273a] transition-colors"
                  required
                />
                {isInstantPremium && (
                  <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mt-1">
                    ✓ Kredensial akun resmi (email & password) dan bukti transaksi dikirimkan otomatis ke email ini.
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="customer-phone-desktop" className="text-xs font-black uppercase text-carbon dark:text-white flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Nomor WhatsApp (Opsional)</span>
                </label>
                <input
                  id="customer-phone-desktop"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Contoh: 08123456789"
                  className="w-full px-4 py-2.5 bg-[#f3f4f6] dark:bg-[#1f1f2e] rounded-xl ink-border dark:border-[#38384a] text-xs font-bold text-carbon dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:bg-white dark:focus:bg-[#27273a] transition-colors"
                />
              </div>
            </div>

            {/* Promo Code Box */}
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-800 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-black uppercase text-carbon dark:text-white flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Punya Kode Promo / Kupon?</span>
                </label>
                {activeCoupons.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowCouponList((prev) => !prev)}
                    className="text-[10px] font-black uppercase text-[#5c4ade] dark:text-[#ffd731] hover:underline cursor-pointer shrink-0"
                  >
                    {showCouponList ? "Tutup Kupon" : `Lihat Kupon (${activeCoupons.length})`}
                  </button>
                )}
              </div>
              {showCouponList && activeCoupons.length > 0 && (
                <div className="space-y-1.5 py-1.5">
                  {activeCoupons.map((c) => {
                    const minSpendMet = !c.minSpend || (selectedItem?.price || 0) >= c.minSpend;
                    const discountLabel =
                      c.type === "percent"
                        ? `Diskon ${c.value}%${c.maxDiscount ? ` (Maks Rp ${c.maxDiscount.toLocaleString("id-ID")})` : ""}`
                        : `Potongan Rp ${c.value.toLocaleString("id-ID")}`;
                    return (
                      <div
                        key={c.id}
                        className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#fbfbfd] dark:bg-[#1f1f2e] ink-border dark:border-[#38384a]"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] font-black uppercase text-carbon dark:text-white tracking-wider">
                              {c.code}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-[#55db9c] text-black text-[9px] font-black">
                              {discountLabel}
                            </span>
                          </div>
                          {c.minSpend ? (
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold mt-0.5">
                              Min. belanja Rp {c.minSpend.toLocaleString("id-ID")}
                              {c.totalQuota ? ` • Sisa ${c.totalQuota}` : ""}
                            </p>
                          ) : c.totalQuota ? (
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold mt-0.5">
                              Tanpa min. belanja • Sisa {c.totalQuota}
                            </p>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          disabled={!minSpendMet}
                          onClick={() => {
                            handleApplyPromo(selectedItem?.price, c.code);
                            setShowCouponList(false);
                          }}
                          className={`px-2.5 py-1 rounded-lg ink-border text-[10px] font-black uppercase shrink-0 transition-all ${
                            minSpendMet
                              ? "bg-[#ffd731] text-black hover:bg-black hover:text-white cursor-pointer"
                              : "bg-gray-200 dark:bg-[#2a2a3a] text-gray-500 dark:text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          {appliedPromo === c.code ? "Dipakai" : minSpendMet ? "Pakai" : "Kurang"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  placeholder="Contoh: XYZPEDIA / HEMAT5"
                  className="flex-1 px-4 py-2 bg-[#f3f4f6] dark:bg-[#1f1f2e] rounded-xl ink-border text-xs font-black uppercase tracking-wider text-carbon dark:text-white placeholder:text-gray-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleApplyPromo()}
                  className="px-4 py-2 bg-black hover:bg-gray-800 text-white dark:bg-[#ffd731] dark:text-black font-black text-xs uppercase rounded-xl ink-border cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                >
                  Terapkan
                </button>
              </div>
              {promoMessage && (
                <div className={`flex items-center gap-2 p-2 rounded-xl border mt-2 ${
                  appliedPromo
                    ? "bg-green-500/10 border-green-500/40 text-green-700 dark:text-green-300"
                    : "bg-red-500/10 border-red-500/40 text-red-600 dark:text-red-400"
                }`}>
                  <div className="w-6 h-6 shrink-0">
                    <img
                      src={appliedPromo ? "/brand/ekspresi/xyzi-rayakan.svg" : "/brand/ekspresi/xyzi-maaf.svg"}
                      alt="XYZI"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-[11px] font-bold">
                    {promoMessage}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Sticky Order Summary Sidebar (Desktop Only: hidden lg:block) */}
        <div className="hidden lg:block lg:col-span-4 lg:sticky lg:top-24 space-y-4">
          <div className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-2xl p-6 shadow-[4px_4px_0px_0px_#000000] space-y-5">
            <div className="border-b border-carbon dark:border-[#38384a] pb-3">
              <span className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 tracking-wider">
                Pembayaran Langsung
              </span>
              <h3 className="font-[var(--font-bricolage)] text-xl font-black uppercase text-carbon dark:text-white">
                Ringkasan Pesanan
              </h3>
            </div>

            {/* Selected Product info */}
            <div className="space-y-2 text-xs font-semibold">
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Layanan:</span>
                <span className="font-black text-carbon dark:text-white">{product.name}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Item:</span>
                <span className="font-black text-carbon dark:text-white flex items-center gap-1.5 text-right">
                  <GameCurrencyIcon slugOrName={product.slug} className="w-4 h-4 shrink-0" />
                  <span className="line-clamp-1">{selectedItem?.name || "-"}</span>
                </span>
              </div>
              {isInstantPremium ? (
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500 dark:text-gray-400">Pengiriman:</span>
                  <span className="font-black text-[#5c4ade] dark:text-[#a78bfa] uppercase">
                    Kredensial Instan (24/7)
                  </span>
                </div>
              ) : (
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500 dark:text-gray-400">Target ID:</span>
                  <span className="font-black text-carbon dark:text-white">
                    {targetUserId || "Belum diisi"} {targetZoneId ? `(${targetZoneId})` : ""}
                  </span>
                </div>
              )}
              {checkedNickname && (
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-500 dark:text-gray-400">Nickname:</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {checkedNickname}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Metode:</span>
                <span className="font-black text-[#5c4ade] dark:text-[#a78bfa]">QRIS Dinamis</span>
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 bg-[#ffd731] ink-border rounded-xl space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-black">
                Total Estimasi
              </span>
              {discountAmount > 0 ? (
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs line-through text-black/60 font-bold">
                      Rp {selectedItem?.price.toLocaleString("id-ID")}
                    </span>
                    <span className="text-[10px] bg-red-600 text-white font-black px-1.5 py-0.5 rounded ink-border">
                      -Rp {discountAmount.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-black font-[var(--font-bricolage)]">
                    Rp {finalPrice.toLocaleString("id-ID")}
                  </div>
                </div>
              ) : (
                <div className="text-2xl font-black text-black font-[var(--font-bricolage)]">
                  {selectedItem ? `Rp ${selectedItem.price.toLocaleString("id-ID")}` : "Rp 0"}
                </div>
              )}
              <span className="text-[10px] font-bold text-black/80 block">
                + kode unik verifikasi saat generate QRIS
              </span>
            </div>

            {/* Error Message (Desktop) */}
            {errorMessage && (
              <div className="p-3 bg-[#ffdad6] dark:bg-[#3d141a] ink-border dark:border-[#5c1d28] rounded-xl text-xs font-black text-[#93000a] dark:text-[#fca5a5]">
                {errorMessage}
              </div>
            )}

            {/* Out of stock warning on Desktop */}
            {selectedItem?.stockStatus === "OUT_OF_STOCK" && (
              <div className="p-3 bg-[#fee2e2] dark:bg-[#3d141a] ink-border dark:border-[#5c1d28] rounded-xl text-xs font-black text-[#991b1b] dark:text-[#fca5a5]">
                {outOfStockNotice}
              </div>
            )}

            {/* CTA Button (Desktop) */}
            <button
              type="submit"
              disabled={isSubmitting || selectedItem?.stockStatus === "OUT_OF_STOCK"}
              className={`w-full py-3.5 rounded-xl ink-border text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                selectedItem?.stockStatus === "OUT_OF_STOCK"
                  ? "bg-gray-200 dark:bg-[#252535] text-gray-500 dark:text-gray-400 cursor-not-allowed shadow-none"
                  : "bg-carbon text-white dark:bg-[#ffd731] dark:text-black hover:bg-[#fb4903] dark:hover:bg-[#f59e0b] active:scale-95 shadow-[2px_2px_0px_0px_#ffd731] hover:shadow-[3px_3px_0px_0px_#ffd731] disabled:opacity-50"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Membuat Pesanan...</span>
                </>
              ) : selectedItem?.stockStatus === "OUT_OF_STOCK" ? (
                <span>{outOfStockButton}</span>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Bayar Sekarang (QRIS)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Trust Footer */}
            <div className="pt-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 space-y-1">
              <p>🔒 Transaksi Resmi & Terverifikasi Gateway</p>
              <p>⚡ Proses otomatis langsung terhubung ke sistem supplier</p>
            </div>

            <SecurityTrustBanner compact />
          </div>
        </div>
      </div>

      {/* 
        ============================================================
        MOBILE FLOATING CHECKOUT DOCK (lg:hidden)
        Compact Pop-Brutalist dock matching MobileFloatingDock
        ============================================================
      */}
      <div className="lg:hidden fixed bottom-2.5 left-4 right-4 z-40 max-w-md mx-auto p-2.5 px-3.5 bg-white/95 dark:bg-[#181824]/95 backdrop-blur-md ink-border dark:border-[#38384a] rounded-2xl shadow-[3px_3px_0px_0px_#000000] flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-200">
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400 truncate">
            {product.name}
          </p>
          <p className="text-xs font-black text-carbon dark:text-white truncate">
            {selectedItem ? selectedItem.name : "Pilih nominal"}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <p className="text-sm font-black text-[#fb4903] font-[var(--font-bricolage)] leading-none">
              {selectedItem ? `Rp ${finalPrice.toLocaleString("id-ID")}` : "—"}
            </p>
            {discountAmount > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-[#55db9c] text-black text-[9px] font-black leading-none">
                -Rp {discountAmount.toLocaleString("id-ID")}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenMobileModal}
          disabled={selectedItem?.stockStatus === "OUT_OF_STOCK"}
          className={`shrink-0 px-3.5 py-2 min-h-[38px] rounded-xl ink-border text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
            selectedItem?.stockStatus === "OUT_OF_STOCK"
              ? "bg-gray-200 dark:bg-[#252535] text-gray-500 dark:text-gray-400 cursor-not-allowed shadow-none"
              : "bg-carbon text-white dark:bg-[#ffd731] dark:text-black hover:bg-[#fb4903] active:scale-95 shadow-[1.5px_1.5px_0px_0px_#ffd731] cursor-pointer"
          }`}
        >
          <span>
            {selectedItem?.stockStatus === "OUT_OF_STOCK"
              ? outOfStockButton
              : "Lanjut bayar"}
          </span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 
        ============================================================
        MOBILE POP-UP MODAL (Tahapan 3, 4 & Ringkasan Pesanan)
        Opens when user clicks "Lanjut Bayar" from the floating dock
        ============================================================
      */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Konfirmasi dan Pembayaran"
          onKeyDown={(e) => {
            if (e.key === "Escape") setIsModalOpen(false);
          }}
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
        >
          
          {/* Modal Container */}
          <div className="w-full max-w-lg bg-white dark:bg-[#161622] rounded-t-3xl sm:rounded-3xl ink-border-thick dark:border-[#38384a] p-5 sm:p-6 shadow-[6px_6px_0px_0px_#000000] max-h-[92vh] overflow-y-auto space-y-5 animate-in slide-in-from-bottom duration-300">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-carbon dark:border-[#38384a]">
              <div>
                <span className="text-[10px] font-black uppercase text-[#fb4903] tracking-wider block">
                  Langkah Terakhir
                </span>
                <h3 className="font-[var(--font-bricolage)] text-lg font-black uppercase text-carbon dark:text-white leading-tight">
                  Konfirmasi & Pembayaran
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f3f4f6] dark:bg-[#252538] hover:bg-[#ffdad6] active:scale-90 ink-border dark:border-[#38384a] flex items-center justify-center text-carbon dark:text-white transition-all cursor-pointer"
                aria-label="Tutup modal"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* 1. Ringkasan Pesanan Card */}
            <div className="bg-[#fbfbfd] dark:bg-[#1f1f2e] ink-border dark:border-[#38384a] rounded-2xl p-4 space-y-2.5 shadow-[2px_2px_0px_0px_#000000]">
              <span className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 tracking-wider block">
                Ringkasan Pesanan
              </span>
              <div className="space-y-1.5 text-xs font-bold">
                <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-800">
                  <span className="text-gray-500 dark:text-gray-400">Layanan:</span>
                  <span className="font-black text-carbon dark:text-white">{product.name}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-200 dark:border-gray-800">
                  <span className="text-gray-500 dark:text-gray-400">Item:</span>
                  <span className="font-black text-carbon dark:text-white flex items-center gap-1.5 text-right">
                    <GameCurrencyIcon slugOrName={product.slug} className="w-4 h-4 shrink-0" />
                    <span className="line-clamp-1">{selectedItem?.name}</span>
                  </span>
                </div>
                {isInstantPremium ? (
                  <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-800">
                    <span className="text-gray-500 dark:text-gray-400">Pengiriman:</span>
                    <span className="font-black text-[#5c4ade] dark:text-[#a78bfa] uppercase">
                      Kredensial Instan (24/7)
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-800">
                    <span className="text-gray-500 dark:text-gray-400">Target ID:</span>
                    <span className="font-black text-carbon dark:text-white">
                      {targetUserId || "—"} {targetZoneId ? `(${targetZoneId})` : ""}
                    </span>
                  </div>
                )}
              </div>

              {/* Price Box inside Modal */}
              <div className="p-3 bg-[#ffd731] ink-border rounded-xl flex items-center justify-between mt-2">
                <div>
                  <span className="text-[10px] font-black uppercase text-black block">
                    Total Estimasi:
                  </span>
                  <span className="text-xs text-black/80 font-bold block">
                    + kode unik sistem
                  </span>
                </div>
                <div className="text-xl font-black text-black font-[var(--font-bricolage)]">
                  Rp {finalPrice.toLocaleString("id-ID")}
                </div>
              </div>
            </div>

            {/* 2. Tahap Metode Pembayaran (QRIS) */}
            <div className="bg-white dark:bg-[#1a1a26] ink-border dark:border-[#38384a] rounded-2xl p-4 space-y-2.5 shadow-[2px_2px_0px_0px_#000000]">
              <div className="flex items-center justify-between pb-2 border-b border-carbon dark:border-[#38384a]">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-carbon text-white dark:bg-[#ffd731] dark:text-black flex items-center justify-center font-black text-[10px]">
                    2
                  </span>
                  <span className="font-[var(--font-bricolage)] text-xs font-black uppercase text-carbon dark:text-white">
                    Metode Pembayaran
                  </span>
                </div>
                <span className="text-[9px] font-black uppercase text-black bg-[#ffd731] px-2 py-0.5 rounded ink-border">
                  BIAYA RP 0
                </span>
              </div>

              <div className="p-3 bg-[#f3f4f6] dark:bg-[#20202e] ink-border dark:border-[#38384a] rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg bg-white dark:bg-[#2c2c3e] ink-border dark:border-[#38384a] flex items-center justify-center font-black text-xs text-carbon dark:text-white shadow-[1px_1px_0px_0px_#000000]">
                    QRIS
                  </div>
                  <div>
                    <span className="text-xs font-black text-carbon dark:text-white uppercase block">
                      QRIS Dinamis Otomatis
                    </span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold block">
                      BCA, Mandiri, BRI, GoPay, DANA, ShopeePay
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-black text-green-700 dark:text-green-400">GRATIS</span>
              </div>
            </div>

            {/* 3. Tahap Kontak Pengiriman */}
            <div className="bg-white dark:bg-[#1a1a26] ink-border dark:border-[#38384a] rounded-2xl p-4 space-y-3 shadow-[2px_2px_0px_0px_#000000]">
              <div className="flex items-center justify-between pb-2 border-b border-carbon dark:border-[#38384a]">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-carbon text-white dark:bg-[#ffd731] dark:text-black flex items-center justify-center font-black text-[10px]">
                    3
                  </span>
                  <span className="font-[var(--font-bricolage)] text-xs font-black uppercase text-carbon dark:text-white">
                    {isInstantPremium ? "Kontak Penerima Akun & Invoice" : "Kontak Bukti Invoice"}
                  </span>
                </div>
                <span className="text-[9px] font-black uppercase text-gray-500 dark:text-gray-400">
                  TANPA LOGIN
                </span>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="customer-email-mobile" className="text-xs font-black uppercase text-carbon dark:text-white flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{isInstantPremium ? "Email Penerima Kredensial & Struk" : "Alamat Email"}</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  id="customer-email-mobile"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="Contoh: emailmu@gmail.com"
                  className="w-full px-4 py-2.5 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border dark:border-[#38384a] text-xs font-bold text-carbon dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:bg-white dark:focus:bg-[#27273a] transition-colors"
                  required
                />
                {isInstantPremium && (
                  <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-1">
                    * Kredensial akun resmi & invoice otomatis dikirimkan ke email ini.
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="customer-phone-mobile" className="text-xs font-black uppercase text-carbon dark:text-white flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Nomor WhatsApp (Opsional)</span>
                </label>
                <input
                  id="customer-phone-mobile"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Contoh: 08123456789"
                  className="w-full px-4 py-2.5 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border dark:border-[#38384a] text-xs font-bold text-carbon dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:bg-white dark:focus:bg-[#27273a] transition-colors"
                />
              </div>

              {/* Promo Code Box (Mobile Modal) */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[11px] font-black uppercase text-carbon dark:text-white flex items-center gap-1.5">
                    <Tag className="w-3 h-3" />
                    <span>Kupon Diskon</span>
                  </label>
                  {activeCoupons.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowCouponList((prev) => !prev)}
                      className="text-[10px] font-black uppercase text-[#5c4ade] dark:text-[#ffd731] hover:underline cursor-pointer"
                    >
                      {showCouponList ? "Tutup" : `Lihat Kupon (${activeCoupons.length})`}
                    </button>
                  )}
                </div>
                {showCouponList && activeCoupons.length > 0 && (
                  <div className="space-y-1.5 py-1">
                    {activeCoupons.map((c) => {
                      const minSpendMet = !c.minSpend || (selectedItem?.price || 0) >= c.minSpend;
                      const discountLabel =
                        c.type === "percent"
                          ? `Diskon ${c.value}%`
                          : `Potongan Rp ${c.value.toLocaleString("id-ID")}`;
                      return (
                        <div
                          key={c.id}
                          className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#fbfbfd] dark:bg-[#20202e] ink-border dark:border-[#38384a]"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[11px] font-black uppercase text-carbon dark:text-white">
                                {c.code}
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-[#55db9c] text-black text-[9px] font-black">
                                {discountLabel}
                              </span>
                            </div>
                            {c.minSpend && (
                              <p className="text-[9.5px] text-gray-500 dark:text-gray-400 font-semibold">
                                Min. Rp {c.minSpend.toLocaleString("id-ID")}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            disabled={!minSpendMet}
                            onClick={() => {
                              handleApplyPromo(selectedItem?.price, c.code);
                              setShowCouponList(false);
                            }}
                            className={`px-2.5 py-1 rounded-lg ink-border text-[10px] font-black uppercase shrink-0 ${
                              minSpendMet
                                ? "bg-[#ffd731] text-black cursor-pointer"
                                : "bg-gray-200 dark:bg-[#2a2a3a] text-gray-500 dark:text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            {appliedPromo === c.code ? "Dipakai" : minSpendMet ? "Pakai" : "Kurang"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    placeholder="XYZPEDIA"
                    className="flex-1 px-3 py-2 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border text-xs font-black uppercase tracking-wider text-carbon dark:text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyPromo()}
                    className="px-3 py-2 bg-black text-white dark:bg-[#ffd731] dark:text-black font-black text-xs uppercase rounded-xl ink-border cursor-pointer shadow-[2px_2px_0px_#000000]"
                  >
                    Terapkan
                  </button>
                </div>
                {promoMessage && (
                  <div className={`flex items-center gap-1.5 p-1.5 rounded-lg border mt-1.5 ${
                    appliedPromo
                      ? "bg-green-500/10 border-green-500/40 text-green-700 dark:text-green-300"
                      : "bg-red-500/10 border-red-500/40 text-red-600 dark:text-red-400"
                  }`}>
                    <div className="w-5 h-5 shrink-0">
                      <img
                        src={appliedPromo ? "/brand/ekspresi/xyzi-rayakan.svg" : "/brand/ekspresi/xyzi-maaf.svg"}
                        alt="XYZI"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <p className="text-[10px] font-bold">
                      {promoMessage}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Error Message inside modal */}
            {errorMessage && (
              <div className="p-3 bg-[#ffdad6] dark:bg-[#3d141a] ink-border dark:border-[#5c1d28] rounded-xl text-xs font-black text-[#93000a] dark:text-[#fca5a5] animate-in fade-in">
                ⚠️ {errorMessage}
              </div>
            )}

            {/* Final Execution Button inside Modal */}
            <button
              type="submit"
              disabled={isSubmitting || selectedItem?.stockStatus === "OUT_OF_STOCK"}
              className={`w-full py-3.5 rounded-xl ink-border text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                selectedItem?.stockStatus === "OUT_OF_STOCK"
                  ? "bg-gray-200 dark:bg-[#252535] text-gray-500 dark:text-gray-400 cursor-not-allowed shadow-none"
                  : "bg-carbon text-white dark:bg-[#ffd731] dark:text-black hover:bg-[#fb4903] active:scale-95 shadow-[2px_2px_0px_0px_#ffd731] hover:shadow-[3px_3px_0px_0px_#ffd731] disabled:opacity-50"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Membuat Pesanan...</span>
                </>
              ) : selectedItem?.stockStatus === "OUT_OF_STOCK" ? (
                <span>{outOfStockButton}</span>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Bayar Sekarang (QRIS)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center text-[10px] font-bold text-gray-500 dark:text-gray-400">
              🔒 100% Guest-Direct • Enkripsi Gateway Otomatis
            </div>
          </div>
        </div>
      )}

      {/* Modal Panduan Cara Cek ID Game */}
      {isIdGuideOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Panduan Cek ID Akun"
          onClick={() => setIsIdGuideOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-[#181824] ink-border-thick dark:border-[#38384a] rounded-3xl p-5 sm:p-6 shadow-[6px_6px_0px_#000000] space-y-4 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-[#38384a]">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#dceeff] dark:bg-[#20202e] ink-border flex items-center justify-center p-0.5 shrink-0">
                  <img
                    src="/brand/stiker/xyzi-stiker-cari.png"
                    alt="XYZI Cari ID"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-[#5c4ade] dark:text-[#ffd731] tracking-wider block">
                    Panduan Singkat
                  </span>
                  <h4 className="font-[var(--font-bricolage)] text-base font-black uppercase text-carbon dark:text-white">
                    Cara Cek ID {product.name}
                  </h4>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsIdGuideOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f3f4f6] dark:bg-[#252538] ink-border flex items-center justify-center text-carbon dark:text-white cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#fbfbfd] dark:bg-[#12121a] ink-border dark:border-[#38384a] text-xs font-semibold text-gray-700 dark:text-gray-200 leading-relaxed space-y-2">
              {product.slug.includes("mobile-legends") || product.slug.includes("magic-chess") ? (
                <>
                  <p>1. Buka game <strong>{product.name}</strong> di perangkatmu.</p>
                  <p>2. Ketuk <strong>foto profil</strong> di pojok kiri atas lobi utama.</p>
                  <p>3. Lihat angka di bawah nama/samping kanan: formatnya <strong>User ID (Zone ID)</strong>, contoh: <code>123456789 (1234)</code>.</p>
                  <p>4. Masukkan angka depan ke kolom User ID, dan 4–5 angka di dalam kurung ke kolom Zone ID.</p>
                </>
              ) : product.slug.includes("free-fire") ? (
                <>
                  <p>1. Buka game <strong>Free Fire</strong> dan masuk ke lobi.</p>
                  <p>2. Ketuk <strong>banner profil</strong> di pojok kiri atas.</p>
                  <p>3. Salin angka <strong>ID</strong> yang tertera tepat di bawah nickname kamu.</p>
                </>
              ) : product.slug.includes("pubg") ? (
                <>
                  <p>1. Buka game <strong>PUBG Mobile</strong>.</p>
                  <p>2. Ketuk <strong>avatar profil</strong> di pojok kanan atas lobi.</p>
                  <p>3. Lihat angka <strong>ID Karakter</strong> yang tertera di bawah nickname/foto profilmu.</p>
                </>
              ) : product.slug.includes("valorant") ? (
                <>
                  <p>1. Buka <strong>Riot Client</strong> atau game <strong>Valorant</strong>.</p>
                  <p>2. Arahkan kursor ke ikon profil di pojok kanan atas.</p>
                  <p>3. Masukkan lengkap dengan tag-nya, contoh: <code>Username#1234</code>.</p>
                </>
              ) : product.slug.includes("genshin") ? (
                <>
                  <p>1. Buka menu <strong>Paimon</strong> (ikon pojok kiri atas layar).</p>
                  <p>2. Salin 9 digit <strong>UID</strong> yang muncul di bawah avatar, lalu pilih Server sesuai akunmu.</p>
                </>
              ) : (
                <>
                  <p>1. Buka game <strong>{product.name}</strong> dan masuk ke halaman <strong>Profil / Pengaturan Akun</strong>.</p>
                  <p>2. Salin <strong>{product.targetInputLabel}</strong>{product.requiresServer ? " dan Server/Zone ID" : ""} sesuai yang tampil di layar game.</p>
                  <p>3. Pastikan tidak ada spasi tambahan sebelum lanjut bayar.</p>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsIdGuideOpen(false)}
              className="w-full py-2.5 bg-carbon text-white dark:bg-[#ffd731] dark:text-black rounded-xl ink-border text-xs font-black uppercase tracking-wider cursor-pointer"
            >
              Oke, Mengerti
            </button>
          </div>
        </div>
      )}

      {/* Pop-up Modal Status Pemeliharaan Sistem Pembayaran */}
      <PaymentMaintenanceModal
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        productName={product.name}
        itemName={selectedItem?.name}
        targetId={targetUserId ? `${targetUserId}${targetZoneId ? ` (${targetZoneId})` : ""}` : undefined}
        totalPrice={finalPrice}
        badge={condition.badge}
        title={condition.title}
        description={condition.description}
        secondaryText={condition.secondaryText}
        estimatedTime={condition.estimatedTime}
      />

      {/* 
        ============================================================
        POP-UP KONFIRMASI NICKNAME GAME & DATA PESANAN OTOMATIS
        Modal validasi pre-checkout dengan styling Neo-Brutalist
        ============================================================
      */}
      {isConfirmOrderOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Konfirmasi Data Akun & Pesanan"
          onKeyDown={(e) => {
            if (e.key === "Escape" && !isSubmitting) setIsConfirmOrderOpen(false);
          }}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
        >
          <div className="w-full max-w-md bg-white dark:bg-[#161622] rounded-3xl ink-border-thick dark:border-[#38384a] p-5 sm:p-6 shadow-[6px_6px_0px_0px_#000000] max-h-[92vh] overflow-y-auto space-y-4 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b-2 border-carbon dark:border-[#38384a]">
              <div>
                <span className="text-[10px] font-black uppercase text-[#fb4903] bg-[#fb4903]/10 px-2 py-0.5 rounded ink-border inline-block tracking-wider">
                  VERIFIKASI PRE-CHECKOUT
                </span>
                <h3 className="font-[var(--font-bricolage)] text-lg sm:text-xl font-black uppercase text-carbon dark:text-white leading-tight mt-1">
                  {product.categorySlug === "akun-premium"
                    ? "Konfirmasi Akun Premium"
                    : product.categorySlug === "pulsa-ewallet"
                    ? "Konfirmasi Isi Pulsa / E-Wallet"
                    : product.categorySlug === "voucher-digital"
                    ? "Konfirmasi Voucher Digital"
                    : "Konfirmasi Akun Game"}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => !isSubmitting && setIsConfirmOrderOpen(false)}
                disabled={isSubmitting}
                className="w-8 h-8 rounded-full bg-[#f3f4f6] dark:bg-[#252538] hover:bg-[#ffdad6] active:scale-90 ink-border dark:border-[#38384a] flex items-center justify-center text-carbon dark:text-white transition-all cursor-pointer disabled:opacity-50"
                aria-label="Tutup modal"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* In-Game Nickname Highlight Card */}
            {(product.categorySlug === "game-topup" || product.requiresServer || checkedNickname) && (
              <div className="rounded-2xl ink-border p-3.5 space-y-2 bg-gradient-to-br from-[#f8f9fa] to-[#edf2f7] dark:from-[#1a1a2e] dark:to-[#131320] shadow-[2px_2px_0px_#000000]">
                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <Gamepad2 className="w-3.5 h-3.5 text-[#fb4903]" />
                    <span>Data Akun Pemain</span>
                  </span>
                  {checkedNickname && (
                    <span className="px-2 py-0.5 bg-[#22c55e] text-white text-[9px] font-black rounded-full ink-border flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>TERVERIFIKASI</span>
                    </span>
                  )}
                </div>

                {checkedNickname ? (
                  <div className="p-3 bg-[#22c55e]/15 border-2 border-[#16a34a] rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-[#16a34a] block">
                        Nickname In-Game:
                      </span>
                      <span className="text-base sm:text-lg font-black text-carbon dark:text-white font-[var(--font-bricolage)]">
                        {checkedNickname}
                      </span>
                    </div>
                    <span className="text-2xl">🎮</span>
                  </div>
                ) : nicknameStatus === "CHECKING" ? (
                  <div className="p-3 bg-[#ffd731]/20 border-2 border-black rounded-xl flex items-center gap-2 text-xs font-bold text-carbon dark:text-white">
                    <Clock className="w-4 h-4 animate-spin text-[#fb4903]" />
                    <span>Sedang memverifikasi Nickname Akun...</span>
                  </div>
                ) : nicknameStatus === "INVALID" ? (
                  <div className="p-3 bg-[#ef4444]/15 border-2 border-[#dc2626] rounded-xl text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-black text-[#dc2626]">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Nickname Tidak Ditemukan!</span>
                    </div>
                    <p className="text-[11px] text-gray-700 dark:text-gray-300 font-semibold leading-relaxed">
                      Pastikan User ID dan Server yang Anda masukkan sudah benar agar diamond terkirim ke akun Anda.
                    </p>
                  </div>
                ) : (
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-600 rounded-xl text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>Format User ID tersimpan dan siap diproses sistem.</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-bold">
                  <div className="p-2 bg-white dark:bg-[#161622] rounded-lg border border-gray-300 dark:border-gray-700">
                    <span className="text-[9px] text-gray-500 block uppercase font-black">User ID:</span>
                    <span className="font-mono font-black text-carbon dark:text-white truncate block">
                      {targetUserId}
                    </span>
                  </div>
                  {product.requiresServer && (
                    <div className="p-2 bg-white dark:bg-[#161622] rounded-lg border border-gray-300 dark:border-gray-700">
                      <span className="text-[9px] text-gray-500 block uppercase font-black">Server / Zone:</span>
                      <span className="font-mono font-black text-carbon dark:text-white truncate block">
                        {targetZoneId || "—"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Ringkasan Item & Pembayaran */}
            <div className="bg-[#fbfbfd] dark:bg-[#1f1f2e] ink-border dark:border-[#38384a] rounded-2xl p-3.5 space-y-2 text-xs font-bold shadow-[2px_2px_0px_#000000]">
              <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Produk:</span>
                <span className="font-black text-carbon dark:text-white text-right">{product.name}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-gray-200 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Nominal:</span>
                <span className="font-black text-carbon dark:text-white text-right">{selectedItem?.name}</span>
              </div>
              {!isInstantPremium && targetUserId && (product.categorySlug !== "game-topup" && !product.requiresServer) && (
                <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-800">
                  <span className="text-gray-500 dark:text-gray-400">
                    {product.targetInputLabel || (product.categorySlug === "akun-premium" ? "Email / No. Akun:" : "No. Tujuan:")}
                  </span>
                  <span className="font-black text-carbon dark:text-white truncate max-w-[200px]">
                    {targetUserId}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">
                  {isInstantPremium ? "Email Penerima Kredensial:" : "Email Struk:"}
                </span>
                <span className="font-black text-carbon dark:text-white truncate max-w-[200px]">
                  {customerEmail || targetUserId}
                </span>
              </div>
              {customerPhone && (
                <div className="flex justify-between py-1 border-b border-gray-200 dark:border-gray-800">
                  <span className="text-gray-500 dark:text-gray-400">No. WhatsApp:</span>
                  <span className="font-black text-carbon dark:text-white">{customerPhone}</span>
                </div>
              )}

              {/* Total Price Box */}
              <div className="p-3 bg-[#ffd731] ink-border rounded-xl flex items-center justify-between mt-2">
                <div>
                  <span className="text-[10px] font-black uppercase text-black block">Total Bayar:</span>
                  <span className="text-[10px] text-black/80 font-bold block">+ kode unik sistem</span>
                </div>
                <div className="text-xl font-black text-black font-[var(--font-bricolage)]">
                  Rp {finalPrice.toLocaleString("id-ID")}
                </div>
              </div>
            </div>

            {/* Error Message if any */}
            {errorMessage && (
              <div className="p-3 bg-[#ffdad6] dark:bg-[#3d141a] ink-border dark:border-[#5c1d28] rounded-xl text-xs font-black text-[#93000a] dark:text-[#fca5a5] animate-in fade-in">
                ⚠️ {errorMessage}
              </div>
            )}

            {/* Disclaimer Alert */}
            <div className="p-2.5 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-300 dark:border-yellow-700/50 rounded-xl text-[10px] font-bold text-yellow-900 dark:text-yellow-200 leading-relaxed">
              ⚠️ <strong>Penting:</strong>{" "}
              {isInstantPremium
                ? "Kredensial akun resmi (email & password) akan terbit instan dan langsung dikirimkan ke email penerima di atas setelah pembayaran QRIS lunas."
                : product.categorySlug === "akun-premium"
                ? "Detail akun / akses langganan resmi akan dikirimkan ke email atau diserahkan admin setelah pembayaran QRIS lunas. Pastikan email Anda sudah benar."
                : product.categorySlug === "pulsa-ewallet"
                ? "Pulsa / saldo e-wallet akan otomatis ditransfer ke nomor tujuan setelah pembayaran QRIS lunas. Pastikan nomor tujuan Anda sudah benar."
                : product.categorySlug === "voucher-digital"
                ? "Kode voucher digital akan dikirimkan ke email dan ditampilkan langsung setelah pembayaran QRIS lunas."
                : "Pesanan langsung diinjeksi ke akun ID di atas setelah pembayaran QRIS lunas. Transaksi yang salah input ID tidak dapat dibatalkan atau ditarik kembali."}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setIsConfirmOrderOpen(false)}
                disabled={isSubmitting}
                className="py-3 px-4 rounded-xl ink-border bg-gray-100 hover:bg-gray-200 dark:bg-[#252535] dark:hover:bg-[#2d2d40] text-carbon dark:text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 text-center"
              >
                Ubah Data
              </button>

              <button
                type="button"
                onClick={handleExecuteOrder}
                disabled={isSubmitting}
                className="py-3 px-4 rounded-xl ink-border bg-[#ffd731] hover:bg-[#ffe266] text-black text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 text-center"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Bayar Sekarang</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
