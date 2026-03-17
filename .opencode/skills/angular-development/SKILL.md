---
name: angular-development
description: Skill para desarrollo Angular — arquitectura clean/hexagonal, componentes standalone, signals, routing, formularios. Material extraído a angular-material.
version: 2.0.0
argument-hint: [componente, feature o patrón a implementar]
allowed-tools: Read, Write, Bash, Glob, Grep
---

# Skill: Desarrollo Angular

Skill para desarrollo Angular con arquitectura clean/hexagonal, componentes standalone,
signals, routing, formularios y Analog.js.
Para Angular Material, cargar la skill `angular-material` por separado.

---

## Paso 0 — Verificar versiones del proyecto

**ANTES de implementar cualquier patrón**, leer `package.json` del proyecto y verificar:

| Feature                                       | Versión mínima | Estable desde |
| --------------------------------------------- | -------------- | ------------- |
| Standalone components                         | 14.0           | 15.2          |
| `inject()` function                           | 14.0           | 15.0          |
| Signals (`signal`, `computed`, `effect`)      | 16.0           | 17.0          |
| Signal inputs (`input()`, `input.required()`) | 17.1           | 17.2          |
| Signal outputs (`output()`)                   | 17.3           | 17.3          |
| `takeUntilDestroyed()`                        | 16.0           | 16.0          |
| Deferrable views (`@defer`)                   | 17.0           | 17.0          |
| Control flow (`@if`, `@for`, `@switch`)       | 17.0           | 17.0          |
| `linkedSignal`                                | 19.0           | 19.0          |
| `resource()` / `rxResource()`                 | 19.0           | 19.0          |

**No recomendar patterns de versiones futuras.** Consultar Context7 si hay dudas sobre
si una API existe en la versión instalada.

---

## Parte 1 — Arquitectura Clean / Hexagonal

### Sufijos por rol

| Sufijo                          | Capa                             | Uso                                              |
| ------------------------------- | -------------------------------- | ------------------------------------------------ |
| `UseCase`                       | Aplicación                       | Caso de uso con lógica de negocio u orquestación |
| `Repository` / `RepositoryPort` | Aplicación (port) / Infra (impl) | Acceso a datos con contrato abstracto            |
| `Adapter`                       | Infraestructura                  | Implementación concreta de un port externo       |
| `Mapper`                        | Infraestructura                  | Transformación entre DTOs y entidades de dominio |
| `Facade`                        | Presentación                     | Interfaz simplificada entre UI y aplicación      |
| `Controller`                    | Presentación                     | Solo si hay API REST (no en SPAs típicas)        |

### Convenciones de nombres

- **Kebab-case** para todos los archivos: `balance-dashboard.facade.ts`
- **Feature-first**: agrupar por capacidad de negocio, no por tipo técnico
- Compartir solo primitivas realmente comunes (modelos de dominio, utils)
- Nombres descriptivos y orientados al dominio, sin prefijos técnicos innecesarios

### Estructura de carpetas por feature

```
feature-name/
├── application/
│   ├── get-balance-summary.use-case.ts
│   └── balance-repository.port.ts
├── infrastructure/
│   └── http-balance.repository.ts
├── presentation/
│   ├── balance-dashboard.facade.ts
│   ├── balance-dashboard.component.ts      ← Smart component
│   └── balance-card.component.ts           ← Dumb component
└── domain/
    └── commission.calculator.ts
```

### Ejemplo: Facade con Signals

```typescript
import { Injectable, computed, signal } from "@angular/core";

interface Balance {
  attributes: { amount: number };
}

interface LoadBalancesUseCase {
  execute(): import("rxjs").Observable<Balance[]>;
}

@Injectable({ providedIn: "root" })
export class BalanceDashboardFacade {
  private readonly balancesSignal = signal<Balance[]>([]);
  private readonly loadingSignal = signal<boolean>(true);

  public readonly balances = this.balancesSignal.asReadonly();
  public readonly loading = this.loadingSignal.asReadonly();
  public readonly hasAnyBalance = computed(() =>
    this.balancesSignal().some((b: Balance) => b.attributes.amount > 0),
  );

  public constructor(
    private readonly loadBalancesUseCase: LoadBalancesUseCase,
  ) {}

  public load(): void {
    this.loadingSignal.set(true);
    this.loadBalancesUseCase.execute().subscribe({
      next: (balances: Balance[]) => {
        this.balancesSignal.set(balances);
        this.loadingSignal.set(false);
      },
      error: () => this.loadingSignal.set(false),
    });
  }
}
```

### Ejemplo: Use Case

```typescript
import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";

interface BalanceRepository {
  getBalances(): Observable<number[]>;
}

interface BalanceSummary {
  total: number;
  count: number;
}

@Injectable({ providedIn: "root" })
export class GetBalanceSummaryUseCase {
  public constructor(private readonly balanceRepository: BalanceRepository) {}

  public execute(): Observable<BalanceSummary> {
    return this.balanceRepository.getBalances().pipe(
      map((balances: number[]) => ({
        total: balances.reduce((sum: number, v: number) => sum + v, 0),
        count: balances.length,
      })),
    );
  }
}
```

### Ejemplo: Repository Port + Implementación

```typescript
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

interface BalanceDto {
  amount: number;
}

// Port (capa de aplicación)
export abstract class BalanceRepositoryPort {
  public abstract getBalances(): Observable<BalanceDto[]>;
}

// Implementación (capa de infraestructura)
@Injectable({ providedIn: "root" })
export class HttpBalanceRepository extends BalanceRepositoryPort {
  private readonly endpoint: string = "/api/balances";

  public constructor(private readonly http: HttpClient) {
    super();
  }

  public getBalances(): Observable<BalanceDto[]> {
    return this.http.get<BalanceDto[]>(this.endpoint);
  }
}
```

---

## Parte 2 — Componentes Standalone y Signals

## Parte 2.1 — Flujo obligatorio para features nuevas (TDD)

Para agregar features nuevas, aplicar siempre **TDD (Red → Green → Refactor)**:

1. **RED**: escribir/ajustar tests primero y validar que fallen por el motivo esperado.
2. **GREEN**: implementar el minimo de codigo para que pasen.
3. **REFACTOR**: mejorar estructura/nombres manteniendo tests en verde.

Regla operativa:

- No arrancar por UI/servicio sin tener al menos un test de comportamiento escrito para la feature.

### Patrón Smart / Dumb

| Tipo                      | Responsabilidad                                      | Inyecta servicios | Ejemplo                          |
| ------------------------- | ---------------------------------------------------- | ----------------- | -------------------------------- |
| **Smart** (container)     | Orquesta datos, delega en Facade/UseCase             | Sí                | `balance-dashboard.component.ts` |
| **Dumb** (presentational) | Recibe inputs, emite outputs, cero lógica de negocio | No                | `balance-card.component.ts`      |

### Componente Dumb con Signal Inputs (Angular 17.2+)

```typescript
import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
} from "@angular/core";

@Component({
  selector: "app-balance-card",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card">
      <h3>{{ title() }}</h3>
      <p>{{ amount() | currency }}</p>
      <button (click)="selected.emit(amount())">Ver detalle</button>
    </div>
  `,
})
export class BalanceCardComponent {
  public readonly title = input.required<string>();
  public readonly amount = input<number>(0);
  public readonly selected = output<number>();
}
```

### Componente Smart con Facade

```typescript
import {
  Component,
  inject,
  OnInit,
  ChangeDetectionStrategy,
} from "@angular/core";

@Component({
  selector: "app-balance-dashboard",
  standalone: true,
  imports: [BalanceCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (facade.loading()) {
      <p>Cargando...</p>
    } @else {
      @for (balance of facade.balances(); track balance.id) {
        <app-balance-card
          [title]="balance.name"
          [amount]="balance.amount"
          (selected)="onSelected($event)"
        />
      }
    }
  `,
})
export class BalanceDashboardComponent implements OnInit {
  protected readonly facade = inject(BalanceDashboardFacade);

  public ngOnInit(): void {
    this.facade.load();
  }

  protected onSelected(amount: number): void {
    console.log("Seleccionado:", amount);
  }
}
```

### Reglas de componentes

1. **Standalone siempre** — no usar `NgModule` para componentes nuevos.
2. **`ChangeDetectionStrategy.OnPush`** obligatorio en todos los componentes.
3. **Signal inputs** (`input()`, `input.required()`) preferidos sobre `@Input()` (Angular 17.2+).
4. **Signal outputs** (`output()`) preferidos sobre `@Output()` + `EventEmitter` (Angular 17.3+).
5. **Control flow** (`@if`, `@for`, `@switch`) preferido sobre `*ngIf`, `*ngFor` (Angular 17+).
6. **`inject()` function** preferida sobre inyección por constructor para servicios.
7. **`takeUntilDestroyed()`** para cleanup de suscripciones.
8. **Separacion de archivos obligatoria**: cada componente con `templateUrl` y `styleUrl` apuntando a `*.component.html` y `*.component.scss`.
9. **No usar template/styles inline** en componentes de proyecto (solo permitido en snippets didacticos).

### Baseline de formato (reglas explicitas)

Para mantener consistencia entre features nuevas, usar estas reglas explicitas:

- `singleQuote: true`
- `printWidth: 140`
- `tabWidth: 4`
- `trailingComma: none`
- `endOfLine: lf`

Si el repo ya trae reglas de Prettier/ESLint, esas reglas prevalecen.

---

## Parte 3 — Analog.js (SSR/SSG para Angular)

### ¿Cuándo usar Analog.js?

- Proyectos Angular que necesitan **SSR** (Server-Side Rendering) o **SSG** (Static Site Generation)
- Blogs, landing pages, portfolios con Angular
- Cuando se quiere file-based routing en Angular

### Conceptos clave

| Concepto                | Descripción                                                     |
| ----------------------- | --------------------------------------------------------------- |
| **File-based routing**  | Archivos en `src/app/pages/` mapean a rutas automáticamente     |
| **API routes**          | Archivos en `src/server/routes/` generan endpoints del servidor |
| **Content collections** | Markdown/MDX para contenido estático tipado                     |
| **Vite-powered**        | Build con Vite en lugar de webpack                              |

### Estructura Analog.js

```
src/
├── app/
│   ├── pages/
│   │   ├── index.page.ts           → /
│   │   ├── about.page.ts           → /about
│   │   └── blog/
│   │       ├── [slug].page.ts      → /blog/:slug
│   │       └── index.page.ts       → /blog
│   └── components/
│       └── header.component.ts
├── content/
│   └── blog/
│       ├── hello-world.md
│       └── second-post.md
├── server/
│   └── routes/
│       └── v1/
│           └── hello.ts            → /api/v1/hello
└── vite.config.ts
```

### Reglas de Analog.js

1. **Verificar versión** de Analog antes de usar features — consultar Context7.
2. **File-based routing** para páginas, no crear Router manualmente.
3. **Content collections** con frontmatter tipado para blogs/docs.
4. **API routes** para endpoints del servidor, separados del frontend.

---

## Parte 4 — SPA estatica (GitHub Pages)

### Checklist de deploy

- Definir estrategia de rutas: `withHashLocation()` cuando no hay rewrites de servidor.
- Build para project pages con `--base-href /<repo>/`.
- Confirmar que assets se referencien en forma relativa (`assets/...`).
- Incluir `404.html` estatico si el hosting lo requiere para fallback.

### Errores frecuentes

- Pantalla en blanco en Pages: `base-href` en `/` en lugar de `/<repo>/`.
- 404 al refrescar deep link: falta hash routing o fallback del host.

---

## Parte 5 — Media autoplay policy

- Los navegadores bloquean autoplay sin gesto de usuario.
- Para audio de fondo en SPA:
  1. iniciar con gesto de usuario,
  2. encapsular en servicio singleton,
  3. respetar pausa manual (`pausedByUser`) para no reactivar sin consentimiento.

---

## Checklist antes de hacer PR

- [ ] `package.json` verificado — no se usan features de versiones futuras
- [ ] Componentes son standalone con `ChangeDetectionStrategy.OnPush`
- [ ] Signal inputs/outputs usados donde la versión lo permite
- [ ] Estructura feature-first respetada
- [ ] Facade no contiene lógica de negocio (solo orquesta)
- [ ] UseCase no conoce la UI ni el framework de presentación

## Referencias

Siempre consultar documentación actualizada via Context7 antes de asumir APIs:

- Angular Components → Context7 con la versión del proyecto
- Angular Signals → Context7
- Analog.js → Context7
