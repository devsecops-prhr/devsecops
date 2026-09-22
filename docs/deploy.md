# Deploy por ambientes e Lab Kubernetes

Este documento detalha a estratégia de deploy por ambientes (**dev**, **staging** e **prod**) e o passo a passo para montar um lab Kubernetes que receba as aplicações.

## Visão geral

O pipeline de release (`release.yml`) publica as imagens no **GitHub Container Registry (GHCR)** e as promove pelos três ambientes em sequência:

```
build (GHCR) → deploy-dev → deploy-staging → deploy-prod (aprovação manual)
```

Cada ambiente é um **GitHub Environment** mapeado para um **namespace** no cluster Kubernetes:

| Ambiente | Environment (GitHub) | Namespace (K8s) | Aprovação |
|----------|----------------------|-----------------|-----------|
| dev | `dev` | `dev` | automática |
| staging | `staging` | `staging` | automática |
| prod | `production` | `prod` | **manual (obrigatória)** |

## Estrutura de manifests

Usamos **Kustomize** para gerar os manifestos por ambiente:

```
k8s/
├── base/                        # Manifests base (Deployment + Service + Namespaces)
│   ├── namespaces.yaml
│   ├── nodejs.yaml
│   ├── flask.yaml
│   ├── java.yaml
│   └── kustomization.yaml
└── overlays/
    ├── dev/kustomization.yaml
    ├── staging/kustomization.yaml
    └── prod/kustomization.yaml
```

Cada overlay redefine apenas o `namespace`, herdando o restante do `base`.

### Boas práticas de segurança aplicadas aos manifests

- `securityContext`: `runAsNonRoot: true`, `runAsUser: 1000`, `fsGroup: 2000`.
- `allowPrivilegeEscalation: false`.
- `readOnlyRootFilesystem: true`.
- `capabilities: drop: [ALL]`.
- `resources.requests`/`limits` (CPU e memória).
- Probes de `readiness`/`liveness` usando o endpoint `/health` (nodejs e flask).

> O app **java** é um CLI (não expõe HTTP), por isso não possui probes de saúde.

## Como funciona o workflow de release

O `release.yml` é composto por 4 jobs encadeados com `needs:`:

1. **build-and-push** — builda e publica as imagens no GHCR (tags `latest` e por `${{ github.sha }}`).
2. **deploy-dev** — `needs: build-and-push`, environment `dev`. Aplica `k8s/overlays/dev`.
3. **deploy-staging** — `needs: deploy-dev`, environment `staging`. Aplica `k8s/overlays/staging`.
4. **deploy-prod** — `needs: deploy-staging`, environment `production`. Aplica `k8s/overlays/prod`.

O job `deploy-prod` fica **pausado aguardando aprovação** porque o environment `production` possui *required reviewers*.

## Configuração manual no GitHub (uma vez)

### 1. Criar os environments

1. No repositório, vá em **Settings → Environments**.
2. Crie três environments: `dev`, `staging` e `production`.

### 2. Configurar aprovação em produção

1. Abra o environment **production**.
2. Em **Required reviewers**, adicione usuários/equipes autorizados a aprovar.
3. (Opcional) Em **Deployment branches**, limite o deploy a `main` ou a tags.

### 3. Criar os secrets

Em **Settings → Secrets and variables → Actions**, crie:

| Secret | Descrição |
|--------|-----------|
| `KUBECONFIG` | Conteúdo do kubeconfig de acesso ao cluster. |
| `K8S_CONTEXT` | Nome do contexto a ser usado (ex.: `control-plane`). |

> O segredo `GITHUB_TOKEN` já é injetado automaticamente; usado para login no GHCR.

## Passo a passo do Lab Kubernetes

Siga esta ordem para subir o ambiente e conectar o pipeline ao cluster.

### 1. Escolher e subir o cluster

As opções variam de local a cloud:

- **kind / minikube / k3s** — locais, ótimos para estudo.
- **EKS / AKS / GKE** — gerenciados na nuvem.

Para este lab, recomenda-se um cluster com pelo menos **3 nós** (2 workers + 1 control-plane) para exercitar `replicas: 2`.

### 2. Validar o acesso

```bash
kubectl get nodes
kubectl get namespaces
```

### 3. Criar os namespaces

```bash
kubectl create namespace dev
kubectl create namespace staging
kubectl create namespace prod
```

> Os manifests em `k8s/base/namespaces.yaml` já definem os três namespaces — serão aplicados automaticamente pelo pipeline.

### 4. Configurar acesso no GitHub

1. Obtenha o `kubeconfig` do cluster e copie seu conteúdo.
2. Configure o secret `KUBECONFIG` com esse conteúdo e `K8S_CONTEXT` com o nome do contexto.

### 5. Autorizar o cluster a puxar do GHCR

Como as imagens ficam no **GHCR**, o cluster precisa de credenciais:

```bash
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=<seu-usuario> \
  --docker-password=<seu-token-PAT> \
  -n dev
kubectl patch serviceaccount default -n dev -p '{"imagePullSecrets":[{"name":"ghcr-secret"}]}'
```

Repita para `staging` e `prod`.

### 6. Disparar o deploy

- **Automaticamente:** crie uma tag `vX.Y.Z` no repositório (`git tag v0.1.0 && git push origin v0.1.0`).
- **Manualmente:** na aba **Actions → Release → Run workflow**.

Acompanhe a execução: `build-and-push` → `deploy-dev` → `deploy-staging` → `deploy-prod`. O último ficará aguardando sua **aprovação manual**.

### 7. Verificar os pods

```bash
kubectl get pods -n dev
kubectl rollout status deployment/nodejs -n dev
kubectl get pods -n staging
kubectl get pods -n prod
```

## Próximos passos (segurança de runtime)

Com o cluster de pé, o lab pode avançar para:

- **kube-bench** — auditoria de hardening (CIS benchmark).
- **kube-score / kubeaudit** — checagem dos manifests.
- **Trivy** — scanner de vulnerabilidades em imagens e IaC.
- **OPA / Gatekeeper** — políticas de admission control.
- **NetworkPolicy** — segmentação de tráfego.
