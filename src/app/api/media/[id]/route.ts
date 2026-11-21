import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Strip file extension if present (e.g., "cm123.jpg" -> "cm123")
    const cleanId = id.replace(/\.[a-zA-Z0-9]+$/, "");

    const asset = await prisma.mediaAsset.findUnique({
      where: { id: cleanId },
    });

    if (!asset || !asset.data) {
      return new NextResponse("Image not found", { status: 404 });
    }

    // Generate ETag from asset ID and size
    const etag = `"${asset.id}-${asset.size}"`;
    const ifNoneMatch = req.headers.get("if-none-match");

    if (ifNoneMatch && ifNoneMatch === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          "ETag": etag,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    return new NextResponse(asset.data as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": asset.mimeType || "image/jpeg",
        "Content-Length": String(asset.size || asset.data.length),
        "Cache-Control": "public, max-age=31536000, immutable",
        "ETag": etag,
        "Content-Disposition": `inline; filename="${asset.fileName || 'image'}"`,
      },
    });
  } catch (error: any) {
    console.error("Error serving media asset:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function HEAD(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return new NextResponse(null, { status: 404 });

    const cleanId = id.replace(/\.[a-zA-Z0-9]+$/, "");
    const asset = await prisma.mediaAsset.findUnique({
      where: { id: cleanId },
      select: { id: true, mimeType: true, size: true, fileName: true },
    });

    if (!asset) return new NextResponse(null, { status: 404 });

    const etag = `"${asset.id}-${asset.size}"`;

    return new NextResponse(null, {
      status: 200,
      headers: {
        "Content-Type": asset.mimeType || "image/jpeg",
        "Content-Length": String(asset.size),
        "Cache-Control": "public, max-age=31536000, immutable",
        "ETag": etag,
        "Content-Disposition": `inline; filename="${asset.fileName || 'image'}"`,
      },
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
