# Learning — CI: `format:check` bloqueante

## Contexto

Se ajustó el workflow de CI para que el chequeo de formato deje de ser informativo y pase a ser **bloqueante**.

## Qué se cambió

- Archivo: `.github/workflows/ci.yml`
- En el job `quality`, step de formato:
  - Se eliminó `continue-on-error: true`.
  - Se mantuvo `run: npm run format:check`.
  - Se renombró el step a `Format check (bloqueante)` para dejar explícita la intención.

## Resultado esperado en pipeline

Si `npm run format:check` falla:

- falla el job `quality`;
- por dependencia (`needs: quality`), no continúa `e2e-smoke`.

## Validación local

Se ejecutó:

```bash
npm run format:check
```

Salida:

`All matched files use Prettier code style!`

## Referencia oficial

- GitHub Actions `continue-on-error`:
  - https://docs.github.com/actions/using-workflows/workflow-syntax-for-github-actions#jobsjob_idstepscontinue-on-error
