## Quick start

Needs **Node 22+** (Apple Silicon: use an `arm64` Node — Rosetta/`x64` Node breaks native Vite/esbuild binaries).

```bash
# 1) shared types
cd core && npm install && cd ..

# 2) API  → http://localhost:3000
cd server && npm install && npm run dev

# 3) UI   → http://localhost:5173  (proxies /api and /assets)
cd client && npm install && npm run dev
```

Seed images live under `recolour-case/Ticket 1..4/` and are served at `/assets/...`.

### Useful scripts

| Where | Command | What |
|-------|---------|------|
| `server/` | `npm run dev` | API with `tsx` watch |
| `server/` | `npm test` | Vitest + supertest |
| `server/` | `npm run build` && `npm start` | compile then run `dist/` (build `core` first) |
| `client/` | `npm run dev` | Vite |
| `client/` | `npm run build` | typecheck + production bundle |
| `client/` | `npm test` | Vitest + Vue Test Utils |
| `core/` | `npm run build` | emit shared package |

Optional: `JWT_SECRET`, `PORT` (default `3000`).

---

## Demo auth

No real passwords. Login picks a **role**; server issues a JWT.

| Role | Demo email | Can |
|------|------------|-----|
| **Operator** | `operator@recolour.demo` | Create, queue, send to partner, view library / partners / dashboard |
| **Manager** | `manager@recolour.demo` | Everything operator can + **Approve / Reject** completed tickets |

Switch role anytime from the header select (re-login). UI hides Approve/Reject for operators; the API still returns **403** if called — hide ≠ security.

Token is stored in `sessionStorage` for the tab session.

---

## Demo script (happy path)

1. Sign in as **operator**.
2. **Create** a ticket (seed images and/or JPEG upload) → submit.
3. **Queue** → open a `pending` ticket → **Send to partner**.
4. Watch status: `sent` → `in_progress` → `completed` (mock partner, ~1s; detail view polls).
5. Switch header role to **manager** → **Approve** (Approved library) or **Reject** (back to `pending`).
6. Check **Dashboard** KPIs and **Partners**.

Invalid create bodies return Zod field errors from the API.

---

## Status machine

Owned by the server (`server/src/domain/transitions.ts`):

| Action | From | To |
|--------|------|-----|
| Send | `pending` | `sent` (+ `partnerReceiptId`) |
| Partner progress (timer or `POST .../partner-progress`) | `sent` | `in_progress` |
| Partner progress | `in_progress` | `completed` |
| Approve (manager) | `completed` | removed → Approved library |
| Reject (manager) | `completed` | `pending` (re-queue; receipt cleared) |

`rejected` remains in the shared enum for filters/API symmetry but is **not** used by reject (product choice: back on queue). Seed data still includes `sent` / `in_progress` examples.

This is a **mock partner**, not a real webhook — timers + explicit progress endpoint stand in for async partner updates.

---

## Assumptions

- **In-memory store** — resets on server restart; seeded tickets + partners on boot.
- **Mock partner** — send + timed/manual progress; no external APIs.
- **Images** — seed allowlist (`..` / absolute rejected). Optional `POST /api/uploads`: JPEG only (MIME + magic bytes, 20MB, random name; SVG rejected).
- **Auth** — demo JWT, not production identity.

---

## Architecture notes

```
client/   Vue SPA (proxy to API)
server/   Express API + domain rules + Vitest
core/     @recolour/core — shared ticket/auth/error contract types
recolour-case/  seed assets + guidelines
```

- Status transitions and AuthZ live on the **server**.
- Shared API error shape: `{ error: { code, message, details? } }`.
- Create form stays thin; **server Zod is the source of truth**.
- Demo telemetry: `logEvent` → JSON stdout (`server/src/lib/telemetry.ts`). Silent under `NODE_ENV=test`.

### Roles (enforced server-side)

| Action | Operator | Manager |
|--------|----------|---------|
| Queue / create / send | ✓ | ✓ |
| Approve / reject | ✗ | ✓ |
| Dashboard / approved / partners | ✓ | ✓ |

---

## Security notes (what this demo shows)

- JWT `authenticate` + `authorize(...roles)` on protected routes
- Zod `validateBody` / `validateQuery` at the boundary
- Image paths allowlisted (seed **or** validated uploads)
- Upload checks: MIME, JPEG magic bytes, size limit, never trust original filename
- CORS limited to local Vite origins; JSON body size capped
- Demo `JWT_SECRET` default is for local use only

Not claimed as production-hardening: no refresh tokens, no rate limits, no helmet/CSP pass, no real IdP.

---

## Tests

Focused, high-signal cases — not coverage theater.

**Server:** status transitions, partner progress, role 403, Zod 400, allowlist, upload magic bytes, create → send → progress → approve.

**Client:** router auth redirects, operator vs manager Approve/Reject visibility, create form maps `VALIDATION_ERROR.details`, ticket filter query builder.

Gaps: no Playwright e2e; Queue/Dashboard not fully unit-tested.

```bash
cd server && npm test
cd client && npm test
```

---

## Skipped / production next steps

| Skipped here | Would add in prod |
|--------------|-------------------|
| Real DB | Postgres (or similar) + migrations |
| Real partner integration | Signed webhooks, idempotent receipts, retries |
| Object storage for uploads | S3/GCS + virus scan |
| Real observability sink | Datadog/OTel behind `logEvent` |
| Full OAuth | Proper IdP, short-lived access + refresh |
| Broader client / e2e | Playwright smoke |

---

## Tradeoffs

- In-memory keeps the case reviewable in minutes; data is ephemeral by design.
- Partner simulation uses short timers + an explicit progress endpoint so the status machine is real and testable without flaky sleeps in CI.
- Shared `core/` avoids drifting types without a heavy monorepo toolchain.
- Custom create form (not TanStack/VeeValidate): fewer deps; server remains the validator of record.
