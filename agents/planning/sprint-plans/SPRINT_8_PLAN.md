# Plano do Sprint 8

## Status do documento
Documento histórico, escrito antes da refatoração arquitetural do Sprint 9.

## Objetivo do sprint
Reorganizar a arquitetura da interface para que o jogo fique mais jogável em uma única tela no desktop, com a fazenda no centro e menos necessidade de scroll.

## Escopo incluído
- nova estrutura horizontal em 3 zonas para desktop
- HUD compacto na coluna esquerda
- fazenda centralizada na coluna do meio
- progressão, mercado, prestígio, upgrades e ajuda na coluna direita
- status de evento, combo, helper e save em módulos compactos
- ajuda recolhida por padrão
- redução de espaçamentos verticais e densidade maior de informação útil

## Fora de escopo
- mudanças nas regras do jogo
- novos sistemas de gameplay
- novo conteúdo de progressão
- redesign visual complexo
- animações ou decoração extra

## Tarefas de reestruturação da UI
- reestruturar HTML em zonas esquerda, centro e direita
- compactar módulos de status
- preservar clareza de leitura
- manter bom comportamento no mobile com empilhamento vertical

## Tarefas de implementação
- refatorar layout principal em `index.html`
- atualizar CSS responsivo para grid de 3 colunas no desktop
- reduzir alturas, paddings e margens
- manter IDs e hooks do runtime do jogo
- ajustar estado inicial da ajuda para recolhida

## Foco de QA
- visibilidade acima da dobra em desktop
- fácil acesso às ações principais
- fazenda visualmente central
- ausência de regressões funcionais
- layout mobile ainda razoável
