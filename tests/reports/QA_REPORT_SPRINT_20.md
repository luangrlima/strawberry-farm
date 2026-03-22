# QA Report — Sprint 20 (Status Final)

Data de execucao: 2026-03-22
Re-validacao final (ciclo 4) — confirmacao de que todos os 8 bugs foram corrigidos e todas as 4 features do Sprint 20 estao funcionais.

---

## 1. Cenarios de teste executados

### Validacao estrutural
- `node --check` em todos os 17 arquivos JS de `src/`
- `node --check` nos 2 arquivos de teste em `tests/playwright/`

### Testes automatizados
- `npm run test:smoke` — 6 cenarios
- `npm run test:e2e` — 11 cenarios

### Verificacao dos bugs corrigidos
- BUG-1: Verificado que `persistence.js` hidrata `helperGloves`
- BUG-2: Verificado que `persistence.js` hidrata `spoilDurationMs` nos plots
- BUG-3: Verificado strings de contagem de metas no e2e (4/4 instancias)
- BUG-4: Verificado que `render.js` usa "melhorias" em vez de "upgrades"
- NOVO-BUG-1: Verificado inject de goals com recompensa em moedas antes da assertiva de venda
- NOVO-BUG-2: Verificado linha 293 com "1/8" em vez de "1/4"

### Verificacao de features do Sprint 20
- Upgrade "Luvas Resistentes" em `gameConfig.js`
- 4 novos goals de progressao em `gameConfig.js`
- Evento "Praga" com `sellPricePenalty` em `gameConfig.js` e `market.js`
- Barra de progresso de apodrecimento em `farmGrid.js`

### Verificacao PT-BR
- Busca por strings em ingles visiveis ao jogador nos arquivos de `src/`

---

## 2. Resultado da validacao estrutural

### `node --check` — APROVADO

Todos os 19 arquivos JS passaram sem erro de sintaxe:

```
OK: src/config/gameConfig.js
OK: src/state/createGameState.js
OK: src/state/persistence.js
OK: src/systems/combo.js
OK: src/systems/events.js
OK: src/systems/helper.js
OK: src/systems/market.js
OK: src/systems/plots.js
OK: src/systems/prestige.js
OK: src/systems/progression.js
OK: src/systems/runtime.js
OK: src/systems/upgrades.js
OK: src/ui/farmGrid.js
OK: src/ui/render.js
OK: src/utils/dom.js
OK: src/utils/format.js
OK: src/main.js
OK: tests/playwright/strawberry-farm.smoke.js
OK: tests/playwright/strawberry-farm.e2e.js
```

---

## 3. Resultado dos testes automatizados

### `npm run test:smoke` — APROVADO (6/6)

```
Smoke 1: HUD inicial                        - PASSOU
Smoke 2: plantio e reload                   - PASSOU
Smoke 3: borda de combo expirada            - PASSOU
Smoke 4: apodrecimento e limpeza            - PASSOU
Smoke 5: save legado e timer edge           - PASSOU
Smoke 6: prestigio e reset                  - PASSOU
```

Evidencia: `tests/artifacts/strawberry-farm-smoke-20260322-104343-383.png`

### `npm run test:e2e` — APROVADO (11/11)

```
Cenario 1: renderizacao inicial e HUD              - PASSOU
Cenario 1.1: ajuda rapida persistente              - PASSOU
Cenario 1.2: mercado dinamico e clareza de preco   - PASSOU
Cenario 2: plantio e save/load base                - PASSOU
Cenario 2.1: save legado sem versao                - PASSOU
Cenario 2.2: combo de colheita e persistencia curta - PASSOU
Cenario 2.3: morango estraga e exige limpeza manual - PASSOU
Cenario 3: expansao da fazenda para 4x4            - PASSOU
Cenario 4: evento Feira local e economia de sementes - PASSOU
Cenario 5: upgrade de crescimento e timing da chuva  - PASSOU
Cenario 6: upgrade de venda e economia do evento Sol forte - PASSOU
Cenario 7: Farm Helper, eventos e persistencia     - PASSOU
Cenario 8: Strawberry Knowledge, reset e persistencia - PASSOU
Cenario 9: progressao apos prestigio               - PASSOU
Cenario 10: reset e restauracao completa           - PASSOU
Cenario 11: layout mobile razoavel                 - PASSOU
```

Evidencia: `tests/artifacts/strawberry-farm-test-20260322-104106-944.png`

---

## 4. Bugs encontrados e corrigidos — historico completo dos 3 ciclos de QA

### Ciclo 1 — Bugs da implementacao do Sprint 20

#### BUG-1 (CRITICO): helperGloves nao era hidratado no load

**Arquivo:** `src/state/persistence.js`, linha 120
**Descricao:** Ao carregar um save, `upgrades.helperGloves` nao era restaurado. O estado resultante sempre iniciava com `false`, perdendo a compra persistida.
**Correcao aplicada:**
```js
nextState.upgrades.helperGloves = Boolean(savedState.upgrades.helperGloves);
```
**Status:** CORRIGIDO

#### BUG-2 (ALTO): spoilDurationMs nao era hidratado no load

**Arquivo:** `src/state/persistence.js`, linhas 194-204
**Descricao:** Ao carregar um save, `spoilDurationMs` dos plots nao era restaurado. Plots em estado `ready` perdiam a referencia de tempo de apodrecimento apos reload.
**Correcao aplicada:**
```js
spoilDurationMs: Number.isFinite(savedPlot.spoilDurationMs) ? savedPlot.spoilDurationMs : null,
```
**Status:** CORRIGIDO

#### BUG-3 (ALTO): Contagem de metas desatualizada nos e2e

**Arquivo:** `tests/playwright/strawberry-farm.e2e.js`, 4 instancias
**Descricao:** O Sprint 20 adicionou 4 novos goals (total: 8), mas os testes ainda esperavam "0/4", "8/4", etc.
**Correcoes aplicadas:**
- Linha 415: `"0/8 metas"`
- Linha 929: `"8/8 metas"`
- Linha 942: `"0/8 metas"`
- Linha 293 (corrigido no ciclo 2): `"1/8"`
**Status:** CORRIGIDO

#### BUG-4 (BAIXO): "upgrades" em ingles no render.js

**Arquivo:** `src/ui/render.js`, linha 434
**Descricao:** O texto de progresso de metas exibia "X/Y upgrades" em ingles.
**Correcao aplicada:** Substituido por `"X/Y melhorias"`
**Status:** CORRIGIDO

---

### Ciclo 2 — Bugs descobertos na re-validacao do ciclo 1

#### NOVO-BUG-1 (ALTO): window.SF.state indefinido no Cenario 6

**Arquivo:** `tests/playwright/strawberry-farm.e2e.js`, linhas 719-726
**Descricao:** O bloco de neutralizacao de goals com recompensa em moedas usava `window.SF.state.progression.completedGoalIds`, mas `window.SF` nao e exposto pelo jogo. A API correta e `window.__strawberryFarmDebug`.
**Erro:** `TypeError: Cannot read properties of undefined (reading 'state')`
**Correcao aplicada:** Reescrito para usar `getState()`/`setState()`:
```js
await page.evaluate(() => {
  const currentState = window.__strawberryFarmDebug.getState();
  const goalsWithMoneyReward = ["harvest-3", "buy-upgrade", "sell-20", "harvest-50", "all-upgrades"];
  goalsWithMoneyReward.forEach((id) => {
    if (!currentState.progression.completedGoalIds.includes(id)) {
      currentState.progression.completedGoalIds.push(id);
    }
  });
  window.__strawberryFarmDebug.setState(currentState);
});
```
**Status:** CORRIGIDO

#### NOVO-BUG-2 (MEDIO — regressao do BUG-3): linha 293 ainda usava "1/4"

**Arquivo:** `tests/playwright/strawberry-farm.e2e.js`, linha 293
**Descricao:** A funcao auxiliar `preparePostPrestigeProgression` esperava `completed.includes("1/4")`, mas com 8 metas o progressSummary exibe "1/8 metas". O `waitForFunction` nunca resolvia (timeout de 5s).
**Correcao aplicada:** `completed.includes("1/8")`
**Status:** CORRIGIDO

---

### Ciclo 3 — Bugs descobertos na re-validacao do ciclo 2 (esta sessao)

#### BUG-5 (ALTO): Meta prestige-1 concede +5 sementes automaticamente apos o prestigio, quebrando assertiva do Cenario 8

**Arquivo:** `tests/playwright/strawberry-farm.e2e.js`, linha 909
**Descricao:** Apos o prestigio, o jogo cria um novo estado com `prestige.level = 1`. O `replaceState` dispara `applyProgressionGoals`, que encontra a meta `prestige-1` (targetType: prestigeLevel, targetValue: 1) nao marcada e concede a recompensa de +5 sementes. O estado inicia com 3 sementes (config.startingState.seeds) e passa para 8. O teste assertia `seedCount === "3"` mas recebia "8".
**Passos para reproduzir:**
1. Executar o e2e ate o Cenario 8
2. Clicar no botao de prestigio
3. Verificar `#seedCount` — exibe "8" em vez de "3"
**Causa raiz:** A meta `prestige-1` nao estava em `completedGoalIds` antes do click no botao de prestigio, permitindo que fosse concedida automaticamente pelo `applyProgressionGoals` apos o novo estado ter `prestige.level = 1`.
**Correcao aplicada:** Neutralizar `prestige-1` antes do clique de prestigio:
```js
await page.evaluate(() => {
  const currentState = window.__strawberryFarmDebug.getState();
  if (!currentState.progression.completedGoalIds.includes("prestige-1")) {
    currentState.progression.completedGoalIds.push("prestige-1");
  }
  window.__strawberryFarmDebug.setState(currentState);
});
```
**Status:** CORRIGIDO

#### BUG-6 (ALTO): preparePostPrestigeProgression com stats insuficientes para atingir 8/8 metas no Cenario 9

**Arquivo:** `tests/playwright/strawberry-farm.e2e.js`, funcao `preparePostPrestigeProgression` (linha 256)
**Descricao:** A funcao foi escrita para um contexto de 4 metas mas nao foi atualizada para 8 metas. Com `completedGoalIds = ["harvest-3"]` e `upgradesPurchased = 0`, apos os 3 cliques do Cenario 9 (expand + fertilizer + market), o total de metas completadas chegava a no maximo 5/8 — faltando `sell-20`, `harvest-50` e `all-upgrades`. Para completar `all-upgrades` (5 upgrades) seriam necessarios mais 3 cliques de upgrade que o cenario nao realiza.
**Passos para reproduzir:**
1. Executar o e2e ate o Cenario 9
2. Verificar `#progressSummary` — exibe "5/8 metas" apos os cliques do cenario
3. Assertiva de "8/8 metas" falha
**Correcao aplicada:** Atualizar os stats injetados para refletir o estado real de um jogador que chegou ao Cenario 9:
```js
currentState.stats.harvestedTotal = 51;
currentState.stats.upgradesPurchased = 3;
currentState.stats.soldTotal = 20;
currentState.progression.completedGoalIds = ["harvest-3", "sell-20", "harvest-50", "prestige-1", "buy-upgrade", "reach-35"];
```
Com isso, apos expand (expand-farm: 7/8) + fertilizer (4 upgrades) + market (5 upgrades → all-upgrades: 8/8).
A condicao de wait tambem foi atualizada de `"1/8"` para `"6/8"` para refletir as 6 metas pre-completadas.
**Status:** CORRIGIDO

---

## 5. Verificacao de features do Sprint 20

### Feature 1: Luvas Resistentes
- [x] Upgrade definido em `gameConfig.js:66-70` com `cost: 25`, label "Luvas Resistentes" em PT-BR
- [x] Botao `#helperGlovesButton` renderizado em `render.js:116-125`
- [x] Funcao `buyHelperGlovesUpgrade()` em `main.js:286-313`
- [x] Helper limpa rotten plots em `helper.js:55-61`
- [x] `clearRottenPlotWithSource()` em `plots.js:155-170`
- [x] `getSpoilTimeMs()` retorna 10000 com gloves, 6000 sem (`plots.js:28-33`)
- [x] Descricao atualizada quando ativo em `render.js:175-177`
- [x] Helper strip mostra "+limpeza" em `render.js:257`
- [x] Estado inicial `helperGloves: false` em `createGameState.js:35`
- [x] BUG-1 corrigido: `helperGloves` hidratado em `persistence.js:120`
- [x] Card de upgrade presente em `index.html:297-302`

### Feature 2: Goals mid/late (4 novos goals)
- [x] `sell-20`: `soldTotal >= 20`, reward `+6 moedas`
- [x] `harvest-50`: `harvestedTotal >= 50`, reward `+8 moedas +4 sementes`
- [x] `all-upgrades`: `upgradesPurchased >= 5`, reward `+12 moedas`
- [x] `prestige-1`: `prestigeLevel >= 1`, reward `+5 sementes`
- [x] Todos com textos em PT-BR
- [x] `progression.js` com handlers para `soldTotal` e `prestigeLevel`
- [x] `render.js:339` usa `SF.config.progressionGoals.length` (dinamico: 8)

### Feature 3: Evento Praga
- [x] Definido em `gameConfig.js:106-113` com `sellPricePenalty: 1`
- [x] `market.js:77-79` aplica penalidade com floor em `minPrice`
- [x] `events.js:89-91` adiciona tag "Reduz preco de venda"
- [x] `events.js:117-119` texto de efeito PT-BR correto
- [x] `render.js:219-220` market effect exibe "Praga ativa."
- [x] `accentClass: "event-banner--pest"` aplicado

### Feature 4: Barra de spoil
- [x] `getSpoilProgress()` em `plots.js:200-207`
- [x] `farmGrid.js:82-85` renderiza barra com classe `plot__progress-fill--spoil`
- [x] `farmGrid.js:91-93` progressTrack visivel para estados `growing` e `ready`
- [x] `plots.js:40-46` popula `rottenAt` e `spoilDurationMs` para plots ready
- [x] `plots.js:48-58` transicao growing->ready define `spoilDurationMs`
- [x] BUG-2 corrigido: `spoilDurationMs` hidratado em `persistence.js:202`

### Feature 5: completedGoalIds preservados no prestige
- [x] `main.js:362-366` preserva `completedGoalIds` no prestige:
  ```js
  SF.progression.applyProgressionGoals(game);
  const completedGoals = [...game.state.progression.completedGoalIds];
  const nextState = SF.state.createInitialState(now);
  nextState.prestige = nextPrestigeState;
  nextState.progression.completedGoalIds = completedGoals;
  ```

---

## 6. Verificacao PT-BR

Strings em ingles encontradas nos arquivos de codigo:

| Arquivo | Linha | Texto | Visivel ao jogador | Status |
|---------|-------|-------|-------------------|--------|
| `render.js` | 255 | `"On"` / `"Off"` | Sim | Aceito (convencao tecnica) |
| `render.js` | 485 | `"Save indisponivel"` | Sim | Residual pre-Sprint 20 |
| `index.html` | 86 | `"Reset"` | Sim | Aceito (spec permite) |

Nenhuma nova string em ingles introduzida pelo Sprint 20.

---

## 7. Problemas de design existentes (nao novos)

### DESIGN-1 (Baixa): Status "On"/"Off" do ajudante em ingles
`render.js:255` — aceito como excecao conforme spec.

### DESIGN-2 (Media): Goal "all-upgrades" — texto nao corresponde a condicao
O goal exige `upgradesPurchased >= 5`, mas e possivel atingir isso sem comprar todos os tipos de upgrade. O texto "Compre todas as melhorias" e enganoso.

### DESIGN-3 (Baixa): Texto inicial do `progressSummary` no HTML desatualizado
`index.html:219` ainda tem `"0 de 4 metas concluidas"` como texto estatico inicial, mas o JS sobrescreve imediatamente. Sem impacto real.

---

## 8. Sumario de severidade — todos os bugs

| ID | Tipo | Descricao | Severidade | Status |
|----|------|-----------|------------|--------|
| BUG-1 | Bug | helperGloves nao hidratado no load | Critica | CORRIGIDO |
| BUG-2 | Bug | spoilDurationMs nao hidratado no load | Alta | CORRIGIDO |
| BUG-3 | Bug | Contagem de metas desatualizada nos e2e (4 instancias) | Alta | CORRIGIDO |
| BUG-4 | Bug | "upgrades" em ingles no render.js | Baixa | CORRIGIDO |
| NOVO-BUG-1 | Bug | window.SF.state indefinido — API de debug incorreta no Cenario 6 | Alta | CORRIGIDO |
| NOVO-BUG-2 | Bug (regressao BUG-3) | Linha 293 usava "1/4" em vez de "1/8" | Media | CORRIGIDO |
| BUG-5 | Bug | Meta prestige-1 concede seeds nao antecipadas apos prestigio (Cenario 8) | Alta | CORRIGIDO |
| BUG-6 | Bug | preparePostPrestigeProgression com stats insuficientes para 8 metas (Cenario 9) | Alta | CORRIGIDO |

---

## 9. Evidencias

### Screenshots de sucesso
- Smoke final: `tests/artifacts/strawberry-farm-smoke-20260322-104731-214.png`
- E2E final (11/11): `tests/artifacts/strawberry-farm-test-20260322-104615-051.png`

### Screenshots de erro (historico dos ciclos)
- Ciclo 1 — Cenario 6 (NOVO-BUG-1): `tests/artifacts/strawberry-farm-test-error-20260322-100456-902.png`
- Ciclo 2 — Cenario 6 (window.SF): `tests/artifacts/strawberry-farm-test-error-20260322-103045-868.png`
- Ciclo 2 — Cenario 8 (seeds=8): `tests/artifacts/strawberry-farm-test-error-20260322-103219-030.png`
- Ciclo 3 — Cenario 9 (5/8 metas): `tests/artifacts/strawberry-farm-test-error-20260322-103457-240.png`
- Ciclo 3 — Cenario 9 (timeout 6/8): `tests/artifacts/strawberry-farm-test-error-20260322-103911-782.png`

---

## 10. Status final

| Checklist | Resultado |
|-----------|-----------|
| Validacao estrutural (`node --check`) | APROVADO (19/19) |
| `npm run test:smoke` | APROVADO (6/6) |
| `npm run test:e2e` | APROVADO (11/11) |
| BUG-1 corrigido (helperGloves hydration) | APROVADO |
| BUG-2 corrigido (spoilDurationMs hydration) | APROVADO |
| BUG-3 corrigido (contagem de metas e2e — 4/4 instancias) | APROVADO |
| BUG-4 corrigido ("melhorias" em PT-BR) | APROVADO |
| NOVO-BUG-1 corrigido (window.__strawberryFarmDebug) | APROVADO |
| NOVO-BUG-2 corrigido (linha 293: "1/8") | APROVADO |
| BUG-5 corrigido (neutralizacao prestige-1 antes do prestigio) | APROVADO |
| BUG-6 corrigido (stats e completedGoalIds para 8 metas) | APROVADO |
| Verificacao PT-BR | APROVADO (sem regressao) |
| Feature Luvas Resistentes | APROVADO |
| Feature Goals mid/late (4 novos goals) | APROVADO |
| Feature Evento Praga | APROVADO |
| Feature Barra de spoil | APROVADO |
| completedGoalIds preservados no prestige | APROVADO |

## STATUS GERAL: APROVADO

Todos os 19 arquivos JS passam na validacao de sintaxe. Smoke (6/6) e e2e (11/11) aprovados. Os 8 bugs encontrados ao longo dos 3 ciclos de QA foram corrigidos. As 4 features do Sprint 20 estao validadas. Nenhuma regressao de PT-BR identificada.
