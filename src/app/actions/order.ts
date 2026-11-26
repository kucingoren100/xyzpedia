"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { QiosPayClient } from "@/lib/qiospay";
import { dispatchNotificationEvent } from "@/lib/notifications";
import { fulfillOrderWithSupplier } from "@/lib/orderFulfillment";
import { getWebCondition, checkIsCategoryUnderMaintenance } from "@/lib/webCondition";
import { checkRateLimit, getClientIpFromHeaders } from "@/lib/rateLimit";
import { z } from "zod";

const createOrderSchema = z.object({
  productSlug: z.string().trim().min(1, "Produk wajib dipilih.").max(100),
  itemId: z.string().trim().min(1, "Varian item wajib dipilih.").max(100),
  targetUserId: z
    .string()
    .trim()
    .min(1, "User ID / Kontak Akun wajib diisi.")
    .max(100, "User ID terlalu panjang (maks 100 karakter)."),
  targetZoneId: z
    .string()
    .trim()
    .max(50, "Zone/Server ID terlalu panjang.")
    .optional(),
  customerEmail: z
    .string()
    .trim()
    .email("Format email tidak valid (contoh: akun@gmail.com).")
    .max(120, "Alamat email terlalu panjang."),
  customerPhone: z
    .string()
    .trim()
    .max(25, "Nomor WhatsApp terlalu panjang.")
    .regex(/^(?:\+?62|08)[0-9]{8,14}$/, "Format nomor WhatsApp tidak valid (contoh: 081234567890).")
    .optional()
    .or(z.literal("")),
  promoCode: z
    .string()
    .trim()
    .max(30, "Kode kupon terlalu panjang.")
    .regex(/^[A-Za-z0-9_-]*$/, "Format kode kupon hanya boleh huruf, angka, dash, underscore.")
    .optional()
    .or(z.literal("")),
});

export interface CreateOrderInput {
  productSlug: string;
  itemId: string;
  targetUserId: string;
  targetZoneId?: string;
  customerEmail: string;
  customerPhone?: string;
  promoCode?: string;
}

export async function createOrder(data: CreateOrderInput) {
  try {
    // Rate limit check: max 15 orders/minute per IP
    const reqHeaders = await headers();
    const clientIp = getClientIpFromHeaders(reqHeaders);
    const rl = checkRateLimit(`order-create:${clientIp}`, {
      intervalMs: 60_000,
      max: 15,
    });
    if (!rl.success) {
      return {
        success: false,
        error: "Terlalu banyak permintaan pembuatan pesanan. Silakan tunggu 1 menit.",
      };
    }

    // Input validation via Zod
    const parsed = createOrderSchema.safeParse(data);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message || "Data formulir pesanan tidak valid.";
      return { success: false, error: firstIssue };
    }
    const validData = parsed.data;
    const product = await prisma.product.findUnique({
      where: { slug: validData.productSlug },
      include: { items: true },
    });

    if (!product || !product.isActive) {
      return { success: false, error: "Produk sedang tidak aktif atau tidak ditemukan." };
    }

    const condition = await getWebCondition();
    if (checkIsCategoryUnderMaintenance(condition, product.categorySlug)) {
      return {
        success: false,
        error: `${condition.title}. ${condition.description}`,
      };
    }

    const item = product.items.find((i) => i.id === validData.itemId);
    if (!item) {
      return { success: false, error: "Varian item tidak ditemukan." };
    }

    if (item.stockStatus === "OUT_OF_STOCK") {
      return {
        success: false,
        error: `Varian item "${item.name}" sedang belum tersedia dari provider resmi. Silakan coba beberapa saat lagi.`,
      };
    }

    // Provider balance check for Digiflazz and Xaviera items
    const supplier = (item as any).supplier || (product.categorySlug === "game-topup" ? "DIGIFLAZZ" : "MANUAL");
    const isXaviera =
      supplier === "XAVIERA" ||
      item.sku.startsWith("XAV-") ||
      (product.categorySlug === "akun-premium" && product.developer?.toLowerCase() !== "manual");
    const isDigiflazz = !isXaviera && (supplier === "DIGIFLAZZ" || !supplier);

    if (isDigiflazz) {
      const { getDigiflazzBalanceCached } = await import("@/lib/digiflazz");
      const currentBalance = await getDigiflazzBalanceCached();
      const requiredCost = item.supplierPrice || Math.round(item.price * 0.8);
      if (currentBalance !== null && requiredCost > currentBalance) {
        return {
          success: false,
          error: `Varian item "${item.name}" saat ini belum tersedia. Silakan pilih varian lain atau hubungi admin.`,
        };
      }
    }

    if (isXaviera) {
      const { getXavieraBalanceCached } = await import("@/lib/xaviera");
      const currentBalance = await getXavieraBalanceCached();
      const requiredCost = item.supplierPrice || Math.round(item.price * 0.8);
      if (currentBalance !== null && requiredCost > currentBalance) {
        return {
          success: false,
          error: `Varian item "${item.name}" saat ini belum tersedia. Silakan pilih varian lain atau hubungi admin.`,
        };
      }
    }

    if (product.requiresServer && !validData.targetZoneId?.trim()) {
      return { success: false, error: "Server / Zone ID wajib diisi untuk game ini." };
    }

    const finalCustomerEmail = validData.customerEmail;

    if (!finalCustomerEmail || !finalCustomerEmail.includes("@")) {
      return { success: false, error: "Alamat email valid wajib diisi untuk bukti pesanan." };
    }

    // Generate Invoice Number: INV-XYZ-YYYYMMDD-XXXXXXXXXX (10 hex chars = 16^10 combinations)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const { randomBytes } = await import("crypto");
    const randomSuffix = randomBytes(5).toString("hex").toUpperCase();
    const invoiceNumber = `INV-XYZ-${dateStr}-${randomSuffix}`;

    // Calculate Promo Discount via validateCoupon
    const { validateCoupon } = await import("@/lib/couponHelper");
    const couponRes = await validateCoupon(
      validData.promoCode,
      item.price,
      item.supplierPrice || 0,
      product.slug,
      item.sku
    );
    const discountAmount = couponRes.discountAmount || 0;
    const couponCode = couponRes.valid ? couponRes.code : null;

    const discountedPrice = Math.max(100, item.price - discountAmount);
    let totalAmount = discountedPrice;
    let uniqueCode = 0;
    let qrisString = "";

    // 1. Try Live QiosPay Gateway
    try {
      const qp = new QiosPayClient();
      const qpRes = await qp.createInvoice({
        orderId: invoiceNumber,
        amount: discountedPrice,
        description: `Pembayaran ${item.name} (${product.name}) - ${invoiceNumber}`,
        customerName: validData.targetUserId.trim(),
        customerEmail: finalCustomerEmail,
        customerPhone: validData.customerPhone?.trim(),
        expiredMinutes: 15,
      });

      if (qpRes.success && qpRes.qrisContent) {
        qrisString = qpRes.qrisContent;
        totalAmount = qpRes.totalAmount || discountedPrice;
        uniqueCode = qpRes.uniqueCode || Math.max(0, totalAmount - discountedPrice);
      } else {
        console.warn("[createOrder] QiosPay response error:", qpRes.error);
      }
    } catch (qpErr) {
      console.warn("[createOrder] QiosPay live invoice exception:", qpErr);
    }

    // 2. If QiosPay unavailable, return error — do NOT create fake QRIS
    if (!qrisString) {
      return {
        success: false,
        error: "Layanan pembayaran QRIS sedang mengalami gangguan sementara. Silakan coba beberapa saat lagi.",
      };
    }

    const order = await prisma.order.create({
      data: {
        invoiceNumber,
        targetUserId: validData.targetUserId.trim(),
        targetZoneId: validData.targetZoneId?.trim() || null,
        customerEmail: finalCustomerEmail,
        customerPhone: validData.customerPhone?.trim() || null,
        productId: product.id,
        productItemId: item.id,
        basePrice: item.price,
        uniqueCode,
        fee: -discountAmount,
        totalAmount,
        status: "PENDING",
        qrisString,
        paymentMethod: "QRIS",
        notes: null, // No longer store coupon text in notes
        couponCode: couponCode,
        discountAmount: discountAmount,
      } as any,
    });

    // Dispatch async notification for new pending order
    (async () => {
      try {
        await dispatchNotificationEvent("notifyNewOrder", {
          invoice: order.invoiceNumber,
          productName: product.name,
          variantName: item.name,
          targetUser: validData.targetUserId + (validData.targetZoneId ? ` (${validData.targetZoneId})` : ""),
          totalAmount: order.totalAmount,
          paymentMethod: order.paymentMethod,
          customerPhone: validData.customerPhone || undefined,
          customerEmail: finalCustomerEmail,
        });
      } catch (err) {
        console.error("Gagal dispatch notif new order:", err);
      }
    })();

    return {
      success: true,
      invoiceNumber: order.invoiceNumber,
    };
  } catch (error) {
    console.error("Create order error:", error);
    return { success: false, error: "Terjadi kesalahan sistem saat membuat pesanan." };
  }
}

export async function getOrderDetails(invoiceNumber: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { invoiceNumber },
      include: {
        product: {
          select: {
            name: true,
            slug: true,
            categorySlug: true,
            developer: true,
            thumbnailUrl: true,
          },
        },
        productItem: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!order) return null;

    // Auto-reconcile if order is currently PROCESSING (waiting supplier completion)
    if (order.status === "PROCESSING") {
      try {
        const { reconcileSupplierOrder } = await import("@/lib/orderFulfillment");
        const reconciled = await reconcileSupplierOrder(order.invoiceNumber);
        if (reconciled) {
          order.status = reconciled.status;
          (order as any).sn = reconciled.sn;
          (order as any).supplierStatus = reconciled.supplierStatus;
        }
      } catch (recErr) {
        console.warn("[getOrderDetails] Reconcile error:", recErr);
      }
    }

    // Mask sensitive fields and remove raw notes or unused qris string
    return {
      id: order.id,
      invoiceNumber: order.invoiceNumber,
      targetUserId: order.targetUserId,
      targetZoneId: order.targetZoneId,
      customerEmail: maskEmail(order.customerEmail),
      customerPhone: order.customerPhone ? maskPhone(order.customerPhone) : null,
      basePrice: order.basePrice,
      uniqueCode: order.uniqueCode,
      fee: order.fee,
      totalAmount: order.totalAmount,
      couponCode: order.couponCode || null,
      discountAmount: order.discountAmount || 0,
      status: order.status,
      // Only send QRIS string when order is pending
      qrisString: order.status === "PENDING" ? order.qrisString : null,
      paidAt: order.paidAt,
      createdAt: order.createdAt,
      product: order.product,
      productItem: order.productItem,
      sn: (order as any).sn || null,
      supplierStatus: (order as any).supplierStatus || null,
      notes: null as string | null, // Sanitized: internal notes stripped from public client
    };
  } catch (error) {
    console.error("Get order details error:", error);
    return null;
  }
}

export async function checkPaymentStatus(invoiceNumber: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { invoiceNumber },
      include: {
        product: true,
        productItem: true,
      },
    });

    if (!order) {
      return { success: false, error: "Pesanan tidak ditemukan." };
    }

    const safeOrder = {
      id: order.id,
      invoiceNumber: order.invoiceNumber,
      status: order.status,
      paidAt: order.paidAt,
      sn: order.sn,
      supplierStatus: order.supplierStatus,
      totalAmount: order.totalAmount,
    };

    if (order.status === "SUCCESS") {
      return { success: true, isPaid: true, order: safeOrder };
    }

    if (order.status === "PROCESSING" || order.status === "PAID") {
      // Reconcile status with supplier if still processing
      try {
        const { reconcileSupplierOrder } = await import("@/lib/orderFulfillment");
        const reconciled = await reconcileSupplierOrder(order.invoiceNumber);
        if (reconciled) {
          return {
            success: true,
            isPaid: true,
            order: {
              ...safeOrder,
              status: reconciled.status,
              sn: reconciled.sn,
              supplierStatus: reconciled.supplierStatus,
            },
          };
        }
      } catch (recErr) {
        console.warn("[checkPaymentStatus] Reconcile error:", recErr);
      }
      return { success: true, isPaid: true, order: safeOrder };
    }

    // Rate-limit check to QiosPay: limit to once every 5 seconds per invoice if lastPaymentCheckAt exists
    const lastCheck = (order as any).lastPaymentCheckAt
      ? new Date((order as any).lastPaymentCheckAt).getTime()
      : 0;
    if (Date.now() - lastCheck < 5000) {
      return { success: true, isPaid: false, order: safeOrder };
    }

    // Update last payment check timestamp
    await prisma.order.update({
      where: { invoiceNumber },
      data: {
        lastPaymentCheckAt: new Date(),
      } as any,
    }).catch(() => {});

    // Check with QiosPay API
    try {
      const qp = new QiosPayClient();
      const qpStatus = await qp.checkStatus(invoiceNumber);
      const data = qpStatus?.raw || qpStatus;
      const status = String(data?.status || qpStatus?.status || "").toUpperCase();

      const isPaid =
        status === "PAID" ||
        status === "SETTLED" ||
        status === "SUCCESS" ||
        status === "COMPLETED";

      if (isPaid) {
        // Enforce markOrderPaid atomic flow (never transition directly to SUCCESS from here)
        const paidAmount = Number(
          data?.total_amount ||
          data?.totalAmount ||
          data?.paid_amount ||
          data?.amount ||
          order.totalAmount
        );
        const { markOrderPaid } = await import("@/lib/orderStatus");
        const paidRes = await markOrderPaid(invoiceNumber, "QiosPay checkStatus", paidAmount);

        revalidatePath(`/transaksi/${invoiceNumber}`);
        revalidatePath("/cek-transaksi");

        if (paidRes.success && paidRes.order) {
          return {
            success: true,
            isPaid: true,
            order: {
              ...safeOrder,
              status: paidRes.order.status,
              paidAt: paidRes.order.paidAt,
              sn: paidRes.order.sn,
              supplierStatus: paidRes.order.supplierStatus,
            },
          };
        }
      }
    } catch (checkErr) {
      console.warn("QiosPay checkStatus error:", checkErr);
    }

    return { success: true, isPaid: false, order: safeOrder };
  } catch (error: any) {
    console.error("Check payment status error:", error);
    return { success: false, error: "Gagal mengecek status pembayaran." };
  }
}

function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return "***";
  const [user, domain] = email.split("@");
  if (user.length <= 2) return `${user[0]}***@${domain}`;
  return `${user.slice(0, 2)}***${user.slice(-1)}@${domain}`;
}

function maskPhone(phone: string): string {
  if (!phone || phone.length < 6) return "***";
  return `${phone.slice(0, 3)}****${phone.slice(-3)}`;
}

export async function requestOrderLookup(email: string) {
  try {
    const trimmed = email.trim().toLowerCase();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);

    // Rate limiting: 5 requests per 10 minutes per IP
    const reqHeaders = await headers();
    const clientIp = getClientIpFromHeaders(reqHeaders);
    const rl = checkRateLimit(`magic-lookup:${clientIp}`, {
      intervalMs: 10 * 60_000,
      max: 5,
    });
    if (!rl.success) {
      return {
        success: true,
        message: "Jika email Anda terdaftar dalam pesanan, tautan akses telah dikirimkan ke kotak masuk Anda.",
      };
    }

    if (!isEmail) {
      return {
        success: true,
        message: "Jika email Anda terdaftar dalam pesanan, tautan akses telah dikirimkan ke kotak masuk Anda.",
      };
    }

    // Check if any order exists
    const orderCount = await prisma.order.count({
      where: { customerEmail: { equals: trimmed, mode: "insensitive" } },
    });

    if (orderCount > 0) {
      const secret = process.env.ORDER_ACCESS_SECRET || process.env.ADMIN_JWT_SECRET || process.env.ADMIN_SECRET;
      if (!secret) {
        console.error("[requestOrderLookup] Missing ORDER_ACCESS_SECRET or ADMIN_JWT_SECRET");
        return {
          success: false,
          message: "Layanan magic link sedang tidak tersedia sementara waktu.",
        };
      }
      const crypto = await import("crypto");
      const payload = JSON.stringify({
        email: trimmed,
        exp: Date.now() + 30 * 60 * 1000, // 30 min
        nonce: crypto.randomBytes(8).toString("hex"),
      });
      const encoded = Buffer.from(payload).toString("base64url");
      const sig = crypto.createHmac("sha256", secret).update(encoded).digest("base64url");
      const token = `${encoded}.${sig}`;

      // In production/dev, we can trigger an email or provide direct lookup url
      const { sendEmailMessage, getPublicAppUrl } = await import("@/lib/notifications");
      const magicUrl = `${getPublicAppUrl()}/cek-transaksi/akses?token=${token}`;
      const emailHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Tautan Akses Riwayat Pesanan XYZPEDIA</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #0b0b10; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
  <div style="max-width: 540px; margin: 0 auto; background: #12121a; border-radius: 20px; overflow: hidden; border: 2px solid #2d2d3d; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
    <div style="background-color: #ffd731; padding: 22px 24px; text-align: center; border-bottom: 2px solid #000000;">
      <div style="font-size: 13px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; color: #000000; margin-bottom: 4px;">
        XYZPEDIA STORE
      </div>
      <div style="font-size: 20px; font-weight: 900; color: #000000;">
        🔐 Akses Riwayat Pesanan Anda
      </div>
    </div>
    <div style="padding: 26px 24px;">
      <p style="font-size: 14px; line-height: 1.6; color: #cbd5e1; margin-top: 0;">
        Halo, kami menerima permintaan untuk melihat seluruh riwayat transaksi pesanan yang terdaftar dengan email <strong style="color: #ffffff;">${trimmed}</strong>.
      </p>
      <div style="text-align: center; margin: 26px 0;">
        <a href="${magicUrl}" style="display: inline-block; background-color: #ffd731; color: #000000; font-size: 14px; font-weight: 900; text-transform: uppercase; text-decoration: none; padding: 14px 28px; border-radius: 12px; border: 2px solid #000000; box-shadow: 3px 3px 0 #ffffff;">
          Lihat Riwayat Transaksi Saya →
        </a>
      </div>
      <p style="font-size: 12px; color: #94a3b8; line-height: 1.6; margin-bottom: 8px;">
        Atau salin tautan berikut ke browser Anda jika tombol di atas tidak dapat diklik:
      </p>
      <div style="background: #1a1a26; padding: 10px 14px; border-radius: 10px; border: 1px solid #334155; word-break: break-all; font-family: monospace; font-size: 11px; color: #38bdf8; margin-bottom: 20px;">
        ${magicUrl}
      </div>
      <div style="border-top: 1px solid #2d2d3d; padding-top: 14px; text-align: center; font-size: 11px; color: #64748b; line-height: 1.5;">
        ⏱️ Tautan akses aman ini hanya berlaku selama <strong>30 menit</strong>.<br>
        Jika Anda tidak merasa meminta tautan ini, Anda dapat mengabaikan email ini dengan aman.
      </div>
    </div>
  </div>
</body>
</html>`;
      await sendEmailMessage(
        trimmed,
        "Tautan Akses Riwayat Pesanan XYZPEDIA",
        emailHtml
      ).catch(() => {});
    }

    return {
      success: true,
      message: "Jika email Anda terdaftar dalam pesanan, tautan akses telah dikirimkan ke kotak masuk Anda.",
    };
  } catch {
    return {
      success: true,
      message: "Jika email Anda terdaftar dalam pesanan, tautan akses telah dikirimkan ke kotak masuk Anda.",
    };
  }
}

export async function searchOrders(query: string) {
  try {
    const trimmed = query.trim();
    if (!trimmed) return [];

    // Rate limiting: max 20 searches per minute per IP
    const reqHeaders = await headers();
    const clientIp = getClientIpFromHeaders(reqHeaders);
    const rl = checkRateLimit(`search-orders:${clientIp}`, {
      intervalMs: 60_000,
      max: 20,
    });
    if (!rl.success) {
      console.warn(`[searchOrders] Rate limit exceeded from IP ${clientIp}`);
      return [];
    }

    const isInvoice = /^INV-XYZ-[a-zA-Z0-9-]+$/i.test(trimmed);

    // Only allow direct search with full invoice number (prevent email enumeration)
    if (!isInvoice) {
      return [];
    }

    const orders = await prisma.order.findMany({
      where: { invoiceNumber: { equals: trimmed, mode: "insensitive" } },
      include: {
        product: {
          select: {
            name: true,
            thumbnailUrl: true,
          },
        },
        productItem: {
          select: {
            name: true,
          },
        },
      },
      take: 1,
    });

    // Mask sensitive PII before sending to client
    return orders.map((o) => ({
      id: o.id,
      invoiceNumber: o.invoiceNumber,
      status: o.status,
      totalAmount: o.totalAmount,
      createdAt: o.createdAt,
      customerEmail: maskEmail(o.customerEmail),
      customerPhone: o.customerPhone ? maskPhone(o.customerPhone) : null,
      product: o.product,
      productItem: o.productItem,
    }));
  } catch (error) {
    console.error("Search orders error:", error);
    return [];
  }
}

export async function verifyOrderAccessToken(token: string): Promise<{ valid: boolean; email?: string }> {
  try {
    if (!token || !token.includes(".")) return { valid: false };
    const [encoded, sig] = token.split(".");
    const secret = process.env.ORDER_ACCESS_SECRET || process.env.ADMIN_JWT_SECRET || process.env.ADMIN_SECRET;
    if (!secret) return { valid: false };
    const crypto = await import("crypto");
    const expectedSig = crypto.createHmac("sha256", secret).update(encoded).digest("base64url");

    const bufA = Buffer.from(sig);
    const bufB = Buffer.from(expectedSig);
    if (bufA.length !== bufB.length || !crypto.timingSafeEqual(bufA, bufB)) {
      return { valid: false };
    }

    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    if (Date.now() > payload.exp) {
      return { valid: false };
    }

    return { valid: true, email: payload.email };
  } catch {
    return { valid: false };
  }
}

export async function getOrdersByAccessToken(token: string) {
  const verified = await verifyOrderAccessToken(token);
  if (!verified.valid || !verified.email) {
    return { success: false, error: "Tautan akses tidak valid atau telah kedaluwarsa (berlaku 30 menit)." };
  }

  try {
    const orders = await prisma.order.findMany({
      where: { customerEmail: { equals: verified.email, mode: "insensitive" } },
      include: {
        product: { select: { name: true, thumbnailUrl: true } },
        productItem: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const safeOrders = orders.map((o) => ({
      id: o.id,
      invoiceNumber: o.invoiceNumber,
      status: o.status,
      totalAmount: o.totalAmount,
      createdAt: o.createdAt,
      customerEmail: maskEmail(o.customerEmail),
      customerPhone: o.customerPhone ? maskPhone(o.customerPhone) : null,
      product: o.product,
      productItem: o.productItem,
    }));

    return { success: true, email: maskEmail(verified.email), orders: safeOrders };
  } catch (error: any) {
    return { success: false, error: "Gagal memuat riwayat pesanan." };
  }
}
