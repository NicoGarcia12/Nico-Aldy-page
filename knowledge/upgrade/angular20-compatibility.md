# Auditoria de compatibilidad Angular 20 (Paso 2)

> Implementación ejecutada por agente (OpenCode) con validación del usuario.

Fecha de ejecucion: 2026-03-22

## Alcance

- Auditoria de compatibilidad para migrar de Angular 19.2.x a Angular 20.
- Se ejecutaron prechequeos y comandos de revision con `ng update`.
- No se aplicaron cambios persistentes en `package.json` ni `package-lock.json`.

## Fuentes usadas

- Matriz oficial de Angular: `https://angular.dev/reference/versions`
- Metadata npm de paquetes relevantes (`npm view`)
- Salida local de `npx ng version`, `npx ng update --verbose`, `npm outdated`

## Estado actual y objetivo

| Paquete                                | Version actual                | Version objetivo (Angular 20)              | Riesgo | Accion recomendada                                                                           |
| -------------------------------------- | ----------------------------- | ------------------------------------------ | ------ | -------------------------------------------------------------------------------------------- |
| `@angular/core` (y framework packages) | `19.2.20`                     | `20.3.x`                                   | Alto   | Upgrade con `ng update @angular/core@20 @angular/cli@20` para aplicar migraciones oficiales. |
| `@angular/cli`                         | `19.2.22`                     | `20.3.x`                                   | Alto   | Subir junto con `@angular/core` en el mismo commit de framework.                             |
| `@angular-devkit/build-angular`        | `19.2.22`                     | `20.3.x`                                   | Alto   | Se actualiza en el flujo de `ng update`; verificar builder y `angular.json` post-migracion.  |
| `typescript`                           | `~5.7.2` (instalado `5.7.3`)  | `>=5.8 <6` (ideal `~5.9.x`)                | Alto   | Subir TypeScript en el mismo upgrade de Angular (el updater propone `5.9.3`).                |
| `@angular-eslint/*`                    | `19.8.1`                      | `20.x` (actual disponible `20.7.0`)        | Medio  | Alinear major tras subir Angular para evitar drift de tooling.                               |
| `eslint`                               | `9.22.0` (instalado `9.39.4`) | `9.x` (opcional `10.x` mas adelante)       | Bajo   | Mantener en 9.x durante migracion; evaluar 10.x en fase posterior.                           |
| `karma`                                | `~6.4.0`                      | `^6.3.0` o superior compatible             | Bajo   | Compatible con Angular 20 (`build-angular@20` pide `^6.3.0`); no bloquea.                    |
| `jasmine-core`                         | `~5.6.0`                      | `5.x`                                      | Bajo   | No bloquea; opcional subir a ultimo 5.x para mantenimiento.                                  |
| `@types/jasmine`                       | `~5.1.0`                      | `5.x` (o `6.x` si test stack lo permite)   | Bajo   | Mantener en primera pasada; revisar con tests despues del upgrade.                           |
| `cypress`                              | `^13.17.0`                    | `13.x` (compatible) / evaluar `15.x` luego | Medio  | No bloquea Angular 20; planificar upgrade separado por posibles breaking changes de Cypress. |

## Prechequeo y dry-run ejecutados

### 1) Inventario local

```bash
node -v
npx ng version
```

Hallazgos:

- Node actual: `22.18.0`.
- Angular actual: `19.2.20`.
- CLI actual: `19.2.22`.
- TypeScript actual: `5.7.3`.

Compatibilidad objetivo Angular 20 (oficial):

- Angular `20.2.x/20.3.x` requiere Node `^20.19.0 || ^22.12.0 || ^24.0.0`.
- Angular `20.2.x/20.3.x` requiere TypeScript `>=5.8.0 <6.0.0`.
- RxJS soportado: `^6.5.3 || ^7.4.0`.

Conclusiones:

- Node `22.18.0` es compatible.
- `rxjs 7.8.x` es compatible.
- TypeScript `5.7.x` queda por debajo del minimo y es blocker tecnico.

### 2) Revision general de update

```bash
npx ng update --verbose
```

Salida relevante:

- `@angular/cli 19.2.22 -> 20.3.9`
- `@angular/core 19.2.20 -> 20.3.9`

### 3) Simulacion de update con flags de revision

```bash
npx ng update @angular/core@20 @angular/cli@20 --allow-dirty --verbose --force
```

Hallazgos del dry-run controlado:

- El updater propone saltar a:
  - `@angular/cli` y `@angular-devkit/build-angular`: `20.3.21`
  - `@angular/core` y resto de framework: `20.3.18`
  - `typescript`: `5.9.3`
- Migraciones detectadas de `@angular/cli`:
  - Update de defaults de workspace (modifica `angular.json`).
  - Migracion de `provideServerRendering` (sin cambios en este repo).
  - Ajuste de `moduleResolution` a `bundler` (sin cambios en este repo).
  - Limpieza de `karma.conf` default (sin cambios en este repo).
- Migraciones detectadas de `@angular/core`:
  - `DOCUMENT` import move (`@angular/common` -> `@angular/core`) sin cambios.
  - Reemplazos de APIs deprecated (`InjectFlags`, `TestBed.get`) sin cambios.
  - SSR `BootstrapContext` sin cambios.
- Migraciones opcionales ofrecidas:
  - `use-application-builder`
  - `control-flow-migration`
  - `router-current-navigation`

## Hallazgos criticos

- **Blocker tecnico confirmado**: TypeScript actual (`5.7.x`) no cumple requisito minimo de Angular 20 (`>=5.8`).
- **Riesgo operativo**: `ng update` sobre worktree sucio mezcla cambios de migracion con cambios locales (`--allow-dirty` solo evita el bloqueo).
- **Riesgo de consistencia de tooling**: `@angular-eslint` queda una major atras (19.x) y conviene alinear a 20.x despues del upgrade core.

## Orden propuesto de upgrades (commits atomicos)

1. `chore(angular): update core and cli to v20 with official migrations`
   - Ejecutar `ng update @angular/core@20 @angular/cli@20`.
   - Incluir cambios de `package.json`, `package-lock.json`, `angular.json`, `tsconfig*` y migraciones automaticas.

2. `chore(lint): align angular-eslint packages to v20`
   - Subir `@angular-eslint/eslint-plugin`, `@angular-eslint/eslint-plugin-template`, `@angular-eslint/template-parser` a 20.x.
   - Ajustar config solo si aparecen warnings/errores nuevos.

3. `chore(test): stabilize karma-jasmine tooling after angular20`
   - Mantener o subir menor/patch de `karma`, `jasmine-core`, `@types/jasmine` segun resultado de tests.

4. `chore(e2e): evaluate cypress major upgrade separately`
   - Mantener `13.x` para no mezclar riesgos con el salto de framework.
   - Abrir commit/PR separado si se decide pasar a `15.x`.

## Comandos exactos recomendados para Paso 3 (upgrade real)

Ejecutar con worktree limpio:

```bash
git status --short
```

Upgrade principal Angular 20:

```bash
npx ng update @angular/core@20 @angular/cli@20
```

Si el repo no puede limpiarse en ese momento (solo como ultimo recurso):

```bash
npx ng update @angular/core@20 @angular/cli@20 --allow-dirty
```

Validaciones inmediatas post-upgrade:

```bash
npx tsc --noEmit
npm run format:check
npm run lint
npm run test -- --watch=false --browsers=ChromeHeadless
npm run build
```

Upgrade de angular-eslint en commit separado:

```bash
npm i -D @angular-eslint/eslint-plugin@^20 @angular-eslint/eslint-plugin-template@^20 @angular-eslint/template-parser@^20
npm run lint
```
