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
    if (name.includes("membership") || name.includes("pass") || name.includes("bp card")) {
      return "Membership & Pass";
    }
    if (name.includes("diamond")) {
      return "Diamond";
    }
    return "Lainnya";
  }

  // 2. Mobile Legends
  if (productSlug === "mobile-legends") {
    if (name.includes("pass") || name.includes("bundle") || name.includes("twilight") || name.includes("coupon")) {
      return "Pass & Bundle";
    }
    if (name.includes("diamond")) {
      return "Diamond";
    }
    return "Lainnya";
  }

  // 3. Honor of Kings
  if (productSlug === "honor-of-kings") {
    if (name.includes("card") || name.includes("pass")) {
      return "Weekly Card";
    }
    if (name.includes("token")) {
      return "Tokens";
    }
    return "Lainnya";
  }

  // 4. Arena Breakout
  if (productSlug === "arena-breakout") {
    if (name.includes("bond")) {
      return "Bonds";
    }
    return "Pass & Paket";
  }

  // 5. Delta Force Mobile
  if (productSlug === "delta-force-mobile") {
    if (name.includes("coin")) {
      return "Delta Coins";
    }
    return "Supplies & Pass";
  }

  // 6. Magic Chess: Go Go
  if (productSlug === "magic-chess-go-go") {
    if (name.includes("card") || name.includes("pass")) {
      return "Weekly Card";
    }
    if (name.includes("diamond")) {
      return "Diamonds";
    }
    return "Lainnya";
  }

  // 7. PUBG Mobile
  if (productSlug === "pubg-mobile") {
    if (name.includes("global")) {
      return "PUBG Global";
    }
    if (name.includes("uc")) {
      return "PUBG Indo";
    }
    return "Lainnya";
  }

  // 8. Vidio Voucher
  if (productSlug === "vidio-voucher") {
    if (name.includes("diamond")) return "Diamond";
    if (name.includes("ultimate")) return "Ultimate";
    if (name.includes("platinum")) return "Platinum";
    return "Lainnya";
  }

  // 9. E-Wallet Multi-Types (GoPay, GrabPay, LinkAja)
  if (productSlug.includes("gopay")) {
    if (name.includes("customer")) return "Gopay Customer";
    if (name.includes("pengemudi") || name.includes("driver")) return "Gopay Pengemudi";
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

  // 10. Generic Fallback for other games or services
  if (name.includes("membership") || name.includes("pass") || name.includes("bundle") || name.includes("weekly card")) {
    return "Membership & Pass";
  }
  if (name.includes("diamond")) return "Diamond";
  if (name.includes("token")) return "Tokens";
  if (name.includes("coin")) return "Coins";
  if (name.includes("gold")) return "Gold";
  if (name.includes("cash") || name.includes("pb cash")) return "Cash";
  if (name.includes("point")) return "Points";

  return "Umum";
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
    "GoPay",
    "Gopay Customer",
    "Gopay Pengemudi",
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
    "PUBG Global",
    "Platinum",
    "Ultimate",
    "Cash",
    "Gold",
    "Coins",
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
