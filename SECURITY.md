# Política de segurança

Levamos a segurança a sério. Este projeto é um ambiente de estudo de DevSecOps, mas ainda assim tratamos vulnerabilidades com responsabilidade.

## Reportando uma vulnerabilidade

**Não abra issue pública** para vulnerabilidades de segurança. Envie um relatório privado.

Para divulgação responsável:

1. **GitHub Security Advisory** (recomendado): use a opção *Report a vulnerability* na aba *Security* do repositório.
2. **E-mail:** entre em contato pelos canais definidos pelo mantenedor.

Inclua no relatório:

- Descrição da vulnerabilidade.
- Passos para reprodução (quanto mais objetivo, melhor).
- Impacto esperado.
- Versão/commit afetado, se aplicável.

## Escopo

O que está em escopo para análise de segurança:

- O código-fonte das aplicações em `apps/`.
- Os workflows de CI/CD em `.github/workflows/`.
- Os manifests de infraestrutura em `k8s/`.

## Respostas esperadas

- **Confirmação de recebimento:** em até 3 dias úteis.
- **Plano de correção:** assim que a análise for concluída.

Após a correção, agradecemos e podemos citar o pesquisador (se desejar) nos créditos.

## Segurança das dependências

- O **Dependabot** mantém as dependências atualizadas e gera alertas de CVE.
- O pipeline de **segurança** roda `npm audit`, `pip-audit` e **CodeQL** em cada PR/push.
- O workflow de **SBOM** audita o inventário de dependências com **Grype**.
