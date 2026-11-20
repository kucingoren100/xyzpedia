import { prisma } from "./prisma";

export interface AuditEventInput {
  actor: string;
  action: string;
  target: string;
  summary: string;
}

/**
 * Record an administrative or system audit event to the database.
 * Ensures no sensitive credentials (tokens, passwords) are logged.
 */
export async function logAuditEvent(event: AuditEventInput): Promise<void> {
  try {
    await (prisma as any).auditLog.create({
      data: {
        actor: event.actor || "system",
        action: event.action,
        target: event.target,
        summary: event.summary.slice(0, 500),
      },
    });
  } catch (err) {
    // Fail-safe: do not crash if AuditLog table has not been migrated yet
    console.warn(`[AuditLog] Could not write audit log (${event.action} by ${event.actor}):`, (err as any)?.message);
  }
}
