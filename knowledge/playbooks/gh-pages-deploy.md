# Playbook - Deploy a GitHub Pages

## Objetivo

Publicar la app Angular en GitHub Pages de forma repetible.

## Requisitos

- Repositorio publico.
- Workflow `.github/workflows/deploy-gh-pages.yml` presente.
- Script `npm run build:gh-pages` configurado.

## Pasos

1. Hacer push a `master`.
2. Verificar en Actions que `Deploy to gh-pages branch` termine en verde.
3. En Settings > Pages, seleccionar:
   - Source: `Deploy from a branch`
   - Branch: `gh-pages`
   - Folder: `/ (root)`
4. Probar URL final del sitio.

## Verificaciones funcionales

- `/#/formulario` carga correctamente.
- `/#/carta` requiere sesion.
- `/#/404` muestra vista de no encontrado.
- Audio se mantiene entre rutas y responde a pause/resume.

## Fallas comunes

- `Resource not accessible by integration`: no usar API deploy de Pages; usar deploy a rama `gh-pages`.
- Build con paths rotos: verificar `npm run build:gh-pages` con `--base-href /Nico-Aldy-page/`.
