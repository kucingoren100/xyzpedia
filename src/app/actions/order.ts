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

    if (!product) {
      return { success: false, error: "Produk tidak ditemukan." };
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
      item.supplierPrice || 0
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
      status: order.status,
      // Only send QRIS string when order is pending
      qrisString: order.status === "PENDING" ? order.qrisString : null,
      paidAt: order.paidAt,
      createdAt: order.createdAt,
      product: order.product,
      productItem: order.productItem,
      sn: (order as any).sn || null,
      supplierStatus: (order as any).supplierStatus || null,
      notes: order.notes, // Used internally by client fallback if structured sn is not yet populated
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

    if (order.status === "SUCCESS" || order.status === "PAID" || order.status === "PROCESSING") {
      return { success: true, isPaid: true, order };
    }

    // Rate-limit check to QiosPay: limit to once every 5 seconds per invoice if lastPaymentCheckAt exists
    const lastCheck = (order as any).lastPaymentCheckAt
      ? new Date((order as any).lastPaymentCheckAt).getTime()
      : 0;
    if (Date.now() - lastCheck < 5000) {
      return { success: true, isPaid: false, order };
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
        const paidAmount = Number(data?.amount || order.totalAmount);
        const { markOrderPaid } = await import("@/lib/orderStatus");
        const paidRes = await markOrderPaid(invoiceNumber, "QiosPay checkStatus", paidAmount);

        revalidatePath(`/transaksi/${invoiceNumber}`);
        revalidatePath("/cek-transaksi");

        if (paidRes.success && paidRes.order) {
          return { success: true, isPaid: true, order: paidRes.order };
        }
      }
    } catch (checkErr) {
      console.warn("QiosPay checkStatus error:", checkErr);
    }

    return { success: true, isPaid: false, order };
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
      const secret = process.env.ORDER_ACCESS_SECRET || process.env.ADMIN_JWT_SECRET || "default_order_secret";
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
      await sendEmailMessage(
        trimmed,
        "Tautan Akses Riwayat Pesanan XYZPEDIA",
        `<p>Halo,</p><p>Klik tautan di bawah ini untuk melihat daftar pesanan Anda (berlaku 30 menit):</p><p><a href="${magicUrl}">${magicUrl}</a></p>`
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
    const secret = process.env.ORDER_ACCESS_SECRET || process.env.ADMIN_JWT_SECRET || "default_order_secret";
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
