import { describe, it, expect } from "vitest";
import { fuzzySearchProducts, SearchableProduct } from "@/lib/searchHelper";

const sampleProducts: SearchableProduct[] = [
  { id: "1", name: "Mobile Legends: Bang Bang", slug: "mobile-legends", categorySlug: "game-topup", developer: "Moonton" },
  { id: "2", name: "Free Fire", slug: "free-fire", categorySlug: "game-topup", developer: "Garena" },
  { id: "3", name: "Genshin Impact", slug: "genshin-impact", categorySlug: "game-topup", developer: "HoYoverse" },
  { id: "4", name: "Valorant", slug: "valorant", categorySlug: "game-topup", developer: "Riot Games" },
  { id: "5", name: "Honor of Kings", slug: "honor-of-kings", categorySlug: "game-topup", developer: "Level Infinite" },
  { id: "6", name: "Netflix Premium", slug: "netflix-premium", categorySlug: "akun-premium", developer: "Netflix" },
];

describe("fuzzySearchProducts with Fuse.js", () => {
  it("should return all products when query is empty", () => {
    const results = fuzzySearchProducts(sampleProducts, "");
    expect(results.length).toBe(sampleProducts.length);
  });

  it("should match by alias shorthand: 'mlbb' -> Mobile Legends", () => {
    const results = fuzzySearchProducts(sampleProducts, "mlbb");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].slug).toBe("mobile-legends");
  });

  it("should match by alias shorthand: 'ff' -> Free Fire", () => {
    const results = fuzzySearchProducts(sampleProducts, "ff");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].slug).toBe("free-fire");
  });

  it("should match with Indonesian typo: 'mobel lejen' -> Mobile Legends", () => {
    const results = fuzzySearchProducts(sampleProducts, "mobel lejen");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].slug).toBe("mobile-legends");
  });

  it("should match with typo: 'gensin' -> Genshin Impact", () => {
    const results = fuzzySearchProducts(sampleProducts, "gensin");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].slug).toBe("genshin-impact");
  });

  it("should match developer name: 'Moonton' -> Mobile Legends", () => {
    const results = fuzzySearchProducts(sampleProducts, "moonton");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].slug).toBe("mobile-legends");
  });
});
