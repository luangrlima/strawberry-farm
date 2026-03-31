# Sprint 22 — Notas de Implementacao

## Tipo de sprint
`ui-sprint-master` — Clareza visual dos canteiros com sprites por estado

## Resumo
O sprint removeu a dependência visual de emoji nos canteiros e introduziu um spritesheet local para o morango, mantendo o gameplay intacto. O ajuste final do sprint corrigiu a ordem invertida dos frames para que o plantio comece na semente.

---

## Implementação 1 — Resolvedor de sprite por estado

### Arquivos
- `src/systems/plots.js`
- `src/ui/farmGrid.js`

### Mudanças
- `plots.js` agora expõe `getPlotSprite(plot, now)` além dos helpers de texto
- o crescimento foi mapeado para `strawberry-growing-1`, `strawberry-growing-2` e `strawberry-growing-3`
- `ready` usa o frame maduro do morango
- `rotten` reutiliza o frame maduro com tratamento visual próprio
- `farmGrid.js` passou a renderizar `data-sprite`, `data-state` e coordenadas CSS em vez de `textContent` com emoji

### Decisão
- a lógica dos estados do jogo continua a mesma; só a camada de representação visual foi trocada

---

## Implementação 2 — Camada visual de sprite e solo

### Arquivos
- `public/style.css`
- `public/assets/farming-crops-16x16.png`
- `public/assets/farming-crops-16x16.CREDITS.txt`

### Mudanças
- `plot__emoji` virou um contêiner visual com pseudo-elementos para solo e sprite
- o spritesheet local usa `image-rendering: pixelated` e `background-position` por frame
- o estado vazio ganhou uma base visual de terra sem depender de texto visível
- o estado podre aplica dessaturação e escurecimento ao frame maduro

### Asset adotado
- asset: `Farming crops 16x16`
- autor: `josehzz`
- origem: `https://opengameart.org/content/farming-crops-16x16`
- licença: `CC0 1.0`

### Correção aplicada durante a sessão
- o spritesheet de morango estava lido na ordem inversa da esperada
- o mapeamento foi corrigido para `semente -> broto -> quase pronto -> maduro`

---

## Implementação 3 — Cobertura de QA para sprite state

### Arquivos
- `tests/playwright/strawberry-farm.smoke.js`
- `tests/playwright/strawberry-farm.e2e.js`
- `tests/manual/TEST_SCENARIOS.md`

### Mudanças
- smoke ganhou asserts de `data-sprite` para terra, crescimento, podre e limpeza
- e2e ganhou asserts equivalentes para o fluxo real de plantio, reload e apodrecimento
- o cenário manual `UI-01` passou a exigir sprite em vez de emoji

## Validação executada
- `node --check src/systems/plots.js`
- `node --check src/ui/farmGrid.js`
- `node --check tests/playwright/strawberry-farm.smoke.js`
- `node --check tests/playwright/strawberry-farm.e2e.js`
- `npm run test:smoke`
- `npm run test:e2e`

## Evidências
- `tests/artifacts/strawberry-farm-smoke-20260330-230942-002.png`
- `tests/artifacts/strawberry-farm-test-20260330-230942-000.png`
