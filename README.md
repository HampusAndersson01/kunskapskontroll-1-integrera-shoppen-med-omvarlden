# Min egen e-handel

Webbshop med React/Vite, Express och PostgreSQL. React använder Express-API:t för all appdata. Express sköter inloggning, behörighet och checkout; PostgreSQL lagrar produkter, konton, varukorgar och ordrar.

## Kör lokalt

```powershell
Copy-Item .env.example .env
```

Byt `POSTGRES_PASSWORD` och `SESSION_SECRET` i `.env`, starta sedan stacken:

```powershell
docker compose -f compose.yaml -f compose.dev.yaml up --build
```

Öppna shoppen på `http://localhost:8080`. API-anrop går via samma adress under `/api`. Databasen sparas i volymen `postgres_data`.

## Exempelprodukter

```powershell
npm run seed-db
```

## Administratör

Registrera ett konto i shoppen och ge det administratörsrollen i databasen:

```powershell
docker compose exec db psql -U shop -d shop -c "UPDATE users SET role = 'admin' WHERE email = 'din-adress@example.com';"
```

## Kontroller

```powershell
npm run typecheck
npm run build
```
