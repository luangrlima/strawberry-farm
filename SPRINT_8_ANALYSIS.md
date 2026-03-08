# Sprint 8 Analysis

## Blocos críticos
- grade da fazenda
- moedas, sementes e morangos
- ações principais: comprar, vender, reiniciar
- feedback de estado: mensagem principal, evento, combo, helper, autosave
- preço de venda, tempo de crescimento e tamanho atual da fazenda

## Blocos secundários
- painel de progressão detalhado
- cards de upgrades
- painel de prestígio
- ajuda rápida
- textos longos explicativos

## O que pode ser colapsado, fundido ou movido
- ajuda rápida pode ficar recolhida por padrão
- feedbacks de evento, combo, helper e save podem virar módulos compactos
- status e HUD podem sair do topo empilhado e ir para uma coluna lateral
- progressão, upgrades e prestígio podem ocupar uma coluna lateral direita
- o centro deve ser reservado quase todo para fazenda e feedback principal

## Problemas atuais de usabilidade desktop
- a tela segue um fluxo vertical único e longo
- o jogador precisa rolar para alternar entre status, fazenda, upgrades e ações
- a fazenda, que deveria ser o foco, aparece tarde na tela
- o topo concentra muitos blocos altos antes da área jogável
- eventos, helper, combo e mercado ocupam altura demais para a frequência com que mudam

## Direção recomendada
- usar 3 zonas em desktop:
  - esquerda: HUD compacto, ações primárias, status curtos
  - centro: fazenda, mensagem principal, indicadores rápidos
  - direita: progressão, mercado, prestígio, upgrades e ajuda recolhida
- reduzir espaçamentos verticais
- limitar rolagem da página inteira e, se necessário, permitir rolagem apenas nas colunas laterais em desktop
