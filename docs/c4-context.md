# C4 — Nível 1: Diagrama de Contexto

```mermaid
C4Context
    title Diagrama de Contexto — SRM Credit Engine

    Person(operador, "Operador de Mesa", "Precifica recebíveis, consulta extratos e gerencia cadastros")

    System_Ext(frontend, "SRM Frontend", "SPA React — interface web utilizada pelo operador")

    System(backend, "SRM Credit Engine", "Motor de precificação e liquidação de recebíveis multimoedas. Calcula deságio, converte moedas e persiste transações com garantias ACID.")

    SystemDb_Ext(db, "PostgreSQL", "Banco relacional que armazena transações, cedentes, moedas e tipos de recebível")

    Rel(operador, frontend, "Usa", "Browser")
    Rel(frontend, backend, "Chama a API", "HTTPS / REST + JSON")
    Rel(backend, db, "Lê e escreve", "TCP 5432")
```