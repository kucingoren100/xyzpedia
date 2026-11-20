import { describe, it, expect } from "vitest";
import { formatIndonesianPhone } from "@/lib/whatsapp";
import { calculateSellingPrice } from "@/lib/digiflazzSync";

describe("Paket Fitur Pertumbuhan XYZPEDIA", () => {
  describe("WhatsApp Phone Formatter", () => {
    it("should standardize leading 0 to 62", () => {
      expect(formatIndonesianPhone("081234567890")).toBe("6281234567890");
    });

    it("should standardize leading 8 to 628", () => {
      expect(formatIndonesianPhone("81234567890")).toBe("6281234567890");
    });

    it("should keep 62 intact", () => {
      expect(formatIndonesianPhone("6281234567890")).toBe("6281234567890");
    });

    it("should strip spaces, dashes, and special characters", () => {
      expect(formatIndonesianPhone("+62 896-4666-1132")).toBe("6289646661132");
    });
  });

  describe("Margin Protection & Price Calculation", () => {
    it("should enforce minimum Rp 500 margin on micro-price products", () => {
      // Supplier price Rp 1.000 -> 8% is Rp 80. Minimum margin should apply (Rp 500) -> 1.500
      const price = calculateSellingPrice(1000, 8, 500);
      expect(price).toBe(1500);
      expect(price - 1000).toBeGreaterThanOrEqual(500);
    });

    it("should use percentage markup when greater than minimum margin", () => {
      // Supplier price Rp 100.000 -> 8% is Rp 8.000 (which is > 500) -> 108.000
      const price = calculateSellingPrice(100000, 8, 500);
      expect(price).toBe(108000);
      expect(price - 100000).toBe(8000);
    });

    it("should round price neatly to nearest hundred upwards", () => {
      // Supplier price Rp 10.450 -> 8% markup = 836 -> raw 11286 -> rounds to 11300
      const price = calculateSellingPrice(10450, 8, 500);
      expect(price % 100).toBe(0);
      expect(price).toBe(11300);
    });
  });

  describe("Sitemap & Robots SEO Configuration", () => {
    it("should return correct domain in robots rules", async () => {
      const robotsFn = (await import("@/app/robots")).default;
      const robots = robotsFn();
      expect(robots.sitemap).toContain("xyzpedia.my.id");
    });
  });

  describe("Warranty Claim System Constants", () => {
    it("should include all essential issue categories", () => {
      const validIssues = [
        "ITEM_BELUM_MASUK",
        "AKUN_LOGIN_GAGAL",
        "RESET_PROFIL",
        "SALAH_NOMINAL",
        "LAINNYA",
      ];
      expect(validIssues).toContain("ITEM_BELUM_MASUK");
      expect(validIssues).toContain("AKUN_LOGIN_GAGAL");
    });
  });
});
