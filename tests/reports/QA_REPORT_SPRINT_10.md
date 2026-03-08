# QA Report

## Results of tests performed

### gameplay
- plantio, crescimento, colheita e venda continuam funcionando
- combo de colheita permaneceu funcional
- helper, mercado, eventos e prestígio seguiram operando sem regressão

### persistence
- save/load continuou estável
- estados de evento, combo curto, helper, expansão e prestígio persistiram corretamente
- reset total voltou ao estado inicial esperado

### UI
- a tela principal ficou mais compacta e escaneável no desktop
- recursos principais, ações primárias, fazenda e banners centrais permaneceram visíveis acima da dobra no cenário validado
- mobile continuou funcional com layout empilhado

### regressions
- regressão automatizada executada com Playwright em `file://`
- resultado final: aprovado
- screenshot final: `tests/artifacts/strawberry-farm-test-20260308-120425-931.png`

## Issues found during QA

1. o teste ainda esperava o texto antigo `Venda melhorada` após a compactação da copy
   - fix: atualizar a asserção para `Venda melhor`

2. o reset ainda restaurava a mensagem inicial antiga `Plante seus primeiros morangos.`
   - fix: alinhar `createInitialState()` com a nova copy curta `Comece plantando.`

## Final status

- bugs críticos: nenhum
- bugs médios: nenhum
- regressões funcionais: nenhuma após os ajustes
