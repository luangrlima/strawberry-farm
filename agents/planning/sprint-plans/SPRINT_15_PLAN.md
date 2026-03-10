# Sprint 15 — Revisão Crítica da Sprint 14

## Sprint Goal
Auditar criticamente a Sprint 14 para verificar se o hardening de runtime foi bem executado, apontar falhas técnicas e de processo, e consolidar uma direção objetiva de correção sem adicionar novas mecânicas ao jogo.

---

## In Scope

- revisar `AGENTS.md`, `README.md`, código atual e o QA vigente da Sprint 14
- auditar o trabalho da Sprint 14 pelos seis papéis do time coordenados pelo `Diretor Geral do Jogo`
- identificar problemas de arquitetura, manutenção, previsibilidade de gameplay, QA e evidência operacional
- registrar críticas priorizadas com referências de arquivo
- propor um escopo pequeno de correção para a próxima sprint

---

## Out of Scope

- novas mecânicas
- rebalanceamento numérico
- redesign de HUD
- novo refactor amplo de arquitetura
- correções grandes de código além dos artefatos da própria auditoria

---

## Review Focus

- verificar se `src/systems/runtime.js` realmente virou o ponto único de coordenação
- verificar se `src/main.js`, `src/state/persistence.js` e `src/systems/plots.js` ainda mantêm caminhos paralelos de `save` e `render`
- verificar se `tick`, `commit`, `replaceState`, `reset` e `prestige` seguem o mesmo contrato
- verificar se a Sprint 14 preservou o loop e o timing percebido do jogo
- verificar se o QA da Sprint 14 é suficiente para um refactor que mexeu em runtime, persistência e renderização
- verificar se a documentação e as evidências ficaram reproduzíveis entre máquinas

---

## Expected Deliverables

- `agents/planning/sprint-plans/SPRINT_15_PLAN.md`
- `agents/planning/implementation-notes/SPRINT_15_IMPLEMENTATION_NOTES.md`
- `tests/reports/QA_REPORT_SPRINT_15.md`
- `agents/planning/reviews/SPRINT_15_REVIEW.md`

---

## Success Criteria

- a Sprint 15 deixa claro se a Sprint 14 pode ou não ser considerada concluída com confiança
- os principais problemas ficam priorizados por severidade e evidência
- a próxima sprint de correção fica pequena, objetiva e alinhada ao contrato de `AGENTS.md`
- o repositório passa a apontar para a auditoria da Sprint 15 como QA vigente
