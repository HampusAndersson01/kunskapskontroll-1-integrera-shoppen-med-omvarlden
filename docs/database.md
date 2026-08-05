# Databas

Projektet använder Supabase direkt från frontend.

Mappen `supabase/` innehåller databasens schema som kod. Den behövs inte för att React-appen ska köra lokalt, men den är bra att ha i repot så att databasstrukturen går att granska, återskapa och följa över tid.

## Befintligt fjärrschema

Migrationen `20260805212000_baseline_existing_schema.sql` är en baseline för det schema som redan finns i Supabase:

- `profiles`
- `categories`
- `products`
- `carts`
- `cart_items`
- `orders`
- `order_items`

Eftersom tabellerna redan finns i Supabase ska baseline-migrationen inte köras rakt mot samma databas utan att först hantera migrationshistoriken. Nya ändringar bör däremot läggas som nya migrationer efter baseline-filen.

Lägg inte projektets access token, databaslösenord eller andra hemligheter i repot.
