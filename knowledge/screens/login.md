# Formulario (`/formulario`)

## Proposito

Validar un acceso local con datos compartidos para habilitar el ingreso a la carta.

## Flujo

1. El usuario completa fecha del primer beso, letras de `ALFAJORES`, letras de `MERLINA`, letras de `LLAVEROS` y fecha en la que nos pusimos de novios.
2. El formulario valida campos requeridos.
3. Se compara contra `LOGIN_REFERENCE_DATA` en `src/app/core/auth/auth.constants.ts`.
4. Si coincide, se guarda sesion en `localStorage`, se muestra mensaje de exito y navega a `/carta`.
5. Si falla, muestra mensaje de error en la pantalla.

## Estado y validaciones

- Validaciones: todos los campos requeridos.
- Primera serie: `MERLINA` en 7 casillas, con `M` fija no editable y 6 letras editables.
- Libro calificando: `ALFAJORES` con `A` fija + 8 letras editables.
- Compartimos: `LLAVEROS` con `L` fija + 7 letras editables.
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
