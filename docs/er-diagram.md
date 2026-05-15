# Diagrama ER

```mermaid
erDiagram
    currencies {
        UUID        id             PK
        VARCHAR10   code           UK
        VARCHAR50   name
        NUMERIC206  rate_to_brl
        TIMESTAMPTZ updated_at
    }

    receivable_types {
        UUID        id             PK
        VARCHAR50   code           UK
        VARCHAR100  name
        NUMERIC206  spread_monthly
    }

    cedentes {
        UUID        id             PK
        VARCHAR14   cnpj           UK
        VARCHAR150  name
        ENUM        risk_tier
    }

    transactions {
        UUID        id                 PK
        NUMERIC206  face_value
        NUMERIC206  present_value
        NUMERIC206  discount_amount
        NUMERIC206  discount_rate
        INT         term_days
        DATE        due_date
        NUMERIC206  base_rate_monthly
        VARCHAR10   payment_currency
        VARCHAR10   origin_currency
        NUMERIC206  fx_rate
        ENUM        status
        UUID        cedente_id         FK
        UUID        receivable_type_id FK
        INT         version
        TIMESTAMPTZ created_at
        TIMESTAMPTZ updated_at
    }

    cedentes          ||--o{ transactions : "possui"
    receivable_types  ||--o{ transactions : "classifica"
```

> `currencies` não possui FK direto em `transactions` por design intencional. No momento da liquidação, a taxa de câmbio vigente é copiada para o campo `fx_rate` da transação como um snapshot imutável. Isso garante rastreabilidade auditável: alterações futuras na tabela `currencies` não afetam o histórico de operações já liquidadas. O mesmo princípio se aplica ao campo `base_rate_monthly`, que também é persistido por valor e não por referência.