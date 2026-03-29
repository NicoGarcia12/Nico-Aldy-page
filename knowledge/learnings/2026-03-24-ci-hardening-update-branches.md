# CI hardening post-migracion Angular 20

## Contexto

Se reforzo el workflow de CI para que cubra ramas de upgrade bajo `update/**` y para que el control de formato vuelva a ser bloqueante.

## Cambios aplicados

- En `.github/workflows/ci.yml` se ampliaron triggers:
  - `pull_request.branches`: `master`, `update/**`
  - `push.branches`: `master`, `upgrade/angular20`, `update/**`
- El step de formato dejo de ser informativo:
  - Se elimino `continue-on-error: true`
  - El paso quedo como `Format check` con `npm run format:check` bloqueante.
- Se mantuvo Node `22` en `quality` y `e2e-smoke`.

## Validacion local

- `npx prettier --check .github/workflows/ci.yml knowledge/upgrade/angular20-plan.md`
- Resultado: OK (sin desvio de formato).

## Resultado esperado

- Mejor cobertura de ramas de migracion/upgrade en CI.
- Menor riesgo de merge con inconsistencias de formato.
- Quality gate y smoke e2e preservados con orden de ejecucion coherente.

## Referencias oficiales

- GitHub Actions workflow syntax: https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions
- Filtros de ramas en eventos: https://docs.github.com/actions/using-workflows/events-that-trigger-workflows
- Prettier CLI (`--check`): https://prettier.io/docs/cli
