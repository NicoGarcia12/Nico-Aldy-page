# Post-upgrade QA - Angular 20

Fecha de consolidacion: 2026-03-24

## Alcance

- Consolidacion de evidencia de QA luego del upgrade a Angular 20.
- Fuente: resultados documentados en la migracion y notas de CI del 2026-03-24.
- Este documento no redefine baseline pre-migracion; solo resume estado post-upgrade.

## Estado final de cierre

- **Angular 20 real validado**:
  - Framework en `^20.3.18` (`@angular/core`, `@angular/common`, `@angular/router`, etc.) en `package.json`.
  - Tooling de build/CLI en `20.3.x` (`@angular/cli` `^20.3.21`, `@angular-devkit/build-angular` `^20.3.21`).
  - TypeScript alineado a `~5.9.3` (dentro de rango requerido por Angular 20).
- **CI hardening aplicado**:
  - Workflow `CI` actualizado para cubrir `update/**` en `push` y `pull_request`.
  - `format:check` paso a bloqueante (sin `continue-on-error`).
  - Se mantiene gate secuencial: `quality` (format/lint/typecheck/build/unit) -> `e2e-smoke`.
- **Mejoras de tests unitarios agregadas**:
  - Se reforzaron specs de auth y paginas criticas de migracion (`auth.guard`, `auth.service`, `login-page`, `dashboard-page`).
  - Cobertura funcional ampliada para redirecciones de guards, persistencia de sesion, render condicional y flujos de login/logout.

## Resultados post-upgrade

| Check     | Comando             | Resultado | Evidencia / nota                                                                     |
| --------- | ------------------- | --------- | ------------------------------------------------------------------------------------ |
| Lint      | `npm run lint`      | ✅ OK     | Validado en corrida post-upgrade y mantenido como paso bloqueante del job `quality`. |
| Typecheck | `npx tsc --noEmit`  | ✅ OK     | Consolidado en gate bloqueante de CI (`quality`).                                    |
| Build     | `npm run build`     | ✅ OK     | Consolidado en gate bloqueante de CI (`quality`).                                    |
| Unit      | `npm run test:ci`   | ✅ OK     | Corrida estable y reforzada con nuevos casos en auth/login/dashboard.                |
| E2E smoke | `npm run e2e:smoke` | ✅ OK     | Job dedicado `e2e-smoke` dependiente de `quality`.                                   |

## Cierre de mejoras (bloqueantes y no bloqueantes)

### Bloqueantes cerrados

- Compatibilidad real de Angular 20 + TypeScript cerrada en codigo y tooling.
- Gate de CI endurecido para ramas de upgrade (`update/**`) y formato bloqueante.
- Validaciones de `typecheck` y `build` integradas como requisito de merge en `quality`.

### No bloqueantes cerrados

- Refactor de templates/control flow y suscripcion de router alineado con APIs actuales de Angular.
- Fortalecimiento de tests unitarios en rutas y componentes criticos de autenticacion.

## Resumen

- Upgrade Angular 20 cerrado con version real validada en dependencias y tooling.
- Quality gate post-upgrade consolidado como bloqueante en CI.
- Mejoras de cobertura unitaria incorporadas para reducir riesgo de regresiones.
