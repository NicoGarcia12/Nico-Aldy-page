# Not Found (`/404`)

## Proposito

Dar una salida clara cuando la ruta no existe, manteniendo identidad visual del sitio.

## Flujo

1. Si el usuario llega a una ruta invalida, se redirige a `/#/404`.
2. Se muestra imagen de palta + mensaje de pagina no encontrada.
3. Boton principal vuelve a `/#/formulario`.
4. Si hay sesion activa, muestra aviso de exito temporal.

## Estado y validaciones

- Vista publica (no requiere sesion).
- Conserva control de musica (pausar/reanudar) como el resto de vistas.

## Dependencias

- `src/app/features/not-found/not-found-page/not-found-page.component.ts`
- `src/app/core/media/music-player.service.ts`
- `src/app/app.routes.ts`

## Proximos pasos

- Ajustar copy final del 404 segun tono definitivo.
