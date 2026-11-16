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
    const category = searchParams.get("category") || "ALL";
    const search = searchParams.get("search")?.trim() || "";

    const where: any = {};
    if (category !== "ALL") {
      where.categorySlug = category;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { developer: { contains: search } },
        { slug: { contains: search } },
      ];
    }

    const [products, categories, itemSupplierPrices] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: [{ category: { order: "asc" } }, { name: "asc" }],
        include: {
          category: { select: { name: true, slug: true } },
          items: {
            orderBy: [{ order: "asc" }, { price: "asc" }],
          },
        },
      }),
      prisma.category.findMany({
        orderBy: { order: "asc" },
        select: { name: true, slug: true },
      }),
      prisma.$queryRawUnsafe<any[]>(
        `SELECT "id", "supplierPrice" FROM "ProductItem"`
      ),
    ]);

    const priceMap = new Map<string, number>();
    for (const row of itemSupplierPrices) {
      if (row && row.id) {
        priceMap.set(String(row.id), Number(row.supplierPrice) || 0);
      }
    }

    const productsWithSupplierPrice = products.map((prod) => ({
      ...prod,
      items: prod.items.map((item) => ({
        ...item,
        supplierPrice: priceMap.get(item.id) ?? (item as any).supplierPrice ?? 0,
      })),
    }));

    return NextResponse.json({
      success: true,
      products: productsWithSupplierPrice,
      categories,
    });
  } catch (error: any) {
    console.error("Admin products fetch error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil daftar produk." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      categorySlug,
      developer,
      tagline,
      description,
      thumbnailUrl,
      bannerUrl,
      badgeText,
      badgeColor,
      requiresServer,
      targetInputLabel,
      targetInputPlaceholder,
      serverInputPlaceholder,
      instructions,
      items, // array of { name, price, supplierPrice, originalPrice }
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, message: "Nama produk wajib diisi." },
        { status: 400 }
      );
    }

    if (!categorySlug) {
      return NextResponse.json(
        { success: false, message: "Kategori produk wajib dipilih." },
        { status: 400 }
      );
    }

    // Buat slug unik
    let baseSlug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (!baseSlug) baseSlug = `produk-${Date.now()}`;

    let finalSlug = baseSlug;
    let counter = 1;
    while (await prisma.product.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${counter++}`;
    }

    // Default image jika belum diisi
    const finalThumb =
      thumbnailUrl?.trim() || "/images/games/mobile-legends.webp";
    const finalBanner = bannerUrl?.trim() || finalThumb;

    // Buat produk baru
    const newProduct = await prisma.product.create({
      data: {
        name: name.trim(),
        slug: finalSlug,
        categorySlug,
        developer: developer?.trim() || "Official Publisher",
        tagline: tagline?.trim() || `Layanan resmi ${name.trim()} proses instan 24 jam nonstop`,
        description:
          description?.trim() ||
          `Layanan top up resmi ${name.trim()} otomatis via server XYZPEDIA dengan proses instan tanpa antri.`,
        thumbnailUrl: finalThumb,
        bannerUrl: finalBanner,
        badgeText: badgeText?.trim() || "NEW",
        badgeColor: badgeColor || "mint-pop",
        requiresServer: !!requiresServer,
        targetInputLabel: targetInputLabel?.trim() || "User ID",
        targetInputPlaceholder:
          targetInputPlaceholder?.trim() ||
          (targetInputLabel?.trim() && targetInputLabel.trim().toLowerCase() !== "user id"
            ? `Masukkan ${targetInputLabel.trim()}`
            : "Masukkan User ID akun Anda"),
        serverInputPlaceholder: requiresServer
          ? serverInputPlaceholder?.trim() || "Zone / Server ID"
          : null,
        instructions:
          instructions?.trim() ||
          `Masukkan ${targetInputLabel || "User ID"} akun Anda untuk memproses transaksi secara otomatis.`,
        isPopular: false,
        isActive: true,
      },
    });

    // Tambahkan varian default / items jika disediakan
    const itemsToCreate = Array.isArray(items) && items.length > 0
      ? items
      : [
          {
            name: `${name.trim()} Paket Utama`,
            price: 15000,
            supplierPrice: 13500,
            originalPrice: 17500,
          },
        ];

    let orderIdx = 1;
    for (const it of itemsToCreate) {
      const itemPrice = parseInt(it.price, 10) || 15000;
      const itemSupplier = it.supplierPrice !== undefined && it.supplierPrice !== null && it.supplierPrice !== ""
        ? parseInt(it.supplierPrice, 10)
        : Math.round(itemPrice * 0.9);
      const itemOriginal = it.originalPrice ? parseInt(it.originalPrice, 10) : Math.round(itemPrice * 1.15);
      const discount = Math.max(0, Math.round(((itemOriginal - itemPrice) / itemOriginal) * 100));

      const createdItem = await prisma.productItem.create({
        data: {
          productId: newProduct.id,
          sku: `CUSTOM-${newProduct.id.slice(-6)}-${orderIdx}`,
          name: it.name?.trim() || `Denominasi ${orderIdx}`,
          price: itemPrice,
          originalPrice: itemOriginal,
          supplierPrice: itemSupplier || 0,
          discountPercent: discount,
          stockStatus: "AVAILABLE",
          order: orderIdx++,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Produk "${newProduct.name}" berhasil ditambahkan!`,
      product: newProduct,
    });
  } catch (error: any) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membuat produk baru: " + error.message },
      { status: 500 }
    );
  }
}
