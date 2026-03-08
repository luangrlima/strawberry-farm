# Relatório de QA V2

## 1. Bugs críticos
- nenhum bug crítico encontrado após o Sprint 4

## 2. Bugs médios
- nenhum bug médio reproduzido no fluxo principal

## 3. Problemas de design
- o jogo continua dependente de bastante texto em tela, então ainda existe risco de sobrecarga cognitiva se novos sistemas forem adicionados sem substituição de UI

## 4. Melhorias de polimento aplicadas
- painel de ajuda rápida com persistência
- feedback textual do efeito do evento ativo
- destaque visual no HUD para atributos afetados por eventos
- badges de ação nos canteiros
- indicadores de progresso mais claros para meta final, canteiros prontos e duração do evento
- feedback visual dedicado para conclusão de metas
- ticker com atualização mais leve para melhorar responsividade visual

## Escopo verificado
- onboarding e ajuda
- economia base e rebalanceada
- expansão da fazenda
- eventos e feedback visual
- timing de crescimento com evento
- save/load de estado completo
- progresso e metas
- reset completo

## Cenários executados
- renderização inicial e HUD
- ocultar/reabrir ajuda com persistência
- plantio e retomada após reload
- expansão para `4x4`
- evento `Feira local` com desconto de semente
- evento `Chuva leve` com aceleração de crescimento
- evento `Sol forte` com bônus de venda
- progressão final até `35` moedas
- reset e restauração completa

## Resultado final
- o fluxo principal permaneceu estável
- a economia continuou rápida após o rebalanceamento
- o feedback de evento ficou mais explícito
- a interface ficou mais responsiva durante timers e eventos
- save/load permaneceu consistente com ajuda, expansão, eventos, upgrades e metas

## Evidência
- teste Playwright executado em `file://`
- screenshot final: `/tmp/strawberry-farm-test.png`
