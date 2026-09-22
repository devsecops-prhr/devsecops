# DevSecOps

Projeto de estudo de GitHub Actions com foco em DevSecOps. Contém três mini aplicações (Node.js, Flask e Java), cada uma com seus testes, e pipelines de CI/CD e segurança.

## Sobre

Automatização de práticas de segurança no ciclo de vida do software: análise estática (SAST), escaneamento de segredos, verificação de dependências e build/testes automatizados.

## Estrutura

```
devsecops/
├── .github/
│   ├── dependabot.yml        # Atualização automática de dependências
│   └── workflows/
│       ├── ci.yml            # CI: testes dos 3 apps (matrix strategy)
│       └── security.yml      # CodeQL + gitleaks + audit de dependências
├── apps/
│   ├── nodejs/               # App Node.js (Express) + Jest
│   ├── flask/                # App Flask (Python) + Pytest
│   └── java/                 # App Java (Maven) + JUnit 5
├── .gitignore
└── README.md
```

## Pipelines (GitHub Actions)

| Workflow | O que faz |
|----------|-----------|
| `ci.yml` | Roda os testes das 3 apps usando **matrix strategy** |
| `security.yml` | **CodeQL** (SAST), **gitleaks** (secret scan) e **audit** de dependências |
| `dependabot.yml` | Mantém dependências e Actions atualizadas |

## Como executar os testes localmente

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
pytest -v
```

**Java:**
```bash
cd apps/java
mvn test
```

## SBOM (Software Bill of Materials)

O workflow `sbom.yml` gera o inventário de dependências dos 3 apps (formato **CycloneDX**) usando o [Syft](https://github.com/anchore/syft) e depois audita CVEs com o [Grype](https://github.com/anchore/grype).

**Para gerar manualmente:**
```bash
# Node.js
docker run --rm -v "$PWD/apps/nodejs":/scan -w /scan anchore/syft:latest dir:. -o cyclonedx-json > nodejs-sbom.json

# Flask (Python)
docker run --rm -v "$PWD/apps/flask":/scan -w /scan anchore/syft:latest dir:. -o cyclonedx-json > flask-sbom.json

# Java
docker run --rm -v "$PWD/apps/java":/scan -w /scan anchore/syft:latest dir:. -o cyclonedx-json > java-sbom.json
```

**Para auditar vulnerabilidades de um SBOM:**
```bash
docker run --rm -v "$PWD":/scan -w /scan anchore/grype:latest sbom:nodejs-sbom.json --fail-on high -o table
```

> Nota de estudo: para Python/Java o Syft lê apenas as dependências de primeiro nível dos manifestos. Para um SBOM transitivo completo, instale/build as dependências antes (ex.: `pip install -r requirements.txt` ou `mvn dependency:tree`).

## Deploy por ambientes (dev / staging / prod)

O workflow `release.yml` promove as imagens pelos três ambientes em sequência:

```
build (GHCR) → deploy-dev → deploy-staging → deploy-prod (aprovação manual)
```

Cada ambiente é um [GitHub Environment](https://docs.github.com/actions/deployment/using-environments-for-deployment) apontando para um **namespace** do cluster (manifests em `k8s/overlays/<ambiente>`, usando Kustomize).

### Configuração manual necessária (uma vez)

1. **Criar os environments** em `Settings → Environments`: `dev`, `staging`, `production`.
2. **Em `production`**, adicionar **Required reviewers** (você mesmo) — isso bloqueia o deploy até aprovação humana.
3. **Criar os secrets** em `Settings → Secrets and variables → Actions`:
   - `KUBECONFIG` — conteúdo do kubeconfig de acesso ao cluster
   - `K8S_CONTEXT` — nome do contexto a usar (ex.: `control-plane`)

> Sem o lab K8s montado, os jobs `deploy-*` ainda não têm onde aplicar os manifests. O passo a passo de subida do cluster fica para a etapa do lab.

## Licença

MIT
