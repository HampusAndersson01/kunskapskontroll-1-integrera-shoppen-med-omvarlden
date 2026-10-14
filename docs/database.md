# Databas

Appens runtime använder PostgreSQL via Express. Compose startar en vanlig
PostgreSQL-container med beständig volym. SQL-migrationerna finns i
`backend/src/db/migrations/` och körs automatiskt innan backend startar.

## Tabeller

- `users`: e-post, lösenordshash och rollen `customer` eller `admin`.
- `categories` och `products`: butikens katalog och produktfält.
- `carts` och `cart_items`: en databasvarukorg per inloggad användare.
- `orders` och `order_items`: gäst- och kundordrar med prisögonblicksbilder.
- `session`: sessionslagring som skapas av Express-sessionens PostgreSQL-store.

RLS och Supabase Auth används inte. Express kontrollerar inloggning och
adminroll på varje skyddad route. Cart-routes hämtar ägar-ID från sessionen,
aldrig från klientens request. Checkout kör lagerkontroll, prisberäkning och
order/orderrad-insert i samma PostgreSQL-transaktion. PostgreSQL-constraintsen
är ett extra skydd för produkt-, cart- och orderdata.

PostgreSQL-tabellen `users` ersätter de tidigare `auth.users`- och `profiles`-
tabellerna. Tidigare row-level policies har flyttats till uttryckliga Express-
kontroller, och checkoutvalidering körs nu i en PostgreSQL-transaktion.

## Lokal databas

```powershell
Copy-Item .env.example .env
docker compose -f compose.yaml -f compose.dev.yaml up -d db
npm run db:migrate
```

I full Compose-körning startar backend efter att databasen är healthy och kör
migrationerna själv. Gästvarukorgen ligger i `localStorage`; inloggade
kunders varukorgar sparas i PostgreSQL och åtkomst kontrolleras via sessionen.
