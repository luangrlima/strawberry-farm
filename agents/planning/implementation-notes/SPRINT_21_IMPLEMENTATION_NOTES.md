# Sprint 21 — Notas de Implementacao

## Tipo de sprint
`ui-sprint-master` — Layout, clareza e usabilidade mobile

## Resumo
O sprint restaurou a navegação mobile transformando o layout em fluxo vertical real nas quebras responsivas e corrigiu a sidebar de gestão para que `Metas`, `Melhorias` e `Guia` se comportem como abas de fato.

---

## Implementação 1 — Shell mobile sem áreas presas

### Arquivo principal
- `public/style.css`

### Mudanças
- em `1180px` e abaixo, `panel` e `game-shell` deixam de usar altura travada
- `zone--right` passa a usar fluxo normal sem `overflow: auto` no responsivo
- em `860px` e abaixo, as três zonas passam a ocupar uma única coluna
- a ordem mobile foi reorganizada para priorizar fazenda, depois recursos/ações, depois gestão
- em `560px` e abaixo, o painel ocupa a largura total e remove ornamentos fixos que consumiam espaço útil

### Decisão
- o jogo continua single-page, mas no mobile agora se comporta como documento contínuo, não como dashboard desktop comprimido

---

## Implementação 2 — Tabs da gestão corrigidas

### Arquivos
- `public/index.html`
- `src/ui/render.js`

### Mudanças
- `#sidebarUpgradesTab` foi normalizado para `role="tab"`
- `#upgradesPanel` passou a usar `management-panel` e `hidden` inicial
- `renderSidebarTabs()` agora controla `goals`, `upgrades` e `guide` com a mesma rotina

### Impacto
- o botão `Melhorias` agora realmente exibe só o painel de melhorias
- o teste end-to-end precisou ser ajustado para abrir a aba correta antes de clicar nos botões de upgrade

---

## Implementação 3 — Densidade e navegação em tela estreita

### Arquivo
- `public/style.css`

### Mudanças
- `management-tabs` e `progress-strip` ganharam comportamento sticky em mobile para reduzir perda de contexto
- `header-pills`, `legend`, `help-steps` e tags de evento quebram melhor em telas estreitas
- grupos como `stats`, `quick-status`, `actions`, `upgrades` e `goal-list` passam para 1 coluna em `560px`
- altura dos plots foi recalibrada para caber melhor sem empurrar o restante da interface

---

## Testes ajustados

### Arquivo
- `tests/playwright/strawberry-farm.e2e.js`

### Mudanças
- adicionada helper `openUpgradesTab(page)`
- cenários de expansão, adubo, mercado e helper agora navegam pela aba `Melhorias` antes de interagir

### Razão
- antes do sprint, o e2e dependia implicitamente do bug em que o painel de melhorias permanecia visível mesmo fora da aba ativa

---

## Validação executada
- `node --check src/main.js`
- `node --check src/ui/render.js`
- `node --check src/utils/dom.js`
- `node --check tests/playwright/strawberry-farm.e2e.js`
- `npm run test:smoke`
- `npm run test:e2e`

## Evidências
- `tests/artifacts/strawberry-farm-smoke-20260330-224308-980.png`
- `tests/artifacts/strawberry-farm-test-20260330-224440-099.png`
