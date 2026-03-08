# Sprint 4: Estabilidade e Responsividade

## Classificação do QA atual

### 1. Bugs críticos
- nenhum bug crítico aberto no último QA

### 2. Bugs médios
- nenhum bug médio confirmado no último QA automatizado

### 3. Problemas de design
- a barra de status ainda compete com outros feedbacks importantes em momentos de meta concluída e mudança de evento
- o banner de evento mostra o evento ativo, mas o impacto prático ainda pode ficar implícito demais para o jogador

### 4. Melhorias de polimento
- reforçar visualmente quais partes do HUD estão sendo afetadas pelo evento atual
- melhorar a responsividade do loop visual sem recriar ou repintar toda a tela sem necessidade
- rebalancear custos e recompensas para manter o ritmo rápido após expansão e upgrades
- organizar melhor o estado e os renderizadores para reduzir risco de regressão

## Objetivos do sprint
- corrigir todos os bugs críticos abertos
- rebalancear a economia
- melhorar o feedback visual dos eventos
- melhorar a responsividade do gameplay
- refatorar o estado do jogo para mais estabilidade

## Restrições
- manter HTML, CSS e JavaScript puros
- manter o jogo pequeno
- evitar novos sistemas complexos

## Escopo
- ajustar custos e recompensas para progressão mais suave
- melhorar a leitura do evento ativo e de seus efeitos
- separar render completo de atualizações rápidas de tempo/progresso
- reduzir trabalho desnecessário no ticker
- consolidar helpers de estado visível e persistido
- validar tudo com QA focado em economia, timing, save/load e responsividade

## Critérios de aceitação
- nenhuma regressão crítica no loop principal
- expansão, upgrades, eventos e metas continuam persistindo corretamente
- evento ativo comunica efeito, duração e impacto com clareza
- a interface responde melhor durante crescimento e eventos
- o código de estado/renderização fica mais previsível e modular
