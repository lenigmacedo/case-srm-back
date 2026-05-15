# ADR 001 — Uso de decimal.js para aritmética financeira

**Status:** Aceito

## Contexto

Operações financeiras exigem precisão decimal absoluta. O tipo `number` do JavaScript usa representação IEEE 754 de ponto flutuante binário, que não consegue representar exatamente certos valores decimais:

```js
0.1 + 0.2 // 0.30000000000000004
```

Em cálculos de deságio com juros compostos — onde o erro se acumula a cada exponenciação — essa imprecisão se torna inaceitável. Um erro de R$ 0,000001 por operação, multiplicado por milhares de liquidações, gera inconsistência contábil.

## Decisão

Utilizar a biblioteca `decimal.js` para todos os cálculos dentro do Pricing Engine e do Currency Service. Os valores financeiros trafegam como `string` entre camadas e são convertidos para `Decimal` apenas no momento do cálculo.

No banco de dados, a coluna correspondente usa `NUMERIC(20, 6)` — tipo decimal exato do PostgreSQL — nunca `FLOAT` ou `REAL`.

## Consequências

- Cálculos de VP, deságio e conversão cambial são deterministicos e auditáveis
- Leve overhead de serialização (`string` ↔ `Decimal`), irrelevante para o volume desta aplicação
- `NUMERIC(20, 6)` no PostgreSQL garante que a precisão não se perde na persistência