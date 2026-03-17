# Playbook - Quality Gate de Git

## Objetivo

Evitar subir cambios con problemas de formato, linting, tipado o tests rotos.

## Regla operativa

### Antes de cada commit

1. `npm run format:check`
2. `npm run lint`

### Antes de cada push

1. `npm run test -- --watch=false --browsers=ChromeHeadless`
2. `npm run e2e`

## Alcance

- Esta regla aplica para este repo y para cualquier repo que tenga tooling equivalente (Prettier, linting y tests).
- Si un repo no trae uno de esos comandos, se ejecutan los disponibles y se documenta la limitacion.
