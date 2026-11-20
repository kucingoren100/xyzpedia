import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(request: Request) {
  try {
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rl = checkRateLimit(`warranty-claim:${clientIp}`, {
      intervalMs: 60 * 1000,
      max: 5,
    });
    if (!rl.success) {
      return NextResponse.json(
        { error: "Terlalu banyak permintaan. Silakan coba 1 menit lagi." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Data permintaan tidak valid." }, { status: 400 });
    }

    const { invoiceNumber, customerPhone, customerEmail, issueType, description, proofImageUrl } =
      body;

    if (!invoiceNumber || typeof invoiceNumber !== "string") {
      return NextResponse.json({ error: "Nomor Invoice wajib diisi." }, { status: 400 });
    }

    const cleanPhone = String(customerPhone || "").trim();
    if (!cleanPhone || cleanPhone.length < 8) {
      return NextResponse.json(
        { error: "Nomor WhatsApp aktif wajib diisi untuk konfirmasi solusi." },
        { status: 400 }
      );
    }

    const cleanDesc = String(description || "").trim();
    if (!cleanDesc || cleanDesc.length < 10) {
      return NextResponse.json(
        { error: "Mohon jelaskan kendala Anda secara detail (minimal 10 karakter)." },
        { status: 400 }
      );
    }

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { invoiceNumber: invoiceNumber.trim() },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Pesanan dengan nomor invoice tersebut tidak ditemukan." },
        { status: 404 }
      );
    }

    // Check for open existing tickets
    const existingOpenClaim = await prisma.warrantyClaim.findFirst({
      where: {
        invoiceNumber: order.invoiceNumber,
        status: { in: ["PENDING", "IN_REVIEW"] },
      },
    });

    if (existingOpenClaim) {
      return NextResponse.json(
        {
          error:
            "Tiket klaim garansi untuk invoice ini sedang dalam proses pemeriksaan tim support kami.",
          claim: existingOpenClaim,
        },
        { status: 400 }
      );
    }

    const claim = await prisma.warrantyClaim.create({
      data: {
        invoiceNumber: order.invoiceNumber,
        customerPhone: cleanPhone,
        customerEmail: customerEmail ? String(customerEmail).trim() : order.customerEmail,
        issueType: String(issueType || "ITEM_BELUM_MASUK"),
        description: cleanDesc,
        proofImageUrl: proofImageUrl ? String(proofImageUrl).trim() : null,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Pengajuan klaim garansi berhasil dikirim. Tim kami akan segera menindaklanjuti.",
      claim,
    });
  } catch (error: any) {
    console.error("[API WARRANTY CLAIM POST] Error:", error);
    return NextResponse.json(
      { error: "Gagal mengirim pengajuan klaim garansi." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const invoiceNumber = searchParams.get("invoiceNumber");

    if (!invoiceNumber) {
      return NextResponse.json({ error: "Invoice number required" }, { status: 400 });
    }

    const claims = await prisma.warrantyClaim.findMany({
      where: { invoiceNumber: invoiceNumber.trim() },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, claims });
  } catch (error: any) {
    console.error("[API WARRANTY CLAIM GET] Error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data klaim garansi." },
      { status: 500 }
    );
  }
}
