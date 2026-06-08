---
trigger: always_on
---

# SKILL.md — Component Builder

## Purpose
Use this skill whenever you need to create a new React component for MyContentPal. It ensures every component is consistent with the design system, typed correctly, and placed in the right location.

---

## Before You Build
1. Read `.agents/rules/design-system.md` for colors, typography, and component patterns
2. Read `.agents/rules/code-style.md` for naming conventions and TypeScript rules
3. Confirm the component does not already exist in `components/`

---

## Component Categories & Locations

| Type | Folder | Examples |
|---|---|---|
| Reusable UI primitives | `components/ui/` | Button, Input, Card, Badge |
| Form elements | `components/forms/` | InputForm, PlatformToggle, ActionSelector |
| Result display | `components/results/` | IdeaCard, AuditResult, StrategyBlock, InsightCard |
| Layout | `components/layout/` | Navbar, PageWrapper, MobileContainer |

---

## Component Template

```tsx
// components/{category}/{ComponentName}.tsx

import type { ReactNode } from "react"

export type {ComponentName}Props = {
  // define all props with explicit types
}

export function {ComponentName}({ ...props }: {ComponentName}Props) {
  return (
    // JSX here — mobile-first CSS Modules classes
  )
}
```

---

## Rules
- One component per file
- Always export a named `Props` type above the component
- Use named exports (not `export default`) except for Next.js page files
- Use CSS Modules only — no inline styles, no Tailwind
- All interactive elements must have accessible `aria-label` or visible label text
- Loading and empty states must be handled within the component where relevant
- Never fetch data inside a component — receive data via props or use a Server Component above it

---

## Checklist Before Finishing
- [ ] Props type is defined and exported
- [ ] Component is placed in the correct `components/` subfolder
- [ ] CSS Modules classes follow the design system tokens
- [ ] Mobile layout works at 375px width
- [ ] Loading state handled (if async data is involved)
- [ ] No hardcoded strings that should be props
- [ ] Component is exported as a named export