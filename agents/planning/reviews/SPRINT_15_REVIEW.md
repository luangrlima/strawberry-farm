# Sprint Review

## Evaluation of Sprint 14

### what worked
- a Sprint 14 atacou um problema real do projeto
- `src/systems/runtime.js` melhorou a organização geral do runtime
- `src/ui/render.js` ficou mais próximo de uma camada somente leitura
- `SAVE_VERSION` e a separação entre serialização e hidratação melhoraram a base de persistência

### critical findings
- `Alta` a centralização do runtime ficou incompleta
  - ainda existem caminhos diretos de `save` e `render` fora do coordenador em `src/main.js`, `src/state/persistence.js` e `src/systems/plots.js`
- `Alta` o QA da Sprint 14 não é suficiente para assinar esse refactor
  - a regressão oficial não foi executada e a suíte repo-native continua frágil para execução repetível
- `Alta` a previsibilidade do loop não está totalmente demonstrada
  - o tratamento da borda do `combo` é inconsistente entre clique e ticker
  - reload em borda de evento, helper, mercado e combo pode alterar a percepção de continuidade
- `Média` `tick()` e `reconcileState()` ainda duplicam responsabilidade
  - isso mantém risco de drift de comportamento em mudanças futuras
- `Média` `replaceState()`, `reset` e `prestige` não seguem exatamente o mesmo pipeline do restante do jogo
- `Baixa` a documentação operacional regrediu em portabilidade
  - o `README` ainda contém caminhos absolutos de outra máquina

### overall assessment
- direção correta
- execução parcial
- confiança insuficiente para considerar a Sprint 14 encerrada como hardening completo

## Recommended Next Sprint

### objective
Fechar as pendências da Sprint 14 com uma sprint curta de correção: remover caminhos residuais de `save` e `render` fora do runtime, unificar a semântica temporal dos fluxos críticos, tornar o Playwright reproduzível no próprio repositório e validar saves legados e bordas de timer antes de retomar qualquer evolução nova do jogo.

### priorities
- centralizar de fato `save`, `render`, `reset`, `prestige` e `replaceState`
- eliminar duplicação entre `tick()` e `reconcileState()`
- criar cobertura reproduzível para combo, helper, evento, mercado, prestígio e reset
- adicionar fixtures de save antigo e casos de reload na borda

### recommendation
- não iniciar nova feature antes de fechar essa correção curta
