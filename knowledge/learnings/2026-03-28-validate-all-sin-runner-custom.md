## Learning - `validate:all` + smoke E2E sin script custom

### Contexto

Se unifico toda la validacion del repo en un solo comando y se elimino la dependencia del archivo `scripts/run-e2e-smoke.mjs`.

### Aplicado

- Se elimino `scripts/run-e2e-smoke.mjs`.
- Se elimino el shim `cypress/e2e/login-flow.cy.js` y Cypress quedo apuntando a specs `*.cy.ts`.
- Se agregaron scripts npm:
  - `typecheck`: `tsc --noEmit`
  - `cypress:run:smoke`: ejecuta solo `login-flow.cy.ts`
  - `start:ci`: levanta Angular en `127.0.0.1:4200`
  - `e2e:smoke`: orquestado con `concurrently` + `wait-on` (cross-platform)
  - `validate:all`: cadena unica `format:check -> lint -> typecheck -> build -> test:ci -> e2e:smoke`
- Se agregaron dependencias minimas: `concurrently` y `wait-on`.

### Por que

- Un comando unico reduce friccion operativa y evita ejecuciones parciales.
- Se evita mantener logica duplicada en archivos auxiliares para smoke E2E.
- Se reemplazo `start-server-and-test` en este flujo puntual porque en Windows puede depender de `wmic.exe` y romper en entornos donde no existe.

### Resultado

- `npm run validate:all`: **PASS**
  - `format:check` ✅
  - `lint` ✅
  - `typecheck` ✅
  - `build` ✅
  - `test:ci` (Jest) ✅
  - `e2e:smoke` (Cypress) ✅

### Referencias oficiales

- npm scripts: https://docs.npmjs.com/cli/v10/using-npm/scripts
- concurrently: https://github.com/open-cli-tools/concurrently
- wait-on: https://github.com/jeffbski/wait-on
- Cypress CLI (`cypress run --spec`): https://docs.cypress.io/guides/guides/command-line
