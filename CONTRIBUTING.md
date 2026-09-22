# Guia de contribuição

Obrigado pelo interesse em contribuir com este projeto. Este guia define o processo para manter a qualidade, a segurança e a consistência do código.

## Como contribuir

1. Faça um **fork** do repositório.
2. Crie uma branch para sua alteração: `git checkout -b feat/minha-mudanca`.
3. Faça as alterações seguindo os padrões abaixo.
4. Execute os testes e o QA antes de abrir o PR.
5. Abra um **Pull Request** para a branch `main` descrevendo o que foi feito e o motivo.

## Padrões de qualidade

O CI roda **QA** e **testes** automaticamente. Antes de abrir um PR, garanta que localmente tudo passa:

### Node.js (`apps/nodejs`)
```bash
npm install
npm run lint          # ESLint
npm run format:check  # Prettier
npm test              # Jest + cobertura (mín. 70%)
```

### Flask (`apps/flask`)
```bash
pip install -r requirements.txt
black --check .       # formatação
flake8 .              # estilo PEP8
pytest --cov=app --cov-fail-under=70 -v
```

### Java (`apps/java`)
```bash
mvn verify            # Checkstyle + testes + JaCoCo (mín. 70%)
```

## Critérios de aceite

- Todos os status checks do CI devem passar (CI, QA, Security, SBOM).
- A cobertura de testes não pode regredir abaixo de **70%**.
- Nenhum segredo ou credencial pode ser commitado (o pipeline de segurança bloqueia).
- Código novo deve seguir o padrão das apps existentes.

## Convenções

- **Branch naming:** `feat/`, `fix/`, `chore/`, `docs/`, `security/`.
- **Mensagens de commit:** descritivas e em inglês ou português, imperativo curto.
- **Revisão:** pelo menos uma revisão antes do merge em `main`.

## Reportando bugs

Abra uma issue descrevendo o comportamento esperado, o observado, e passos para reproduzir. Se envolver segurança, veja o [SECURITY.md](SECURITY.md).
