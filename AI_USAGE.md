# AI Usage — SRM Credit Engine

Documentação do uso de IA (Claude via Claude Code) no desenvolvimento deste case, conforme solicitado nas diretrizes do desafio.

---

## Contexto de uso

A IA foi utilizada como co-piloto ao longo de todo o desenvolvimento — desde o planejamento das fases até a implementação de módulos específicos. O modelo utilizado foi **Claude Sonnet 4.6** via **Claude Code (CLI)**, com acesso direto ao repositório e capacidade de ler, escrever e modificar arquivos.

---

## O que funcionou bem

**Organização e cadência do desenvolvimento**
A IA foi eficaz em estruturar o roadmap em fases (Setup → Domínio → APIs → Frontend → Observabilidade → Deploy) e em manter o foco durante a execução. Quando o desenvolvimento desviava, ela retomava o contexto sem perder o fio. Esse papel de "guardião do backlog" economizou tempo real.

**Ideia de diferenciação por risco de cedente**
Durante a modelagem do domínio, a IA sugeriu a possibilidade de aplicar um spread adicional baseado no `risk_tier` do cedente — uma extensão natural do motor de precificação que não estava no escopo original. A ideia fazia sentido arquitetural e foi mantida no design da entidade.

**Infraestrutura de observabilidade**
A configuração do stack de observabilidade (Winston estruturado, `AsyncLocalStorage` para propagação de `traceId`, Prometheus via `prom-client`, Grafana, `GET /health`) foi entregue com qualidade e integrada corretamente ao módulo `ObservabilityModule` com `APP_FILTER` e `APP_INTERCEPTOR` globais.

**Testes do `TransactionRepository`**
A suíte de testes para o extrato (40 casos cobrindo filtros, paginação, volume simulado e edge cases de cálculo de páginas) foi gerada com cobertura real e estrutura clara.

**Setup de CI/CD e Docker**
Os workflows do GitHub Actions (`ci.yml` com lint → typecheck → test → build; `cd.yml` com deploy via SSH na Oracle VM), o `docker-compose.yml` com todos os serviços e o `Dockerfile` multi-stage foram entregues funcionais com ajustes pontuais.

---

## O que não funcionou — alucinações e correções necessárias

**Strategy Pattern com spreads fixos no código**
Na primeira implementação, a IA criou classes `DuplicataMercantilStrategy` e `ChequePreDatadoStrategy` com spreads hardcodados (0.015 e 0.025). O problema: o banco já armazena `spread_monthly` por tipo de recebível — a regra devia ser data-driven, não code-driven. Foi necessário refatorar para uma `SpreadPricingStrategy` única parametrizada pelo valor do banco.

**Rotas necessárias não criadas**
Os endpoints `POST /transactions/simulate` e `POST /transactions/liquidate` dependem de `receivable_type_id`, mas a IA não criou o endpoint `GET /receivable-types` no planejamento inicial. A ausência só foi percebida ao tentar usar a API — a IA não antecipou a dependência funcional.

**Query do extrato dentro do Service**
A implementação inicial colocou todo o QueryBuilder do extrato dentro do `TransactionService`, misturando responsabilidade de negócio com lógica de consulta. O case explicita que relatórios podem ter duas camadas (Controller → Repository), sem passar pelo Service. Foi necessário mover a query para o `TransactionRepository` manualmente.

**Simulador do frontend**
A implementação do painel de simulação precisou de retrabalho extenso. A IA criou uma versão funcional mas com problemas de UX, lógica de estado e integração com a API que exigiram ajustes em praticamente toda a tela.

**Perda de padrão ao solicitar mudanças de layout**
Ao solicitar alterações visuais no frontend, a IA começou a adicionar componentes diretamente dentro do arquivo orquestrador do módulo, quebrando o padrão de separação entre componentes de UI e lógica já estabelecido. A cada mudança de layout, havia risco de regressão no padrão arquitetural.

**README com inferências incorretas**
O README gerado continha rotas que não existiam na API e afirmava decisões de arquitetura que não foram tomadas. A leitura do README por alguém externo daria uma visão imprecisa do projeto. Foi necessária uma revisão manual completa.

**Relação Transaction → Currency**
Em um momento da modelagem, a IA sugeriu criar uma foreign key entre a entidade `Transaction` e a entidade `Currency`. A relação não faz sentido: a moeda de uma transação é um valor registrado no momento da liquidação (dado imutável de auditoria), não uma referência a uma entidade que pode mudar de taxa. A sugestão foi descartada.

---

## Análise crítica

| Dimensão | Avaliação |
|---|---|
| Planejamento e organização | Forte — manteve cadência e contexto |
| Código de infraestrutura (Docker, CI/CD, observabilidade) | Forte — entregue com pouco retrabalho |
| Domínio financeiro (regras de negócio) | Fraco — exigiu supervisão constante e correções |
| Frontend (UX, estado, padrões) | Fraco — retrabalho significativo |
| Documentação (README, ADRs) | Misto — ADRs úteis; README impreciso |
| Testes | Forte quando bem direcionado |

**Conclusão:** a IA acelerou o desenvolvimento de infraestrutura, testes e organização, mas não substituiu o julgamento de domínio. As decisões críticas — modelagem financeira, separação de responsabilidades, padrões de frontend — precisaram de intervenção humana direta. O valor real foi como ferramenta de aceleração, não de autonomia.
