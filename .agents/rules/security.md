---
trigger: always_on
---

# Security Rules — MyContentPal

---

## 1. Security Rules

- this is non-negotiable. Security is not optional — every feature must be built with it in mind from the start
- Validate all input on the server regardless of client-side validation
- Never trust user-supplied data — sanitize before storing, processing, or rendering
- Every API route must check authentication before executing any logic
- Users may only access their own data — enforce ownership on every query
- No private social media account data is ever requested, stored, or accessed
- All secrets live in environment variables — never in code, comments, or logs
- When in doubt, deny — default to the most restrictive behaviour

---

## 2. Secrets and Configuration

- All secrets and environment variables live in `.env.local` exclusively
- Never commit `.env.local` to version control — it must be in `.gitignore`
- Commit a `.env.example` with empty placeholder values as a reference:

```
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

- Never hardcode any secret, API key, or connection string anywhere in the codebase
- Never log environment variable values — not even during local development or debugging
- Rotate `NEXTAUTH_SECRET` immediately if it is ever exposed
- All production secrets must be set as encrypted environment variables in Vercel — never in plain text

---

## 3. Authentication

- Use **NextAuth.js** for all authentication — no custom auth implementation
- Auth configuration lives in `lib/auth.ts` and is exported as `authOptions`
- Protect all dashboard pages and API routes using Next.js middleware:

```ts
// middleware.ts
export { default } from "next-auth/middleware"

export const config = {
  matcher: ["/dashboard/:path*", "/history/:path*", "/api/generate/:path*"],
}
```

- Session tokens are stored in secure, **httpOnly cookies** — never in localStorage or sessionStorage
- Always verify the session server-side using `getServerSession(authOptions)` at the top of every API route handler
- Unauthenticated requests to protected routes must return `401 Unauthorized` immediately — no further processing
- Unauthenticated users accessing protected pages must be redirected to `/login`
- Passwords must be hashed using **bcrypt** with a minimum cost factor of 12 before storage — never store plaintext passwords
- Session expiry must be enforced — do not issue indefinite sessions

---

## 4. Input Validation

- Validate every incoming API request body using **Zod** before any processing
- Define and export all Zod schemas from `lib/validation.ts`
- Reject any request that fails validation immediately with a `400` status — do not attempt to fix or guess the input
- Core validation schema:

```ts
import { z } from "zod"

export const GenerateInputSchema = z.object({
  pageLink: z.string().url(),
  niche: z.string().min(2).max(200).trim(),
  platform: z.enum(["TikTok", "Instagram"]),
  action: z.enum([
    "content-audit",
    "idea-generation",
    "strategy-recommendation",
    "competitor-insights",
  ]),
})
```

- All string inputs must be trimmed and length-capped before use
- Sanitize string inputs to strip HTML tags before any processing:

```ts
export function sanitize(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim()
}
```

- Never pass unvalidated or unsanitized user input into database queries, generation prompts, or response payloads

---

## 5. SQL Injection

- Use **Prisma ORM** for all database operations — never write or concatenate raw SQL
- Prisma's parameterized queries prevent SQL injection by default — do not bypass this
- Never use `$queryRaw` or `$executeRaw` with user-supplied values unless absolutely necessary, and if so, use Prisma's `Prisma.sql` tagged template:

```ts
// Safe — parameterized
const result = await prisma.$queryRaw`SELECT * FROM sessions WHERE id = ${sessionId}`

// Never do this
const result = await prisma.$queryRaw`SELECT * FROM sessions WHERE id = '${sessionId}'`
```

- All queries must be scoped to the authenticated user to prevent cross-user data access:

```ts
const session = await prisma.session.findFirst({
  where: { id: sessionId, userId: currentUser.id },
})
if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 })
```

---

## 6. Cross-Site Scripting (XSS)

- Never render raw user-supplied content using `dangerouslySetInnerHTML`
- All user input displayed in the UI must be rendered as plain text — React escapes values by default, do not bypass this
- Sanitize all string inputs server-side before storing them in the database (see Section 4)
- Content Security Policy (CSP) headers must be set in `next.config.ts`:

```ts
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Content-Security-Policy",
    value: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';",
  },
]
```

- Never trust content returned from external URLs (e.g. user-supplied page links) — treat it as untrusted data

---

## 7. Cross-Site Request Forgery (CSRF)

- NextAuth.js provides built-in CSRF protection for all auth routes — do not disable or bypass it
- All state-changing operations (generation, data deletion) must use `POST`, `PUT`, or `DELETE` — never `GET`
- Next.js App Router API routes are same-origin by default — do not configure CORS to allow arbitrary origins
- If CORS headers are ever needed, restrict them to known, trusted domains only:

```ts
// Never do this
headers.set("Access-Control-Allow-Origin", "*")

// Do this instead
headers.set("Access-Control-Allow-Origin", "https://mycontentpal.com")
```

- Verify the `origin` header on sensitive API routes if additional protection is needed

---

## 8. Social Media Links

- `pageLink` must pass Zod's `z.string().url()` validation before use
- Only accept links from known platforms. Validate the hostname before processing:

```ts
const ALLOWED_HOSTS = ["instagram.com", "www.instagram.com", "tiktok.com", "www.tiktok.com"]

const url = new URL(pageLink)
if (!ALLOWED_HOSTS.includes(url.hostname)) {
  return NextResponse.json({ error: "Unsupported platform URL" }, { status: 400 })
}
```

- Never authenticate with, request tokens from, or access private accounts on any platform
- Only public profile URLs are accepted — do not store, scrape, or process private account data
- Store only the URL string — never store scraped content from the linked page

---

## 9. Rate Limiting

- Apply rate limiting to `app/api/generate/route.ts` to prevent abuse and runaway costs
- Use **Upstash Redis + `@upstash/ratelimit`** for serverless-compatible rate limiting on Vercel:

```ts
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute per user
})

const { success } = await ratelimit.limit(userId)
if (!success) {
  return NextResponse.json({ error: "Too many requests" }, { status: 429 })
}
```

- Rate limit by authenticated `userId` — not by IP alone, as IPs can be shared
- Return `429 Too Many Requests` when the limit is exceeded
- Auth routes (`/api/auth/`) should also be rate-limited to prevent brute-force login attempts
- Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to `.env.local` and `.env.example`

---

## 10. Logging

- Log errors server-side using a consistent prefix pattern:

```ts
console.error("[GENERATE ERROR]", error)
console.error("[AUTH ERROR]", error)
console.error("[DB ERROR]", error)
```

- Never log the following under any circumstances:
  - Passwords or password hashes
  - Session tokens or cookies
  - Environment variable values
  - Full request bodies that may contain sensitive user input
  - Database connection strings
- Logs are for debugging server behaviour — not for storing user data
- In production, use a structured logging service (e.g. Vercel Log Drains, Axiom) instead of raw `console.log`
- Do not log successful generation outputs — they may contain personal niche or business details

---

## 11. Dependencies

- Keep all dependencies up to date — run `npm audit` regularly
- Address any `high` or `critical` severity vulnerabilities immediately
- Do not install packages that are unmaintained, have known vulnerabilities, or have no clear purpose
- Review the permissions and scope of every new dependency before adding it
- Lock dependency versions using `package-lock.json` — commit the lockfile to version control
- Do not use `--force` or `--legacy-peer-deps` to bypass dependency conflicts without understanding the cause
- Prefer well-maintained, widely-used packages over niche alternatives for security-critical functionality (auth, validation, hashing)

---

## 12. Incident Response

If a security issue is discovered:

1. **Contain** — disable the affected route, feature, or endpoint immediately if the risk is active
2. **Assess** — determine what data was exposed, which users were affected, and for how long
3. **Rotate** — rotate all secrets that may have been compromised (`NEXTAUTH_SECRET`, database credentials, etc.) immediately via Vercel environment settings
4. **Notify** — if user data was exposed, notify affected users promptly and clearly
5. **Fix** — patch the vulnerability in a dedicated branch, review the fix before merging
6. **Document** — write a post-incident summary describing what happened, the root cause, and what was changed to prevent recurrence
7. **Review** — audit related areas of the codebase for the same class of vulnerability

**Common scenarios:**
- Secret committed to git → rotate immediately, rewrite git history, audit access logs
- SQL injection found → patch query, audit all Prisma usages, run `npm audit`
- Unauthorised data access → scope fix, audit all DB queries for missing `userId` checks
- Brute-force on auth → enforce rate limiting on auth routes, consider account lockout