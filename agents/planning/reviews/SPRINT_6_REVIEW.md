# Revisão do Sprint 6

## Status do documento
Documento histórico, escrito antes da refatoração arquitetural do Sprint 9.

## O objetivo foi alcançado?
Sim. O sprint entregou uma automação leve com o `Farm Helper`, visível na UI, persistente no save e integrada ao loop atual sem exigir sistemas complexos.

## A automação melhorou o gameplay?
Sim. O helper reduz atrito em momentos de muita colheita, especialmente depois da expansão e do adubo, mas ainda deixa o jogador responsável por plantar, vender e aproveitar o mercado.

## Há riscos econômicos?
- O helper aumenta conforto mais do que explosão de renda, o que é positivo.
- O principal risco futuro é o helper ficar forte demais se novas automações entrarem no projeto.
- No estado atual, custo `18` e ritmo de `1` colheita por `3.5s` mantêm a vantagem do jogador manual.

## Surgiram bugs novos?
- Nenhum bug crítico ficou aberto após o QA final.
- O único ajuste necessário no sprint foi no próprio teste automatizado, que passou a validar combo pelo estado do jogo em vez de depender de uma UI transitória.

## O que funcionou bem
- integração simples ao `ticker` existente
- persistência do helper dentro de `systems`
- feedback claro no HUD e na faixa de automação
- proteção do combo contra colheita automática

## O que falhou ou merece atenção
- `game.js` continua concentrando muitos sistemas; ainda está aceitável, mas novos sprints devem evitar crescer a complexidade sem reorganização incremental
- o helper usa mensagens breves de ação, então excessos de automação no futuro podem começar a competir com outras mensagens da interface

## Próximas prioridades para o Sprint 7
- aprofundar decisão do jogador sem aumentar infraestrutura
- melhorar levemente o valor estratégico do mercado
- revisar pequenos ajustes de clareza em HUD e feedback, sem adicionar novos sistemas grandes
