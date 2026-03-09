# Implementation Notes

## Summary of actual code changes

- `src/systems/upgrades.js`
  - adicionou um modulo dedicado para upgrades com nivel
  - centralizou normalizacao de save antigo, custo do proximo tier e calculo de bonus acumulado

- `src/config/gameConfig.js`
  - trocou `Adubo rapido` e `Caixa premium` de configuracao binaria para configuracao com `baseCost`, `costStep` e `maxLevel`
  - preservou o impacto do nivel 1 e abriu progressao ate o nivel 3

- `src/state/createGameState.js`
  - iniciou `fertilizer` e `market` em nivel `0`

- `src/state/persistence.js`
  - migrou saves antigos com boolean para niveis numericos
  - manteve helper e plantio assistido como flags binarias

- `src/systems/plots.js`
  - passou a calcular crescimento pelo multiplicador acumulado do nivel do adubo

- `src/systems/market.js`
  - passou a calcular bonus de venda pelo nivel acumulado da caixa premium

- `src/main.js`
  - permitiu compras repetidas de `Adubo rapido` e `Caixa premium`
  - atualizou mensagens de compra para refletir o nivel atingido
  - manteve `stats.upgradesPurchased` contando cada tier comprado

- `public/index.html`
  - adicionou metadados visuais de nivel nos dois cards de upgrade com tiers
  - registrou o novo script de sistema de upgrades

- `public/style.css`
  - estilizou a nova linha de meta de nivel mantendo a densidade visual compacta

- `src/utils/dom.js`
  - coletou os novos elementos de meta de nivel

- `src/ui/render.js`
  - mostrou nivel atual, custo do proximo tier e efeito acumulado de cada melhoria
  - deixou explicito o ganho atual e o proximo passo nos cards de `adubo` e `caixa premium`

- `tests/playwright/strawberry-farm.e2e.js`
  - validou o nivel 1 e nivel 2 de `Adubo rapido`
  - validou o nivel 1 e nivel 2 de `Caixa premium`
  - tornou cenarios de combo e venda mais deterministas via estado controlado para evitar flakiness em `file://`

## Notes

- o sprint ficou dominante em UI/UX, mas exigiu suporte pequeno de gameplay e persistencia para viabilizar upgrades em niveis
- o limite em `3` niveis manteve a progressao clara e evitou escalada infinita no MVP atual
- a compatibilidade com saves antigos foi tratada no hydrate para nao quebrar progresso ja salvo
