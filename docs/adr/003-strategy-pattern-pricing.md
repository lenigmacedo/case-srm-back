# ADR 003 — Strategy Pattern com Factory para o Pricing Engine

**Status:** Aceito

## Contexto

O desafio exige que diferentes tipos de recebível (Duplicata Mercantil, Cheque Pré-datado) tenham regras de risco (spread) distintas. A abordagem mais simples seria um `if/switch` dentro do serviço de transação:

```ts
if (type === 'DUPLICATA') spread = 0.015
else if (type === 'CHEQUE') spread = 0.025
```

Esse modelo viola o princípio Open/Closed (SOLID): adicionar um novo tipo exige modificar o código existente, aumentando o risco de regressão em regras já validadas.

## Decisão

Aplicar o **Strategy Pattern** desacoplando a regra de cálculo da orquestração:

- `IPricingStrategy` define o contrato: `calculate(params): PricingResult`
- `SpreadPricingStrategy` implementa a fórmula `PV = FV / (1 + baseRate + spread) ^ (termDays/30)` para qualquer spread informado
- `PricingFactory` recebe um `ReceivableType` e instancia a estratégia correta

O spread de cada tipo de recebível vive no banco (`receivable_types.spread_monthly`), não no código. Adicionar um novo tipo é apenas um `INSERT` — zero alteração de código.

## Consequências

- Novos tipos de recebível com spreads diferentes não exigem alteração no Pricing Engine — apenas um `INSERT` em `receivable_types`
- Se um produto futuro exigir uma fórmula de precificação completamente diferente (ex: taxa pré-fixada absoluta, curva de juros), basta criar uma nova classe que implemente `IPricingStrategy` e registrá-la na `PricingFactory` — o `TransactionService` permanece intocado, pois só conhece a interface, nunca a implementação concreta
- A camada de `TransactionService` está, portanto, completamente isolada das regras de precificação: novos produtos, novas fórmulas ou mudanças de spread não geram risco de regressão no fluxo de liquidação
- Cada estratégia é testável de forma isolada (os testes unitários cobrem `SpreadPricingStrategy` diretamente, sem subir o contexto NestJS)
- Leve aumento de indireção em relação ao `if/switch`, justificado pela extensibilidade e testabilidade