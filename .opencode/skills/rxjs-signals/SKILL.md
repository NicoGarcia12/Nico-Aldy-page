---
name: rxjs-signals
description: Skill para implementar RxJS con tipado estricto, manejo de errores, teardown y bridge con Angular Signals.
version: 1.0.0
argument-hint: [stream, operador o bridge signal/observable a implementar]
allowed-tools: Read, Write, Bash, Glob, Grep
---

# Skill: RxJS + Angular Signals

Skill para implementar RxJS con tipado estricto, manejo de errores, cleanup
correcto y bridge bidireccional con Angular Signals.

---

## Paso 0 — Verificar versiones

| Feature | Versión mínima Angular | RxJS |
|---------|----------------------|------|
| `toSignal()` | 16.0 | 7.x |
| `toObservable()` | 16.0 | 7.x |
| `takeUntilDestroyed()` | 16.0 | 7.x |
| `rxResource()` | 19.0 | 7.x |
| RxJS 7 operators | - | 7.0 |

---

## Reglas obligatorias de RxJS

1. **Nunca suscribirse sin cleanup**. Siempre usar:
   - `takeUntilDestroyed()` en componentes/servicios Angular
   - `take(1)` para suscripciones one-shot
   - `async` pipe en templates (auto-cleanup)
   - `unsubscribe()` manual solo como último recurso

2. **Siempre manejar errores** en cada pipe:
   ```typescript
   source$.pipe(
       catchError((error: HttpErrorResponse) => {
           console.error('Error:', error.message);
           return EMPTY; // o throwError(() => error)
       })
   )
   ```

3. **Tipar explícitamente** los operadores:
   ```typescript
   // Bien
   map((users: User[]) => users.filter((u: User) => u.active))
   // Mal
   map(users => users.filter(u => u.active))
   ```

4. **Evitar nested subscribes**. Usar `switchMap`, `mergeMap`, `concatMap`:
   ```typescript
   // MAL
   this.getUser().subscribe(user => {
       this.getOrders(user.id).subscribe(orders => { ... });
   });

   // BIEN
   this.getUser().pipe(
       switchMap((user: User) => this.getOrders(user.id))
   ).subscribe((orders: Order[]) => { ... });
   ```

---

## Bridge: Signals ↔ RxJS

### `toSignal()` — Observable → Signal

```typescript
import { toSignal } from '@angular/core/rxjs-interop';
import { inject } from '@angular/core';

@Component({ ... })
export class UserListComponent {
    private readonly userService = inject(UserService);

    // Convierte Observable a Signal con valor inicial
    public readonly users = toSignal(
        this.userService.getAll(),
        { initialValue: [] as User[] }
    );

    // Sin valor inicial — el tipo incluye undefined
    public readonly currentUser = toSignal(this.userService.getCurrent());
    // Tipo: Signal<User | undefined>
}
```

### `toObservable()` — Signal → Observable

```typescript
import { toObservable } from '@angular/core/rxjs-interop';
import { signal, effect } from '@angular/core';

@Component({ ... })
export class SearchComponent {
    public readonly searchTerm = signal('');

    // Convierte signal a observable para usar operadores RxJS
    private readonly search$ = toObservable(this.searchTerm).pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term: string) => this.searchService.search(term))
    );

    public readonly results = toSignal(this.search$, { initialValue: [] });
}
```

### `takeUntilDestroyed()` — Cleanup automático

```typescript
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef, inject } from '@angular/core';

@Component({ ... })
export class DashboardComponent implements OnInit {
    private readonly destroyRef = inject(DestroyRef);

    public ngOnInit(): void {
        this.dataService.stream$.pipe(
            takeUntilDestroyed(this.destroyRef)
        ).subscribe((data: DashboardData) => {
            this.updateView(data);
        });
    }
}
```

---

## Patrones comunes

### HTTP con retry y error handling

```typescript
public getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users').pipe(
        retry({ count: 2, delay: 1000 }),
        catchError((error: HttpErrorResponse) => {
            if (error.status === 404) return of([]);
            return throwError(() => error);
        })
    );
}
```

### Estado con BehaviorSubject + Signal bridge

```typescript
@Injectable({ providedIn: 'root' })
export class AuthStateService {
    private readonly userSubject = new BehaviorSubject<User | null>(null);

    // Exponer como Signal para consumo en templates
    public readonly user = toSignal(this.userSubject.asObservable());
    public readonly isLoggedIn = computed(() => this.user() !== null);

    // Exponer como Observable para consumo en pipes RxJS
    public readonly user$ = this.userSubject.asObservable();

    public setUser(user: User | null): void {
        this.userSubject.next(user);
    }
}
```

### Operadores de selección: cuándo usar cuál

| Operador | Cancelar anterior | Orden garantizado | Usar cuando |
|----------|-------------------|-------------------|-------------|
| `switchMap` | Sí | No | Búsquedas, navegación, requests que se reemplazan |
| `concatMap` | No | Sí | Operaciones secuenciales (crear → actualizar) |
| `mergeMap` | No | No | Operaciones independientes en paralelo |
| `exhaustMap` | N/A (ignora nuevos) | N/A | Login, submit de formularios |

---

## Anti-patterns

| Anti-pattern | Problema | Solución |
|-------------|----------|----------|
| Subscribe sin cleanup | Memory leak | `takeUntilDestroyed()` |
| Nested subscribes | Callback hell, no cancelable | `switchMap`/`concatMap` |
| `.subscribe()` en template class | No se auto-limpia | `async` pipe o `toSignal()` |
| `tap()` con side effects pesados | Impredecible | Mover a `subscribe()` |
| `any` en operadores | Sin type safety | Tipar explícitamente |

## Checklist

- [ ] Ningún subscribe sin mecanismo de cleanup
- [ ] `catchError` en cada pipe que haga HTTP
- [ ] Operadores tipados explícitamente
- [ ] `toSignal()` con `initialValue` cuando el template lo necesita
- [ ] Sin nested subscribes
- [ ] `switchMap` para requests que se reemplazan, `exhaustMap` para submits
