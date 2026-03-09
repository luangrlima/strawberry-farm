# Sprint 11 — Plantio Assistido do Helper

## Sprint Goal
Adicionar um upgrade de gameplay que permita ao `Farm Helper` plantar sementes automaticamente de forma limitada, sem remover a necessidade de o jogador comprar sementes, vender morangos e jogar ativamente para performar melhor.

---

## In Scope

- criar um upgrade separado para habilitar plantio assistido do helper
- manter a colheita automatica atual como comportamento base do helper
- fazer o helper plantar apenas quando nao houver colheita disponivel no ciclo
- consumir sementes do estoque normal do jogador ao plantar automaticamente
- atualizar HUD, copy de upgrade e faixa do helper para comunicar a nova regra
- validar persistencia, prioridade de colheita e ausencia de combo automatico

---

## Out of Scope

- compra automatica de sementes
- venda automatica de morangos
- automacao total da fazenda
- novos sistemas de recursos ou energia
- rebalanceamento amplo de mercado, eventos ou prestigio

---

## Implementation Plan

- adicionar `helperPlanting` em `src/config/gameConfig.js` e no estado salvo
- reaproveitar o ciclo atual do helper em `src/systems/helper.js`
- priorizar colheita; se nao houver canteiro pronto e o upgrade estiver ativo, plantar 1 vazio consumindo 1 semente
- estender `src/systems/plots.js` com plantio por origem para evitar mensagens manuais indevidas
- expor o novo upgrade em `public/index.html` e refletir estado em `src/ui/render.js`
- ampliar `tests/playwright/strawberry-farm.e2e.js` para cobrir compra do upgrade, plantio automatico, persistencia e nao ativacao de combo

---

## Risks

- helper ficar forte demais se plantar rapido demais
- UI nao deixar claro que o jogador ainda precisa abastecer sementes
- regressao em save/load por novo campo de upgrade
- testes do helper ficarem frageis se dependerem de timing real

---

## QA Focus

- helper continua priorizando colheita antes de plantar
- plantio assistido so acontece com upgrade comprado e sementes em estoque
- plantio assistido nao ativa combo
- helper e upgrade persistem apos reload
- loop manual continua relevante porque sementes e venda permanecem manuais
