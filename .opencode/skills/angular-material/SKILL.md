---
name: angular-material
description: Skill para implementar componentes Angular Material — form fields, layouts, diálogos, tablas, wrappers y theming.
version: 1.0.0
argument-hint: [componente Material o patrón de layout]
allowed-tools: Read, Write, Bash, Glob, Grep
---

# Skill: Angular Material Patterns

Skill para implementar componentes de Angular Material con patterns consistentes
de layout, formularios, diálogos, tablas y theming.

---

## Paso 0 — Verificar versión de Angular Material

**ANTES de implementar**, leer `package.json` y verificar:

| Feature | Versión mínima | Estable desde |
|---------|---------------|---------------|
| MDC-based components | 15.0 | 16.0 |
| Standalone Material imports | 15.0 | 15.0 |
| Signal-based form controls | 17.0 | 17.0 |
| Material 3 (M3) design tokens | 17.2 | 18.0 |
| `provideAnimationsAsync()` | 17.0 | 17.0 |

Consultar Context7 si hay dudas sobre APIs disponibles.

---

## Componentes Wrapper

### `sol-input` — Input personalizado

```typescript
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule, MatFormFieldAppearance } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
    selector: 'sol-input',
    standalone: true,
    imports: [MatFormFieldModule, MatInputModule, ReactiveFormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <mat-form-field [appearance]="appearance">
            <mat-label>{{ label }}</mat-label>
            <input matInput
                   [formControl]="control"
                   [type]="type"
                   [attr.aria-invalid]="hasError"
                   [attr.aria-describedby]="hasError ? errorId : null">
            @if (hasError) {
                <mat-error [id]="errorId" aria-live="assertive">
                    {{ errorMessage }}
                </mat-error>
            }
        </mat-form-field>
    `
})
export class SolInputComponent {
    private static nextId: number = 0;
    public readonly errorId: string = `sol-input-error-${SolInputComponent.nextId++}`;

    @Input() public control!: FormControl;
    @Input() public label: string = '';
    @Input() public type: string = 'text';
    @Input() public appearance: MatFormFieldAppearance = 'outline';

    public get hasError(): boolean {
        return this.control?.invalid && this.control?.touched;
    }

    public get errorMessage(): string {
        if (this.control?.hasError('required')) return 'Campo obligatorio';
        if (this.control?.hasError('email')) return 'Email inválido';
        if (this.control?.hasError('minlength')) return 'Muy corto';
        return 'Error de validación';
    }
}
```

### `sol-select` — Select personalizado

```typescript
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

export interface SolSelectOption {
    value: string | number;
    label: string;
    disabled?: boolean;
}

@Component({
    selector: 'sol-select',
    standalone: true,
    imports: [MatSelectModule, MatFormFieldModule, ReactiveFormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <mat-form-field appearance="outline">
            <mat-label>{{ label }}</mat-label>
            <mat-select [formControl]="control">
                @for (opt of options; track opt.value) {
                    <mat-option [value]="opt.value" [disabled]="opt.disabled ?? false">
                        {{ opt.label }}
                    </mat-option>
                }
            </mat-select>
        </mat-form-field>
    `
})
export class SolSelectComponent {
    @Input() public options: SolSelectOption[] = [];
    @Input() public control!: FormControl;
    @Input() public label: string = '';
}
```

---

## Layout de formularios — Grid con errores

```scss
.form-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    align-items: start; // IMPORTANTE: no usar 'center' — los errores rompen el layout
}

.form-field-group {
    display: flex;
    flex-direction: column;
}

.full-width {
    grid-column: 1 / -1;
}
```

```html
<div class="form-container">
    <div class="form-field-group">
        <mat-form-field appearance="outline">
            <mat-label>Nombre</mat-label>
            <input matInput formControlName="name">
        </mat-form-field>
    </div>
    <div class="form-field-group">
        <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email">
        </mat-form-field>
    </div>
</div>
```

---

## Diálogos (MatDialog)

### Abrir diálogo

```typescript
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

export class MiComponente {
    private readonly dialog = inject(MatDialog);
    private readonly destroyRef = inject(DestroyRef);

    public abrirDialogo(): void {
        const dialogRef: MatDialogRef<ConfirmDialogComponent> = this.dialog.open(
            ConfirmDialogComponent,
            {
                data: { titulo: 'Confirmar acción', mensaje: '¿Estás seguro?' },
                width: '500px',
                disableClose: true
            }
        );

        dialogRef.afterClosed().pipe(
            filter((result: boolean | undefined) => !!result),
            takeUntilDestroyed(this.destroyRef)
        ).subscribe(() => {
            this.ejecutarAccion();
        });
    }
}
```

### Componente del diálogo

```typescript
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

interface ConfirmDialogData {
    titulo: string;
    mensaje: string;
}

@Component({
    selector: 'app-confirm-dialog',
    standalone: true,
    imports: [MatDialogModule, MatButtonModule],
    template: `
        <h2 mat-dialog-title>{{ data.titulo }}</h2>
        <mat-dialog-content>{{ data.mensaje }}</mat-dialog-content>
        <mat-dialog-actions align="end">
            <button mat-button (click)="cancelar()">Cancelar</button>
            <button mat-flat-button color="primary" (click)="confirmar()">Confirmar</button>
        </mat-dialog-actions>
    `
})
export class ConfirmDialogComponent {
    public readonly data: ConfirmDialogData = inject(MAT_DIALOG_DATA);
    private readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);

    public confirmar(): void { this.dialogRef.close(true); }
    public cancelar(): void { this.dialogRef.close(false); }
}
```

---

## Tablas (MatTable)

```typescript
import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';

interface UserRow {
    id: number;
    name: string;
    email: string;
}

@Component({
    selector: 'app-user-table',
    standalone: true,
    imports: [MatTableModule, MatSortModule, MatPaginatorModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <table mat-table [dataSource]="users()" matSort>
            <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Nombre</th>
                <td mat-cell *matCellDef="let row">{{ row.name }}</td>
            </ng-container>
            <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Email</th>
                <td mat-cell *matCellDef="let row">{{ row.email }}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>
        <mat-paginator [pageSizeOptions]="[5, 10, 25]" showFirstLastButtons />
    `
})
export class UserTableComponent {
    public readonly users = input.required<UserRow[]>();
    public readonly displayedColumns: string[] = ['name', 'email'];
}
```

---

## Theming

### CSS Custom Properties (preferido para temas dinámicos)

```scss
:root {
    --primary: #3f51b5;
    --accent: #ff4081;
    --warn: #f44336;
    --bg: #fafafa;
    --surface: #ffffff;
}

[data-theme="dark"] {
    --bg: #303030;
    --surface: #424242;
}
```

---

## Reglas de Material

1. **`appearance="outline"`** como apariencia por defecto.
2. **Wrappers consistentes**: Usar `sol-input` y `sol-select` cuando existan.
3. **`align-items: start`**: Nunca `center` en grids con `mat-form-field`.
4. **IDs únicos para errores**: Generar IDs con contador estático para accesibilidad.
5. **`disableClose` en diálogos críticos**: Evitar cierre accidental.
6. **Standalone imports**: Importar módulos individuales (`MatButtonModule`, no `MaterialModule`).
7. **OnPush** en todos los componentes Material.

## Checklist

- [ ] Layouts de formularios usan `align-items: start`
- [ ] Diálogos destructivos tienen `disableClose: true`
- [ ] Form fields tienen `mat-error` con `aria-live`
- [ ] Tablas tienen `matSort` si son datos tabulares
- [ ] Theming usa CSS custom properties
