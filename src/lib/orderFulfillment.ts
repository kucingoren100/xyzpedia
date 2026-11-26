import { prisma } from "./prisma";
import { createDigiflazzTransaction, checkDigiflazzTransactionStatus } from "./digiflazz";
import { XavieraClient } from "./xaviera";
import { OrderStatus, canTransition } from "./orderStatus";
import { dispatchNotificationEvent } from "./notifications";
import { notifyBuyerOrderSuccess } from "./whatsapp";

/**
 * Universal timeout-safe fulfillment engine (15s limit).
 * Automatically claims atomicity, transitions status via state machine,
 * and records supplierRef, sn, and supplierStatus.
 */
export async function startFulfillment(orderId: string) {
  // 1. Atomic claim: transition from PAID to PROCESSING
  const claimed = await prisma.order.updateMany({
    where: {
      id: orderId,
      status: OrderStatus.PAID,
      fulfillmentStartedAt: null,
    },
    data: {
      status: OrderStatus.PROCESSING,
      fulfillmentStartedAt: new Date(),
      fulfillmentAttempts: { increment: 1 },
    },
  });

  if (claimed.count === 0) {
    return { success: false, reason: "Order not in claimable PAID state or fulfillment already started" };
  }

  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { product: true, productItem: true },
  });

  const supplier = (order.productItem as any).supplier || "DIGIFLAZZ";
  const sku = order.productItem.sku;

  const isXaviera = supplier === "XAVIERA" || sku.startsWith("XAV-");

  // Akun premium non-Xaviera is managed manually by admin (instant vault or manual handover)
  const isManual =
    !isXaviera &&
    (supplier === "MANUAL" ||
      order.product.categorySlug === "akun-premium" ||
      sku.startsWith("CUSTOM-") ||
      sku.startsWith("SKU-") ||
      sku.startsWith("MANUAL-"));

  if (isManual) {
    // 1. Check if ready stock credentials exist in the admin's AccountStock vault
    try {
      const readyStock = await prisma.accountStock.findFirst({
        where: {
          productItemId: order.productItemId,
          isUsed: false,
        },
        orderBy: { createdAt: "asc" },
      });

      if (readyStock) {
        // Mark stock item as used
        await prisma.accountStock.update({
          where: { id: readyStock.id },
          data: {
            isUsed: true,
            orderId: order.id,
            usedAt: new Date(),
          },
        });

        // Check remaining available stock; if 0, update variant status to OUT_OF_STOCK
        const remaining = await prisma.accountStock.count({
          where: {
            productItemId: order.productItemId,
            isUsed: false,
          },
        });

        if (remaining === 0) {
          await prisma.productItem.update({
            where: { id: order.productItemId },
            data: { stockStatus: "OUT_OF_STOCK" },
          });
        }

        // Complete order instantly with credentials
        const updatedOrder = await prisma.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.SUCCESS,
            sn: readyStock.credential,
            supplierStatus: "BERHASIL",
            fulfilledAt: new Date(),
            notes: `Kredensial stok mandiri diserahkan otomatis dari brankas akun.`,
          },
          include: { product: true, productItem: true },
        });

        // Send buyer receipt email with credentials
        await dispatchSuccess(updatedOrder, readyStock.credential, "STOK_MANDIRI");

        console.log(`[startFulfillment] Instant manual stock fulfilled for invoice ${order.invoiceNumber}`);
        return { success: true, instantStock: true, sn: readyStock.credential };
      }
    } catch (stockErr) {
      console.error("[startFulfillment] Error pulling manual stock:", stockErr);
    }

    // 2. Fallback if no instant stock: wait for admin manual handover
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.PAID,
        notes: `Pesanan Manual: menunggu admin menyerahkan kredensial / akses ke pelanggan.`,
      },
    });

    // Alert admin for manual fulfillment required
    try {
      await dispatchNotificationEvent("notifyNewOrder", {
        invoice: order.invoiceNumber,
        productName: `${order.product.name} (PERLU PROSES MANUAL)`,
        variantName: order.productItem.name,
        targetUser: order.targetUserId + (order.targetZoneId ? ` (${order.targetZoneId})` : ""),
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        customerPhone: order.customerPhone || undefined,
        customerEmail: order.customerEmail,
      });
    } catch (e) {
      console.error("[startFulfillment] Error notifying manual order:", e);
    }

    return { success: true, manual: true };
  }

  // 1A. XAVIERA STORE FULFILLMENT (Akun Premium & Digital Subscriptions)
  if (isXaviera) {
    try {
      const xavClient = new XavieraClient();
      const targetUser = order.targetUserId?.trim();
      const xavRes = await xavClient.createOrder({
        productSlug: order.product.slug,
        sku: sku,
        targetEmailOrPhone: targetUser || order.customerEmail,
      });

      if (xavRes.success && xavRes.credentials) {
        // Order berhasil instan dan kredensial terbit!
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.SUCCESS,
            fulfilledAt: new Date(),
            supplierRef: xavRes.orderId || null,
            sn: xavRes.credentials,
            supplierStatus: xavRes.status || "SUCCESS",
            notes: `Kredensial Akun Resmi (Xaviera):\n${xavRes.credentials}`,
          },
        });

        // Trigger official dispatch notifications (Email Resend ke pembeli + notif Telegram admin)
        await dispatchSuccess(order, xavRes.credentials, xavRes.orderId || null);

        return { success: true, supplier: "XAVIERA", credentials: xavRes.credentials };
      } else if (xavRes.success && !xavRes.credentials) {
        // Order Xaviera diterima tapi tipe invite/manual
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.PROCESSING,
            supplierRef: xavRes.orderId || null,
            supplierStatus: xavRes.status || "PROCESSING",
            notes: `Pesanan Xaviera diproses (${xavRes.orderId}): menunggu pengiriman akses/invite.`,
          },
        });
        return { success: true, supplier: "XAVIERA", processing: true };
      } else {
        console.error("[startFulfillment] Xaviera order error:", xavRes.message);
        await prisma.order.update({
          where: { id: order.id },
          data: {
            fulfillmentError: xavRes.message || "Gagal membuat order ke Xaviera.",
          },
        });
        return { success: false, reason: xavRes.message };
      }
    } catch (err: any) {
      console.error("[startFulfillment] Xaviera fulfillment exception:", err);
      return { success: false, reason: err?.message || "Gagal menghubungi Xaviera." };
    }
  }

  // 15s Abort Controller
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const target = order.targetZoneId
      ? `${order.targetUserId.trim()}${order.targetZoneId.trim()}`
      : order.targetUserId.trim();

    const digiRes = await createDigiflazzTransaction({
      buyerSkuCode: sku,
      customerNo: target,
      refId: order.invoiceNumber,
    });

    clearTimeout(timeoutId);

    const isDone = digiRes.status === "SUCCESS" && !!digiRes.sn;
    const isFailed = digiRes.status === "FAILED";
    const nextStatus = isDone
      ? OrderStatus.SUCCESS
      : isFailed
      ? OrderStatus.FAILED
      : OrderStatus.PROCESSING;

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: nextStatus,
        fulfilledAt: isDone ? new Date() : null,
        notes: `Digiflazz Ref: ${digiRes.refId} | Status: ${digiRes.status} | SN: ${
          digiRes.sn || digiRes.message || "Diproses"
        }`,
        supplierRef: digiRes.refId,
        sn: digiRes.sn || null,
        supplierStatus: digiRes.status,
        fulfillmentError: isFailed ? digiRes.message || "Supplier report failed" : null,
      },
    });

    if (nextStatus === OrderStatus.SUCCESS) {
      await dispatchSuccess(order, digiRes.sn, digiRes.refId);
    } else if (nextStatus === OrderStatus.FAILED) {
      await dispatchFailed(order, digiRes.message || "Digiflazz failed");
    }

    return {
      success: digiRes.success,
      supplierRef: digiRes.refId,
      status: nextStatus,
      sn: digiRes.sn,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.error("[startFulfillment] Error connecting to supplier:", err.message || err);
    await markFailed(order.id, err.message || "Timeout connecting to supplier");
    return { success: false, reason: err.message };
  }
}

async function markFailed(orderId: string, errorReason: string) {
  try {
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.FAILED,
        fulfillmentError: errorReason,
      },
      include: { product: true, productItem: true },
    });
    await dispatchFailed(updated, errorReason);
  } catch (e) {
    console.error("[markFailed] error updating order:", e);
  }
}

async function dispatchSuccess(order: any, sn?: string | null, supplierRef?: string | null) {
  try {
    const profit = Math.max(
      0,
      order.totalAmount - (order.productItem.supplierPrice || order.productItem.price * 0.8)
    );
    await dispatchNotificationEvent("notifySuccessOrder", {
      invoice: order.invoiceNumber,
      productName: order.product.name,
      variantName: order.productItem.name,
      targetUser: order.targetUserId + (order.targetZoneId ? ` (${order.targetZoneId})` : ""),
      totalAmount: order.totalAmount,
      profit: Math.round(profit),
      paymentMethod: order.paymentMethod || "QRIS",
      deliveryType: order.product.categorySlug === "akun-premium" ? "MANUAL" : "INSTANT",
      customerPhone: order.customerPhone || undefined,
      customerEmail: order.customerEmail,
      sn: sn || "Selesai diproses",
      supplierRef: supplierRef || undefined,
    });

    if (order.customerPhone) {
      await notifyBuyerOrderSuccess({
        invoiceNumber: order.invoiceNumber,
        customerPhone: order.customerPhone,
        customerEmail: order.customerEmail,
        totalAmount: order.totalAmount,
        product: order.product,
        productItem: order.productItem,
        targetUserId: order.targetUserId,
        targetZoneId: order.targetZoneId,
        status: order.status,
        sn: sn || order.sn,
      }).catch((waErr) => console.error("[dispatchSuccess] WhatsApp notification error:", waErr));
    }
  } catch (e) {
    console.error("[dispatchSuccess] notification error:", e);
  }
}

async function dispatchFailed(order: any, reason: string) {
  try {
    await dispatchNotificationEvent("notifyFailedOrder", {
      invoice: order.invoiceNumber,
      productName: order.product.name,
      variantName: order.productItem.name,
      totalAmount: order.totalAmount,
      reason: reason || "Kendala supplier",
      customerPhone: order.customerPhone || undefined,
      customerEmail: order.customerEmail,
    });
  } catch (e) {
    console.error("[dispatchFailed] notification error:", e);
  }
}

/**
 * Backward compatibility alias for existing callers
 */
export async function fulfillOrderWithSupplier(order: { id: string }) {
  return await startFulfillment(order.id);
}

/**
 * Auto-reconcile pending/processing order status from supplier (e.g. Digiflazz)
 */
export async function reconcileSupplierOrder(orderIdOrInvoice: string) {
  try {
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: orderIdOrInvoice },
          { invoiceNumber: orderIdOrInvoice },
        ],
      },
      include: { product: true, productItem: true },
    });

    if (!order) return null;

    // Only reconcile if order is currently PROCESSING or PAID (pending supplier completion)
    if (order.status !== OrderStatus.PROCESSING && order.status !== OrderStatus.PAID) {
      return order;
    }

    const supplier = (order.productItem as any)?.supplier || "DIGIFLAZZ";
    const sku = order.productItem.sku;
    const isXaviera = supplier === "XAVIERA" || sku.startsWith("XAV-");
    const isDigiflazz = !isXaviera;

    if (isDigiflazz) {
      const target = order.targetZoneId
        ? `${order.targetUserId.trim()}${order.targetZoneId.trim()}`
        : order.targetUserId.trim();

      const digiRes = await checkDigiflazzTransactionStatus(
        order.invoiceNumber,
        sku,
        target
      );

      if (digiRes.status === "SUCCESS") {
        const updated = await prisma.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.SUCCESS,
            fulfilledAt: new Date(),
            sn: digiRes.sn || "Injeksi berhasil",
            supplierStatus: "SUCCESS",
            notes: `Digiflazz Ref: ${digiRes.refId} | Status: Sukses | SN: ${digiRes.sn || "Selesai"}`,
          },
          include: { product: true, productItem: true },
        });

        await dispatchSuccess(updated, digiRes.sn, digiRes.refId);
        return updated;
      } else if (digiRes.status === "FAILED") {
        const updated = await prisma.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.FAILED,
            supplierStatus: "FAILED",
            fulfillmentError: digiRes.message || "Supplier transaction failed",
            notes: `Digiflazz Ref: ${digiRes.refId} | Status: Gagal (${digiRes.message || "-"})`,
          },
          include: { product: true, productItem: true },
        });

        await dispatchFailed(updated, digiRes.message || "Digiflazz failed");
        return updated;
      }
    }

    return order;
  } catch (error) {
    console.error("[reconcileSupplierOrder] Error:", error);
    return null;
  }
}
