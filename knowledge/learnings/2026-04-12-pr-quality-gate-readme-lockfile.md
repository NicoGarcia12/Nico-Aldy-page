# Learning — PR quality gate docs/readme lockfile (2026-04-12)

## Qué se aplicó

1. README: se reemplazó `npm run jest` por comandos existentes y correctos según contexto:
   - `npm run test` para ejecución manual/local.
   - `npm run test:ci` para flujo de quality gate bloqueante.
2. `.opencode/package-lock.json`: se removió del repo por no formar parte del producto.
3. Se actualizó `.opencode/.gitignore` para ignorar `package-lock.json` y evitar reingreso accidental.
4. Playbook de quality gate: se explicitó que `typecheck` actual cubre app (`tsconfig.app.json`, código productivo de `src/`) y por qué se excluye spec/e2e en ese paso.

## Criterio reusable

- En documentación, referenciar siempre scripts reales de `package.json`.
- En quality gate, separar chequeos de app productiva vs. tipos/tooling de test/e2e para evitar ruido.
- Lockfiles de carpetas de tooling local (no producto) se versionan solo si hay necesidad explícita de reproducibilidad de ese tooling.
