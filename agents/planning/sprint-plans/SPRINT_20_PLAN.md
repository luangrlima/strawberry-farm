# Sprint 20 — Plano

## Tipo de sprint
`gameplay-sprint-master` — Mecânicas, progressão e sistema de eventos

## Objetivo
Adicionar profundidade ao gameplay com 4 features: upgrade "Luvas Resistentes" para o ajudante limpar plots apodrecidos, goals de progressão mid/late game, evento negativo "Praga", e barra de progresso de apodrecimento nos plots ready.

## Restrição obrigatória
Todo texto visível ao jogador deve estar em **português brasileiro**.

---

## Tarefa 1 — Upgrade "Luvas Resistentes" (Ajudante limpa plots apodrecidos)

### Descrição
Novo upgrade que permite ao ajudante limpar automaticamente plots no estado `rotten`. Prioridade: colher ready > limpar rotten > plantar empty.

### Responsáveis
- **game-designer**: definir mecânica e posição na cadeia de prioridade do ajudante
- **economy-balance-designer**: definir custo, label, descrição
- **gameplay-developer**: implementar no código
- **ui-ux-developer**: garantir que o botão e descrição do upgrade apareçam corretamente

### Arquivos impactados
- `src/config/gameConfig.js` — novo upgrade `helperGloves` em `upgrades`
- `src/systems/helper.js` — `runFarmHelper()` deve incluir etapa de limpeza de rotten
- `src/state/createGameState.js` — `upgrades.helperGloves: false` no estado inicial
- `src/main.js` — `buyHelperGlovesUpgrade()`, `attachEvents()`, handler do botão
- `src/ui/render.js` — `renderPrimaryActions()` e `renderUpgradeCards()` para o novo upgrade
- `public/index.html` — botão e card do upgrade "Luvas Resistentes"
- `src/systems/helper.js` — `noteHelperClean()` para feedback de ação

### Spec técnica

**Cadeia de prioridade do ajudante (em `runFarmHelper`):**
1. Colher 1 plot `ready` (existente)
2. **NOVO**: Limpar 1 plot `rotten` (se `helperGloves` ativo)
3. Plantar 1 plot `empty` (se `helperPlanting` ativo e tem sementes)

**Config do upgrade:**
```javascript
helperGloves: {
  label: "Luvas Resistentes",
  cost: 16,
  description: "O ajudante limpa 1 canteiro apodrecido por ciclo.",
}
```

**Lógica em `runFarmHelper`:**
```
Se não achou readyPlot:
  Se helperGloves ativo:
    buscar rottenPlot
    se achou: limpar e retornar
  Se helperPlanting ativo e tem sementes:
    buscar emptyPlot
    se achou: plantar e retornar
```

**Pré-requisito:** requer `helper` ativo (similar a `helperPlanting`).

### Critérios de aceitação
- [ ] Upgrade aparece no painel com label, custo e descrição em PT-BR
- [ ] Botão desabilitado se ajudante não está ativo ou dinheiro insuficiente
- [ ] Ajudante limpa 1 rotten por ciclo quando não há ready para colher
- [ ] Prioridade: ready > rotten > empty
- [ ] Feedback visual "Ajudante limpou o canteiro X."
- [ ] Estado `helperGloves` persistido no save/load

---

## Tarefa 2 — Goals de progressão mid/late game

### Descrição
Adicionar 3-5 goals intermediários e tardios ao array `progressionGoals` em `gameConfig.js`. Usa o sistema de progressão existente — é quase 100% data-driven.

### Responsáveis
- **game-designer**: desenhar os goals (tipo, valor, recompensa, descrição)
- **economy-balance-designer**: validar valores e recompensas
- **gameplay-developer**: implementar os goals e eventuais novos `targetType`

### Arquivos impactados
- `src/config/gameConfig.js` — novos objetos em `progressionGoals`
- `src/systems/progression.js` — novos `targetType` se necessário (ex: `prestigeLevel`, `totalSold`)
- `src/ui/render.js` — `getGoalProgressText()` e `getGoalCurrentValue()` para novos tipos

### Spec técnica

**Goals candidatos (game-designer deve refinar):**

| ID | Título | Descrição | targetType | targetValue | Recompensa |
|---|---|---|---|---|---|
| `sell-20` | Comerciante | Venda 20 morangos | soldTotal | 20 | +6 moedas |
| `prestige-1` | Conhecimento inicial | Faça o primeiro prestígio | prestigeLevel | 1 | +8 moedas |
| `harvest-50` | Fazendeiro dedicado | Colha 50 morangos | harvestedTotal | 50 | +4 sementes |
| `all-upgrades` | Fazenda completa | Compre todas as melhorias | upgradesPurchased | 5 | +10 moedas |

**Novos targetTypes necessários:**
- `soldTotal` → `game.state.stats.soldTotal`
- `prestigeLevel` → `game.state.prestige.level`

### Critérios de aceitação
- [ ] 3-5 novos goals aparecem no painel de progressão
- [ ] Todos os textos em PT-BR
- [ ] Goals completam corretamente ao atingir meta
- [ ] Recompensas são concedidas ao completar
- [ ] Barra de progresso funciona para novos tipos
- [ ] Goals existentes não quebram

---

## Tarefa 3 — Evento negativo "Praga"

### Descrição
Novo evento aleatório que **reduz `spoilTimeMs` em 50%** durante sua duração, fazendo morangos apodrecerem mais rápido. Introduz tensão e risco ao gameplay.

### Responsáveis
- **game-designer**: definir mecânica, tags, descrição
- **economy-balance-designer**: validar multiplicador e impacto na economia
- **gameplay-developer**: implementar no código

### Arquivos impactados
- `src/config/gameConfig.js` — nova definição em `events.definitions`
- `src/systems/plots.js` — `updatePlotsByTime()` deve consultar evento ativo para `spoilTimeMs`
- `src/systems/events.js` — `getEventEffectText()` e `getEventTags()` para o novo tipo
- `public/style.css` — classe `event-banner--plague` com cor de alerta

### Spec técnica

**Definição do evento:**
```javascript
{
  id: "plague",
  title: "Praga",
  description: "Morangos apodrecem mais rápido.",
  type: "spoilPenalty",
  spoilTimeMultiplier: 0.5,
  accentClass: "event-banner--plague",
}
```

**Mecânica:**
- Quando o evento Praga está ativo, `spoilTimeMs` efetivo = `config.crop.spoilTimeMs * 0.5`
- Isso afeta **novos** plots que transitam para `ready` durante o evento
- Plots que já estão `ready` com `rottenAt` definido **também devem ser acelerados** (similar a `accelerateGrowingPlots` mas para `rottenAt`)
- Precisa de nova função `accelerateRottenTimer(game, multiplier, now)` em `events.js`

**Impacto na ativação:**
Ao ativar Praga, iterar plots `ready` com `rottenAt` finito e reduzir o tempo restante em 50%.

**Tags:** "Afeta apodrecimento"

**Cor CSS:** gradiente avermelhado/tóxico para `event-banner--plague`

### Critérios de aceitação
- [ ] Evento Praga aparece aleatoriamente nas vendas (junto com os outros)
- [ ] `spoilTimeMs` efetivo reduzido em 50% durante o evento
- [ ] Plots ready existentes têm `rottenAt` acelerado ao ativar o evento
- [ ] Banner com visual distinto (cor de alerta)
- [ ] Tags e efeito descritos em PT-BR
- [ ] Após fim do evento, novos plots voltam ao `spoilTimeMs` normal

---

## Tarefa 4 — Barra de progresso de apodrecimento

### Descrição
Plots no estado `ready` devem exibir uma barra de progresso regressiva mostrando o tempo restante antes de apodrecer. Reutilizar o componente `plot__progress` existente com cor diferente (laranja → vermelho).

### Responsáveis
- **gameplay-developer**: expor cálculo de progresso de apodrecimento em `plots.js` e usar em `farmGrid.js`
- **ui-ux-developer**: estilizar a barra com gradiente laranja/vermelho

### Arquivos impactados
- `src/systems/plots.js` — nova função `getSpoilProgress(plot, now)` ou expandir `getPlotProgress()`
- `src/ui/farmGrid.js` — mostrar `progressTrack` para plots `ready`, preencher com progresso de spoil
- `public/style.css` — variante de cor para barra de spoil (`.plot__progress-fill--spoil` ou classe no track)

### Spec técnica

**Cálculo de progresso de apodrecimento:**
```javascript
function getSpoilProgress(plot, now) {
  if (plot.state !== SF.config.plotStates.ready || !Number.isFinite(plot.rottenAt)) {
    return 0;
  }
  // spoilTimeMs pode variar com evento ativo, mas rottenAt já foi setado
  // Usar a diferença entre quando ficou ready e rottenAt
  const totalSpoilTime = plot.rottenAt - (plot.rottenAt - SF.config.crop.spoilTimeMs);
  // Simplificação: usar o spoilTimeMs configurado como duração base
  const remaining = Math.max(0, plot.rottenAt - now);
  return Math.max(0, Math.min(100, (remaining / SF.config.crop.spoilTimeMs) * 100));
}
```

**Nota:** O cálculo acima é uma aproximação. Como `rottenAt` pode ter sido acelerado pelo evento Praga, o ideal é armazenar o `spoilDurationMs` no plot ao transitar para `ready`, similar a `growthDurationMs`. Decisão: **armazenar `spoilDurationMs` no plot** para cálculo preciso.

**Em `farmGrid.js`:**
- `progressTrack.hidden` deve ser `false` para plots `growing` OU `ready`
- Para `ready`: usar `getSpoilProgress()` e aplicar classe CSS de spoil
- Para `growing`: manter comportamento atual

**CSS:**
```css
.plot__progress-fill--spoil {
  background: linear-gradient(90deg, #e8a03e, #d94545);
}
```

### Critérios de aceitação
- [ ] Plots `ready` exibem barra de progresso regressiva
- [ ] Barra vai de 100% (acabou de ficar ready) para 0% (prestes a apodrecer)
- [ ] Cor da barra é laranja→vermelho (distinta da barra de crescimento)
- [ ] Barra desaparece ao colher ou ao apodrecer
- [ ] `spoilDurationMs` persistido no plot para cálculo preciso
- [ ] Funciona corretamente com evento Praga ativo

---

## Ordem de implementação recomendada

1. **Tarefa 4** (barra de spoil) — precisa de `spoilDurationMs` no plot, que a Tarefa 3 vai usar
2. **Tarefa 3** (Praga) — depende de entender como `rottenAt` é setado, interage com barra de spoil
3. **Tarefa 1** (Luvas Resistentes) — independente das anteriores, pode ser paralela
4. **Tarefa 2** (Goals) — independente, pode ser paralela com Tarefa 1

**Paralelismo possível:**
- game-designer + economy-balance-designer: definir specs de todas as 4 tarefas primeiro
- gameplay-developer: implementar Tarefas 4 → 3 → 1 → 2 em sequência
- ui-ux-developer: CSS da barra de spoil (T4) e banner Praga (T3) e botão Luvas (T1) em paralelo

---

## Foco de QA

- Regressão: smoke 6/6 + e2e 11/11 devem continuar passando
- Novo: ajudante com Luvas Resistentes limpa rotten corretamente
- Novo: prioridade ready > rotten > empty do ajudante
- Novo: goals mid/late completam e concedem recompensas
- Novo: evento Praga reduz spoilTime e acelera plots ready existentes
- Novo: barra de apodrecimento exibida e progride corretamente
- Interação: Praga + barra de spoil funcionam juntas
- Interação: Praga + Luvas Resistentes — ajudante limpa rotten rápido o suficiente?
- Save/load: novos estados (`helperGloves`, `spoilDurationMs`, novos goals) persistem
- PT-BR: todos os novos textos em português

---

## Critérios de aceitação do sprint

- [ ] Todas as 4 tarefas implementadas e funcionais
- [ ] Smoke 6/6 + E2E 11/11 (ou mais, se novos cenários forem adicionados)
- [ ] Zero texto em inglês visível ao jogador (exceto "Reset", "On/Off")
- [ ] Save/load compatível com saves anteriores (graceful degradation)
- [ ] QA report aprovado
