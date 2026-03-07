# Fazenda de Morangos MVP+

## Objetivo do projeto
Construir um jogo pequeno de navegador sobre plantar, colher e vender morangos, com escopo enxuto, feedback claro e ciclos curtos de evolução.

## Restrições do projeto
- HTML, CSS e JavaScript puros
- sem frameworks
- sem backend
- persistência com `localStorage`
- uma única tela principal
- sessões curtas, entre 3 e 10 minutos
- cada marco deve caber em um ciclo curto

## Loop principal atual
Comprar sementes -> plantar -> esperar -> colher -> vender -> reinvestir

## Estado atual do jogo
- fazenda que começa em 3x3 e pode ser expandida para 4x4
- morango como única cultura
- temporizador de crescimento
- colheita por clique
- venda de morangos
- contador de moedas, sementes e morangos
- salvamento automático e carregamento com `localStorage`
- retomada do crescimento após recarregar
- confirmação de reset
- upgrade de adubo para reduzir o tempo de crescimento
- upgrade de venda para aumentar o preço do morango
- 3 eventos aleatórios simples com feedback visual
- interface em português com feedback visual dos estados da planta
- metas de progressão em tela única
- meta de progressão final de `35` moedas

## Fora de escopo atual
- backend
- multiplayer
- arte complexa
- NPCs
- estações
- áudio
- autenticação

## Agentes do projeto

### Diretor de Produto
Arquivo: `agents/product_director.md`

Responsável por:
- definir o objetivo de cada marco
- manter o escopo enxuto
- priorizar funcionalidades
- escrever critérios de aceitação curtos
- evitar scope creep

### Designer de Jogo
Arquivo: `agents/game_designer.md`

Responsável por:
- atualizar o loop principal
- propor novas mecânicas
- definir progressão
- definir eventos aleatórios
- indicar implicações de UI e notas para desenvolvimento

### Designer de Economia e Balanceamento
Arquivo: `agents/economy_balance_designer.md`

Responsável por:
- definir preços e tempos
- definir custos de upgrades
- ajustar ritmo de recompensa
- apontar riscos de balanceamento e exploits

### Desenvolvedor de Gameplay
Arquivo: `agents/game_developer.md`

Responsável por:
- implementar lógica da fazenda
- implementar upgrades, eventos e progressão
- refatorar o estado do jogo com segurança
- manter o código legível e modular

### Desenvolvedor de UI/UX
Arquivo: `agents/ui_ux_developer.md`

Responsável por:
- melhorar HUD, botões e mensagens
- melhorar a leitura dos estados das plantas
- reduzir confusão do jogador
- ajustar layout mobile quando for simples

### Agente de QA e Playtest
Arquivo: `agents/qa_playtest_agent.md`

Responsável por:
- testar economia, save/load, upgrades, eventos e reset
- identificar bugs, exploits e soft locks
- separar bugs de problemas de design
- sugerir correções mínimas
