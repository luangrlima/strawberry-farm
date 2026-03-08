# Relatório de QA: Sprint 6

## Escopo testado
- compra e ativação do `Farm Helper`
- colheita automática de canteiros prontos
- interação entre helper e combo
- interação entre helper e evento `Chuva leve`
- persistência do helper após reload
- progressão, economia e reset completo

## Cenários executados
- renderização inicial do HUD com helper desligado
- compra do helper após progressão econômica normal
- colheita automática de um canteiro pronto
- validação de que o helper não aumenta `systems.combo.count`
- persistência do helper no save/load
- helper colhendo após reload
- convivência com mercado, eventos, upgrades e expansão

## Bugs encontrados durante o QA
- não houve bug funcional bloqueante no jogo após a implementação final

## Fragilidades encontradas no QA automatizado
- a checagem inicial do combo por visibilidade da UI era frágil porque dependia de estado transitório anterior
- a validação foi corrigida para observar o estado real do combo em `systems.combo`

## Resultado final
- o `Farm Helper` melhora conforto sem quebrar o loop principal
- a automação continua legível e limitada
- save/load permaneceu consistente
- combo continuou manual
- economia continuou curta e recompensadora

## Evidência
- teste Playwright executado em `file://`
- screenshot final: `tests/artifacts/strawberry-farm-test-20260308-084608-323.png`
