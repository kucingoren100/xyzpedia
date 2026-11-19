"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { QiosPayClient } from "@/lib/qiospay";
import { dispatchNotificationEvent } from "@/lib/notifications";
import { fulfillOrderWithSupplier } from "@/lib/orderFulfillment";
import { IS_PAYMENT_MAINTENANCE } from "@/config/maintenance";

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
    if (IS_PAYMENT_MAINTENANCE) {
      return {
        success: false,
        error: "Sistem pembayaran saat ini sedang dalam pemeliharaan berkala (maintenance). Layanan akan segera dibuka kembali.",
      };
    }
    const product = await prisma.product.findUnique({
      where: { slug: data.productSlug },
      include: { items: true },
    });

    if (!product) {
      return { success: false, error: "Produk tidak ditemukan." };
    }

    const item = product.items.find((i) => i.id === data.itemId);
    if (!item) {
      return { success: false, error: "Varian item tidak ditemukan." };
    }

    if (item.stockStatus === "OUT_OF_STOCK") {
      return {
        success: false,
        error: `Varian item "${item.name}" sedang belum tersedia dari provider resmi. Silakan coba beberapa saat lagi.`,
      };
    }

    // Validation
    if (!data.targetUserId.trim()) {
      return { success: false, error: `${product.targetInputLabel} wajib diisi.` };
    }

    if (product.requiresServer && !data.targetZoneId?.trim()) {
      return { success: false, error: "Server / Zone ID wajib diisi." };
    }

    const finalCustomerEmail =
      data.customerEmail?.trim() ||
      (data.targetUserId?.includes("@") ? data.targetUserId.trim() : "");

    if (!finalCustomerEmail || !finalCustomerEmail.includes("@")) {
      return { success: false, error: "Alamat email valid wajib diisi untuk bukti pesanan." };
    }

    // Generate Invoice Number: INV-XYZ-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `INV-XYZ-${dateStr}-${randomSuffix}`;

    // Calculate Promo Discount
    let discountAmount = 0;
    const cleanPromo = data.promoCode?.trim().toUpperCase();
    if (cleanPromo === "XYZPEDIA") {
      discountAmount = Math.min(1500, Math.floor(item.price * 0.3));
    } else if (cleanPromo === "HEMAT5") {
      discountAmount = Math.min(5000, Math.round(item.price * 0.05));
    } else if (cleanPromo === "NEWUSER" && item.price >= 10000) {
      discountAmount = 2000;
    }

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
        customerName: data.targetUserId.trim(),
        customerEmail: finalCustomerEmail,
        customerPhone: data.customerPhone?.trim(),
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

    // 2. Fallback to EMVCo dynamic QRIS simulation if offline / test mode
    if (!qrisString) {
      uniqueCode = Math.floor(100 + Math.random() * 900);
      totalAmount = discountedPrice + uniqueCode;
      qrisString = `00020101021226610016ID.CO.QIOSPAY0118936009180000000000520458125303360540${totalAmount}5802ID5912XYZPEDIA6007JAKARTA62070703A016304${invoiceNumber.slice(-4)}`;
    }

    const orderNotes = cleanPromo && discountAmount > 0
      ? `Kupon Promo: ${cleanPromo} (-Rp ${discountAmount.toLocaleString("id-ID")})`
      : null;

    const order = await prisma.order.create({
      data: {
        invoiceNumber,
        targetUserId: data.targetUserId.trim(),
        targetZoneId: data.targetZoneId?.trim() || null,
        customerEmail: finalCustomerEmail,
        customerPhone: data.customerPhone?.trim() || null,
        productId: product.id,
        productItemId: item.id,
        basePrice: item.price,
        uniqueCode,
        fee: -discountAmount,
        totalAmount,
        status: "PENDING",
        qrisString,
        paymentMethod: "QRIS",
        notes: orderNotes,
      },
    });

    // Dispatch async notification for new pending order
    (async () => {
      try {
        await dispatchNotificationEvent("notifyNewOrder", {
          invoice: order.invoiceNumber,
          productName: product.name,
          variantName: item.name,
          targetUser: data.targetUserId + (data.targetZoneId ? ` (${data.targetZoneId})` : ""),
          totalAmount: order.totalAmount,
          paymentMethod: order.paymentMethod,
          customerPhone: data.customerPhone || undefined,
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
        product: true,
        productItem: true,
      },
    });

    return order;
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

    if (order.status === "SUCCESS" || order.status === "PAID") {
      return { success: true, isPaid: true, order };
    }

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
        const hasExistingSn = order.notes?.includes("SN:");
        const updated = await prisma.order.update({
          where: { invoiceNumber },
          data: {
            status: "SUCCESS",
            paidAt: order.paidAt || new Date(),
            fulfilledAt: order.fulfilledAt || new Date(),
            ...(hasExistingSn ? {} : { notes: `Pembayaran terverifikasi via QiosPay API Status: ${status}` }),
          },
          include: {
            product: true,
            productItem: true,
          },
        });

          revalidatePath(`/transaksi/${invoiceNumber}`);
          revalidatePath("/cek-transaksi");

          // Automatically trigger supplier injection
          let fulfillResult: any = null;
          try {
            fulfillResult = await fulfillOrderWithSupplier(updated);
          } catch (fulfillErr) {
            console.error("[checkPaymentStatus] Auto-fulfillment error:", fulfillErr);
          }

          // Dispatch notification
          try {
            const profit = Math.max(
              0,
              updated.totalAmount - (updated.productItem.supplierPrice || updated.productItem.price * 0.8)
            );
            await dispatchNotificationEvent("notifySuccessOrder", {
              invoice: updated.invoiceNumber,
              productName: updated.product.name,
              variantName: updated.productItem.name,
              targetUser: updated.targetUserId + (updated.targetZoneId ? ` (${updated.targetZoneId})` : ""),
              totalAmount: updated.totalAmount,
              profit: Math.round(profit),
              paymentMethod: updated.paymentMethod || "QRIS Real-time",
              deliveryType: (updated.product as any).deliveryType || (updated.product.categorySlug === "akun-premium" ? "MANUAL" : "INSTANT"),
              customerPhone: updated.customerPhone || undefined,
              customerEmail: updated.customerEmail || undefined,
              sn: fulfillResult?.sn || "Sedang diverifikasi oleh publisher",
              supplierRef: fulfillResult?.supplierRef,
            });
          } catch (notifErr) {
            console.error("Gagal dispatch notifikasi checkStatus:", notifErr);
          }

          return { success: true, isPaid: true, order: updated };
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

export async function simulatePaymentSuccess(invoiceNumber: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { invoiceNumber },
    });

    if (!order) {
      return { success: false, error: "Pesanan tidak ditemukan." };
    }

    if (order.status === "SUCCESS") {
      return { success: true, message: "Pesanan sudah berstatus SUKSES." };
    }

    const updated = await prisma.order.update({
      where: { invoiceNumber },
      data: {
        status: "SUCCESS",
        paidAt: new Date(),
        fulfilledAt: new Date(),
        notes: "Pembayaran terverifikasi via QRIS Dinamis. Item berhasil diinjeksi.",
      },
      include: {
        product: true,
        productItem: true,
      },
    });

    revalidatePath(`/transaksi/${invoiceNumber}`);
    revalidatePath("/cek-transaksi");

    // Dispatch async notification for payment success
    (async () => {
      try {
        const profit = Math.max(
          0,
          updated.totalAmount - (updated.productItem.supplierPrice || updated.productItem.price * 0.8)
        );
        await dispatchNotificationEvent("notifySuccessOrder", {
          invoice: updated.invoiceNumber,
          productName: updated.product.name,
          variantName: updated.productItem.name,
          targetUser: updated.targetUserId + (updated.targetZoneId ? ` (${updated.targetZoneId})` : ""),
          totalAmount: updated.totalAmount,
          profit: Math.round(profit),
          paymentMethod: updated.paymentMethod || "QRIS Real-time",
          deliveryType: (updated.product as any).deliveryType || (updated.product.categorySlug === "akun-premium" ? "MANUAL" : "INSTANT"),
          customerPhone: updated.customerPhone || undefined,
        });
      } catch (err) {
        console.error("Gagal dispatch notif success payment simulation:", err);
      }
    })();

    return { success: true, order: updated };
  } catch (error) {
    console.error("Simulate payment error:", error);
    return { success: false, error: "Gagal memproses simulasi pembayaran." };
  }
}

export async function searchOrders(query: string) {
  try {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { invoiceNumber: { contains: trimmed } },
          { customerEmail: { contains: trimmed } },
          { targetUserId: { contains: trimmed } },
        ],
      },
      include: {
        product: true,
        productItem: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return orders;
  } catch (error) {
    console.error("Search orders error:", error);
    return [];
  }
}
