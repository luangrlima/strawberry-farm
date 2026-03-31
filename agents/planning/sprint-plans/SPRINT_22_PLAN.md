# Sprint 22 — Plano

## Tipo de sprint
`ui-sprint-master` — Clareza visual dos canteiros com sprites por estado

## Objetivo
Substituir o bloco central de emoji dos canteiros por sprites de estado focados em leitura rápida de terra, crescimento, morango maduro e morango estragado, sem alterar o loop principal de gameplay.

## Escopo
- trocar o visual central de `empty`, `growing`, `ready` e `rotten`
- usar sprites gratuitos e locais para o morango
- manter textos, badges, timers, progresso e acessibilidade do grid
- validar save/load, apodrecimento e regressão geral

## Responsáveis
- `Diretor de Produto`: manter o sprint restrito aos estados dos canteiros
- `Designer de Jogo`: preservar leitura clara de semear -> crescer -> colher -> limpar
- `Designer de Economia e Balanceamento`: garantir que nenhuma mudança visual altere pacing ou custo
- `Desenvolvedor de Gameplay`: expor um resolvedor de sprite por estado sem tocar nas regras do canteiro
- `Desenvolvedor de UI/UX`: substituir o emoji por uma camada de sprite e solo legível
- `Agente de QA e Playtest`: revalidar smoke, e2e e a leitura dos estados no grid

---

## Tarefa 1 — Resolver sprites de crescimento por estado

### Problema
O grid ainda depende de emoji para comunicar o estado do canteiro.

### Arquivos impactados
- `src/systems/plots.js`
- `src/ui/farmGrid.js`

### Critérios de aceitação
- [ ] `empty` usa leitura visual de terra
- [ ] `growing` troca de frame conforme o progresso
- [ ] `ready` usa frame maduro
- [ ] `rotten` usa variante visual estragada
- [ ] o mapeamento começa na semente logo após plantar

---

## Tarefa 2 — Integrar spritesheet CC0 ao visual do plot

### Problema
O canteiro precisa de uma solução local e estável, sem depender de emoji nativo do sistema.

### Arquivos impactados
- `public/style.css`
- `public/assets/farming-crops-16x16.png`
- `public/assets/farming-crops-16x16.CREDITS.txt`

### Critérios de aceitação
- [ ] o sprite é renderizado com `image-rendering: pixelated`
- [ ] o solo continua legível como base visual do canteiro
- [ ] a variante podre é claramente diferente da madura
- [ ] a origem e licença do asset ficam registradas no repositório

---

## Tarefa 3 — Cobrir a mudança em QA

### Problema
A regressão atual cobre texto e lógica, mas não trava a presença do sprite por estado.

### Arquivos impactados
- `tests/playwright/strawberry-farm.smoke.js`
- `tests/playwright/strawberry-farm.e2e.js`
- `tests/manual/TEST_SCENARIOS.md`

### Critérios de aceitação
- [ ] smoke verifica terra, crescimento e podre por `data-sprite`
- [ ] e2e verifica sprite vazio, crescimento, podre e limpeza
- [ ] a documentação manual troca a referência de emoji por sprite

## Estratégia de implementação
1. Importar o spritesheet CC0 selecionado do OpenGameArt para `public/assets/`.
2. Resolver um `sprite id` por estado em `plots.js`.
3. Renderizar o sprite via `data-sprite` e variáveis CSS no grid.
4. Ajustar o mapeamento dos frames para iniciar na semente e terminar no morango maduro.
5. Revalidar com `node --check`, `npm run test:smoke` e `npm run test:e2e`.

## Foco de QA
- plantio imediato mostra semente, não fruta madura
- reload preserva sprite do estado atual
- apodrecimento troca para variante podre
- limpar retorna ao estado de terra
