/**
 * Xaviera Store API Client
 * Gateway untuk otomatisasi pembelian Akun Premium & Digital Goods
 */

export interface XavieraOrderResult {
  success: boolean;
  orderId?: string;
  credentials?: string;
  status?: string;
  message?: string;
  remainingBalance?: number;
  raw?: any;
}

const XAVIERA_PRODUCT_MAP: Record<string, string> = {
  netflix: "p_bb4378a5c1345a6f",
  viu: "p_065404294e71ec70",
  iqiyi: "p_f159552a25f64ae2",
  loklok: "p_adc3826cdb9f4b27",
  "youtube-premium": "p_7eeb3cb8c98d27dd",
  crunchyroll: "p_3127b1c4b22e4c9e",
  "canva-pro": "p_3fed06d1fb345cd6",
  "capcut-pro": "p_7eb852ef72db0fe6",
  spotify: "p_b05ff4eb84a45786",
  "apple-music": "p_dd267622235306b9",
  meitu: "p_e20162bbc8b0ca52",
  "zoom-pro": "p_7b698b79e3ff3b3e",
  "alight-motion": "p_b50d50870cc4a64c",
  bstation: "p_21e5b1a23b6f8fa5",
  "wink-premium": "p_a893640a2707c2e8",
  wetv: "p_79025547fd58dd84",
};

// Memory cache for Xaviera balance (60s TTL)
let cachedXavieraBalance: { saldo: number; timestamp: number } | null = null;
const XAVIERA_BALANCE_CACHE_TTL = 60 * 1000;

export function updateXavieraBalanceCache(saldo: number) {
  cachedXavieraBalance = { saldo, timestamp: Date.now() };
}

/**
 * Dapatkan saldo Xaviera dengan caching 60s (anti-rate limit & performa instan)
 */
export async function getXavieraBalanceCached(forceRefresh = false): Promise<number | null> {
  const now = Date.now();
  if (!forceRefresh && cachedXavieraBalance && now - cachedXavieraBalance.timestamp < XAVIERA_BALANCE_CACHE_TTL) {
    return cachedXavieraBalance.saldo;
  }

  try {
    const client = new XavieraClient();
    const profile = await client.getProfile();
    if (profile.success && typeof profile.saldo === "number") {
      updateXavieraBalanceCache(profile.saldo);
      return profile.saldo;
    }
    return cachedXavieraBalance ? cachedXavieraBalance.saldo : null;
  } catch (err) {
    console.warn("[Xaviera] Gagal mengambil saldo live, fallback ke cache:", err);
    return cachedXavieraBalance ? cachedXavieraBalance.saldo : null;
  }
}

export class XavieraClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = (
      process.env.XAVIERA_BASE_URL || "https://kiospremium.site/api/v1"
    ).replace(/\/$/, "");
    this.apiKey = process.env.XAVIERA_API_KEY || "";
  }

  /**
   * Cek saldo & profil akun reseller Xaviera
   */
  async getProfile(): Promise<{ success: boolean; name?: string; saldo?: number; error?: string }> {
    if (!this.apiKey) {
      return { success: false, error: "XAVIERA_API_KEY belum diset." };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(`${this.baseUrl}/me`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          Accept: "application/json",
          "User-Agent": "XYZPEDIA-Engine/1.0",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        return { success: false, error: `HTTP ${res.status}: Gagal mengambil profil Xaviera.` };
      }

      const data = await res.json();
      const saldo = typeof data.saldo === "number" ? data.saldo : Number(data.saldo || 0);
      updateXavieraBalanceCache(saldo);

      return {
        success: true,
        name: data.name,
        saldo,
      };
    } catch (e: any) {
      return { success: false, error: e?.message || "Koneksi ke Xaviera gagal." };
    }
  }

  /**
   * Buat pesanan akun premium ke Xaviera
   */
  async createOrder(params: {
    productSlug: string;
    sku: string;
    targetEmailOrPhone?: string;
  }): Promise<XavieraOrderResult> {
    if (!this.apiKey) {
      return {
        success: false,
        message: "XAVIERA_API_KEY belum dikonfigurasi di environment.",
      };
    }

    const variantId = params.sku.replace(/^XAV-/, "").trim();
    let productId = XAVIERA_PRODUCT_MAP[params.productSlug];

    // Jika productId belum terdaftar di map, ambil dari live catalog Xaviera
    if (!productId) {
      try {
        const prodRes = await fetch(`${this.baseUrl}/products`, {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            Accept: "application/json",
            "User-Agent": "XYZPEDIA-Engine/1.0",
          },
        });
        if (prodRes.ok) {
          const cat = await prodRes.json();
          const list = cat.products || cat.data || cat || [];
          const found = list.find((p: any) =>
            (p.variants || []).some((v: any) => v.id === variantId) ||
            p.id === variantId
          );
          if (found) {
            productId = found.id;
          }
        }
      } catch (err) {
        console.warn("[XavieraClient] Catalog lookup fallback error:", err);
      }
    }

    if (!productId) {
      return {
        success: false,
        message: `ID Produk Xaviera tidak ditemukan untuk slug '${params.productSlug}' (SKU: ${params.sku}).`,
      };
    }

    try {
      const payload: Record<string, any> = {
        productId,
        variantId,
      };

      if (params.targetEmailOrPhone) {
        payload.email = params.targetEmailOrPhone;
        payload.target = params.targetEmailOrPhone;
      }

      const res = await fetch(`${this.baseUrl}/products/order`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
          "User-Agent": "XYZPEDIA-Engine/1.0",
        },
        body: JSON.stringify(payload),
      });

      const bodyText = await res.text();
      let resJson: any;
      try {
        resJson = JSON.parse(bodyText);
      } catch {
        resJson = { error: bodyText };
      }

      if (!res.ok || !resJson?.order) {
        const errMsg =
          resJson?.error ||
          resJson?.message ||
          `Xaviera Order Error (HTTP ${res.status})`;
        console.error("[XavieraClient] Order creation failed:", errMsg, resJson);
        return {
          success: false,
          message: errMsg,
          raw: resJson,
        };
      }

      const orderData = resJson.order;
      const credsList: Array<{ email?: string; password?: string; [key: string]: any }> =
        orderData.credentials || [];

      // Format credentials into readable text
      let formattedCredentials = "";
      if (credsList.length > 0) {
        formattedCredentials = credsList
          .map((c) => {
            const parts: string[] = [];
            if (c.email) parts.push(`Email: ${c.email}`);
            if (c.password) parts.push(`Password: ${c.password}`);
            // Other fields (pin, profile, dll)
            Object.keys(c).forEach((k) => {
              if (k !== "email" && k !== "password") {
                parts.push(`${k}: ${c[k]}`);
              }
            });
            return parts.join("\n");
          })
          .join("\n---\n");
      } else if (orderData.delivery) {
        formattedCredentials = String(orderData.delivery);
      }

      if (typeof resJson.saldo === "number") {
        updateXavieraBalanceCache(resJson.saldo);
      }

      return {
        success: true,
        orderId: orderData.id,
        credentials: formattedCredentials || undefined,
        status: orderData.status,
        remainingBalance: resJson.saldo,
        raw: orderData,
      };
    } catch (err: any) {
      console.error("[XavieraClient] Exception:", err);
      return {
        success: false,
        message: err?.message || "Koneksi ke gateway Xaviera gagal.",
      };
    }
  }
}
