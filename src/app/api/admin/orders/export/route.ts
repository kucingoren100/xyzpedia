import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "ALL";
    const search = searchParams.get("search")?.trim() || "";
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {};

    if (status !== "ALL") {
      if (status === "FAILED_OR_EXPIRED") {
        where.status = { in: ["FAILED", "EXPIRED"] };
      } else {
        where.status = status;
      }
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search } },
        { customerEmail: { contains: search } },
        { customerPhone: { contains: search } },
        { targetUserId: { contains: search } },
        { product: { name: { contains: search } } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: {
            name: true,
            categorySlug: true,
          },
        },
        productItem: {
          select: {
            name: true,
            sku: true,
            price: true,
            supplierPrice: true,
            supplier: true,
          },
        },
      },
    });

    const headers = [
      "No. Invoice",
      "Tanggal Transaksi",
      "Waktu Transaksi",
      "Tanggal Dibayar",
      "Layanan / Produk",
      "Kategori",
      "Varian Item",
      "SKU Supplier",
      "Target ID",
      "Zone / Server",
      "No. WhatsApp",
      "Email Pembeli",
      "Status Pesanan",
      "Metode Pembayaran",
      "Harga Jual (Rp)",
      "Modal Supplier (Rp)",
      "Estimasi Laba (Rp)",
      "Serial Number (SN) / Bukti",
    ];

    const escapeCsv = (str: any) => {
      if (str === null || str === undefined) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = orders.map((o) => {
      const createdDate = new Date(o.createdAt);
      const datePart = createdDate.toLocaleDateString("id-ID");
      const timePart = createdDate.toLocaleTimeString("id-ID");
      const paidPart = o.paidAt ? new Date(o.paidAt).toLocaleString("id-ID") : "-";

      const sellPrice = o.basePrice || o.totalAmount || 0;
      const modalPrice = o.productItem?.supplierPrice || 0;
      const profit = o.status === "SUCCESS" || o.status === "PAID" ? Math.max(0, sellPrice - modalPrice) : 0;

      return [
        escapeCsv(o.invoiceNumber),
        escapeCsv(datePart),
        escapeCsv(timePart),
        escapeCsv(paidPart),
        escapeCsv(o.product?.name || "-"),
        escapeCsv(o.product?.categorySlug || "-"),
        escapeCsv(o.productItem?.name || "-"),
        escapeCsv(o.productItem?.sku || "-"),
        escapeCsv(o.targetUserId || "-"),
        escapeCsv(o.targetZoneId || "-"),
        escapeCsv(o.customerPhone || "-"),
        escapeCsv(o.customerEmail || "-"),
        escapeCsv(o.status),
        escapeCsv(o.paymentMethod || "QRIS"),
        sellPrice,
        modalPrice,
        profit,
        escapeCsv(o.sn || "-"),
      ].join(",");
    });

    // Add summary row
    const totalOmset = orders.reduce((acc, o) => acc + (o.status === "SUCCESS" || o.status === "PAID" ? (o.basePrice || o.totalAmount || 0) : 0), 0);
    const totalModal = orders.reduce((acc, o) => acc + (o.status === "SUCCESS" || o.status === "PAID" ? (o.productItem?.supplierPrice || 0) : 0), 0);
    const totalProfit = Math.max(0, totalOmset - totalModal);

    const summaryRow = [
      escapeCsv("TOTAL KESELURUHAN (BERHASIL)"),
      '""',
      '""',
      '""',
      '""',
      '""',
      '""',
      '""',
      '""',
      '""',
      '""',
      '""',
      '""',
      '""',
      totalOmset,
      totalModal,
      totalProfit,
      '""',
    ].join(",");

    const csvContent = "\uFEFF" + [headers.join(","), ...rows, "", summaryRow].join("\r\n");

    const dateToday = new Date().toISOString().slice(0, 10);
    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="laporan-keuangan-xyzpedia-${dateToday}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
