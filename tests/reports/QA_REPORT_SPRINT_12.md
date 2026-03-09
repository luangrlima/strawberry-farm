# QA Report

## Results of tests performed

### UI
- a HUD foi redesenhada com foco maior no tabuleiro central
- os cards de recurso ficaram mais visuais e compactos
- mercado, evento e prestigio ganharam uma coluna lateral mais consistente
- a tela inicial voltou a caber no viewport desktop alvo sem scroll global excessivo
- a leitura mobile continuou razoavel segundo a regressao principal

### gameplay regression
- plantio, colheita, venda e save/load continuaram funcionando
- combo, eventos, upgrades, expansao 4x4, helper, plantio assistido e prestigio seguiram aprovados
- reset e progressao final continuaram sem regressao funcional

### evidence
- regressao automatizada executada com Playwright em `file://`
- resultado final: aprovado
- screenshot final versionada: `tests/artifacts/strawberry-farm-test-20260309-121723-047.png`

## Issues found during QA

1. o redesign inicial passou a exigir scroll vertical no desktop
   - fix: conter a altura do shell no desktop, comprimir o palco central e mover excesso da coluna lateral para rolagem interna

2. parte da copy dinamica mudou alem do que a regressao aceitava
   - fix: restaurar strings contratuais de meta, venda, helper plantio e prestigio mantendo o redesign visual

3. a execucao Playwright em `file://` salvou screenshots fora do diretório oficial do projeto
   - fix aplicado no sprint: copiar a evidencia final para `tests/artifacts/`

## Final status

- bugs criticos: nenhum
- bugs medios: nenhum
- regressões funcionais: nenhuma apos os ajustes
- status final: aprovado
