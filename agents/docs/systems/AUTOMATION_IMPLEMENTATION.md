# Implementação da Automação

## Status do documento
Este é um documento histórico do Sprint 6.

Na época da implementação, o runtime ainda estava concentrado na raiz. Depois do Sprint 9, os equivalentes atuais passaram a ser:
- `src/config/gameConfig.js`
- `public/index.html`
- `public/style.css`
- `src/main.js`
- `src/systems/helper.js`
- `src/ui/render.js`

## Arquivos afetados
- `src/config/gameConfig.js`
- `public/index.html`
- `public/style.css`
- `src/main.js`
- `src/systems/helper.js`
- `src/ui/render.js`
- `README.md`
- `tests/playwright/strawberry-farm.e2e.js`

## Estratégia
- reutilizar `systems` para persistir o helper
- manter uma única lógica de colheita, diferenciando origem manual vs automática
- executar a automação dentro do ticker já existente
- evitar timers paralelos ou workers

## Mudanças planejadas
- adicionar configuração do helper em `src/config/gameConfig.js`
- adicionar botão/card de compra e HUD de automação
- persistir:
  - helper comprado
  - próximo ciclo do helper
  - último texto de ação do helper
- criar `runFarmHelper()` para:
  - respeitar o intervalo
  - colher no máximo 1 canteiro pronto por ciclo
  - avançar o próximo ciclo
- adaptar a lógica de colheita para aceitar origem manual ou automática

## Critérios técnicos
- helper não deve quebrar combo
- helper deve sobreviver a reload
- helper não deve colher canteiro duas vezes
- helper deve manter o jogo funcional em `file://`
