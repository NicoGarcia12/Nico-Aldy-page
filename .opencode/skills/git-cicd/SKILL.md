---
name: git-cicd
description: "Skill para Git avanzado + CI/CD con GitHub Actions — branching, workflows, deploy pipelines, secrets."
version: 1.0.0
argument-hint: [workflow, branch strategy, pipeline o action a configurar]
allowed-tools: Read, Write, Bash, Glob, Grep
---

# Skill: Git + CI/CD con GitHub Actions

Skill para uso avanzado de Git y pipelines de CI/CD con GitHub Actions.

---

## Paso 0 — Verificar versiones

| Feature | Versión mínima | Estable desde |
|---------|---------------|---------------|
| `git switch` / `git restore` | Git 2.23 | 2.23 |
| `git maintenance` | Git 2.29 | 2.29 |
| Sparse checkout (cone mode) | Git 2.25 | 2.25 |
| GitHub Actions (YAML workflows) | N/A | 2019 |
| Composite actions | Actions v2 | 2021 |
| Reusable workflows | Actions v2 | 2021 |
| `GITHUB_OUTPUT` (nueva sintaxis) | 2022-10 | 2022 |
| `actions/checkout@v4` | 2023 | 2023 |
| `actions/setup-node@v4` | 2023 | 2023 |

**Verificar `git --version` y el runner de GitHub Actions (`ubuntu-latest`, `windows-latest`).**

**Política de runtimes/workflows:** usar versiones LTS `N` y `N-1` como baseline estable. Validar versiones nuevas con matrix antes de promoverlas como default.

---

## Parte 1 — Git branching strategy

### Git Flow simplificado (opcional)

```
main          ←── rama de producción (siempre deployable)
  └── develop ←── rama de integración
       ├── feature/user-login    ←── nueva funcionalidad
       ├── feature/post-crud
       ├── bugfix/fix-login-error ←── corrección de bug
       └── hotfix/security-patch  ←── fix urgente (sale de main)
```

### Convenciones de ramas

| Tipo | Patrón | Sale de | Se mergea a |
|------|--------|---------|-------------|
| Feature | `feature/descripcion-corta` | `develop` | `develop` |
| Bugfix | `bugfix/descripcion-corta` | `develop` | `develop` |
| Hotfix | `hotfix/descripcion-corta` | `main` | `main` + `develop` |
| Release | `release/v1.2.0` | `develop` | `main` + `develop` |

### Alternativa: Trunk-Based (sin `develop`)

Para equipos que prefieren ciclos cortos, se puede usar trunk-based:
- `main` protegida como trunk
- ramas cortas `feature/*` saliendo de `main`
- merge vía PR chico + checks obligatorios
- uso de feature flags para cambios grandes

### Comandos Git frecuentes

```bash
# Crear y cambiar a nueva rama
git switch -c feature/user-login

# Cambiar de rama
git switch develop

# Stash (guardar cambios temporalmente)
git stash push -m "WIP: login form"
git stash list
git stash pop

# Rebase interactivo (paso manual del usuario; no automatizar por defecto)
git rebase -i HEAD~3

# Squash merge (un solo commit por feature en develop)
git merge --squash feature/user-login

# Cherry-pick (traer un commit específico)
git cherry-pick abc1234

# Ver historial gráfico
git log --oneline --graph --all

# Deshacer último commit (solo local y no pusheado)
git reset --soft HEAD~1

# Si ya fue pusheado, alternativa segura
git revert <commit_sha>

# Descartar cambios en un archivo
git restore archivo.ts

# Ver diferencias
git diff develop..feature/user-login
```

---

## Parte 2 — Conventional Commits

```
<tipo>[scope opcional]: <descripción>

[cuerpo opcional]

[footer(s) opcional(es)]
```

### Tipos de commit

| Tipo | Uso | Ejemplo |
|------|-----|---------|
| `feat` | Nueva funcionalidad | `feat(auth): add JWT login endpoint` |
| `fix` | Corrección de bug | `fix(users): handle duplicate email error` |
| `docs` | Documentación | `docs: update API README` |
| `style` | Formateo (no lógica) | `style: fix indentation in UserService` |
| `refactor` | Refactoring (no fix/feat) | `refactor(db): extract query builder` |
| `test` | Tests | `test(auth): add login integration tests` |
| `chore` | Mantenimiento | `chore: update dependencies` |
| `ci` | CI/CD | `ci: add deploy workflow` |
| `perf` | Performance | `perf(api): cache user queries` |

### Breaking changes

```
feat(api)!: change auth endpoint response format

BREAKING CHANGE: The /api/auth/login response now returns
{ token, user } instead of just the token string.
```

---

## Parte 3 — GitHub Actions: Workflow básico

```yaml
# .github/workflows/ci.yml
name: CI

# Triggers: cuándo se ejecuta
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

# Permisos por defecto mínimos (elevar por job solo si hace falta)
permissions:
  contents: read

jobs:
  # Job: lint y type check
  lint:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'             # Cache de node_modules

      - run: npm ci                # Instalar dependencias

      - run: npm run lint          # ESLint

      - run: npx tsc --noEmit     # Type check

  # Job: tests (corre en paralelo con lint)
  test:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci

      - run: npm test -- --coverage

      # Subir reporte de cobertura como artefacto
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: coverage-report
          path: coverage/

  # Job: build (depende de lint y test)
  build:
    needs: [lint, test]            # Solo corre si lint y test pasan
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci
      - run: npm run build

      - uses: actions/upload-artifact@v4
        with:
          name: build-output
          path: dist/
```

---

## Parte 4 — GitHub Actions: Deploy

### Deploy a Vercel (ejemplo, verificar vigencia al momento)

> Nota: la plataforma/acción de deploy no es fija permanente. Confirmar en cada implementación si sigue vigente la acción recomendada, versión y método de autenticación.

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci
      - run: npm run build

      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Deploy con Docker

```yaml
# .github/workflows/docker-deploy.yml
name: Build & Push Docker

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  docker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: docker/setup-buildx-action@v3

      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            ghcr.io/${{ github.repository }}:latest
            ghcr.io/${{ github.repository }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

---

## Parte 5 — GitHub Actions: Matrix y servicios

```yaml
# Tests en múltiples versiones de Node.js
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [20, 22]         # Política LTS N/N-1
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm ci
      - run: npm test

  # Tests con servicio de DB
  integration:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: testdb
        ports:
          - 3306:3306
        options: >-
          --health-cmd "mysqladmin ping -h localhost"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run test:integration
        env:
          DATABASE_URL: mysql://root:root@localhost:3306/testdb
```

---

## Parte 6 — Secrets y variables

```yaml
# Acceder a secrets configurados en GitHub repo settings
env:
  API_KEY: ${{ secrets.API_KEY }}
  NODE_ENV: production

# Variables de entorno del workflow
  GITHUB_SHA: ${{ github.sha }}
  BRANCH: ${{ github.ref_name }}
  PR_NUMBER: ${{ github.event.pull_request.number }}

# Outputs entre steps
steps:
  - id: get-version
    run: echo "version=$(node -p 'require(\"./package.json\").version')" >> "$GITHUB_OUTPUT"

  - run: echo "Version is ${{ steps.get-version.outputs.version }}"
```

## Hardening recomendado (repos críticos)

- Definir `permissions` mínimos por job (evitar permisos globales amplios).
- Evitar imprimir secrets en logs y no pasarlos como argumentos visibles en CLI.
- Usar environments con approvals para deploy a producción.
- Preferir pinning de actions por SHA (`uses: owner/action@<sha>`) en repos críticos.

---

## Parte 7 — Pre-push gate y documentación

Antes de cualquier `git push`, el agente debe:

1. Preguntar si querés correr el quality gate local (lint/test/build o equivalente del repo).
2. Si aceptás, correrlo y reportar resultado resumido.
3. Si rechazás, continuar con warning breve de riesgo y dejar trazabilidad en el handoff.
4. Verificar documentación mínima para sync:
   - resumen diario completo (`knowledge/daily/YYYY-MM-DD.md`)
   - documentación reusable/general actualizada cuando aplique (runbook, ADR, guía o changelog)

---

## Parte 8 — Handoff para pasos manuales/interactivos

Cuando haya pasos no automatizables/interactivos (por ejemplo `git rebase -i`, resolución manual de conflictos, approvals en UI):

- **Qué hace el agente**: prepara contexto, comandos exactos, riesgos, fallback seguro y criterio de éxito.
- **Qué hace el usuario**: ejecuta el paso manual/interactivo y confirma resultado.
- **Salida que debe devolver el usuario para continuar**:
  - comando ejecutado
  - resultado breve (`ok` o error)
  - si hubo conflictos, archivos afectados y estado final de `git status`

Formato sugerido de respuesta del usuario:

```text
HANDOFF-RESULT:
- step: git rebase -i HEAD~3
- status: ok
- notes: squashed 3 commits into 1
- git-status: clean
```

---

## Reglas obligatorias

1. **Conventional Commits** siempre. Mensajes descriptivos.
2. **No usar `git rebase -i` como flujo automatizable**: siempre handoff manual explícito.
3. **Comandos de reescritura (`reset`, etc.) solo en contexto seguro** (local/no pusheado); si ya está remoto, preferir `revert`.
4. **Nunca push directo a `main`/`master`** y **nunca force push** sobre ramas protegidas.
5. **Branch protection operativo**: required checks + required reviews antes de mergear.
6. **CI debe pasar** antes de mergear un PR.
7. **Pre-push gate**: preguntar si querés correr quality gate; si no se corre, avanzar con warning breve.
8. **Pre-push documental**: daily completo + documentación reusable/general al día para sync.
9. **Secrets en GitHub Secrets**. Nunca en código ni en archivos del repo.
10. **Hardening de Actions**: permisos mínimos por job y pinning por SHA en repos críticos.
11. **Cache de dependencias** (`cache: 'npm'`) para acelerar CI.
12. **`npm ci`** en CI (no `npm install`). Instalación determinística.
13. **Artefactos para builds y reportes** (`actions/upload-artifact`).
14. **Rebase o squash antes de mergear** para historial limpio.
15. **Tags semánticos** para releases (`v1.0.0`, `v1.1.0`).
16. **Deploy actions/plataformas se validan al momento** (no asumir proveedor/acción fija).
17. **Branch strategy flexible**: GitFlow simplificado o trunk-based según contexto, sin forzar `develop`.

## Checklist

- [ ] Branching strategy definida y documentada
- [ ] Conventional Commits configurados (commitlint opcional)
- [ ] Workflow de CI (lint + test + build)
- [ ] Workflow de deploy (si aplica)
- [ ] Secrets configurados en GitHub Settings
- [ ] Branch protection rules en main/develop
- [ ] Cache de dependencias en workflows
- [ ] Historial limpio (squash/rebase)
- [ ] Política LTS N/N-1 aplicada en runtime/workflows
- [ ] Quality gate pre-push decidido (corrido o rechazado con warning)
- [ ] Daily completo + doc reusable/general para sync
- [ ] Handoff explícito para pasos manuales/interactivos
