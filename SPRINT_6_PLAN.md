# Sprint 6 Plan

## Sprint goal
Introduzir uma automação leve com o `Farm Helper`, melhorando conforto e sensação de progresso sem substituir a interação principal do jogador.

## Features included
- compra única do `Farm Helper`
- colheita automática global de canteiros prontos
- intervalo fixo e legível de automação
- persistência do helper no save/load
- feedback visual do helper no HUD e nos canteiros colhidos automaticamente
- integração segura com eventos, mercado e upgrades existentes

## Features excluded
- plantio automático
- venda automática
- múltiplos helpers
- árvore de automação
- helper por canteiro
- IA complexa ou pathfinding

## Design tasks
- manter o helper como conforto, não substituição do jogador
- evitar que o helper produza combo
- deixar claro quando o helper está ativo e quando realizou uma colheita
- garantir que a automação continue legível em sessões curtas

## Technical tasks
- adicionar upgrade/compra do helper em `config.js`
- persistir estado do helper em `systems`
- criar loop simples de automação no ticker existente
- reutilizar a lógica de colheita com um caminho seguro para origem manual vs automática
- mostrar status do helper na UI e registrar última ação automática

## Balance tasks
- definir custo do helper como meta de meio de sessão
- manter intervalo de colheita automática perceptivelmente mais lento que o jogador
- validar que a renda sobe de forma confortável, sem anular a venda manual e o timing do mercado

## QA focus
- consistência de save/load do helper
- helper não gerar combo
- helper respeitar eventos e estados de plantio
- colheita automática não travar nem duplicar colheitas
- economia continuar rápida e legível
