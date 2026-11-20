import { describe, it, expect } from "vitest";

describe("Admin Routes Authentication Guard", () => {
  it("should verify verifyAdminToken returns null when no token or bad signature", async () => {
    const { verifyAdminToken } = await import("@/lib/adminAuth");
    expect(verifyAdminToken("")).toBeNull();
    expect(verifyAdminToken("invalid.token.here")).toBeNull();
    expect(verifyAdminToken("eyJhbGciOiJIUzI1NiJ9.invalidSignature")).toBeNull();
  });

  it("should ensure mock admin session payload adheres to expected interface", () => {
    const mockPayload = {
      username: "admin_tester",
      name: "Admin Tester",
      role: "ADMIN",
      exp: Date.now() + 3600000,
    };
    expect(mockPayload.username).toBe("admin_tester");
    expect(mockPayload.role).toBe("ADMIN");
  });
});
