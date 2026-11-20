/**
 * WhatsApp Gateway Notification Engine for XYZPEDIA
 * Supports Fonnte and generic WhatsApp Gateway APIs.
 */

export interface SendWhatsAppParams {
  target: string;
  message: string;
  countryCode?: string;
}

export interface WhatsAppSendResult {
  success: boolean;
  status: string;
  error?: string;
}

/**
 * Standardize Indonesian phone numbers to 628xxxxxxxx format
 */
export function formatIndonesianPhone(phone: string): string {
  if (!phone) return "";
  let cleaned = phone.replace(/[^0-9]/g, "");

  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  } else if (cleaned.startsWith("8")) {
    cleaned = "628" + cleaned.slice(1);
  }

  return cleaned;
}

/**
 * Dispatches a WhatsApp message via Fonnte or configured Gateway
 */
export async function sendWhatsAppMessage({
  target,
  message,
}: SendWhatsAppParams): Promise<WhatsAppSendResult> {
  const token = process.env.FONNTE_TOKEN || process.env.WHATSAPP_TOKEN || process.env.WA_GATEWAY_TOKEN;
  const endpoint = process.env.WHATSAPP_GATEWAY_URL || "https://api.fonnte.com/send";

  const cleanTarget = formatIndonesianPhone(target);
  if (!cleanTarget || cleanTarget.length < 9) {
    return { success: false, status: "SKIPPED", error: "Nomor WhatsApp tidak valid" };
  }

  if (!token) {
    // Gateway not configured in environment; log safely for dev/staging
    console.info(`[WhatsApp Gateway] Unconfigured (FONNTE_TOKEN not set). Simulated send to ${cleanTarget}`);
    return {
      success: true,
      status: "SIMULATED",
      error: "FONNTE_TOKEN not set in environment",
    };
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        target: cleanTarget,
        message,
        countryCode: "62",
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.status === false) {
      console.warn("[WhatsApp Gateway] Send failed:", data);
      return {
        success: false,
        status: "FAILED",
        error: data.reason || data.message || `HTTP ${res.status}`,
      };
    }

    return { success: true, status: "SENT" };
  } catch (err: any) {
    console.error("[WhatsApp Gateway] Error connecting to gateway:", err.message);
    return { success: false, status: "ERROR", error: err.message };
  }
}

/**
 * Sends a rich, professional transaction confirmation to the buyer
 */
export async function notifyBuyerOrderSuccess(order: {
  invoiceNumber: string;
  customerPhone?: string | null;
  customerEmail?: string | null;
  totalAmount: number;
  product?: { name: string };
  productItem?: { name: string };
  targetUserId?: string;
  targetZoneId?: string | null;
  status: string;
  sn?: string | null;
}): Promise<WhatsAppSendResult | null> {
  if (!order.customerPhone) {
    return null;
  }

  const productName = order.product?.name || "Produk Game / Akun";
  const itemName = order.productItem?.name || "Varian";
  const targetId = order.targetZoneId
    ? `${order.targetUserId} (${order.targetZoneId})`
    : order.targetUserId || "-";

  const receiptUrl = `https://www.xyzpedia.my.id/transaksi/${order.invoiceNumber}`;

  let snText = "";
  if (order.sn && !order.sn.toLowerCase().includes("saldo")) {
    snText = `\n🔑 *Serial Number / Kredensial:* \n\`\`\`\n${order.sn}\n\`\`\`\n`;
  }

  const message = `🎉 *PEMBAYARAN DITERIMA & PESANAN DIPROSES!*

Halo kak! Terima kasih telah berbelanja di *XYZPEDIA*. Berikut adalah rincian pesanan Anda:

🧾 *No. Invoice:* ${order.invoiceNumber}
🎮 *Layanan:* ${productName}
💎 *Paket:* ${itemName}
🎯 *ID Tujuan:* ${targetId}
💰 *Total Bayar:* Rp ${order.totalAmount.toLocaleString("id-ID")}
📊 *Status:* ${order.status === "SUCCESS" ? "BERHASIL (SUKSES) ⚡" : "DIPROSES"}
${snText}
🔗 *Lihat Bukti & Download Struk Resmi:*
${receiptUrl}

Jika ada pertanyaan atau butuh bantuan lebih lanjut, silakan hubungi Customer Support kami melalui tautan di website.

Salam hangat,
*Tim XYZPEDIA* ⚡`;

  return await sendWhatsAppMessage({
    target: order.customerPhone,
    message,
  });
}
