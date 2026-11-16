/**
 * Helper to determine if a product has zero available stock
 */
export function isProductOutOfStock(product: {
  items?: { stockStatus?: string }[] | null;
}): boolean {
  const items = product.items || [];
  if (items.length === 0) return true;
  const availableItems = items.filter(
    (i) => !i.stockStatus || i.stockStatus === "AVAILABLE"
  );
  return availableItems.length === 0;
}

/**
 * Sorts products so that available products appear first,
 * and out-of-stock / unavailable products appear at the bottom / end of the list.
 */
export function sortProductsByAvailability<
  T extends { name?: string; items?: { stockStatus?: string }[] | null }
>(products: T[]): T[] {
  return [...products].sort((a, b) => {
    const aOut = isProductOutOfStock(a) ? 1 : 0;
    const bOut = isProductOutOfStock(b) ? 1 : 0;
    if (aOut !== bOut) return aOut - bOut;
    return (a.name || "").localeCompare(b.name || "", "id");
  });
}
