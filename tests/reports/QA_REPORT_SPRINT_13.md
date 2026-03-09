# QA Report

## Results of tests performed

### UI
- os cards de `Adubo rapido` e `Caixa premium` passaram a mostrar `nivel atual`, `proximo tier` e `efeito acumulado`
- a nova informacao de nivel entrou na HUD sem aumentar scroll ou quebrar o layout desktop/mobile validado no sprint anterior
- os botoes de compra passaram a comunicar claramente quando ha proximo nivel disponivel e quando o upgrade chegou ao nivel maximo

### gameplay regression
- `Adubo rapido` agora aceita compras multiplas e reduziu o tempo de crescimento de forma acumulada
- `Caixa premium` agora aceita compras multiplas e somou bonus de venda por nivel sobre mercado e eventos
- helper, plantio assistido, expansao, eventos, combo, prestigio e reset continuaram funcionando sem regressao funcional

### persistence
- saves antigos com upgrades booleanos continuaram carregando como nivel `1`
- saves novos persistiram corretamente os niveis numericos de `adubo` e `caixa premium`
- prestigio e reset total restauraram os upgrades em niveis para o estado inicial

### evidence
- regressao automatizada executada com Playwright em `file://`
- resultado final: aprovado
- screenshot final versionada: `tests/artifacts/strawberry-farm-test-20260309-154424-495.png`

## Issues found during QA

1. a regressao antiga dependia de crescimento natural para validar combo e venda
   - fix aplicado: cenarios de combo e venda passaram a usar estado controlado quando o objetivo do teste era validar economia e UI, reduzindo flakiness

2. a expectativa antiga de venda durante `Sol forte` ficou desatualizada com `Caixa premium` em nivel 2
   - fix aplicado: a suite passou a validar o novo total de venda acumulado pelo nivel atual da melhoria

## Final status

- bugs criticos: nenhum
- bugs medios: nenhum
- regressões funcionais: nenhuma apos os ajustes
- status final: aprovado
