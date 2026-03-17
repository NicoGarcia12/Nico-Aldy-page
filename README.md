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

## Regla de calidad antes de git

Para este repo, antes de cada commit/push se aplica este gate:

### Antes de commit

```bash
npm run format:check
npm run lint
```

### Antes de push

```bash
npm run test -- --watch=false --browsers=ChromeHeadless
npm run e2e
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

- Los valores de validacion no se documentan en el README.
- El formulario usa palabras divididas en casillas con primera letra fija para guiar el ingreso.
- Las fechas se validan contra valores de referencia internos de la app.
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

## Deploy a GitHub Pages

El proyecto usa hash routing y tiene flujo de deploy por GitHub Actions hacia rama `gh-pages`.

### Script de build para Pages

```bash
npm run build:gh-pages
```

Este comando compila con:

- `--base-href /Nico-Aldy-page/`

### Workflow de deploy

- Archivo: `.github/workflows/deploy-gh-pages.yml`
- Dispara en push a `master` o manual (`workflow_dispatch`).
- Publica `dist/nico-aldy-page/browser` en rama `gh-pages`.

### Configuracion en GitHub

En `Settings > Pages`:

- Source: `Deploy from a branch`
- Branch: `gh-pages`
- Folder: `/ (root)`

### Troubleshooting rapido

- Si falla con `Failed to create deployment` o `Resource not accessible by integration`, usar deploy por rama `gh-pages` (workflow actual) y verificar que Pages tome esa rama.
- Si no aparece `Build and deployment` en la UI, refrescar y revisar permisos del usuario admin del repo.

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
