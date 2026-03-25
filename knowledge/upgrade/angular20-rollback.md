# Checklist de rollback - Migracion Angular 20

## Objetivo

Volver rapido a un estado estable si alguna fase de la migracion genera regresiones o bloquea el delivery.

## Disparadores de rollback

- Build de produccion roto sin fix inmediato.
- Falla de tests criticos (unitarios o e2e) sin workaround seguro.
- Incompatibilidad de tooling que impida desarrollo normal.
- Regresion funcional en flujos principales (login, dashboard, navegacion).

## Preparacion previa (obligatoria)

- [ ] Confirmar baseline en `knowledge/upgrade/angular20-baseline.md`.
- [ ] Ejecutar migracion en rama dedicada.
- [ ] Guardar snapshot de lockfile antes de cada lote de upgrade.
- [ ] Registrar cada comando ejecutado y su resultado.

## Rollback rapido por git (recomendado)

- [ ] Identificar commit sano previo a la fase fallida.
- [ ] Revertir commits de migracion (sin reescribir historia compartida).
- [ ] Instalar dependencias nuevamente y validar.

Comandos sugeridos:

```bash
git log --oneline
git revert <sha_migracion_mas_reciente>
npm ci
npm run build
npm run test -- --watch=false --browsers=ChromeHeadless
```

## Rollback por dependencias (si no hubo commit aun)

- [ ] Restaurar `package.json` y `package-lock.json` al snapshot previo.
- [ ] Limpiar instalacion local y reinstalar.
- [ ] Revalidar quality gate base.

Comandos sugeridos:

```bash
git restore package.json package-lock.json
npm ci
npm run lint
npm run build
npm run test -- --watch=false --browsers=ChromeHeadless
```

## Verificacion post-rollback

- [ ] `npx ng version` vuelve a stack base esperado.
- [ ] Build y unit tests vuelven al estado baseline.
- [ ] E2E ejecuta al menos smoke en entorno local controlado.
- [ ] Se documenta causa raiz de fallo y plan de reintento.

## Criterio de cierre

- Repo funcional en el mismo nivel de calidad del baseline.
- Incidente documentado con accion correctiva para nuevo intento.
