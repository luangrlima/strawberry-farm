# Revisão do Sprint 7

## Status do documento
Documento histórico, escrito antes da refatoração arquitetural do Sprint 9.

## O sistema de prestígio foi implementado com sucesso?
Sim. `Strawberry Knowledge` entrou como uma camada permanente simples, integrada ao save/load, ao loop de venda e à interface principal sem adicionar infraestrutura nova.

## O prestígio melhora o gameplay de longo prazo?
Sim. O jogador agora tem um motivo claro para continuar após fechar a run base. O reset opcional cria replayability sem alterar o coração do jogo.

## Há riscos de balanceamento?
- O bônus de `+20%` por nível é forte e faz sentido para um sistema de longo prazo.
- O principal risco está em níveis altos futuros, porque mercado, upgrade de venda e helper escalam bem junto.
- O requisito crescente por nível ajuda a conter esse risco no estado atual.

## Surgiram bugs novos?
- Nenhum bug crítico ficou aberto após o QA final.
- O único ajuste necessário esteve no teste automatizado, para refletir corretamente a reconstrução da run pós-prestígio.

## O que funcionou bem
- feedback claro de disponibilidade de prestígio
- reset opcional com ganho permanente simples
- persistência estável
- integração econômica direta com o ato de vender

## O que merece atenção
- `game.js` segue centralizando muitos sistemas; ainda está aceitável, mas o custo de manutenção cresce a cada sprint
- o requisito de prestígio e a porcentagem de bônus devem ser reavaliados se o Sprint 8 acelerar demais a renda

## Prioridades recomendadas para o Sprint 8
- melhorar a profundidade do mercado sem transformá-lo em trading complexo
- revisar metas de progressão para dialogarem melhor com o prestígio
- continuar polindo feedback e legibilidade, sem abrir novos sistemas grandes
