# ADR 004 — Estratégia de Deploy: Dois Repos, Um Compose, Build na VM

**Status:** Aceito
**Data:** 2026-05-15
**Contexto:** Deploy da stack SRM Credit Engine via GitHub Actions para Oracle Cloud Free Tier

---

## Contexto

O projeto possui dois repositórios separados (`case-srm-back` e `case-srm-front`), cada um com seu próprio `Dockerfile`. Em produção real, cada serviço teria seu próprio pipeline de build, publicação em registry e deploy independente. Neste contexto de case, o objetivo é demonstrar a stack completa rodando em nuvem com o menor atrito operacional possível, sem abrir mão da separação de repositórios já estabelecida.

A Oracle Cloud Free Tier disponibiliza uma VM ARM Ampere A1 com até 4 OCPUs e 24 GB de RAM — recursos suficientes para construir e rodar toda a stack localmente na própria VM via Docker Compose.

---

## Decisão

Cada repositório mantém seu próprio `Dockerfile`. O `docker-compose.yml` do backend orquestra todos os serviços, referenciando o frontend pelo caminho relativo `../case-srm-front`:

```yaml
frontend:
  build:
    context: ../case-srm-front
    dockerfile: Dockerfile
    args:
      VITE_API_URL: ${VITE_API_URL:-http://localhost:3000}
```

Na Oracle VM, ambos os repositórios ficam clonados como irmãos sob `~/srm/`:

```
~/srm/
  case-srm-back/   ← docker-compose.yml aqui
  case-srm-front/  ← referenciado pelo compose
```

O pipeline GitHub Actions (`.github/workflows/cd.yml`) faz deploy via SSH:

```
push main → SSH Oracle VM → git pull (back + front) → docker compose up --build
```

As imagens **são construídas diretamente na VM**, sem registry intermediário. O CD apenas sincroniza o código e dispara o rebuild.

---

## Alternativas Consideradas

| Alternativa                                                                  | Por que descartada                                                                                                                                                                |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Imagem combinada (frontend embutido no backend via `@nestjs/serve-static`) | Elimina a separação de responsabilidades dos Dockerfiles já existentes; qualquer mudança no frontend força rebuild completo do backend                                       |
| Publicar imagens no GHCR e fazer `docker pull` na VM                       | Adiciona etapa de build no Actions (lento para ARM64 via QEMU) e gerenciamento de credenciais de registry; o `docker compose up --build` na VM é mais simples para este escopo |
| Oracle Container Registry (OCIR)                                             | Requer Auth Token OCI e namespace específico — overhead desnecessário para um case                                                                                             |
| Dois composes independentes                                                  | Dificulta o orquestramento conjunto dos serviços (prometheus, grafana, postgres) que são compartilhados                                                                         |

---

## Consequências

**Positivas:**

- Cada repo mantém seu Dockerfile próprio — sem acoplamento entre front e back no nível de imagem
- Compose único orquestra toda a stack: backend, frontend (nginx), postgres, prometheus, grafana
- Deploy simples: `git pull` + `docker compose up --build` — sem registry, sem credenciais extras
- Fácil de adaptar para separação completa no futuro (basta extrair o `frontend` do compose)

**Negativas / Trade-offs aceitos:**

- O build acontece na VM a cada deploy — consome CPU e memória durante a atualização (~2-5 min)
- A VM precisa ter os dois repos clonados e configurados previamente (setup manual único)
- `.env` com credenciais de produção precisa estar presente na VM (não versionado)
- Sem rollback automático — em caso de falha no build, o serviço anterior continua rodando (comportamento do `docker compose up`)

---

## Reversibilidade

Migrar para um modelo baseado em registry exige:

1. Adicionar job de build + push no `ci.yml`
2. Substituir o `build.context` do compose por `image: ghcr.io/<user>/srm-*:latest`
3. O script de deploy passa de `docker compose up --build` para `docker compose pull && docker compose up -d`

---

## Referências

- [`.github/workflows/cd.yml`](../../.github/workflows/cd.yml)
- [`docker-compose.yml`](../../docker-compose.yml)
- [Oracle Cloud Free Tier — Always Free resources](https://www.oracle.com/cloud/free/)
