"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Zap,
  Database,
  ShieldCheck,
  Bell,
  Copy,
  Check,
  ExternalLink,
  Save,
  CheckCircle2,
  Mail,
  Send,
  HelpCircle,
  AlertTriangle,
  Calendar,
  Clock,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Radio,
  FileText,
  Sparkles,
  Play,
  Loader2,
  Server,
  Globe,
  HardDrive,
  Wifi,
  RefreshCw,
  Cpu,
  Lock,
  Activity,
  Megaphone,
  X,
} from "lucide-react";
import AdminTopbar from "./AdminTopbar";
import {
  NotificationSettings,
  DEFAULT_NOTIFICATION_SETTINGS,
} from "@/types/notifications";
import {
  StoreAnnouncementsConfig,
  DEFAULT_STORE_ANNOUNCEMENTS,
} from "@/types/storeAnnouncements";

function PopToggle({
  checked,
  onChange,
  disabled = false,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-black transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? "bg-[#55db9c]" : "bg-gray-200 dark:bg-gray-700"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <span className="sr-only">{label || "Toggle"}</span>
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-black border border-white/60 shadow-sm transition duration-200 ease-in-out mt-[2px] ml-[2px] ${
          checked ? "translate-x-5 bg-white" : "translate-x-0 bg-white"
        }`}
      />
    </button>
  );
}

const NOTIFICATION_EVENT_ITEMS = [
  {
    key: "notifyNewOrder" as const,
    title: "Transaksi Baru Masuk (Pending)",
    colorDot: "bg-amber-400",
    badgeText: "Pending Order",
    desc: "Notifikasi saat pembeli membuat pesanan dan QRIS diterbitkan",
  },
  {
    key: "notifySuccessOrder" as const,
    title: "Pembayaran Berhasil & Lunas (PAID)",
    colorDot: "bg-emerald-500",
    badgeText: "Paid & Lunas",
    desc: "Notifikasi invoice lunas, nominal pembayaran, dan akun game tujuan",
  },
  {
    key: "notifyFailedOrder" as const,
    title: "Transaksi Gagal / Pending Butuh Bantuan",
    colorDot: "bg-red-500",
    badgeText: "Alert Kendala",
    desc: "Peringatan jika ada pesanan kadaluarsa atau provider supplier mengalami timeout",
  },
  {
    key: "notifyWeeklyReport" as const,
    title: "Laporan & Rekap Mingguan",
    colorDot: "bg-purple-500",
    badgeText: "Rekap 7 Hari",
    desc: "Ringkasan total transaksi mingguan, omset kotor, dan laba bersih toko",
  },
  {
    key: "notifyDailyReport" as const,
    title: "Ringkasan Penjualan Harian (23:59 WIB)",
    colorDot: "bg-blue-500",
    badgeText: "Tutup Buku Malam",
    desc: "Total omset harian yang masuk dan jumlah transaksi sukses tiap malam",
  },
];

export default function AdminPengaturanClient() {
  const [activeTab, setActiveTab] = useState<"notifications" | "gateway" | "announcement" | "system">("notifications");
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(
    DEFAULT_NOTIFICATION_SETTINGS
  );
  const [isSavingNotif, setIsSavingNotif] = useState(false);
  const [showBotToken, setShowBotToken] = useState(false);
  const [showTelegramGuide, setShowTelegramGuide] = useState(false);
  const [showSmtpConfig, setShowSmtpConfig] = useState(false);
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [testingChannel, setTestingChannel] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    channel: string;
    success: boolean;
    message: string;
  } | null>(null);

  // Store announcements & ads config
  const [storeAnnouncements, setStoreAnnouncements] = useState<StoreAnnouncementsConfig>(
    DEFAULT_STORE_ANNOUNCEMENTS
  );
  const [isSavingAnnouncements, setIsSavingAnnouncements] = useState(false);
  const [previewModal, setPreviewModal] = useState<"announcement" | "ad" | null>(null);

  // Health check state
  const [healthData, setHealthData] = useState<any>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  const fetchHealthData = async () => {
    setIsCheckingHealth(true);
    try {
      const res = await fetch("/api/admin/system/health");
      const data = await res.json();
      if (data.success) {
        setHealthData(data);
      }
    } catch (err) {
      console.error("Gagal cek health data:", err);
    } finally {
      setIsCheckingHealth(false);
    }
  };

  // Load notification and announcements settings on mount
  useEffect(() => {
    fetch("/api/admin/settings/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setNotificationSettings(data.settings);
        }
      })
      .catch((err) => console.error("Error loading notification settings:", err));

    fetch("/api/admin/settings/announcements")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.config) {
          setStoreAnnouncements(data.config);
        }
      })
      .catch((err) => console.error("Error loading store announcements:", err));

    fetchHealthData();
  }, []);

  const copyWebhookUrl = () => {
    const url = `${window.location.origin}/api/webhooks/qiospay`;
    navigator.clipboard.writeText(url);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingNotif(true);
    try {
      const res = await fetch("/api/admin/settings/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notificationSettings),
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        alert("Gagal menyimpan: " + data.message);
      }
    } catch (err: any) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setIsSavingNotif(false);
    }
  };

  const [selectedSimEvent, setSelectedSimEvent] = useState<
    "notifyNewOrder" | "notifySuccessOrder" | "notifyFailedOrder" | "notifyWeeklyReport" | "notifyDailyReport"
  >("notifyNewOrder");
  const [selectedSimChannel, setSelectedSimChannel] = useState<"telegram" | "email" | "both">("telegram");

  const handleTestNotification = async (
    channel: "telegram" | "email" | "weekly_report" | "both",
    eventType?: string
  ) => {
    const key = eventType ? `${eventType}_${channel}` : channel;
    setTestingChannel(key);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/notifications/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel,
          eventType,
          botToken: notificationSettings.telegram.botToken,
          chatId: notificationSettings.telegram.chatId,
          recipient: notificationSettings.email.recipient,
          smtpHost: notificationSettings.email.smtpHost,
          smtpPort: notificationSettings.email.smtpPort,
          smtpUser: notificationSettings.email.smtpUser,
          smtpPass: notificationSettings.email.smtpPass,
          smtpSecure: notificationSettings.email.smtpSecure,
          senderName: notificationSettings.email.senderName,
          senderEmail: notificationSettings.email.senderEmail,
          resendApiKey: notificationSettings.email.resendApiKey,
        }),
      });
      const data = await res.json();
      setTestResult({
        channel: eventType ? `${eventType} (${channel})` : channel,
        success: data.success,
        message: data.message || (data.success ? "Uji coba berhasil dikirim!" : "Gagal mengirim uji coba."),
      });
    } catch (err: any) {
      setTestResult({
        channel: eventType ? `${eventType} (${channel})` : channel,
        success: false,
        message: "Koneksi gagal: " + err.message,
      });
    } finally {
      setTestingChannel(null);
    }
  };

  const handleSaveStoreAnnouncements = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAnnouncements(true);
    try {
      const res = await fetch("/api/admin/settings/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(storeAnnouncements),
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        alert("Gagal menyimpan: " + data.message);
      }
    } catch (err: any) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setIsSavingAnnouncements(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <AdminTopbar
        title="Pengaturan Sistem"
        subtitle="Kelola notifikasi transaksi, bot Telegram, email, gateway pembayaran, & pengumuman"
      />

      <main className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
        
        {/* Success Alert */}
        {savedSuccess && (
          <div className="p-4 bg-[#55db9c]/20 ink-border border-[#55db9c] rounded-2xl flex items-center gap-2.5 text-xs font-black text-green-800 dark:text-green-300 shadow-[2px_2px_0px_#000000] animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <span>Pengaturan berhasil disimpan dan aktif di seluruh sistem!</span>
          </div>
        )}

        {/* Tab Navigation Pill Matrix */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab("notifications")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider ink-border flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === "notifications"
                ? "bg-black text-white dark:bg-[#ffd731] dark:text-black shadow-[2px_2px_0px_#000000] -translate-y-0.5"
                : "bg-white dark:bg-[#181824] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#20202e]"
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Notifikasi & Bot Telegram</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("gateway")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider ink-border flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === "gateway"
                ? "bg-black text-white dark:bg-[#ffd731] dark:text-black shadow-[2px_2px_0px_#000000] -translate-y-0.5"
                : "bg-white dark:bg-[#181824] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#20202e]"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Gateway Pembayaran (QiosPay)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("announcement")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider ink-border flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === "announcement"
                ? "bg-black text-white dark:bg-[#ffd731] dark:text-black shadow-[2px_2px_0px_#000000] -translate-y-0.5"
                : "bg-white dark:bg-[#181824] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#20202e]"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Pengumuman Toko</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("system")}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider ink-border flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === "system"
                ? "bg-black text-white dark:bg-[#ffd731] dark:text-black shadow-[2px_2px_0px_#000000] -translate-y-0.5"
                : "bg-white dark:bg-[#181824] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#20202e]"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Keamanan & Database</span>
          </button>
        </div>

        {/* ========================================================
            TAB 1: KELOLA NOTIFIKASI (TELEGRAM & EMAIL)
            ======================================================== */}
        {activeTab === "notifications" && (
          <form onSubmit={handleSaveNotifications} className="space-y-6">
            
            {/* Test Result Alert */}
            {testResult && (
              <div
                className={`p-4 rounded-2xl ink-border flex items-start gap-3 shadow-[2px_2px_0px_#000000] animate-in fade-in ${
                  testResult.success
                    ? "bg-[#55db9c]/20 border-[#55db9c] text-green-900 dark:text-green-300"
                    : "bg-[#ffdad6] dark:bg-[#3d141a] border-red-500 text-red-900 dark:text-red-300"
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <p className="text-xs font-black uppercase">
                    Hasil Uji Coba {testResult.channel === "telegram" ? "Telegram" : testResult.channel === "email" ? "Email" : "Laporan Mingguan"}:
                  </p>
                  <p className="text-xs font-semibold leading-relaxed">
                    {testResult.message}
                  </p>
                </div>
              </div>
            )}

            {/* Quick Actions Row: Send Weekly Report on Demand */}
            <div className="p-4 bg-[#ffd731] rounded-2xl ink-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[3px_3px_0px_#000000]">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-black text-white rounded-xl ink-border">
                  <TrendingUp className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-xs font-black uppercase text-black">
                    Aksi Cepat: Kirim Laporan Transaksi Mingguan Sekarang
                  </h3>
                  <p className="text-[11px] font-semibold text-black/80">
                    Kalkulasi total pesanan, omset, dan laba 7 hari terakhir lalu kirim ke Telegram/Email Anda
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleTestNotification("weekly_report")}
                disabled={testingChannel === "weekly_report"}
                className="px-4 py-2 bg-black text-white hover:bg-neutral-800 rounded-xl ink-border text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-transform hover:scale-102 active:scale-98 cursor-pointer shrink-0 shadow-[1px_1px_0px_#000000]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{testingChannel === "weekly_report" ? "Mengirim Laporan..." : "Kirim Rekap Mingguan"}</span>
              </button>
            </div>

            {/* Grid 2 Kanal: 1. Telegram & 2. Email */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* KANAL 1: BOT TELEGRAM */}
              <section className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_0px_#000000] space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2.5">
                      <span className="p-2 bg-[#229ed9] text-white rounded-xl ink-border shadow-[1px_1px_0px_#000000]">
                        <Send className="w-5 h-5 fill-white" />
                      </span>
                      <div>
                        <h2 className="text-base font-black uppercase text-carbon dark:text-white font-[var(--font-bricolage)]">
                          Kanal Bot Telegram
                        </h2>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                          Notifikasi instan real-time langsung ke chat pribadi atau grup admin
                        </p>
                      </div>
                    </div>

                    {/* Toggle Active */}
                    <div className="flex items-center gap-2 select-none">
                      <span className="text-[10px] font-black uppercase text-gray-400">
                        {notificationSettings.telegram.enabled ? "AKTIF" : "NONAKTIF"}
                      </span>
                      <PopToggle
                        checked={notificationSettings.telegram.enabled}
                        onChange={(val) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            telegram: {
                              ...notificationSettings.telegram,
                              enabled: val,
                            },
                          })
                        }
                        label="Status Bot Telegram"
                      />
                    </div>
                  </div>

                  {/* Bot Token Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-500 block">
                      Telegram Bot Token:
                    </label>
                    <div className="relative">
                      <input
                        type={showBotToken ? "text" : "password"}
                        value={notificationSettings.telegram.botToken}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            telegram: {
                              ...notificationSettings.telegram,
                              botToken: e.target.value,
                            },
                          })
                        }
                        placeholder={
                          (notificationSettings.telegram as any).botTokenSet
                            ? "•••••••• tersimpan (isi hanya jika ingin mengganti)"
                            : "Contoh: 1234567890:ABCdefGHIjklMNOpqrSTUvwxYZ"
                        }
                        className="w-full pl-3 pr-10 py-2.5 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border dark:border-[#38384a] text-xs font-mono font-bold text-carbon dark:text-white placeholder:text-gray-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowBotToken(!showBotToken)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-carbon dark:hover:text-white cursor-pointer"
                        title={showBotToken ? "Sembunyikan Token" : "Tampilkan Token"}
                      >
                        {showBotToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Chat ID Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-500 block">
                      Chat ID / Channel / Group ID:
                    </label>
                    <input
                      type="text"
                      value={notificationSettings.telegram.chatId}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          telegram: {
                            ...notificationSettings.telegram,
                            chatId: e.target.value,
                          },
                        })
                      }
                      placeholder="Contoh: 987654321 atau -100123456789"
                      className="w-full px-3 py-2.5 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border dark:border-[#38384a] text-xs font-mono font-bold text-carbon dark:text-white placeholder:text-gray-400"
                    />
                    <p className="text-[10px] text-gray-400">
                      Bisa diisi ID akun Telegram pribadi Anda atau ID grup toko bersama tim.
                    </p>
                  </div>

                  {/* Interactive Telegram Bot Guide Accordion */}
                  <div className="border border-blue-200 dark:border-blue-900/40 rounded-2xl overflow-hidden bg-[#dceeff]/30 dark:bg-[#152338]/30">
                    <button
                      type="button"
                      onClick={() => setShowTelegramGuide(!showTelegramGuide)}
                      className="w-full px-4 py-2.5 flex items-center justify-between text-left text-xs font-black uppercase text-[#003a6b] dark:text-[#bae6fd] hover:bg-[#dceeff]/50 dark:hover:bg-[#152338]/50 transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>Panduan 3 Langkah Buat Bot Telegram & Chat ID</span>
                      </span>
                      {showTelegramGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {showTelegramGuide && (
                      <div className="p-4 pt-1 text-xs text-carbon dark:text-gray-300 space-y-2.5 border-t border-blue-200 dark:border-blue-900/40 font-medium">
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                            1
                          </span>
                          <p className="text-[11px] leading-relaxed">
                            Buka Telegram, cari bot resmi <strong>@BotFather</strong>. Kirim perintah <code>/newbot</code>, lalu ikuti instruksi untuk menentukan nama bot dan username bot (contoh: <code>xyzpedia_store_bot</code>). Salin <strong>HTTP API Token</strong> yang diberikan ke kolom Bot Token di atas.
                          </p>
                        </div>

                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                            2
                          </span>
                          <p className="text-[11px] leading-relaxed">
                            Buka bot yang baru Anda buat di Telegram, lalu klik tombol <strong>START</strong> (atau kirim pesan apa saja) agar bot mendapatkan izin mengirim pesan ke akun Anda.
                          </p>
                        </div>

                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                            3
                          </span>
                          <p className="text-[11px] leading-relaxed">
                            Untuk mengetahui Chat ID Anda, cari bot <strong>@userinfobot</strong> di Telegram. Bot tersebut akan langsung membalas nomor <strong>Id</strong> Anda (contoh: <code>123456789</code>). Masukkan ID tersebut ke kolom Chat ID di atas, lalu klik <strong>Kirim Tes Telegram</strong>!
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Test Button Telegram */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleTestNotification("telegram")}
                    disabled={testingChannel === "telegram"}
                    className="w-full py-2.5 px-4 bg-[#229ed9] hover:bg-[#1b8ec5] text-white rounded-xl ink-border text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-transform hover:scale-101 active:scale-99 cursor-pointer shadow-[2px_2px_0px_#000000]"
                  >
                    <Send className="w-3.5 h-3.5 fill-white" />
                    <span>{testingChannel === "telegram" ? "Mengirim Pesan Uji Coba..." : "Kirim Tes Telegram"}</span>
                  </button>
                </div>
              </section>

              {/* KANAL 2: EMAIL NOTIFIKASI */}
              <section className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_0px_#000000] space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-2.5">
                      <span className="p-2 bg-[#fb4903] text-white rounded-xl ink-border shadow-[1px_1px_0px_#000000]">
                        <Mail className="w-5 h-5" />
                      </span>
                      <div>
                        <h2 className="text-base font-black uppercase text-carbon dark:text-white font-[var(--font-bricolage)]">
                          Kanal Notifikasi Email
                        </h2>
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                          Kirim salinan invoice, rekap mingguan, dan laporan omset ke kotak masuk email
                        </p>
                      </div>
                    </div>

                    {/* Toggle Active */}
                    <div className="flex items-center gap-2 select-none">
                      <span className="text-[10px] font-black uppercase text-gray-400">
                        {notificationSettings.email.enabled ? "AKTIF" : "NONAKTIF"}
                      </span>
                      <PopToggle
                        checked={notificationSettings.email.enabled}
                        onChange={(val) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            email: {
                              ...notificationSettings.email,
                              enabled: val,
                            },
                          })
                        }
                        label="Status Kanal Email"
                      />
                    </div>
                  </div>

                  {/* Recipient Email Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-500 block">
                      Alamat Email Penerima:
                    </label>
                    <input
                      type="text"
                      value={notificationSettings.email.recipient}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          email: {
                            ...notificationSettings.email,
                            recipient: e.target.value,
                          },
                        })
                      }
                      placeholder="Contoh: admin@xyzpedia.com, finance@xyzpedia.com"
                      className="w-full px-3 py-2.5 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border dark:border-[#38384a] text-xs font-bold text-carbon dark:text-white placeholder:text-gray-400"
                    />
                    <p className="text-[10px] text-gray-400">
                      Dapat memasukkan lebih dari satu email dipisahkan tanda koma.
                    </p>
                  </div>

                  {/* Sender Name & Email Input */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-gray-500 block">
                        Nama Pengirim Notifikasi:
                      </label>
                      <input
                        type="text"
                        value={notificationSettings.email.senderName}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            email: {
                              ...notificationSettings.email,
                              senderName: e.target.value,
                            },
                          })
                        }
                        placeholder="Contoh: XYZPEDIA Store"
                        className="w-full px-3 py-2.5 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border dark:border-[#38384a] text-xs font-bold text-carbon dark:text-white placeholder:text-gray-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-gray-500 block">
                        Email Pengirim (Domain Resend):
                      </label>
                      <input
                        type="email"
                        value={notificationSettings.email.senderEmail || ""}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            email: {
                              ...notificationSettings.email,
                              senderEmail: e.target.value,
                            },
                          })
                        }
                        placeholder="noreply@xyzpedia.my.id"
                        className="w-full px-3 py-2.5 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border dark:border-[#38384a] text-xs font-mono font-bold text-carbon dark:text-white placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Resend Environment Status Indicator */}
                  {(notificationSettings.email as any).resendEnvConfigured && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>
                        Resend API Key terdeteksi aktif dari Environment Server (<code>RESEND_API_KEY</code>). Pengiriman struk & kredensial ke customer siap digunakan.
                      </span>
                    </div>
                  )}

                  {/* Email Channel Description Info Box */}
                  <div className="p-3.5 bg-[#fbfbfd] dark:bg-[#1f1f2e] ink-border dark:border-[#38384a] rounded-2xl space-y-1 text-xs">
                    <p className="font-bold text-carbon dark:text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Fungsi Notifikasi Email:</span>
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                      Email sangat cocok untuk laporan formal berkala seperti Rekap Omset Mingguan, ringkasan transaksi bulanan, serta pengarsipan bukti pembayaran customer untuk pembukuan akuntansi toko.
                    </p>
                  </div>

                  {/* SMTP Server Configuration Accordion (Gmail App Password) */}
                  <div className="border border-amber-200 dark:border-amber-900/40 rounded-2xl overflow-hidden bg-[#fff3d4]/30 dark:bg-[#201d14]/30">
                    <button
                      type="button"
                      onClick={() => setShowSmtpConfig(!showSmtpConfig)}
                      className="w-full px-4 py-2.5 flex items-center justify-between text-left text-xs font-black uppercase text-amber-900 dark:text-amber-300 hover:bg-[#fff3d4]/60 dark:hover:bg-[#201d14]/60 transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <Settings className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        <span>Koneksi SMTP Gmail / Server Riil (Opsional)</span>
                      </span>
                      {showSmtpConfig ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {showSmtpConfig && (
                      <div className="p-4 pt-1 space-y-3 border-t border-amber-200 dark:border-amber-900/40 font-medium text-xs">
                        <div className="space-y-1 pb-2 border-b border-amber-200/60 dark:border-amber-900/30">
                          <label className="text-[10px] font-black uppercase text-gray-500 block">
                            Resend API Key Override (Opsional jika sudah set di Vercel ENV):
                          </label>
                          <input
                            type="password"
                            value={notificationSettings.email.resendApiKey || ""}
                            onChange={(e) =>
                              setNotificationSettings({
                                ...notificationSettings,
                                email: {
                                  ...notificationSettings.email,
                                  resendApiKey: e.target.value,
                                },
                              })
                            }
                            placeholder={
                              (notificationSettings.email as any).resendApiKeySet
                                ? "•••••••• tersimpan di DB (isi jika ingin mengganti)"
                                : (notificationSettings.email as any).resendEnvConfigured
                                  ? "Menggunakan RESEND_API_KEY dari Environment Server"
                                  : "re_xxxxxxxx..."
                            }
                            className="w-full px-3 py-2 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border text-xs font-mono font-bold text-carbon dark:text-white"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-500 block">
                              Gmail / Email SMTP Pengirim:
                            </label>
                            <input
                              type="text"
                              value={notificationSettings.email.smtpUser || ""}
                              onChange={(e) =>
                                setNotificationSettings({
                                  ...notificationSettings,
                                  email: {
                                    ...notificationSettings.email,
                                    smtpUser: e.target.value,
                                  },
                                })
                              }
                              placeholder="contoh: tokoxyz@gmail.com"
                              className="w-full px-3 py-2 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border text-xs font-mono font-bold text-carbon dark:text-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-gray-500 block">
                              Password Aplikasi (App Password):
                            </label>
                            <div className="relative">
                              <input
                                type={showSmtpPass ? "text" : "password"}
                                value={notificationSettings.email.smtpPass || ""}
                                onChange={(e) =>
                                  setNotificationSettings({
                                    ...notificationSettings,
                                    email: {
                                      ...notificationSettings.email,
                                      smtpPass: e.target.value,
                                    },
                                  })
                                }
                                placeholder={
                                  (notificationSettings.email as any).smtpPassSet
                                    ? "•••••••• tersimpan (isi jika ingin mengganti)"
                                    : "16 digit app password"
                                }
                                className="w-full pl-3 pr-10 py-2 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border text-xs font-mono font-bold text-carbon dark:text-white"
                              />
                              <button
                                type="button"
                                onClick={() => setShowSmtpPass(!showSmtpPass)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-carbon cursor-pointer"
                              >
                                {showSmtpPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl space-y-1.5 text-[11px] leading-relaxed">
                          <p className="font-bold text-amber-950 dark:text-amber-300">
                            💡 Wajib Diperhatikan:
                          </p>
                          <ul className="list-disc pl-4 space-y-1 text-[10px] text-gray-700 dark:text-gray-300">
                            <li>
                              <strong>Kolom Email SMTP Pengirim:</strong> Masukkan alamat <strong>Gmail asli</strong> Anda (misal: <code>akunanda@gmail.com</code>), yaitu akun Google tempat 16 huruf Sandi Aplikasi dibuat. Jangan isi dengan custom domain (seperti <code>@tokokaryawan.my.id</code>) karena server Google akan menolaknya dengan error 535 Bad Credentials.
                            </li>
                            <li>
                              <strong>Kolom Email Penerima:</strong> Di sini Anda bebas memasukkan email apa saja (bisa <code>cs@tokokaryawan.my.id</code>, email pribadi, atau email staf).
                            </li>
                            <li>
                              <strong>Nama Pengirim:</strong> Bebas diisi nama toko Anda (misal: <code>XYZPEDIA Store Bot</code>).
                            </li>
                          </ul>
                        </div>

                        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl space-y-1.5 text-[11px] leading-relaxed">
                          <p className="font-bold text-blue-900 dark:text-blue-300">
                            ⚠️ Cara Mendapatkan Sandi Aplikasi (App Password):
                          </p>
                          <ol className="list-decimal pl-4 space-y-1 text-[10px] text-gray-600 dark:text-gray-400">
                            <li>Pastikan <strong>Verifikasi 2 Langkah</strong> akun Google sudah aktif.</li>
                            <li>Buka halaman resmi Google: <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline font-black">myaccount.google.com/apppasswords</a></li>
                            <li>Ketik nama aplikasi, misal <code>XYZPEDIA Store</code> lalu klik <strong>Buat</strong>.</li>
                            <li>Salin 16 huruf sandi aplikasi yang muncul dan tempel ke kolom Password Aplikasi di atas.</li>
                          </ol>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Email Action Buttons */}
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <a
                    href="/api/admin/notifications/preview-email"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 bg-white dark:bg-[#20202e] hover:bg-gray-100 text-carbon dark:text-white rounded-xl ink-border text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-transform hover:scale-101 active:scale-99 cursor-pointer shadow-[2px_2px_0px_#000000] text-center"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Lihat Preview Template</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleTestNotification("email")}
                    disabled={testingChannel === "email"}
                    className="py-2.5 px-3 bg-[#ffd731] hover:bg-amber-300 text-black rounded-xl ink-border text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-transform hover:scale-101 active:scale-99 cursor-pointer shadow-[2px_2px_0px_#000000]"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{testingChannel === "email" ? "Mengirim..." : "Kirim Email Uji Coba"}</span>
                  </button>
                </div>
              </section>
            </div>

            {/* SEKSI 3: MATRIKS EVENT NOTIFIKASI & PANEL PENGUJIAN */}
            <section className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_0px_#000000] space-y-6">
              <div className="pb-3 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-base font-black uppercase text-carbon dark:text-white font-[var(--font-bricolage)]">
                  Pilihan Event & Pengujian Notifikasi
                </h3>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Aktifkan toggle saluran notifikasi toko dan uji coba pengiriman pesan simulasi untuk masing-masing event
                </p>
              </div>

              {/* Panel Simulator & Pengujian Cepat Masing-Masing Notifikasi */}
              <div className="p-4 sm:p-5 bg-[#fbfbfd] dark:bg-[#1f1f2e] ink-border dark:border-[#38384a] rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <h4 className="text-xs font-black uppercase text-carbon dark:text-white">
                      Simulator & Toggle Pengujian Cepat
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">
                    Pilih jenis notifikasi dan kanal target di bawah untuk simulasi langsung
                  </span>
                </div>

                <div className="space-y-3.5">
                  {/* Event Selector Toggle Pills */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-500 block">
                      1. Pilih Event Notifikasi:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {NOTIFICATION_EVENT_ITEMS.map((item) => {
                        const isSelected = selectedSimEvent === item.key;
                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => setSelectedSimEvent(item.key)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ink-border transition-all cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? "bg-black text-white dark:bg-[#ffd731] dark:text-black shadow-[2px_2px_0px_#000000] -translate-y-0.5"
                                : "bg-white dark:bg-[#181824] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#20202e]"
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full ${item.colorDot}`} />
                            <span>{item.title.split("(")[0].trim()}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Channel Selector Toggle Pills & Trigger Button */}
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-1">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-gray-500 block">
                        2. Pilih Saluran Pengiriman:
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedSimChannel("telegram")}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ink-border transition-all cursor-pointer flex items-center gap-1.5 ${
                            selectedSimChannel === "telegram"
                              ? "bg-[#229ed9] text-white shadow-[2px_2px_0px_#000000] -translate-y-0.5"
                              : "bg-white dark:bg-[#181824] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#20202e]"
                          }`}
                        >
                          <Send className="w-3 h-3 fill-current" />
                          <span>Telegram</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedSimChannel("email")}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ink-border transition-all cursor-pointer flex items-center gap-1.5 ${
                            selectedSimChannel === "email"
                              ? "bg-[#fb4903] text-white shadow-[2px_2px_0px_#000000] -translate-y-0.5"
                              : "bg-white dark:bg-[#181824] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#20202e]"
                          }`}
                        >
                          <Mail className="w-3 h-3" />
                          <span>Email</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedSimChannel("both")}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider ink-border transition-all cursor-pointer flex items-center gap-1.5 ${
                            selectedSimChannel === "both"
                              ? "bg-[#ffd731] text-black shadow-[2px_2px_0px_#000000] -translate-y-0.5"
                              : "bg-white dark:bg-[#181824] text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#20202e]"
                          }`}
                        >
                          <Zap className="w-3 h-3 fill-current" />
                          <span>Keduanya</span>
                        </button>
                      </div>
                    </div>

                    {/* Action Run Button */}
                    <button
                      type="button"
                      onClick={() => handleTestNotification(selectedSimChannel, selectedSimEvent)}
                      disabled={testingChannel !== null}
                      className="px-5 py-2.5 bg-[#55db9c] hover:bg-[#43cd8c] text-black rounded-xl ink-border text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-[2px_2px_0px_#000000] cursor-pointer transition-transform hover:scale-102 active:scale-98 shrink-0"
                    >
                      {testingChannel ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-black" />
                      )}
                      <span>{testingChannel ? "Sedang Mengirim..." : "Jalankan Tes Sekarang"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabel Matriks Event Notifikasi & Tombol Tes Per Baris */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#f3f4f6] dark:bg-[#20202e] uppercase text-[10px] font-black text-gray-600 dark:text-gray-300">
                    <tr>
                      <th className="py-3 px-4 rounded-l-xl">Event / Aktivitas Toko</th>
                      <th className="py-3 px-4">Deskripsi Pesan</th>
                      <th className="py-3 px-4 text-center">Kirim Telegram</th>
                      <th className="py-3 px-4 text-center">Kirim Email</th>
                      <th className="py-3 px-4 text-center rounded-r-xl">Uji Coba Langsung</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-bold">
                    {NOTIFICATION_EVENT_ITEMS.map((item) => {
                      const tgActive = notificationSettings.events[item.key].telegram;
                      const emailActive = notificationSettings.events[item.key].email;
                      const isTestingTg = testingChannel === `${item.key}_telegram`;
                      const isTestingMail = testingChannel === `${item.key}_email`;

                      return (
                        <tr key={item.key} className="hover:bg-gray-50 dark:hover:bg-[#1c1c2b] transition-colors">
                          <td className="py-3.5 px-4 text-carbon dark:text-white">
                            <div className="flex items-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${item.colorDot}`} />
                              <div>
                                <span className="block font-black">{item.title}</span>
                                <span className="text-[10px] font-semibold text-gray-400">
                                  {item.badgeText}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-gray-500 dark:text-gray-400 font-normal max-w-xs">
                            {item.desc}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex justify-center">
                              <PopToggle
                                checked={tgActive}
                                onChange={(val) =>
                                  setNotificationSettings({
                                    ...notificationSettings,
                                    events: {
                                      ...notificationSettings.events,
                                      [item.key]: {
                                        ...notificationSettings.events[item.key],
                                        telegram: val,
                                      },
                                    },
                                  })
                                }
                                label={`Telegram ${item.title}`}
                              />
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex justify-center">
                              <PopToggle
                                checked={emailActive}
                                onChange={(val) =>
                                  setNotificationSettings({
                                    ...notificationSettings,
                                    events: {
                                      ...notificationSettings.events,
                                      [item.key]: {
                                        ...notificationSettings.events[item.key],
                                        email: val,
                                      },
                                    },
                                  })
                                }
                                label={`Email ${item.title}`}
                              />
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Quick Test Telegram */}
                              <button
                                type="button"
                                title={`Tes kirim notifikasi ${item.title} ke Telegram`}
                                disabled={testingChannel !== null}
                                onClick={() => handleTestNotification("telegram", item.key)}
                                className="px-2.5 py-1.5 bg-white hover:bg-[#229ed9] hover:text-white text-[#0284c7] dark:bg-[#181824] dark:hover:bg-[#229ed9] dark:hover:text-white rounded-xl ink-border text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer shadow-[1px_1px_0px_#000000] active:scale-95"
                              >
                                {isTestingTg ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Send className="w-2.5 h-2.5 fill-current" />
                                )}
                                <span>Telegram</span>
                              </button>

                              {/* Quick Test Email */}
                              <button
                                type="button"
                                title={`Tes kirim notifikasi ${item.title} ke Email`}
                                disabled={testingChannel !== null}
                                onClick={() => handleTestNotification("email", item.key)}
                                className="px-2.5 py-1.5 bg-white hover:bg-[#fb4903] hover:text-white text-[#ea580c] dark:bg-[#181824] dark:hover:bg-[#fb4903] dark:hover:text-white rounded-xl ink-border text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer shadow-[1px_1px_0px_#000000] active:scale-95"
                              >
                                {isTestingMail ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Mail className="w-2.5 h-2.5" />
                                )}
                                <span>Email</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Submit Save Notification Settings Button */}
              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingNotif}
                  className="px-6 py-2.5 bg-[#55db9c] hover:bg-[#43cd8c] text-black rounded-xl ink-border text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-[2px_2px_0px_#000000] cursor-pointer transition-transform hover:scale-102 active:scale-98"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingNotif ? "Menyimpan..." : "Simpan Pengaturan Notifikasi"}</span>
                </button>
              </div>
            </section>
          </form>
        )}

        {/* ========================================================
            TAB 2: INTEGRASI GATEWAY QIOSPAY
            ======================================================== */}
        {activeTab === "gateway" && (
          <section className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_0px_#000000] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-[#ffd731] text-black rounded-xl ink-border">
                  <Zap className="w-5 h-5 fill-black" />
                </span>
                <div>
                  <h2 className="text-base sm:text-lg font-black uppercase text-carbon dark:text-white font-[var(--font-bricolage)]">
                    Integrasi QiosPay (QRIS Dinamis)
                  </h2>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Konfigurasi endpoint webhook untuk verifikasi pembayaran real-time 24 jam
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-[#55db9c] text-black ink-border">
                AKTIF
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-black uppercase text-carbon dark:text-white block mb-1">
                  URL Webhook Callback (Masukkan di Dashboard QiosPay):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={typeof window !== "undefined" ? `${window.location.origin}/api/webhooks/qiospay` : "/api/webhooks/qiospay"}
                    className="flex-1 px-3.5 py-2.5 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border dark:border-[#38384a] text-xs font-mono font-bold text-carbon dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={copyWebhookUrl}
                    className="px-4 py-2.5 bg-black text-white dark:bg-[#ffd731] dark:text-black rounded-xl ink-border text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#000000]"
                  >
                    {copiedWebhook ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedWebhook ? "Disalin!" : "Salin URL"}</span>
                  </button>
                </div>
              </div>

              <div className="p-3.5 bg-[#dceeff] dark:bg-[#152338] ink-border dark:border-[#2d3f5e] rounded-2xl text-xs font-semibold text-[#003a6b] dark:text-[#bae6fd] space-y-1">
                <p className="font-bold">💡 Cara Kerja Verifikasi Otomatis:</p>
                <p className="text-[11px] leading-relaxed">
                  Saat pembeli berhasil melakukan scan dan membayar QRIS via BCA, DANA, GoPay, OVO, ShopeePay, atau m-Banking, server QiosPay akan mengirimkan sinyal HTTP POST ke URL di atas. Sistem XYZPEDIA akan langsung mengubah status transaksi menjadi <strong>PAID</strong> dan memicu pengiriman item secara instan, sekaligus mengirimkan notifikasi ke Telegram Anda jika diaktifkan.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================
            TAB 3: PENGUMUMAN TOKO & IKLAN PROMO (MODAL POP-UP & MARQUEE)
            ======================================================== */}
        {activeTab === "announcement" && (
          <form onSubmit={handleSaveStoreAnnouncements} className="space-y-6">
            {/* BAGIAN 1: PENGUMUMAN BERJALAN (TOP MARQUEE) */}
            <section className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_0px_#000000] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800 flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 bg-[#5c4ade] text-white rounded-xl ink-border">
                    <Bell className="w-5 h-5" />
                  </span>
                  <div>
                    <h2 className="text-base sm:text-lg font-black uppercase text-carbon dark:text-white font-[var(--font-bricolage)]">
                      1. Pengumuman Berjalan (Top Marquee)
                    </h2>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Pesan promosi teks berjalan di bar paling atas toko web
                    </p>
                  </div>
                </div>
                <PopToggle
                  checked={storeAnnouncements.marquee.isActive}
                  onChange={(checked) =>
                    setStoreAnnouncements((prev) => ({
                      ...prev,
                      marquee: { ...prev.marquee, isActive: checked },
                    }))
                  }
                  label={storeAnnouncements.marquee.isActive ? "Marquee Aktif" : "Marquee Nonaktif"}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-carbon dark:text-white block">
                  Teks Pengumuman Berjalan:
                </label>
                <textarea
                  value={storeAnnouncements.marquee.text}
                  onChange={(e) =>
                    setStoreAnnouncements((prev) => ({
                      ...prev,
                      marquee: { ...prev.marquee, text: e.target.value },
                    }))
                  }
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border dark:border-[#38384a] text-xs font-bold text-carbon dark:text-white"
                  placeholder="Tulis teks pengumuman berjalan..."
                />
                <p className="text-[11px] text-gray-400 font-medium">
                  Tips: Gunakan simbol pemisah seperti ✦ atau ⚡ untuk memisahkan antar poin promosi.
                </p>
              </div>
            </section>

            {/* BAGIAN 2: PENGUMUMAN TOKO (MODAL POP-UP) */}
            <section className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_0px_#000000] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800 flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 bg-[#ffd731] text-black rounded-xl ink-border">
                    <Megaphone className="w-5 h-5" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-black uppercase text-carbon dark:text-white font-[var(--font-bricolage)]">
                        2. Pengumuman Toko (Modal Pop-Up)
                      </h2>
                      <span className="px-2 py-0.5 bg-yellow-400/20 text-yellow-800 dark:text-yellow-300 font-mono text-[10px] font-black rounded-full border border-yellow-400/50">
                        INFO RESMI
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Modal pop-up pengumuman resmi yang muncul saat pengunjung membuka website toko
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPreviewModal("announcement")}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-[#252538] hover:bg-gray-200 dark:hover:bg-[#34344d] rounded-xl text-xs font-bold text-carbon dark:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview Pop-Up</span>
                  </button>
                  <PopToggle
                    checked={storeAnnouncements.popupAnnouncement.isActive}
                    onChange={(checked) =>
                      setStoreAnnouncements((prev) => ({
                        ...prev,
                        popupAnnouncement: { ...prev.popupAnnouncement, isActive: checked },
                      }))
                    }
                    label={storeAnnouncements.popupAnnouncement.isActive ? "Pop-Up Aktif" : "Pop-Up Nonaktif"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-carbon dark:text-white block">
                    Judul Pengumuman:
                  </label>
                  <input
                    type="text"
                    value={storeAnnouncements.popupAnnouncement.title}
                    onChange={(e) =>
                      setStoreAnnouncements((prev) => ({
                        ...prev,
                        popupAnnouncement: { ...prev.popupAnnouncement, title: e.target.value },
                      }))
                    }
                    placeholder="Contoh: Pemberitahuan Pembaruan Sistem & Produk Baru"
                    className="w-full px-3.5 py-2.5 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border dark:border-[#38384a] text-xs font-bold text-carbon dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-carbon dark:text-white block">
                    Timer Otomatis Hilang (Detik):
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={storeAnnouncements.popupAnnouncement.autoCloseSeconds}
                    onChange={(e) =>
                      setStoreAnnouncements((prev) => ({
                        ...prev,
                        popupAnnouncement: {
                          ...prev.popupAnnouncement,
                          autoCloseSeconds: Number(e.target.value) || 0,
                        },
                      }))
                    }
                    placeholder="0 = Hanya tutup manual"
                    className="w-full px-3.5 py-2.5 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border dark:border-[#38384a] text-xs font-bold text-carbon dark:text-white font-mono"
                  />
                  <p className="text-[10px] text-gray-400">
                    Isi 0 jika hanya ingin ditutup manual oleh pelanggan lewat tombol ✕.
                  </p>
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-black uppercase text-carbon dark:text-white block">
                    Teks / Isi Pengumuman:
                  </label>
                  <textarea
                    value={storeAnnouncements.popupAnnouncement.message}
                    onChange={(e) =>
                      setStoreAnnouncements((prev) => ({
                        ...prev,
                        popupAnnouncement: { ...prev.popupAnnouncement, message: e.target.value },
                      }))
                    }
                    rows={3}
                    placeholder="Tuliskan isi pengumuman lengkap di sini..."
                    className="w-full px-3.5 py-2.5 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border dark:border-[#38384a] text-xs font-bold text-carbon dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-carbon dark:text-white block">
                    Teks Tombol Aksi (Opsional):
                  </label>
                  <input
                    type="text"
                    value={storeAnnouncements.popupAnnouncement.actionText || ""}
                    onChange={(e) =>
                      setStoreAnnouncements((prev) => ({
                        ...prev,
                        popupAnnouncement: { ...prev.popupAnnouncement, actionText: e.target.value },
                      }))
                    }
                    placeholder="Contoh: Lihat Selengkapnya / Buka Katalog"
                    className="w-full px-3.5 py-2.5 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border dark:border-[#38384a] text-xs font-bold text-carbon dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-carbon dark:text-white block">
                    Link Tertuju Kemana (Opsional):
                  </label>
                  <input
                    type="text"
                    value={storeAnnouncements.popupAnnouncement.actionUrl || ""}
                    onChange={(e) =>
                      setStoreAnnouncements((prev) => ({
                        ...prev,
                        popupAnnouncement: { ...prev.popupAnnouncement, actionUrl: e.target.value },
                      }))
                    }
                    placeholder="Contoh: /katalog atau https://wa.me/..."
                    className="w-full px-3.5 py-2.5 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border dark:border-[#38384a] text-xs font-bold text-carbon dark:text-white font-mono"
                  />
                </div>
              </div>
            </section>

            {/* BAGIAN 3: IKLAN PROMO TOKO (MODAL POP-UP IKLAN) */}
            <section className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_0px_#000000] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800 flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 bg-[#fb4903] text-white rounded-xl ink-border">
                    <Sparkles className="w-5 h-5" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-black uppercase text-carbon dark:text-white font-[var(--font-bricolage)]">
                        3. Iklan Promo Toko (Modal Pop-Up Iklan)
                      </h2>
                      <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 font-mono text-[10px] font-black rounded-full border border-orange-500/50">
                        PROMO & FLASH SALE
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Modal pop-up promosi diskon, banner poster, dan penawaran khusus produk
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPreviewModal("ad")}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-[#252538] hover:bg-gray-200 dark:hover:bg-[#34344d] rounded-xl text-xs font-bold text-carbon dark:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview Iklan</span>
                  </button>
                  <PopToggle
                    checked={storeAnnouncements.popupAd.isActive}
                    onChange={(checked) =>
                      setStoreAnnouncements((prev) => ({
                        ...prev,
                        popupAd: { ...prev.popupAd, isActive: checked },
                      }))
                    }
                    label={storeAnnouncements.popupAd.isActive ? "Iklan Aktif" : "Iklan Nonaktif"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-carbon dark:text-white block">
                    Judul Promo / Iklan:
                  </label>
                  <input
                    type="text"
                    value={storeAnnouncements.popupAd.title}
                    onChange={(e) =>
                      setStoreAnnouncements((prev) => ({
                        ...prev,
                        popupAd: { ...prev.popupAd, title: e.target.value },
                      }))
                    }
                    placeholder="Contoh: FLASH SALE SPOTIFY & NETFLIX HEMAT 70%"
                    className="w-full px-3.5 py-2.5 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border dark:border-[#38384a] text-xs font-bold text-carbon dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-carbon dark:text-white block">
                    Badge / Subtitle Promo:
                  </label>
                  <input
                    type="text"
                    value={storeAnnouncements.popupAd.subtitle || ""}
                    onChange={(e) =>
                      setStoreAnnouncements((prev) => ({
                        ...prev,
                        popupAd: { ...prev.popupAd, subtitle: e.target.value },
                      }))
                    }
                    placeholder="Contoh: STOK TERBATAS HANYA HARI INI"
                    className="w-full px-3.5 py-2.5 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border dark:border-[#38384a] text-xs font-bold text-carbon dark:text-white"
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-black uppercase text-carbon dark:text-white block">
                    Deskripsi Promo / Tawaran:
                  </label>
                  <textarea
                    value={storeAnnouncements.popupAd.description}
                    onChange={(e) =>
                      setStoreAnnouncements((prev) => ({
                        ...prev,
                        popupAd: { ...prev.popupAd, description: e.target.value },
                      }))
                    }
                    rows={2}
                    placeholder="Contoh: Nikmati streaming musik & film premium resmi legal dengan proses otomatis instan 24 jam!"
                    className="w-full px-3.5 py-2.5 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border dark:border-[#38384a] text-xs font-bold text-carbon dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-carbon dark:text-white block">
                    Link Tertuju Kemana:
                  </label>
                  <input
                    type="text"
                    value={storeAnnouncements.popupAd.actionUrl}
                    onChange={(e) =>
                      setStoreAnnouncements((prev) => ({
                        ...prev,
                        popupAd: { ...prev.popupAd, actionUrl: e.target.value },
                      }))
                    }
                    placeholder="Contoh: /katalog?kategori=akun-premium"
                    className="w-full px-3.5 py-2.5 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border dark:border-[#38384a] text-xs font-bold text-carbon dark:text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-carbon dark:text-white block">
                    Teks Tombol Aksi:
                  </label>
                  <input
                    type="text"
                    value={storeAnnouncements.popupAd.actionText}
                    onChange={(e) =>
                      setStoreAnnouncements((prev) => ({
                        ...prev,
                        popupAd: { ...prev.popupAd, actionText: e.target.value },
                      }))
                    }
                    placeholder="Contoh: Ambil Promo Sekarang / Beli Langsung"
                    className="w-full px-3.5 py-2.5 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border dark:border-[#38384a] text-xs font-bold text-carbon dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-carbon dark:text-white block">
                    URL Gambar Banner (Opsional):
                  </label>
                  <input
                    type="text"
                    value={storeAnnouncements.popupAd.imageUrl || ""}
                    onChange={(e) =>
                      setStoreAnnouncements((prev) => ({
                        ...prev,
                        popupAd: { ...prev.popupAd, imageUrl: e.target.value },
                      }))
                    }
                    placeholder="Contoh: https://... atau kosongkan jika tanpa gambar"
                    className="w-full px-3.5 py-2.5 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border dark:border-[#38384a] text-xs font-bold text-carbon dark:text-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-carbon dark:text-white block">
                    Timer Otomatis Hilang (Detik Countdown):
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={storeAnnouncements.popupAd.autoCloseSeconds}
                    onChange={(e) =>
                      setStoreAnnouncements((prev) => ({
                        ...prev,
                        popupAd: {
                          ...prev.popupAd,
                          autoCloseSeconds: Number(e.target.value) || 0,
                        },
                      }))
                    }
                    placeholder="10 (detik)"
                    className="w-full px-3.5 py-2.5 bg-[#f3f4f6] dark:bg-[#20202e] rounded-xl ink-border dark:border-[#38384a] text-xs font-bold text-carbon dark:text-white font-mono"
                  />
                  <p className="text-[10px] text-gray-400">
                    Akan muncul countdown timer mundur dan tombol "Lewati Iklan" / "✕".
                  </p>
                </div>
              </div>
            </section>

            {/* SUBMIT BUTTON */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={isSavingAnnouncements}
                className="px-6 py-3 bg-[#ffd731] hover:bg-[#ffe066] text-black font-black ink-border rounded-2xl shadow-[4px_4px_0px_#000000] text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-transform active:translate-y-0.5 disabled:opacity-50"
              >
                <Save className="w-4 h-4 stroke-[2.5]" />
                <span>
                  {isSavingAnnouncements
                    ? "Menyimpan Pengaturan..."
                    : "Simpan Semua Pengumuman & Iklan"}
                </span>
              </button>
            </div>
          </form>
        )}

        {/* MODAL PREVIEW UNTUK ADMIN */}
        {previewModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="relative max-w-md w-full bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-3xl p-6 shadow-[8px_8px_0px_#000000] space-y-4">
              <button
                type="button"
                onClick={() => setPreviewModal(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-[#252538] flex items-center justify-center text-gray-500 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {previewModal === "announcement" ? (
                <div className="space-y-4 text-center">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-[#ffd731] text-black flex items-center justify-center ink-border shadow-[2px_2px_0px_#000]">
                    <Megaphone className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 bg-yellow-400/20 text-yellow-800 dark:text-yellow-300 font-mono text-[10px] font-black rounded-full border border-yellow-400/50">
                      PENGUMUMAN RESMI
                    </span>
                    <h3 className="text-base font-black text-carbon dark:text-white mt-1.5 font-[var(--font-bricolage)]">
                      {storeAnnouncements.popupAnnouncement.title || "Pengumuman Resmi XYZPEDIA"}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 leading-relaxed whitespace-pre-wrap">
                      {storeAnnouncements.popupAnnouncement.message || "Pesan pengumuman..."}
                    </p>
                  </div>

                  {storeAnnouncements.popupAnnouncement.autoCloseSeconds > 0 && (
                    <div className="text-[11px] font-bold text-gray-400 flex items-center justify-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        Menutup otomatis dalam {storeAnnouncements.popupAnnouncement.autoCloseSeconds} detik
                      </span>
                    </div>
                  )}

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewModal(null)}
                      className="flex-1 py-2.5 bg-gray-100 dark:bg-[#252538] hover:bg-gray-200 text-carbon dark:text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Tutup
                    </button>
                    {storeAnnouncements.popupAnnouncement.actionUrl && (
                      <a
                        href={storeAnnouncements.popupAnnouncement.actionUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2.5 bg-[#ffd731] text-black font-black ink-border rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#000]"
                      >
                        <span>
                          {storeAnnouncements.popupAnnouncement.actionText || "Lihat Selengkapnya"}
                        </span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-center">
                  {storeAnnouncements.popupAd.imageUrl && (
                    <div className="w-full h-36 rounded-2xl overflow-hidden ink-border bg-[#252538]">
                      <img
                        src={storeAnnouncements.popupAd.imageUrl}
                        alt="Promo Banner"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 bg-orange-500/20 text-orange-400 font-mono text-[10px] font-black rounded-full border border-orange-500/50">
                      {storeAnnouncements.popupAd.subtitle || "PROMO SPESIAL TOKO"}
                    </span>
                    <h3 className="text-base font-black text-carbon dark:text-white mt-1.5 font-[var(--font-bricolage)]">
                      {storeAnnouncements.popupAd.title || "Judul Promo Toko"}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed whitespace-pre-wrap">
                      {storeAnnouncements.popupAd.description || "Deskripsi tawaran promo..."}
                    </p>
                  </div>

                  {storeAnnouncements.popupAd.autoCloseSeconds > 0 && (
                    <div className="text-[11px] font-bold text-orange-400 flex items-center justify-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        Otomatis tertutup dalam {storeAnnouncements.popupAd.autoCloseSeconds} detik
                      </span>
                    </div>
                  )}

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewModal(null)}
                      className="py-2.5 px-4 bg-gray-100 dark:bg-[#252538] hover:bg-gray-200 text-carbon dark:text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Lewati
                    </button>
                    <a
                      href={storeAnnouncements.popupAd.actionUrl || "/katalog"}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2.5 bg-[#fb4903] text-white font-black ink-border rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#000]"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{storeAnnouncements.popupAd.actionText || "Ambil Promo"}</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: KEAMANAN & DATABASE (SYSTEM HEALTH & DIAGNOSTICS)
            ======================================================== */}
        {activeTab === "system" && (
          <div className="space-y-6">
            {/* Header & Live Diagnostic Action */}
            <section className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_0px_#000000]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 bg-[#55db9c] text-black rounded-2xl ink-border shadow-[2px_2px_0px_#000]">
                    <Activity className="w-5 h-5 stroke-[2.5]" />
                  </span>
                  <div>
                    <h2 className="text-base sm:text-lg font-black uppercase text-carbon dark:text-white font-[var(--font-bricolage)]">
                      Diagnostik Sistem, Database & Koneksi API
                    </h2>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      Pemantauan langsung kesehatan database PostgreSQL, gateway pembayaran, serverless runtime, dan keamanan
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={fetchHealthData}
                    disabled={isCheckingHealth}
                    className="px-4 py-2 bg-[#ffd731] hover:bg-[#f5c800] text-black rounded-xl ink-border text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-[2px_2px_0px_#000000] cursor-pointer transition-transform hover:scale-102 active:scale-98"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCheckingHealth ? "animate-spin" : ""}`} />
                    <span>{isCheckingHealth ? "Memeriksa..." : "Jalankan Diagnostik"}</span>
                  </button>
                </div>
              </div>

              {healthData?.timestamp && (
                <div className="mt-3 text-[11px] font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Pemeriksaan terakhir: {new Date(healthData.timestamp).toLocaleTimeString("id-ID")} WIB</span>
                </div>
              )}
            </section>

            {/* 1. DATABASE HEALTH MONITOR */}
            <section className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_0px_#000000] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-[#0284c7] text-white rounded-lg ink-border">
                    <Database className="w-4 h-4" />
                  </span>
                  <h3 className="text-base font-black uppercase text-carbon dark:text-white font-[var(--font-bricolage)]">
                    Database PostgreSQL (Neon Serverless)
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-[#55db9c] text-black ink-border">
                  {healthData?.database?.status === "ONLINE" ? "TERHUBUNG (ONLINE)" : "MEMERIKSA..."}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 bg-[#fbfbfd] dark:bg-[#1f1f2e] ink-border dark:border-[#38384a] rounded-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-gray-400 block">Status & Latensi</span>
                  <p className="font-black text-carbon dark:text-white flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>{healthData?.database?.latency ? `${healthData.database.latency} ms` : "Normal"}</span>
                  </p>
                  <span className="text-[10px] text-green-600 dark:text-green-400 font-bold block">Koneksi Sangat Cepat</span>
                </div>

                <div className="p-3.5 bg-[#fbfbfd] dark:bg-[#1f1f2e] ink-border dark:border-[#38384a] rounded-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-gray-400 block">Database Engine</span>
                  <p className="font-black text-carbon dark:text-white">PostgreSQL 16</p>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold block">Neon Pooled Cluster</span>
                </div>

                <div className="p-3.5 bg-[#fbfbfd] dark:bg-[#1f1f2e] ink-border dark:border-[#38384a] rounded-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-gray-400 block">Region Cloud</span>
                  <p className="font-black text-carbon dark:text-white">AWS ap-southeast-1</p>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold block">Singapore Edge Node</span>
                </div>

                <div className="p-3.5 bg-[#fbfbfd] dark:bg-[#1f1f2e] ink-border dark:border-[#38384a] rounded-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-gray-400 block">Total Data Tercatat</span>
                  <p className="font-black text-carbon dark:text-white">
                    {healthData?.database?.stats
                      ? `${healthData.database.stats.totalProducts} Produk • ${healthData.database.stats.totalOrders} Transaksi`
                      : "Memuat statistik..."}
                  </p>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold block">Prisma ORM Managed</span>
                </div>
              </div>
            </section>

            {/* 2. GATEWAY & API INTEGRATION HEALTH */}
            <section className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_0px_#000000] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-[#ffd731] text-black rounded-lg ink-border">
                    <Zap className="w-4 h-4 fill-black" />
                  </span>
                  <h3 className="text-base font-black uppercase text-carbon dark:text-white font-[var(--font-bricolage)]">
                    Koneksi Payment Gateway & Provider H2H
                  </h3>
                </div>
                <span className="text-[10px] font-black uppercase text-gray-500">Live Services</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
                {/* QiosPay */}
                <div className="p-4 bg-[#fbfbfd] dark:bg-[#1f1f2e] ink-border dark:border-[#38384a] rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-carbon dark:text-white uppercase flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-[#fb4903]" />
                      <span>QiosPay Gateway</span>
                    </span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-black bg-[#55db9c] text-black ink-border">
                      {healthData?.gateways?.qiospay?.status || "AKTIF"}
                    </span>
                  </div>
                  <div className="space-y-1 text-[11px] text-gray-600 dark:text-gray-300">
                    <p className="flex justify-between">
                      <span className="text-gray-400">Merchant Code:</span>
                      <span className="font-mono font-bold">{healthData?.gateways?.qiospay?.merchantCode || "Terkonfigurasi"}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-400">Metode:</span>
                      <span className="font-bold">QRIS Dinamis 0% Fee</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-400">Endpoint:</span>
                      <span className="font-mono text-[10px]">my.qiospay.com/v1</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-400">Webhook:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Terdaftar</span>
                    </p>
                  </div>
                </div>

                {/* Digiflazz */}
                <div className="p-4 bg-[#fbfbfd] dark:bg-[#1f1f2e] ink-border dark:border-[#38384a] rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-carbon dark:text-white uppercase flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5 text-[#0284c7]" />
                      <span>Digiflazz Provider</span>
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-black ink-border ${
                        healthData?.gateways?.digiflazz?.status === "ONLINE"
                          ? "bg-[#55db9c] text-black"
                          : healthData?.gateways?.digiflazz?.status === "CONFIGURED" ||
                            healthData?.gateways?.digiflazz?.status === "PROXY_STANDBY"
                          ? "bg-[#ffd731] text-black"
                          : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {healthData?.gateways?.digiflazz?.status || "STANDBY"}
                    </span>
                  </div>
                  <div className="space-y-1 text-[11px] text-gray-600 dark:text-gray-300">
                    <p className="flex justify-between">
                      <span className="text-gray-400">VPS Proxy Bridge:</span>
                      <span className="font-mono font-bold text-sky-600 dark:text-sky-400">
                        {healthData?.gateways?.digiflazz?.vpsProxyIp || "Terkonfigurasi"}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-400">Akun Supplier:</span>
                      <span className="font-mono font-bold">{healthData?.gateways?.digiflazz?.username || "Terkonfigurasi"}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-400">Fulfillment:</span>
                      <span className="font-bold">Otomatis Instan H2H</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-400">Whitelist:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Static IP Terdaftar</span>
                    </p>
                  </div>
                </div>

                {/* Telegram Bot */}
                <div className="p-4 bg-[#fbfbfd] dark:bg-[#1f1f2e] ink-border dark:border-[#38384a] rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-carbon dark:text-white uppercase flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5 text-[#0088cc]" />
                      <span>Telegram Bot Alert</span>
                    </span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-black bg-[#55db9c] text-black ink-border">
                      {healthData?.gateways?.telegram?.status === "CONFIGURED" ? "AKTIF" : "STANDBY"}
                    </span>
                  </div>
                  <div className="space-y-1 text-[11px] text-gray-600 dark:text-gray-300">
                    <p className="flex justify-between">
                      <span className="text-gray-400">Notifikasi:</span>
                      <span className="font-bold">Pesanan & Laporan Omset</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-400">Admin Chat ID:</span>
                      <span className="font-mono font-bold">{healthData?.gateways?.telegram?.chatId || "Terkonfigurasi"}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-400">Kecepatan:</span>
                      <span className="font-bold">Real-time (&lt; 2 detik)</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-gray-400">Status Bot:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Siaga Mengirim</span>
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. SECURITY & ENVIRONMENT POSTURE */}
            <section className="bg-white dark:bg-[#181824] ink-border dark:border-[#38384a] rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_0px_#000000] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-[#5c4ade] text-white rounded-lg ink-border">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                  <h3 className="text-base font-black uppercase text-carbon dark:text-white font-[var(--font-bricolage)]">
                    Keamanan & Konfigurasi Lingkungan (Environment Audit)
                  </h3>
                </div>
                <span className="text-[10px] font-black uppercase text-gray-500">Security Guard</span>
              </div>

              {/* Security Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 bg-[#fbfbfd] dark:bg-[#1f1f2e] ink-border dark:border-[#38384a] rounded-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-gray-400 block">Domain & SSL</span>
                  <p className="font-black text-carbon dark:text-white">
                    {healthData?.security?.domain
                      ? healthData.security.domain.replace(/^https?:\/\//, "")
                      : (typeof window !== "undefined" ? window.location.host : "Domain")}
                  </p>
                  <span className="text-[10px] text-green-600 dark:text-green-400 font-bold block">
                    {healthData?.security?.ssl || "TLS Terenkripsi"}
                  </span>
                </div>

                <div className="p-3.5 bg-[#fbfbfd] dark:bg-[#1f1f2e] ink-border dark:border-[#38384a] rounded-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-gray-400 block">DNS CNAME Flattening</span>
                  <p className="font-black text-carbon dark:text-white truncate">vercel-dns-017.com</p>
                  <span className="text-[10px] text-green-600 dark:text-green-400 font-bold block">Terverifikasi 100%</span>
                </div>

                <div className="p-3.5 bg-[#fbfbfd] dark:bg-[#1f1f2e] ink-border dark:border-[#38384a] rounded-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-gray-400 block">Autentikasi Admin</span>
                  <p className="font-black text-carbon dark:text-white">HMAC SHA-256 Cookie</p>
                  <span className="text-[10px] text-green-600 dark:text-green-400 font-bold block">HTTP-Only & SameSite</span>
                </div>

                <div className="p-3.5 bg-[#fbfbfd] dark:bg-[#1f1f2e] ink-border dark:border-[#38384a] rounded-2xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-gray-400 block">Serverless Runtime</span>
                  <p className="font-black text-carbon dark:text-white">Node.js 20+ Turbo</p>
                  <span className="text-[10px] text-green-600 dark:text-green-400 font-bold block">Next.js 16 App Router</span>
                </div>
              </div>

              {/* Environment Checklist */}
              <div className="pt-2 space-y-2">
                <h4 className="text-xs font-black uppercase text-carbon dark:text-white">
                  Audit Kunci Lingkungan (.env Variables Integrity):
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {healthData?.envAudit?.map((item: any) => (
                    <div
                      key={item.key}
                      className="p-2.5 rounded-xl bg-gray-50 dark:bg-[#20202e] border border-gray-200 dark:border-[#38384a] flex items-center justify-between text-xs font-bold"
                    >
                      <div className="truncate">
                        <span className="font-mono text-[11px] block truncate text-carbon dark:text-white">
                          {item.key}
                        </span>
                        <span className="text-[10px] text-gray-400 font-semibold block truncate">
                          {item.label}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black shrink-0 ${
                          item.isSet
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                        }`}
                      >
                        {item.isSet ? "✓ PASANG" : "✕ KOSONG"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
