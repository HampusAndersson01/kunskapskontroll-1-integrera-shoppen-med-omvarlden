# Produktimport

Demoprodukter importeras från DummyJSON till Supabase med ett lokalt Node-script.

Frontend ska inte hämta produkter direkt från DummyJSON. Efter importen ska appen läsa produkter från Supabase.

## Miljövariabler

Skapa `.env.local` i projektroten eller sätt variablerna i terminalen:

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` ska bara användas lokalt för importscriptet. Lägg inte värdet i Git.

## Kör importen

Testa först mappningen utan att skriva till databasen:

```powershell
npm run seed-db -- --dry-run
```

Importera sedan till Supabase:

```powershell
npm run seed-db
```

Scriptet:

- hämtar produkter från `https://dummyjson.com/products?limit=100`
- skapar kategorier från DummyJSONs produktkategori
- upsertar kategorier med `slug`
- upsertar produkter med `external_id`
- sparar SKU, pris, rabatt, rating, lagerantal, bild och kategori

Eftersom importen använder upsert skapas inte dubbletter vid upprepad körning.
