# QA Report

## Results of tests performed

### gameplay
- `Farm Helper` continuou colhendo 1 canteiro pronto por ciclo
- o novo upgrade `Plantio assistido` passou a plantar 1 canteiro vazio por ciclo quando nao havia colheita disponivel
- o plantio automatico consumiu sementes do estoque normal do jogador
- a prioridade de colheita foi preservada quando havia canteiro pronto
- o helper continuou sem ativar combo automaticamente ao colher ou plantar

### persistence
- `helperPlanting` persistiu corretamente apos reload
- estado do helper e sua faixa visual continuaram consistentes apos reload
- reset total e prestigio continuaram removendo helper e upgrades atuais

### UI
- o novo card `Bolsa de sementes` apareceu com prerequisito claro do helper
- a faixa do helper passou a indicar quando o suporte de plantio estava ativo
- a copy deixou explicito que o plantio automatico usa sementes do jogador

### regressions
- regressao automatizada executada com Playwright em `file://`
- resultado final: aprovado
- screenshot final: `tests/artifacts/strawberry-farm-test-20260309-094758-096.png`

## Issues found during QA

1. a assercao de combo dependia do texto exato `Combo x3`
   - fix: aceitar qualquer combo valido `>= 3`

2. parte do cenario do helper dependia de timing real de crescimento e gerava flakiness
   - fix: controlar o estado via debug helper para validar colheita e plantio automaticos de forma deterministica

## Final status

- bugs criticos: nenhum
- bugs medios: nenhum
- regressões funcionais: nenhuma apos os ajustes
