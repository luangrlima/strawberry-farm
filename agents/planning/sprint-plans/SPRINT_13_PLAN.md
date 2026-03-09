# Sprint 13 — Upgrades em Niveis na UI

## Sprint Goal
Transformar `Adubo rapido` e `Caixa premium` em melhorias com niveis visiveis na interface, permitindo mais de uma compra por sistema e deixando o proximo ganho de performance claro sem aumentar a complexidade do loop principal.

---

## In Scope

- converter `adubo` e `caixa premium` de upgrades binarios para upgrades com niveis
- expor nivel atual, custo do proximo tier e ganho acumulado nos cards de melhoria
- manter o restante da HUD compacto e coerente com o redesign anterior
- preservar compatibilidade de save/load com saves antigos que ainda armazenam upgrades como booleanos
- ampliar a regressao automatizada para cobrir os novos niveis de melhoria

---

## Out of Scope

- novos sistemas alem de `adubo` e `caixa premium`
- rebalanceamento de helper, plantio assistido, expansao ou prestigio
- mudanca estrutural ampla na arquitetura do jogo
- alteracao do loop principal de plantar, colher e vender alem do necessario para suportar niveis

---

## Implementation Plan

- introduzir um modulo pequeno de upgrades para centralizar nivel atual, custo do proximo nivel e efeitos acumulados
- atualizar configuracao, estado inicial e hidratacao para suportar upgrades numericos e migrar saves booleanos para nivel `1`
- recalcular tempo de crescimento e bonus de venda a partir do nivel atual de cada melhoria
- redesenhar os cards de `Adubo rapido` e `Caixa premium` com meta de nivel, texto de ganho atual e preview do proximo tier
- ajustar a suite Playwright para validar os novos contratos de UI e economia em niveis multiplos

---

## Risks

- saves antigos podem carregar estados incoerentes se a migracao de booleano para nivel nao for tratada explicitamente
- a nova progressao pode acelerar demais a economia se os custos e bonus nao escalarem juntos
- a regressao automatizada pode ficar flakey se depender de crescimento natural em cenarios que agora levam mais tempo

---

## QA Focus

- compra repetida de `Adubo rapido` e `Caixa premium`
- persistencia de niveis apos reload
- calculo acumulado de crescimento, mercado, evento e prestigio
- reset total e prestigio restaurando upgrades de nivel para o estado base
- clareza visual de nivel atual, proximo custo e ganho atual nos cards
