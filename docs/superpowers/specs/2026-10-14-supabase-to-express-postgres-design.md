# Supabase to Express and PostgreSQL Migration Design

## Goal and constraints

Move the existing shop runtime off the hosted Supabase project and onto a
React frontend, an Express backend, and PostgreSQL in a Coolify-compatible
Docker Compose stack. Preserve current customer and admin behavior. Do not
implement any of the five external integration labs or redesign the UI. Keep
the system small enough for the student to explain.

## Current behavior and security map

- Registration submits `customer` as Auth user metadata. A database trigger
  creates `profiles`; the database constraint permits `customer` or `admin`.
  The trigger trusts that metadata, so a modified direct Auth request may be
  able to request `admin`. The replacement will always assign `customer` on
  public registration and keep promotion to admin as an explicit operator
  action.
- Login uses email/password. Supabase persists the session in the browser;
  the app loads the `profiles.role` for the current user. Logout clears the
  Supabase session.
- Public visitors may read categories and active products. Admin users may
  read all products and create/update products.
- Signed-in users have one database cart. RLS limits cart and cart-item reads
  and mutations to the owning user. Guests use localStorage; login merges the
  local cart with the signed-in cart.
- Checkout is available to guests and signed-in users. The
  `create_order_with_items` security-definer function validates required
  fields, active products, quantities, and stock; calculates totals from
  database prices; and inserts the order and items atomically. It records
  `auth.uid()` for signed-in users and null for guests.
- An admin-only policy is defined for reading/updating orders and reading
  order items. The checked-in migrations do not enable RLS on `orders` or
  `order_items`, so whether that policy is active depends on the live schema
  state and cannot be confirmed from this repository alone. The order
  confirmation page first fetches only an order ID and total from the database,
  then falls back to a browser-local summary. There is no customer order
  history flow.
- `current_user_is_admin()` implements the RLS admin check. The
  `handle_new_user_profile()` trigger links Auth user creation to profiles.
- No app use of Supabase Storage, Realtime, or Edge Functions was found.

## Target design

The Vite frontend will call same-origin-style `/api` routes through a
configurable public API base URL. Express owns authentication, authorization,
validation, database access, and business operations. PostgreSQL is internal
to Compose and is never exposed publicly.

Use ordinary Express middleware and parameterized SQL through the `pg`
package. Store sessions in PostgreSQL using `express-session` and
`connect-pg-simple`; use an HttpOnly, SameSite cookie, secure in production.
The backend resolves the current user from the session and reads role from
PostgreSQL. Registration always assigns `customer`; a documented one-time
admin bootstrap procedure assigns the admin role. Every protected endpoint
checks the session and role server-side.

Create explicit API routes for auth/current user, public catalog, admin
product management, signed-in cart operations, checkout, and admin order
management, including order-status updates. Guest cart and recent order summary behavior remain in the
browser. Checkout keeps database-derived prices, stock checks, and atomic
order/item creation in a PostgreSQL transaction. Signed-in orders retain the
user ID; guest orders retain null. Admin order reads/updates remain admin-only.

Use repository-driven SQL migrations to bootstrap an empty PostgreSQL
database. Recover the historical baseline schema from Git, adapt Auth-owned
foreign keys to an application `users` table, and preserve existing product,
cart, and order columns/constraints. Keep schema setup separate from any
one-time live-data transfer. Do not export or commit hosted user data.

Compose will contain frontend, backend, and pinned PostgreSQL services with a
persistent database volume, health checks, internal service-name networking,
and environment-substituted secrets. Only frontend and backend HTTP routes are
public through Coolify. Browser API URLs must be public/reachable, never the
Compose-only `backend` hostname.

## Incremental implementation and acceptance

1. Add a plain PostgreSQL baseline migration and migration runner. Prove it
   initializes an empty local test database and preserves schema constraints.
2. Add backend configuration, database access, health check, and session-based
   registration/login/logout/current-user routes. Verify role assignment,
   session persistence, and admin denial/allow behavior.
3. Add public catalog, admin product, cart, checkout, and admin order routes.
   Verify owner isolation, guest checkout, stock/price validation, and atomic
   order creation against PostgreSQL.
4. Replace frontend Supabase calls with the API while preserving existing
   pages, loading/error states, guest cart behavior, and login cart merge.
5. Add Dockerfiles and Compose, then verify from an empty test volume: healthy
   PostgreSQL, successful migrations, backend health, frontend load, API
   connectivity, and representative customer/admin workflows.
6. Remove the Supabase SDK and runtime variables only after repository search
   and runtime verification show no remaining application dependency. Keep
   external lab integrations external and out of scope.

Run the relevant existing typecheck/build plus requested database and Compose
checks as each step becomes executable. Never point destructive checks at the
hosted Supabase project or a production volume.

## Data transfer and open operational constraint

The repository contains the historic baseline schema in Git history, but no
live database dump or credentials are part of the workspace. A separate
documented transfer procedure will use standard PostgreSQL tools if a
transferable source connection is available. Existing password hashes and
admin identity must be assessed before promising account continuity; users
may otherwise need a password reset or local account recreation. No private
data belongs in the repository.

## Out of scope

No UI redesign, external service lab implementation, self-hosted Supabase,
Redis, queue, reverse proxy, Kubernetes, object storage, or unrelated database
redesign.
