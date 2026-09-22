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

## Licença

MIT
