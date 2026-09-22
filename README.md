# DevSecOps

[![CI](https://github.com/devsecops-prhr/devsecops/actions/workflows/ci.yml/badge.svg)](https://github.com/devsecops-prhr/devsecops/actions/workflows/ci.yml)
[![QA](https://github.com/devsecops-prhr/devsecops/actions/workflows/qa.yml/badge.svg)](https://github.com/devsecops-prhr/devsecops/actions/workflows/qa.yml)
[![Security](https://github.com/devsecops-prhr/devsecops/actions/workflows/security.yml/badge.svg)](https://github.com/devsecops-prhr/devsecops/actions/workflows/security.yml)
[![SBOM](https://github.com/devsecops-prhr/devsecops/actions/workflows/sbom.yml/badge.svg)](https://github.com/devsecops-prhr/devsecops/actions/workflows/sbom.yml)
[![Release](https://github.com/devsecops-prhr/devsecops/actions/workflows/release.yml/badge.svg)](https://github.com/devsecops-prhr/devsecops/actions/workflows/release.yml)

Projeto de estudo de **GitHub Actions com foco em DevSecOps**. Contém três mini aplicações (Node.js, Flask e Java), cada uma com seus testes, qualidade de código, segurança, geração de SBOM e pipeline de deploy por ambientes (dev/staging/prod).

## Índice

- [Estrutura](#estrutura)
- [Pipelines (GitHub Actions)](#pipelines-github-actions)
- [Aplicações](#aplicações)
- [Qualidade de código (QA)](#qualidade-de-código-qa)
- [Segurança (DevSecOps)](#segurança-devsecops)
- [SBOM (Software Bill of Materials)](#sbom-software-bill-of-materials)
- [Deploy por ambientes](#deploy-por-ambientes-dev--staging--prod)
- [Como executar localmente](#como-executar-localmente)
- [Documentação](#documentação)
- [Licença](#licença)

## Estrutura

```
devsecops/
├── .github/
│   ├── dependabot.yml              # Atualização automática de dependências
│   └── workflows/
│       ├── ci.yml                  # CI: testes dos 3 apps (matrix strategy)
│       ├── qa.yml                  # QA: lint, formatação e qualidade
│       ├── security.yml            # Segurança: CodeQL + gitleaks + audit
│       ├── sbom.yml                # SBOM: Syft + Grype
│       └── release.yml             # CD: deploy dev/staging/prod
├── apps/
│   ├── nodejs/                     # App Node.js (Express) + Jest
│   ├── flask/                      # App Flask (Python) + Pytest
│   └── java/                       # App Java (Maven) + JUnit 5
├── k8s/
│   ├── base/                       # Manifests base dos 3 apps
│   └── overlays/                   # Overlays por ambiente (Kustomize)
│       ├── dev/
│       ├── staging/
│       └── prod/
├── .gitignore
└── README.md
```

## Pipelines (GitHub Actions)

| Workflow | O que faz | Gatilhos |
|----------|-----------|----------|
| `ci.yml` | Testes dos 3 apps + cobertura mínima (70%) | push/PR na main |
| `qa.yml` | ESLint/Prettier, Black/Flake8, Checkstyle | push/PR na main |
| `security.yml` | CodeQL (SAST), gitleaks (segredos), audit de deps | push/PR/main, semanal |
| `sbom.yml` | Gera SBOM (CycloneDX) + auditoria de CVEs | push/PR/main, manual |
| `release.yml` | Publica imagens no GHCR e promove dev→staging→prod | tag `v*`, manual |

Todas as pipelines seguem boas práticas: `concurrency` (cancela runs duplicados), `timeout-minutes`, `permissions` mínimas e `workflow_dispatch`.

## Aplicações

| App | Stack | Testes | Cobertura | Porta |
|-----|-------|--------|-----------|-------|
| `nodejs` | Express + Jest + Supertest | 8 | Jest (70%) | 3000 |
| `flask` | Flask + Pytest + pytest-cov | 9 | pytest-cov (84%) | 5000 |
| `java` | Maven + JUnit 5 + JaCoCo | 9 | JaCoCo (70%) | — |

As três apps expõem uma API CRUD de tarefas (`/todos`) com validação de entrada e endpoint `/health`.

## Qualidade de código (QA)

O workflow `qa.yml` roda em paralelo para os 3 apps:

- **Node.js:** ESLint (`npm run lint`) + Prettier (`npm run format:check`)
- **Flask:** Black (`black --check`) + Flake8 (`flake8`)
- **Java:** Checkstyle (`mvn checkstyle:check`)

## Segurança (DevSecOps)

O workflow `security.yml` combina múltiplas camadas:

1. **Gitleaks** — escaneia o histórico em busca de segredos commitados.
2. **Audit de dependências** — `npm audit` (Node) e `pip-audit` (Python).
3. **CodeQL** — análise estática de segurança nas 3 linguagens (queries `security-and-quality`).

Além disso, o [Dependabot](.github/dependabot.yml) cria PRs automáticos de atualização de dependências e alertas de CVE.

## SBOM (Software Bill of Materials)

O workflow `sbom.yml` gera o inventário de dependências (formato **CycloneDX**) com o [Syft](https://github.com/anchore/syft) e audita CVEs com o [Grype](https://github.com/anchore/grype). Os SBOMs são publicados como artefatos do run.

**Gerar manualmente:**
```bash
docker run --rm -v "$PWD/apps/nodejs":/scan -w /scan anchore/syft:latest dir:. -o cyclonedx-json > nodejs-sbom.json
docker run --rm -v "$PWD/apps/flask":/scan -w /scan anchore/syft:latest dir:. -o cyclonedx-json > flask-sbom.json
docker run --rm -v "$PWD/apps/java":/scan -w /scan anchore/syft:latest dir:. -o cyclonedx-json > java-sbom.json
```

**Auditar CVEs de um SBOM:**
```bash
docker run --rm -v "$PWD":/scan -w /scan anchore/grype:latest sbom:nodejs-sbom.json --fail-on high -o table
```

> **Nota de estudo:** para Python/Java o Syft lê apenas as dependências de primeiro nível dos manifestos. Para um SBOM transitivo completo, instale/build as dependências antes (ex.: `pip install -r requirements.txt` ou `mvn dependency:tree`).

## Deploy por ambientes (dev / staging / prod)

O workflow `release.yml` promove as imagens pelos três ambientes em sequência:

```
build (GHCR) → deploy-dev → deploy-staging → deploy-prod (aprovação manual)
```

Cada ambiente é um [GitHub Environment](https://docs.github.com/actions/deployment/using-environments-for-deployment) apontando para um **namespace** do cluster (manifests em `k8s/overlays/<ambiente>`, usando Kustomize).

Os manifests aplicam boas práticas de segurança no Kubernetes: `runAsNonRoot`, `readOnlyRootFilesystem`, `allowPrivilegeEscalation: false`, `capabilities.drop`, limites de recursos e probes de saúde.

**Configuração manual necessária (uma vez):**
1. Criar os environments em `Settings → Environments`: `dev`, `staging`, `production`.
2. Em `production`, adicionar **Required reviewers** — bloqueia o deploy até aprovação humana.
3. Criar os secrets em `Settings → Secrets and variables → Actions`: `KUBECONFIG` e `K8S_CONTEXT`.

> Sem o lab K8s montado, os jobs `deploy-*` ainda não têm onde aplicar os manifests.

## Como executar localmente

**Node.js:**
```bash
cd apps/nodejs
npm install
npm test
```

**Flask:**
```bash
cd apps/flask
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
pytest --cov=app --cov-fail-under=70 -v
```

**Java:**
```bash
cd apps/java
mvn verify
```

## Documentação

- [Guia de contribuição](CONTRIBUTING.md)
- [Política de segurança](SECURITY.md)
- [Deploy por ambientes e lab Kubernetes](docs/deploy.md)

## Licença

MIT
