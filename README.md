# Nico Aldy Page

SPA en Angular para experiencia web con login temático, dashboard y reproducción de audio entre rutas.

## Stack actual

- **Frontend**: Angular 20 + TypeScript
- **Unit tests**: Jest
- **E2E**: Cypress (specs en **TypeScript**, por ejemplo `cypress/e2e/login-flow.cy.ts`)
- **Calidad**: ESLint + Prettier
- **Deploy**: GitHub Pages (hash routing)

## Requisitos

- Node.js 20+
- npm 10+

## Inicio rápido

```bash
npm install
npm start
```

App local: `http://localhost:4200`

## Scripts principales

```bash
# Desarrollo / build
npm start
npm run build
npm run build:gh-pages

# Calidad
npm run format
npm run format:check
npm run lint

# Tests
npm run jest
npm run e2e:smoke
```

## Gate recomendado antes de push

Comando recomendado:

```bash
npm run validate:all
```

Si necesitás correrlo por pasos:

```bash
npm run format:check
npm run lint
npm run jest
npm run e2e:smoke
```

## Rutas principales

- `/#/formulario`
- `/#/carta`
- `/#/404`

## Notas de arquitectura

- Se usa **hash routing** (`/#/ruta`) para evitar configuración de rewrites en hosting estático.
- El audio se mantiene entre navegación de pantallas.

## Deploy (GitHub Pages)

- Build para Pages: `npm run build:gh-pages`
- Workflow: `.github/workflows/deploy-gh-pages.yml`
- Publicación esperada: rama `gh-pages`
