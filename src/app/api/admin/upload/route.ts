import { NextResponse } from "next/server";
import { getAdminSession, canAdminMutate } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

/**
 * Sniff file magic bytes to safely identify image format
 */
function sniffImageExtension(buffer: Buffer): { ext: string; mime: string } | null {
  if (buffer.length < 8) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { ext: ".jpg", mime: "image/jpeg" };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return { ext: ".png", mime: "image/png" };
  }

  // GIF: GIF87a or GIF89a
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    return { ext: ".gif", mime: "image/gif" };
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
    return { ext: ".webp", mime: "image/webp" };
  }

  return null;
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    if (!canAdminMutate(session)) {
      return NextResponse.json({ success: false, message: "Akses ditolak (khusus ADMIN/OWNER)." }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "File gambar tidak ditemukan." },
        { status: 400 }
      );
    }

    // Limit size to max 8MB
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "Ukuran gambar terlalu besar (maksimal 8MB)." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sniff magic bytes (reject SVG and unknown binaries for security)
    const sniffResult = sniffImageExtension(buffer);
    if (!sniffResult) {
      return NextResponse.json(
        {
          success: false,
          message: "Format gambar tidak didukung atau tidak aman. Hanya menerima file JPG, PNG, WEBP, atau GIF asli.",
        },
        { status: 400 }
      );
    }

    const { ext: detectedExt, mime: mimeType } = sniffResult;
    const randomSuffix = crypto.randomBytes(6).toString("hex");
    const sanitizedBase = path
      .basename(file.name, path.extname(file.name))
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .slice(0, 20);
    const uniqueFileName = `${Date.now()}-${sanitizedBase || "img"}-${randomSuffix}${detectedExt}`;

    // Priority 1: Vercel Blob if token available
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (blobToken) {
      try {
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
        console.warn("Vercel Blob upload failed, falling back to database media storage:", err.message);
      }
    }

    // Priority 2: Universal Database Media Storage (Neon PostgreSQL with Edge CDN Cache)
    // Works reliably in production without needing extra cloud tokens
    try {
      const asset = await prisma.mediaAsset.create({
        data: {
          fileName: uniqueFileName,
          mimeType,
          size: buffer.length,
          data: buffer,
        },
      });

      // Optional local disk cache for development
      if (process.env.NODE_ENV !== "production") {
        try {
          const uploadsDir = path.join(process.cwd(), "public", "uploads");
          await mkdir(uploadsDir, { recursive: true });
          const filePath = path.join(uploadsDir, uniqueFileName);
          await writeFile(filePath, buffer);
        } catch {
          // ignore local disk cache failure
        }
      }

      return NextResponse.json({
        success: true,
        message: "Gambar berhasil diupload dan disimpan.",
        url: `/api/media/${asset.id}${detectedExt}`,
      });
    } catch (dbErr: any) {
      console.error("Database media asset create error:", dbErr);

      // Local fallback for development environment if database write fails
      if (process.env.NODE_ENV !== "production") {
        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        await mkdir(uploadsDir, { recursive: true });
        const filePath = path.join(uploadsDir, uniqueFileName);
        await writeFile(filePath, buffer);

        return NextResponse.json({
          success: true,
          message: "Gambar berhasil diupload (local).",
          url: `/uploads/${uniqueFileName}`,
        });
      }

      return NextResponse.json(
        {
          success: false,
          message: "Gagal menyimpan gambar ke database: " + dbErr.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengupload gambar: " + error.message },
      { status: 500 }
    );
  }
}
