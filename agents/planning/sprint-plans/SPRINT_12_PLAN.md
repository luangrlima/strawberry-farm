# Sprint 12 — Redesign Visual da UI

## Sprint Goal
Melhorar a interface grafica do `Strawberry Farm` sem adicionar sistemas novos, reduzindo o excesso de texto, ocupando melhor os espacos vazios e deixando o tabuleiro, recursos e paineis de suporte mais agradaveis e rapidos de ler.

---

## In Scope

- reorganizar a HUD para dar mais destaque visual ao tabuleiro central
- reduzir a dependencia de blocos textuais longos em cards, status e botoes
- fortalecer a hierarquia visual de recursos, mercado, eventos, prestigio e upgrades
- melhorar o uso do espaco em desktop sem perder responsividade mobile
- preservar ids, feedback principal e comportamento de gameplay para manter compatibilidade com a renderizacao e regressao

---

## Out of Scope

- novos upgrades, sistemas, moedas ou mecanicas
- rebalanceamento de economia, eventos, helper ou prestigio
- mudancas no save/load alem do necessario para manter a UI funcional
- refactor amplo da arquitetura do runtime

---

## Implementation Plan

- redesenhar `public/index.html` para agrupar o jogo em tres zonas mais legiveis: overview, palco do tabuleiro e coluna de suporte
- substituir a direcao visual de `public/style.css` por um layout mais forte, com melhor preenchimento de espaco, cards mais visuais e canteiros mais destacados
- encurtar copy dinamica em `src/ui/render.js` onde a UI atual depende de textos muito longos, mantendo os contratos literais usados pelos testes
- validar o layout contra a regressao Playwright existente e ajustar a densidade do desktop para manter o tabuleiro acima da dobra

---

## Risks

- o redesign pode quebrar contratos literais ja usados pela regressao automatizada
- o ganho visual pode aumentar demais a altura da tela e reintroduzir scroll no desktop
- reduzir texto demais pode piorar a clareza de upgrades e prestigio

---

## QA Focus

- tela inicial continua cabendo no viewport desktop alvo sem scroll global excessivo
- loop inicial, upgrades, eventos, helper, prestigio e reset continuam funcionais
- textos importantes para helper plantio, meta final e prestigio continuam claros
- layout mobile permanece legivel apos a nova composicao
