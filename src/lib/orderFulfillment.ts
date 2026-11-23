import { prisma } from "./prisma";
import { createDigiflazzTransaction } from "./digiflazz";
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

  // Akun premium non-Xaviera is managed manually by admin (100% decoupled from Waroengkuy)
  const isManual =
    !isXaviera &&
    (supplier === "MANUAL" ||
      order.product.categorySlug === "akun-premium" ||
      sku.startsWith("CUSTOM-") ||
      sku.startsWith("SKU-") ||
      sku.startsWith("MANUAL-"));

  // Check if Waroengkuy product (PPOB only, never akun-premium)
  const isWaroengkuy = !isManual && !isXaviera && supplier === "WAROENGKUY";

  if (isManual) {
    // Keep order in PAID / PROCESSING state waiting for admin manual handover
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
      const xavRes = await xavClient.createOrder({
        productSlug: order.product.slug,
        sku: sku,
        targetEmailOrPhone: order.customerEmail || order.targetUserId,
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

        // Kirim WhatsApp buyer jika ada nomor
        if (order.customerPhone) {
          try {
            await notifyBuyerOrderSuccess({
              ...order,
              status: OrderStatus.SUCCESS,
              sn: xavRes.credentials,
            });
          } catch (e) {
            console.error("[startFulfillment] WA notify error:", e);
          }
        }

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

  // Routing supplier based on ProductItem.supplier
  const isDigiflazz = !isWaroengkuy && (supplier === "DIGIFLAZZ" || !process.env.WAROENGKUY_API_KEY);

  // 15s Abort Controller
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    if (isDigiflazz) {
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
    }

    // Waroengkuy Fulfillment (Digital Accounts or PPOB)
    const apiKey = process.env.WAROENGKUY_API_KEY || "";
    const baseUrl = (process.env.WAROENGKUY_BASE_URL || "https://waroengkuy.com/api/reseller/v1").replace(/\/$/, "");

    if (!apiKey) {
      clearTimeout(timeoutId);
      await markFailed(order.id, "Waroengkuy API Key not set");
      return { success: false, reason: "No API Key" };
    }

    const isDigitalAccount = order.product.categorySlug === "akun-premium" || !order.targetZoneId;
    const orderEndpoint = isDigitalAccount ? `${baseUrl}/orders` : `${baseUrl}/ppob/orders`;
    const orderBody = isDigitalAccount
      ? {
          variant_id: sku,
          qty: 1,
          ref_id: order.invoiceNumber,
        }
      : {
          variant_id: parseInt(sku, 10),
          target: `${order.targetUserId.trim()}${order.targetZoneId ? order.targetZoneId.trim() : ""}`,
          ref_id: order.invoiceNumber,
        };

    const res = await fetch(orderEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(orderBody),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const data = await res.json().catch(() => ({}));

    if (data.ok && data.order) {
      const rawAccounts = Array.isArray(data.order.accounts)
        ? data.order.accounts.join("\n").trim()
        : "";
      const snResult = rawAccounts || data.order.sn || data.order.note || null;
      const isDone =
        data.order.status === "SUCCESS" ||
        data.order.status === "success" ||
        Boolean(rawAccounts);
      const nextStatus = isDone ? OrderStatus.SUCCESS : OrderStatus.PROCESSING;

      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: nextStatus,
          fulfilledAt: isDone ? new Date() : null,
          notes: `Waroengkuy: ${data.order.ref || data.order.id} | Status: ${data.order.status}`,
          supplierRef: data.order.ref || String(data.order.id),
          sn: snResult,
          supplierStatus: data.order.status,
        },
      });

      if (nextStatus === OrderStatus.SUCCESS) {
        await dispatchSuccess(order, data.order.sn, data.order.ref);
      }

      return { success: true, supplierRef: data.order.ref, status: nextStatus, sn: data.order.sn };
    } else {
      await markFailed(order.id, data.error || `HTTP ${res.status}`);
      return { success: false, error: data.error };
    }
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.error("[startFulfillment] Error connecting to supplier:", err.message || err);
    await markFailed(order.id, err.message || "Timeout connecting to supplier");
    return { success: false, error: err.message };
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
