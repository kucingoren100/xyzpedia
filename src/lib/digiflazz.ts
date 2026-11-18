import crypto from "crypto";

export interface DigiflazzTransactionPayload {
  buyerSkuCode: string;
  customerNo: string;
  refId: string;
  testing?: boolean;
}

export interface DigiflazzTransactionResponse {
  success: boolean;
  refId: string;
  status: "SUCCESS" | "PENDING" | "FAILED";
  sn?: string;
  message?: string;
  price?: number;
  buyerLastSaldo?: number;
  raw?: any;
}

function md5(string: string): string {
  return crypto.createHash("md5").update(string).digest("hex");
}

function getConfig() {
  const username = process.env.DIGIFLAZZ_USERNAME || "";
  const apiKey = process.env.DIGIFLAZZ_KEY || "";
  const mode = process.env.DIGIFLAZZ_MODE || "production";
  return { username, apiKey, mode };
}

function getEndpoint(path: string): { url: string; headers: Record<string, string> } {
  const bridgeUrl = process.env.DIGIFLAZZ_BRIDGE_URL;
  const bridgeSecret = process.env.DIGIFLAZZ_BRIDGE_SECRET;

  if (bridgeUrl) {
    const cleanBase = bridgeUrl.replace(/\/$/, "");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (bridgeSecret) {
      headers["X-Bridge-Secret"] = bridgeSecret;
    }
    return {
      url: `${cleanBase}${path}`,
      headers,
    };
  }

  return {
    url: `https://api.digiflazz.com${path}`,
    headers: {
      "Content-Type": "application/json",
    },
  };
}

/**
 * Cek Saldo Akun Digiflazz
 */
export async function checkDigiflazzBalance() {
  const { username, apiKey } = getConfig();
  const sign = md5(username + apiKey + "depo");

  const target = getEndpoint("/v1/cek-saldo");
  const res = await fetch(target.url, {
    method: "POST",
    headers: target.headers,
    body: JSON.stringify({
      cmd: "deposit",
      username,
      sign,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Digiflazz HTTP ${res.status}: ${errText}`);
  }

  const json = await res.json();
  return json?.data?.deposit ?? 0;
}

/**
 * Tarik Daftar Harga & Produk dari Digiflazz
 */
export async function getDigiflazzPriceList(cmd: "prepaid" | "pasca" = "prepaid") {
  const { username, apiKey } = getConfig();
  const sign = md5(username + apiKey + "pricelist");

  const target = getEndpoint("/v1/price-list");
  const res = await fetch(target.url, {
    method: "POST",
    headers: target.headers,
    body: JSON.stringify({
      cmd,
      username,
      sign,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Digiflazz HTTP ${res.status}: ${errText}`);
  }

  const json = await res.json();
  return (json?.data || []) as any[];
}

/**
 * Eksekusi Transaksi Top Up Game / PPOB ke Digiflazz
 */
export async function createDigiflazzTransaction(
  payload: DigiflazzTransactionPayload
): Promise<DigiflazzTransactionResponse> {
  const { username, apiKey, mode } = getConfig();
  const sign = md5(username + apiKey + payload.refId);

  const requestBody = {
    username,
    buyer_sku_code: payload.buyerSkuCode,
    customer_no: payload.customerNo,
    ref_id: payload.refId,
    sign,
    testing: payload.testing ?? (mode === "development"),
  };

  console.log(
    `[Digiflazz] Mengirim transaksi ref: ${payload.refId}, SKU: ${payload.buyerSkuCode}, Target: ${payload.customerNo}, Testing: ${requestBody.testing}`
  );

  const target = getEndpoint("/v1/transaction");
  const res = await fetch(target.url, {
    method: "POST",
    headers: target.headers,
    body: JSON.stringify(requestBody),
  });

  const json = await res.json();
  const data = json?.data;

  if (!res.ok || !data) {
    console.error("[Digiflazz] Error response:", json);
    return {
      success: false,
      refId: payload.refId,
      status: "FAILED",
      message: data?.message || json?.message || "Koneksi ke Digiflazz gagal",
      raw: json,
    };
  }

  // Digiflazz status: Sukses, Pending, Gagal
  const rawStatus = (data.status || "").toLowerCase();
  let normalizedStatus: "SUCCESS" | "PENDING" | "FAILED" = "PENDING";

  if (rawStatus === "sukses") {
    normalizedStatus = "SUCCESS";
  } else if (rawStatus === "gagal") {
    normalizedStatus = "FAILED";
  } else {
    normalizedStatus = "PENDING";
  }

  return {
    success: normalizedStatus === "SUCCESS",
    refId: data.ref_id || payload.refId,
    status: normalizedStatus,
    sn: data.sn || undefined,
    message: data.message,
    price: data.price,
    buyerLastSaldo: data.buyer_last_saldo,
    raw: data,
  };
}
