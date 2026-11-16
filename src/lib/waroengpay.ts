import crypto from "crypto";

export interface CreatePaymentInput {
  orderNumber: string;
  grossAmount: number;
  customerEmail?: string;
  customerPhone?: string;
  description?: string;
  redirectUrl?: string;
}

export interface WaroengPayResponse {
  success: boolean;
  paymentReference?: string;
  qrString?: string;
  qrImageUrl?: string;
  payUrl?: string;
  amount?: number;
  totalAmount?: number;
  uniqueCode?: number;
  expiredAt?: string;
  errorMessage?: string;
}

export class WaroengPayClient {
  private baseUrl: string;
  private apiKey: string;
  private webhookSecret: string;
  private timeout: number;

  constructor() {
    this.baseUrl = (
      process.env.WAROENGPAY_BASE_URL || "https://waroengpay.com"
    ).replace(/\/$/, "");
    this.apiKey = process.env.WAROENGPAY_API_KEY || "";
    this.webhookSecret = process.env.WAROENGPAY_WEBHOOK_SECRET || "";
    this.timeout = Number(process.env.WAROENGPAY_TIMEOUT || 15) * 1000;
  }

  /**
   * Create dynamic QRIS payment charge
   */
  async createCharge(input: CreatePaymentInput): Promise<WaroengPayResponse> {
    if (!this.apiKey) {
      throw new Error("WAROENGPAY_API_KEY belum dikonfigurasi di environment.");
    }

    const baseAmount = Math.round(input.grossAmount);
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");

    const payload = {
      amount: baseAmount,
      reference: input.orderNumber,
      description: input.description || `Pembayaran Pesanan ${input.orderNumber} di XYZPEDIA`,
      expires_in: 30,
      redirect_url: input.redirectUrl || `${appUrl}/transaksi/${input.orderNumber}`,
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}/api/payments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Idempotency-Key": input.orderNumber,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          success: false,
          errorMessage: body?.error || body?.message || `HTTP ${response.status}`,
        };
      }

      const data = body?.data || body;
      return {
        success: true,
        paymentReference: data?.id || data?.reference || input.orderNumber,
        qrString: data?.qr_string || data?.qr_content || data?.qris,
        qrImageUrl: data?.qr_image_url || data?.qr_url,
        payUrl: data?.pay_url || data?.checkout_url,
        amount: data?.amount || baseAmount,
        totalAmount: data?.total_amount || data?.amount || baseAmount,
        uniqueCode: data?.unique_code || 0,
        expiredAt: data?.expired_at,
      };
    } catch (err: any) {
      return {
        success: false,
        errorMessage: err?.message || "Koneksi ke WaroengPay gagal.",
      };
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Check status of payment by reference
   */
  async checkStatus(reference: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error("WAROENGPAY_API_KEY belum dikonfigurasi.");
    }

    const response = await fetch(`${this.baseUrl}/api/payments/${encodeURIComponent(reference)}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Accept: "application/json",
      },
    });

    return await response.json();
  }

  /**
   * Verify Webhook Signature from WaroengPay
   * Header X-Signature = hex HMAC-SHA256(secret, "<timestamp>.<raw body>")
   */
  verifyWebhookSignature(
    rawBody: string,
    signature: string | null,
    timestamp: string | number | null
  ): boolean {
    if (!signature || !timestamp || !this.webhookSecret) {
      return false;
    }

    const ts = Number(timestamp);
    const now = Math.floor(Date.now() / 1000);

    // Reject older than 300 seconds
    if (Math.abs(now - ts) > 300) {
      return false;
    }

    const payloadToSign = `${ts}.${rawBody}`;
    const expected = crypto
      .createHmac("sha256", this.webhookSecret)
      .update(payloadToSign)
      .digest("hex");

    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  }
}
