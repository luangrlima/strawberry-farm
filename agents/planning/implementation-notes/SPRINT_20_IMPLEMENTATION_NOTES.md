# Sprint 20 — Notas de Implementacao

## Tipo de sprint
`gameplay-sprint-master` — Mecanicas, progressao e sistema de eventos

## Resumo
4 features implementadas: upgrade "Luvas Resistentes", 4 goals mid/late game, evento negativo "Praga", barra de progresso de apodrecimento.

---

## Feature 1 — Upgrade "Luvas Resistentes"

### Arquivos modificados
| Arquivo | Mudanca |
|---------|---------|
| `src/config/gameConfig.js:66-70` | Nova definicao `helperGloves` (cost: 25) |
| `src/state/createGameState.js:35` | `helperGloves: false` no estado inicial |
| `src/state/persistence.js:120` | Hydration de `helperGloves` no load |
| `src/systems/plots.js:28-33` | `getSpoilTimeMs()` — retorna 10000ms com luvas, 6000ms sem |
| `src/systems/plots.js:155-170` | `clearRottenPlotWithSource()` — limpeza com suporte a source helper/manual |
| `src/systems/helper.js:55-61` | Etapa de limpeza de rotten no `runFarmHelper()` |
| `src/systems/helper.js:novo` | `noteHelperClean()` — feedback "Ajudante limpou o canteiro X." |
| `src/main.js:286-313` | `buyHelperGlovesUpgrade()` — compra com pre-requisito helper ativo |
| `src/ui/render.js:116-125` | Enable/disable do botao `#helperGlovesButton` |
| `src/ui/render.js:175-177` | Descricao atualizada quando ativo |
| `src/ui/render.js:257` | Helper strip "+limpeza" nas combinacoes |
| `src/utils/dom.js` | `helperGlovesButton` e `helperGlovesDescription` em `collectElements()` |
| `public/index.html:297-302` | Card de upgrade no HTML |

### Decisoes tecnicas
- **Cadeia de prioridade do ajudante**: ready > rotten (se helperGloves) > empty (se helperPlanting). Rotten fica entre harvest e plant porque e mais urgente que plantar novo.
- **Luvas e Bolsa de Sementes sao paralelos**: ambos requerem apenas `helper` ativo, nao sao sequenciais entre si.
- **spoilTimeMs estendido para 10s**: com luvas ativas, o jogador ganha mais tempo antes de apodrecer (6s → 10s), complementando a limpeza automatica.
- **clearRottenPlotWithSource**: criado para evitar side effects de mensagem/commit incompativeis com automacao do helper (mesmo padrao de `harvestPlotWithSource`).

---

## Feature 2 — Goals de progressao mid/late game

### Arquivos modificados
| Arquivo | Mudanca |
|---------|---------|
| `src/config/gameConfig.js:116-187` | 4 novos goals adicionados ao array `progressionGoals` |
| `src/systems/progression.js` | Novos `targetType`: `soldTotal`, `prestigeLevel` em `hasReachedGoal()` |
| `src/ui/render.js:339` | `getGoalCurrentValue()` — handlers para `soldTotal` e `prestigeLevel` |
| `src/ui/render.js` | `getGoalProgressText()` — "vendidos" e "Prestigio feito/pendente" |
| `src/main.js:362-366` | `completedGoalIds` preservados no prestige reset |

### Goals adicionados

| ID | Titulo | targetType | targetValue | Recompensa |
|----|--------|------------|-------------|------------|
| `sell-20` | Comerciante | soldTotal | 20 | +6 moedas |
| `harvest-50` | Colheita farta | harvestedTotal | 50 | +8 moedas, +4 sementes |
| `all-upgrades` | Fazenda completa | upgradesPurchased | 5 | +12 moedas |
| `prestige-1` | Fazendeiro de prestigio | prestigeLevel | 1 | +5 sementes |

### Decisoes tecnicas
- **completedGoalIds preservados no prestige**: sem isso, goals ja completados seriam re-completados apos prestige, dando recompensas duplicadas. A preservacao e feita copiando o array antes do reset e restaurando no novo estado.
- **Total de goals agora e 8**: todos os testes e2e precisaram ser atualizados de "0/4 metas" para "0/8 metas".

---

## Feature 3 — Evento negativo "Praga"

### Arquivos modificados
| Arquivo | Mudanca |
|---------|---------|
| `src/config/gameConfig.js:106-113` | Definicao do evento `pest` com `sellPricePenalty: 1` |
| `src/systems/market.js:77-79` | `getSellPrice()` aplica penalidade com floor em `minPrice` |
| `src/systems/events.js:89-91` | Tag "Reduz preco de venda" |
| `src/systems/events.js:117-119` | Texto de efeito "-1 por morango." |
| `src/ui/render.js:219-220` | Market effect "Praga ativa." |
| `public/style.css` | `.event-banner--pest` com gradiente avermelhado |

### Decisao de design importante
O game-designer propôs originalmente `spoilTimeMultiplier: 0.5` (morangos apodrecem 2x mais rapido). O economy-balance-designer mudou para `sellPricePenalty: 1` (preco de venda reduzido em 1 moeda). Razao: penalidade de preco e mais intuitiva para o jogador, mais facil de balancear, e nao requer logica complexa de aceleracao de `rottenAt` em plots existentes.

---

## Feature 4 — Barra de progresso de apodrecimento

### Arquivos modificados
| Arquivo | Mudanca |
|---------|---------|
| `src/systems/plots.js:200-207` | `getSpoilProgress()` — calculo regressivo usando `spoilDurationMs` |
| `src/systems/plots.js:40-46` | Plots ready recebem `spoilDurationMs` ao transitar |
| `src/systems/plots.js:48-58` | Transicao growing→ready define `rottenAt` e `spoilDurationMs` |
| `src/state/createGameState.js` | `spoilDurationMs: null` no template de plot |
| `src/state/persistence.js:202` | Hydration de `spoilDurationMs` no load |
| `src/ui/farmGrid.js:82-93` | progressTrack visivel para `growing` E `ready`, com classe CSS distinta |
| `public/style.css` | `.plot__progress-fill--spoil` com gradiente vermelho→laranja |

### Decisoes tecnicas
- **`spoilDurationMs` armazenado no plot**: necessario para calculo preciso da barra quando `spoilTimeMs` varia (com/sem Luvas Resistentes). Sem isso, o fallback seria `config.crop.spoilTimeMs` que pode nao refletir o valor real.
- **Barra regressiva**: vai de 100% (acabou de ficar ready) para 0% (prestes a apodrecer). Direcao oposta da barra de crescimento para diferenciar visualmente.

---

## Bugs encontrados e corrigidos (8 total, 3 ciclos de QA)

### Ciclo 1 (4 bugs)
1. **BUG-1 (CRITICO)**: `helperGloves` nao hidratado no load — `persistence.js`
2. **BUG-2 (ALTO)**: `spoilDurationMs` nao hidratado no load — `persistence.js`
3. **BUG-3 (ALTO)**: Contagem de metas "0/4" hardcoded nos e2e — 4 instancias
4. **BUG-4 (BAIXO)**: "upgrades" em ingles no `render.js`

### Ciclo 2 (2 bugs)
5. **NOVO-BUG-1 (ALTO)**: `window.SF.state` nao existe — API correta e `__strawberryFarmDebug`
6. **NOVO-BUG-2 (MEDIO)**: Instancia perdida de "1/4" na linha 293 do e2e

### Ciclo 3 (2 bugs)
7. **BUG-5 (ALTO)**: Meta `prestige-1` concede +5 sementes automaticamente apos prestigio, quebrando assertiva do cenario 8
8. **BUG-6 (ALTO)**: `preparePostPrestigeProgression` com stats insuficientes para atingir 8/8 metas no cenario 9

### Padrao recorrente
Adicionar novos campos ao estado (`helperGloves`, `spoilDurationMs`) exige hydration correspondente em `persistence.js`. Este padrao aparece em todo sprint que adiciona estado novo — considerar checklist obrigatorio.

---

## Arquivos modificados — resumo completo

| Arquivo | Tipo |
|---------|------|
| `src/config/gameConfig.js` | Gameplay |
| `src/state/createGameState.js` | Gameplay |
| `src/state/persistence.js` | Gameplay |
| `src/systems/plots.js` | Gameplay |
| `src/systems/helper.js` | Gameplay |
| `src/systems/events.js` | Gameplay |
| `src/systems/market.js` | Gameplay |
| `src/systems/progression.js` | Gameplay |
| `src/ui/render.js` | Gameplay |
| `src/ui/farmGrid.js` | Gameplay |
| `src/main.js` | Gameplay |
| `src/utils/dom.js` | UI |
| `public/index.html` | UI |
| `public/style.css` | UI |
| `tests/playwright/strawberry-farm.e2e.js` | Testes |

**Total: 15 arquivos** (11 JS gameplay + 2 UI + 1 CSS + 1 teste)
