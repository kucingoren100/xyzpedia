import { prisma } from "./prisma";

interface FulfillOrderInput {
  id: string;
  invoiceNumber: string;
  targetUserId: string;
  targetZoneId: string | null;
  product: {
    categorySlug: string;
    requiresServer: boolean;
    name: string;
  };
  productItem: {
    sku: string;
    name: string;
  };
}

/**
 * Automate supplier order execution (H2H) to Waroengkuy
 */
export async function fulfillOrderWithSupplier(order: FulfillOrderInput) {
  const apiKey =
    process.env.WAROENGKUY_API_KEY ||
    "wrk_15f6505ecd7be057da1448373998d9fb39b7d24a";
  const baseUrl = (
    process.env.WAROENGKUY_BASE_URL || "https://waroengkuy.com/api/reseller/v1"
  ).replace(/\/$/, "");

  if (!apiKey) {
    console.warn("[Fulfillment] WAROENGKUY_API_KEY tidak tersedia.");
    return { success: false, reason: "No API Key" };
  }

  const sku = order.productItem.sku;
  const isNumericSku = /^\d+$/.test(sku);

  // 1. PPOB / GAME / PULSA / VOUCHER INJECTION
  if (
    isNumericSku &&
    (order.product.categorySlug === "game-topup" ||
      order.product.categorySlug === "pulsa-ewallet" ||
      order.product.categorySlug === "voucher-digital")
  ) {
    const variantId = parseInt(sku, 10);
    // Combine target and zone ID for games that require server zone (e.g. MLBB, Magic Chess)
    const target = order.targetZoneId
      ? `${order.targetUserId.trim()}${order.targetZoneId.trim()}`
      : order.targetUserId.trim();

    console.log(
      `[Fulfillment] Mengirim pesanan ${order.invoiceNumber} ke Waroengkuy PPOB (variant_id: ${variantId}, target: ${target})...`
    );

    try {
      const res = await fetch(`${baseUrl}/ppob/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          variant_id: variantId,
          target,
          ref_id: order.invoiceNumber,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (data.ok && data.order) {
        console.log(
          `[Fulfillment] Injeksi berhasil dikirim! Ref: ${data.order.ref}, Status: ${data.order.status}`
        );

        await prisma.order.update({
          where: { id: order.id },
          data: {
            fulfilledAt: new Date(),
            notes: `Injeksi PPOB: ${data.order.ref} | Status: ${data.order.status} | SN: ${data.order.sn || "Diproses"}`,
          },
        });

        return { success: true, supplierRef: data.order.ref, status: data.order.status };
      } else {
        console.error(
          `[Fulfillment] Gagal kirim ke Waroengkuy:`,
          data.error || res.statusText
        );
        return { success: false, error: data.error || `HTTP ${res.status}` };
      }
    } catch (err: any) {
      console.error(`[Fulfillment] Error connecting to supplier:`, err.message || err);
      return { success: false, error: err.message };
    }
  }

  // 2. AKUN PREMIUM INSTAN (Jika produk instan Waroengkuy)
  if (isNumericSku && order.product.categorySlug === "akun-premium") {
    const variantId = parseInt(sku, 10);
    try {
      const res = await fetch(`${baseUrl}/orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          variant_id: variantId,
          qty: 1,
          ref_id: order.invoiceNumber,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (data.ok && data.order) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            fulfilledAt: new Date(),
            notes: `Akun Premium Ref: ${data.order.ref} | Status: ${data.order.status}`,
          },
        });
        return { success: true, supplierRef: data.order.ref };
      }
    } catch (err: any) {
      console.error(`[Fulfillment] Error ordering premium account:`, err.message || err);
    }
  }

  return { success: false, reason: "Manual product or non-API item" };
}
