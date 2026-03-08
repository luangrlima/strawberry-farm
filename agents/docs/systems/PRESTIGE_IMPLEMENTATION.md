# Implementação do Prestígio

## Status do documento
Este é um documento histórico do Sprint 7.

Na época da implementação, o runtime ainda estava concentrado na raiz. Depois do Sprint 9, os equivalentes atuais passaram a ser:
- `src/config/gameConfig.js`
- `public/index.html`
- `public/style.css`
- `src/main.js`
- `src/systems/prestige.js`
- `src/ui/render.js`

## Arquivos afetados
- `src/config/gameConfig.js`
- `public/index.html`
- `public/style.css`
- `src/main.js`
- `src/systems/prestige.js`
- `src/ui/render.js`
- `README.md`
- `tests/playwright/strawberry-farm.e2e.js`

## Estratégia
- manter prestígio como um único multiplicador permanente
- preservar o sistema dentro de `state.prestige`
- usar uma rotina dedicada de reset de prestígio
- reaproveitar o save/load atual, sem infraestrutura nova

## Estrutura proposta
- `state.prestige.level`
- `state.prestige.sellBonusMultiplier`
- `state.systems.prestige.unlockShownForLevel`

## Mudanças técnicas
- adicionar config de prestígio
- criar helpers:
  - requisito atual
  - disponibilidade de prestígio
  - bônus atual
  - bônus aplicado na venda
- integrar prestígio na venda final
- criar `prestigeFarm()` com confirmação
- manter `resetGame()` como wipe completo, incluindo prestígio

## Critérios técnicos
- save/load confiável
- botão só habilita quando o requisito é atingido
- prestígio não quebra upgrades, helper, mercado ou eventos
- bônus permanente continua fácil de rastrear na UI
