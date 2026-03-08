# Strawberry Farm — Agent Guide

## Visão geral do projeto

`Strawberry Farm` é um pequeno jogo de fazenda para navegador.

Stack:
- HTML puro
- CSS puro
- JavaScript puro
- sem frameworks
- sem backend
- persistência com `localStorage`

O projeto evolui em sprints curtos e iterativos coordenados pelo `Diretor Geral do Jogo`.

## Estado atual do jogo

O jogo atualmente inclui:
- plantio, crescimento, colheita e venda de morangos
- combo de colheita
- mercado dinâmico simples
- eventos aleatórios simples
- expansão da fazenda de `3x3` para `4x4`
- upgrades
- automação com `Farm Helper`
- prestígio com `Strawberry Knowledge`
- save/load com `localStorage`
- HUD single-page com feedback compacto

## Restrições do projeto

### Restrições técnicas
- HTML, CSS e JavaScript puros
- sem frameworks
- sem backend
- `localStorage` para persistência
- jogo em uma única página
- código legível e modular

### Restrições de design
- sessões curtas
- uma cultura apenas: morango
- progressão deve ser rapidamente recompensadora
- sistemas simples e óbvios
- nenhuma feature deve exigir infraestrutura complexa

### Fora de escopo
- multiplayer
- backend
- contas de usuário
- múltiplas culturas
- estações
- NPCs complexos
- crafting complexo
- simulação complexa de mercado

## Papéis do time

Os agentes colaboram usando estes papéis:

`Diretor Geral do Jogo`  
Coordena o sprint de ponta a ponta, escolhe o template correto, distribui responsabilidades e garante que o resultado permaneça pequeno, claro e jogável.

`Diretor de Produto`  
Define escopo e prioridades.

`Designer de Jogo`  
Desenha sistemas de gameplay e progressão.

`Designer de Economia e Balanceamento`  
Define preços, pacing e recompensas.

`Desenvolvedor de Gameplay`  
Implementa lógica e sistemas do jogo.

`Desenvolvedor de UI/UX`  
Melhora clareza e usabilidade da interface.

`Agente de QA e Playtest`  
Testa loops de gameplay e detecta regressões.

## Organização do repositório

- runtime do jogo em `public/` e `src/`
- prompts dos agentes em `agents/prompts/`
- artefatos de planejamento em `agents/planning/`
- notas de implementação em `agents/planning/implementation-notes/`
- documentação estável em `docs/`
- documentação de apoio por sistema em `agents/docs/`
- testes, relatórios e evidências em `tests/`

## Contrato de execução de sprint

Sempre que um sprint for executado:

1. Ler:
   - `AGENTS.md`
   - `README.md`
   - código atual do projeto
   - relatório de QA mais recente em `tests/reports/`

2. Manter o escopo pequeno.

3. Preferir iteração em vez de complexidade.

4. Não introduzir frameworks ou backend, a menos que isso seja explicitamente exigido.

5. Preservar o comportamento atual do gameplay, exceto quando o sprint modificar isso de forma explícita.

6. O `Diretor Geral do Jogo` deve sempre coordenar os seis papéis:
   - Diretor de Produto
   - Designer de Jogo
   - Designer de Economia e Balanceamento
   - Desenvolvedor de Gameplay
   - Desenvolvedor de UI/UX
   - Agente de QA e Playtest

7. O `Diretor Geral do Jogo` deve escolher um template mestre de sprint antes de executar o trabalho:
   - `agents/prompts/gameplay-sprint-master.md` para mudanças de mecânica, progressão, economia e sistemas do jogo
   - `agents/prompts/ui-sprint-master.md` para mudanças de layout, clareza, HUD e usabilidade
   - `agents/prompts/technical-sprint-master.md` para refactors, arquitetura, estabilidade e organização técnica

8. Se o sprint misturar mais de um tipo, o `Diretor Geral do Jogo` deve escolher o tipo dominante e manter o restante apenas como suporte, sem expandir o escopo.

9. O template escolhido define a estrutura lógica de saída do sprint usando `sprint_template.md`, mas os arquivos finais devem respeitar a arquitetura do repositório.

## Saídas obrigatórias de sprint

Cada sprint deve gerar, no mínimo:

- `agents/planning/sprint-plans/SPRINT_<N>_PLAN.md`
- `agents/planning/implementation-notes/SPRINT_<N>_IMPLEMENTATION_NOTES.md`
- `tests/reports/QA_REPORT_SPRINT_<N>.md`
- `agents/planning/reviews/SPRINT_<N>_REVIEW.md`

Quando útil, o sprint pode gerar documentos complementares, mas esses quatro artefatos são o contrato mínimo.

### Regra de naming e localização

- nunca gerar artefatos de sprint na raiz do repositório
- usar sempre o número ou nome oficial do sprint no filename
- `SPRINT_PLAN`, `IMPLEMENTATION_NOTES` e `SPRINT_REVIEW` pertencem a `agents/planning/`
- `QA_REPORT` pertence a `tests/reports/`
- `tests/reports/QA_REPORT.md` é apenas a referência do QA vigente e deve apontar para o relatório mais recente, sem substituir o arquivo versionado do sprint

## Como localizar o QA mais recente

Para evitar ambiguidade:

- considerar `tests/reports/` como fonte oficial de relatórios de QA
- usar o relatório mais recente e relevante ao estado atual do projeto
- se existir um relatório específico do sprint atual, ele passa a ser a nova referência
- `tests/README.md` deve refletir qual é o relatório de QA vigente

## Princípios de desenvolvimento

Manter o projeto:

- simples
- legível
- modular
- fácil de iterar

Evitar overengineering.
