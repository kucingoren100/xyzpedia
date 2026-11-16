import { WaroengkuyClient } from "../src/lib/waroengkuy";

async function main() {
  const apiKey = process.env.WAROENGKUY_API_KEY || "wrk_15f6505ecd7be057da1448373998d9fb39b7d24a";
  const baseUrl = "https://waroengkuy.com/api/reseller/v1";

  console.log("Testing Waroengkuy API with key:", apiKey.slice(0, 8) + "...");

  const endpoints = [
    "/profile",
    "/user",
    "/me",
    "/orders",
    "/ppob/orders",
    "/transactions",
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(`${baseUrl}${ep}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
      });
      const text = await res.text();
      console.log(`Endpoint ${ep}: HTTP ${res.status}`, text.slice(0, 150));
    } catch (e: any) {
      console.log(`Endpoint ${ep} error:`, e.message);
    }
  }
}

main();
