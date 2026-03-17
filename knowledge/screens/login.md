# Formulario (`/formulario`)

## Proposito

Validar un acceso local con datos compartidos para habilitar el ingreso a la carta.

## Flujo

1. El usuario completa fechas y tres bloques de palabras en casillas con letra inicial fija.
2. El formulario valida campos requeridos.
3. Se compara contra `LOGIN_REFERENCE_DATA` en `src/app/core/auth/auth.constants.ts`.
4. Si coincide, se guarda sesion en `localStorage`, se muestra mensaje de exito y navega a `/carta`.
5. Si falla, muestra mensaje de error en la pantalla.

## Estado y validaciones

- Validaciones: todos los campos requeridos.
- Tres bloques de palabras en casillas con primera letra fija no editable.
- Notificaciones tipo toast: info azul, error rojo y exito rosado.
- Boton principal: `Ver pequeña sorpresa`.
- Sin expiracion por tiempo de sesion.
- Incluye boton para pausar/reanudar musica.

## Dependencias

- `src/app/core/auth/auth.service.ts`
- `src/app/core/auth/auth.guard.ts` (`guestGuard`)
- `src/app/core/media/music-player.service.ts`
- `src/app/app.routes.ts`

## Proximos pasos

- Ajustar refinamientos visuales puntuales (espaciado/jerarquia en mobile).
