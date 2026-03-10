# Sprint 16 — Correção Pós-Auditoria

## Sprint Goal
Corrigir os principais problemas confirmados pela auditoria da Sprint 15 sem abrir um novo refactor amplo: fechar os contratos restantes do runtime, alinhar `replaceState/reset/prestige`, preservar a correção temporal do combo e melhorar a reprodutibilidade repo-native do QA com setup mínimo e evidência versionada de save legado.

---

## In Scope

- manter `save` e `render` centralizados no runtime
- usar `replaceState` como caminho principal também em `reset` e `prestige`
- preservar a borda determinística do combo
- adicionar um cenário versionado de save legado sem `saveVersion` na suíte oficial
- adicionar um smoke repo-native curto com foco em plantio/reload, combo expirado, save legado e prestígio/reset
- versionar um setup mínimo repo-native de Playwright com `package.json` e scripts locais
- corrigir links absolutos de documentação em `README.md`
- adicionar um prompt reutilizável para sprints corretivas pós-auditoria

---

## Out of Scope

- novas mecânicas
- rebalanceamento econômico amplo
- refactor grande do runtime além dos pontos confirmados pela auditoria
- nova suíte de testes unitários
- instalação real de dependências neste ambiente

---

## Team Guidance

- `Diretor de Produto`: manter a sprint pequena e corretiva
- `Designer de Jogo`: preservar previsibilidade do loop em `combo`, `reset` e `prestige`
- `Designer de Economia e Balanceamento`: focar em evidência de pacing sob save legado e semântica temporal
- `Desenvolvedor de Gameplay`: fechar o contrato de `replaceState` e manter a centralização do runtime
- `Desenvolvedor de UI/UX`: garantir que feedback e reset visual acompanhem a troca de estado
- `Agente de QA e Playtest`: exigir setup repo-native mínimo e evidência versionada na suíte oficial

---

## Acceptance Criteria

- `main`, `persistence` e `plots` deixam de disparar `save` e `render` diretos fora do runtime, exceto renders legítimos de boot/debug sem persistência
- `replaceState` aceita mensagem/toast e reduz o fluxo manual em `reset` e `prestige`
- `combo` passa a tratar o instante limite da mesma forma no clique e no ticker
- o script Playwright roda em `headless` por padrão e falha com mensagem clara se `playwright` não estiver instalado
- a suíte oficial passa a incluir um cenário de save legado sem `saveVersion`
- o repositório passa a expor `npm run test:smoke` como subset mínimo de regressão
- o repositório passa a ter `package.json` e scripts mínimos de QA
- `README.md` deixa de conter links absolutos de outra máquina

---

## QA Focus

- revisão estrutural de caminhos de persistência, render e state swap
- validação sintática dos arquivos alterados
- parse do `package.json`
- checagem operacional do script Playwright sem dependência instalada
- validação sintática do smoke repo-native e da fixture legada
- revisão do cenário legado adicionado à suíte oficial
- confirmação documental do prompt pós-auditoria e da referência de QA vigente
