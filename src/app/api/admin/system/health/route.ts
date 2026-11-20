import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/siteUrl";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // 1. Check Database (Neon PostgreSQL)
    let dbStatus = "ONLINE";
    let dbLatency = 0;
    let dbError = null;
    let stats = {
      totalProducts: 0,
      totalOrders: 0,
      totalItems: 0,
      totalAdmins: 0,
    };

    try {
      const t0 = performance.now();
      await prisma.$queryRaw`SELECT 1`;
      dbLatency = Math.round(performance.now() - t0);

      const [pCount, oCount, iCount, aCount] = await Promise.all([
        prisma.product.count(),
        prisma.order.count(),
        prisma.productItem.count(),
        prisma.admin.count(),
      ]);

      stats = {
        totalProducts: pCount,
        totalOrders: oCount,
        totalItems: iCount,
        totalAdmins: aCount,
      };
    } catch (err: any) {
      dbStatus = "ERROR";
      dbError = err.message;
    }

    // 2. Check QiosPay Gateway
    const qiospayKey = process.env.QIOSPAY_API_KEY || "";
    const qiospayMerchant = process.env.QIOSPAY_MERCHANT_CODE || "";
    const qiospayUrl = (
      process.env.QIOSPAY_BASE_URL ||
      "https://my.qiospay.com/v1"
    ).replace(/\/$/, "");

    let qiospayLatency = 0;
    let qiospayStatus = qiospayKey ? "CONFIGURED" : "MISSING_KEY";
    if (qiospayKey) {
      try {
        const t0 = performance.now();
        const res = await fetch(`${qiospayUrl}/invoices`, {
          method: "GET",
          headers: {
            "x-api-key": qiospayKey,
            Authorization: `Bearer ${qiospayKey}`,
          },
          signal: AbortSignal.timeout(4000),
        });
        qiospayLatency = Math.round(performance.now() - t0);
        qiospayStatus = res.status < 500 ? "ONLINE" : "ERROR";
      } catch {
        qiospayStatus = "TIMEOUT";
      }
    }

    // 3. Check Digiflazz Provider H2H & VPS Proxy
    const digiUser = process.env.DIGIFLAZZ_USERNAME || "";
    const digiKey =
      process.env.DIGIFLAZZ_KEY ||
      process.env.DIGIFLAZZ_PRODUCTION_KEY ||
      process.env.DIGIFLAZZ_API_KEY ||
      "";
    const vpsProxy = process.env.VPS_PROXY_URL || "";
    let digiLatency = 0;
    let digiStatus = digiUser && digiKey ? "CONFIGURED" : "CREDENTIALS_MISSING";

    if (digiUser && digiKey && vpsProxy) {
      try {
        const t0 = performance.now();
        const res = await fetch(`${vpsProxy}/ping`, {
          signal: AbortSignal.timeout(3000),
        });
        digiLatency = Math.round(performance.now() - t0);
        digiStatus = res.ok ? "ONLINE" : "PROXY_STANDBY";
      } catch {
        digiStatus = "STANDBY";
      }
    }

    // 4. Check Telegram Bot
    const tgToken = process.env.TELEGRAM_BOT_TOKEN || "";
    const tgChatId = process.env.TELEGRAM_CHAT_ID || "";
    const tgStatus = tgToken && tgChatId ? "CONFIGURED" : "NOT_CONFIGURED";

    // 5. Environment Integrity Checklist
    const hasDigiKey = !!digiKey;
    const digiKeyName = process.env.DIGIFLAZZ_KEY
      ? "DIGIFLAZZ_KEY"
      : process.env.DIGIFLAZZ_PRODUCTION_KEY
      ? "DIGIFLAZZ_PRODUCTION_KEY"
      : "DIGIFLAZZ_KEY";

    const envAudit = [
      { key: "DATABASE_URL", isSet: !!process.env.DATABASE_URL, label: "Neon PostgreSQL Connection" },
      { key: "QIOSPAY_API_KEY", isSet: !!qiospayKey, label: "QiosPay API Key (Live)" },
      { key: "QIOSPAY_PRIVATE_KEY", isSet: !!process.env.QIOSPAY_PRIVATE_KEY, label: "QiosPay Webhook Secret" },
      { key: "QIOSPAY_MERCHANT_CODE", isSet: !!qiospayMerchant, label: "QiosPay Merchant ID" },
      { key: "DIGIFLAZZ_USERNAME", isSet: !!digiUser, label: "Digiflazz Supplier ID" },
      { key: digiKeyName, isSet: hasDigiKey, label: "Digiflazz API Key / Production Secret" },
      { key: "VPS_PROXY_URL", isSet: !!vpsProxy, label: "VPS Static IP Bridge Proxy" },
      { key: "ADMIN_JWT_SECRET", isSet: !!process.env.ADMIN_JWT_SECRET, label: "HMAC Session Encryption" },
    ];

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        engine: "PostgreSQL (terukur via ping prisma)",
        region: "Tidak diverifikasi secara langsung",
        latency: dbLatency,
        stats,
        error: dbError,
      },
      gateways: {
        qiospay: {
          status: qiospayStatus,
          merchantCode: qiospayMerchant ? `${qiospayMerchant.slice(0, 4)}***` : "Belum diatur",
          baseUrl: qiospayUrl,
          latency: qiospayLatency,
        },
        digiflazz: {
          status: digiStatus,
          username: digiUser ? `${digiUser.slice(0, 3)}***` : "Belum diisi",
          vpsProxyIp: vpsProxy ? "Terkonfigurasi (Static IP Bridge)" : "Belum diatur (Direct)",
          latency: digiLatency,
        },
        telegram: {
          status: tgStatus,
          chatId: tgChatId ? `${tgChatId.slice(0, 4)}***` : "Belum diisi",
        },
      },
      security: {
        ssl: "Tidak diverifikasi oleh endpoint lokal",
        cnameFlattening: "Tidak diverifikasi",
        cookieAuth: "HMAC SHA-256 (HTTP-Only, Secure, SameSite=Lax)",
        runtime: process.version,
        domain: siteUrl(),
      },
      envAudit,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
