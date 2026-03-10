# Sprint 14 — Runtime Hardening

## Sprint Goal
Fortalecer a arquitetura runtime reduzindo o acoplamento entre `main.js`, `render.js` e persistência, tornando atualização temporal, save/load e renderização mais previsíveis sem alterar o gameplay.

---

## In Scope

- centralizar a orquestração temporal do runtime
- reduzir `src/main.js` a bootstrap, eventos e delegação
- tornar `src/ui/render.js` somente leitura
- padronizar passagem de `now` para sistemas temporizados
- versionar o save na serialização sem quebrar compatibilidade
- preservar `file://`, `window.__strawberryFarmDebug` e os IDs atuais de DOM

---

## Out of Scope

- novas mecânicas
- rebalanceamento de economia
- redesign de HUD
- mudança de framework, bundler ou backend
- telemetria remota
- camada nova de testes unitários

---

## Implementation Plan

- criar `src/systems/runtime.js` como coordenador único de commit, tick, render e UI state transitório
- migrar `src/main.js` para consumir o coordenador de runtime em vez de concentrar regras duplicadas
- retirar mutações de estado e sincronização temporal de `src/ui/render.js`
- passar `now` explicitamente para `events`, `market`, `combo`, `helper`, `plots` e renderização do grid
- separar serialização e hidratação em `src/state/persistence.js`, adicionando `SAVE_VERSION`
- registrar o novo módulo em `public/index.html`

---

## Risks

- regressão sutil de timing em combo, helper ou eventos
- incompatibilidade de save se a hidratação não cobrir bem os formatos antigos
- quebra indireta na suite Playwright por depender de copy e de timing específico
- diferenças de comportamento entre render full e render live após centralização

---

## QA Focus

- loop completo de plantio, crescimento, colheita e venda
- helper, plantio assistido, combo, eventos, expansão, prestígio e reset
- save/load durante sistemas ativos
- compatibilidade com saves antigos de upgrades booleanos
- carregamento em `file://`
- disponibilidade contínua do `window.__strawberryFarmDebug`
