# Fazenda de Morangos MVP+

## Visão geral
`Strawberry Farm` é um jogo pequeno de navegador feito com HTML, CSS e JavaScript puros. O loop principal continua simples: comprar sementes, plantar, esperar, colher, vender e reinvestir.

O jogo atual inclui:
- plantio, crescimento e colheita
- combo de colheita
- mercado dinâmico
- eventos aleatórios simples
- upgrades
- expansão `3x3` -> `4x4`
- `Farm Helper`
- upgrade de plantio assistido para o `Farm Helper`
- prestígio `Strawberry Knowledge`
- save/load com `localStorage`
- HUD compacto em tela única

## Runtime
O runtime jogável agora está separado da documentação e do workflow:

- `public/index.html`: entrypoint real do jogo
- `public/style.css`: layout e visual
- `src/config/gameConfig.js`: valores do jogo
- `src/state/*`: estado inicial e persistência
- `src/systems/*`: regras e sistemas de gameplay
- `src/ui/*`: grid e renderização
- `src/utils/*`: utilitários

O arquivo [index.html](index.html) na raiz foi mantido como redirecionamento de compatibilidade para [public/index.html](public/index.html).

## Estrutura do repositório
- `public/`: arquivos estáticos do jogo
- `src/`: runtime JavaScript
- `agents/prompts/`: prompts dos agentes
- `agents/planning/`: análises, planos, notas de implementação e reviews de sprint
- `agents/docs/`: documentação de sistemas, economia e UI
- `docs/`: documentação arquitetural estável
- `tests/`: automação, cenários manuais, relatórios e evidências

## Arquitetura
Documentos principais:
- [docs/ARCHITECTURE_PROPOSAL.md](docs/ARCHITECTURE_PROPOSAL.md)
- [docs/CODE_SPLIT_PLAN.md](docs/CODE_SPLIT_PLAN.md)
- [docs/REPO_ORGANIZATION_PLAN.md](docs/REPO_ORGANIZATION_PLAN.md)
- [docs/ARCHITECTURE_IMPLEMENTATION.md](docs/ARCHITECTURE_IMPLEMENTATION.md)

## Desenvolvimento
Prompts e material de coordenação do projeto:
- [agents/prompts/full-game-director.md](agents/prompts/full-game-director.md)
- [agents/prompts/post-audit-correction-sprint-master.md](agents/prompts/post-audit-correction-sprint-master.md)
- [agents/prompts/product-director.md](agents/prompts/product-director.md)
- [agents/prompts/game-designer.md](agents/prompts/game-designer.md)
- [agents/prompts/economy-balance-designer.md](agents/prompts/economy-balance-designer.md)
- [agents/prompts/gameplay-developer.md](agents/prompts/gameplay-developer.md)
- [agents/prompts/ui-ux-developer.md](agents/prompts/ui-ux-developer.md)
- [agents/prompts/qa-playtest-agent.md](agents/prompts/qa-playtest-agent.md)

Artefatos de sprint:
- `agents/planning/sprint-plans/`: planos por sprint
- `agents/planning/implementation-notes/`: notas de implementação por sprint
- `agents/planning/reviews/`: reviews por sprint

## Testes
Visão geral em [tests/README.md](tests/README.md).

Arquivos principais:
- [tests/playwright/strawberry-farm.smoke.js](tests/playwright/strawberry-farm.smoke.js)
- [tests/playwright/strawberry-farm.e2e.js](tests/playwright/strawberry-farm.e2e.js)
- [tests/fixtures/legacy-save-v1.json](tests/fixtures/legacy-save-v1.json)
- [tests/manual/TEST_SCENARIOS.md](tests/manual/TEST_SCENARIOS.md)
- [tests/reports/](tests/reports/)
- [tests/artifacts/](tests/artifacts/)

Execução repo-native de QA:
- `npm install`
- `npm run test:smoke`
- `npm run test:e2e`

Relatório mais recente:
- [tests/reports/QA_REPORT.md](tests/reports/QA_REPORT.md)
- vigente em 2026-03-10: [tests/reports/QA_REPORT_SPRINT_16.md](tests/reports/QA_REPORT_SPRINT_16.md)

Regra:
- `tests/reports/QA_REPORT_SPRINT_<N>.md` é o artefato versionado do sprint
- `tests/reports/QA_REPORT.md` aponta para o QA vigente

## Execução do jogo
Abra [public/index.html](public/index.html) no navegador.

Se preferir, [index.html](index.html) também funciona como entrypoint compatível.
