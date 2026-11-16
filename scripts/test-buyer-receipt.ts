import { dispatchNotificationEvent } from "../src/lib/notifications";

async function main() {
  console.log("Testing dispatchNotificationEvent with buyer email and SN...");
  const res = await dispatchNotificationEvent("notifySuccessOrder", {
    invoice: "INV-XYZ-20261116-5571",
    productName: "Magic Chess: Go Go",
    variantName: "Magic Chess Go Go 5 Diamonds",
    targetUser: "102260584 (4082)",
    totalAmount: 1872,
    profit: 272,
    paymentMethod: "QRIS Real-time",
    deliveryType: "INSTANT",
    customerPhone: "089646661132",
    customerEmail: "ramadhn139@gmail.com",
    sn: "Nawii. Refid: 49307976 Successful Purchase. 17 November 2026 02:51:46.",
    supplierRef: "WEBWRG196835022734",
  });
  console.log("Dispatch result:", res);
}

main().catch(console.error);
