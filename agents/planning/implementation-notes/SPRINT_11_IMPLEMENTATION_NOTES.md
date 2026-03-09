# Implementation Notes

## Summary of actual code changes

- `src/config/gameConfig.js`
  - adicionou o upgrade `helperPlanting` com custo e descricao de suporte

- `src/state/createGameState.js`
  - passou a inicializar `upgrades.helperPlanting`

- `src/state/persistence.js`
  - hidratou e preservou o novo upgrade no save/load

- `src/systems/helper.js`
  - manteve a prioridade de auto-colheita
  - quando nao ha colheita no ciclo, passou a plantar 1 canteiro vazio se o upgrade de plantio assistido estiver ativo e houver sementes
  - registrou feedback textual separado para plantio automatico

- `src/systems/plots.js`
  - extraiu plantio por origem para suportar acao manual e do helper sem misturar mensagens

- `src/main.js`
  - adicionou a compra do upgrade `Plantio assistido`
  - manteve o helper como prerequisito explicito para liberar a melhoria

- `src/ui/render.js`
  - atualizou botoes, descricoes e faixa do helper para indicar quando o plantio assistido esta ativo
  - reforcou que a melhoria usa sementes do estoque do jogador

- `src/utils/dom.js`
  - coletou os novos elementos da UI do helper

- `public/index.html`
  - adicionou um card de upgrade para `Bolsa de sementes`
  - permitiu atualizar dinamicamente o titulo da faixa do helper

- `tests/playwright/strawberry-farm.e2e.js`
  - ampliou a regressao do helper para cobrir compra do upgrade, plantio automatico, prioridade da colheita, persistencia e ausencia de combo
  - removeu dependencia desnecessaria de timing real em partes frageis do QA

## Notes

- a automacao nova foi mantida deliberadamente parcial: o jogador ainda precisa comprar sementes e vender morangos
- o helper nao recebeu compra automatica nem venda automatica para preservar sessoes curtas com agencia manual
