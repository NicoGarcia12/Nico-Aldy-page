# Plan de ejecucion - Migracion a Angular 20

> Implementación ejecutada por agente (OpenCode) con validación del usuario.

## Objetivo

Ejecutar la migracion a Angular 20 de forma incremental, con validaciones por fase y sin romper la app en produccion.

## Alcance y restricciones

- No mezclar migracion de framework con cambios funcionales de producto.
- No tocar pipeline de deploy hasta cerrar fase de estabilizacion.
- Ejecutar quality gate completo en cada fase antes de avanzar.
- Si una fase no cumple criterios de salida, no avanzar a la siguiente.

## Fase 1 - Preflight y baseline

- [x] Relevar version actual de Angular, CLI, TypeScript, Node y npm.
- [x] Confirmar estado de rama y worktree.
- [x] Ejecutar baseline de calidad (format/lint/build/test/e2e).
- [x] Documentar resultados en `knowledge/upgrade/angular20-baseline.md`.
- [x] Definir version Node recomendada en `.nvmrc`.

Comandos de validacion:

```bash
git status --short --branch
node -v
npm -v
npx ng version
npx tsc --version
npm run format:check
npm run lint
npm run build
npm run test -- --watch=false --browsers=ChromeHeadless
npm run e2e
```

Criterio de salida:

- Baseline documentado con estado real (incluyendo errores conocidos).

## Fase 2 - Preparacion de tooling

- [ ] Verificar compatibilidad de Node, npm y TypeScript con Angular 20.
- [ ] Revisar breaking changes de Angular 20 y Angular CLI 20.
- [ ] Confirmar que Cypress/Karma/ESLint tengan versiones compatibles.
- [ ] Definir estrategia de migracion por lotes (core + tooling).

Comandos de validacion:

```bash
npx ng update
npm outdated
```

Criterio de salida:

- Lista final de paquetes a actualizar y riesgos identificados.

## Fase 3 - Upgrade controlado de Angular

- [ ] Actualizar `@angular/*` y `@angular/cli` a v20 con `ng update`.
- [ ] Ejecutar migraciones automaticas de Angular/CLI.
- [ ] Revisar cambios en `angular.json`, `tsconfig*` y builders.
- [ ] Confirmar build local sin warnings criticos nuevos.

Comandos de validacion:

```bash
npx ng update @angular/core@20 @angular/cli@20
npm run lint
npm run build
npm run test -- --watch=false --browsers=ChromeHeadless
```

Criterio de salida:

- App compila y tests unitarios pasan en Angular 20.

## Fase 4 - Upgrade de ecosistema

- [ ] Alinear TypeScript segun requisito de Angular 20.
- [ ] Actualizar `@angular-eslint/*` y reglas de lint.
- [ ] Validar Cypress y tooling de e2e.
- [ ] Resolver deprecations y warnings de runtime/build.

Comandos de validacion:

```bash
npx tsc --noEmit
npm run lint
npm run build
npm run e2e
```

Criterio de salida:

- Quality gate verde o desvio documentado con plan de cierre.

## Fase 5 - Estabilizacion

- [ ] Refactor minimo para compatibilidad (sin cambios funcionales).
- [ ] Ejecutar smoke manual de rutas criticas (login, dashboard, 404).
- [ ] Verificar build para GitHub Pages (`build:gh-pages`).

Comandos de validacion:

```bash
npm run build:gh-pages
npm run test -- --watch=false --browsers=ChromeHeadless
npm run e2e
```

Criterio de salida:

- Build de produccion estable y recorridos criticos validados.

## Fase 6 - Cierre

- [ ] Documentar cambios y decisiones tecnicas finales.
- [ ] Actualizar playbooks operativos si cambia algun comando.
- [ ] Preparar PR final de migracion con evidencias.

Comandos de validacion:

```bash
git diff --stat
git status --short --branch
```

Criterio de salida:

- PR listo con evidencia tecnica de baseline, migracion y validaciones.

## CI post-upgrade

- Se valido que el workflow `.github/workflows/ci.yml` ya ejecuta el quality gate requerido: `format:check`, `lint`, `typecheck` (`npx tsc --noEmit`), `build`, `test:ci` y `e2e:smoke`.
- Se ajusto Node del runner de CI de `20` a `22` en los jobs `quality` y `e2e-smoke` para alinear el pipeline con el estado post-migracion a Angular 20 y politica LTS N/N-1.
- Se mantuvo `ubuntu-latest` sin cambios.
- Se mantuvo `Format check (informativo)` con `continue-on-error: true` para no bloquear PRs por estilo durante la estabilizacion de la migracion. Esta decision prioriza señales de calidad funcional (lint/typecheck/build/tests) sobre formato.
- No se modifico deploy productivo (`deploy-gh-pages.yml`) porque no hay bloqueo grave ni dependencia directa de este ajuste.
