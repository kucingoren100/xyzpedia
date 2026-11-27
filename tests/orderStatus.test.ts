import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFindUnique = vi.fn();
const mockFindUniqueOrThrow = vi.fn();
const mockUpdateMany = vi.fn();
const mockStartFulfillment = vi.fn();

vi.mock("../src/lib/prisma", () => ({
  prisma: {
    order: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      findUniqueOrThrow: (...args: unknown[]) => mockFindUniqueOrThrow(...args),
      updateMany: (...args: unknown[]) => mockUpdateMany(...args),
    },
  },
}));

vi.mock("../src/lib/orderFulfillment", () => ({
  startFulfillment: (...args: unknown[]) => mockStartFulfillment(...args),
}));

import { OrderStatus, canTransition, markOrderPaid } from "../src/lib/orderStatus";
import { parseSupplierDelivery } from "../src/lib/deliveryHelper";

describe("Order Status State Machine, Strict Payment Matching & Helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStartFulfillment.mockResolvedValue({ success: true });
  });

  it("allows valid state transitions", () => {
    expect(canTransition(OrderStatus.PENDING, OrderStatus.PAID)).toBe(true);
    expect(canTransition(OrderStatus.PENDING, OrderStatus.EXPIRED)).toBe(true);
    expect(canTransition(OrderStatus.PENDING, OrderStatus.CANCELLED)).toBe(true);

    expect(canTransition(OrderStatus.PAID, OrderStatus.PROCESSING)).toBe(true);
    expect(canTransition(OrderStatus.PAID, OrderStatus.SUCCESS)).toBe(true);
    expect(canTransition(OrderStatus.PAID, OrderStatus.FAILED)).toBe(true);

    expect(canTransition(OrderStatus.PROCESSING, OrderStatus.SUCCESS)).toBe(true);
    expect(canTransition(OrderStatus.PROCESSING, OrderStatus.FAILED)).toBe(true);
  });

  it("disallows illegal transitions", () => {
    expect(canTransition(OrderStatus.SUCCESS, OrderStatus.PENDING)).toBe(false);
    expect(canTransition(OrderStatus.SUCCESS, OrderStatus.FAILED)).toBe(false);
    expect(canTransition(OrderStatus.EXPIRED, OrderStatus.PAID)).toBe(false);
    expect(canTransition(OrderStatus.CANCELLED, OrderStatus.PAID)).toBe(false);
  });

  it("enforces strict exact totalAmount matching in markOrderPaid", async () => {
    const pendingOrder = {
      id: "ord_1",
      invoiceNumber: "INV-EXACT-1",
      status: OrderStatus.PENDING,
      basePrice: 20000,
      uniqueCode: 137,
      totalAmount: 20137,
    };

    // 1. Rejects basePrice when uniqueCode makes totalAmount 20137
    mockFindUnique.mockResolvedValueOnce(pendingOrder);
    const mismatch = await markOrderPaid("INV-EXACT-1", "webhook", 20000);
    expect(mismatch.success).toBe(false);
    expect(mismatch.error).toContain("Nominal tidak sesuai");
    expect(mockUpdateMany).not.toHaveBeenCalled();

    // 2. Accepts exact totalAmount (20137) and triggers fulfillment
    mockFindUnique.mockResolvedValueOnce(pendingOrder);
    mockUpdateMany.mockResolvedValueOnce({ count: 1 });
    mockFindUniqueOrThrow.mockResolvedValueOnce({ ...pendingOrder, status: OrderStatus.PAID });

    const exact = await markOrderPaid("INV-EXACT-1", "webhook", 20137);
    expect(exact.success).toBe(true);
    expect(mockUpdateMany).toHaveBeenCalledTimes(1);
    expect(mockStartFulfillment).toHaveBeenCalledWith("ord_1");
  });

  it("handles idempotent duplicate webhook calls safely", async () => {
    const paidOrder = {
      id: "ord_2",
      invoiceNumber: "INV-PAID-2",
      status: OrderStatus.PAID,
      totalAmount: 35112,
    };

    mockFindUnique.mockResolvedValueOnce(paidOrder);
    const res = await markOrderPaid("INV-PAID-2", "webhook", 35112);
    expect(res.success).toBe(true);
    expect(res.alreadyProcessed).toBe(true);
    expect(mockUpdateMany).not.toHaveBeenCalled();
  });

  it("parses supplier notes correctly", () => {
    const note1 = "Injeksi PPOB: REF12345 | Status: SUCCESS | SN: 081234567890123456";
    const res1 = parseSupplierDelivery(note1);
    expect(res1.supplierStatus).toBe("SUCCESS");
    expect(res1.sn).toBe("081234567890123456");

    const note2 = "SN: MLBB-XYZ-99887766";
    const res2 = parseSupplierDelivery(note2);
    expect(res2.sn).toBe("MLBB-XYZ-99887766");

    const res3 = parseSupplierDelivery(null);
    expect(res3.supplierStatus).toBeNull();
    expect(res3.sn).toBeNull();
  });
});
