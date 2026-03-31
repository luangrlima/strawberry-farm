# Sprint 21 — Plano

## Tipo de sprint
`ui-sprint-master` — Layout, clareza e usabilidade mobile

## Objetivo
Reestabelecer a versão mobile do jogo para que todas as partes essenciais do loop continuem acessíveis em telas estreitas, sem depender de áreas com scroll interno e sem deixar painéis críticos escondidos pela responsividade atual.

## Escopo
- corrigir o fluxo vertical da página em tablet/mobile
- remover dependência de alturas travadas no shell principal
- restaurar o acesso previsível a metas, melhorias e guia na sidebar
- preservar gameplay, economia e persistência

## Responsáveis
- `Diretor de Produto`: reduzir o sprint a acessibilidade mobile e evitar expansão de escopo
- `Designer de Jogo`: garantir que a ordem de leitura mobile preserve o loop comprar → plantar → colher → vender
- `Designer de Economia e Balanceamento`: validar que nenhuma correção de layout altera pacing ou custos
- `Desenvolvedor de Gameplay`: manter a lógica das abas consistente com o estado de UI
- `Desenvolvedor de UI/UX`: reorganizar layout e breakpoints para mobile real
- `Agente de QA e Playtest`: revalidar smoke, e2e e o cenário de layout mobile

---

## Tarefa 1 — Restaurar fluxo mobile da página

### Problema
O layout atual em viewport estreita mistura `max-height` fixa com scroll interno da coluna direita. Isso cria uma “janela desktop comprimida” no mobile e impede alcançar partes do jogo com previsibilidade.

### Arquivos impactados
- `public/style.css`

### Critérios de aceitação
- [ ] `panel` e `game-shell` deixam de impor altura travada no fluxo mobile/tablet
- [ ] a coluna direita deixa de depender de scroll interno em telas estreitas
- [ ] a leitura mobile segue ordem natural: fazenda, recursos/ações, gestão
- [ ] o grid da fazenda continua visível e interativo em 390px de largura

---

## Tarefa 2 — Corrigir navegação por abas da gestão

### Problema
O botão de `Melhorias` mudava o estado visual da aba, mas o painel correspondente não era controlado pelo mesmo mecanismo de show/hide. Na prática, isso deixava o comportamento inconsistente e mascarava a quebra mobile.

### Arquivos impactados
- `public/index.html`
- `src/ui/render.js`

### Critérios de aceitação
- [ ] somente o painel ativo entre `Metas`, `Melhorias` e `Guia` fica visível
- [ ] o botão `Melhorias` usa semântica de tab consistente com os demais
- [ ] abrir/fechar o guia continua funcionando

---

## Tarefa 3 — Reequilibrar densidade mobile

### Problema
Mesmo quando os blocos aparecem, vários grupos permanecem largos demais para a viewport, exigindo navegação excessiva ou escondendo contexto útil.

### Arquivos impactados
- `public/style.css`

### Critérios de aceitação
- [ ] chips, legendas e guias quebram corretamente em 1 coluna no mobile estreito
- [ ] barras de progresso e tabs continuam acessíveis sem esmagar o conteúdo
- [ ] cards e plots mantêm legibilidade sem extrapolar a largura útil

---

## Estratégia de implementação
1. Corrigir a lógica de tabs para expor o bug estrutural real.
2. Soltar as alturas fixas e remover scroll interno no layout responsivo.
3. Reordenar zonas e simplificar a densidade visual em `860px` e `560px`.
4. Ajustar o e2e para usar a navegação real da aba `Melhorias`.
5. Validar com `npm run test:smoke` e `npm run test:e2e`.

## Foco de QA
- regressão completa do loop principal
- acesso ao botão de expansão e upgrades com aba `Melhorias`
- layout mobile em `390x844`
- persistência e reset continuam intactos
