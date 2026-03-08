# Sprint 10 — UI Compacta e Leitura Rápida

## Sprint Goal
Reduzir o texto visível na tela principal e tornar a interface mais limpa, compacta e fácil de escanear sem alterar o gameplay.

---

## In Scope

- compactar HUD e módulos de status
- reduzir microcopy persistente em banners, upgrades, prestígio e ajuda
- manter a fazenda como foco central
- transformar informações secundárias em chips, labels curtas e resumos
- preservar todos os sistemas atuais

---

## Out of Scope

- novas mecânicas
- mudanças de economia ou balanceamento
- mudanças de arquitetura
- redesign visual complexo
- qualquer alteração no loop principal do jogo

---

## Implementation Plan

- reduzir o volume de texto fixo em `public/index.html`
- reorganizar o HUD em cards primários + faixa compacta de status
- encurtar mensagens e descrições em `src/ui/render.js` e `src/main.js`
- ajustar `public/style.css` para menor densidade vertical e melhor leitura no desktop
- preservar IDs e estruturas críticas para minimizar impacto nos testes

---

## Risks

- reduzir texto demais e prejudicar clareza para jogador novo
- quebrar layout responsivo ao compactar módulos
- causar regressões no Playwright se labels centrais forem alteradas em excesso

---

## QA Focus

- visibilidade de recursos, ações e fazenda sem scroll no desktop
- clareza de evento, mercado, helper e prestígio com copy reduzida
- regressão de plantio, colheita, venda, helper, prestígio e save/load
- comportamento mobile razoável após compactação
