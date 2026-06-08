---
trigger: always_on
---

# SKILL.md — API Route Scaffolder

## Purpose
Use this skill whenever you need to create a new API route in MyContentPal. It ensures every route is secure, validated, typed, and consistent with the app's architecture.

---

## Before You Build
1. Read `.agents/rules/architecture.md` for route placement and API design rules
2. Read `.agents/rules/security.md` for input validation and auth requirements
3. Read `.agents/rules/code-style.md` for TypeScript and naming conventions

---

## Route Location
All API routes live under `app/api/`:

```
app/api/
  generate/route.ts       ← Core AI generation (main route)
  auth/[...nextauth]/route.ts
  sessions/route.ts       ← Fetch session history
  sessions/[id]/route.ts  ← Fetch single session
```

---

## API Route Template

```ts
// app/api/{route-name}/route.ts

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// 1. Define and export the input schema
const InputSchema = z.object({
  // define expected fields here
})

export async function POST(req: NextRequest) {
  // 2. Auth check
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // 3. Parse and validate body
  const body = await req.json()
  const parsed = InputSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 })
  }

  try {
    // 4. Business logic here

    return NextResponse.json({ result: "..." }, { status: 200 })
  } catch (error) {
    console.error("[API ERROR]", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
```

---

## Generate Route Specifics (`app/api/generate/route.ts`)
This is the core route. It must:
1. Authenticate the user
2. Validate input with Zod (`GenerateInputSchema` from `lib/types.ts`)
3. Sanitize niche and pageLink strings
4. Call `buildPrompt()` from `lib/generate.ts` to construct the prompt
5. Save the session to PostgreSQL via Prisma
6. Return the structured AI output as JSON

---

## Rules
- Every route must authenticate with `getServerSession` before doing anything else
- Every route must validate its request body with Zod before processing
- Always return consistent JSON shapes: `{ result }` on success, `{ error }` on failure
- Always log errors server-side with a `[API ERROR]` prefix
- Never return raw error objects or stack traces to the client

---

## Checklist Before Finishing
- [ ] Route is placed correctly under `app/api/`
- [ ] Auth check is the first thing in the handler
- [ ] Zod schema validates all expected input fields
- [ ] Session is saved to DB after successful generation (if applicable)
- [ ] Success and error responses both return consistent JSON
- [ ] No secrets or internal errors exposed in the response