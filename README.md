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

O arquivo [index.html](/Users/wiser/projects/strawberry-farm/index.html) na raiz foi mantido como redirecionamento de compatibilidade para [public/index.html](/Users/wiser/projects/strawberry-farm/public/index.html).

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
- [docs/ARCHITECTURE_PROPOSAL.md](/Users/wiser/projects/strawberry-farm/docs/ARCHITECTURE_PROPOSAL.md)
- [docs/CODE_SPLIT_PLAN.md](/Users/wiser/projects/strawberry-farm/docs/CODE_SPLIT_PLAN.md)
- [docs/REPO_ORGANIZATION_PLAN.md](/Users/wiser/projects/strawberry-farm/docs/REPO_ORGANIZATION_PLAN.md)
- [docs/ARCHITECTURE_IMPLEMENTATION.md](/Users/wiser/projects/strawberry-farm/docs/ARCHITECTURE_IMPLEMENTATION.md)

## Desenvolvimento
Prompts e material de coordenação do projeto:
- [agents/prompts/full-game-director.md](/Users/wiser/projects/strawberry-farm/agents/prompts/full-game-director.md)
- [agents/prompts/product-director.md](/Users/wiser/projects/strawberry-farm/agents/prompts/product-director.md)
- [agents/prompts/game-designer.md](/Users/wiser/projects/strawberry-farm/agents/prompts/game-designer.md)
- [agents/prompts/economy-balance-designer.md](/Users/wiser/projects/strawberry-farm/agents/prompts/economy-balance-designer.md)
- [agents/prompts/gameplay-developer.md](/Users/wiser/projects/strawberry-farm/agents/prompts/gameplay-developer.md)
- [agents/prompts/ui-ux-developer.md](/Users/wiser/projects/strawberry-farm/agents/prompts/ui-ux-developer.md)
- [agents/prompts/qa-playtest-agent.md](/Users/wiser/projects/strawberry-farm/agents/prompts/qa-playtest-agent.md)

Artefatos de sprint:
- `agents/planning/sprint-plans/`: planos por sprint
- `agents/planning/implementation-notes/`: notas de implementação por sprint
- `agents/planning/reviews/`: reviews por sprint

## Testes
Visão geral em [tests/README.md](/Users/wiser/projects/strawberry-farm/tests/README.md).

Arquivos principais:
- [tests/playwright/strawberry-farm.e2e.js](/Users/wiser/projects/strawberry-farm/tests/playwright/strawberry-farm.e2e.js)
- [tests/manual/TEST_SCENARIOS.md](/Users/wiser/projects/strawberry-farm/tests/manual/TEST_SCENARIOS.md)
- [tests/reports/](/Users/wiser/projects/strawberry-farm/tests/reports)
- [tests/artifacts/](/Users/wiser/projects/strawberry-farm/tests/artifacts)

Relatório mais recente:
- [tests/reports/QA_REPORT.md](/Users/wiser/projects/strawberry-farm/tests/reports/QA_REPORT.md)
- vigente em 2026-03-09: [tests/reports/QA_REPORT_SPRINT_13.md](/Users/wiser/projects/strawberry-farm/tests/reports/QA_REPORT_SPRINT_13.md)

Regra:
- `tests/reports/QA_REPORT_SPRINT_<N>.md` é o artefato versionado do sprint
- `tests/reports/QA_REPORT.md` aponta para o QA vigente

## Execução do jogo
Abra [public/index.html](/Users/wiser/projects/strawberry-farm/public/index.html) no navegador.

Se preferir, [index.html](/Users/wiser/projects/strawberry-farm/index.html) também funciona como entrypoint compatível.
