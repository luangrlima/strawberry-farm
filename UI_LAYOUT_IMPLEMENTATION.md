# UI Layout Implementation

## Estratégia
- manter toda a lógica atual do jogo
- preservar os IDs já usados pelo `game.js`
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
