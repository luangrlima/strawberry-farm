# QA Report

## Review mode

Sprint 15 foi executada como auditoria crítica da Sprint 14, não como sprint de feature ou refactor novo.

## Evidence reviewed

### code inspection
- revisão direta de `src/main.js`, `src/systems/runtime.js`, `src/state/persistence.js`, `src/systems/plots.js`, `src/ui/render.js`, `src/ui/farmGrid.js` e `src/systems/combo.js`
- revisão dos artefatos da Sprint 14 em `agents/planning/` e `tests/reports/`
- revisão da suíte oficial em `tests/playwright/strawberry-farm.e2e.js`

### multi-agent audit
- parecer do `Diretor de Produto`
- parecer do `Designer de Jogo`
- parecer do `Designer de Economia e Balanceamento`
- parecer do `Desenvolvedor de Gameplay`
- parecer do `Desenvolvedor de UI/UX`
- parecer do `Agente de QA e Playtest`

## Findings

1. a centralização prometida pela Sprint 14 ficou incompleta
   - `src/main.js` ainda contém múltiplos fluxos diretos de `save` + `render`
   - `src/state/persistence.js` ainda acopla persistência e UI
   - `src/systems/plots.js` ainda dispara renderização em um fluxo de gameplay
   - impacto: alto

2. o QA da Sprint 14 não sustenta confiança suficiente para um refactor desse tamanho
   - o próprio relatório da Sprint 14 admite que a regressão oficial não rodou
   - a suíte versionada ainda está configurada com `headless: false` e `slowMo: 100`
   - impacto: alto

3. a previsibilidade temporal do loop ainda tem bordas frágeis
   - `combo` decide na colheita com `now <= expiresAt`
   - o ticker expira combo com `now >= expiresAt`
   - reload reconcilia imediatamente mercado, evento, combo, helper e plots
   - impacto: alto

4. a prova de compatibilidade com saves antigos é insuficiente
   - há `SAVE_VERSION`, mas faltam fixtures e execuções repo-native com payload legado sem versão
   - impacto: alto

5. a evidência operacional ainda não é plenamente reproduzível entre máquinas
   - a Sprint 14 se apoiou em smoke com Playwright temporário fora do repositório
   - o `README` ainda contém links absolutos de outra máquina
   - impacto: médio

## Final status

- Sprint 14 auditada: sim
- Sprint 14 aprovada sem ressalvas: não
- bloqueadores encontrados: centralização incompleta, QA insuficiente e bordas temporais sem validação adequada
- status final: revisão crítica concluída, com necessidade de sprint corretiva curta antes de considerar o hardening encerrado
