---
trigger: always_on
---

# MyContentPal — Agent Project Brief

## What This Product Is

MyContentPal is a content strategy assistant for beginner content creators and small business owners. Users input their social media link or user name, niche, and platform, then receive structured content guidance — ideas, audits, strategies, and competitor insights.

**Core promise:** Get a clear, actionable content strategy in seconds.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| Database | PostgreSQL |
| ORM | Prisma (SQLite for dev, PostgreSQL for production) |
| Styling | CSS Modules + CSS custom properties (design tokens) |
| Auth | NextAuth.js |
| Hosting | Vercel |

---

## Folder Structure

```
mycontentpal/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/
│   │   ├── dashboard/        ← input form + action selector
│   │   └── history/          ← past sessions
│   └── api/
│       ├── auth/
│       └── generate/         ← core generation endpoint
├── components/
│   ├── ui/                   ← primitive components (Button, Input, Card, Badge)
│   └── features/             ← forms, result display, platform toggle, action selector
├── lib/
│   ├── db.ts                 ← Prisma client singleton
│   ├── generate.ts           ← generation client + prompt builders
│   ├── auth.ts               ← NextAuth config
│   └── utils.ts              ← shared helpers (sanitize, format, etc.)
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── tokens/
│   ├── tokens.css             ← DO NOT touch. Design token source of truth.
└── types/
    └── index.ts              ← shared TypeScript types
```

---

## Data Models

These match the database schema exactly. Use these as the reference for all data operations.

### User
```
id          String    @id @default(cuid())
email       String    @unique
createdAt   DateTime  @default(now())
sessions    Session[]
```

### Session
```
id          String    @id @default(cuid())
userId      String
inputData   Json                          ← { niche, platform, action, description? }
outputData  Json                          ← structured response
createdAt   DateTime  @default(now())
user        User      @relation(...)
```

---

## Key Business Rules

- The four valid actions are: `content-audit`, `idea-generation`, `strategy-recommendation`, `competitor-insights`. No other actions should be accepted.
- Valid platforms are `TikTok` and `Instagram` only.
- All generation calls happen server-side in `app/api/generate/` only. The generation client must never be imported in any component or client-side file.
- All user inputs must be validated with Zod and sanitized (strip HTML, enforce length limits) before processing.
- Every successful generation must be saved as a `Session` record in PostgreSQL before the response is returned.
- A user can only read their own sessions. Always scope DB queries with `where: { userId: currentUser.id }`.
- If the niche input is too vague or missing, the response should ask a clarifying question rather than generate low-quality output.

---

## Output Rules

These rules apply to every generation request:

- Always include `platform` and `niche` in the prompt context
- If a `description` is provided, use it as the primary source for tailoring the response
- Output must be structured, scannable, and beginner-friendly — no jargon, no filler
- Per action, the output must include:

| Action | Expected Output |
|---|---|
| `content-audit` | Positioning summary + 3 clear improvement points |
| `idea-generation` | At least 5 specific, ready-to-use post ideas |
| `strategy-recommendation` | Top 3 prioritised actions to take this week |
| `competitor-insights` | 3–5 patterns from successful creators in the niche |

---

## Environment Variables Required

```
DATABASE_URL
NEXTAUTH_SECRET
NEXTAUTH_URL
DEEPSEEK_API_KEY
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
SMTP_FROM
```

All secrets live in `.env.local`. Never hardcode them. Never log them.

## .env.example

```
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
DEEPSEEK_API_KEY=
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Copy this file to `.env.local` and fill in the values before running the app.

---

## User Flows (Reference)

**Creator:** Sign up → Dashboard → Enter niche + platform + action → Submit → Receive structured output → Apply recommendations

**System:** Input received → Auth checked → Input validated with Zod → Strings sanitized → Prompt built → Request processed → Response parsed → Session saved to DB → Structured output returned to user

**Edge Cases:**
- No input / vague niche → Ask a clarifying question
- Broad niche (e.g. "lifestyle") → Suggest narrowing before generating
- Low engagement signals in audit → Prioritise hook and opening line advice