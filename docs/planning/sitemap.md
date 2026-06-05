# Sitemap

Denna sitemap beskriver vilka sidor som ska finnas i e-handelsplattformen och hur kundflödet och adminflödet är tänkt att fungera.

## Översikt

Applikationen delas upp i två huvuddelar:

1. En publik kunddel där användare kan se produkter, lägga produkter i varukorgen och skapa en order.
2. En admin-del där administratörer kan hantera produkter och se ordrar.

## Sitemap i trädstruktur

```txt
/
├── Produkter
├── Produktdetalj
├── Varukorg
├── Checkout
├── Orderbekräftelse
│
├── Login
│
└── Admin
    ├── Dashboard
    ├── Produkter
    ├── Lägg till produkt
    ├── Redigera produkt
    ├── Ordrar
    └── Orderdetaljer
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

### `/cart`

Varukorg.

Funktioner:

* Visa produkter i varukorgen
* Visa antal per produkt
* Ändra antal
* Ta bort produkt
* Visa totalsumma
* Gå vidare till checkout

### `/checkout`

Checkout och simulerad betalning.

Funktioner:

* Visa ordersammanfattning
* Låta kunden fylla i namn och e-post
* Genomföra en simulerad betalning
* Skapa order i databasen

### `/order-confirmation`

Orderbekräftelse.

Funktioner:

* Visa att ordern har skapats
* Visa ordernummer
* Visa totalpris
* Informera kunden om att ordern är mottagen

## Inloggning

### `/login`

Login-sida för administratör.

Funktioner:

* Logga in som administratör
* Skicka administratören vidare till adminpanelen
* Hindra obehöriga från att redigera produkter eller hantera ordrar

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
* Varukorg
* Checkout där order skapas
* Adminvy för att lägga till och redigera produkter
* Adminvy för att se ordrar och beställda produkter
* Login och skyddade adminflöden för VG
* Orderstatus för VG
