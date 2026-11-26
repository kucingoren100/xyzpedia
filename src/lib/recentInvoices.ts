export interface RecentInvoiceEntry {
  invoiceNumber: string;
  productName?: string;
  itemName?: string;
  totalAmount?: number;
  savedAt: string;
}

const STORAGE_KEY = "xyzpedia_recent_invoices";
const MAX_ENTRIES = 5;

export function getRecentInvoices(): RecentInvoiceEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => x && typeof x.invoiceNumber === "string");
  } catch {
    return [];
  }
}

export function saveRecentInvoice(entry: Omit<RecentInvoiceEntry, "savedAt">) {
  if (typeof window === "undefined" || !entry.invoiceNumber) return;
  try {
    const existing = getRecentInvoices().filter(
      (x) => x.invoiceNumber !== entry.invoiceNumber
    );
    const updated: RecentInvoiceEntry[] = [
      { ...entry, savedAt: new Date().toISOString() },
      ...existing,
    ].slice(0, MAX_ENTRIES);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota or privacy mode errors
  }
}

export function removeRecentInvoice(invoiceNumber: string) {
  if (typeof window === "undefined") return;
  try {
    const filtered = getRecentInvoices().filter(
      (x) => x.invoiceNumber !== invoiceNumber
    );
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch {
    // Ignore
  }
}

export function clearRecentInvoices() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}
