import { describe, it, expect, vi, beforeEach } from "vitest";

interface StoredAsset {
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
  data: Buffer;
}

const memoryAssets = new Map<string, StoredAsset>();
let seq = 1;

vi.mock("fs/promises", () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    mediaAsset: {
      create: vi.fn(async ({ data }: { data: Omit<StoredAsset, "id"> }) => {
        const id = `asset_${seq++}`;
        const record: StoredAsset = { id, ...data };
        memoryAssets.set(id, record);
        return record;
      }),
      findUnique: vi.fn(async ({ where }: { where: { id: string } }) => {
        return memoryAssets.get(where.id) ?? null;
      }),
      delete: vi.fn(async ({ where }: { where: { id: string } }) => {
        const existing = memoryAssets.get(where.id) ?? null;
        memoryAssets.delete(where.id);
        return existing;
      }),
    },
  },
}));

vi.mock("@/lib/adminAuth", () => ({
  getAdminSession: vi.fn().mockResolvedValue({ username: "superadmin", role: "ADMIN" }),
  canAdminMutate: vi.fn().mockReturnValue(true),
}));

import { prisma } from "@/lib/prisma";

describe("Media Storage & Upload System (Mocked DB & FS)", () => {
  beforeEach(() => {
    memoryAssets.clear();
  });

  it("should serve media asset correctly via GET /api/media/[id]", async () => {
    const pngBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
      "base64"
    );

    const testAsset = await prisma.mediaAsset.create({
      data: {
        fileName: "test-pixel.png",
        mimeType: "image/png",
        size: pngBuffer.length,
        data: pngBuffer,
      },
    });

    const { GET, HEAD } = await import("@/app/api/media/[id]/route");

    // 1. Test GET with clean ID
    const req1 = new Request(`http://localhost:3000/api/media/${testAsset.id}`);
    const res1 = await GET(req1, { params: Promise.resolve({ id: testAsset.id }) });

    expect(res1.status).toBe(200);
    expect(res1.headers.get("Content-Type")).toBe("image/png");
    expect(res1.headers.get("Cache-Control")).toContain("public, max-age=31536000, immutable");
    const resBuffer = Buffer.from(await res1.arrayBuffer());
    expect(resBuffer.length).toBe(pngBuffer.length);

    // 2. Test GET with extension in ID (e.g., .png)
    const req2 = new Request(`http://localhost:3000/api/media/${testAsset.id}.png`);
    const res2 = await GET(req2, { params: Promise.resolve({ id: `${testAsset.id}.png` }) });
    expect(res2.status).toBe(200);
    expect(res2.headers.get("Content-Type")).toBe("image/png");

    // 3. Test HEAD request
    const headReq = new Request(`http://localhost:3000/api/media/${testAsset.id}`);
    const headRes = await HEAD(headReq, { params: Promise.resolve({ id: testAsset.id }) });
    expect(headRes.status).toBe(200);
    expect(headRes.headers.get("Content-Type")).toBe("image/png");
    expect(headRes.headers.get("Content-Length")).toBe(String(pngBuffer.length));

    // 4. Test 304 ETag match
    const etag = res1.headers.get("ETag");
    if (etag) {
      const req304 = new Request(`http://localhost:3000/api/media/${testAsset.id}`, {
        headers: { "if-none-match": etag },
      });
      const res304 = await GET(req304, { params: Promise.resolve({ id: testAsset.id }) });
      expect(res304.status).toBe(304);
    }

    // 5. Test 404 for non-existent asset
    const req404 = new Request("http://localhost:3000/api/media/non-existent-id");
    const res404 = await GET(req404, { params: Promise.resolve({ id: "non-existent-id" }) });
    expect(res404.status).toBe(404);
  });

  it("should upload valid image file via POST /api/admin/upload and save to database storage", async () => {
    const { POST } = await import("@/app/api/admin/upload/route");

    const pngBytes = Uint8Array.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
      0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
      0x42, 0x60, 0x82,
    ]);

    const formData = new FormData();
    const testFile = new File([pngBytes], "valid-banner.png", { type: "image/png" });
    formData.append("file", testFile);

    const req = new Request("http://localhost:3000/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.url).toMatch(/^\/api\/media\//);

    const cleanId = json.url.replace(/^\/api\/media\//, "").replace(/\.[a-zA-Z0-9]+$/, "");
    const saved = await prisma.mediaAsset.findUnique({ where: { id: cleanId } });
    expect(saved).not.toBeNull();
    expect(saved?.mimeType).toBe("image/png");
  });

  it("should reject non-image file upload in /api/admin/upload", async () => {
    const { POST } = await import("@/app/api/admin/upload/route");

    const formData = new FormData();
    const fakeFile = new Blob(["alert('malicious script')"], { type: "text/javascript" });
    formData.append("file", fakeFile, "malicious.js");

    const req = new Request("http://localhost:3000/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.message).toContain("Format gambar tidak didukung");
  });
});
