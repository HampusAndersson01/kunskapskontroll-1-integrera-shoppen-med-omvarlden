[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/r1QxwNOh)

# Min egen e-handel

E-handelsplattform för skoluppgiften. Den körs som React/Vite-frontend,
Express-backend och PostgreSQL. Supabase behövs inte för appens runtime.

## Lokal körning med Docker Compose

Kräver Docker Desktop med Compose.

```powershell
Copy-Item .env.example .env
```

Byt `POSTGRES_PASSWORD` och `SESSION_SECRET` i `.env` till egna lokala värden.
Behåll `COOKIE_SECURE=false` för lokal HTTP. Coolify ska använda
`COOKIE_SECURE=true` bakom HTTPS.
Starta sedan hela stacken:

```powershell
docker compose -f compose.yaml -f compose.dev.yaml up --build
```

Öppna `http://localhost:8080`. API:t nås lokalt på `http://localhost:3000`.
Det lokala Compose-tillägget publicerar backend- och databassportarna endast på
loopback-adressen. PostgreSQL har ingen publicerad hostport i huvudstacken. Backend kör
SQL-migrationerna innan den startar. PostgreSQL-data sparas i volymen
`postgres_data` även när containrar återskapas.

Skapa ett administratörskonto genom att först registrera ett vanligt konto i
shoppen och därefter ändra dess roll i databasen:

```powershell
docker compose exec db psql -U shop -d shop -c "UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';"
```

Ersätt e-postadressen med kontot du registrerade. Registreringsformuläret kan
aldrig tilldela adminrollen.

## Lokal frontend/backend-utveckling

Kör först bara databasen och applicera schemat:

```powershell
docker compose -f compose.yaml -f compose.dev.yaml up -d db
npm install
npm run db:migrate
```

Sätt `FRONTEND_URL=http://localhost:5173` i `.env` för Vite-utveckling.
Starta sedan `npm run dev:backend` och `npm run dev` i två terminaler.
Vite skickar `/api`-anrop vidare till backend på port 3000.

Importera demoprodukter till den lokala databasen med `npm run seed-db`.
`npm run seed-db -- --dry-run` hämtar och validerar exempeldata utan att
skriva till databasen.

Kontroller:

```powershell
npm run typecheck
npm run build
```

## Coolify

Skapa en Compose-applikation från detta repository och använd endast
`compose.yaml`.
Lägg in variablerna från `.env.example` i Coolifys miljöinställningar. Sätt
`POSTGRES_PASSWORD` och `SESSION_SECRET` till hemliga, slumpmässiga värden.
Koppla en publik domän till `frontend` på port `8080` och en API-domän till
`backend` på containerns interna port `3000`. Coolify proxar API-domänen till
containern; Compose publicerar ingen backendport direkt på servern. Sätt
`PUBLIC_API_URL` till API-domänens publika URL
(exempelvis `https://api.example.com`) och `FRONTEND_URL` till frontendens
exakta origin (exempelvis `https://shop.example.com`). PostgreSQL-tjänsten
behöver ingen publik domän eller publicerad port. Compose-nätverket låter
backend ansluta via tjänstenamnet `db`.

Volymen `postgres_data` innehåller butikens beständiga databas. Ta inte bort
volymen när appen uppdateras.

## Miljövariabler

Se `.env.example` för Compose-variabler. `POSTGRES_*` används av PostgreSQL;
backend använder samma värden via `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`
och `PGPASSWORD`. `SESSION_SECRET` signerar inloggningssessioner.
`FRONTEND_URL` styr CORS. `PUBLIC_API_URL` är URL:en som webbläsaren använder
för API-anrop. `SOURCE_SUPABASE_DATABASE_URL` behövs bara till den valfria
engångsimporten av konton. Den ska anges tillfälligt i `.env.local` och aldrig
läggas i `.env.example` eller användas vid normal drift.

## Engångsflytt av befintliga data

Schemat skapas alltid från migrationsfiler i repot. Live-data ingår inte i
repot och flyttas inte automatiskt. Hoppa över det här avsnittet om du börjar
med en tom databas. Om befintliga konton och order ska behållas, gör importen
en gång från en säker dator med PostgreSQL-verktygen installerade:

1. Starta en tom måldatabas med loopback-port och skapa schemat:

   ```powershell
   docker compose -f compose.yaml -f compose.dev.yaml up -d db
   npm run db:migrate
   ```

2. Lägg till `SOURCE_SUPABASE_DATABASE_URL` tillfälligt i `.env.local` och kör
   `npm run migrate:supabase-users` exakt en gång. Skriptet för över användar-ID,
   e-post, roller och lösenordshashar. Det avbryts om måldatabasen redan har
   användare. Ta bort anslutningsvärdet direkt efter körningen. Konton utan
   importerbar hash behöver få ett nytt lösenord separat; appen har ingen
   lösenordsåterställningssida.
3. Exportera `categories`, `products`, `carts`, `cart_items`, `orders` och
   `order_items` med `pg_dump --data-only --no-owner --no-privileges --table=public.categories --table=public.products --table=public.carts --table=public.cart_items --table=public.orders --table=public.order_items`.
   Importera SQL-dumpen till måldatabasen med `psql`. Importera användarna först
   så att främmande nycklar matchar. Dumpen innehåller kund- och orderuppgifter.
4. Kontrollera radantal och orderrelationer och ta sedan bort temporära
   exportfiler säkert.

Dumpen och användarnas lösenhashar är känsliga. Lägg aldrig export, lösenord,
databas-URL:er eller andra hemligheter i Git. Konton vars lösenordshashar inte
går att överföra kräver en separat administrativ lösenordshantering eller att
kontot skapas om; appen har ingen lösenordsåterställningssida.

## Arkitektur

React anropar endast projektets Express-API. Backend ansvarar för SQL,
sessioner och behörighet. Inloggade kunders varukorgar ägs av deras
serveridentifierade användare; gäster använder webbläsarens localStorage.
Checkout räknar pris och kontrollerar lager i en PostgreSQL-transaktion.
Admin-API:er kontrollerar adminrollen på servern.

Frontend och backend har inga Supabase-runtimeberoenden. Produktimporten
använder PostgreSQL. De framtida externa integrationslabbarna är inte ersatta
av lokala tjänster.

## Tidigare deployment

[**ehandel.hampusandersson.dev/**](https://ehandel.hampusandersson.dev/)

Den här länken är den tidigare Cloudflare Pages-deployen. Den nya stacken ska
deployas via Coolify med egna domäner och miljövariabler.

## Dokumentation

- [Databasdiagrammets källfil](docs/diagrams/database-er-diagram.eraser.md)
- [Produktimport](docs/data-import.md)
- [Sitemap](docs/planning/sitemap.md)
- [Tidsplan](docs/planning/time-plan.md)
- [Inlämningschecklista](docs/hand-in-checklist.md)
- [Databasbeteende](docs/database.md)
