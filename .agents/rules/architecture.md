---
trigger: always_on
---

# Architecture Rules — MyContentPal

---

## 1. Architecture Rules

- Use **Next.js 15 App Router** exclusively — never mix with Pages Router
- All routes are grouped by concern using route groups: `(auth)` and `(dashboard)`
- All server-side logic lives in `app/api/` — never in components or client files
- All generation requests go through `app/api/generate/route.ts` only
- All shared utilities live in `lib/` — no logic in components beyond rendering
- `lib/generate.ts` contains all prompt-building and generation logic
- `types/index.ts` is the single source of truth for all shared TypeScript types
- Design tokens in `tokens/` are read-only — never edit them directly

---

## 2. The Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Database | PostgreSQL |
| ORM | Prisma |
| Styling | CSS Modules + CSS custom properties (design tokens) |
| Auth | NextAuth.js |
| Validation | Zod |
| Hosting | Vercel |

---

## 3. Directory Layout

```
mycontentpal/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx          ← main input form + action selector
│   │   └── history/
│   │       └── page.tsx          ← past session results
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts
│       └── generate/
│           └── route.ts          ← core generation endpoint
├── components/
│   ├── ui/                       ← Button, Input, Card, Badge, Spinner
│   └── features/                 ← InputForm, PlatformToggle, ActionSelector,
│                                    ResultCard, StrategyBlock, IdeaList
├── lib/
│   ├── db.ts                     ← Prisma client singleton
│   ├── generate.ts               ← generation client + prompt builders
│   ├── auth.ts                   ← NextAuth config + authOptions
│   └── utils.ts                  ← sanitize, format, and shared helpers
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── tokens/
│   ├── tokens.css                ← DO NOT touch. Design token source of truth.
└── types/
    └── index.ts                  ← all shared TypeScript types
```

---

## 4. Rendering Rules

| Page / Component | Rendering Strategy | Reason |
|---|---|---|
| `/login`, `/signup` | Server Component | No interactivity needed |
| `/dashboard` | Client Component (`"use client"`) | Form state and user interaction |
| `/history` | Server Component | Read-only data fetched server-side |
| Result display blocks | Server Component | Streamed from server where possible |
| UI primitives (Button, Input) | Client Component only if interactive | Default to Server |

- Always default to **Server Components**
- Only add `"use client"` when the component requires `useState`, `useEffect`, or browser events
- Never fetch data inside a Client Component — pass it as props from a Server Component above

---

## 5. Data Flow

```
User submits form (Client)
        ↓
POST /api/generate (Server — route.ts)
        ↓
Auth check (NextAuth session)
        ↓
Input validation (Zod)
        ↓
String sanitization (lib/utils.ts)
        ↓
Prompt built (lib/generate.ts)
        ↓
Generation request processed (lib/generate.ts)
        ↓
Response parsed + structured
        ↓
Session saved to PostgreSQL (Prisma)
        ↓
JSON response returned to client
        ↓
Result rendered in UI (Server Component)
```

- Data only flows **down** from server to client via props or server-fetched data
- The client never calls the database directly
- The client never calls the generation service directly

---

## 6. State Management

- Use React `useState` and `useReducer` for **local, component-level** form state only
- No global state library is needed for the MVP
- Server state (session history, user profile) is always fetched server-side via Prisma and passed as props
- Loading and error states are managed locally within the component that triggers the request
- Do not use Context API for data that can be fetched server-side

---

## 7. Database Access

- Use **Prisma ORM** for all database operations — never write raw SQL
- The Prisma client is instantiated once as a singleton in `lib/db.ts`
- Import the Prisma client only from `lib/db.ts` — never instantiate it elsewhere
- All queries must be scoped to the authenticated user:

```ts
// Always do this
const sessions = await prisma.session.findMany({
  where: { userId: currentUser.id },
})
```

- All schema changes must go through a Prisma migration — never alter tables manually
- Commit all migration files in `prisma/migrations/` to version control

---

## 8. Authentication

- Use **NextAuth.js** for all authentication — no custom auth logic
- Auth configuration lives in `lib/auth.ts` and is exported as `authOptions`
- Protect all dashboard and API routes using Next.js middleware:

```ts
// middleware.ts
export { default } from "next-auth/middleware"

export const config = {
  matcher: ["/dashboard/:path*", "/history/:path*", "/api/generate/:path*"],
}
```

- Session tokens are stored in secure, httpOnly cookies — never in localStorage or sessionStorage
- Always check the session server-side using `getServerSession(authOptions)` inside API routes
- Redirect unauthenticated users to `/login`

---

## 9. Error Handling

- All API routes must wrap business logic in a `try/catch` block
- Log errors server-side with a consistent prefix: `console.error("[GENERATE ERROR]", error)`
- Never return raw error objects, stack traces, or internal messages to the client
- Return clean, user-safe JSON on failure:

```ts
// On validation failure
return NextResponse.json({ error: "Invalid input" }, { status: 400 })

// On auth failure
return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

// On server error
return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
```

- Display user-friendly error messages in the UI — never expose raw API error text
- Handle empty and loading states explicitly in every component that fetches or submits data

---

## 10. Environment

Required variables — all must be present before the app runs:

```
DATABASE_URL        ← PostgreSQL connection string
NEXTAUTH_SECRET     ← Random 32-character secret string
NEXTAUTH_URL        ← Full app URL (e.g. https://mycontentpal.com)
```

- All variables live in `.env.local`
- Commit a `.env.example` file with empty values as a reference
- Never commit `.env.local` to version control — add it to `.gitignore`
- Never hardcode secrets anywhere in the codebase
- Never log environment variable values, even during debugging

---

## 11. What Not To Do

- ❌ Do not use the Pages Router — App Router only
- ❌ Do not call the database from a component or client-side file
- ❌ Do not call the generation service from a component or client-side file
- ❌ Do not use `export default` for components — use named exports
- ❌ Do not add `"use client"` to a component unless interactivity is genuinely required
- ❌ Do not write raw SQL — use Prisma
- ❌ Do not alter the database schema without a Prisma migration
- ❌ Do not edit files in `tokens/` — they are the design token source of truth
- ❌ Do not store session tokens in localStorage or sessionStorage
- ❌ Do not return stack traces or internal errors to the client
- ❌ Do not hardcode environment variables
- ❌ Do not build features outside the PRD scope without flagging first
- ❌ Do not use a global state library — local state and server-fetched data only