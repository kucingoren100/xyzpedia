import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminAuth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id: productId } = await params;
    const body = await req.json();
    const { name, price, originalPrice, supplierPrice, discountPercent, bonusText, stockStatus, sku } = body;

    if (!name || price === undefined) {
      return NextResponse.json(
        { success: false, message: "Nama varian dan harga jual wajib diisi." },
        { status: 400 }
      );
    }

    // Auto-generate SKU if not provided
    const generatedSku = sku?.trim() || `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const numPrice = parseInt(price, 10);
    const numOrig = originalPrice ? parseInt(originalPrice, 10) : null;
    const numSupplier = supplierPrice ? parseInt(supplierPrice, 10) : Math.round(numPrice * 0.88);

    let calcDiscount = discountPercent ? parseInt(discountPercent, 10) : null;
    if (!calcDiscount && numOrig && numOrig > numPrice) {
      calcDiscount = Math.round(((numOrig - numPrice) / numOrig) * 100);
    }

    const newItem = await prisma.productItem.create({
      data: {
        productId,
        sku: generatedSku,
        name: name.trim(),
        price: numPrice,
        originalPrice: numOrig,
        supplierPrice: numSupplier ?? 0,
        discountPercent: calcDiscount,
        bonusText: bonusText?.trim() || null,
        stockStatus: stockStatus || "AVAILABLE",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Varian "${newItem.name}" berhasil ditambahkan.`,
      item: {
        ...newItem,
        supplierPrice: numSupplier,
      },
    });
  } catch (error: any) {
    console.error("Add item error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menambahkan varian item." },
      { status: 500 }
    );
  }
}
