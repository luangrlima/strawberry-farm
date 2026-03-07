# Milestone Expansão e Eventos

## 1. Milestone goal
Expandir a fazenda de `3x3` para `4x4`, adicionar eventos aleatórios simples e manter a progressão rápida, clara e recompensadora.

## 2. In-scope features
- manter o loop comprar -> plantar -> esperar -> colher -> vender -> reinvestir
- permitir expansão da fazenda de `9` para `16` canteiros
- adicionar `3` eventos aleatórios simples
- exibir evento ativo com feedback visual claro e temporizador
- rebalancear metas e economia para manter o ritmo curto
- salvar e carregar expansão, evento ativo, upgrades, metas e estatísticas

## 3. Out-of-scope features
- backend
- multiplayer
- novos cultivos
- sistema complexo de estações
- árvore grande de upgrades
- inventário complexo

## 4. Acceptance criteria
- o jogo continua rodando em HTML/CSS/JS puros
- a fazenda começa em `3x3` e pode ser expandida para `4x4`
- existem `3` eventos simples com efeito visível
- o evento ativo aparece na interface com descrição e tempo restante
- a progressão continua curta e recompensadora
- save/load restaura corretamente expansão, eventos e progresso
- o fluxo principal continua validado por QA

## 5. Risks
- uma expansão cara demais pode travar a progressão
- eventos negativos demais podem frustrar e alongar a sessão
- efeito de evento em plantações em andamento pode criar inconsistência de tempo
- persistência de evento ativo pode gerar bugs se o tempo expirar durante reload
