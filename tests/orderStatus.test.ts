import { describe, it, expect } from "vitest";
import { OrderStatus, canTransition } from "../src/lib/orderStatus";
import { parseSupplierDelivery } from "../src/lib/deliveryHelper";

describe("Fase 4: Order Status State Machine & Helpers", () => {
  it("should allow valid state transitions", () => {
    expect(canTransition(OrderStatus.PENDING, OrderStatus.PAID)).toBe(true);
    expect(canTransition(OrderStatus.PENDING, OrderStatus.EXPIRED)).toBe(true);
    expect(canTransition(OrderStatus.PENDING, OrderStatus.CANCELLED)).toBe(true);

    expect(canTransition(OrderStatus.PAID, OrderStatus.PROCESSING)).toBe(true);
    expect(canTransition(OrderStatus.PAID, OrderStatus.SUCCESS)).toBe(true);
    expect(canTransition(OrderStatus.PAID, OrderStatus.FAILED)).toBe(true);

    expect(canTransition(OrderStatus.PROCESSING, OrderStatus.SUCCESS)).toBe(true);
    expect(canTransition(OrderStatus.PROCESSING, OrderStatus.FAILED)).toBe(true);
  });

  it("should disallow illegal transitions", () => {
    expect(canTransition(OrderStatus.SUCCESS, OrderStatus.PENDING)).toBe(false);
    expect(canTransition(OrderStatus.SUCCESS, OrderStatus.FAILED)).toBe(false);
    expect(canTransition(OrderStatus.EXPIRED, OrderStatus.PAID)).toBe(false);
    expect(canTransition(OrderStatus.CANCELLED, OrderStatus.PAID)).toBe(false);
  });

  it("should parse supplier notes correctly", () => {
    const note1 = "Injeksi PPOB: REF12345 | Status: SUCCESS | SN: 081234567890123456";
    const res1 = parseSupplierDelivery(note1);
    expect(res1.supplierStatus).toBe("SUCCESS");
    expect(res1.sn).toBe("081234567890123456");

    const note2 = "SN: MLBB-XYZ-99887766";
    const res2 = parseSupplierDelivery(note2);
    expect(res2.sn).toBe("MLBB-XYZ-99887766");

    const note3 = null;
    const res3 = parseSupplierDelivery(note3);
    expect(res3.supplierStatus).toBeNull();
    expect(res3.sn).toBeNull();
  });
});
