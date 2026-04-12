# Learning - 2026-04-11 - Angular 20 quality gate y scope de typecheck

## Contexto

Durante el cierre de quality gate post-migracion Angular 20, el comando de CI para typecheck (`npx tsc --noEmit`) fallo aunque build/lint/tests estaban bien.

## Sintoma

Errores en specs:

- `Property 'toBeTruthy' does not exist on type 'Assertion'`
- `Property 'toBeNull' does not exist on type 'Assertion'`

## Causa raiz

`tsc --noEmit` sobre `tsconfig.json` raiz mezcla contextos de tipos (app/spec/e2e) y puede generar conflictos globales entre ecosistemas de testing (por ejemplo Jasmine vs Chai/Cypress).

## Decision aplicada (fix minimo)

- Se agrego script dedicado de typecheck para app:
  - `npm run typecheck` -> `tsc --noEmit -p tsconfig.app.json`
- Se alineo CI para usar ese script en el job `quality`.

## Resultado

- Typecheck app: OK
- Build: OK
- Lint: OK
- Unit tests (`test:ci`): OK
- Format check: OK

## Nota operativa

En este repo, el formato sigue como **informativo** en CI (`continue-on-error: true`). Si se decide hacerlo bloqueante, cambiar ese flag y comunicarlo al equipo para evitar friccion en PRs.
