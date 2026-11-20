---
name: anti-slop-ui
description: >-
  Frontend and UI/UX design quality standards that prevent generic AI slop,
  enforce authentic design tokens, clean typography, dark/light contrast,
  and zero-bloat component patterns. Use when designing, reviewing, or building UI.
---

# Anti-Slop UI & Pro Max Design Principles

Origin: `@miqdadbadjuber/anti-slop` & `@nextlevelbuilder/ui-ux-pro-max-skill` (GitHub Open-Source)

This skill guides the AI agent to write clean, purposeful, production-ready frontend code without bloated templates, clichéd filler, or generic AI styling.

## Anti-Slop Core Rules

### 1. Eliminating AI Slop Copy & Placeholders
- **NEVER** use clichéd filler text like *"Welcome to the future of digital solutions"*, *"Experience seamless synergy"*, or *"Your one-stop shop for all your needs"*.
- Write authentic, concise, localized domain copy (e.g. Indonesian e-commerce idioms: *"Proses Otomatis 1-3 Detik"*, *"Garansi Saldo Kembali"*, *"Metode QRIS & VA Resmi"*).
- No dead placeholder links (`href="#"`). Always point to real routes or valid anchors.

### 2. Design System & Token Discipline
- Respect the existing design language (e.g., Neo-Brutalist Stitch UI with `ink-border`, `shadow-[3px_3px_0px_#000]`, pastel accents, Bricolage font).
- Do not mix conflicting design systems (e.g. do not inject Material ripples or glassmorphism into a neo-brutalist ink-border layout).
- Ensure high contrast: text must be clearly readable in both light and dark mode.

### 3. Zero-Bloat Component Architecture
- Do NOT install heavy component libraries if the functionality can be achieved with Tailwind CSS + Radix UI / unstyled primitives.
- Prefer copy-paste components (shadcn/ui philosophy) over heavy monolithic npm packages.
- Always implement responsive states (mobile-first, touch targets minimum 44x44px).
- Provide meaningful loading skeleton states rather than jarring layout shifts (CLS).
