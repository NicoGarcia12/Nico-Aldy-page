# Audio autoplay con gesto de usuario

## Contexto

Se necesitaba reproducir una cancion de fondo en una SPA Angular al empezar la experiencia, mantenerla al navegar entre `formulario`, `carta` y `404`, y permitir pausar/reanudar desde varias pantallas.

## Lo aprendido

- Los navegadores bloquean autoplay sin gesto de usuario; la forma robusta es disparar `audio.play()` luego de `mousemove` o `touchstart`.
- Para que no se corte entre rutas, conviene centralizar el `HTMLAudioElement` en un servicio singleton (`providedIn: 'root'`).
- Si el usuario pausa manualmente, hay que persistir ese estado (`pausedByUser`) para evitar que un nuevo gesto reactive audio sin querer.

## Implementacion aplicada

- Servicio unico: `src/app/core/media/music-player.service.ts`.
- Inicio por gesto global en shell: `src/app/app.component.html` + `src/app/app.component.ts`.
- Controles en multiples vistas: login, carta y 404.

## Nota para agentes/skills

Este patron deberia estar documentado en skills frontend (Angular/React) bajo una seccion de "media playback policy" para evitar recomendaciones de autoplay directo en `ngOnInit`.
