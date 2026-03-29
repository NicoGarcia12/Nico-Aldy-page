## Learning - CI post-upgrade a Angular 20

### Contexto

Se reviso el pipeline de CI para asegurar alineacion con el estado post-migracion a Angular 20, sin tocar el deploy productivo.

### Aplicado

- Verificacion de scripts actuales en `package.json`: `test:ci` y `e2e:smoke`.
- Actualizacion minima de runtime en CI: `node-version` de `20` a `22` en `.github/workflows/ci.yml`.
- Se mantuvo `ubuntu-latest` y la estructura de jobs existente.
- Se mantuvo `format check` como informativo (`continue-on-error: true`) para evitar friccion de estilo durante estabilizacion, manteniendo estrictos `lint`, `typecheck`, `build`, `unit` y `e2e smoke`.

### Por que

- Angular 20 se beneficia de runtimes Node LTS recientes.
- El ajuste minimiza riesgo: no cambia deploy, no cambia secretos, no cambia estrategia de pipeline.

### Referencias oficiales

- GitHub Actions - workflow syntax: https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions
- `actions/setup-node` (README): https://github.com/actions/setup-node
- `actions/setup-node` (advanced usage): https://github.com/actions/setup-node/blob/main/docs/advanced-usage.md
