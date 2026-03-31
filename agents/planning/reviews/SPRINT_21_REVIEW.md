# Sprint 21 — Review

## Objetivo do sprint
Reestabelecer a versão mobile do Strawberry Farm para que toda a interface útil do jogo volte a ser acessível em telas estreitas.

## Status
CONCLUIDO E APROVADO

## Entregas
- layout responsivo convertido para fluxo vertical confiável em tablet/mobile
- remoção do scroll interno da coluna direita nas quebras responsivas
- correção real das abas `Metas`, `Melhorias` e `Guia`
- e2e atualizado para navegar pela aba `Melhorias` explicitamente
- regressão smoke e e2e aprovadas

## Resultado de QA
- `npm run test:smoke`: aprovado
- `npm run test:e2e`: aprovado
- cenário mobile do e2e: aprovado

## O que funcionou bem
1. O escopo ficou pequeno e direto: layout mobile e navegação da sidebar, sem mexer no gameplay.
2. A falha do e2e revelou um bug antigo de interface: o teste dependia de um painel incorretamente visível.
3. A correção foi majoritariamente CSS + um ajuste pequeno de renderização, preservando o restante do jogo.

## Riscos residuais
1. O cenário mobile automatizado ainda valida acessibilidade básica, não ergonomia profunda por múltiplos devices.
2. O layout continua denso; novos cards ou seções podem exigir outra rodada de compactação no futuro.

## Backlog sugerido
1. Adicionar asserts e2e específicos para alternância entre abas da gestão.
2. Incluir um cenário visual de tablet para evitar regressão intermediária entre `860px` e `1180px`.
3. Avaliar uma HUD mobile ainda mais compacta para sessões de mão única.
