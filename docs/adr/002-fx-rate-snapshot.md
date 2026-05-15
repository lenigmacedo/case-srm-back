# ADR 002 — Snapshot de taxa de câmbio na transação (sem FK para currencies)

**Status:** Aceito

## Contexto

A tabela `currencies` armazena a taxa de câmbio vigente de cada moeda. Essa taxa muda com frequência — pode ser atualizada manualmente via `PUT /currencies/:code/rate` ou, numa evolução futura, por integração com feeds de mercado.

Uma abordagem ingênua seria manter apenas `payment_currency` e `origin_currency` como códigos e buscar a taxa atual em `currencies` no momento de qualquer consulta. O problema: a taxa de hoje não é a taxa que vigorava no momento da liquidação. Relatórios históricos ficariam incorretos, e o sistema perderia rastreabilidade contábil.

## Decisão

No momento da liquidação, a taxa de câmbio aplicada é copiada como valor (`fx_rate NUMERIC(20,6)`) diretamente na linha da transação. A tabela `currencies` não possui FK em `transactions`.

O mesmo princípio se aplica à `base_rate_monthly`: a taxa base vigente no momento do cálculo é persistida por valor, não por referência a uma tabela externa.

Cada transação é, portanto, um **registro imutável e autossuficiente** — pode ser auditada, recalculada ou contestada sem depender do estado atual de nenhuma outra tabela.

## Consequências

- Rastreabilidade total: qualquer transação pode ser auditada de forma independente
- Alterações futuras nas taxas não afetam o histórico de operações liquidadas
- A tabela `transactions` fica levemente mais larga, mas o custo de armazenamento é negligenciável
- Para relatórios que exigem a taxa atual, o join com `currencies` ainda pode ser feito por código (`payment_currency = currencies.code`), sem FK formal