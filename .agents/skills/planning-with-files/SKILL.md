---
name: planning-with-files
description: >-
  Persistent file-based memory and task planning methodology for AI agents.
  Use when managing multi-step workflows, long tasks, complex refactors, or
  audits to preserve context across session resets, restarts, and context compactions.
---

# Planning with Files (Persistent Agent Memory Pattern)

Origin: `@OthmanAdi/planning-with-files` (GitHub Open-Source)

This skill provides an autonomous AI agent with a standardized, structured memory architecture using persistent Markdown files in the workspace or artifact directory.

## Core Files

When embarking on a non-trivial project or multi-step task, maintain these files:

### 1. `task_plan.md` (Active Roadmap & Checklist)
- **Goal**: One-sentence definition of the current objective.
- **Phases / Steps**:
  - `[ ]` Not started
  - `[/]` In progress (with active step timestamp)
  - `[x]` Completed and verified
- **Rules**: Never mark `[x]` without concrete verification (unit test, build pass, or visual check).

### 2. `findings.md` (Domain Knowledge & Discovery Log)
- Architectural discoveries (endpoints, Prisma schema constraints, env variables, secrets format).
- Invariants & breaking changes to watch out for.
- External dependencies and integration quirks (e.g. legacy peer deps, webhook signatures).

### 3. `progress.md` (Chronological Verification Log)
- Every significant action taken.
- Terminal commands executed and their output summary.
- Git commit hash or status after each phase.

## Compaction & Context Recovery Workflow

Whenever context compaction occurs or a new turn begins:
1. First read `task_plan.md` to restore the active goal and remaining checklist.
2. Read `findings.md` to avoid re-investigating known facts or falling into previously identified traps.
3. Resume execution from the active step without re-asking the user for context.
