# Databas

Projektet använder Supabase direkt från frontend.

Mappen `supabase/` innehåller databasändringar som kod. Den behövs inte för att React-appen ska köra lokalt, men den är bra att ha i repot när databasen får nya funktioner eller policies.

## Checkout

Migrationen `20260807164500_create_checkout_function.sql` skapar funktionen `create_order_with_items`.

Funktionen används av checkout-flödet för att skapa order och orderrader i samma databastransaktion. Den:

- validerar kundnamn och e-post
- validerar telefon och leveransadress
- validerar att varukorgen innehåller produkter
- kontrollerar att produkterna är aktiva och att antal inte överstiger lager
- räknar totalpriset från produktpriserna i databasen
- sparar `product_name`, `quantity` och `price_at_purchase` på orderraderna
- sparar checkoutuppgifter på ordern: telefon, adress, postnummer, ort och land

Migrationen måste finnas i Supabase innan checkout kan skapa riktiga ordrar.

Lägg inte projektets access token, databaslösenord eller andra hemligheter i repot.
