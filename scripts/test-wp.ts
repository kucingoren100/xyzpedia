import { WaroengPayClient } from "../src/lib/waroengpay";

async function main() {
  const apiKey = process.env.WAROENGPAY_API_KEY;
  const baseUrl = (process.env.WAROENGPAY_BASE_URL || "https://waroengpay.com").replace(/\/$/, "");
  console.log("Using apiKey:", apiKey?.slice(0, 10) + "...", "Base:", baseUrl);

  // Test checkStatus function logic
  const invoice = "INV-XYZ-20261116-5571";
  const url = invoice.startsWith("WRG-")
    ? `${baseUrl}/api/payments/${encodeURIComponent(invoice)}`
    : `${baseUrl}/api/payments?reference=${encodeURIComponent(invoice)}`;
  
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}`, Accept: "application/json" }
  });
  const json = await res.json();
  const payment = Array.isArray(json.data) ? json.data[0] : (json.data || json);
  console.log("Found payment:", {
    id: payment?.id,
    ref: payment?.reference,
    status: payment?.status,
    amount: payment?.amount
  });
}

main().catch(console.error);
