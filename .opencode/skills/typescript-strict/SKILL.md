---
name: typescript-strict
description: Skill para escribir TypeScript estricto, tipado y mantenible en entornos productivos.
version: 1.0.0
argument-hint: [archivo o tarea a tipar]
allowed-tools: Read, Write, Bash(tsc *)
---

# Skill: TypeScript Estricto

Esta skill define cómo trabajar TypeScript con seguridad de tipos estricta.
Prioriza firmas explícitas, modelos claros y errores detectados en compilación.
Sirve tanto para código nuevo como para migrar JavaScript a TypeScript sin perder trazabilidad.

## Flujo recomendado

1. Leer las reglas obligatorias (sección siguiente).
2. Revisar los patrones de diseño tipado.
3. Aplicar cambios de tipado incremental.
4. Validar con `tsc --noEmit` cuando corresponda.

---

## Reglas obligatorias

1. **No usar `any`** salvo excepción documentada con comentario `// REASON: ...`.
2. **Declarar tipos de retorno** en funciones públicas y exportadas.
3. **Evitar `@ts-ignore`** como solución por defecto — si es necesario, usar `@ts-expect-error` con justificación.
4. **Tipar parámetros**, objetos de dominio y contratos de API siempre.
5. **Clases con modificadores de acceso explícitos** (`public`, `private`, `protected`, `readonly`).
6. **Preferir inmutabilidad** (`readonly`, `as const`, `Readonly<T>`) cuando el dato no debe mutar.
7. **Validar datos externos** con type guards o parseo controlado (nunca castear datos de API directamente).

## Reglas de organización

- `interface` para contratos de objetos (lo que describe una forma/shape).
- `type` para uniones, utilidades, composiciones y alias complejos.
- Alias de dominio con nombres claros y estables (no `IData`, sí `UserProfile`).

---

## Patrones de diseño tipado

### Patrón 1: Contratos primero

- Definir tipos e interfaces **antes** de implementar.
- Usar modelos de entrada y salida separados para APIs (`CreateUserRequest` / `UserResponse`).
- No reutilizar el mismo tipo para request y response.

### Patrón 2: Errores tipados

- Modelar estados con **uniones discriminadas**:

```typescript
type Result<T> =
    | { success: true; data: T }
    | { success: false; error: string };
```

- Evitar excepciones opacas cuando puede devolverse un resultado tipado.
- Los errores de dominio deben tener tipo propio, no ser `string` sueltos.

### Patrón 3: Abstracciones chicas

- Preferir **funciones puras** sobre clases innecesarias.
- Si se usa clase, mantener API pública pequeña y cohesionada.
- Una clase no debería tener más de 5-7 métodos públicos.

### Patrón 4: Migración incremental (JS → TS)

- Empezar por **límites** (HTTP, storage, adapters) — son los puntos donde entran datos sin tipar.
- Tipar casos de uso y luego componentes.
- Reducir deuda de `unknown`/casts en pasos medibles.
- Documentar cada paso de migración con `// TODO(ts-migrate): ...` si queda algo pendiente.

---

## Utilidades de tipado recomendadas

```typescript
// Hacer todas las propiedades required
type Strict<T> = Required<T>;

// Pick solo lo que necesitás para un mock o DTO parcial
type PartialService = Pick<UserService, 'getById' | 'create'>;

// Record para mapeos tipados
type StatusLabels = Record<'active' | 'inactive' | 'pending', string>;

// Extract para filtrar uniones
type ActiveStatus = Extract<UserStatus, 'active' | 'verified'>;
```

## Checklist antes de hacer PR

- [ ] `tsc --noEmit` pasa sin errores
- [ ] No hay `any` sin comentario justificativo
- [ ] Funciones públicas tienen tipo de retorno explícito
- [ ] Datos externos (API, localStorage, params) están validados/parseados
- [ ] Interfaces y types tienen nombres descriptivos de dominio
