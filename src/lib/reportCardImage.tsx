import { ImageResponse } from "next/og";
import React from "react";

export interface ReportCardData {
  storeName?: string;
  subStoreName?: string;
  totalOmset: number;
  totalProfit: number;
  totalOrders: number;
  visits?: number;
  conversionRate?: number | string;
  topProduct?: string;
  dateStr?: string;
  timeStr?: string;
  siteUrl?: string;
}

export async function generateReportCardPng(data: ReportCardData): Promise<Buffer> {
  const store = data.storeName || "XYZPEDIA";
  const subStore = data.subStoreName || "Panel Kontrol Admin";
  const visits = data.visits;
  const convRate = data.conversionRate ? `${data.conversionRate}%` : (data.totalOrders > 0 ? "100%" : "0%");
  const topProduct = data.topProduct || "Semua Layanan";
  const now = new Date();
  const dateStr =
    data.dateStr ||
    now.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  const timeStr =
    data.timeStr ||
    now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB";
  const siteUrl = data.siteUrl || "xyzpedia.my.id";

  const imageResponse = new ImageResponse(
    (
      <div
        style={{
          width: 720,
          height: 440,
          backgroundColor: "#ffffff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "32px 36px",
          fontFamily: "sans-serif",
          border: "1px solid #e2e8f0",
          borderRadius: 20,
        }}
      >
        {/* Top Header / Store Brand */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 34,
              height: 34,
              backgroundColor: "#2e7d32",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: 20,
              fontWeight: 900,
            }}
          >
            W
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginLeft: 12 }}>
            <span style={{ fontSize: 16, fontWeight: 900, color: "#0f172a", lineHeight: 1.2 }}>
              {store}
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>
              {subStore}
            </span>
          </div>
        </div>

        {/* Middle Main Content Grid */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 12 }}>
          {/* Left Column: Hero Profit */}
          <div style={{ display: "flex", flexDirection: "column", width: 330 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>
              Laporan mingguan
            </span>
            <span style={{ fontSize: 46, fontWeight: 900, color: "#0f172a", letterSpacing: -1, lineHeight: 1 }}>
              Rp{data.totalProfit.toLocaleString("id-ID")}
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginTop: 8, marginBottom: 12 }}>
              {data.totalOrders} pesanan · laba bersih
            </span>
            <div style={{ display: "flex" }}>
              <span
                style={{
                  backgroundColor: "#dcfce7",
                  color: "#166534",
                  fontSize: 11,
                  fontWeight: 800,
                  padding: "4px 12px",
                  borderRadius: 999,
                }}
              >
                Ada penjualan
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", marginTop: 32 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>
                {dateStr}
              </span>
              <span style={{ fontSize: 16, fontWeight: 900, color: "#0f172a" }}>
                {timeStr}
              </span>
            </div>
          </div>

          {/* Right Column: Breakdown Table Box */}
          <div
            style={{
              width: 300,
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 14,
              padding: "16px 20px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: "1px solid #f1f5f9",
                fontSize: 13,
              }}
            >
              <span style={{ color: "#64748b", fontWeight: 500 }}>Omzet</span>
              <span style={{ color: "#0f172a", fontWeight: 800 }}>
                Rp{data.totalOmset.toLocaleString("id-ID")}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: "1px solid #f1f5f9",
                fontSize: 13,
              }}
            >
              <span style={{ color: "#64748b", fontWeight: 500 }}>Pesanan</span>
              <span style={{ color: "#0f172a", fontWeight: 800 }}>{data.totalOrders}</span>
            </div>

            {visits !== undefined && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 0",
                  borderBottom: "1px solid #f1f5f9",
                  fontSize: 13,
                }}
              >
                <span style={{ color: "#64748b", fontWeight: 500 }}>Kunjungan</span>
                <span style={{ color: "#0f172a", fontWeight: 800 }}>{visits}</span>
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                borderBottom: "1px solid #f1f5f9",
                fontSize: 13,
              }}
            >
              <span style={{ color: "#64748b", fontWeight: 500 }}>Konversi</span>
              <span style={{ color: "#0f172a", fontWeight: 800 }}>{convRate}</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px 0",
                fontSize: 13,
              }}
            >
              <span style={{ color: "#64748b", fontWeight: 500 }}>Terlaris</span>
              <span
                style={{
                  color: "#0f172a",
                  fontWeight: 800,
                  maxWidth: 160,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {topProduct}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Footer Watermark */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
          <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>{siteUrl}</span>
        </div>
      </div>
    ),
    {
      width: 720,
      height: 440,
    }
  );

  const arrayBuffer = await imageResponse.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
