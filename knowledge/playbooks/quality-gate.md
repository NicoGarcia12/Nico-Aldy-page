# Playbook - Quality Gate de Git

## Objetivo

Evitar subir cambios con problemas de formato, linting, tipado o tests rotos.

## Regla operativa

### Comando recomendado (single-entry)

1. `npm run validate:all`

Este comando encadena:

1. `format:check` (bloqueante)
2. `lint`
3. `typecheck`
4. `build`
5. `test:ci` (Jest)
6. `e2e:smoke` (Cypress)

### Fallback manual (si necesitás aislar una falla)

1. `npm run format:check`
2. `npm run lint`
3. `npm run typecheck`
4. `npm run build`
5. `npm run test:ci`
6. `npm run e2e:smoke`

## Criterio de bloqueo de CI

- `format:check`, `lint`, `typecheck`, `build` y `test:ci`: bloqueantes.
- `e2e:smoke`: bloqueante en el job dedicado de smoke.

## Nota de Angular 20 en este repo

- El typecheck recomendado es `npm run typecheck` con `tsc --noEmit -p tsconfig.app.json`.
- Evitar `tsc --noEmit` sobre `tsconfig.json` raíz para no mezclar tipos de app/spec/e2e.

## Alcance

- Esta regla aplica para este repo y para cualquier repo que tenga tooling equivalente (Prettier, linting y tests).
- Si un repo no trae uno de esos comandos, se ejecutan los disponibles y se documenta la limitación.
