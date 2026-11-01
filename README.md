# F&B Management — Backend

REST API for a centralized **Multi-Outlet F&B Management System**. One HQ
admin manages outlets, a master menu, menu-to-outlet assignments and
outlet-specific pricing. Each outlet's staff retrieves only their
assigned menu, manages their own inventory, and records sales with
concurrency-safe stock deduction and per-outlet sequential receipt
numbers.

- **Live API:** https://fb-management-backend.vercel.app
- **Live app (frontend):** https://fb-management-dev.netlify.app
- **Frontend repo:** https://github.com/shahadath-evenly/fb-management-frontend
- **Architecture documentation:** [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) (ERD, scaling plan, microservices evolution, offline POS strategy)

### Try the live app

Open the live app and log in as HQ Admin with:

| Field | Value |
|---|---|
| URL | https://fb-management-dev.netlify.app |
| Email | `admin@admin.com` |
| Password | `Test123$$` |

This gives full HQ access: manage outlets, create staff, manage the
master menu, assign items/prices to outlets, and view both reports.

## Tech stack

| Layer | Choice |
|---|---|
| Runtime | Node.js, ES modules |
| Framework | Express.js |
| Database | PostgreSQL |
| ORM | Prisma (`@prisma/adapter-pg` driver adapter) |
| Validation | Yup |
| Auth | JWT (14-day expiry), bcryptjs password hashing |
| Containerization | Docker / docker-compose |
| Deployment | Vercel (serverless) |

## Architecture

Layered, one direction of dependency only:

```
routes → controllers → services → repositories → Prisma → PostgreSQL
```

- **routes/** — endpoint definitions, `authenticate`/`authorize`
  middleware wiring, Yup `validate` middleware. No business logic.
- **controllers/** — HTTP concerns only: read `req`, call a service,
  shape the response with `successResponse`. No business logic.
- **services/** — business rules: price resolution, stock-decrement
  logic, receipt sequencing, report aggregation.
- **repositories/** — the only layer that talks to Prisma/SQL.
- **middlewares/** — `authenticate` (verifies JWT, re-reads the user
  from the DB on every request), `authorize(role)`, Yup `validate`,
  centralized `not-found`/`error` handlers.
- **utils/** — `ApiError`, `asyncHandler`, `successResponse`.

**Security-relevant design decisions:**

- `authenticateMiddleware` re-fetches the user row from the database on
  *every* request instead of trusting the JWT payload for role/outletId.
  A token is valid for 14 days, so if an admin deactivates a staff
  account or re-assigns them to a different outlet, that takes effect
  immediately — not after the old token expires.
- `outletId` for every staff-scoped endpoint (`/api/staff/*`) comes
  exclusively from `req.user` (built from the authenticated DB row),
  never from a client-supplied body/query/param. A staff member cannot
  reach another outlet's data by editing a request.
- Passwords are hashed with bcryptjs; hashes are never returned in any
  API response (`utils/sanitizeUser.js` strips them).
- There is no public registration endpoint. The only way an admin
  account is created is the seed/bootstrap script below; the only way a
  staff account is created is through an authenticated admin calling
  `POST /api/admin/staff`.
- All money fields are Prisma `Decimal` (Postgres `DECIMAL(10,2)`).
  Totals are summed with `Decimal.plus`, never JavaScript floats.
- Stock deduction during a sale is a single conditional `UPDATE ...
  WHERE stock >= quantity` per line item inside a DB transaction, with
  the affected row count checked — not a read-then-write. This is what
  makes concurrent sales against the same stock row safe (see
  `src/services/staff/sale.service.js`).
- Receipt numbers come from an atomic increment of a per-outlet counter
  row (`OutletReceiptCounter`) inside the same transaction as the sale,
  with a `(outletId, receiptNumber)` unique constraint as a backstop.

## Database schema

8 tables, every primary key a `uuid`, every monetary value a
`DECIMAL(10,2)`. Full relationships and an ERD are in
[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md#erd).

| Table | Purpose | Key constraints |
|---|---|---|
| `User` | Both HQ admins and outlet staff (`role` discriminates). Admin → `outletId = NULL`; staff → `outletId` required. | `email` unique; FK `outletId → Outlet` |
| `Outlet` | A physical outlet. | — |
| `MasterMenu` | A menu item HQ defines, with a base price. | — |
| `OutletMenu` | Assigns a `MasterMenu` item to an `Outlet` with an outlet-specific `price`. The source of truth for what an outlet sells and at what price. | unique `(outletId, menuId)` |
| `OutletInventory` | Stock of an assigned menu item at one outlet. | unique `(outletId, menuId)`; `stock` non-negative |
| `Sale` | One completed transaction at one outlet. | unique `(outletId, receiptNumber)` |
| `SaleItem` | One line of a `Sale`. Stores `unitPrice`/`subtotal` as a snapshot, so later price changes never alter historical totals. | FK `saleId`, `menuId` |
| `OutletReceiptCounter` | One row per outlet; `lastNumber` incremented atomically inside the sale transaction to produce the next receipt number. | unique `outletId` |

`User.status` / `Outlet.status` use a shared `EntityStatus` enum
(`active` / `inactive`) — deactivating a staff user or an outlet is a
soft toggle, not a delete, since both have FK-restricted history
(sales, inventory) that must never be lost.

Schema source is split by model under `prisma/schema/*.prisma`
(Prisma's multi-file schema support) rather than one monolithic file.

## Getting started (local)

### Prerequisites

- Node.js 22+
- A PostgreSQL database (local or hosted, e.g. [Neon](https://neon.tech))

### 1. Install

```bash
cd backend
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in `backend/.env`:

```env
PORT=5001
NODE_ENV=development

DATABASE_URL="postgresql://USER@localhost:5432/fnb_management?schema=public"

JWT_SECRET="a-long-random-string"
JWT_EXPIRES_IN="14d"

FRONTEND_URL="http://localhost:3000"

ADMIN_EMAIL=admin@admin.com
ADMIN_PASSWORD=Test123@@
```

### 3. Create the schema and seed the initial admin

```bash
npx prisma migrate deploy   # creates every table
npm run db:seed             # creates the initial HQ admin only
```

> Run `migrate deploy` before `db:seed` on any **new, empty** database —
> seeding only inserts rows, it never creates tables. If you see
> `The table 'public.User' does not exist in the current database`
> (Prisma `P2021`), this step was skipped.

To also generate demo outlets/menus/staff/sales for manual testing:

```bash
SEED_DEMO_DATA=true npm run db:seed
```

### 4. Run

```bash
npm run dev      # nodemon, http://localhost:5001
# or
npm start
```

Verify: `curl http://localhost:5001/api/health`

### Running with Docker instead

```bash
cp .env.example .env   # fill in POSTGRES_PASSWORD, JWT_SECRET, ADMIN_PASSWORD
docker compose up -d
```

`docker-entrypoint.sh` runs `prisma migrate deploy` then `prisma db
seed` automatically on every container start before the server boots —
migrations and the admin seed are safe to re-run (idempotent) so this
works identically on first boot and every restart. Postgres data
persists in the `backend_db_data` named volume.

## Useful scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start with nodemon (auto-restart) |
| `npm start` | Start once, no watcher |
| `npm run prisma:migrate` | Create a new migration from schema changes (dev only) |
| `npm run prisma:deploy` | Apply existing migrations (prod/CI-safe, no schema drift check) |
| `npm run prisma:studio` | Open Prisma Studio against `DATABASE_URL` |
| `npm run db:seed` | Create the initial admin (and demo data if `SEED_DEMO_DATA=true`) |

## API reference

Base path: `/api`. All responses use the shape:

```json
{ "success": true, "message": "...", "data": { ... } }
```

Errors:

```json
{ "success": false, "message": "...", "errors": { ... } }
```

(`errors` is present only for Yup validation failures; a stack trace is
included only when `NODE_ENV !== "production"`.)

Protected endpoints require `Authorization: Bearer <jwt>`. `admin`
endpoints reject any non-admin token with `403`; `staff` endpoints
reject any non-staff token with `403`. Staff endpoints never accept an
outlet id from the client — it is always the authenticated user's own
`outletId`.

### Auth — public / self

| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| `POST` | `/api/auth/login` | — | `{ email, password }` | Returns `{ token, user }`. |
| `GET` | `/api/auth/me` | any | — | Returns the authenticated user's safe fields. |

### Admin — outlets (`admin` only)

| Method | Path | Body / Query |
|---|---|---|
| `POST` | `/api/admin/outlets` | `{ name }` |
| `GET` | `/api/admin/outlets` | `?page=&limit=&search=&status=` |
| `PATCH` | `/api/admin/outlets/:id` | `{ name }` |
| `PATCH` | `/api/admin/outlets/:id/status` | `{ status: "active" \| "inactive" }` |
| `DELETE` | `/api/admin/outlets/:id` | — |

Creating an outlet also creates its `OutletReceiptCounter` row.

### Admin — staff (`admin` only)

| Method | Path | Body / Query |
|---|---|---|
| `POST` | `/api/admin/staff` | `{ firstName, lastName, email, password, outletId }` |
| `GET` | `/api/admin/staff` | `?page=&limit=&search=&status=` |
| `PATCH` | `/api/admin/staff/:id` | `{ firstName, lastName, email, outletId }` |
| `PATCH` | `/api/admin/staff/:id/status` | `{ status: "active" \| "inactive" }` |
| `DELETE` | `/api/admin/staff/:id` | — |

`role` is always forced to `staff` server-side; it is never accepted
from the request body. `outletId` must reference an existing outlet.

### Admin — master menu (`admin` only)

| Method | Path | Body / Query |
|---|---|---|
| `POST` | `/api/admin/menus` | `{ name, basePrice }` |
| `GET` | `/api/admin/menus` | `?page=&limit=&search=` |
| `PATCH` | `/api/admin/menus/:id` | `{ name, basePrice }` |
| `DELETE` | `/api/admin/menus/:id` | — |

### Admin — menu assignments / outlet pricing (`admin` only)

| Method | Path | Body / Query |
|---|---|---|
| `POST` | `/api/admin/menu-assignments` | `{ outletId, menuId, price }` |
| `GET` | `/api/admin/menu-assignments` | `?page=&limit=&outletId=&menuId=` |
| `PATCH` | `/api/admin/menu-assignments/:id` | `{ price }` (override the outlet-specific price) |
| `DELETE` | `/api/admin/menu-assignments/:id` | — |

`(outletId, menuId)` is unique — assigning an already-assigned item is
rejected.

### Admin — reports (`admin` only)

| Method | Path | Returns |
|---|---|---|
| `GET` | `/api/admin/reports/revenue-by-outlet` | Total revenue, grouped by outlet |
| `GET` | `/api/admin/reports/top-selling-items` | Top 5 items by quantity sold, per outlet |

### Staff — assigned menu (`staff` only)

| Method | Path | Query |
|---|---|---|
| `GET` | `/api/staff/menu` | `?page=&limit=&search=` |

Returns only items assigned to the caller's own outlet, with that
outlet's effective price.

### Staff — inventory (`staff` only)

| Method | Path | Body / Query |
|---|---|---|
| `GET` | `/api/staff/inventory` | `?page=&limit=&search=` |
| `POST` | `/api/staff/inventory` | `{ menuId, stock }` — create the stock row for an assigned item |
| `PATCH` | `/api/staff/inventory/:menuId` | `{ stock }` — set stock for an assigned item |

Scoped to the caller's own outlet; a menu item must be assigned to that
outlet before inventory can be created for it.

### Staff — sales / POS (`staff` only)

| Method | Path | Body |
|---|---|---|
| `POST` | `/api/staff/sales` | `{ items: [{ menuId, quantity }, ...] }` |

Validates every item is assigned to the caller's outlet, uses the
outlet's assigned price (never `MasterMenu.basePrice`), atomically
decrements stock per line (rejecting the whole sale with `409` if any
line has insufficient stock), assigns the next sequential receipt
number for that outlet, and persists `Sale` + `SaleItem` rows — all
inside one DB transaction. Duplicate `menuId`s in one request are
merged (quantities summed) before processing.

### Staff — dashboard (`staff` only)

| Method | Path | Returns |
|---|---|---|
| `GET` | `/api/staff/dashboard` | Summary counters for the staff landing page (own outlet only) |

### Health

| Method | Path | Auth |
|---|---|---|
| `GET` | `/api/health` | none |

## Scaling strategy (summary)

Full discussion — including the 10-outlet / 100k-transactions-per-month
target, database scaling, reporting performance, infrastructure
evolution, a microservices breakdown and an offline-POS sync design —
is in **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)**. In short, at
the current scale the bottleneck is nowhere near the stack described
above; the documented plan focuses on read replicas + materialized
reporting tables for the two report endpoints, connection pooling via
PgBouncer/Prisma Accelerate as serverless instance count grows, and
splitting the sales/inventory write path into its own service first if
the system ever needs to decompose.

## Known limitations / decisions

- CORS is currently disabled in `src/app.js` because the frontend never
  calls this API directly from the browser — it proxies every request
  through its own Next.js server-side route handlers (see the frontend
  README), so there is no cross-origin browser request to allow. It
  would need to be re-enabled (scoped to `FRONTEND_URL`) if any client
  ever calls this API directly from a browser origin.
- No sales-history, receipt-view/print, or other screens beyond what
  Section 1.3 of the original spec requires — intentionally out of
  scope.
- Deletes on `Outlet`/`MasterMenu`/`OutletMenu` are restricted by FK
  (`onDelete: Restrict`) once referenced by inventory/sales; the
  `status` toggle is the supported way to retire an outlet, staff
  member, or menu item that already has history.
