import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const submitReviewSchema = z.object({
  invoiceNumber: z.string().trim().min(5).max(100),
  rating: z.number().int().min(1).max(5),
  customerName: z.string().trim().min(2).max(50).optional(),
  comment: z.string().trim().max(500).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productSlug = searchParams.get("slug");
    const productId = searchParams.get("productId");
    const limit = Math.min(Number(searchParams.get("limit") || 10), 30);

    const where: any = { isPublished: true };

    if (productId) {
      where.productId = productId;
    } else if (productSlug) {
      const prod = await prisma.product.findUnique({
        where: { slug: productSlug },
        select: { id: true },
      });
      if (prod) {
        where.productId = prod.id;
      }
    }

    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        product: { select: { name: true, slug: true } },
      },
    });

    // Calculate average rating
    const aggregate = await prisma.review.aggregate({
      where,
      _avg: { rating: true },
      _count: { id: true },
    });

    return NextResponse.json({
      success: true,
      reviews,
      stats: {
        averageRating: Number(aggregate._avg.rating?.toFixed(1)) || 5.0,
        totalReviews: aggregate._count.id || 0,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = submitReviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Data ulasan tidak valid." },
        { status: 400 }
      );
    }

    const { invoiceNumber, rating, customerName, comment } = parsed.data;

    // Verify order exists and is SUCCESS / PAID
    const order = await prisma.order.findUnique({
      where: { invoiceNumber },
      include: { product: true },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Nomor invoice pesanan tidak ditemukan." },
        { status: 404 }
      );
    }

    if (order.status !== "SUCCESS" && order.status !== "PAID") {
      return NextResponse.json(
        { success: false, error: "Ulasan hanya dapat diberikan untuk pesanan yang telah lunas / sukses." },
        { status: 400 }
      );
    }

    // Check if review already submitted
    const existing = await prisma.review.findUnique({
      where: { invoiceNumber },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Anda sudah memberikan ulasan untuk pesanan ini." },
        { status: 400 }
      );
    }

    const cleanName = customerName || (order.customerEmail ? order.customerEmail.split("@")[0] : "Kawan XYZ");

    const review = await prisma.review.create({
      data: {
        invoiceNumber,
        productId: order.productId,
        customerName: cleanName.slice(0, 30),
        rating,
        comment: comment || "Pelayanan sangat memuaskan, proses cepat!",
        isPublished: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Terima kasih! Ulasan Anda berhasil dikirim.",
      review,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
