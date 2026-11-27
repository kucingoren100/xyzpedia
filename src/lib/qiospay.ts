import crypto from "crypto";
import { siteUrl } from "@/lib/siteUrl";

export interface QiosPayCreateInput {
  orderId: string;
  amount: number;
  description: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  callbackUrl?: string;
  redirectUrl?: string;
  expiredMinutes?: number;
}

export interface QiosPayInvoiceResponse {
  success: boolean;
  id?: string;
  refId?: string;
  status?: "PENDING" | "PAID" | "EXPIRED" | "CANCELLED" | string;
  amount?: number;
  uniqueCode?: number;
  totalAmount?: number;
  qrisContent?: string;
  qrImageUrl?: string;
  payUrl?: string;
  expiresAt?: string;
  raw?: any;
  error?: string;
}

export class QiosPayClient {
  private baseUrl: string;
  private apiKey: string;
  private privateKey: string;
  private merchantCode: string;

  constructor() {
    this.baseUrl = (
      process.env.QIOSPAY_BASE_URL ||
      "https://my.qiospay.com/v1"
    ).replace(/\/$/, "");
    this.apiKey = process.env.QIOSPAY_API_KEY || "";
    this.privateKey = process.env.QIOSPAY_PRIVATE_KEY || "";
    this.merchantCode = process.env.QIOSPAY_MERCHANT_CODE || "";
  }

  /**
   * Buat transaksi QRIS Dinamis baru via QiosPay API
   */
  async createInvoice(input: QiosPayCreateInput): Promise<QiosPayInvoiceResponse> {
    if (!this.apiKey) {
      return {
        success: false,
        error: "QIOSPAY_API_KEY belum dikonfigurasi.",
      };
    }

    try {
      const endpoint = `${this.baseUrl}/invoices`;
      const payload = {
        order_id: input.orderId,
        amount: Math.round(input.amount),
        keterangan: input.description.slice(0, 100),
        customer: {
          name: input.customerName || "Customer",
          email: input.customerEmail || `customer@${new URL(siteUrl()).hostname}`,
        },
        whatsapp_buyer: input.customerPhone ? input.customerPhone.replace(/\D/g, "") : undefined,
        callback_url:
          input.callbackUrl ||
          process.env.QIOSPAY_CALLBACK_URL ||
          siteUrl("/api/webhooks/qiospay"),
        redirect_url:
          input.redirectUrl ||
          siteUrl(`/transaksi/${input.orderId}`),
        expired_menit: input.expiredMinutes || 15,
      };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "x-api-key": this.apiKey,
          "Content-Type": "application/json",
          "User-Agent": "XYZPEDIA-Engine/1.0",
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(12_000),
      });

      const bodyText = await res.text();
      let resJson: any;
      try {
        resJson = JSON.parse(bodyText);
      } catch {
        resJson = { error: bodyText };
      }

      if (!res.ok || !resJson?.data) {
        return {
          success: false,
          error:
            resJson?.error?.message ||
            resJson?.message ||
            resJson?.error ||
            `QiosPay API Error (HTTP ${res.status})`,
          raw: resJson,
        };
      }

      const d = resJson.data;
      return {
        success: true,
        id: d.id,
        refId: d.ref_id,
        status: String(d.status).toUpperCase(),
        amount: d.amount,
        uniqueCode: d.unique_code || 0,
        totalAmount: d.total_amount || d.amount,
        qrisContent: d.qris_content,
        qrImageUrl: d.qr_image_url,
        payUrl: d.pay_url,
        expiresAt: d.expires_at,
        raw: d,
      };
    } catch (err: any) {
      console.error("[QiosPayClient] createInvoice error:", err);
      return {
        success: false,
        error: err?.message || "Koneksi ke QiosPay gateway gagal.",
      };
    }
  }

  /**
   * Cek status transaksi via QiosPay API (order_id atau invoice id)
   */
  async checkStatus(orderIdOrId: string): Promise<QiosPayInvoiceResponse> {
    if (!this.apiKey) {
      return { success: false, error: "QIOSPAY_API_KEY belum dikonfigurasi." };
    }

    try {
      const endpoint = `${this.baseUrl}/invoices/${encodeURIComponent(orderIdOrId)}`;
      const res = await fetch(endpoint, {
        method: "GET",
        headers: {
          "x-api-key": this.apiKey,
          "User-Agent": "XYZPEDIA-Engine/1.0",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      });

      const bodyText = await res.text();
      let resJson: any;
      try {
        resJson = JSON.parse(bodyText);
      } catch {
        resJson = { error: bodyText };
      }

      if (!res.ok || !resJson?.data) {
        return {
          success: false,
          error:
            resJson?.error?.message ||
            resJson?.message ||
            resJson?.error ||
            `HTTP ${res.status}`,
          raw: resJson,
        };
      }

      const d = resJson.data;
      return {
        success: true,
        id: d.id,
        refId: d.ref_id,
        status: String(d.status).toUpperCase(),
        amount: d.amount,
        uniqueCode: d.unique_code || 0,
        totalAmount: d.total_amount || d.amount,
        qrisContent: d.qris_content,
        qrImageUrl: d.qr_image_url,
        payUrl: d.pay_url,
        expiresAt: d.expires_at,
        raw: d,
      };
    } catch (err: any) {
      console.error("[QiosPayClient] checkStatus error:", err);
      return {
        success: false,
        error: err?.message || "Gagal menghubungi QiosPay.",
      };
    }
  }

  /**
   * Verifikasi Webhook Signature dari QiosPay
   * Header: X-QiosPay-Signature: t=1760000000,v1=5f2a...
   * Formula: HMAC-SHA256(private_key, t + "." + raw_body)
   */
  verifyWebhookSignature(rawBody: string, signatureHeader?: string | null): boolean {
    if (!signatureHeader || !this.privateKey) {
      return false;
    }

    try {
      const parts = signatureHeader.split(",");
      let timestamp = "";
      let signature = "";

      for (const p of parts) {
        const [k, v] = p.trim().split("=");
        if (k === "t") timestamp = v;
        if (k === "v1") signature = v;
      }

      if (!timestamp || !signature) {
        return false;
      }

      // Cek anti-replay: perbedaan waktu maksimal 10 menit (600 detik)
      const nowSec = Math.floor(Date.now() / 1000);
      const reqSec = parseInt(timestamp, 10);
      if (isNaN(reqSec) || Math.abs(nowSec - reqSec) > 600) {
        console.warn("[QiosPay Webhook] Timestamp outside 10 minute replay window.");
        return false;
      }

      // Hitung HMAC
      const expected = crypto
        .createHmac("sha256", this.privateKey)
        .update(`${timestamp}.${rawBody}`)
        .digest("hex");

      const bufExpected = Buffer.from(expected, "utf8");
      const bufSig = Buffer.from(signature, "utf8");

      if (bufExpected.length !== bufSig.length) {
        return false;
      }

      return crypto.timingSafeEqual(bufExpected, bufSig);
    } catch (err) {
      console.error("[QiosPay Webhook] Signature verification exception:", err);
      return false;
    }
  }
}
