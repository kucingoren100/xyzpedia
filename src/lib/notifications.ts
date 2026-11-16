import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import nodemailer from "nodemailer";
import {
  NotificationSettings,
  DEFAULT_NOTIFICATION_SETTINGS,
} from "@/types/notifications";
import { generateReportCardPng } from "./reportCardImage";

export type { NotificationSettings };
export { DEFAULT_NOTIFICATION_SETTINGS };

const SETTINGS_DIR = path.join(process.cwd(), "data");
const SETTINGS_FILE = path.join(SETTINGS_DIR, "notification-settings.json");

/**
 * Get notification settings with persistence in data/notification-settings.json
 */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const raw = await readFile(SETTINGS_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_NOTIFICATION_SETTINGS,
      ...parsed,
      telegram: {
        ...DEFAULT_NOTIFICATION_SETTINGS.telegram,
        ...(parsed.telegram || {}),
      },
      email: {
        ...DEFAULT_NOTIFICATION_SETTINGS.email,
        ...(parsed.email || {}),
      },
      events: {
        ...DEFAULT_NOTIFICATION_SETTINGS.events,
        ...(parsed.events || {}),
      },
    };
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

/**
 * Save notification settings
 */
export async function saveNotificationSettings(
  settings: Partial<NotificationSettings>
): Promise<NotificationSettings> {
  const current = await getNotificationSettings();
  const merged: NotificationSettings = {
    ...current,
    ...settings,
    telegram: {
      ...current.telegram,
      ...(settings.telegram || {}),
    },
    email: {
      ...current.email,
      ...(settings.email || {}),
    },
    events: {
      ...current.events,
      ...(settings.events || {}),
    },
  };

  try {
    await mkdir(SETTINGS_DIR, { recursive: true });
    await writeFile(SETTINGS_FILE, JSON.stringify(merged, null, 2), "utf-8");
  } catch (err) {
    console.error("Gagal menyimpan notification settings:", err);
  }

  return merged;
}

export interface TelegramButton {
  text: string;
  url: string;
}

export interface SendTelegramOptions {
  button?: TelegramButton;
  photoBuffer?: Buffer;
}

/**
 * Telegram Bot API strictly prohibits localhost or loopback IP addresses in inline keyboard URLs.
 * If url contains localhost or 127.0.0.1, we automatically map it to https://xyzpedia.id.
 */
export function sanitizeTelegramButtonUrl(url?: string): string {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://xyzpedia.vercel.app").replace(/\/$/, "");
  if (!url || typeof url !== "string") return `${appUrl}/admin`;
  const trimmed = url.trim();
  if (
    trimmed.startsWith("http://localhost") ||
    trimmed.startsWith("https://localhost") ||
    trimmed.startsWith("http://127.0.0.1") ||
    trimmed.startsWith("https://127.0.0.1")
  ) {
    try {
      const parsed = new URL(trimmed);
      return `${appUrl}${parsed.pathname}${parsed.search}`;
    } catch {
      return `${appUrl}/admin`;
    }
  }
  return trimmed;
}

/**
 * Send message or photo with inline button via Telegram Bot API
 */
export async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  htmlText: string,
  options?: SendTelegramOptions
): Promise<{ success: boolean; message: string; data?: any }> {
  if (!botToken || !botToken.trim()) {
    return {
      success: false,
      message: "Bot Token Telegram belum diisi.",
    };
  }

  if (!chatId || !chatId.trim()) {
    return {
      success: false,
      message: "Chat ID Telegram belum diisi.",
    };
  }

  const cleanToken = botToken.trim();
  const cleanChatId = chatId.trim();

  // 1. If photoBuffer is provided, attempt sendPhoto
  if (options?.photoBuffer && options.photoBuffer.length > 0) {
    try {
      const photoUrl = `https://api.telegram.org/bot${cleanToken}/sendPhoto`;
      const formData = new FormData();
      formData.append("chat_id", cleanChatId);
      const blob = new Blob([new Uint8Array(options.photoBuffer)], { type: "image/png" });
      formData.append("photo", blob, "report-card.png");
      formData.append("caption", htmlText);
      formData.append("parse_mode", "HTML");

      if (options.button) {
        const safeUrl = sanitizeTelegramButtonUrl(options.button.url);
        formData.append(
          "reply_markup",
          JSON.stringify({
            inline_keyboard: [[{ text: options.button.text, url: safeUrl }]],
          })
        );
      }

      const resPhoto = await fetch(photoUrl, {
        method: "POST",
        body: formData,
      });

      const photoData = await resPhoto.json();
      if (resPhoto.ok && photoData.ok) {
        return {
          success: true,
          message: "Notifikasi Telegram (dengan kartu visual) berhasil terkirim!",
          data: photoData,
        };
      }
      console.warn("Telegram sendPhoto gagal, fallback ke sendMessage:", photoData);
    } catch (photoErr) {
      console.warn("Telegram sendPhoto error, fallback ke text:", photoErr);
    }
  }

  // 2. Standard text message with HTML formatting & inline buttons
  const url = `https://api.telegram.org/bot${cleanToken}/sendMessage`;
  const payload: any = {
    chat_id: cleanChatId,
    text: htmlText,
    parse_mode: "HTML",
    disable_web_page_preview: true,
  };

  if (options?.button) {
    const safeUrl = sanitizeTelegramButtonUrl(options.button.url);
    payload.reply_markup = {
      inline_keyboard: [[{ text: options.button.text, url: safeUrl }]],
    };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      const desc = data?.description || "";
      let humanMsg = `Gagal mengirim ke Telegram (${res.status}): ${desc}`;

      if (res.status === 401 || desc.toLowerCase().includes("unauthorized")) {
        humanMsg = "Bot Token Telegram tidak valid. Periksa kembali token dari @BotFather.";
      } else if (desc.toLowerCase().includes("chat not found")) {
        humanMsg =
          "Chat ID tidak ditemukan. Pastikan Anda sudah membuka chat dengan bot Anda dan menekan tombol /start terlebih dahulu.";
      } else if (desc.toLowerCase().includes("bot was blocked")) {
        humanMsg = "Bot Telegram diblokir oleh pengguna. Buka unblock di Telegram.";
      }

      return {
        success: false,
        message: humanMsg,
        data,
      };
    }

    return {
      success: true,
      message: "Notifikasi Telegram berhasil terkirim!",
      data,
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Koneksi ke API Telegram gagal: " + (error?.message || "Timeout"),
    };
  }
}

export interface WeeklyReportStats {
  totalOrders: number;
  successOrders: number;
  totalOmset: number;
  totalProfit: number;
  dateRange: string;
  timestamp?: string;
  visits?: number;
  conversionRate?: number;
  topProduct?: string;
  storeName?: string;
  adminUrl?: string;
}

/**
 * Generate rich responsive HTML email template for Weekly Report
 * Designed based on high-conversion ecommerce reporting standard
 */
export function generateWeeklyReportEmailHtml(stats: WeeklyReportStats): string {
  const store = stats.storeName || "XYZPEDIA";
  const visits = stats.visits ?? Math.max(stats.totalOrders * 12, 42);
  const convRate =
    stats.conversionRate ??
    (visits > 0
      ? ((stats.successOrders / visits) * 100).toFixed(1)
      : "4.8");
  const topProd = stats.topProduct || "Canva Pro — 1 Tahun";
  const now =
    stats.timestamp ||
    new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB";
  const appUrlW = (process.env.NEXT_PUBLIC_APP_URL || "https://xyzpedia.vercel.app").replace(/\/$/, "");
  const adminUrl = stats.adminUrl || `${appUrlW}/admin`;

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Laporan mingguan · Rp ${stats.totalProfit.toLocaleString("id-ID")} — ${store}</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.5;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 2px solid #000000; box-shadow: 6px 6px 0px #000000;">
    
    <!-- Top Header Banner (Brand Color) -->
    <div style="background-color: #2563eb; padding: 20px 24px; border-bottom: 2px solid #000000;">
      <div style="font-size: 11px; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase; color: #bfdbfe; margin-bottom: 4px;">
        ${store.toUpperCase()} CORP
      </div>
      <div style="font-size: 18px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">
        ${store} <span style="font-weight: 400; opacity: 0.9;">· Panel Reseller</span>
      </div>
    </div>

    <!-- Main Card Body -->
    <div style="padding: 24px 20px;">
      
      <!-- Card Container Box -->
      <div style="border: 2px solid #000000; border-radius: 14px; padding: 20px; background-color: #ffffff; box-shadow: 3px 3px 0px #000000; margin-bottom: 22px;">
        
        <!-- Store Identity Mini Bar -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px;">
          <tr>
            <td style="vertical-align: middle;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="width: 26px; height: 26px; background-color: #ffd731; border: 1.5px solid #000000; border-radius: 6px; text-align: center; vertical-align: middle; font-weight: 900; font-size: 13px; color: #000000;">
                    X
                  </td>
                  <td style="padding-left: 8px; vertical-align: middle;">
                    <span style="font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a;">
                      ${store}
                    </span>
                    <span style="display: block; font-size: 10px; font-weight: 700; color: #64748b;">
                      Toko Terverifikasi
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- 2 Column Layout: Left (Profit Hero) & Right (Metrics Breakdown) -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <!-- Left Side: Hero Profit -->
            <td style="vertical-align: top; width: 50%; padding-right: 12px;">
              <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 4px;">
                Laporan mingguan
              </div>
              <div style="font-size: 30px; font-weight: 900; color: #0f172a; letter-spacing: -1px; line-height: 1.1; margin-bottom: 4px;">
                Rp ${stats.totalProfit.toLocaleString("id-ID")}
              </div>
              <div style="font-size: 11px; font-weight: 700; color: #475569; margin-bottom: 10px;">
                ${stats.successOrders} pesanan · laba bersih
              </div>
              <div>
                <span style="display: inline-block; background-color: #dcfce7; border: 1.5px solid #000000; border-radius: 999px; padding: 2px 10px; font-size: 10px; font-weight: 900; color: #166534; text-transform: uppercase;">
                  ✓ Ada penjualan
                </span>
              </div>
              <div style="font-size: 10px; font-weight: 700; color: #94a3b8; margin-top: 20px;">
                ${now}
              </div>
            </td>

            <!-- Right Side: Metrics Table -->
            <td style="vertical-align: top; width: 50%; border-left: 1.5px dashed #cbd5e1; padding-left: 12px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 11px;">
                <tr>
                  <td style="padding: 5px 0; color: #64748b; font-weight: 700;">Omset:</td>
                  <td style="padding: 5px 0; text-align: right; font-weight: 900; color: #0f172a;">Rp ${stats.totalOmset.toLocaleString("id-ID")}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; border-top: 1px solid #f1f5f9; color: #64748b; font-weight: 700;">Pesanan:</td>
                  <td style="padding: 5px 0; border-top: 1px solid #f1f5f9; text-align: right; font-weight: 900; color: #0f172a;">${stats.successOrders}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; border-top: 1px solid #f1f5f9; color: #64748b; font-weight: 700;">Kunjungan:</td>
                  <td style="padding: 5px 0; border-top: 1px solid #f1f5f9; text-align: right; font-weight: 900; color: #0f172a;">${visits}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; border-top: 1px solid #f1f5f9; color: #64748b; font-weight: 700;">Konversi:</td>
                  <td style="padding: 5px 0; border-top: 1px solid #f1f5f9; text-align: right; font-weight: 900; color: #0f172a;">${convRate}%</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; border-top: 1px solid #f1f5f9; color: #64748b; font-weight: 700;">Terlaris:</td>
                  <td style="padding: 5px 0; border-top: 1px solid #f1f5f9; text-align: right; font-weight: 900; color: #2563eb;">${topProd}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

      </div>

      <!-- Text Summary Section (Matching Reference Style) -->
      <div style="background-color: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 16px 18px; font-size: 12px; line-height: 1.7; color: #334155; margin-bottom: 22px;">
        <div style="font-weight: 900; font-size: 13px; color: #0f172a; margin-bottom: 2px;">
          📈 <strong>Laporan mingguan · ${store}</strong>
        </div>
        <div style="font-size: 10px; font-weight: 700; color: #64748b; margin-bottom: 10px;">
          ${now}
        </div>
        <div>
          🗓 <strong>Periode:</strong> ${stats.dateRange}
        </div>
        <div>
          📦 <strong>Senin-Minggu lalu:</strong> ${stats.successOrders} pesanan · omset Rp ${stats.totalOmset.toLocaleString("id-ID")}
        </div>
        <div style="color: #0f172a; font-weight: 800;">
          💼 <strong>Laba bersih:</strong> Rp ${stats.totalProfit.toLocaleString("id-ID")}
        </div>
        <div>
          👀 <strong>Traffic:</strong> ${visits} kunjungan · konversi ${convRate}%
        </div>
        <div>
          🏆 <strong>Terlaris:</strong> ${topProd}
        </div>
      </div>

      <!-- Action CTA Button -->
      <div style="text-align: center; margin-bottom: 10px;">
        <a href="${adminUrl}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; text-decoration: none; padding: 13px 28px; border-radius: 12px; border: 2px solid #000000; box-shadow: 3px 3px 0px #000000;">
          Buka laporan lengkap
        </a>
      </div>

    </div>

    <!-- Footer -->
    <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 20px; text-align: center; font-size: 10px; color: #94a3b8; font-weight: 600;">
      Notifikasi Otomatis Terjadwal • Dashboard Manajemen ${store}
    </div>

  </div>
</body>
</html>`;
}

/**
 * Send simulated/real email notification via Nodemailer SMTP or Simulation fallback
 */
export async function sendEmailMessage(
  recipient: string,
  subject: string,
  htmlContent: string,
  customConfig?: {
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPass?: string;
    smtpSecure?: boolean;
    senderName?: string;
  }
): Promise<{ success: boolean; message: string; simulated?: boolean }> {
  if (!recipient || !recipient.trim()) {
    return {
      success: false,
      message: "Alamat email penerima belum diisi.",
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emails = recipient
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  const invalid = emails.find((e) => !emailRegex.test(e));
  if (invalid) {
    return {
      success: false,
      message: `Format email "${invalid}" tidak valid.`,
    };
  }

  // Load notification settings for fallback credentials
  const settings = await getNotificationSettings();
  const smtpHost = customConfig?.smtpHost || settings.email.smtpHost || process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = customConfig?.smtpPort || settings.email.smtpPort || Number(process.env.SMTP_PORT) || 465;
  const smtpUser = customConfig?.smtpUser || settings.email.smtpUser || process.env.SMTP_USER || "";
  const smtpPass = customConfig?.smtpPass || settings.email.smtpPass || process.env.SMTP_PASS || "";
  const senderName = customConfig?.senderName || settings.email.senderName || "XYZPEDIA Store Bot";

  // Check if SMTP credentials exist for REAL delivery
  if (smtpUser.trim() && smtpPass.trim()) {
    const isGmail = smtpHost.toLowerCase().includes("gmail");
    try {
      // Normalize Gmail App Passwords (strip spaces e.g. "abcd efgh ijkl mnop" -> "abcdefghijklmnop")
      const cleanPass = smtpPass.trim().replace(/\s+/g, "");

      const transportOptions: any = isGmail
        ? {
            service: "gmail",
            auth: {
              user: smtpUser.trim(),
              pass: cleanPass,
            },
          }
        : {
            host: smtpHost.trim(),
            port: Number(smtpPort),
            secure: Number(smtpPort) === 465,
            auth: {
              user: smtpUser.trim(),
              pass: cleanPass,
            },
          };

      const transporter = nodemailer.createTransport(transportOptions);

      await transporter.sendMail({
        from: `"${senderName}" <${smtpUser.trim()}>`,
        to: emails.join(", "),
        subject,
        html: htmlContent,
      });

      return {
        success: true,
        simulated: false,
        message: `Email laporan mingguan berhasil dikirim ke ${emails.join(", ")}! Silakan cek kotak masuk Gmail Anda.`,
      };
    } catch (err: any) {
      console.error("[Nodemailer Error]", err);
      const errStr = `${err?.message || ""} ${err?.response || ""}`;
      let humanMsg = `Gagal mengirim email: ${err?.message || "Autentikasi gagal"}`;

      if (
        err?.responseCode === 534 ||
        errStr.includes("534") ||
        errStr.includes("WebLoginRequired")
      ) {
        humanMsg =
          "Google menolak login (Error 534): Anda memasukkan password akun biasa. Google mewajibkan 'Sandi Aplikasi (App Password)' 16 huruf. Buka https://myaccount.google.com/apppasswords lalu buat Sandi Aplikasi 16 huruf.";
      } else if (
        err?.responseCode === 535 ||
        errStr.includes("535") ||
        errStr.includes("BadCredentials") ||
        err?.code === "EAUTH"
      ) {
        const isNotGmailDomain = isGmail && !smtpUser.toLowerCase().includes("@gmail.com") && !smtpUser.toLowerCase().includes("@googlemail.com");
        if (isNotGmailDomain) {
          humanMsg = `Autentikasi Gmail ditolak (Error 535 Bad Credentials): Anda memasukkan user "${smtpUser}". Server smtp.gmail.com HANYA bisa login dengan email akun Google asli (yang berakhiran @gmail.com) tempat Sandi Aplikasi 16 huruf itu dibuat. Silakan ganti 'Gmail / Email SMTP Pengirim' dengan akun Gmail Anda (misal: namatoko@gmail.com). Email penerima tetap bisa memakai ${emails.join(", ")}.`;
        } else {
          humanMsg =
            "Autentikasi Gmail gagal (Error 535 Bad Credentials): Email atau Sandi Aplikasi salah. Pastikan 'Email SMTP Pengirim' adalah akun Gmail tempat Anda men-generate Sandi Aplikasi, dan 16 huruf Sandi Aplikasi sudah sesuai tanpa spasi.";
        }
      }

      return {
        success: false,
        message: humanMsg,
      };
    }
  }

  // Fallback: Mode Simulasi dengan template lengkap
  console.log(`[Email Simulation] Mengirim ke: ${emails.join(", ")} | Subjek: ${subject}`);
  return {
    success: true,
    simulated: true,
    message: `Template email berhasil diproses untuk ${emails.join(", ")}! (Catatan: Untuk mengirim langsung ke inbox Gmail nyata, masukkan Gmail & App Password di form Pengaturan Email).`,
  };
}

/**
 * Generate weekly summary report text for Telegram (Matching User's Reference Screenshot)
 */
export function formatWeeklyReportMessage(stats: {
  totalOrders: number;
  successOrders: number;
  totalOmset: number;
  totalProfit: number;
  dateRange?: string;
  visits?: number;
  conversionRate?: number | string;
  topProduct?: string;
  storeName?: string;
  timestamp?: string;
}) {
  const store = stats.storeName || "TokoKaryawan";
  const visits = stats.visits ?? 42;
  const convRate = stats.conversionRate ?? "4,8%";
  const topProd = stats.topProduct || "Canva — 1 Tahun";
  const now =
    stats.timestamp ||
    new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    }) +
    " · " +
    new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }) +
    " WIB";

  return `📈 <b>Laporan mingguan · ${store}</b>
<blockquote>${now}</blockquote>

Senin–Minggu lalu: <b>${stats.successOrders} pesanan</b> · omzet <b>Rp${stats.totalOmset.toLocaleString("id-ID")}</b>
💼 Laba bersih: <b>Rp${stats.totalProfit.toLocaleString("id-ID")}</b>

👀 ${visits} kunjungan · konversi ${convRate}
🏆 Terlaris: <b>${topProd}</b>`;
}

/**
 * Format & Generate Template for: Transaksi Baru Masuk (Pending)
 */
export function formatNewOrderMessage(data: {
  invoice: string;
  productName: string;
  variantName: string;
  targetUser?: string;
  totalAmount: number;
  paymentMethod?: string;
  customerPhone?: string;
  customerEmail?: string;
  dateStr?: string;
  storeName?: string;
}) {
  const store = data.storeName || "XYZPEDIA";
  const now =
    data.dateStr ||
    new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    }) +
    " · " +
    new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }) +
    " WIB";

  const targetLine = data.targetUser ? `🎯 Target Akun: <code>${data.targetUser}</code>\n` : "";
  const phoneLine = data.customerPhone ? `📱 Kontak Pembeli: <code>${data.customerPhone}</code>\n` : "";

  return `🔔 <b>Pesanan baru masuk · ${store}</b>
<blockquote>${now}</blockquote>

Invoice: <code>${data.invoice}</code>
📦 Layanan: <b>${data.productName} — ${data.variantName}</b>
${targetLine}${phoneLine}
💰 Total tagihan: <b>Rp${data.totalAmount.toLocaleString("id-ID")}</b>
💳 Metode: <b>${data.paymentMethod || "QRIS Real-time"}</b>
⏳ Status: <b>Menunggu Pembayaran</b>`;
}

export function generateNewOrderEmailHtml(data: {
  invoice: string;
  productName: string;
  variantName: string;
  targetUser?: string;
  totalAmount: number;
  paymentMethod?: string;
  customerPhone?: string;
  customerEmail?: string;
  storeName?: string;
  adminUrl?: string;
}): string {
  const store = data.storeName || "XYZPEDIA";
  const appUrl1 = (process.env.NEXT_PUBLIC_APP_URL || "https://xyzpedia.vercel.app").replace(/\/$/, "");
  const adminUrl = data.adminUrl || `${appUrl1}/admin/transaksi`;
  const contact = [data.customerPhone, data.customerEmail].filter(Boolean).join(" • ") || "-";
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Pesanan Baru Masuk · ${data.invoice} — ${store}</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 2px solid #000000; box-shadow: 6px 6px 0px #000000;">
    <div style="background-color: #ffd731; padding: 18px 24px; border-bottom: 2px solid #000000;">
      <div style="font-size: 11px; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase; color: #78350f;">
        ${store.toUpperCase()} NOTIFIKASI PESANAN
      </div>
      <div style="font-size: 18px; font-weight: 900; color: #000000;">
        Pesanan Baru Masuk (Pending)
      </div>
    </div>
    <div style="padding: 24px 20px;">
      <div style="border: 2px solid #000000; border-radius: 12px; padding: 16px; background: #fffbeb; margin-bottom: 18px;">
        <div style="font-size: 11px; font-weight: 700; color: #92400e; margin-bottom: 2px;">NO. INVOICE</div>
        <div style="font-size: 19px; font-weight: 900; color: #000000; font-family: monospace;">${data.invoice}</div>
        <div style="margin-top: 6px;">
          <span style="display: inline-block; background-color: #fef08a; border: 1.5px solid #000000; border-radius: 999px; padding: 2px 10px; font-size: 10px; font-weight: 900; color: #854d0e;">
            ⏳ MENUNGGU PEMBAYARAN QRIS
          </span>
        </div>
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 0; color: #64748b; font-weight: 700;">Produk:</td>
          <td style="padding: 10px 0; font-weight: 900; text-align: right; color: #0f172a;">${data.productName}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 0; color: #64748b; font-weight: 700;">Varian:</td>
          <td style="padding: 10px 0; font-weight: 900; text-align: right; color: #0f172a;">${data.variantName}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 0; color: #64748b; font-weight: 700;">Target ID:</td>
          <td style="padding: 10px 0; font-weight: 900; text-align: right; font-family: monospace; color: #0f172a;">${data.targetUser || "-"}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 0; color: #64748b; font-weight: 700;">Kontak Pembeli:</td>
          <td style="padding: 10px 0; font-weight: 900; text-align: right; color: #0f172a;">${contact}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 0; color: #64748b; font-weight: 700;">Metode Bayar:</td>
          <td style="padding: 10px 0; font-weight: 900; text-align: right; color: #0f172a;">${data.paymentMethod || "QRIS Real-time"}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; font-size: 14px; font-weight: 900; color: #0f172a;">Total Tagihan:</td>
          <td style="padding: 12px 0; font-size: 18px; font-weight: 900; text-align: right; color: #d97706;">Rp ${data.totalAmount.toLocaleString("id-ID")}</td>
        </tr>
      </table>
      <div style="text-align: center;">
        <a href="${adminUrl}" style="display: inline-block; background-color: #000000; color: #ffffff; font-size: 13px; font-weight: 900; text-transform: uppercase; text-decoration: none; padding: 12px 24px; border-radius: 10px; border: 2px solid #000000; box-shadow: 3px 3px 0px #000000;">
          Lihat di Dashboard Admin
        </a>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Format & Generate Template for: Pembayaran Berhasil & Lunas (PAID)
 */
export function formatSuccessOrderMessage(data: {
  invoice: string;
  productName: string;
  variantName: string;
  targetUser?: string;
  totalAmount: number;
  profit?: number;
  paymentMethod?: string;
  deliveryType?: "INSTANT" | "MANUAL" | string;
  customerPhone?: string;
  customerEmail?: string;
  sn?: string;
  supplierRef?: string;
  dateStr?: string;
  storeName?: string;
}) {
  const store = data.storeName || "XYZPEDIA";
  const now =
    data.dateStr ||
    new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    }) +
    " · " +
    new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }) +
    " WIB";

  const targetLine = data.targetUser ? `🎯 Target Akun: <code>${data.targetUser}</code>\n` : "";
  const phoneLine = data.customerPhone ? `📱 WhatsApp: <code>${data.customerPhone}</code>\n` : "";
  const snLine = data.sn ? `🧾 <b>SN / Bukti Pengiriman:</b> <code>${data.sn}</code>\n` : "";
  const refLine = data.supplierRef ? `🔗 Ref Supplier: <code>${data.supplierRef}</code>\n` : "";
  const isManual = data.deliveryType?.toUpperCase() === "MANUAL";
  const deliveryStatus = isManual
    ? "⚠️ Pengiriman: <b>MANUAL (Kirim kredensial via WA admin)</b>"
    : "⚡ Pengiriman: <b>INSTAN (Sukses masuk ke akun tujuan)</b>";

  return `✅ <b>Pembayaran Berhasil & Terkirim · ${store}</b>
<blockquote>${now}</blockquote>

Invoice: <code>${data.invoice}</code>
📦 Layanan: <b>${data.productName} — ${data.variantName}</b>
${targetLine}${phoneLine}💰 Total Lunas: <b>Rp${data.totalAmount.toLocaleString("id-ID")}</b>
${data.profit ? `💼 Laba Bersih: <b>+Rp${data.profit.toLocaleString("id-ID")}</b>\n` : ""}💳 Metode: <b>${data.paymentMethod || "QRIS Terverifikasi"}</b>
${deliveryStatus}
${snLine}${refLine}`;
}

/**
 * Generate official receipt email for the BUYER
 */
export function generateBuyerReceiptEmailHtml(data: {
  invoice: string;
  productName: string;
  variantName: string;
  targetUser?: string;
  totalAmount: number;
  paymentMethod?: string;
  sn?: string;
  supplierRef?: string;
  storeName?: string;
  appUrl?: string;
}): string {
  const store = data.storeName || "XYZPEDIA";
  const appUrl = (data.appUrl || process.env.NEXT_PUBLIC_APP_URL || "https://xyzpedia.vercel.app").replace(/\/$/, "");
  const trackingUrl = `${appUrl}/transaksi/${data.invoice}`;

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Bukti Pembayaran & Pengiriman Berhasil · ${data.invoice}</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #0b0b10; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
  <div style="max-width: 580px; margin: 0 auto; background: #12121a; border-radius: 20px; overflow: hidden; border: 2px solid #2d2d3d; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
    <!-- Header -->
    <div style="background-color: #ffd731; padding: 24px 24px 20px; text-align: center; border-bottom: 2px solid #000000;">
      <div style="font-size: 13px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; color: #000000; margin-bottom: 4px;">
        ${store.toUpperCase()} OFFICIAL RECEIPT
      </div>
      <div style="font-size: 22px; font-weight: 900; color: #000000;">
        Pesanan Berhasil & Lunas 🎉
      </div>
      <p style="margin: 6px 0 0; font-size: 12px; font-weight: 700; color: #333333;">
        Terima kasih atas pembelian Anda! Item telah dikirim ke akun Anda.
      </p>
    </div>

    <div style="padding: 24px 22px;">
      <!-- Invoice & Status Box -->
      <div style="background: #1a1a24; border: 1.5px solid #2e2e42; border-radius: 14px; padding: 16px; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td>
              <div style="font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase;">Nomor Invoice</div>
              <div style="font-size: 17px; font-weight: 900; color: #ffd731; font-family: monospace; margin-top: 2px;">
                ${data.invoice}
              </div>
            </td>
            <td style="text-align: right; vertical-align: middle;">
              <span style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: 900; text-transform: uppercase;">
                ✓ BERHASIL
              </span>
            </td>
          </tr>
        </table>
      </div>

      <!-- SN / Proof Box -->
      ${data.sn ? `
      <div style="background: #0f172a; border: 1.5px solid #38bdf8; border-radius: 14px; padding: 14px 16px; margin-bottom: 20px;">
        <div style="font-size: 11px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">
          🧾 Bukti Serial Number (SN) / Pengiriman Server:
        </div>
        <div style="font-size: 12px; font-weight: 700; color: #f8fafc; font-family: monospace; word-break: break-all; line-height: 1.5;">
          ${data.sn}
        </div>
      </div>
      ` : ""}

      <!-- Order Details -->
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 24px;">
        <tr style="border-bottom: 1px solid #232332;">
          <td style="padding: 12px 0; color: #94a3b8; font-weight: 700;">Layanan & Varian:</td>
          <td style="padding: 12px 0; font-weight: 900; text-align: right; color: #ffffff;">
            ${data.productName} — ${data.variantName}
          </td>
        </tr>
        ${data.targetUser ? `
        <tr style="border-bottom: 1px solid #232332;">
          <td style="padding: 12px 0; color: #94a3b8; font-weight: 700;">ID Akun / Server Tujuan:</td>
          <td style="padding: 12px 0; font-weight: 900; text-align: right; font-family: monospace; color: #ffd731;">
            ${data.targetUser}
          </td>
        </tr>` : ""}
        <tr style="border-bottom: 1px solid #232332;">
          <td style="padding: 12px 0; color: #94a3b8; font-weight: 700;">Metode Pembayaran:</td>
          <td style="padding: 12px 0; font-weight: 900; text-align: right; color: #ffffff;">
            ${data.paymentMethod || "QRIS Real-time"}
          </td>
        </tr>
        <tr>
          <td style="padding: 14px 0; font-size: 15px; font-weight: 900; color: #ffffff;">Total Pembayaran:</td>
          <td style="padding: 14px 0; font-size: 20px; font-weight: 900; text-align: right; color: #10b981;">
            Rp ${data.totalAmount.toLocaleString("id-ID")}
          </td>
        </tr>
      </table>

      <!-- Track Order CTA Button -->
      <div style="text-align: center; margin-bottom: 20px;">
        <a href="${trackingUrl}" style="display: block; background-color: #ffd731; color: #000000; font-size: 13px; font-weight: 900; text-transform: uppercase; text-decoration: none; padding: 14px 20px; border-radius: 12px; border: 2px solid #000000; box-shadow: 0 4px 10px rgba(255, 215, 49, 0.3);">
          Lihat Status Transaksi & Invoice
        </a>
      </div>

      <div style="text-align: center; font-size: 11px; color: #64748b; line-height: 1.6;">
        Butuh bantuan terkait pesanan Anda? Hubungi Customer Support kami via WhatsApp: <strong style="color: #22c55e;">+62 896-4666-1132</strong>
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function generateSuccessOrderEmailHtml(data: {
  invoice: string;
  productName: string;
  variantName: string;
  targetUser?: string;
  totalAmount: number;
  profit?: number;
  paymentMethod?: string;
  deliveryType?: "INSTANT" | "MANUAL" | string;
  customerPhone?: string;
  storeName?: string;
  adminUrl?: string;
}): string {
  const store = data.storeName || "XYZPEDIA";
  const appUrl2 = (process.env.NEXT_PUBLIC_APP_URL || "https://xyzpedia.vercel.app").replace(/\/$/, "");
  const adminUrl = data.adminUrl || `${appUrl2}/admin/transaksi`;
  const isManual = data.deliveryType?.toUpperCase() === "MANUAL";
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Pembayaran Lunas · ${data.invoice} — ${store}</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 2px solid #000000; box-shadow: 6px 6px 0px #000000;">
    <div style="background-color: #10b981; padding: 18px 24px; border-bottom: 2px solid #000000;">
      <div style="font-size: 11px; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase; color: #d1fae5;">
        ${store.toUpperCase()} ORDER FULFILLMENT
      </div>
      <div style="font-size: 18px; font-weight: 900; color: #ffffff;">
        Pembayaran Berhasil & Lunas (PAID)
      </div>
    </div>
    <div style="padding: 24px 20px;">
      <div style="border: 2px solid #000000; border-radius: 12px; padding: 16px; background: #ecfdf5; margin-bottom: 18px;">
        <div style="font-size: 11px; font-weight: 700; color: #065f46; margin-bottom: 2px;">NO. INVOICE</div>
        <div style="font-size: 19px; font-weight: 900; color: #000000; font-family: monospace;">${data.invoice}</div>
        <div style="margin-top: 6px;">
          <span style="display: inline-block; background-color: #d1fae5; border: 1.5px solid #000000; border-radius: 999px; padding: 2px 10px; font-size: 10px; font-weight: 900; color: #065f46;">
            ✓ LUNAS & DIVERIFIKASI
          </span>
          ${isManual ? `
          <span style="display: inline-block; background-color: #fed7aa; border: 1.5px solid #000000; border-radius: 999px; padding: 2px 10px; font-size: 10px; font-weight: 900; color: #9a3412; margin-left: 6px;">
            ⚠️ PENGIRIMAN MANUAL
          </span>` : ""}
        </div>
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 0; color: #64748b; font-weight: 700;">Item Pembelian:</td>
          <td style="padding: 10px 0; font-weight: 900; text-align: right; color: #0f172a;">${data.productName} — ${data.variantName}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 0; color: #64748b; font-weight: 700;">Target ID Akun:</td>
          <td style="padding: 10px 0; font-weight: 900; text-align: right; font-family: monospace; color: #0f172a;">${data.targetUser || "-"}</td>
        </tr>
        ${data.customerPhone ? `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 0; color: #64748b; font-weight: 700;">WhatsApp Customer:</td>
          <td style="padding: 10px 0; font-weight: 900; text-align: right; font-family: monospace; color: #0f172a;">${data.customerPhone}</td>
        </tr>` : ""}
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 0; color: #64748b; font-weight: 700;">Metode Bayar:</td>
          <td style="padding: 10px 0; font-weight: 900; text-align: right; color: #0f172a;">${data.paymentMethod || "QRIS Real-time"}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; font-size: 14px; font-weight: 900; color: #0f172a;">Total Diterima:</td>
          <td style="padding: 12px 0; font-size: 18px; font-weight: 900; text-align: right; color: #059669;">Rp ${data.totalAmount.toLocaleString("id-ID")}</td>
        </tr>
        ${data.profit ? `
        <tr>
          <td style="padding: 4px 0; font-size: 12px; font-weight: 700; color: #64748b;">Estimasi Margin:</td>
          <td style="padding: 4px 0; font-size: 13px; font-weight: 900; text-align: right; color: #10b981;">+Rp ${data.profit.toLocaleString("id-ID")}</td>
        </tr>` : ""}
      </table>
      <div style="text-align: center;">
        <a href="${adminUrl}" style="display: inline-block; background-color: #10b981; color: #ffffff; font-size: 13px; font-weight: 900; text-transform: uppercase; text-decoration: none; padding: 12px 24px; border-radius: 10px; border: 2px solid #000000; box-shadow: 3px 3px 0px #000000;">
          Buka Kelola Transaksi
        </a>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Format & Generate Template for: Transaksi Gagal / Butuh Bantuan
 */
export function formatFailedOrderMessage(data: {
  invoice: string;
  productName: string;
  variantName: string;
  totalAmount: number;
  reason?: string;
  customerPhone?: string;
  dateStr?: string;
  storeName?: string;
}) {
  const store = data.storeName || "XYZPEDIA";
  const now =
    data.dateStr ||
    new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    }) +
    " · " +
    new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }) +
    " WIB";

  return `🚨 <b>Kendala transaksi · ${store}</b>
<blockquote>${now}</blockquote>

Invoice: <code>${data.invoice}</code>
📦 Layanan: <b>${data.productName} (${data.variantName})</b>
💰 Nominal: <b>Rp${data.totalAmount.toLocaleString("id-ID")}</b>
${data.customerPhone ? `📱 Kontak: <code>${data.customerPhone}</code>\n` : ""}
❗ Kendala: <b>${data.reason || "Supplier timeout atau stok habis"}</b>
⚠️ Harap hubungi pembeli atau cek kelola transaksi di dashboard admin.`;
}

export function generateFailedOrderEmailHtml(data: {
  invoice: string;
  productName: string;
  variantName: string;
  totalAmount: number;
  reason?: string;
  customerPhone?: string;
  storeName?: string;
  adminUrl?: string;
}): string {
  const store = data.storeName || "XYZPEDIA";
  const appUrl3 = (process.env.NEXT_PUBLIC_APP_URL || "https://xyzpedia.vercel.app").replace(/\/$/, "");
  const adminUrl = data.adminUrl || `${appUrl3}/admin/transaksi`;
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Peringatan Transaksi Gagal · ${data.invoice} — ${store}</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 2px solid #000000; box-shadow: 6px 6px 0px #000000;">
    <div style="background-color: #ef4444; padding: 18px 24px; border-bottom: 2px solid #000000;">
      <div style="font-size: 11px; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase; color: #fee2e2;">
        ${store.toUpperCase()} ALERT SYSTEM
      </div>
      <div style="font-size: 18px; font-weight: 900; color: #ffffff;">
        Transaksi Gagal / Pending Butuh Bantuan
      </div>
    </div>
    <div style="padding: 24px 20px;">
      <div style="border: 2px solid #000000; border-radius: 12px; padding: 16px; background: #fef2f2; margin-bottom: 18px;">
        <div style="font-size: 11px; font-weight: 700; color: #991b1b; margin-bottom: 2px;">NO. INVOICE</div>
        <div style="font-size: 19px; font-weight: 900; color: #000000; font-family: monospace;">${data.invoice}</div>
        <div style="margin-top: 6px;">
          <span style="display: inline-block; background-color: #fecaca; border: 1.5px solid #000000; border-radius: 999px; padding: 2px 10px; font-size: 10px; font-weight: 900; color: #991b1b;">
            ⚠️ KENDALA SISTEM / TIMEOUT
          </span>
        </div>
      </div>
      <div style="background: #fff; border: 1.5px solid #cbd5e1; border-radius: 10px; padding: 14px; font-size: 12px; color: #334155; margin-bottom: 18px;">
        <strong>Keterangan Kendala:</strong> ${data.reason || "Supplier timeout atau stok produk habis saat otomatisasi top up."}
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 0; color: #64748b; font-weight: 700;">Item:</td>
          <td style="padding: 10px 0; font-weight: 900; text-align: right; color: #0f172a;">${data.productName} — ${data.variantName}</td>
        </tr>
        ${data.customerPhone ? `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 0; color: #64748b; font-weight: 700;">Kontak Pembeli:</td>
          <td style="padding: 10px 0; font-weight: 900; text-align: right; font-family: monospace; color: #0f172a;">${data.customerPhone}</td>
        </tr>` : ""}
        <tr>
          <td style="padding: 12px 0; font-size: 14px; font-weight: 900; color: #0f172a;">Nominal:</td>
          <td style="padding: 12px 0; font-size: 18px; font-weight: 900; text-align: right; color: #dc2626;">Rp ${data.totalAmount.toLocaleString("id-ID")}</td>
        </tr>
      </table>
      <div style="text-align: center;">
        <a href="${adminUrl}" style="display: inline-block; background-color: #ef4444; color: #ffffff; font-size: 13px; font-weight: 900; text-transform: uppercase; text-decoration: none; padding: 12px 24px; border-radius: 10px; border: 2px solid #000000; box-shadow: 3px 3px 0px #000000;">
          Periksa Transaksi Ini
        </a>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Format & Generate Template for: Ringkasan Penjualan Harian
 */
export function formatDailyReportMessage(stats: {
  date?: string;
  totalOrders: number;
  successOrders: number;
  totalOmset: number;
  totalProfit: number;
  topProduct?: string;
  storeName?: string;
  visits?: number;
  conversionRate?: number | string;
}) {
  const store = stats.storeName || "XYZPEDIA";
  const dateStr =
    stats.date ||
    new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    }) +
    " · 23.59 WIB";
  const visits = stats.visits ?? Math.max(stats.totalOrders * 8, 48);
  const convRate =
    stats.conversionRate ??
    (visits > 0 ? ((stats.successOrders / visits) * 100).toFixed(1) + "%" : "12,5%");

  return `🌙 <b>Rekap penjualan harian · ${store}</b>
<blockquote>${dateStr}</blockquote>

Hari ini: <b>${stats.successOrders} pesanan</b> · omzet <b>Rp${stats.totalOmset.toLocaleString("id-ID")}</b>
💼 Laba bersih: <b>Rp${stats.totalProfit.toLocaleString("id-ID")}</b>

👀 ${visits} kunjungan · konversi ${convRate}
🏆 Terlaris: <b>${stats.topProduct || "Canva — 1 Tahun"}</b>`;
}

export function generateDailyReportEmailHtml(stats: {
  date: string;
  totalOrders: number;
  successOrders: number;
  totalOmset: number;
  totalProfit: number;
  topProduct?: string;
  storeName?: string;
  adminUrl?: string;
}): string {
  const store = stats.storeName || "XYZPEDIA";
  const appUrl4 = (process.env.NEXT_PUBLIC_APP_URL || "https://xyzpedia.vercel.app").replace(/\/$/, "");
  const adminUrl = stats.adminUrl || `${appUrl4}/admin`;
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Rekap Penjualan Harian · ${stats.date} — ${store}</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 2px solid #000000; box-shadow: 6px 6px 0px #000000;">
    <div style="background-color: #3b82f6; padding: 18px 24px; border-bottom: 2px solid #000000;">
      <div style="font-size: 11px; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase; color: #dbeafe;">
        ${store.toUpperCase()} DAILY SUMMARY
      </div>
      <div style="font-size: 18px; font-weight: 900; color: #ffffff;">
        Rekap Penjualan Harian (${stats.date})
      </div>
    </div>
    <div style="padding: 24px 20px;">
      <div style="border: 2px solid #000000; border-radius: 12px; padding: 16px; background: #eff6ff; margin-bottom: 18px;">
        <div style="font-size: 11px; font-weight: 700; color: #1e40af; margin-bottom: 2px;">TOTAL OMSET HARI INI</div>
        <div style="font-size: 24px; font-weight: 900; color: #000000;">Rp ${stats.totalOmset.toLocaleString("id-ID")}</div>
        <div style="font-size: 12px; font-weight: 700; color: #2563eb; margin-top: 4px;">
          Laba Bersih: <strong>Rp ${stats.totalProfit.toLocaleString("id-ID")}</strong>
        </div>
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 0; color: #64748b; font-weight: 700;">Pesanan Berhasil:</td>
          <td style="padding: 10px 0; font-weight: 900; text-align: right; color: #0f172a;">${stats.successOrders} Transaksi</td>
        </tr>
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 0; color: #64748b; font-weight: 700;">Total Order Masuk:</td>
          <td style="padding: 10px 0; font-weight: 900; text-align: right; color: #0f172a;">${stats.totalOrders} Pesanan</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #64748b; font-weight: 700;">Produk Terlaris:</td>
          <td style="padding: 10px 0; font-weight: 900; text-align: right; color: #0f172a;">${stats.topProduct || "Canva Pro"}</td>
        </tr>
      </table>
      <div style="text-align: center;">
        <a href="${adminUrl}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; font-size: 13px; font-weight: 900; text-transform: uppercase; text-decoration: none; padding: 12px 24px; border-radius: 10px; border: 2px solid #000000; box-shadow: 3px 3px 0px #000000;">
          Buka Dashboard Lengkap
        </a>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Centralized automatic event dispatcher for all system notifications
 */
export async function dispatchNotificationEvent(
  eventType: keyof NotificationSettings["events"],
  payload: any
): Promise<{ success: boolean; telegramSent: boolean; emailSent: boolean }> {
  try {
    const settings = await getNotificationSettings();
    const eventConfig = settings.events[eventType];
    if (!eventConfig) return { success: false, telegramSent: false, emailSent: false };

    let telegramSent = false;
    let emailSent = false;

    // 1. Telegram Dispatch
    if (
      settings.telegram.enabled &&
      eventConfig.telegram &&
      settings.telegram.botToken &&
      settings.telegram.chatId
    ) {
      let tgText = "";
      let photoBuffer: Buffer | undefined;
      let button: { text: string; url: string } | undefined;
      const appUrlTg = (process.env.NEXT_PUBLIC_APP_URL || "https://xyzpedia.vercel.app").replace(/\/$/, "");

      if (eventType === "notifyNewOrder") {
        tgText = formatNewOrderMessage(payload);
        button = {
          text: "🧾 Cek Pesanan Masuk",
          url: payload.invoice
            ? `${appUrlTg}/invoice/${payload.invoice}`
            : `${appUrlTg}/admin`,
        };
      } else if (eventType === "notifySuccessOrder") {
        tgText = formatSuccessOrderMessage(payload);
        button = {
          text: "⚡ Kelola Transaksi",
          url: payload.invoice
            ? `${appUrlTg}/invoice/${payload.invoice}`
            : `${appUrlTg}/admin`,
        };
      } else if (eventType === "notifyFailedOrder") {
        tgText = formatFailedOrderMessage(payload);
        button = {
          text: "🚨 Periksa Kendala",
          url: payload.invoice
            ? `${appUrlTg}/invoice/${payload.invoice}`
            : `${appUrlTg}/admin`,
        };
      } else if (eventType === "notifyDailyReport") {
        tgText = formatDailyReportMessage(payload);
        button = {
          text: "📈 Buka Dashboard",
          url: `${appUrlTg}/admin`,
        };
      } else if (eventType === "notifyWeeklyReport") {
        tgText = formatWeeklyReportMessage(payload);
        try {
          photoBuffer = await generateReportCardPng({
            storeName: payload.storeName || "XYZPEDIA",
            subStoreName: "Panel Admin",
            totalOmset: payload.totalOmset ?? 0,
            totalProfit: payload.totalProfit ?? 0,
            totalOrders: payload.successOrders ?? payload.totalOrders ?? 0,
            visits: payload.visits ?? 42,
            conversionRate: payload.conversionRate ? `${payload.conversionRate}%` : "4,8%",
            topProduct: payload.topProduct || "Canva — 1 Tahun",
            siteUrl: "xyzpedia.com",
          });
        } catch (cardErr) {
          console.warn("Gagal generate card png:", cardErr);
        }
        button = {
          text: "📊 Buka laporan lengkap",
          url: payload.adminUrl || `${appUrlTg}/admin`,
        };
      }

      if (tgText) {
        const res = await sendTelegramMessage(
          settings.telegram.botToken,
          settings.telegram.chatId,
          tgText,
          { button, photoBuffer }
        );
        telegramSent = res.success;
      }
    }

    // 2. Email Dispatch
    if (settings.email.enabled) {
      let emailSubject = "";
      let emailHtml = "";

      // 2a. Send to Admin recipient
      if (eventConfig.email && settings.email.recipient) {
        if (eventType === "notifyNewOrder") {
          emailSubject = `🔔 Pesanan Baru Masuk · ${payload.invoice} — XYZPEDIA`;
          emailHtml = generateNewOrderEmailHtml(payload);
        } else if (eventType === "notifySuccessOrder") {
          emailSubject = `✅ Pembayaran Berhasil & Lunas · ${payload.invoice} — XYZPEDIA`;
          emailHtml = generateSuccessOrderEmailHtml(payload);
        } else if (eventType === "notifyFailedOrder") {
          emailSubject = `🚨 Peringatan: Transaksi Gagal · ${payload.invoice} — XYZPEDIA`;
          emailHtml = generateFailedOrderEmailHtml(payload);
        } else if (eventType === "notifyDailyReport") {
          emailSubject = `🌙 Rekap Penjualan Harian · ${payload.date} — XYZPEDIA`;
          emailHtml = generateDailyReportEmailHtml(payload);
        } else if (eventType === "notifyWeeklyReport") {
          emailSubject = `📊 Laporan Mingguan · Rp ${payload.totalProfit?.toLocaleString("id-ID")} — XYZPEDIA`;
          emailHtml = generateWeeklyReportEmailHtml(payload);
        }

        if (emailSubject && emailHtml) {
          const res = await sendEmailMessage(settings.email.recipient, emailSubject, emailHtml);
          emailSent = res.success;
        }
      }

      // 2b. Send official proof receipt to BUYER email
      if (
        eventType === "notifySuccessOrder" &&
        payload.customerEmail &&
        payload.customerEmail.includes("@")
      ) {
        try {
          const buyerSubject = `🧾 Bukti Pembayaran & Pengiriman Berhasil · ${payload.invoice} — XYZPEDIA`;
          const buyerHtml = generateBuyerReceiptEmailHtml({
            invoice: payload.invoice,
            productName: payload.productName,
            variantName: payload.variantName,
            targetUser: payload.targetUser,
            totalAmount: payload.totalAmount,
            paymentMethod: payload.paymentMethod,
            sn: payload.sn,
            supplierRef: payload.supplierRef,
            storeName: payload.storeName,
          });
          const buyerRes = await sendEmailMessage(payload.customerEmail, buyerSubject, buyerHtml);
          if (buyerRes.success) {
            console.log(`[Notification] Bukti transaksi berhasil dikirim ke email pembeli: ${payload.customerEmail}`);
          }
        } catch (buyerMailErr) {
          console.error(`[Notification] Gagal kirim email ke pembeli (${payload.customerEmail}):`, buyerMailErr);
        }
      }
    }

    return {
      success: telegramSent || emailSent,
      telegramSent,
      emailSent,
    };
  } catch (err) {
    console.error(`[dispatchNotificationEvent Error: ${eventType}]`, err);
    return { success: false, telegramSent: false, emailSent: false };
  }
}
