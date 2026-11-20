# Antigravity Agent Guardrails & Quality Standards

## 1. Git Safety Guardrail (DCG)
- **Do NOT execute `git push`** without explicit user instruction and confirmation.
- Keep commits local, clean, atomic, and verified.
- Do NOT use destructive `git reset --hard` or `git checkout -- .` without backing up work.

## 2. Code Quality & Anti-Slop
- Adhere strictly to the Stitch Neo-Brutalist design language (`ink-border`, `shadow-[3px_3px_0px_#000]`, Bricolage font, high-contrast dark/light mode).
- Never use generic placeholder text or dead links.
- Write type-safe TypeScript code without `any` where possible.
- Ensure all tests pass before completing tasks.
