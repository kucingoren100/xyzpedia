"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";

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
  fulfilledAt?: Date | null;
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
  return "Rp " + amount.toLocaleString("id-ID");
}

function formatDate(date: Date | string | null) {
  if (!date) return "-";
  return (
    new Date(date).toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    }) + " WIB"
  );
}

export default function StrukClient({
  order,
  initialNickname,
}: {
  order: Order;
  initialNickname?: string | null;
}) {
  const isSuccess = order.status === "SUCCESS" || order.status === "PAID";
  const paymentMethod = "QRIS Real-time";

  // Parse SN and Nickname from notes or SN string
  const { sn, nickname } = useMemo(() => {
    let rawSn: string | null = null;
    let rawNick: string | null = initialNickname || null;

    if (order.notes) {
      // 1. Extract SN from notes
      const snMatch = order.notes.match(/SN:\s*(.+?)(?:\s*\||\n|$)/i);
      if (snMatch) {
        rawSn = snMatch[1].trim();
      } else if (!order.notes.startsWith("Settled via") && !order.notes.startsWith("Pembayaran terverifikasi")) {
        rawSn = order.notes.trim();
      }
    }

    // 2. Extract Nickname from SN string
    // Format Waroengkuy PPOB: "Nawii. Refid: 49307976 Successful Purchase..."
    if (rawSn) {
      const nickMatch = rawSn.match(/^([^\.\n]+)\.\s*Refid/i);
      if (nickMatch) {
        rawNick = nickMatch[1].trim();
      }
    }

    return {
      sn: rawSn,
      nickname: rawNick,
    };
  }, [order.notes]);

  // Clean item name (e.g. if item name repeats product name)
  const cleanItemName = useMemo(() => {
    const iName = order.productItem.name;
    // e.g. "Magic Chess Go Go 5 Diamonds" -> "5 Diamonds"
    const cleaned = iName
      .replace(new RegExp(order.product.name, "gi"), "")
      .replace(/magic chess\s*go\s*go/gi, "")
      .replace(/^[-—:\s]+/, "")
      .trim();
    return cleaned || iName;
  }, [order.product.name, order.productItem.name]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("print=1")) {
      setTimeout(() => window.print(), 400);
    }
  }, []);

  return (
    <>
      {/* Dedicated Print & PDF CSS */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 15mm;
          }
          body, html {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .struk-page {
            background: #ffffff !important;
            padding: 0 !important;
            min-height: auto !important;
          }
          .struk-card {
            box-shadow: none !important;
            border: 2px solid #000000 !important;
            border-radius: 12px !important;
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 auto !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      <div
        className="struk-page"
        style={{
          minHeight: "100vh",
          background: "#f1f5f9",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "32px 16px",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          color: "#0f172a",
        }}
      >
        {/* Top Control Bar (Hidden in Print) */}
        <div
          className="no-print"
          style={{
            maxWidth: 620,
            width: "100%",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <Link
            href={`/transaksi/${order.invoiceNumber}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#ffffff",
              color: "#0f172a",
              border: "2px solid #000000",
              borderRadius: 10,
              padding: "10px 18px",
              fontWeight: 800,
              fontSize: 13,
              textDecoration: "none",
              boxShadow: "3px 3px 0 #000",
              cursor: "pointer",
            }}
          >
            <ArrowLeft style={{ width: 16, height: 16 }} />
            Kembali ke Detail Pesanan
          </Link>

          <button
            onClick={() => window.print()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "#ffd731",
              color: "#000000",
              border: "2px solid #000000",
              borderRadius: 10,
              padding: "10px 22px",
              fontWeight: 900,
              fontSize: 14,
              cursor: "pointer",
              boxShadow: "3px 3px 0 #000",
            }}
          >
            <Printer style={{ width: 16, height: 16 }} />
            Cetak / Simpan PDF
          </button>
        </div>

        {/* Official Printable Receipt Card */}
        <div
          className="struk-card"
          style={{
            background: "#ffffff",
            border: "2.5px solid #000000",
            borderRadius: 18,
            maxWidth: 620,
            width: "100%",
            boxShadow: "6px 6px 0px #000000",
            overflow: "hidden",
            color: "#0f172a",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "#ffd731",
              padding: "20px 26px",
              borderBottom: "2.5px solid #000000",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  color: "#000000",
                  opacity: 0.85,
                  marginBottom: 2,
                }}
              >
                XYZPEDIA OFFICIAL RECEIPT
              </div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 950,
                  color: "#000000",
                  letterSpacing: -0.5,
                }}
              >
                XYZPEDIA
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#000000", marginTop: 2 }}>
                Bukti Pembayaran & Pengiriman Resmi
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  display: "inline-block",
                  background: isSuccess ? "#16a34a" : "#ca8a04",
                  color: "#ffffff",
                  fontSize: 11,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  padding: "6px 14px",
                  borderRadius: 999,
                  border: "2px solid #000000",
                  letterSpacing: 0.5,
                }}
              >
                {isSuccess ? "✓ STATUS: SUCCESS" : `STATUS: ${order.status}`}
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#000000",
                  marginTop: 6,
                  fontFamily: "monospace",
                }}
              >
                {order.invoiceNumber}
              </div>
            </div>
          </div>

          {/* Verification Subheader */}
          <div
            style={{
              background: isSuccess ? "#ecfdf5" : "#fefce8",
              padding: "10px 26px",
              borderBottom: "1.5px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: 11,
              fontWeight: 700,
              color: isSuccess ? "#065f46" : "#854d0e",
            }}
          >
            <span>
              {isSuccess
                ? "Pesanan Lunas & Berhasil Terinjeksi ke Akun"
                : "Menunggu Penyelesaian Pembayaran"}
            </span>
            <span>{formatDate(order.paidAt || order.fulfilledAt || order.createdAt)}</span>
          </div>

          {/* Body Information */}
          <div style={{ padding: "24px 26px" }}>
            {/* 1. Primary Order Specifications Table */}
            <div
              style={{
                border: "2px solid #000000",
                borderRadius: 12,
                overflow: "hidden",
                marginBottom: 18,
                background: "#fafafa",
              }}
            >
              {[
                {
                  label: "Nomor Invoice",
                  value: order.invoiceNumber,
                  isMono: true,
                  isBold: true,
                },
                {
                  label: "Layanan",
                  value: `${order.product.name} (${cleanItemName})`,
                  isBold: true,
                },
                {
                  label: "ID & Server",
                  value: `${order.targetUserId}${order.targetZoneId ? ` (${order.targetZoneId})` : ""}`,
                  isBold: true,
                  isMono: true,
                },
                {
                  label: "Nickname",
                  value: nickname || "-",
                  isBold: true,
                  highlight: Boolean(nickname),
                },
                {
                  label: "Status Order di Database",
                  value: order.status,
                  badge: order.status === "SUCCESS" ? "SUCCESS (Lunas & Berhasil)" : order.status,
                },
                {
                  label: "Metode Pembayaran",
                  value: paymentMethod,
                },
              ].map((row, idx, arr) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 14px",
                    borderBottom: idx < arr.length - 1 ? "1px solid #e5e7eb" : "none",
                    background: idx % 2 === 0 ? "#ffffff" : "#fbfbfb",
                    fontSize: 12,
                  }}
                >
                  <span
                    style={{
                      color: "#64748b",
                      fontWeight: 700,
                      width: "38%",
                      flexShrink: 0,
                    }}
                  >
                    {row.label}:
                  </span>
                  <span
                    style={{
                      textAlign: "right",
                      fontWeight: row.isBold ? 900 : 700,
                      color: row.highlight ? "#ea580c" : "#0f172a",
                      fontFamily: row.isMono ? "monospace" : "inherit",
                    }}
                  >
                    {row.badge ? (
                      <span
                        style={{
                          background: "#dcfce7",
                          color: "#15803d",
                          padding: "2px 8px",
                          borderRadius: 6,
                          fontWeight: 900,
                          fontSize: 11,
                          border: "1px solid #86efac",
                        }}
                      >
                        {row.badge}
                      </span>
                    ) : (
                      row.value
                    )}
                  </span>
                </div>
              ))}
            </div>

            {/* 2. Serial Number (SN) / Bukti Pengiriman Box */}
            <div
              style={{
                background: "#0f172a",
                color: "#ffffff",
                border: "2px solid #000000",
                borderRadius: 12,
                padding: "14px 16px",
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 900,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  color: "#38bdf8",
                  marginBottom: 6,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span>📦 Serial Number (SN) / Bukti Pengiriman Server</span>
              </div>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#4ade80",
                  wordBreak: "break-all",
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.5,
                  background: "#1e293b",
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "1px solid #334155",
                }}
              >
                {sn || (isSuccess ? "Berhasil dikirim dan diverifikasi server publisher" : "Menunggu pembayaran")}
              </div>
            </div>

            {/* 3. Financial Summary */}
            <div
              style={{
                border: "2px solid #000000",
                borderRadius: 12,
                padding: "14px 16px",
                background: "#ffffff",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#64748b",
                  marginBottom: 6,
                }}
              >
                <span>Harga Produk:</span>
                <span style={{ color: "#0f172a" }}>{formatRupiah(order.basePrice)}</span>
              </div>

              {order.uniqueCode > 0 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#64748b",
                    marginBottom: 6,
                  }}
                >
                  <span>Kode Unik Verifikasi:</span>
                  <span style={{ color: "#0f172a" }}>+{formatRupiah(order.uniqueCode)}</span>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#64748b",
                  marginBottom: 10,
                }}
              >
                <span>Biaya Layanan:</span>
                <span style={{ color: "#16a34a", fontWeight: 800 }}>Rp 0 (GRATIS)</span>
              </div>

              <div
                style={{
                  borderTop: "2px dashed #000000",
                  paddingTop: 10,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 900, color: "#000000" }}>
                  TOTAL PEMBAYARAN:
                </span>
                <span
                  style={{
                    fontSize: 18,
                    fontWeight: 950,
                    color: "#16a34a",
                    fontFamily: "monospace",
                  }}
                >
                  {formatRupiah(order.totalAmount)}
                </span>
              </div>
            </div>

            {/* 4. Customer Contact Note */}
            {(order.customerEmail || order.customerPhone) && (
              <div
                style={{
                  fontSize: 11,
                  color: "#64748b",
                  fontWeight: 700,
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0 4px",
                }}
              >
                <span>Email / Kontak Pembeli:</span>
                <span style={{ color: "#0f172a", fontWeight: 800 }}>
                  {[order.customerEmail, order.customerPhone].filter(Boolean).join(" • ")}
                </span>
              </div>
            )}
          </div>

          {/* Official Footer */}
          <div
            style={{
              background: "#0f172a",
              color: "#94a3b8",
              padding: "16px 26px",
              borderTop: "2.5px solid #000000",
              textAlign: "center",
              fontSize: 10,
              lineHeight: 1.6,
            }}
          >
            <div style={{ color: "#ffd731", fontWeight: 900, fontSize: 11, marginBottom: 4 }}>
              XYZPEDIA · Direct Fulfillment Engine
            </div>
            <div>
              Dokumen ini diterbitkan secara digital oleh sistem XYZPEDIA sebagai tanda bukti pembayaran
              dan pengiriman resmi yang sah.
            </div>
            <div style={{ marginTop: 6, color: "#cbd5e1", fontWeight: 700 }}>
              Website: <span style={{ color: "#38bdf8" }}>https://xyzpedia.vercel.app</span> · WhatsApp CS:{" "}
              <span style={{ color: "#4ade80" }}>+62 896-4666-1132</span>
            </div>
          </div>
        </div>

        {/* Print instructions tip (Hidden in print) */}
        <div
          className="no-print"
          style={{
            marginTop: 16,
            fontSize: 12,
            color: "#64748b",
            textAlign: "center",
            maxWidth: 480,
            lineHeight: 1.5,
          }}
        >
          💡 <strong>Petunjuk Simpan PDF:</strong> Klik tombol &quot;Cetak / Simpan PDF&quot; di atas, lalu pada jendela print browser pilih Destination: <strong>&quot;Save as PDF&quot;</strong>. Struk akan tersimpan pas 1 lembar tanpa terpotong.
        </div>
      </div>
    </>
  );
}
