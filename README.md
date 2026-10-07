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
2. Open **Queue** → open a `pending` ticket → **Send to partner** (mock flow jumps to `completed` with a receipt id).
3. Switch header role to **manager**.
4. Open the completed ticket → **Approve** (moves to Approved library) or **Reject** (back to `pending`).
5. Check **Dashboard** KPIs and **Partners** open counts.

Create flow: **Create** → fill fields → **Choose images** (seed allowlist) → submit. Invalid bodies return Zod field errors from the API.

---

## Assumptions

- **In-memory store** — resets on server restart; seeded tickets + partners on boot.
- **Mock partner** — `POST .../send` simulates partner receipt; no webhooks / external APIs.
- **Images** — seed paths are allowlisted (`..` / absolute rejected). Optional `POST /api/uploads` accepts JPEG only (MIME + magic bytes `FF D8 FF`, 20MB cap for large product shots, random stored name; SVG rejected).
- **Auth** — demo JWT for the take-home, not production identity.

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
- Create-ticket form stays thin on the client; **server Zod is the source of truth**. Field errors from `VALIDATION_ERROR.details` are mapped into the UI. No client form framework (unnecessary for one form).
- Demo telemetry: `logEvent(action, data)` → one JSON line on stdout for CRUD / transitions (`server/src/lib/telemetry.ts`). Silent under `NODE_ENV=test`.

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
- Image paths allowlisted against seed catalog **or** registry of validated uploads
- Upload checks: MIME allowlist, JPEG magic bytes, size limit, never trust original filename
- CORS limited to local Vite origins; JSON body size capped
- Demo `JWT_SECRET` default is for local use only

Not claimed as production-hardening: no refresh tokens, no rate limits, no helmet/CSP pass, no real IdP.

---

## Tests

Focused, high-signal cases — not coverage theater.

**Server** (~34): status machine / 409, role 403, Zod 400, allowlist, upload magic bytes, create → send → approve.

**Client** (~8): router auth redirects, operator vs manager Approve/Reject visibility, create form maps `VALIDATION_ERROR.details`, ticket filter query builder.

Gaps: no Playwright e2e; Queue/Dashboard views not unit-tested end-to-end.

```bash
cd server && npm test
cd client && npm test
```

---

## Skipped / production next steps

| Skipped here | Would add in prod |
|--------------|-------------------|
| Real DB | Postgres (or similar) + migrations |
| Real partner integration | Webhooks, idempotent receipts, retries |
| Object storage for uploads | S3/GCS + virus scan; uploads currently land in local `server/data/uploads` |
| Real observability sink | Swap `logEvent` console JSON → Datadog/OTel without changing call sites |
| Full OAuth | Proper IdP, short-lived access + refresh |
| Broader client / e2e coverage | Playwright smoke; more view-level tests beyond the focused set |
| Upload / ML / clipping path | Out of brief scope |

---

## Tradeoffs

- In-memory keeps the case reviewable in minutes; data is ephemeral by design.
- Partner send collapses to `completed` immediately so the approval path is easy to demo without timers.
- Shared `core/` avoids drifting ticket/auth types between Vue and Express without a heavy monorepo toolchain.
- Custom create form (not TanStack/VeeValidate): fewer deps; server remains the validator of record.
