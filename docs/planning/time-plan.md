# Tidsplan

Denna tidsplan visar hur arbetet med e-handelsplattformen planerades och genomfördes.

## Fas 1: Planering

Mål:

- ta fram databasdiagram
- ta fram sitemap för kundflöde och adminflöde
- bestämma vilka tabeller som behövs för produkter, varukorg och ordrar
- planera auth med kundroll och adminroll

Resultat:

- databasdiagram finns i `docs/diagrams/database-er-diagram.eraser.md`
- sitemap finns i `docs/planning/sitemap.md`
- databasen dokumenteras i `docs/database.md`

## Fas 2: Projektgrund

Mål:

- sätta upp React och Vite
- lägga till Supabase-klient
- skapa grundläggande routing
- lägga till miljövariabler för lokal körning

Resultat:

- appen startas med `npm run dev`
- produktion byggs med `npm run build`
- exempel för miljövariabler finns i `frontend/.env.example`

## Fas 3: Produktflöde

Mål:

- importera demoprodukter från DummyJSON till Supabase
- visa produkter från den egna databasen
- visa produktdetaljer
- låta kunder lägga produkter i varukorgen

Resultat:

- importscripten finns i `scripts/import-dummyjson-products.mjs`
- produktflödet finns under kundsidorna i `frontend/src/pages/customer/`
- produktlogiken finns i `frontend/src/services/productService.ts`

## Fas 4: Varukorg och checkout

Mål:

- skapa varukorgssida
- låta kunden ändra antal och ta bort varor
- skapa simulerad betalning
- skapa order och orderrader i databasen

Resultat:

- varukorgen hanteras i `frontend/src/cart/CartContext.tsx`
- checkout finns i `frontend/src/pages/customer/CheckoutPage.tsx`
- order skapas via Supabase-funktionen `create_order_with_items`

## Fas 5: Adminflöde

Mål:

- skydda adminområdet med inloggning och adminroll
- låta administratörer lägga till produkter
- låta administratörer redigera produkter
- visa ordrar och beställda produkter
- låta administratörer ändra orderstatus

Resultat:

- adminskydd finns i `frontend/src/auth/RequireAdmin.tsx`
- adminproduktsidor finns i `frontend/src/pages/admin/`
- orderstatus kan ändras mellan `Beställd`, `Behandlas`, `Levererad` och `Återbetald`

## Fas 6: Polering och inlämning

Mål:

- förbättra gränssnitt och responsivitet
- dokumentera deployment och admininloggning
- kontrollera att projektet bygger
- se till att läraren hittar kravuppfyllelsen

Resultat:

- deployment-länk finns i `README.md`
- admininloggning för granskning finns i `README.md`
- inlämningschecklista finns i `docs/hand-in-checklist.md`
