# SRM Credit Engine — Backend

API RESTful para precificação e liquidação de recebíveis multimoedas, construída com **NestJS + TypeScript + PostgreSQL**.

---

## Demo em produção

A stack completa está rodando na Oracle Cloud Free Tier (ARM Ampere A1). Sem necessidade de rodar localmente para avaliar.

| Serviço | URL | Credenciais |
|---|---|---|
| Frontend | http://140.238.178.68 | — |
| API (Swagger) | http://140.238.178.68:3000/api/docs | — |
| Health | http://140.238.178.68:3000/health | — |
| Métricas (Prometheus) | http://140.238.178.68:3000/metrics | — |
| Prometheus | http://140.238.178.68:9090 | — |
| Grafana | http://140.238.178.68:3001 | admin / admin |
| pgAdmin | http://140.238.178.68:5050 | admin@srmasset.com / admin |

---

## Sumário

- [Stack](#stack)
- [Como rodar](#como-rodar)
  - [Com Docker Compose (recomendado)](#com-docker-compose-recomendado)
  - [Sem Docker (Node local)](#sem-docker-node-local)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Migrations e seed](#migrations-e-seed)
- [Endpoints](#endpoints)
- [Arquitetura e decisões de design](#arquitetura-e-decisões-de-design)
- [Diagramas](#diagramas)
- [ADRs](#adrs)
- [Scripts DDL](#scripts-ddl)
- [Testes](#testes)
- [Git workflow](#git-workflow)

---

## Stack

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Framework | NestJS 11 + TypeScript | Tipagem forte, IoC nativo, decorators para validação e Swagger automático |
| Banco de dados | PostgreSQL 16 | ACID, suporte nativo a `NUMERIC` para precisão decimal financeira |
| ORM / QueryBuilder | TypeORM 0.3 | Migrations versionadas, `@VersionColumn` para Optimistic Locking, QueryBuilder para relatórios analíticos |
| Precisão numérica | `decimal.js` | Aritmética de ponto flutuante segura |
| Validação | `class-validator` + `class-transformer` | Whitelist de campos, rejeição de payloads desconhecidos, mensagens de erro tipadas |
| Documentação | `@nestjs/swagger` | OpenAPI gerada automaticamente a partir dos DTOs |
| Containers | Docker + Docker Compose | Ambiente reproduzível com health check no PostgreSQL |
| Qualidade | ESLint + Prettier + Husky + commitlint | Lint e formatação antes de cada commit; mensagens em Conventional Commits |

---

## Como rodar

### Com Docker Compose (recomendado)

Requer: **Docker** e **Docker Compose** instalados.

O `docker-compose.yml` sobe três serviços: **postgres**, **pgadmin** e **backend**.

```bash
# 1. Clone o repositório
git clone <url-do-repo>
cd case-srm-back

# 2. Crie o arquivo de ambiente
cp .env.example .env
# os valores padrão já funcionam com o compose

# 3. Suba os containers
docker compose up --build -d

```

| Serviço | URL |
|---|---|
| API | http://localhost:3000 |
| Swagger | http://localhost:3000/api/docs |
| pgAdmin | http://localhost:5050 (admin@srmasset.com / admin) |

---

### Sem Docker (Node local)

Requer: **Node.js 20+**, **Yarn** e uma instância PostgreSQL rodando localmente.

```bash
# 1. Instale as dependências
yarn install

# 2. Configure o ambiente
cp .env.example .env
# ajuste DB_HOST, DB_USER, DB_PASSWORD conforme sua instância

# 3. Inicie em modo watch
yarn start:dev
```

---

## Variáveis de ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `NODE_ENV` | `development` | Ambiente de execução |
| `PORT` | `3000` | Porta HTTP do servidor |
| `DB_HOST` | `localhost` | Host do PostgreSQL |
| `DB_PORT` | `5432` | Porta do PostgreSQL |
| `DB_NAME` | `srm_db` | Nome do banco |
| `DB_USER` | `srm_user` | Usuário do banco |
| `DB_PASSWORD` | `srm_pass` | Senha do banco |
| `FRONT_URL` | — | URL do frontend (CORS) |
| `BASE_RATE_MONTHLY` | `0.01` | Taxa base mensal (1% a.m.) usada nos cálculos |
| `VITE_API_URL` | `http://localhost:3000` | URL da API consumida pelo frontend (baked em build time pelo Vite) |

---

## Migrations e seed

As migrations estão em `src/database/migrations/` e são executadas em ordem numérica:

| # | Migration | O que cria |
|---|---|---|
| 1 | `CreateCurrencies` | Tabela `currencies` com `NUMERIC(20,6)` |
| 2 | `CreateReceivableTypes` | Tabela `receivable_types` com spread mensal |
| 3 | `CreateCedentes` | Tabela `cedentes` com CNPJ único e `risk_tier` |
| 4 | `CreateTransactions` | Tabela `transactions` com `@VersionColumn`, enum de status e índice composto em `(cedente_id, payment_currency, created_at DESC)` |
| 5 | `SeedInitialData` | Insere BRL/USD/EUR e os tipos Duplicata Mercantil (1,5% a.m.) e Cheque Pré-datado (2,5% a.m.) |

```bash
yarn migration:run      # aplica todas as migrations pendentes
yarn migration:revert   # reverte a última migration
```

---

## Endpoints

### Transactions

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/transactions/simulate` | Calcula VP e deságio sem persistir |
| `POST` | `/transactions/liquidate` | Registra a liquidação em transação ACID |
| `GET` | `/transactions/statement` | Extrato paginado com filtros server-side |

**Query params de `/transactions/statement`:**

```
?cedente_id=<uuid>
&currency=USD
&from=2025-01-01
&to=2025-12-31
&page=1
&limit=20
```

### Currencies

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/currencies` | Lista todas as moedas e taxas |
| `PUT` | `/currencies/:code/rate` | Atualiza a taxa de câmbio e invalida o cache |

### Cedentes

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/cedentes` | Lista todos os cedentes |
| `GET` | `/cedentes/:id` | Busca um cedente por ID |
| `POST` | `/cedentes` | Cria um cedente (CNPJ único, 14 dígitos) |

### Receivable Types

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/receivable-types` | Lista todos os tipos de recebível |
| `GET` | `/receivable-types/:id` | Busca um tipo por ID |
| `POST` | `/receivable-types` | Cria um novo tipo com spread mensal personalizado |

**Documentação completa com exemplos:** `http://localhost:3000/api/docs`

---

## Arquitetura e decisões de design

### Separação em camadas

```
Controller  →  Service  →  Repository / ORM
   (HTTP)     (negócio)     (persistência)
```

O extrato segue o mesmo fluxo de três camadas — `TransactionController → TransactionService → TransactionRepository` — mas o `getStatement` no Service é um repasse direto ao repositório, sem lógica de negócio adicional.

### Strategy Pattern — Pricing Engine

O cálculo de deságio é desacoplado via interface `IPricingStrategy`:

```
IPricingStrategy
    └── SpreadPricingStrategy(spreadMonthly)
            PV = FV / (1 + baseRate + spread) ^ (termDays / 30)
```

A `PricingFactory` recebe um `ReceivableType` e retorna a estratégia correta. Adicionar um novo tipo de recebível não exige alteração na lógica de cálculo — apenas um novo registro no banco ou uma nova implementação de estratégia.

### Precisão decimal

Todos os valores financeiros usam `decimal.js` nos cálculos e `NUMERIC(20, 6)` no banco. Nunca `float` nativo, que acumula erros de representação binária em operações financeiras.

### ACID e Optimistic Locking

A liquidação envolve a leitura de cedente e tipo de recebível, cálculo e persistência da transação — tudo dentro de um único `DataSource.transaction()`. Isso garante atomicidade.

A entidade `Transaction` possui `@VersionColumn()` (campo `version`): o TypeORM incrementa automaticamente e lança `OptimisticLockVersionMismatch` em caso de escrita concorrente sobre o mesmo registro, evitando race conditions.

### Currency Engine com cache em memória

O `CurrencyService` mantém um `Map<string, Decimal>` carregado no `onModuleInit`. A taxa só vai ao banco quando não está no cache ou após atualização via `PUT /currencies/:code/rate`. Evita round-trips desnecessários ao banco em cada cálculo.

### Query Builder para relatórios analíticos

O extrato de liquidações usa `createQueryBuilder` com filtros dinâmicos e paginação via `.skip().take()`, ao invés de carregar toda a tabela e filtrar em memória. O índice composto `(cedente_id, payment_currency, created_at DESC)` acelera as consultas mais comuns.

### Global Exception Filter

`AllExceptionsFilter` intercepta todas as exceções (HTTP, TypeORM `QueryFailedError`, erros inesperados) e responde com envelope padronizado:

```json
{
  "statusCode": 422,
  "error": "DATABASE_ERROR",
  "message": "A database operation failed.",
  "traceId": "uuid-gerado-por-request",
  "path": "/transactions/liquidate",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

Erros 5xx são logados com stack trace; erros 4xx são silenciosos.

---

## Diagramas

| Diagrama | Descrição |
|---|---|
| [C4 Nível 1 — Contexto](docs/c4-context.md) | Sistema no contexto de usuários e sistemas externos |
| [C4 Nível 2 — Containers](docs/c4-container.md) | Containers que compõem o sistema e seus relacionamentos |
| [ER](docs/er-diagram.md) | Entidades, atributos e relacionamentos do banco de dados |
| [Sequence — Liquidação](docs/sequence-liquidation.md) | Fluxo completo de uma liquidação: ACID, Strategy e conversão cambial |

---

## ADRs

Decisões arquiteturais relevantes documentadas em `docs/adr/`:

| ADR | Decisão |
|---|---|
| [001](docs/adr/001-decimal-js.md) | Uso de `decimal.js` para aritmética financeira em vez de `float` nativo |
| [002](docs/adr/002-fx-rate-snapshot.md) | Snapshot de `fx_rate` na transação — sem FK para `currencies` |
| [003](docs/adr/003-strategy-pattern-pricing.md) | Strategy Pattern com Factory para o Pricing Engine |

---

## Scripts DDL

O DDL completo está nas migrations em `src/database/migrations/`. Para inspecionar:

```bash
# ver todas as migrations disponíveis
ls src/database/migrations/
```

Ou acesse o pgAdmin em `http://localhost:5050` após o compose subir.

---

## Testes

```bash
# unit tests
yarn test

# com cobertura
yarn test:cov

# modo watch
yarn test:watch
```

Os testes unitários cobrem a `SpreadPricingStrategy`:

- Cálculo de VP para 30 e 60 dias
- Relação VP < face_value (deságio sempre positivo)
- Comparação entre spreads (maior spread → maior deságio)
- Cálculo do `discount_rate` como proporção do face_value
- Precisão com valores grandes (R$ 999.999.999,99)
- Edge case: `termDays = 0` → VP = face_value

---

## Git workflow

O projeto segue **GitHub Flow**: branches de feature mergeadas via Pull Request na `main`.

Hooks configurados com Husky:

| Hook | O que faz |
|---|---|
| `pre-commit` | ESLint + Prettier via `lint-staged` |
| `commit-msg` | `commitlint` exige Conventional Commits |
| `pre-push` | Roda a suíte de testes unitários |

Padrão de commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
