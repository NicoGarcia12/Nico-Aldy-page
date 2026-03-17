---
name: testing-e2e
description: "Skill para testing E2E con Cypress y Playwright — setup, page objects, fixtures, interceptors, CI integration."
version: 1.0.0
argument-hint: [test, page object, spec o escenario a implementar]
allowed-tools: Read, Write, Bash, Glob, Grep
---

# Skill: Testing E2E (Cypress + Playwright)

Skill para testing end-to-end con Cypress y Playwright.
Cubre setup, patrones, page objects, fixtures, network interception e integración con CI.

---

## Paso 0 — Verificar versiones

| Feature                | Cypress                         | Playwright                  |
| ---------------------- | ------------------------------- | --------------------------- |
| Versión estable actual | 13.x                            | 1.40+                       |
| Component Testing      | 12+                             | 1.35+                       |
| API Testing            | 12+                             | Nativo                      |
| Network interception   | `cy.intercept()`                | `page.route()`              |
| Multiple browsers      | Chrome, Firefox, Edge, Electron | Chromium, Firefox, WebKit   |
| Parallelism            | Cypress Cloud (pago)            | `--workers` (gratis)        |
| Visual testing         | Plugin (Percy, etc.)            | `toHaveScreenshot()` nativo |
| Mobile emulation       | Viewport only                   | Device emulation completa   |
| Auto-waiting           | Sí                              | Sí                          |
| Trace viewer           | Cypress Cloud                   | Gratis (`--trace on`)       |

**Verificar versión instalada antes de recomendar APIs.**

---

## Parte 1 — Cypress

### Setup y estructura

```
cypress/
├── e2e/                    ← Tests E2E (specs)
│   ├── auth/
│   │   ├── login.cy.ts
│   │   └── register.cy.ts
│   └── users/
│       └── user-crud.cy.ts
├── fixtures/               ← Datos de test (JSON)
│   └── users.json
├── support/
│   ├── commands.ts         ← Comandos custom
│   ├── e2e.ts              ← Setup global
│   └── page-objects/       ← Page Object Model
│       ├── login.page.ts
│       └── users.page.ts
└── tsconfig.json
```

### Test básico

```typescript
// cypress/e2e/auth/login.cy.ts
describe("Login", () => {
  beforeEach(() => {
    // Visitar la página antes de cada test
    cy.visit("/login");
  });

  it("debe hacer login con credenciales válidas", () => {
    // Interceptar la llamada a la API
    cy.intercept("POST", "/api/auth/login", {
      statusCode: 200,
      body: { token: "fake-jwt-token", user: { id: 1, name: "Nico" } },
    }).as("loginRequest");

    // Interactuar con el formulario
    cy.get('[data-cy="email-input"]').type("nico@example.com");
    cy.get('[data-cy="password-input"]').type("password123");
    cy.get('[data-cy="login-button"]').click();

    // Esperar y verificar la request
    cy.wait("@loginRequest").its("request.body").should("deep.include", {
      email: "nico@example.com",
    });

    // Verificar redirección
    cy.url().should("include", "/dashboard");
    cy.get('[data-cy="welcome-message"]').should("contain", "Nico");
  });

  it("debe mostrar error con credenciales inválidas", () => {
    cy.intercept("POST", "/api/auth/login", {
      statusCode: 401,
      body: { error: "Credenciales inválidas" },
    }).as("loginFailed");

    cy.get('[data-cy="email-input"]').type("wrong@example.com");
    cy.get('[data-cy="password-input"]').type("wrongpass");
    cy.get('[data-cy="login-button"]').click();

    cy.wait("@loginFailed");
    cy.get('[data-cy="error-message"]')
      .should("be.visible")
      .and("contain", "Credenciales inválidas");
  });
});
```

### Page Object Model

```typescript
// cypress/support/page-objects/login.page.ts
export class LoginPage {
  public visit(): void {
    cy.visit("/login");
  }

  public getEmailInput(): Cypress.Chainable {
    return cy.get('[data-cy="email-input"]');
  }

  public getPasswordInput(): Cypress.Chainable {
    return cy.get('[data-cy="password-input"]');
  }

  public getSubmitButton(): Cypress.Chainable {
    return cy.get('[data-cy="login-button"]');
  }

  public getErrorMessage(): Cypress.Chainable {
    return cy.get('[data-cy="error-message"]');
  }

  public login(email: string, password: string): void {
    this.getEmailInput().type(email);
    this.getPasswordInput().type(password);
    this.getSubmitButton().click();
  }
}

// Uso en test
import { LoginPage } from "../support/page-objects/login.page";

const loginPage = new LoginPage();

describe("Login", () => {
  it("debe hacer login", () => {
    loginPage.visit();
    loginPage.login("nico@example.com", "password123");
    cy.url().should("include", "/dashboard");
  });
});
```

### Comandos custom

```typescript
// cypress/support/commands.ts
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add("login", (email: string, password: string) => {
  // Login programático (sin UI — más rápido)
  cy.request("POST", "/api/auth/login", { email, password }).then(
    (response) => {
      window.localStorage.setItem("token", response.body.token);
    },
  );
});

// Uso
cy.login("nico@example.com", "password123");
cy.visit("/dashboard");
```

### cy.intercept() avanzado

```typescript
// Interceptar y modificar respuesta
cy.intercept("GET", "/api/users", (req) => {
  req.reply((res) => {
    // Modificar la respuesta real del servidor
    res.body.push({ id: 999, name: "Test User" });
    res.send();
  });
});

// Interceptar con delay (simular red lenta)
cy.intercept("GET", "/api/users", {
  delay: 2000,
  fixture: "users.json", // Responder con fixture
}).as("slowRequest");

// Esperar que el loading aparezca y desaparezca
cy.get('[data-cy="loading"]').should("be.visible");
cy.wait("@slowRequest");
cy.get('[data-cy="loading"]').should("not.exist");
```

---

## Parte 2 — Playwright

### Setup y estructura

```
tests/
├── e2e/
│   ├── auth/
│   │   ├── login.spec.ts
│   │   └── register.spec.ts
│   └── users/
│       └── user-crud.spec.ts
├── fixtures/
│   └── users.json
├── pages/                    ← Page Object Model
│   ├── login.page.ts
│   └── users.page.ts
└── playwright.config.ts
```

### playwright.config.ts

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI, // Fallar en CI si hay .only
  retries: process.env.CI ? 2 : 0, // Reintentos solo en CI
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry", // Trace en primer reintento
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "mobile", use: { ...devices["iPhone 13"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

### Test básico

```typescript
// tests/e2e/auth/login.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Login", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("debe hacer login con credenciales válidas", async ({ page }) => {
    // Interceptar API
    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          token: "fake-jwt",
          user: { id: 1, name: "Nico" },
        }),
      });
    });

    // Interactuar
    await page.getByLabel("Email").fill("nico@example.com");
    await page.getByLabel("Contraseña").fill("password123");
    await page.getByRole("button", { name: "Iniciar sesión" }).click();

    // Verificar
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByText("Nico")).toBeVisible();
  });

  test("debe mostrar error con credenciales inválidas", async ({ page }) => {
    await page.route("**/api/auth/login", async (route) => {
      await route.fulfill({
        status: 401,
        body: JSON.stringify({ error: "Credenciales inválidas" }),
      });
    });

    await page.getByLabel("Email").fill("wrong@example.com");
    await page.getByLabel("Contraseña").fill("wrongpass");
    await page.getByRole("button", { name: "Iniciar sesión" }).click();

    await expect(page.getByRole("alert")).toContainText(
      "Credenciales inválidas",
    );
  });
});
```

### Page Object Model (Playwright)

```typescript
// tests/pages/login.page.ts
import { Page, Locator, expect } from "@playwright/test";

export class LoginPage {
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly submitButton: Locator;
  private readonly errorMessage: Locator;

  public constructor(private readonly page: Page) {
    this.emailInput = page.getByLabel("Email");
    this.passwordInput = page.getByLabel("Contraseña");
    this.submitButton = page.getByRole("button", { name: "Iniciar sesión" });
    this.errorMessage = page.getByRole("alert");
  }

  public async goto(): Promise<void> {
    await this.page.goto("/login");
  }

  public async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  public async expectError(message: string): Promise<void> {
    await expect(this.errorMessage).toContainText(message);
  }
}

// Uso en test
test("login error", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login("wrong@test.com", "wrongpass");
  await loginPage.expectError("Credenciales inválidas");
});
```

### Visual testing (Playwright)

```typescript
test("snapshot de la página de login", async ({ page }) => {
  await page.goto("/login");
  await expect(page).toHaveScreenshot("login-page.png", {
    maxDiffPixelRatio: 0.01, // Tolerancia del 1%
  });
});
```

---

## Parte 3 — Selectores (data-cy vs roles)

### Cypress: atributos `data-cy`

```html
<!-- Agregar data-cy a elementos que se testean -->
<input data-cy="email-input" type="email" />
<button data-cy="submit-button">Enviar</button>
```

```typescript
cy.get('[data-cy="email-input"]').type("test@example.com");
```

### Playwright: selectores semánticos (preferido)

```typescript
// Preferir selectores accesibles — testean accesibilidad a la vez
page.getByRole("button", { name: "Enviar" });
page.getByLabel("Email");
page.getByText("Bienvenido");
page.getByPlaceholder("Buscar...");
page.getByTestId("user-card"); // data-testid como fallback
```

---

## Parte 4 — CI Integration

### Cypress en GitHub Actions

```yaml
jobs:
  e2e-cypress:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - run: npm ci
      - uses: cypress-io/github-action@v6
        with:
          build: npm run build
          start: npm start
          wait-on: "http://localhost:3000"
```

### Playwright en GitHub Actions

```yaml
jobs:
  e2e-playwright:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Parte 5 — Escenarios minimos para SPA con guards y notificaciones

Para apps con rutas protegidas y redirects:

1. Intentar entrar a ruta protegida sin sesion -> redireccion esperada + notificacion esperada.
2. Intentar entrar a ruta publica estando logueado -> redireccion esperada + notificacion esperada.
3. Validar que notificaciones flotantes aparezcan y luego desaparezcan en el timeout esperado.

Para apps con audio de fondo:

4. Verificar que el audio arranca solo despues de gesto de usuario.
5. Verificar que audio persiste al navegar entre rutas.
6. Verificar que pausa manual no se revierte automaticamente.

---

## Reglas obligatorias

1. **Selectores estables**: `data-cy` (Cypress) o roles/labels semánticos (Playwright). Nunca clases CSS ni IDs frágiles.
2. **Page Object Model** para páginas con múltiples tests.
3. **Interceptar APIs** para tests determinísticos. No depender del backend real en CI.
4. **Un assert por concepto** (no por línea). Cada test verifica un escenario.
5. **Tests independientes**. No depender del orden de ejecución.
6. **Cleanup después de cada test**. Estado limpio.
7. **CI con screenshots/videos en fallo** para debugging.
8. **No `cy.wait(ms)` ni timeouts fijos**. Usar esperas implícitas o `cy.wait('@alias')`.

## Checklist

- [ ] Page Objects para páginas principales
- [ ] Selectores estables (data-cy / roles)
- [ ] APIs interceptadas en tests
- [ ] Tests independientes y aislados
- [ ] CI workflow configurado
- [ ] Screenshots/videos en fallos
- [ ] Sin waits fijos (timeouts mágicos)
- [ ] Cobertura de flujos críticos (login, CRUD, checkout)
