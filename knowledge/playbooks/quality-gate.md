# Playbook - Quality Gate de Git

## Objetivo

Evitar subir cambios con problemas de formato, linting, tipado o tests rotos.

## Regla operativa

### Antes de cada commit

1. `npm run format:check`
2. `npm run lint`
3. `npm run typecheck`

### Antes de cada push

1. `npm run build`
2. `npm run test:ci`
3. `npm run e2e` (si aplica para el cambio)

## Criterio de bloqueo de CI

- `lint`, `typecheck`, `build` y `test:ci`: bloqueantes.
- `format:check`: hoy informativo (no bloqueante). Si el equipo decide bloquear formato, quitar `continue-on-error` del workflow.

## Nota de Angular 20 en este repo

- El typecheck recomendado es `npm run typecheck` (`tsc --noEmit -p tsconfig.app.json`).
- Evitar `tsc --noEmit` sobre `tsconfig.json` raiz para no mezclar tipos de app/spec/e2e.

## Alcance

- Esta regla aplica para este repo y para cualquier repo que tenga tooling equivalente (Prettier, linting y tests).
- Si un repo no trae uno de esos comandos, se ejecutan los disponibles y se documenta la limitacion.
