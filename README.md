[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/r1QxwNOh)

## Databasdiagram

Diagrammet innehåller tabeller för produkter, kategorier, användare, varukorg, order och orderrader.

![Databasdiagram](docs/diagrams/database-er-diagram.png)

Källfilen för diagrammet finns här:

`docs/diagrams/database-er-diagram.eraser.md`

## Produktdata och API-beslut

Projektet kommer att använda DummyJSON Products API som källa för demoprodukter. Produkterna ska inte hämtas live direkt från DummyJSON i frontend. I stället ska de importeras till den egna databasen och därefter hanteras via applikationens egna API.

Detta gör att produkterna kan sparas, redigeras av administratör och användas i orderflödet enligt uppgiftens krav.

## Konto- och autentiseringsbeslut

Applikationen använder kundkonton för att koppla databaslagrade varukorgar och ordrar till respektive användare. Supabase Auth används för autentisering med e-post och lösenord. Användare har rollen `customer` eller `admin`.

Vanliga registreringar får alltid rollen `customer`. Administratörskonton skapas manuellt i Supabase och får rollen `admin` i profilen. Användaren ska aldrig kunna välja rollen `admin` i registreringsformuläret.

## Sitemap

Sitemapen för e-handelsplattformen finns dokumenterad här:

[docs/planning/sitemap.md](docs/planning/sitemap.md)

## Mockups

UI-mockups för e-handelsplattformens planerade sidor finns skapade i Google Stitch:

[Öppna mockups i Google Stitch](https://stitch.withgoogle.com/projects/2797369421238320316)
