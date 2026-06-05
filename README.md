[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/r1QxwNOh)

## Databasdiagram

Diagrammet innehåller tabeller för produkter, kategorier, användare, varukorg, order och orderrader.

![Databasdiagram](docs/diagrams/database-er-diagram.png)

Källfilen för diagrammet finns här:

`docs/diagrams/database-er-diagram.eraser.md`

## Produktdata och API-beslut

Projektet kommer att använda DummyJSON Products API som källa för demoprodukter. Produkterna ska inte hämtas live direkt från DummyJSON i frontend. I stället ska de importeras till den egna databasen och därefter hanteras via applikationens egna API.

Detta gör att produkterna kan sparas, redigeras av administratör och användas i orderflödet enligt uppgiftens krav.
