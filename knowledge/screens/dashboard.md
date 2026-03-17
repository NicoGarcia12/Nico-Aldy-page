# Carta (`/carta`)

## Proposito

Pantalla principal luego del formulario exitoso. Muestra una carta romantica y controles de musica.

## Flujo

1. Solo se accede si hay sesion valida (`authGuard`).
2. Muestra una carta con contenido principal y firma destacada.
3. Permite pausar/reanudar musica desde la misma vista.
4. El boton `Salir` limpia `localStorage` y redirige a `/formulario`.

## Estado y validaciones

- No tiene formulario.
- Depende de sesion local.
- Si no hay sesion, el guard redirige a formulario con notificacion.

## Dependencias

- `src/app/core/auth/auth.service.ts`
- `src/app/core/auth/auth.guard.ts` (`authGuard`)
- `src/app/core/media/music-player.service.ts`
- `src/app/app.routes.ts`

## Proximos pasos

- Reemplazar texto actual por contenido final definitivo.
