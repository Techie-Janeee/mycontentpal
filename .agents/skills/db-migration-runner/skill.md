---
trigger: always_on
---

# SKILL.md — DB Migration Runner

## Purpose
Use this skill whenever you need to change the database schema — adding a table, adding a column, changing a type, or adding a relation. It ensures all schema changes are tracked, reversible, and consistent with Prisma conventions.

---

## Before You Run a Migration
1. Read `.agents/rules/architecture.md` for the data model definitions
2. Read `.agents/rules/security.md` for data ownership rules
3. Confirm the change is required by a feature in the PRD — do not add fields speculatively

---

## Current Schema (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id         String    @id @default(cuid())
  email      String    @unique
  createdAt  DateTime  @default(now())
  sessions   Session[]
}

model Session {
  id          String   @id @default(cuid())
  userId      String
  inputData   Json
  outputData  Json
  createdAt   DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id])
}
```

---

## Migration Steps

### Step 1 — Edit the Schema
Make your change in `prisma/schema.prisma` only. Do not write raw SQL.

### Step 2 — Generate the Migration
```bash
npx prisma migrate dev --name describe-your-change
```
Use a short, descriptive name (e.g. `add-platform-to-session`, `add-user-display-name`).

### Step 3 — Verify
```bash
npx prisma studio
```
Open Prisma Studio and confirm the new table/column appears as expected.

### Step 4 — Regenerate the Client
```bash
npx prisma generate
```
Always run this after a migration so TypeScript types stay in sync.

---

## Rules
- Never write or run raw SQL migrations — use Prisma only
- Never delete a column without confirming it is unused across the entire codebase
- Every new relation must have a corresponding `@relation` defined on both sides
- All new string fields must have a reasonable `@db.VarChar(n)` limit where applicable
- Migration files in `prisma/migrations/` must be committed to version control
- Never run `prisma migrate reset` in production

---

## Adding a New Field — Example

**Goal:** Add `platform` field to the `Session` model.

1. Edit `prisma/schema.prisma`:
```prisma
model Session {
  ...
  platform  String   // "TikTok" or "Instagram"
}
```

2. Run:
```bash
npx prisma migrate dev --name add-platform-to-session
npx prisma generate
```

3. Update any Prisma queries in `app/api/` that create or read sessions to include `platform`.

---

## Checklist Before Finishing
- [ ] Schema change is minimal and only what the feature requires
- [ ] Migration has a clear, descriptive name
- [ ] `prisma generate` has been run after the migration
- [ ] All API routes that use the affected model have been updated
- [ ] No unused fields left in the schema