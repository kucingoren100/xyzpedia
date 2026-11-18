import { prisma } from "./prisma";
import { createDigiflazzTransaction } from "./digiflazz";

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
 * Automate supplier order execution (H2H) to Digiflazz or Waroengkuy
 */
export async function fulfillOrderWithSupplier(order: FulfillOrderInput) {
  const sku = order.productItem.sku;
  const isNumericSku = /^\d+$/.test(sku);

  // 0. DIGIFLAZZ INJECTION (Mobile Legends, Free Fire, dll)
  const isDigiflazz =
    sku.startsWith("ml") ||
    sku.startsWith("ff") ||
    sku.startsWith("pre359") ||
    sku.startsWith("pln") ||
    sku.startsWith("dana") ||
    sku.startsWith("go") ||
    sku.startsWith("ovo") ||
    sku.startsWith("shopee");

  if (isDigiflazz) {
    const target = order.targetZoneId
      ? `${order.targetUserId.trim()}${order.targetZoneId.trim()}`
      : order.targetUserId.trim();

    console.log(
      `[Fulfillment] Mengirim pesanan ${order.invoiceNumber} ke Digiflazz (sku: ${sku}, target: ${target})...`
    );

    try {
      const digiRes = await createDigiflazzTransaction({
        buyerSkuCode: sku,
        customerNo: target,
        refId: order.invoiceNumber,
      });

      const noteText = `Digiflazz Ref: ${digiRes.refId} | Status: ${digiRes.status} | SN: ${
        digiRes.sn || digiRes.message || "Diproses Digiflazz"
      }`;

      await prisma.order.update({
        where: { id: order.id },
        data: {
          fulfilledAt: new Date(),
          notes: noteText,
          status:
            digiRes.status === "SUCCESS"
              ? "SUCCESS"
              : digiRes.status === "FAILED"
              ? "FAILED"
              : "PROCESSING",
        },
      });

      return {
        success: digiRes.success,
        supplierRef: digiRes.refId,
        status: digiRes.status,
        sn:
          digiRes.sn ||
          digiRes.message ||
          "Diproses langsung ke server akun in-game",
      };
    } catch (err: any) {
      console.error(
        "[Fulfillment] Error connecting to Digiflazz:",
        err.message || err
      );
      return { success: false, error: err.message };
    }
  }

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

        let finalStatus = data.order.status;
        let sn = data.order.sn;

        // Poll for SN if processing (up to 3 quick attempts of 2s each)
        if (!sn && data.order.id) {
          for (let attempt = 0; attempt < 3; attempt++) {
            await new Promise((r) => setTimeout(r, 2000));
            try {
              const checkRes = await fetch(`${baseUrl}/ppob/orders/${data.order.id}`, {
                headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" },
              });
              const checkData = await checkRes.json();
              if (checkData.ok && checkData.order) {
                finalStatus = checkData.order.status;
                if (checkData.order.sn) {
                  sn = checkData.order.sn;
                  break;
                }
              }
            } catch {
              // Ignore polling check error
            }
          }
        }

        await prisma.order.update({
          where: { id: order.id },
          data: {
            fulfilledAt: new Date(),
            notes: `Injeksi PPOB: ${data.order.ref} | Status: ${finalStatus} | SN: ${sn || "Dalam antrean Moonton/Publisher"}`,
          },
        });

        return {
          success: true,
          supplierRef: data.order.ref,
          status: finalStatus,
          sn: sn || "Sedang diproses langsung ke server akun in-game",
        };
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
