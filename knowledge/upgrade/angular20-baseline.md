# Baseline pre-migracion Angular 20

Fecha de ejecucion: 2026-03-22T16:39:52-03:00

## Estado de repositorio

- Rama: `master`
- Tracking: `origin/master`
- Estado: `ahead 1`, sin cambios locales al iniciar preflight

Comando:

```bash
git status --short --branch
```

Salida relevante:

```text
## master...origin/master [ahead 1]
```

## Stack detectado

Comandos:

```bash
node -v
npm -v
npx ng version
npx tsc --version
```

Resultado:

- Node: `v22.18.0`
- npm: `10.9.3`
- Angular CLI: `19.2.22`
- Angular framework: `19.2.20`
- TypeScript: `5.7.3`
- RxJS: `7.8.2`
- zone.js: `0.15.1`

## Quality gate actual

| Comando                                                   | Resultado | Nota                                               |
| --------------------------------------------------------- | --------- | -------------------------------------------------- |
| `npm run format:check`                                    | OK        | Prettier en verde                                  |
| `npm run lint`                                            | OK        | Sin errores reportados                             |
| `npx tsc --noEmit`                                        | OK        | Type-check estricto sin errores                    |
| `npm run build`                                           | OK        | Build produccion generado en `dist/nico-aldy-page` |
| `npm run test -- --watch=false --browsers=ChromeHeadless` | OK        | 4 tests, 4 success                                 |
| `npm run e2e`                                             | ERROR     | Cypress no pudo validar `http://localhost:4200`    |

Detalle del error e2e:

```text
Cypress could not verify that this server is running:
  > http://localhost:4200
Please start this server and then run Cypress again.
```

## Observaciones

- El baseline no cambia codigo de app ni dependencias.
- El unico desvio actual es e2e por falta de server levantado durante `cypress run`.
- No existe script dedicado de `e2e:smoke` en `package.json`; se ejecuto `npm run e2e`.
- Preflight listo para pasar a fase de preparacion de tooling de Angular 20.
