# Testes

## Estrutura
- `playwright/strawberry-farm.e2e.js`: regressão automatizada principal
- `manual/TEST_SCENARIOS.md`: cenários manuais
- `reports/`: relatórios de QA por sprint e sistema
- `artifacts/`: screenshots versionadas

Relatório mais recente:
- `reports/QA_REPORT.md`
- vigente em 2026-03-09: `reports/QA_REPORT_SPRINT_13.md`

## Execução
Exemplo com `playwright-skill`:

```bash
cd <caminho-do-playwright-skill>
PROJECT_ROOT="<caminho-absoluto-do-projeto>"
TARGET_URL="file://$PROJECT_ROOT/public/index.html" node run.js "$PROJECT_ROOT/tests/playwright/strawberry-farm.e2e.js"
```

## Evidências
- sucesso: `tests/artifacts/strawberry-farm-test-YYYYMMDD-HHMMSS-sss.png`
- erro: `tests/artifacts/strawberry-farm-test-error-YYYYMMDD-HHMMSS-sss.png`
- cada execução gera um arquivo novo
