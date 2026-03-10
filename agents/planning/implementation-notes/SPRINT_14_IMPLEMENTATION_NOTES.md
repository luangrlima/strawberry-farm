# Implementation Notes

## Summary of actual code changes

- `src/systems/runtime.js`
  - criou um coordenador único para `commit`, `tick`, renderização e sincronização de UI transitória
  - concentrou toast de milestone, sincronização de efeitos de colheita e atualização do relógio interno

- `src/main.js`
  - deixou de concentrar a lógica de commit, ticker e render
  - passou a delegar ações do jogador, debug helpers e autosave ao runtime central

- `src/ui/render.js`
  - deixou de mutar estado do jogo
  - passou a consumir `now` já consolidado pelo runtime para timers e feedback visual

- `src/ui/farmGrid.js`
  - passou a renderizar progresso, labels e hints com `now` injetado

- `src/state/createGameState.js`
  - passou a aceitar `now` explícito para inicialização previsível do mercado

- `src/state/persistence.js`
  - adicionou `SAVE_VERSION`
  - separou `serializeState` de `hydrateState`
  - passou a salvar com versão explícita sem quebrar saves antigos

- `src/systems/events.js`
  - passou a aceitar `now` em ativação, aceleração de plots e expiração de evento

- `src/systems/market.js`
  - passou a aceitar `now` explícito na atualização temporal do mercado

- `src/systems/combo.js`
  - passou a aceitar `now` explícito em combo e expiração

- `src/systems/helper.js`
  - passou a aceitar `now` explícito em ciclos, ações e timestamps do helper

- `src/systems/plots.js`
  - passou a aceitar `now` explícito em crescimento, colheita, plantio e efeitos transitórios

- `src/systems/progression.js`
  - removeu a dependência direta de `render` para notificação de prestígio

- `public/index.html`
  - registrou o novo `src/systems/runtime.js` antes da UI e do `main`

## Notes

- a mudança manteve o gameplay atual como prioridade e tratou apenas acoplamento de runtime
- o `render` deixou de ser responsável por sincronizar estado e passou a apenas ler o snapshot atual
- a suite Playwright existente ainda não foi executada ponta a ponta dentro do projeto porque o repo não traz dependência local instalada
