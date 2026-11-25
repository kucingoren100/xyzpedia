import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminAuth";
import { logAuditEvent } from "@/lib/audit";

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
    const { name, price, originalPrice, supplierPrice, discountPercent, bonusText, stockStatus, sku, credentials } = body;

    if (!name || price === undefined) {
      return NextResponse.json(
        { success: false, message: "Nama varian dan harga jual wajib diisi." },
        { status: 400 }
      );
    }

    // Auto-generate SKU if not provided (always start with MANUAL- for admin added variants)
    const generatedSku = sku?.trim() || `MANUAL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const numPrice = parseInt(price, 10);
    const numOrig = originalPrice ? parseInt(originalPrice, 10) : null;
    const numSupplier = supplierPrice ? parseInt(supplierPrice, 10) : 0;

    let calcDiscount = discountPercent ? parseInt(discountPercent, 10) : null;
    if (!calcDiscount && numOrig && numOrig > numPrice) {
      calcDiscount = Math.round(((numOrig - numPrice) / numOrig) * 100);
    }

    // Process credentials if provided
    const rawCreds = typeof credentials === "string" ? credentials.trim() : "";
    const credLines = rawCreds
      ? rawCreds
          .split("\n")
          .map((l: string) => l.trim())
          .filter(Boolean)
      : [];

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
        stockStatus: stockStatus || (credLines.length > 0 ? "AVAILABLE" : "AVAILABLE"),
        supplier: "MANUAL",
        ...(credLines.length > 0
          ? {
              accountStocks: {
                create: credLines.map((cred: string) => ({
                  credential: cred,
                  isUsed: false,
                })),
              },
            }
          : {}),
      },
      include: {
        _count: {
          select: {
            accountStocks: {
              where: { isUsed: false },
            },
          },
        },
      },
    });

    await logAuditEvent({
      actor: session.username || "admin",
      action: "ADD_PRODUCT_ITEM",
      target: newItem.name,
      summary: `Admin menambahkan varian "${newItem.name}" (SKU: ${newItem.sku}, Harga: Rp ${numPrice.toLocaleString("id-ID")}, Stok Akun: ${credLines.length}) ke produk ID ${productId}.`,
    });

    return NextResponse.json({
      success: true,
      message: `Varian "${newItem.name}" berhasil ditambahkan${credLines.length > 0 ? ` bersama ${credLines.length} akun stok` : ""}.`,
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
