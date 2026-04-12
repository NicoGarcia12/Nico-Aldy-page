# Playbook — Estándar de estimación con Story Points

Fecha: 2026-03-25

## Objetivo

Unificar el lenguaje de estimación en tickets y documentación visible, alineado con `agentes-ia`.

## Regla operativa (visible)

1. Usar siempre el término **Story Points**.
2. No usar el término **"Estimación Fibonacci"** en tickets o documentación visible.
3. Serie recomendada de Story Points: **1, 2, 3, 5, 8, 13**.
4. Los Story Points son **relativos** (complejidad, riesgo y esfuerzo comparado), no equivalen a horas exactas.

## Convención de naming para tickets

- Formato de título: `[Area][SP 3] T1 - Título`
- Campo obligatorio en descripción: `Story Points: 3`

## Ejemplos

- Título: `[Frontend][SP 5] T2 - Refactor de navegación pública`
- Descripción (línea de estimación): `Story Points: 5`

## Alcance

- Aplica a nuevos tickets y a documentación operativa visible del equipo.
- En tickets históricos no se requiere reescritura retroactiva, salvo que se editen por otro motivo.

## Evidencia

- Sincronización solicitada para repo `Nico-Aldy-page` el `2026-03-25`.

## Supuestos

- Se asume que el sistema de tickets permite usar el prefijo `[SP n]` en el título y texto libre en la descripción.

## Referencia LTS

No aplica. Este estándar define convención de gestión/documentación y no depende de versiones técnicas de runtime/framework.
