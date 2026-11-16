import { WaroengPayClient } from "../src/lib/waroengpay";

async function main() {
  const wp = new WaroengPayClient();
  const invoice = "INV-XYZ-20261116-7060";
  console.log("Checking status for:", invoice);
  try {
    const res = await wp.checkStatus(invoice);
    console.log("Response:", JSON.stringify(res, null, 2));
  } catch (err: any) {
    console.error("Error checking status:", err.message || err);
  }
}

main();
