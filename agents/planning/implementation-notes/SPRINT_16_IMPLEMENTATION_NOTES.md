# Implementation Notes

## Summary of actual code changes

- `src/systems/runtime.js`
  - adicionou `resetUiState`, `persistState` e `persistAndRender`
  - fez `commit` e `replaceState` reutilizarem a persistência central
  - fez `tick()` reaproveitar `reconcileState()` para reduzir duplicação do avanço temporal
  - fez `replaceState` aceitar `message` e `toast`, reduzindo fluxo manual nos state swaps especiais

- `src/main.js`
  - removeu fluxos manuais de `save` + `render` em debug helpers, `prestige`, `reset`, ajuda e autosave
  - passou a usar `replaceState` e `persistAndRender` do runtime nos fluxos especiais
  - simplificou `prestige` e `reset` para um único caminho de troca de estado

- `src/state/persistence.js`
  - removeu o acoplamento direto com `renderSaveStatus`

- `src/systems/plots.js`
  - removeu renderização direta ao tentar plantar sem sementes
  - passou a delegar feedback ao runtime

- `src/systems/combo.js`
  - unificou a borda temporal do combo para considerar ativo apenas quando `now < expiresAt`

- `tests/playwright/strawberry-farm.e2e.js`
  - passou a rodar em `headless` por padrão
  - passou a aceitar `PW_HEADLESS` e `PW_SLOW_MO`
  - passou a falhar com mensagem explícita quando `playwright` não estiver instalado
  - ganhou um cenário de save legado sem `saveVersion`

- `tests/playwright/strawberry-farm.smoke.js`
  - adicionou um subset repo-native curto com cenários de HUD inicial, plantio/reload, combo expirado, save legado e prestígio/reset

- `tests/fixtures/legacy-save-v1.json`
  - adicionou uma fixture legada explícita para materializar saves sem `saveVersion`

- `package.json`
  - adicionou manifest mínimo repo-native para o Playwright
  - adicionou `npm run test:smoke`, `npm run test:e2e` e `npm run test:e2e:headed`

- `README.md`
  - substituiu links absolutos de outra máquina por links portáveis do repositório

- `tests/README.md`
  - documentou os defaults de execução do script de QA
  - documentou o smoke repo-native e a fixture legada

- `agents/prompts/post-audit-correction-sprint-master.md`
  - adicionou um prompt reutilizável para sprints corretivas disparadas a partir de auditorias anteriores

## Notes

- esta sprint não adicionou mecânicas novas
- a correção foi propositalmente menor do que a Sprint 14
- a parte de QA continua limitada neste ambiente pela ausência da dependência `playwright`
- mesmo sem a dependência instalada aqui, o repo agora contém o caminho mínimo para reproduzir a suíte oficial
