# Nico Aldy Page

Base inicial del frontend en Angular 19 para evolucionar por fases.

## Como correr el proyecto

```bash
npm install
npm start
```

La app levanta en `http://localhost:4200`.

## Build de verificacion

```bash
npm run build
```

## Lint y formato

```bash
npm run lint
npm run format
```

## Decision tecnica: hash routing

El proyecto usa hash routing (`/#/ruta`) para simplificar deploy estatico sin configuraciones de rewrite en servidor.

Motivo: al no depender de fallback de rutas del servidor, cualquier host estatico simple puede servir la SPA sin errores 404 al refrescar rutas internas.

## Estructura base actual

- `src/app/features/login/login-page`: pantalla `formulario`.
- `src/app/features/dashboard/dashboard-page`: pantalla `carta`.
- `src/app/features/not-found/not-found-page`: pantalla `404`.
- `src/app/app.routes.ts`: rutas base con lazy loading y redireccion inicial a `formulario`.
- `src/app/app.config.ts`: router configurado con `withHashLocation()`.
- `src/app/core/auth`: servicio de login local + guards para acceso de rutas.
- `src/app/core/media/music-player.service.ts`: audio global persistente entre rutas.

## Login de esta fase

El formulario valida estos campos:

- Fecha del primer beso
- Tenemos un libro calificando...
- Primera serie que vimos juntos
- Compartimos...
- Fecha en la que nos pusimos de novios

Reglas de esta version:

- Fecha del primer beso: `2025-02-16`.
- Primera serie: palabra `MERLINA` en 7 inputs (la `M` ya viene fija y no editable).
- Libro calificando: palabra `ALFAJORES` en 9 inputs (la `A` fija).
- Compartimos: palabra `LLAVEROS` en 8 inputs (la `L` fija).
- Fecha en la que nos pusimos de novios: `2025-04-17`.
- Boton principal: `Ver pequeña sorpresa`.
- Notificaciones: exito rosado, info azul, error rojo (5s por defecto).

Los valores de referencia se configuran en `src/app/core/auth/auth.constants.ts` (`LOGIN_REFERENCE_DATA`).

Si los datos coinciden, se guarda sesion en `localStorage` (sin expiracion por tiempo), redirige a `/carta` y no permite volver a `/formulario` hasta hacer logout.

## Rutas publicas

- `/#/formulario`: acceso principal.
- `/#/carta`: carta protegida por sesion.
- `/#/404`: no encontrado.

## Musica de fondo

- Arranca al primer gesto de usuario en la app (`mousemove` / `touchstart`), respetando politicas del navegador.
- Se mantiene al navegar entre `formulario`, `carta` y `404`.
- Si el usuario pausa manualmente, no vuelve a autoactivarse hasta reanudar.
- Archivo esperado: `public/assets/audio/tunel-de-la-vida.mp3`.
- Controles de pausar/reanudar en `formulario`, `carta` y `404`.

## Deploy a GitHub Pages (pendiente de cerrar)

El proyecto usa hash routing y ya tiene flujo de deploy preparado para GitHub Pages.

### Script de build para Pages

```bash
npm run build:gh-pages
```

Este comando compila con:

- `--base-href /Nico-Aldy-page/`

### Workflow de deploy

- Archivo: `.github/workflows/deploy-gh-pages.yml`
- Dispara en push a `master` o manual (`workflow_dispatch`).
- Publica el artifact `dist/nico-aldy-page/browser`.

### Fallback 404 estatico

- Archivo: `public/404.html`
- Redirige a `/#/404` dentro del repo en Pages.

## Convencion de documentacion por pantalla

Cada pantalla debe tener su Markdown en `knowledge/screens/` con:

- proposito
- flujo
- estado/validaciones
- dependencias
- proximos pasos

## Roadmap de fases

1. Configuracion inicial (esta fase).
2. Login (completado en version base local).
3. Dashboard carta (pendiente de contenido y layout final).
4. Contenido final y estilos.
