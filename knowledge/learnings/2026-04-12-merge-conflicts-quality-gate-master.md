# 2026-04-12 - Resolucion de conflictos contra origin/master (quality gate)

## Contexto

Se resolvieron conflictos de merge en CI, Cypress, ESLint, docs y scripts entre:

- Rama: `chore/quality-gate-ci-docs-2026-04-11`
- Base: `origin/master`

## Decisiones clave

1. **CI**: se mantuvieron triggers actuales de `master` y `format:check` como bloqueante.
2. **Typecheck**: se consolidó en `npm run typecheck` con `tsc --noEmit -p tsconfig.app.json` para evitar mezclar tipos de app/spec/e2e.
3. **Cypress**: se priorizó la spec de `master` por mayor estabilidad (estado limpio y asserts menos flaky).
4. **Script smoke legacy**: se eliminó `scripts/run-e2e-smoke.mjs` (master ya usa `concurrently + wait-on`).
5. **Docs**: merge semántico en playbook e índice de learnings, conservando contenido nuevo y cambios recientes.

## Validacion

Quality gate ejecutado y en verde:

1. `npm run format:check`
2. `npm run lint`
3. `npm run typecheck`
4. `npm run build`
5. `npm run test:ci`

## Leccion reusable

En merges de ramas de hardening de CI, conviene resolver con criterio mixto:

- conservar mejoras funcionales del quality gate,
- respetar scripts vigentes de master,
- y alinear documentacion para evitar drift entre pipeline y playbooks.
