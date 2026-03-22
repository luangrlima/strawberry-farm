# Testes

## Estrutura
- `playwright/strawberry-farm.smoke.js`: subset mínimo repo-native para regressão rápida
- `playwright/strawberry-farm.e2e.js`: regressão automatizada principal
- `fixtures/legacy-save-v1.json`: fixture legada para validar compatibilidade de save/load
- `manual/TEST_SCENARIOS.md`: cenários manuais
- `reports/`: relatórios de QA por sprint e sistema
- `artifacts/`: screenshots versionadas

Relatório mais recente:
- `reports/QA_REPORT.md`
- vigente em 2026-03-22: `reports/QA_REPORT_SPRINT_20.md`

## Execução
Instalação mínima:

```bash
npm install
```

Execução pelo próprio repositório:

```bash
npm run test:smoke
```

Regressão principal:

```bash
npm run test:e2e
```

Execução com interface visível:

```bash
npm run test:e2e:headed
```

Observações:
- por padrão o script roda em `headless`
- use `PW_HEADLESS=false` para depuração visual
- use `PW_SLOW_MO=100` ou outro valor apenas quando quiser inspeção manual
- use `PW_ARGS="--no-sandbox --disable-dev-shm-usage"` para ajustar flags do Chromium quando necessário
- para apontar para outro runtime, use `PROJECT_ROOT` e `TARGET_URL`

## Evidências
- sucesso: `tests/artifacts/strawberry-farm-test-YYYYMMDD-HHMMSS-sss.png`
- sucesso smoke: `tests/artifacts/strawberry-farm-smoke-YYYYMMDD-HHMMSS-sss.png`
- erro: `tests/artifacts/strawberry-farm-test-error-YYYYMMDD-HHMMSS-sss.png`
- erro smoke: `tests/artifacts/strawberry-farm-smoke-error-YYYYMMDD-HHMMSS-sss.png`
- cada execução gera um arquivo novo
