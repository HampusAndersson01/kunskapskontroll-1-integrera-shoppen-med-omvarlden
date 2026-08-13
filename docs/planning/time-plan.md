# Tidsplan

Denna tidsplan beskriver hur jag faktiskt arbetade med uppgiften. Jag började med att få databas, backendlogik och Supabase-koppling att fungera innan jag lade större tid på frontend och design.

## Fas 1: Planering av databas och flöden

Jag började med att planera vilka delar e-handeln behövde innehålla. Fokus låg först på datamodellen eftersom resten av projektet skulle bygga på att produkter, varukorgar och ordrar kunde sparas på rätt sätt.

Arbete:

- tog fram databasdiagram
- tog fram sitemap för kundflöde och adminflöde
- planerade tabeller för produkter, kategorier, profiler, varukorgar, ordrar och orderrader
- bestämde att Supabase skulle användas för databas, auth och behörighet
- planerade rollerna `customer` och `admin`

Resultat:

- databasdiagram finns i `docs/diagrams/database-er-diagram.eraser.md`
- sitemap finns i `docs/planning/sitemap.md`
- databasanteckningar finns i `docs/database.md`

## Fas 2: Backend och databas först

Efter planeringen gick jag vidare med att få backenddelen att fungera. Vid det här läget fanns nästan ingen färdig frontend. Målet var att först säkerställa att appen kunde prata med Supabase och att rätt data kunde sparas och hämtas.

Arbete:

- satte upp projektet med React, Vite och Supabase-klient
- skapade miljövariabler för Supabase
- byggde grundläggande services mot databasen
- importerade demoprodukter från DummyJSON till Supabase
- såg till att produkterna lästes från projektets egen databas istället för direkt från DummyJSON

Resultat:

- Supabase-klienten finns i `frontend/src/lib/supabase.ts`
- produktlogiken finns i `frontend/src/services/productService.ts`
- importscripten finns i `scripts/import-dummyjson-products.mjs`
- produktimporten dokumenteras i `docs/data-import.md`

## Fas 3: Orderlogik och checkout i databasen

När produktdatan fungerade gick jag vidare med själva köpflödet på databassidan. Jag prioriterade att ordern skulle skapas korrekt i databasen innan checkouten fick mer färdig design.

Arbete:

- skapade databasfunktion för att skapa order och orderrader i samma flöde
- validerade produkter, antal och kunduppgifter i databasen
- räknade totalpris från produktpriserna i databasen
- sparade produktnamn, antal och pris vid köptillfället på orderraderna

Resultat:

- checkoutfunktionen finns i `supabase/migrations/20260807164500_create_checkout_function.sql`
- orderlogiken används från `frontend/src/services/orderService.ts`
- checkouten skapar riktiga orderrader i Supabase

## Fas 4: Enkel frontend för att testa flöden

När backendlogiken fungerade började jag bygga enklare vyer för att kunna testa flödena i webbläsaren. Frontenden var först ganska enkel och användes mest för att kontrollera att produkterna, varukorgen och checkouten fungerade.

Arbete:

- skapade produktlista och produktdetaljsida
- skapade varukorgssida
- lade till knappar för att lägga produkter i varukorgen
- byggde checkoutformulär för simulerad betalning
- lade till orderbekräftelse efter köp

Resultat:

- kundsidorna finns i `frontend/src/pages/customer/`
- varukorgen hanteras i `frontend/src/cart/CartContext.tsx`
- checkouten finns i `frontend/src/pages/customer/CheckoutPage.tsx`

## Fas 5: Adminflöde och behörighet

När kundflödet fungerade fortsatte jag med adminflödet. Här var fokus att administratörer skulle kunna hantera produkter och se ordrar, samtidigt som vanliga användare inte skulle kunna komma åt adminfunktionerna.

Arbete:

- byggde skyddad adminrouting
- hämtade användarens roll från `profiles`
- lade till adminvy för produkter
- lade till formulär för att skapa och redigera produkter
- lade till orderlista och orderdetaljer
- lade till möjlighet att ändra orderstatus
- lade till RLS-policies för adminfunktioner

Resultat:

- adminskydd finns i `frontend/src/auth/RequireAdmin.tsx`
- adminproduktsidor finns i `frontend/src/pages/admin/`
- adminlogik för produkter finns i `frontend/src/services/productService.ts`
- orderstatus kan ändras mellan `Beställd`, `Behandlas`, `Levererad` och `Återbetald`
- adminpolicies finns i `supabase/migrations/20260808102000_add_admin_product_policies.sql`

## Fas 6: Databaslagrad varukorg för VG

Efter att grundkraven fungerade lade jag till databaslagrad varukorg för inloggade kunder. Gäster kan fortfarande använda varukorgen utan konto, men när en användare är inloggad sparas varukorgen i Supabase.

Arbete:

- skapade service för `carts` och `cart_items`
- hämtade eller skapade varukorg för inloggad användare
- synkade varukorgen mot databasen
- slog ihop lokal varukorg med databasvarukorg vid login
- lade till RLS-regler så användare bara kan hantera sin egen varukorg

Resultat:

- varukorgsservicen finns i `frontend/src/services/cartService.ts`
- synkningen finns i `frontend/src/cart/CartContext.tsx`
- cart-policies finns i `supabase/migrations/20260808110500_add_cart_policies.sql`

## Fas 7: Frontend, design och polering

När funktionerna fungerade gick jag vidare med att göra gränssnittet mer komplett och lättare att använda. Då förbättrade jag layout, navigation, produktkort, adminvyer och responsivitet.

Arbete:

- förbättrade produktlistan och produktdetaljsidan
- byggde tydligare kundnavigation
- förbättrade varukorg och checkout
- förbättrade adminlayout och tabeller
- lade till bättre texter, felmeddelanden och laddningslägen
- testade att projektet kunde byggas

Resultat:

- global styling finns i `frontend/src/styles.css`
- kundlayout finns i `frontend/src/pages/customer/CustomerLayout.tsx`
- adminlayout finns i `frontend/src/pages/admin/AdminLayout.tsx`
- projektet kontrolleras med `npm run typecheck` och `npm run build`

## Fas 8: Deployment och inlämning

Sist lade jag till deployment och dokumentation så att projektet skulle vara lätt att granska vid inlämning.

Arbete:

- lade till Cloudflare Pages-konfiguration
- lade in deployment-länk i README
- dokumenterade admininloggning för lärare
- lade till inlämningschecklista
- kontrollerade att GitHub-historiken visar flera steg i arbetet

Resultat:

- deployment-länk finns i `README.md`
- admininloggning för granskning finns i `README.md`
- inlämningschecklista finns i `docs/hand-in-checklist.md`
- Cloudflare-konfiguration finns i `wrangler.jsonc`
