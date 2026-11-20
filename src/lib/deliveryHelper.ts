// src/lib/deliveryHelper.ts

/**
 * Helper to parse supplier notes structured format:
 * Format typically: "... | Status: <STATUS> | SN: <sn_text>"
 * or "SN: <sn_text>"
 */
export function parseSupplierDelivery(notes?: string | null): {
  supplierStatus: string | null;
  sn: string | null;
} {
  if (!notes) return { supplierStatus: null, sn: null };

  let supplierStatus: string | null = null;
  let sn: string | null = null;

  // Extract Status
  const statusMatch = notes.match(/Status:\s*([A-Z0-9_-]+)/i);
  if (statusMatch) {
    supplierStatus = statusMatch[1].trim().toUpperCase();
  }

  // Extract SN
  const snMatch = notes.match(/SN:\s*([^\n|]+)/i);
  if (snMatch) {
    sn = snMatch[1].trim();
  }

  return { supplierStatus, sn };
}
