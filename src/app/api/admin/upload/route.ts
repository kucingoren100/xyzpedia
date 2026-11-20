import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminAuth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

/**
 * Sniff file magic bytes to safely identify image format
 */
function sniffImageExtension(buffer: Buffer): string | null {
  if (buffer.length < 8) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return ".jpg";
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return ".png";
  }

  // GIF: GIF87a or GIF89a
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return ".gif";
  }

  // WEBP: RIFF....WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return ".webp";
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "File gambar tidak ditemukan." },
        { status: 400 }
      );
    }

    // Limit size to max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "Ukuran gambar terlalu besar (maksimal 5MB)." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sniff magic bytes (reject SVG and unknown binaries)
    const detectedExt = sniffImageExtension(buffer);
    if (!detectedExt) {
      return NextResponse.json(
        {
          success: false,
          message: "Format gambar tidak didukung atau tidak aman. Hanya menerima JPG, PNG, WEBP, atau GIF asli (SVG dilarang).",
        },
        { status: 400 }
      );
    }

    const randomSuffix = crypto.randomBytes(6).toString("hex");
    const sanitizedBase = path
      .basename(file.name, path.extname(file.name))
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .slice(0, 20);
    const uniqueFileName = `${Date.now()}-${sanitizedBase || "img"}-${randomSuffix}${detectedExt}`;

    // Storage abstraction: Vercel Blob if token available, fallback to local uploads
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (blobToken) {
      try {
        // Dynamic import with ignore for optional @vercel/blob package
        const blobPkg = "@vercel/blob";
        const { put } = await import(/* webpackIgnore: true */ blobPkg);
        const blob = await put(`uploads/${uniqueFileName}`, buffer, {
          access: "public",
          token: blobToken,
        });
        return NextResponse.json({
          success: true,
          message: "Gambar berhasil diupload ke cloud storage.",
          url: blob.url,
        });
      } catch (err: any) {
        console.error("Vercel Blob upload failed:", err);
      }
    }

    if (process.env.NODE_ENV === "production" && !blobToken) {
      return NextResponse.json(
        {
          success: false,
          message: "Penyimpanan cloud belum terkonfigurasi di server production (BLOB_READ_WRITE_TOKEN diperlukan).",
        },
        { status: 500 }
      );
    }

    // Local development storage fallback
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    const filePath = path.join(uploadsDir, uniqueFileName);
    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      message: "Gambar berhasil diupload.",
      url: `/uploads/${uniqueFileName}`,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengupload gambar: " + error.message },
      { status: 500 }
    );
  }
}
