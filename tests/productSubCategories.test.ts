import { describe, it, expect } from "vitest";
import { getItemSubCategory, getProductSubCategories } from "@/lib/productSubCategories";

describe("productSubCategories classifier", () => {
  it("classifies Magic Chess items into Diamonds and First Recharge", () => {
    const regularItem = "Magic Chess Go Go 50 Diamonds";
    const promoItem = "Magic Chess Go Go First Recharge 250+250 Diamonds";

    expect(getItemSubCategory(regularItem, "magic-chess-go-go")).toBe("Diamonds");
    expect(getItemSubCategory(promoItem, "magic-chess-go-go")).toBe("First Recharge");

    const items = [
      { name: "Magic Chess Go Go 5 Diamonds" },
      { name: "Magic Chess Go Go First Recharge 50+50 Diamonds" },
      { name: "Magic Chess Go Go 12 Diamonds" },
      { name: "Magic Chess Go Go First Recharge 150+150 Diamonds" },
    ];

    const subCats = getProductSubCategories(items, "magic-chess-go-go");
    expect(subCats).toEqual(["Diamonds", "First Recharge"]);
  });

  it("classifies Mobile Legends items into Diamond and Pass & Bundle", () => {
    const diamondItem = "MOBILE LEGENDS 85 Diamond";
    const passItem = "MOBILE LEGENDS Weekly Diamond Pass";

    expect(getItemSubCategory(diamondItem, "mobile-legends")).toBe("Diamond");
    expect(getItemSubCategory(passItem, "mobile-legends")).toBe("Pass & Bundle");

    const items = [
      { name: "MOBILE LEGENDS 85 Diamond" },
      { name: "MOBILE LEGENDS Weekly Diamond Pass" },
    ];
    const subCats = getProductSubCategories(items, "mobile-legends");
    expect(subCats).toEqual(["Diamond", "Pass & Bundle"]);
  });

  it("returns empty array when all items belong to a single category", () => {
    const items = [
      { name: "1.200 PB Cash" },
      { name: "2.400 PB Cash" },
      { name: "6.000 PB Cash" },
    ];
    const subCats = getProductSubCategories(items, "point-blank");
    expect(subCats).toEqual([]);
  });

  it("classifies general topup first recharge or membership properly", () => {
    expect(getItemSubCategory("Game ABC First Topup 100 Coin", "game-abc")).toBe("First Recharge");
    expect(getItemSubCategory("Game ABC Monthly VIP Pass", "game-abc")).toBe("Membership & Pass");
  });
});
