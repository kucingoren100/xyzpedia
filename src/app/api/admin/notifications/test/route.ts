import { NextResponse } from "next/server";
import { getAdminSession, canAdminMutate } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import {
  getNotificationSettings,
  sendTelegramMessage,
  sendEmailMessage,
  formatWeeklyReportMessage,
  generateWeeklyReportEmailHtml,
  formatNewOrderMessage,
  generateNewOrderEmailHtml,
  formatSuccessOrderMessage,
  generateSuccessOrderEmailHtml,
  formatFailedOrderMessage,
  generateFailedOrderEmailHtml,
  formatDailyReportMessage,
  generateDailyReportEmailHtml,
  generateBuyerReceiptEmailHtml,
  SendTelegramOptions,
} from "@/lib/notifications";
import { generateReportCardPng } from "@/lib/reportCardImage";

function isSafeSmtpHost(host?: string, savedHost?: string): boolean {
  if (!host) return false;
  const cleanHost = host.trim().toLowerCase();
  // Matches saved host from settings
  if (savedHost && cleanHost === savedHost.trim().toLowerCase()) {
    return true;
  }
  // Reject IP private & loopback
  if (
    cleanHost === "localhost" ||
    cleanHost === "127.0.0.1" ||
    cleanHost === "::1" ||
    cleanHost.startsWith("10.") ||
    cleanHost.startsWith("192.168.") ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(cleanHost) ||
    cleanHost.endsWith(".local") ||
    cleanHost.endsWith(".internal")
  ) {
    return false;
  }
  // Trusted public SMTP providers allowlist
  const allowedSuffixes = [
    "gmail.com",
    "googlemail.com",
    "sendgrid.net",
    "mailgun.org",
    "zoho.com",
    "zoho.eu",
    "outlook.com",
    "office365.com",
    "brevo.com",
    "sendinblue.com",
    "resend.com",
    "postmarkapp.com",
    "amazon.com",
    "amazonaws.com",
  ];
  return allowedSuffixes.some(
    (allowed) => cleanHost === allowed || cleanHost.endsWith(`.${allowed}`)
  );
}

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    if (!canAdminMutate(session)) {
      return NextResponse.json({ success: false, message: "Akses ditolak (khusus ADMIN/OWNER)." }, { status: 403 });
    }

    const body = await req.json();
    const { channel, eventType, botToken, chatId, recipient } = body;
    const settings = await getNotificationSettings();

    // Helper to send to Telegram
    const dispatchTelegram = async (text: string, options?: SendTelegramOptions) => {
      let activeToken = botToken?.trim();
      if (!activeToken || activeToken.startsWith("••••")) {
        activeToken = settings.telegram.botToken;
      }
      const activeChatId = chatId?.trim() || settings.telegram.chatId;

      if (!activeToken) {
        return { success: false, message: "Bot Token Telegram belum diisi di Pengaturan." };
      }
      if (!activeChatId) {
        return { success: false, message: "Chat ID Telegram belum diisi di Pengaturan." };
      }

      return await sendTelegramMessage(activeToken, activeChatId, text, options);
    };

    // Helper to send to Email
    const dispatchEmail = async (subject: string, html: string) => {
      const activeRecipient = recipient?.trim() || settings.email.recipient;
      if (!activeRecipient) {
        return { success: false, message: "Email penerima belum diisi di Pengaturan." };
      }

      let activeResendKey = body.resendApiKey?.trim();
      if (!activeResendKey || activeResendKey.startsWith("••••")) {
        activeResendKey = settings.email.resendApiKey || process.env.RESEND_API_KEY;
      }

      const usingResend = !!activeResendKey?.trim();
      if (!usingResend) {
        const activeHost = body.smtpHost || settings.email.smtpHost;
        if (!isSafeSmtpHost(activeHost, settings.email.smtpHost)) {
          return {
            success: false,
            message: "Host SMTP ditolak: host privat/loopback dilarang. Hanya domain tersimpan atau penyedia terpercaya yang diizinkan.",
          };
        }
      }

      let activeSmtpPass = body.smtpPass?.trim();
      if (!activeSmtpPass || activeSmtpPass.startsWith("••••")) {
        activeSmtpPass = settings.email.smtpPass;
      }

      return await sendEmailMessage(activeRecipient, subject, html, {
        smtpHost: body.smtpHost || settings.email.smtpHost,
        smtpPort: body.smtpPort || settings.email.smtpPort,
        smtpUser: body.smtpUser || settings.email.smtpUser,
        smtpPass: activeSmtpPass,
        smtpSecure: body.smtpSecure !== undefined ? body.smtpSecure : settings.email.smtpSecure,
        senderName: body.senderName || settings.email.senderName,
        senderEmail: body.senderEmail || settings.email.senderEmail,
        resendApiKey: activeResendKey,
      });
    };

    // ========================================================
    // SPESIFIK: TES BERDASARKAN EVENT NOTIFIKASI
    // ========================================================
    if (eventType) {
      let tgText = "";
      let tgOptions: SendTelegramOptions | undefined;
      let emailSubject = "";
      let emailHtml = "";
      let eventTitle = "";

      if (eventType === "buyer_receipt") {
        eventTitle = "Struk & Kredensial Pembeli";
        const mockData = {
          invoice: "INV-XYZ-" + Date.now().toString().slice(-6),
          productName: "Mobile Legends: Bang Bang",
          variantName: "86 Diamonds (Proses Otomatis)",
          targetUser: "12345678 (Zone 2041)",
          totalAmount: 21500,
          paymentMethod: "QRIS Real-time",
          sn: "SN-XYZ-992841023491 / Transaksi Berhasil Diproses",
        };
        emailSubject = `Bukti Pembayaran & Pengiriman Berhasil · ${mockData.invoice} — XYZPEDIA`;
        emailHtml = generateBuyerReceiptEmailHtml(mockData);
      } else if (eventType === "notifyNewOrder") {
        eventTitle = "Transaksi Baru Masuk";
        const mockData = {
          invoice: "XYZ-" + Date.now().toString().slice(-6),
          productName: "Mobile Legends: Bang Bang",
          variantName: "86 Diamonds (+Garansi Pengiriman)",
          targetUser: "12345678 (Zone 2041)",
          customerPhone: "081234567890",
          customerEmail: "pembeli@gmail.com",
          totalAmount: 21500,
          paymentMethod: "QRIS Real-time Dinamis",
        };
        tgText = formatNewOrderMessage(mockData);
        tgOptions = {
          button: { text: "🧾 Cek Pesanan Masuk", url: "https://xyzpedia.id/admin" },
        };
        emailSubject = `🔔 [UJI COBA] Pesanan Baru Masuk · ${mockData.invoice} — XYZPEDIA`;
        emailHtml = generateNewOrderEmailHtml(mockData);
      } else if (eventType === "notifySuccessOrder") {
        eventTitle = "Pembayaran Berhasil & Lunas (PAID)";
        const mockData = {
          invoice: "XYZ-" + Date.now().toString().slice(-6),
          productName: "Arena Breakout",
          variantName: "Pilihan Pemula (Special Offer)",
          targetUser: "PlayerOne#8821",
          customerPhone: "081298765432",
          totalAmount: 14500,
          profit: 1740,
          paymentMethod: "QRIS Terverifikasi",
          deliveryType: "INSTANT",
        };
        tgText = formatSuccessOrderMessage(mockData);
        tgOptions = {
          button: { text: "⚡ Kelola Transaksi", url: "https://xyzpedia.id/admin" },
        };
        emailSubject = `✅ [UJI COBA] Pembayaran Berhasil & Lunas · ${mockData.invoice} — XYZPEDIA`;
        emailHtml = generateSuccessOrderEmailHtml(mockData);
      } else if (eventType === "notifyFailedOrder") {
        eventTitle = "Transaksi Gagal / Butuh Bantuan";
        const mockData = {
          invoice: "XYZ-" + Date.now().toString().slice(-6),
          productName: "Alight Motion Pro",
          variantName: "1 Tahun Akun Instant",
          totalAmount: 12500,
          reason: "Simulasi: Provider timeout atau stok varian habis",
          customerPhone: "081211223344",
        };
        tgText = formatFailedOrderMessage(mockData);
        tgOptions = {
          button: { text: "🚨 Periksa Kendala", url: "https://xyzpedia.id/admin" },
        };
        emailSubject = `🚨 [UJI COBA] Peringatan: Transaksi Gagal · ${mockData.invoice} — XYZPEDIA`;
        emailHtml = generateFailedOrderEmailHtml(mockData);
      } else if (eventType === "notifyWeeklyReport") {
        eventTitle = "Laporan & Rekap Mingguan";
        const mockData = {
          totalOrders: 18,
          successOrders: 16,
          totalOmset: 245000,
          totalProfit: 52000,
          dateRange: "Senin - Minggu Ini (DATA CONTOH)",
          conversionRate: 88.8,
          topProduct: "Canva Pro — 1 Tahun",
        };
        tgText = formatWeeklyReportMessage(mockData);
        let photoBuffer: Buffer | undefined;
        try {
          photoBuffer = await generateReportCardPng({
            storeName: "XYZPEDIA",
            subStoreName: "Panel Admin",
            totalOmset: mockData.totalOmset,
            totalProfit: mockData.totalProfit,
            totalOrders: mockData.successOrders,
            visits: undefined,
            conversionRate: `${mockData.conversionRate}%`,
            topProduct: mockData.topProduct,
            siteUrl: "xyzpedia.com",
          });
        } catch (e) {
          console.warn("Gagal generate card png:", e);
        }
        tgOptions = {
          button: { text: "📊 Buka laporan lengkap", url: "https://xyzpedia.id/admin" },
          photoBuffer,
        };
        emailSubject = `📊 [UJI COBA] Laporan Mingguan · Rp ${mockData.totalProfit.toLocaleString("id-ID")} — XYZPEDIA`;
        emailHtml = generateWeeklyReportEmailHtml(mockData);
      } else if (eventType === "notifyDailyReport") {
        eventTitle = "Ringkasan Penjualan Harian";
        const mockData = {
          date: new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          totalOrders: 12,
          successOrders: 11,
          totalOmset: 175000,
          totalProfit: 31000,
          topProduct: "Mobile Legends 86 Diamonds",
        };
        tgText = formatDailyReportMessage(mockData);
        tgOptions = {
          button: { text: "📈 Buka Dashboard", url: "https://xyzpedia.id/admin" },
        };
        emailSubject = `🌙 [UJI COBA] Rekap Penjualan Harian · ${mockData.date} — XYZPEDIA`;
        emailHtml = generateDailyReportEmailHtml(mockData);
      }

      // Kirim sesuai kanal yang diminta (telegram, email, atau keduanya)
      if (channel === "telegram") {
        const result = await dispatchTelegram(tgText, tgOptions);
        return NextResponse.json({
          ...result,
          message: result.success
            ? `Notifikasi uji coba "${eventTitle}" berhasil dikirim ke Telegram!`
            : result.message,
        }, { status: result.success ? 200 : 400 });
      }

      if (channel === "email") {
        const result = await dispatchEmail(emailSubject, emailHtml);
        return NextResponse.json({
          ...result,
          message: result.success
            ? `Email uji coba "${eventTitle}" berhasil dikirim!`
            : result.message,
        }, { status: result.success ? 200 : 400 });
      }

      if (channel === "both") {
        let sentCount = 0;
        let lastError = "";

        const tgRes = await dispatchTelegram(tgText, tgOptions);
        if (tgRes.success) sentCount++;
        else lastError = tgRes.message;

        const mailRes = await dispatchEmail(emailSubject, emailHtml);
        if (mailRes.success) sentCount++;
        else if (!lastError) lastError = mailRes.message;

        if (sentCount > 0) {
          return NextResponse.json({
            success: true,
            message: `Notifikasi uji coba "${eventTitle}" berhasil dikirim (${sentCount} kanal berhasil)!`,
          });
        }
        return NextResponse.json({
          success: false,
          message: lastError || "Gagal mengirim notifikasi ke kedua kanal.",
        }, { status: 400 });
      }
    }

    // ========================================================
    // GENERAL TEST TELEGRAM
    // ========================================================
    if (channel === "telegram") {
      const now = new Date();
      const timeStr = now.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const testMsg = `🚀 <b>TEST NOTIFIKASI BOT TELEGRAM — XYZPEDIA</b>
━━━━━━━━━━━━━━━━━━━━━
Halo <b>Super Admin</b>! 👋

Koneksi bot Telegram ke sistem <b>XYZPEDIA</b> berhasil terhubung dengan sempurna!
Bot ini akan mengirimkan notifikasi otomatis saat:
• 🔔 Transaksi baru masuk (menunggu bayar)
• 💰 Pembayaran QRIS berhasil diverifikasi
• 📊 Laporan ringkasan mingguan & omset toko

⏱ <b>Waktu Uji Coba:</b> ${timeStr} WIB
⚡ <b>Status Sistem:</b> LIVE & BEROPERASI
━━━━━━━━━━━━━━━━━━━━━
<i>XYZPEDIA Management System 24/7</i>`;

      const result = await dispatchTelegram(testMsg, {
        button: { text: "🌐 Buka Admin XYZPEDIA", url: "https://xyzpedia.id/admin" },
      });
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }

    // ========================================================
    // GENERAL TEST EMAIL
    // ========================================================
    if (channel === "email") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const recentOrders = await prisma.order.findMany({
        where: { createdAt: { gte: oneWeekAgo } },
        include: { product: true },
      });

      const successOrdersList = recentOrders.filter(
        (o) => o.status === "PAID" || o.status === "SUCCESS"
      );

      const totalOrders = Math.max(recentOrders.length, 2);
      const successOrders = Math.max(successOrdersList.length, 2);
      const totalOmset =
        successOrdersList.length > 0
          ? successOrdersList.reduce((acc, o) => acc + o.totalAmount, 0)
          : 45500;
      const totalProfit =
        successOrdersList.length > 0
          ? Math.round(totalOmset * 0.24)
          : 10950;

      const dateRangeStr = `${oneWeekAgo.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      })} - ${new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })}`;

      const emailHtml = generateWeeklyReportEmailHtml({
        totalOrders,
        successOrders,
        totalOmset,
        totalProfit,
        dateRange: `${dateRangeStr} (DATA CONTOH)`,
        conversionRate: totalOrders > 0 ? Number(((successOrders / totalOrders) * 100).toFixed(1)) : undefined,
        topProduct: successOrdersList[0]?.product?.name || "Canva Pro — 1 Tahun",
        storeName: "XYZPEDIA",
        adminUrl: "/admin",
      });

      const emailSubject = `Laporan mingguan · Rp ${totalProfit.toLocaleString("id-ID")} — XYZPEDIA`;
      const result = await dispatchEmail(emailSubject, emailHtml);
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }

    // ========================================================
    // TEST WEEKLY REPORT
    // ========================================================
    if (channel === "weekly_report") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const recentOrders = await prisma.order.findMany({
        where: { createdAt: { gte: oneWeekAgo } },
        include: { product: true },
      });

      const successOrdersList = recentOrders.filter(
        (o) => o.status === "PAID" || o.status === "SUCCESS"
      );

      const totalOrders = Math.max(recentOrders.length, 2);
      const successOrders = Math.max(successOrdersList.length, 2);
      const totalOmset =
        successOrdersList.length > 0
          ? successOrdersList.reduce((acc, o) => acc + o.totalAmount, 0)
          : 45500;
      const totalProfit =
        successOrdersList.length > 0
          ? Math.round(totalOmset * 0.24)
          : 10950;

      const dateRangeStr = `${oneWeekAgo.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      })} - ${new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })}`;

      const reportTelegramText = formatWeeklyReportMessage({
        totalOrders,
        successOrders,
        totalOmset,
        totalProfit,
        dateRange: dateRangeStr,
      });

      const reportEmailHtml = generateWeeklyReportEmailHtml({
        totalOrders,
        successOrders,
        totalOmset,
        totalProfit,
        dateRange: `${dateRangeStr} (DATA CONTOH)`,
        conversionRate: totalOrders > 0 ? Number(((successOrders / totalOrders) * 100).toFixed(1)) : undefined,
        topProduct: successOrdersList[0]?.product?.name || "Canva Pro — 1 Tahun",
        storeName: "XYZPEDIA",
        adminUrl: "/admin",
      });

      let sentCount = 0;
      let errorMsg = "";

      let photoBuffer: Buffer | undefined;
      try {
        photoBuffer = await generateReportCardPng({
          storeName: "XYZPEDIA",
          subStoreName: "Panel Admin",
          totalOmset,
          totalProfit,
          totalOrders: successOrders,
          visits: 42,
          conversionRate: "4,8%",
          topProduct: successOrdersList[0]?.product?.name || "Canva Pro — 1 Tahun",
          siteUrl: "xyzpedia.com",
        });
      } catch (err) {
        console.warn("Card image error:", err);
      }

      const tgRes = await dispatchTelegram(reportTelegramText, {
        button: { text: "📊 Buka laporan lengkap", url: "https://xyzpedia.id/admin" },
        photoBuffer,
      });
      if (tgRes.success) sentCount++;
      else errorMsg = tgRes.message;

      const emailRes = await dispatchEmail(
        `Laporan mingguan · Rp ${totalProfit.toLocaleString("id-ID")} — XYZPEDIA`,
        reportEmailHtml
      );
      if (emailRes.success) sentCount++;
      else if (!errorMsg) errorMsg = emailRes.message;

      if (sentCount > 0) {
        return NextResponse.json({
          success: true,
          message: `Laporan transaksi mingguan berhasil dikirim ke saluran notifikasi Anda!`,
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            message:
              errorMsg ||
              "Gagal mengirim laporan. Pastikan Bot Token & Chat ID Telegram sudah dikonfigurasi.",
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { success: false, message: "Kanal notifikasi tidak dikenal." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Test notification error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan: " + error.message },
      { status: 500 }
    );
  }
}
