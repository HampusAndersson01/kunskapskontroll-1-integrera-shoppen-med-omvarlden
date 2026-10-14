# Produktimport

Demoprodukter hämtas från DummyJSON och skrivs till PostgreSQL med det lokala
Node-scriptet `scripts/import-dummyjson-products.mjs`. Frontend hämtar aldrig
produkter direkt från DummyJSON.

## Miljö

Compose läser databasuppgifter från `.env`. För lokal terminalkörning används
`PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER` och `PGPASSWORD`, eller motsvarande
`POSTGRES_*`-värden i `.env`.

## Kör importen

```powershell
npm run seed-db -- --dry-run
npm run seed-db
```

I en körande Compose-stack kan importen köras inifrån backend-containern:

```powershell
docker compose exec backend node scripts/import-dummyjson-products.mjs
```

Scriptet hämtar högst 100 produkter, skapar kategorier, upsertar kategorier
med `slug` och produkter med `external_id`. Det sparar SKU, pris, rabatt,
betyg, lager, bild och kategori. Upsert gör upprepade körningar säkra mot
dubbletter.
