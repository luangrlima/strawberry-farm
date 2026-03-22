# QA Report — Sprint 19

## Resumo

Sprint 19 implementou canteiros visuais (emojis grandes, badges, timers), tradução completa PT-BR e fazenda protagonista (plots 120px, fundo terroso, sidebars com opacity reduzida).

## Resultados dos testes

### Validação estrutural
- `node --check` passou em todos os 17 arquivos JS do projeto
- Nenhum erro de sintaxe encontrado

### Smoke test (`npm run test:smoke`)
- **Resultado: APROVADO**
- Todos os 6 cenários passaram: HUD inicial, plantio e reload, combo expirado, apodrecimento e limpeza, save legado, prestígio e reset
- Evidência: `tests/artifacts/strawberry-farm-smoke-20260321-231241-433.png`

### E2E test (`npm run test:e2e`)
- **Resultado: APROVADO (após correção de strings)**
- Rodada inicial falhou no cenário 5 por strings desatualizadas (ver BUG-1 abaixo — corrigido)
- Re-validação: 11/11 cenários passaram (HUD, ajuda, mercado, save/load, save legado, combo, apodrecimento, expansão, evento Feira, upgrades, helper, prestígio, progressão, reset, mobile)
- Evidência: `tests/artifacts/strawberry-farm-test-20260321-231010-097.png`

## Bugs encontrados

### BUG-1: Testes e2e desatualizados — strings PT-BR não refletidas (CORRIGIDO)
**Causa raiz:** O Sprint 19 atualizou strings no código do jogo, mas os testes e2e ainda esperavam as strings antigas.

**Instâncias corrigidas (8 no total):**

| Arquivo | Correção | Status |
|---------|----------|--------|
| `strawberry-farm.e2e.js` | `"Nivel"` → `"Nível"` (4 instâncias) | Corrigido |
| `strawberry-farm.e2e.js` | `"Helper ativo"` → `"Ajudante ativo"` | Corrigido |
| `strawberry-farm.e2e.js` | `"Strawberry Knowledge"` → `"Conhecimento do Morango"` | Corrigido |
| `strawberry-farm.e2e.js` | `"Proximo nivel"` → `"Próximo nível"` | Corrigido |
| `strawberry-farm.e2e.js` | `"Bonus atual"` → `"Bônus atual"` | Corrigido |

**Severidade original:** Crítica — **resolvida na re-validação**

### BUG-2: Fixture legada e template e2e com strings em inglês (BAIXO)
- `tests/fixtures/legacy-save-v1.json:53` tem `"Helper pronto."` (dado de save antigo — comportamento correto, simula save pré-sprint-19)
- `tests/playwright/strawberry-farm.e2e.js:139` tem `"Helper ativado."` como `lastActionText` para template de save legado — deveria ser `"Ajudante ativado."` para consistência com o código atual (`main.js:251`)

**Severidade:** Baixa — são dados internos de save que passam pelo hydrate sem validação de texto visível.

## Validação visual (inspeção estática + screenshot)

### Canteiros visuais
- [x] Plot `empty` mostra emoji ⬜ + badge "Plantar", sem timer (`farmGrid.js:83` esconde timer para empty)
- [x] Plot `growing` mostra 🌱 + badge "Aguarde" + timer "Faltam Xs" + barra de progresso
- [x] Plot `ready` mostra 🍓 + badge "Colher" + timer "Estraga em..."
- [x] Plot `rotten` mostra 💀 + badge "Limpar" + timer "Clique para limpar"
- [x] Emojis em 2.5rem (`style.css:733`)
- [x] `name`, `stage`, `hint` escondidos com `hidden = true` (`farmGrid.js:80-82`)

### PT-BR — verificação de texto
- [x] HUD usa 💰🌱🍓📊 (`index.html:39,44,49,54`)
- [x] "Ajudante" em vez de "Helper" nos contextos visíveis (`index.html:71,115,283,285,289,292`)
- [x] "Conhecimento do Morango" em vez de "Strawberry Knowledge" (`index.html:205`, `render.js:261`)
- [x] "Temporada 1" em vez de "UI Sprint 17" (`index.html:14`)
- [x] Pills corretas: "Morangos frescos", "Sessões rápidas", "Conhecimento acumulado" (`index.html:18-21`)
- [x] Acentuação correta: "Nível" (`render.js:95,97,100,139,140`), "máximo" (`render.js:95,100`), "Próximo" (`render.js:267`), "Concluída" (`render.js:333`), "bônus" (`render.js:225`)

**Textos residuais em inglês (problemas de design, não bugs):**
- "Reset" no botão (`index.html:86`) — palavra curta, pode ser intencional
- "On"/"Off" no status do ajudante (`render.js:239`) — abreviações compactas, pode ser intencional

### Fazenda protagonista
- [x] Plots com `min-height: 120px` (`style.css:690`)
- [x] `farm-section` com fundo terroso via gradient (`style.css:622-624`)
- [x] Sidebars com `opacity: 0.92` (`style.css:251`)

### Acessibilidade
- [x] aria-labels completos nos plots com nome, etapa, timer e hint (`plots.js:268-270`)
- [x] aria-live="polite" nas seções dinâmicas (combo, helper, evento, mercado, prestígio)

## Problemas de design encontrados

### DESIGN-1: "On"/"Off" e "Reset" são os últimos textos em inglês
**Contexto:** Toda a interface foi traduzida, mas esses 3 pontos ainda usam inglês.
**Severidade:** Baixa
**Sugestão:** Considerar "Ligado"/"Desligado" para o status do ajudante e "Reiniciar" para o botão de reset, se o objetivo é zero inglês.

## Status final

- Validação estrutural: aprovada
- Smoke test: aprovado (6/6 cenários)
- E2E test: **aprovado** (11/11 cenários — após correção de 8 strings nos testes)
- Visual (canteiros): aprovado
- PT-BR: aprovado (com 3 pontos residuais de design)
- Fazenda protagonista: aprovada
- Acessibilidade: aprovada
- Re-validação executada em 21 de março de 2026

**Status: APROVADO**
