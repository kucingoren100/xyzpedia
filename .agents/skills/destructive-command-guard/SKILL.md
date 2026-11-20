---
name: destructive-command-guard
description: >-
  Safety guardrail intercepting and preventing destructive Git, shell, database,
  and filesystem commands before execution. Use to protect codebases, production
  databases, and version history from accidental corruption or unapproved pushes.
---

# Destructive Command Guard (DCG Pattern)

Origin: `@Dicklesworthstone/destructive_command_guard` (GitHub Open-Source)

This skill enforces strict safety barriers and verification checks before any potentially irreversible or destructive command is executed by the agent.

## Intercepted Commands & Safety Protocols

### 1. Version Control & Git Guardrails
- **NEVER** execute `git push` or `git push --force` without explicit, unambiguous approval from the user.
- **NEVER** run `git reset --hard` on remote tracking branches without checking unstaged work first.
- **NEVER** delete remote branches or tags autonomously.
- Prioritize keeping local commit logs clean, well-described, and verified before proposing a push.

### 2. Database & Data Integrity Guardrails
- **NEVER** execute `DROP DATABASE`, `DROP TABLE`, or `TRUNCATE` in raw SQL against live/production databases (e.g. Neon, Supabase, Cloud SQL).
- Always verify if a migration script drops existing data before applying it.
- In Prisma, prefer safe additions and `prisma db push` / `prisma migrate dev` with review rather than wiping data.

### 3. File System & OS Guardrails
- **NEVER** run recursive deletion (`rm -rf` / `Remove-Item -Recurse -Force`) on project root or parent system directories.
- Temporary files must be created strictly in the scratch directory or artifact path.
- Always check working tree status (`git status`) before and after bulk edits.

## Pre-Flight Verification Checklist
Before running any state-altering batch operation:
1. Is this command reversible?
2. Did the user explicitly ask or approve this destructive step?
3. Have all test suites passed?
If any answer is "No", HALT and confirm with the user.
