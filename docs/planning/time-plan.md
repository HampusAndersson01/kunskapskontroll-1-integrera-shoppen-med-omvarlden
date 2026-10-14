# Ursprunglig tidsplan

Den här tidsplanen dokumenterar projektets ursprungliga plan. Den planerade
Supabase-arkitekturen har sedan ersatts av React, Express och PostgreSQL i
Docker Compose. Aktuell drift och utveckling beskrivs i README.md.

Denna tidsplan beskriver den planerade arbetsordningen för e-handelsprojektet. Planen är att först få databas, backendlogik och Supabase-koppling att fungera stabilt. Frontenden byggs därför först enkelt för testning och förbättras mer när de viktigaste funktionerna fungerar.

## Fas 1: Planering av databas och flöden

Målet med första fasen är att bestämma vilka delar e-handeln behöver innehålla och hur informationen ska sparas. Datamodellen prioriteras tidigt eftersom produkter, varukorgar och ordrar behöver fungera innan resten av appen kan byggas ordentligt.

Planerat arbete:

- ta fram databasdiagram
- ta fram sitemap för kundflöde och adminflöde
- planera tabeller för produkter, kategorier, profiler, varukorgar, ordrar och orderrader
- bestämma hur Supabase ska användas för databas, auth och behörighet
- planera rollerna `customer` och `admin`

Planerat resultat:

- databasdiagram i `docs/diagrams/database-er-diagram.eraser.md`
- sitemap i `docs/planning/sitemap.md`
- databasanteckningar i `docs/database.md`

## Fas 2: Backend och databas först

I nästa fas ska backenddelen prioriteras. Frontenden behöver bara vara tillräcklig för att kunna testa kopplingen mot databasen. Målet är att först säkerställa att appen kan prata med Supabase och att rätt data kan sparas och hämtas.

Planerat arbete:

- sätta upp projektet med React, Vite och Supabase-klient
- skapa miljövariabler för Supabase
- bygga grundläggande services mot databasen
- importera demoprodukter från DummyJSON till Supabase
- se till att produkterna läses från projektets egen databas istället för direkt från DummyJSON

Planerat resultat:

- Supabase-klient i `frontend/src/lib/supabase.ts`
- produktlogik i `frontend/src/services/productService.ts`
- importscripts i `scripts/import-dummyjson-products.mjs`
- dokumentation för produktimport i `docs/data-import.md`

## Fas 3: Orderlogik och checkout i databasen

När produktdatan fungerar ska köpflödet byggas på databassidan. Ordern ska skapas korrekt i databasen innan checkouten får en mer färdig frontenddesign.

Planerat arbete:

- skapa databasfunktion för att skapa order och orderrader i samma flöde
- validera produkter, antal och kunduppgifter i databasen
- räkna totalpris från produktpriserna i databasen
- spara produktnamn, antal och pris vid köptillfället på orderraderna

Planerat resultat:

- checkoutfunktion i Supabase SQL (ursprunglig plan)
- orderlogik i `frontend/src/services/orderService.ts`
- checkout som skapar riktiga orderrader i Supabase

## Fas 4: Enkel frontend för att testa flöden

När backendlogiken finns på plats ska enkla vyer byggas för att kunna testa flödena i webbläsaren. Frontenden ska i detta steg vara funktionell, men inte nödvändigtvis färdigdesignad.

Planerat arbete:

- skapa produktlista och produktdetaljsida
- skapa varukorgssida
- lägga till knappar för att lägga produkter i varukorgen
- bygga checkoutformulär för simulerad betalning
- lägga till orderbekräftelse efter köp

Planerat resultat:

- kundsidor i `frontend/src/pages/customer/`
- varukorgshantering i `frontend/src/cart/CartContext.tsx`
- checkout i `frontend/src/pages/customer/CheckoutPage.tsx`

## Fas 5: Adminflöde och behörighet

När kundflödet fungerar ska adminflödet byggas. Fokus är att administratörer ska kunna hantera produkter och se ordrar, samtidigt som vanliga användare inte ska kunna komma åt adminfunktionerna.

Planerat arbete:

- bygga skyddad adminrouting
- hämta användarens roll från `profiles`
- lägga till adminvy för produkter
- lägga till formulär för att skapa och redigera produkter
- lägga till orderlista och orderdetaljer
- lägga till möjlighet att ändra orderstatus
- lägga till RLS-policies för adminfunktioner

Planerat resultat:

- adminskydd i `frontend/src/auth/RequireAdmin.tsx`
- adminproduktsidor i `frontend/src/pages/admin/`
- adminlogik för produkter i `frontend/src/services/productService.ts`
- orderstatus som kan ändras mellan `Beställd`, `Behandlas`, `Levererad` och `Återbetald`
- adminpolicies i Supabase SQL (ursprunglig plan)

## Fas 6: Databaslagrad varukorg för VG

Efter att grundkraven fungerar ska databaslagrad varukorg läggas till för inloggade kunder. Gäster ska fortfarande kunna använda varukorgen utan konto, men inloggade användares varukorgar ska sparas i Supabase.

Planerat arbete:

- skapa service för `carts` och `cart_items`
- hämta eller skapa varukorg för inloggad användare
- synka varukorgen mot databasen
- slå ihop lokal varukorg med databasvarukorg vid login
- lägga till RLS-regler så användare bara kan hantera sin egen varukorg

Planerat resultat:

- varukorgsservice i `frontend/src/services/cartService.ts`
- synkning i `frontend/src/cart/CartContext.tsx`
- cart-policies i Supabase SQL (ursprunglig plan)

## Fas 7: Frontend, design och polering

När funktionerna fungerar ska mer tid läggas på gränssnittet. Då ska layout, navigation, produktkort, adminvyer och responsivitet förbättras.

Planerat arbete:

- förbättra produktlistan och produktdetaljsidan
- bygga tydligare kundnavigation
- förbättra varukorg och checkout
- förbättra adminlayout och tabeller
- lägga till bättre texter, felmeddelanden och laddningslägen
- testa att projektet kan byggas

Planerat resultat:

- global styling i `frontend/src/styles.css`
- kundlayout i `frontend/src/pages/customer/CustomerLayout.tsx`
- adminlayout i `frontend/src/pages/admin/AdminLayout.tsx`
- kontroller med `npm run typecheck` och `npm run build`

## Fas 8: Deployment och inlämning

Sist ska projektet deployas och dokumenteras så att det är enkelt att granska vid inlämning.

Planerat arbete:

- lägga till Cloudflare Pages-konfiguration
- lägga in deployment-länk i README
- dokumentera admininloggning för lärare
- lägga till inlämningschecklista
- kontrollera att GitHub-historiken visar flera steg i arbetet

Planerat resultat:

- deployment-länk i `README.md`
- admininloggning för granskning i `README.md`
- inlämningschecklista i `docs/hand-in-checklist.md`
- Cloudflare Pages-konfiguration (ursprunglig plan)
