# Marco: Expansão, Eventos e Polimento

## 1. Objetivo do marco
Expandir a fazenda de `3x3` para `4x4`, adicionar eventos aleatórios simples e polir onboarding, feedback e progresso sem aumentar a complexidade do jogo.

## 2. Funcionalidades no escopo
- manter o loop comprar -> plantar -> esperar -> colher -> vender -> reinvestir
- permitir expansão da fazenda de `9` para `16` canteiros
- adicionar `3` eventos aleatórios simples
- exibir evento ativo com feedback visual claro e temporizador
- adicionar onboarding curto e persistente
- adicionar indicadores de progresso úteis
- exibir feedback claro de meta concluída
- rebalancear metas e economia para manter o ritmo curto
- salvar e carregar expansão, evento ativo, upgrades, metas e estatísticas

## 3. Funcionalidades fora do escopo
- backend
- multiplayer
- novos cultivos
- sistema complexo de estações
- árvore grande de upgrades
- inventário complexo

## 4. Critérios de aceitação
- o jogo continua rodando em HTML/CSS/JS puros
- a fazenda começa em `3x3` e pode ser expandida para `4x4`
- existem `3` eventos simples com efeito visível
- o evento ativo aparece na interface com descrição e tempo restante
- o onboarding explica o jogo em poucos passos
- o HUD mostra progresso relevante sem poluir a tela
- metas concluídas geram feedback claro
- a progressão continua curta e recompensadora
- save/load restaura corretamente expansão, eventos e progresso
- o fluxo principal continua validado por QA

## 5. Riscos
- uma expansão cara demais pode travar a progressão
- eventos negativos demais podem frustrar e alongar a sessão
- efeito de evento em plantações em andamento pode criar inconsistência de tempo
- persistência de evento ativo pode gerar bugs se o tempo expirar durante reload
