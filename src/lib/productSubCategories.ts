/**
 * Helper to classify product items into distinct sub-categories (tabs/filters)
 * e.g. Free Fire: "Diamond" vs "Membership & Pass"
 * Mobile Legends: "Diamond" vs "Pass & Bundle"
 * Honor of Kings: "Tokens" vs "Weekly Card"
 */

export function getItemSubCategory(itemName: string, productSlug: string): string {
  const name = itemName.toLowerCase();

  // 1. Free Fire
  if (productSlug === "free-fire") {
    if (
      name.includes("first recharge") ||
      name.includes("first charge") ||
      name.includes("first")
    ) {
      return "First Recharge";
    }
    if (
      name.includes("membership") ||
      name.includes("pass") ||
      name.includes("bp card") ||
      name.includes("level up") ||
      name.includes("weekly") ||
      name.includes("monthly")
    ) {
      return "Membership & Pass";
    }
    if (name.includes("diamond")) {
      return "Diamond";
    }
    return "Diamond";
  }

  // 2. Mobile Legends
  if (productSlug === "mobile-legends") {
    if (
      name.includes("first recharge") ||
      name.includes("first charge") ||
      name.includes("first")
    ) {
      return "First Recharge";
    }
    if (
      name.includes("pass") ||
      name.includes("bundle") ||
      name.includes("twilight") ||
      name.includes("coupon") ||
      name.includes("wdp") ||
      name.includes("weekly") ||
      name.includes("starlight")
    ) {
      return "Pass & Bundle";
    }
    if (name.includes("diamond") || /\d+\s*diamond/i.test(name)) {
      return "Diamond";
    }
    return "Diamond";
  }

  // 3. Honor of Kings
  if (productSlug === "honor-of-kings") {
    if (
      name.includes("first recharge") ||
      name.includes("first charge") ||
      name.includes("first")
    ) {
      return "First Recharge";
    }
    if (name.includes("card") || name.includes("pass") || name.includes("weekly")) {
      return "Weekly Card";
    }
    if (name.includes("token")) {
      return "Tokens";
    }
    return "Tokens";
  }

  // 4. Arena Breakout
  if (productSlug === "arena-breakout") {
    if (
      name.includes("first recharge") ||
      name.includes("first charge") ||
      name.includes("first")
    ) {
      return "First Recharge";
    }
    if (name.includes("pass") || name.includes("paket") || name.includes("bundle")) {
      return "Pass & Paket";
    }
    if (name.includes("bond")) {
      return "Bonds";
    }
    return "Bonds";
  }

  // 5. Delta Force Mobile
  if (productSlug === "delta-force-mobile") {
    if (
      name.includes("first recharge") ||
      name.includes("first charge") ||
      name.includes("first")
    ) {
      return "First Recharge";
    }
    if (name.includes("pass") || name.includes("supply") || name.includes("supplies")) {
      return "Supplies & Pass";
    }
    if (name.includes("coin")) {
      return "Delta Coins";
    }
    return "Delta Coins";
  }

  // 6. Magic Chess: Go Go
  if (productSlug === "magic-chess-go-go") {
    if (
      name.includes("first recharge") ||
      name.includes("first charge") ||
      name.includes("first")
    ) {
      return "First Recharge";
    }
    if (name.includes("card") || name.includes("pass") || name.includes("weekly")) {
      return "Weekly Card";
    }
    if (name.includes("diamond")) {
      return "Diamonds";
    }
    return "Diamonds";
  }

  // 7. PUBG Mobile
  if (productSlug === "pubg-mobile") {
    if (
      name.includes("first recharge") ||
      name.includes("first charge") ||
      name.includes("first")
    ) {
      return "First Recharge";
    }
    if (name.includes("global")) {
      return "PUBG Global";
    }
    if (name.includes("pass") || name.includes("royale") || name.includes("rp")) {
      return "Royale Pass";
    }
    if (name.includes("uc")) {
      return "UC Reguler";
    }
    return "UC Reguler";
  }

  // 8. Blood Strike
  if (productSlug === "blood-strike") {
    if (
      name.includes("first recharge") ||
      name.includes("first charge") ||
      name.includes("first")
    ) {
      return "First Recharge";
    }
    if (name.includes("pass") || name.includes("strike pass")) return "Strike Pass";
    return "Gold";
  }

  // 9. Call of Duty Mobile
  if (productSlug === "call-of-duty-mobile") {
    if (
      name.includes("first recharge") ||
      name.includes("first charge") ||
      name.includes("first")
    ) {
      return "First Recharge";
    }
    if (name.includes("pass") || name.includes("battle pass") || name.includes("bp")) return "Battle Pass";
    return "CP";
  }

  // 10. Point Blank Zepetto
  if (productSlug === "point-blank") {
    if (
      name.includes("first recharge") ||
      name.includes("first charge") ||
      name.includes("first")
    ) {
      return "First Recharge";
    }
    if (name.includes("pass") || name.includes("ticket") || name.includes("item")) {
      return "Pass & Item";
    }
    return "PB Cash";
  }

  // 11. Arena of Valor
  if (productSlug === "arena-of-valor") {
    if (
      name.includes("first recharge") ||
      name.includes("first charge") ||
      name.includes("first")
    ) {
      return "First Recharge";
    }
    if (name.includes("pass") || name.includes("codex")) {
      return "Pass & Codex";
    }
    return "Vouchers";
  }

  // 12. Vidio Voucher
  if (productSlug === "vidio-voucher") {
    if (name.includes("diamond")) return "Diamond";
    if (name.includes("ultimate")) return "Ultimate";
    if (name.includes("platinum")) return "Platinum";
    return "Reguler";
  }

  // 13. Pulsa Operators (Telkomsel, Indosat, XL, Axis, Tri, Smartfren, by.U)
  if (productSlug.startsWith("pulsa-")) {
    if (name.includes("data") || name.includes("kuota") || name.includes("gb")) {
      return "Paket Data";
    }
    if (name.includes("masa aktif") || name.includes("hari") && !name.includes("000")) {
      return "Masa Aktif";
    }
    return "Pulsa Reguler";
  }

  // 14. E-Wallet Multi-Types (GoPay, GrabPay, LinkAja, DANA, OVO, ShopeePay)
  if (productSlug.includes("gopay")) {
    if (name.includes("customer")) return "GoPay Customer";
    if (name.includes("pengemudi") || name.includes("driver")) return "GoPay Driver";
    return "GoPay";
  }
  if (productSlug.includes("grab")) {
    if (name.includes("driver") || name.includes("pengemudi")) return "GrabPay Driver";
    return "GrabPay Penumpang";
  }
  if (productSlug.includes("linkaja")) {
    if (name.includes("entitas")) return "LinkAja Entitas";
    return "LinkAja Reguler";
  }

  // 15. Akun Premium multi-device or multi-duration
  if (name.includes("semiprivat") || name.includes("semiprivate")) {
    return "Akun Semi-Privat";
  }
  if (name.includes("sendiri") || name.includes("private") || name.includes("privat") || name.includes("invite")) {
    return "Akun Private";
  }
  if (name.includes("sharing") || name.includes("toko") || name.includes("1p1u") || name.includes("1u1p") || name.includes("1p2u") || name.includes("profil")) {
    return "Akun Sharing";
  }

  // 16. Generic Fallback
  if (
    name.includes("first recharge") ||
    name.includes("first charge") ||
    name.includes("first topup") ||
    name.includes("first purchase")
  ) {
    return "First Recharge";
  }
  if (
    name.includes("membership") ||
    name.includes("pass") ||
    name.includes("bundle") ||
    name.includes("weekly card") ||
    name.includes("battle pass") ||
    name.includes("royale pass")
  ) {
    return "Membership & Pass";
  }
  if (name.includes("diamond")) return "Diamond";
  if (name.includes("token")) return "Tokens";
  if (name.includes("coin")) return "Coins";
  if (name.includes("gold")) return "Gold";
  if (name.includes("cash") || name.includes("pb cash")) return "Cash";
  if (name.includes("point")) return "Points";

  return "Nominal Reguler";
}

/**
 * Returns the list of distinct subcategories for a given product's items.
 * If there is only 1 subcategory (or none), returns empty array `[]` (no tabs needed).
 */
export function getProductSubCategories(items: { name: string }[], productSlug: string): string[] {
  const set = new Set<string>();
  for (const item of items) {
    set.add(getItemSubCategory(item.name, productSlug));
  }
  const arr = Array.from(set);

  // If all items belong to 1 single type, don't show tabs
  if (arr.length <= 1) return [];

  // Sort with primary currency first, then passes/bundles
  const primaryKeys = [
    "Pulsa Reguler",
    "Paket Data",
    "Masa Aktif",
    "GoPay",
    "GoPay Customer",
    "GoPay Driver",
    "GrabPay Penumpang",
    "GrabPay Driver",
    "LinkAja Reguler",
    "LinkAja Entitas",
    "Diamond",
    "Diamonds",
    "Tokens",
    "Bonds",
    "Delta Coins",
    "PUBG Indo",
    "UC Reguler",
    "PUBG Global",
    "Gold",
    "CP",
    "PB Cash",
    "Cash",
    "Vouchers",
    "First Recharge",
    "Akun Sharing",
    "Akun Semi-Privat",
    "Akun Private",
    "Platinum",
    "Ultimate",
    "Membership & Pass",
    "Pass & Bundle",
    "Weekly Card",
    "Supplies & Pass",
    "Pass & Paket",
    "Pass & Codex",
    "Pass & Item",
    "Royale Pass",
    "Strike Pass",
    "Battle Pass",
  ];

  return arr.sort((a, b) => {
    const aIndex = primaryKeys.indexOf(a);
    const bIndex = primaryKeys.indexOf(b);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.localeCompare(b);
  });
}
