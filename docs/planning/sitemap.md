# Sitemap

Denna sitemap beskriver vilka sidor som ska finnas i e-handelsplattformen och hur kundflödet och adminflödet är tänkt att fungera.

## Översikt

Applikationen delas upp i två huvuddelar:

1. En kunddel där besökare kan se produkter, lägga produkter i en databaslagrad varukorg och skapa en order utan att logga in.
2. En admin-del där administratörer kan hantera produkter, se ordrar och uppdatera orderstatus.

Samma inloggningssida används för både kunder och administratörer. Kundkonton är frivilliga och kan användas för att koppla varukorgar och ordrar till en användare. Kunder skickas tillbaka till butiken efter inloggning, medan administratörer får tillgång till adminområdet.

## Sitemap i trädstruktur

```txt
/
├── /products/:id
├── /cart
├── /checkout
├── /order-confirmation/:orderId
├── /login
├── /register
└── /admin
    ├── /admin/products
    ├── /admin/products/new
    ├── /admin/products/:id/edit
    ├── /admin/orders
    └── /admin/orders/:id
```

## Publika kundsidor

### `/`

Startsida och produktlista.

Funktioner:

* Visa alla produkter
* Visa produktbild, namn, pris och lagerstatus
* Filtrera produkter efter kategori
* Lägga produkt i varukorgen
* Gå vidare till produktdetalj
* Fungera utan inloggning

### `/products/:id`

Produktdetaljsida.

Funktioner:

* Visa större produktbild
* Visa produktnamn
* Visa beskrivning
* Visa pris
* Visa kategori
* Visa lagerstatus
* Lägga produkt i varukorgen
* Fungera utan inloggning

### `/cart`

Varukorg.

Funktioner:

* Visa produkter i varukorgen
* Visa antal per produkt
* Ändra antal
* Ta bort produkt
* Visa totalsumma
* Gå vidare till checkout
* Spara varukorgen i databasen för både gäster och inloggade kunder

### `/checkout`

Checkout och simulerad betalning.

Funktioner:

* Visa ordersammanfattning
* Låta gäster fylla i namn och e-post
* Koppla ordern till kundkontot om kunden är inloggad
* Genomföra en simulerad betalning
* Skapa order i databasen

### `/order-confirmation/:orderId`

Orderbekräftelse.

Funktioner:

* Visa att ordern har skapats
* Visa ordernummer
* Visa totalpris
* Informera kunden om att ordern är mottagen

## Inloggning

### `/login`

Login-sida för kunder och administratörer.

Funktioner:

* Logga in med e-post och lösenord via shopens API
* Skicka kunder tillbaka till butiken
* Skicka administratörer vidare till adminpanelen
* Hindra obehöriga från att redigera produkter eller hantera ordrar

### `/register`

Registreringssida för kunder.

Funktioner:

* Skapa kundkonto med e-post och lösenord via shopens API
* Skapa tillhörande profil med rollen `customer`
* Aldrig låta användaren välja rollen `admin`
* Vara frivillig eftersom köp även kan göras som gäst

## Adminsidor

### `/admin`

Admin dashboard.

Funktioner:

* Visa en enkel översikt
* Länka till produkthantering
* Länka till orderhantering

### `/admin/products`

Produkthantering.

Funktioner:

* Visa alla produkter
* Gå till formulär för att lägga till produkt
* Gå till formulär för att redigera produkt
* Visa lagerstatus

### `/admin/products/new`

Lägg till produkt.

Funktioner:

* Fylla i produktnamn
* Fylla i beskrivning
* Fylla i pris
* Välja kategori
* Ange lagerantal
* Ange bild-URL
* Spara produkt i databasen

### `/admin/products/:id/edit`

Redigera produkt.

Funktioner:

* Redigera namn
* Redigera beskrivning
* Redigera pris
* Redigera kategori
* Redigera lagerantal
* Redigera bild-URL
* Spara ändringar i databasen

### `/admin/orders`

Orderhantering.

Funktioner:

* Visa alla ordrar
* Visa kundnamn
* Visa orderdatum
* Visa totalpris
* Visa orderstatus

### `/admin/orders/:id`

Orderdetaljer.

Funktioner:

* Visa kundinformation
* Visa vilka produkter som ingår i ordern
* Visa antal per produkt
* Visa pris vid köptillfället
* Ändra orderstatus

## Kundflöde

```txt
Produktlista
→ Produktdetalj eller Lägg i varukorg
→ Varukorg
→ Checkout
→ Orderbekräftelse
→ Order sparas i databasen
```

## Adminflöde

```txt
Login
→ Admin dashboard
→ Produkter
→ Lägg till eller redigera produkt
→ Ordrar
→ Orderdetaljer
→ Ändra orderstatus
```

## Koppling till uppgiftens krav

Sitemapen stödjer uppgiftens krav genom att inkludera:

* Produktlista för kunder
* Databaslagrad varukorg för gäster och inloggade kunder
* Checkout där order skapas
* Adminvy för att lägga till och redigera produkter
* Adminvy för att se ordrar och beställda produkter
* Login och skyddade adminflöden för VG
* Frivillig registrering av kundkonton
* Orderstatus för VG
