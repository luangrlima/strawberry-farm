# Testes

## Estrutura
- `playwright/strawberry-farm.e2e.js`: fluxo automatizado principal do jogo
- `docs/TEST_SCENARIOS.md`: cenários manuais e base para automação
- `docs/QA_REPORT.md`: relatório de QA do ciclo de polimento
- `docs/QA_REPORT_V2.md`: relatório de QA após o sprint de estabilidade
- `docs/QA_REPORT_MARKET.md`: relatório de QA do sistema de mercado
- `docs/QA_REPORT_SPRINT_7.md`: relatório de QA do sistema de prestígio
- `docs/QA_REPORT_SPRINT_8.md`: relatório de QA do redesenho horizontal da interface
- `artifacts/`: screenshots e evidências geradas pelos testes

## Objetivo
Centralizar automação, cenários e relatórios de QA em um único lugar do projeto.

## Execução
Exemplo com `playwright-skill`:

```bash
cd <caminho-do-playwright-skill>
PROJECT_ROOT="<caminho-absoluto-do-projeto>"
TARGET_URL="file://$PROJECT_ROOT/index.html" node run.js "$PROJECT_ROOT/tests/playwright/strawberry-farm.e2e.js"
```

## Evidências
- o teste principal salva a screenshot final em um arquivo versionado no formato `tests/artifacts/strawberry-farm-test-YYYYMMDD-HHMMSS-sss.png`
- em caso de falha, a screenshot de erro fica em um arquivo versionado no formato `tests/artifacts/strawberry-farm-test-error-YYYYMMDD-HHMMSS-sss.png`
- cada execução gera um novo registro e não sobrescreve a evidência anterior
