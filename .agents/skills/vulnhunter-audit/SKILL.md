---
name: vulnhunter-audit
description: >-
  Attacker-first code analysis and security auditing methodology for web apps,
  APIs, authentication flows, and payment webhooks. Use during security reviews,
  penetration testing, and vulnerability assessments.
---

# VulnHunter & Shannon Security Audit Methodology

Origin: `@capitalone/vulnhunter` & `@KeygraphHQ/shannon` (GitHub Open-Source)

This skill provides an autonomous attacker-first checklist and verification framework to uncover and eliminate real-world exploitable vulnerabilities in web applications and APIs.

## Attacker-First Audit Checklist

### 1. Insecure Direct Object References (IDOR) & Transaction Snooping
- **Check**: Are transaction lookups or user data queries gated by secret tokens or session authentication?
- **Verify**: A public route like `/cek-transaksi` must NEVER expose customer email, customer phone number, or raw internal supplier serial numbers unless the caller proves ownership (via signed access cookie, OTP, or secret token).

### 2. Payment Gateway & Supplier Webhook Vulnerabilities
- **HMAC Signatures**: Every incoming callback (Tripay, Digiflazz, Midtrans) MUST verify the cryptographic signature using constant-time comparison (`crypto.timingSafeEqual`) to prevent timing attacks.
- **Replay Attacks**: Check callback timestamps (`Date.now() - callbackTime < 5 minutes`). Reject expired callbacks.
- **Idempotency Locks**: Ensure status transitions can only occur ONCE (`PENDING` -> `PAID`). Never re-process orders or award double balance if duplicate callbacks arrive.

### 3. Server-Side Request Forgery (SSRF) & Reverse Proxy Trust
- **Client IP Resolution**: When extracting client IP for rate limiting or security logging, do NOT trust unauthenticated `x-forwarded-for` headers unless coming from a verified trusted proxy (e.g. Cloudflare IP range).
- **External URLs**: Validate and sanitize any user-supplied target URL against private IP ranges (`127.0.0.1`, `10.0.0.0/8`, `169.254.0.0/16`).

### 4. Database Query Safety & Prisma Invariants
- Verify that dynamic Prisma queries never concatenate unsanitized user strings into raw queries (`$queryRawUnsafe`).
- Ensure sensitive fields (`passwordHash`, `secretKey`, `token`) are excluded from JSON responses returned to client-facing components.

### 5. Automated Verification Rule
Every vulnerability identified must be accompanied by an automated reproduction test (e.g. in Vitest) and a verified fix before marking the issue resolved.
