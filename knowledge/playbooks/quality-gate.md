# Playbook - Quality Gate de Git

## Objetivo

Evitar subir cambios con problemas de formato, linting, tipado o tests rotos.

## Regla operativa

### Comando recomendado (single-entry)

1. `npm run validate:all`

Este comando encadena:

1. `format:check`
2. `lint`
3. `typecheck` (`tsc --noEmit`)
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

## Alcance

- Esta regla aplica para este repo y para cualquier repo que tenga tooling equivalente (Prettier, linting y tests).
- Si un repo no trae uno de esos comandos, se ejecutan los disponibles y se documenta la limitacion.
