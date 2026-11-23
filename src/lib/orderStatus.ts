export const OrderStatus = {
  PENDING: "PENDING",
  PAID: "PAID",
  PROCESSING: "PROCESSING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  EXPIRED: "EXPIRED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
} as const;

export type OrderStatusType = keyof typeof OrderStatus;

const allowedTransitions: Record<string, string[]> = {
  [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.EXPIRED, OrderStatus.CANCELLED],
  [OrderStatus.PAID]: [OrderStatus.PROCESSING, OrderStatus.SUCCESS, OrderStatus.FAILED],
  [OrderStatus.PROCESSING]: [OrderStatus.SUCCESS, OrderStatus.FAILED],
  [OrderStatus.FAILED]: [OrderStatus.PROCESSING, OrderStatus.REFUNDED],
  [OrderStatus.SUCCESS]: [],
  [OrderStatus.EXPIRED]: [],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.REFUNDED]: [],
};

export function canTransition(from: string, to: string): boolean {
  const allowed = allowedTransitions[from] || [];
  return allowed.includes(to);
}

import { prisma } from "./prisma";
import { startFulfillment } from "./orderFulfillment";

/**
 * Atomically marks an order as PAID.
 * Enforces strict exact amount matching, atomic update from PENDING,
 * and launches startFulfillment.
 */
export async function markOrderPaid(
  invoiceNumber: string,
  source: string,
  paidAmount: number
) {
  if (!paidAmount || paidAmount <= 0) {
    return { success: false, error: "Nominal pembayaran tidak valid atau kosong" };
  }

  const order = await prisma.order.findUnique({
    where: { invoiceNumber },
    include: { product: true, productItem: true },
  });

  if (!order) {
    return { success: false, error: "Order not found" };
  }

  // Strict exact amount comparison (supports both full total amount and base price)
  const matchesTotal = paidAmount === order.totalAmount;
  const matchesBase =
    paidAmount === order.basePrice ||
    paidAmount === order.totalAmount - order.uniqueCode;

  if (!matchesTotal && !matchesBase) {
    return {
      success: false,
      error: `Nominal tidak sesuai: dibayar Rp ${paidAmount}, tagihan Rp ${order.totalAmount}`,
    };
  }

  if (order.status === OrderStatus.PAID || order.status === OrderStatus.SUCCESS || order.status === OrderStatus.PROCESSING) {
    return { success: true, alreadyProcessed: true, order };
  }

  if (!canTransition(order.status, OrderStatus.PAID)) {
    return { success: false, error: `Invalid status transition from ${order.status} to PAID` };
  }

  // Atomic claim
  const claimed = await prisma.order.updateMany({
    where: {
      invoiceNumber,
      status: OrderStatus.PENDING,
    },
    data: {
      status: OrderStatus.PAID,
      paidAt: new Date(),
      notes: `Settled via ${source} at ${new Date().toISOString()}`,
    },
  });

  if (claimed.count === 0) {
    // Concurrently claimed
    const reloaded = await prisma.order.findUnique({ where: { invoiceNumber } });
    return { success: true, alreadyProcessed: true, order: reloaded };
  }

  // Start asynchronous fulfillment
  startFulfillment(order.id).catch((err) => {
    console.error("[markOrderPaid] startFulfillment error:", err);
  });

  const updatedOrder = await prisma.order.findUniqueOrThrow({
    where: { invoiceNumber },
    include: { product: true, productItem: true },
  });

  return { success: true, order: updatedOrder };
}
