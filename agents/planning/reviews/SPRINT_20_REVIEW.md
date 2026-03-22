# Sprint 20 — Review

## Objetivo do sprint
Adicionar profundidade ao gameplay com 4 features: upgrade "Luvas Resistentes", goals mid/late game, evento negativo "Praga" e barra de apodrecimento nos plots ready.

## Status: CONCLUIDO E APROVADO

## Entregas

| Tarefa | Status | Responsaveis |
|--------|--------|-------------|
| Luvas Resistentes (helper limpa rotten) | Concluida | game-designer, economy-balance, gameplay-developer, ui-ux-developer |
| Goals mid/late (4 novos) | Concluida | game-designer, economy-balance, gameplay-developer |
| Evento Praga (sellPricePenalty) | Concluida | game-designer, economy-balance, gameplay-developer |
| Barra de apodrecimento | Concluida | gameplay-developer, ui-ux-developer |
| Correcao de 8 bugs | Concluida | gameplay-developer, qa-playtest |
| QA completo (3 ciclos) | Aprovado | qa-playtest |

## Resultados do QA

- **Smoke:** 6/6 cenarios passaram
- **E2E:** 11/11 cenarios passaram
- **Validacao estrutural:** `node --check` em 19 arquivos (17 src + 2 tests)
- **PT-BR:** zero texto novo em ingles visivel ao jogador
- **Bugs:** 8 encontrados e corrigidos em 3 ciclos
- **Evidencias:** `tests/artifacts/strawberry-farm-test-20260322-104106-944.png`, `tests/artifacts/strawberry-farm-smoke-20260322-104343-383.png`

## O que funcionou bem

1. **Trabalho paralelo gameplay-developer + ui-ux-developer** — sem conflitos de merge. gameplay-developer focou em 10 arquivos JS, ui-ux-developer em 3 HTML/CSS/dom.
2. **Specs detalhadas no SPRINT_20_PLAN.md** — cada tarefa com arquivos, funcoes e logica esperada. Reduziu ambiguidade significativamente.
3. **QA rigoroso em 3 ciclos** — encontrou 8 bugs reais, incluindo 2 criticos de persistencia que teriam impactado saves de jogadores.
4. **Decisao de mudar mecanica da Praga** — economy-balance-designer propôs `sellPricePenalty` em vez de `spoilTimeMultiplier`, simplificando a implementacao e tornando o efeito mais intuitivo para o jogador.

## O que pode melhorar

1. **Checklist obrigatorio para novos campos de estado** — BUG-1 e BUG-2 sao o mesmo padrao: campo novo em `createGameState.js` sem hydration correspondente em `persistence.js`. Proposta: todo novo campo de estado deve incluir hydration na mesma PR/tarefa.
2. **Testes e2e frageis a mudancas de contagem** — BUG-3/6 mostram que strings hardcoded como "0/4 metas" quebram quando o numero de goals muda. Proposta: usar regex ou queries mais flexiveis nos testes.
3. **Neutralizacao de goals nos testes** — BUG-5/NOVO-BUG-1 mostram que `applyProgressionGoals` dispara automaticamente via `commit()`, contaminando assertivas de testes. Os testes precisaram neutralizar goals com inject de `completedGoalIds`. Isso e fragil — qualquer novo goal com recompensa pode quebrar testes existentes.
4. **Ciclos de QA excessivos (3)** — idealmente deveria ser 1-2. Os bugs de hydration (ciclo 1) e de API incorreta no inject (ciclo 2) poderiam ter sido evitados com revisao mais cuidadosa do codigo antes de submeter ao QA.

## Metricas

- **Arquivos modificados:** 15 (11 JS + 2 UI + 1 CSS + 1 teste)
- **Features entregues:** 4
- **Goals adicionados:** 4 (total: 8)
- **Upgrades adicionados:** 1 (Luvas Resistentes)
- **Eventos adicionados:** 1 (Praga)
- **Bugs encontrados:** 8 (4 criticos/altos, 2 medios, 2 baixos)
- **Ciclos de QA:** 3 (reprovado → reprovado → aprovado)

## Problemas de design identificados (nao bloqueadores)

1. **DESIGN-2**: Goal "all-upgrades" exige `upgradesPurchased >= 5` mas texto diz "Compre todas as melhorias" — pode confundir se upgrades forem adicionados no futuro.
2. **DESIGN-3**: Texto inicial do `progressSummary` no HTML ("0 de 4 metas") desatualizado, mas JS sobrescreve imediatamente.

## Backlog para Sprint 21

### Candidatos fortes
1. **Checklist de hydration** — automatizar verificacao de novos campos de estado
2. **Animacoes/juice** — bounce na colheita, pulse no ready, shake no rotten
3. **Compra de sementes em lote** — qualidade de vida
4. **Resumo pos-prestigio** — tela com estatisticas antes de confirmar reset

### Outros candidatos
- Save resiliente com feedback visual
- Money sink no late-game (decoracoes?)
- Fix do texto "all-upgrades" para ser dinamico
- Testes e2e com queries mais flexiveis (regex em vez de strings exatas)
