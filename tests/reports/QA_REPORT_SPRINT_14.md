# QA Report

## Results of tests performed

### structural validation
- verificação sintática com `node --check` passou em `main`, `render`, `persistence`, `runtime`, `farmGrid` e sistemas alterados
- varredura estática confirmou que `src/ui/render.js` não contém mais mutações diretas de `game.state` ou `uiState`
- varredura estática confirmou que chamadas diretas a `SF.render.render*` foram concentradas em `src/systems/runtime.js`

### browser smoke
- smoke headless executado em `Chromium` via Playwright temporário fora do repositório
- o runtime carregou corretamente em `file://`, renderizou a HUD principal, aceitou plantio e preservou o estado após reload
- um segundo smoke validou `window.__strawberryFarmDebug`, persistência de evento ativo e habilitação do prestígio após `setState`

### full regression
- a regressão completa em `tests/playwright/strawberry-farm.e2e.js` não foi executada neste sprint
- motivo: o repositório ainda não possui setup local reproduzível da dependência `playwright` para o script Node atual

## Issues found during QA

1. o smoke do entrypoint compatível da raiz não virou evidência confiável porque a página muda rapidamente por `meta refresh`
   - impacto: baixo
   - mitigação: inspeção estática do `index.html` permaneceu intacta e o runtime real em `public/index.html` carregou com sucesso nos smokes

2. a regressão ponta a ponta ainda depende de setup externo ao repositório
   - impacto: médio
   - mitigação: a sprint validou sintaxe, acoplamento estrutural e dois smokes em navegador headless do runtime principal

## Final status

- bugs críticos: não observados no smoke estrutural
- regressão funcional completa: não verificada
- status final: parcial
