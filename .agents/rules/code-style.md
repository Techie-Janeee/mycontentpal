---
trigger: always_on
---

# Code Style Rules — MyContentPal

## Language
- Use **TypeScript** for all files (`.ts` / `.tsx`)
- Enable strict mode in `tsconfig.json`
- Never use `any` — define proper types or interfaces

## Naming Conventions
| Thing | Convention | Example |
|---|---|---|
| Components | PascalCase | `ContentIdeaCard.tsx` |
| Hooks | camelCase with `use` prefix | `useGenerateContent.ts` |
| Utility functions | camelCase | `buildPrompt.ts` |
| API routes | kebab-case folders | `api/generate/route.ts` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRIES` |
| Types / Interfaces | PascalCase with descriptive name | `ContentSession`, `GenerateInput` |

## Component Rules
- One component per file
- Always define and export prop types above the component
- Use named exports for components, not default exports (exception: Next.js page files)

```tsx
// Good
export type ContentIdeaCardProps = {
  ideas: string[]
  platform: "TikTok" | "Instagram"
}

export function ContentIdeaCard({ ideas, platform }: ContentIdeaCardProps) {
  ...
}
```

## TypeScript Types
Define shared types in `lib/types.ts`:

```ts
export type Platform = "TikTok" | "Instagram"

export type Action =
  | "content-audit"
  | "idea-generation"
  | "strategy-recommendation"
  | "competitor-insights"

export type GenerateInput = {
  pageLink: string
  niche: string
  platform: Platform
  action: Action
}

export type GenerateOutput = {
  action: Action
  result: string
  createdAt: string
}
```

## Imports
- Use absolute imports via `@/` alias (configured in `tsconfig.json`)
- Group imports: external libraries → internal modules → types → styles

```tsx
import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/Button"
import { buildPrompt } from "@/lib/generate"

import type { GenerateInput } from "@/lib/types"
```

## Error Handling
- Return meaningful error messages from API routes
- Display user-friendly error states in the UI — never expose raw errors

## Comments
- Write comments for non-obvious logic only
- Use JSDoc for exported utility functions
