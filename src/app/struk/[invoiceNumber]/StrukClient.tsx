"use client";

import { useEffect } from "react";

interface Order {
  id: string;
  invoiceNumber: string;
  targetUserId: string;
  targetZoneId: string | null;
  customerEmail: string;
  customerPhone: string | null;
  basePrice: number;
  uniqueCode: number;
  fee: number;
  totalAmount: number;
  status: string;
  paidAt: Date | null;
  createdAt: Date;
  notes?: string | null;
  product: {
    name: string;
    slug: string;
    categorySlug: string;
    developer: string | null;
    thumbnailUrl: string;
  };
  productItem: {
    name: string;
  };
}

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: Date | string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  }) + " WIB";
}

export default function StrukClient({ order }: { order: Order }) {
  const isSuccess = order.status === "SUCCESS" || order.status === "PAID";
  const paymentMethod = "QRIS Real-time";

  // Parse SN dari notes
  let sn: string | null = null;
  if (order.notes) {
    // Format notes bisa: "SN: xxx" atau "Nawii. Refid: xxx..."
    const snMatch = order.notes.match(/SN:\s*(.+?)(?:\n|$)/i);
    if (snMatch) {
      sn = snMatch[1].trim();
    } else {
      sn = order.notes.trim();
    }
  }

  useEffect(() => {
    // Auto-print on load kalau ada query ?print=1
    if (typeof window !== "undefined" && window.location.search.includes("print=1")) {
      setTimeout(() => window.print(), 500);
    }
  }, []);

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; }
          .struk-container { box-shadow: none !important; border: 1px solid #000 !important; max-width: 100% !important; }
        }
        @page {
          size: A5;
          margin: 10mm;
        }
      `}</style>
      <div style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "24px 16px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
      }}>
        {/* Print Button */}
        <div className="no-print" style={{ marginBottom: 20, display: "flex", gap: 12 }}>
          <button
            onClick={() => window.print()}
            style={{
              background: "#ffd731",
              color: "#000",
              border: "2px solid #000",
              borderRadius: 10,
              padding: "10px 24px",
              fontWeight: 900,
              fontSize: 14,
              cursor: "pointer",
              boxShadow: "3px 3px 0 #000",
            }}
          >
            🖨️ Cetak / Simpan PDF
          </button>
          <a
            href={`/transaksi/${order.invoiceNumber}`}
            style={{
              background: "#181824",
              color: "#fff",
              border: "2px solid #000",
              borderRadius: 10,
              padding: "10px 24px",
              fontWeight: 900,
              fontSize: 14,
              cursor: "pointer",
              boxShadow: "3px 3px 0 #000",
              textDecoration: "none",
            }}
          >
            ← Kembali ke Transaksi
          </a>
        </div>

        {/* Struk */}
        <div className="struk-container" style={{
          background: "#fff",
          border: "2px solid #000",
          borderRadius: 16,
          maxWidth: 500,
          width: "100%",
          boxShadow: "6px 6px 0 #000",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            background: "#ffd731",
            padding: "18px 24px",
            borderBottom: "2px solid #000",
          }}>
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: 2, textTransform: "uppercase", color: "#7c6000" }}>
              XYZPEDIA · Struk Pembelian Resmi
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#000", marginTop: 4 }}>
              {isSuccess ? "✅ LUNAS & TERVERIFIKASI" : "⏳ " + order.status}
            </div>
            <div style={{ fontSize: 11, color: "#7c6000", marginTop: 4 }}>
              Invoice #{order.invoiceNumber}
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: "20px 24px" }}>
            {/* SN Box */}
            {isSuccess && sn && (
              <div style={{
                background: "#0f172a",
                color: "#55db9c",
                border: "2px solid #000",
                borderRadius: 10,
                padding: "14px 16px",
                marginBottom: 20,
                fontFamily: "monospace",
              }}>
                <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: 1.5, textTransform: "uppercase", color: "#94a3b8", marginBottom: 6 }}>
                  📦 Serial Number / Bukti Pengiriman Server
                </div>
                <div style={{ fontSize: 12, wordBreak: "break-all", lineHeight: 1.6 }}>
                  {sn}
                </div>
              </div>
            )}

            {/* Detail rows */}
            {[
              { label: "Layanan & Varian", value: `${order.product.name} — ${order.productItem.name}` },
              { label: "ID Akun / Server Tujuan", value: `${order.targetUserId}${order.targetZoneId ? ` (${order.targetZoneId})` : ""}` },
              { label: "Metode Pembayaran", value: paymentMethod },
              { label: "Tanggal Pembelian", value: formatDate(order.paidAt || order.createdAt) },
              { label: "Total Pembayaran", value: formatRupiah(order.totalAmount), highlight: true },
            ].map((row, i) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                borderBottom: "1px dashed #e2e8f0",
                paddingBottom: 10,
                marginBottom: 10,
                gap: 12,
              }}>
                <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700, flexShrink: 0 }}>
                  {row.label}:
                </span>
                <span style={{
                  fontSize: 12,
                  fontWeight: 900,
                  color: row.highlight ? "#16a34a" : "#1e293b",
                  textAlign: "right",
                }}>
                  {row.value}
                </span>
              </div>
            ))}

            {/* Customer phone */}
            {(order.customerPhone || order.customerEmail) && (
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                borderBottom: "1px dashed #e2e8f0",
                paddingBottom: 10,
                marginBottom: 10,
                gap: 12,
              }}>
                <span style={{ fontSize: 11, color: "#64748b", fontWeight: 700, flexShrink: 0 }}>
                  Kontak Pembeli:
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", textAlign: "right" }}>
                  {order.customerPhone || order.customerEmail}
                </span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            background: "#0f172a",
            padding: "16px 24px",
            textAlign: "center",
            borderTop: "2px solid #000",
          }}>
            <div style={{ color: "#94a3b8", fontSize: 10, fontWeight: 700, marginBottom: 6 }}>
              Simpan struk ini sebagai bukti pembelian Anda
            </div>
            <div style={{ color: "#ffd731", fontSize: 11, fontWeight: 900 }}>
              xyzpedia.vercel.app
            </div>
            <div style={{ color: "#64748b", fontSize: 10, marginTop: 4 }}>
              CS WhatsApp: +62 896-4666-1132
            </div>
            <div style={{ color: "#334155", fontSize: 9, marginTop: 8 }}>
              Dokumen ini diterbitkan secara digital oleh XYZPEDIA sebagai tanda bukti transaksi yang sah.
            </div>
          </div>
        </div>

        {/* Print tip */}
        <div className="no-print" style={{
          marginTop: 16,
          fontSize: 12,
          color: "#64748b",
          textAlign: "center",
          maxWidth: 400,
        }}>
          💡 Tip: Klik &quot;Cetak / Simpan PDF&quot; → pilih &quot;Save as PDF&quot; di dialog print browser untuk menyimpan struk dalam format PDF.
        </div>
      </div>
    </>
  );
}
