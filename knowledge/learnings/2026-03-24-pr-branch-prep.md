# Learning — Preparación de rama para PR (Git)

Fecha: 2026-03-24

## Qué se hizo

Se ejecutó la preparación de rama para PR con estos pasos:

1. `git switch master`
2. `git switch -c update/angular20-migration` (con fallback a `git switch update/angular20-migration` si la rama ya existía)
3. `git push -u origin update/angular20-migration`

## Resultado

- Se confirmó que `master` estaba activa al iniciar.
- La rama `update/angular20-migration` se creó correctamente (no hizo falta fallback en esta ejecución).
- Se publicó en remoto y quedó tracking configurado con `origin/update/angular20-migration`.

## Verificación final

- Rama actual: `update/angular20-migration`
- Tracking remoto: `origin/update/angular20-migration`

## Nota práctica

Este patrón (`switch -c` + fallback + `push -u`) evita errores cuando una rama ya existe y deja el upstream listo para futuros `git push`/`git pull` sin parámetros.
