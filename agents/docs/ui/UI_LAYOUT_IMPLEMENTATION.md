# UI Layout Implementation

## Status do documento
Este é um documento histórico do Sprint 8.

Na época da implementação, a interface ainda era atualizada a partir de um runtime concentrado em `game.js`. Depois do Sprint 9, os mesmos IDs e hooks passaram a ser consumidos principalmente por `src/main.js` e `src/ui/render.js`.

## Estratégia
- manter toda a lógica atual do jogo
- preservar os IDs já usados pelo runtime do jogo
- reorganizar apenas markup e CSS

## Mudanças de estrutura
- criar uma malha principal com 3 colunas em desktop
- mover HUD, ações e status para a esquerda
- mover fazenda e indicadores principais para o centro
- mover progressão, upgrades, mercado, prestígio e ajuda para a direita

## Mudanças visuais
- compactar cards e módulos
- reduzir margens superiores em sequência
- diminuir altura de banners que não precisam dominar a tela
- permitir rolagem localizada nas colunas laterais em desktop, evitando scroll de página sempre que possível

## Limites
- sem mudança de regras
- sem framework
- sem sistemas novos
