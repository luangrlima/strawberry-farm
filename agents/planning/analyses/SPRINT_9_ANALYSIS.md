# Análise do Sprint 9

## Leitura completa do repositório
- O runtime do jogo estava concentrado em quatro arquivos na raiz: `index.html`, `style.css`, `config.js` e `game.js`.
- `game.js` acumulava bootstrap, persistência, regras de economia, eventos, combo, helper, prestígio, metas, renderização, criação do grid, ticker, autosave e helpers de debug.
- A raiz também misturava documentação estável, prompts de agentes, planos de sprint, reviews e relatórios de QA.

## Estrutura anterior
- Runtime de navegador:
  - `index.html`
  - `style.css`
  - `config.js`
  - `game.js`
- Workflow de agentes e sprint:
  - vários `SPRINT_*`, `AUTOMATION_*`, `PRESTIGE_*`, `MARKET_SYSTEM.md`, `PLANS.md`, `STABILITY_SPRINT.md`
  - prompts em `agents/`
- Testes:
  - automação em `tests/playwright`
  - cenários em `tests/manual`
  - relatórios em `tests/reports`

## Problemas arquiteturais encontrados

### 1. Responsabilidade excessiva em `game.js`
- estado inicial
- hidratação e save/load
- lógica dos canteiros
- lógica do mercado
- lógica de eventos
- lógica de combo
- lógica do helper
- lógica de prestígio
- progressão e recompensas
- renderização de HUD, banners, metas e grid
- bootstrap do app

Isso dificultava leitura, testes e mudanças isoladas.

### 2. Raiz do repositório ruidosa
- o produto jogável e o processo de desenvolvimento ocupavam o mesmo nível
- encontrar “o que roda no navegador” exigia filtrar muitos artefatos históricos

### 3. Separação conceitual insuficiente
- prompts de agentes, análises, planos e reviews são ativos de workflow
- runtime do jogo é o produto
- relatórios de QA pertencem ao domínio de testes

## Classificação dos arquivos

### Runtime do jogo
- `public/index.html`
- `public/style.css`
- `src/config/*`
- `src/state/*`
- `src/systems/*`
- `src/ui/*`
- `src/utils/*`
- `src/main.js`

### Workflow de agentes
- `agents/prompts/*`
- `agents/planning/*`
- `agents/docs/*`

### Documentação estável
- `docs/ARCHITECTURE_PROPOSAL.md`
- `docs/ARCHITECTURE_IMPLEMENTATION.md`
- `docs/CODE_SPLIT_PLAN.md`
- `docs/REPO_ORGANIZATION_PLAN.md`

### Testes
- `tests/playwright/*`
- `tests/manual/*`
- `tests/reports/*`
- `tests/artifacts/*`

## Direção recomendada
- mover o entrypoint visual para `public/`
- manter o runtime funcional e sem framework em `src/`
- usar módulos simples por responsabilidade, carregados em ordem por `script`
- preservar comportamento e seletores da UI
- deixar a raiz mínima: `AGENTS.md`, `README.md`, `index.html`

## Módulos prioritários para separação
- configuração: `src/config/gameConfig.js`
- estado e persistência: `src/state/*`
- sistemas de jogo: `src/systems/*`
- renderização e grid: `src/ui/*`
- formatação e DOM: `src/utils/*`

## Riscos identificados
- quebrar `file://` ao usar `type="module"` ou imports ES em navegador local
- regressão em save/load por mudança de boot
- regressão no Playwright por mudança de paths
- divergência entre layout/seletores antigos e novos scripts

## Mitigação escolhida
- manter scripts clássicos em ordem, sem framework e sem bundler
- preservar a forma do estado salvo
- manter os mesmos `id`s e classes do DOM
- manter `window.__strawberryFarmDebug`
- manter `index.html` na raiz como redirecionamento compatível
