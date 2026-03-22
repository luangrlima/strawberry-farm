# Sprint 19 — Review

## Objetivo do sprint
Transformar a aparência do jogo de "dashboard de texto" para "jogo de fazenda visual", com interface 100% em português brasileiro.

## Status: CONCLUÍDO E APROVADO

## Entregas

| Tarefa | Status | Responsável |
|---|---|---|
| Canteiros visuais (JS) | Concluída | gameplay-developer |
| Canteiros visuais (CSS) | Concluída | ui-ux-developer |
| Linguagem de jogador PT-BR | Concluída | ui-ux-developer |
| Fazenda protagonista visual | Concluída | ui-ux-developer |
| Correção testes e2e | Concluída | gameplay-developer |
| QA completo | Aprovado | qa-tester |

## Resultados do QA

- **Smoke:** 6/6 cenários passaram
- **E2E:** 11/11 cenários passaram
- **Validação estrutural:** `node --check` em 17 arquivos
- **PT-BR:** zero texto em inglês visível ao jogador
- **Regressão:** gameplay intacto
- **Evidências:** `tests/artifacts/strawberry-farm-test-20260321-231010-097.png`, `tests/artifacts/strawberry-farm-smoke-20260321-231241-433.png`

## O que funcionou bem

1. **Divisão clara de responsabilidades** — gameplay-developer no JS, ui-ux-developer no CSS/HTML/strings. Trabalho paralelo sem conflitos.
2. **Spec detalhada** — cada agente recebeu lista exata de mudanças por arquivo/linha, minimizando ambiguidade.
3. **QA como porteiro** — qa-tester encontrou strings desatualizadas nos testes que teriam passado despercebidas. Valor claro do QA automatizado.
4. **Correção rápida** — bloqueio nos testes e2e resolvido em um ciclo, com 2 strings extras encontradas proativamente.

## O que pode melhorar

1. **Testes devem ser incluídos no escopo de tradução desde o início** — as 8 strings nos testes e2e deveriam ter sido mapeadas no plano. Lição: quando uma tarefa muda strings visíveis, os testes que verificam essas strings são parte da mesma tarefa.
2. **"Reset" e "On/Off" ficaram em inglês** — decisão consciente, mas deve ser revisitada se o usuário quiser 100% PT-BR sem exceções.

## Métricas

- **Arquivos modificados:** 10
- **Linhas de CSS adicionadas/alteradas:** ~15
- **Strings traduzidas/corrigidas:** ~40+ em 6 arquivos de código + 8 em testes
- **Bugs encontrados pelo QA:** 1 (strings de teste desatualizadas)
- **Ciclos de QA:** 2 (reprovado → corrigido → aprovado)

## Backlog para Sprint 20

### Candidatos fortes (decididos no consolidado anterior)
1. Helper limpar plots rotten ("Luvas Resistentes")
2. Save resiliente com feedback visual
3. Expandir goals de progressão mid/late game

### Outros candidatos
- Animações/juice (bounce, pulse, shake) — complemento natural ao Sprint 19
- Money sink no late-game
- Compra de sementes em lote
- Timer de apodrecimento como barra nos plots ready
- Resumo pós-prestígio
- Fix race condition do combo
