# Proposta de Arquitetura — Strawberry Farm

## Objetivo

Refatorar o projeto para uma estrutura mais clara e mais fácil de manter, sem overengineering.

Esta proposta busca:

- manter o projeto simples
- preservar o comportamento atual do gameplay
- melhorar a descoberta do código
- reduzir o tamanho e a concentração de responsabilidades do antigo arquivo principal
- separar com clareza o runtime do jogo dos artefatos do workflow com agentes
- manter o deploy simples

## Observação de contexto
Este documento registra a proposta usada como base para o Sprint 9.

A implementação final não seguiu cada pasta exatamente como desenhado abaixo. O estado real do projeto está descrito em [ARCHITECTURE_IMPLEMENTATION.md](/Users/wiser/projects/strawberry-farm/docs/ARCHITECTURE_IMPLEMENTATION.md), [CODE_SPLIT_PLAN.md](/Users/wiser/projects/strawberry-farm/docs/CODE_SPLIT_PLAN.md) e [REPO_ORGANIZATION_PLAN.md](/Users/wiser/projects/strawberry-farm/docs/REPO_ORGANIZATION_PLAN.md).

---

## Problemas identificados

### 1. A lógica de runtime estava concentrada demais
A lógica do jogo cresceu a ponto de manter tudo em um único arquivo principal aumentar o custo de manutenção.

### 2. A raiz do repositório estava ruidosa
Arquivos de gameplay, planejamento, relatórios e materiais de agentes estavam misturados.

### 3. Runtime e workflow de agentes são domínios diferentes
O jogo de navegador é o produto.  
Prompts, planos de sprint, relatórios de QA e artefatos de design são ativos de processo.

Essas áreas não deveriam continuar misturadas conforme o projeto cresce.

---

## Princípios da refatoração

### Manter simplicidade
Não introduzir frameworks, bundlers ou abstrações complexas.

### Preferir módulos funcionais
Usar módulos pequenos em JavaScript puro, agrupados por responsabilidade.

### Preservar comportamento
Esta refatoração é arquitetural, não uma expansão de produto.

### Separar runtime de processo
Tudo que roda no navegador deve ser fácil de localizar imediatamente.  
Tudo que pertence a agentes, planejamento de sprint e processo interno deve ficar em área própria.

### Otimizar para o estágio atual
Este ainda é um jogo pequeno de navegador, não um sistema de produção de grande porte.

---

## Estrutura de pastas proposta

```text
strawberry-farm/
│
├── public/
│   ├── index.html
│   └── style.css
│
├── src/
│   ├── main.js
│   │
│   ├── config/
│   │   └── gameConfig.js
│   │
│   ├── state/
│   │   ├── createGameState.js
│   │   └── persistence.js
│   │
│   ├── systems/
│   │   ├── plots.js
│   │   ├── market.js
│   │   ├── events.js
│   │   ├── combo.js
│   │   ├── helper.js
│   │   ├── prestige.js
│   │   ├── progression.js
│   │   └── upgrades.js
│   │
│   ├── ui/
│   │   ├── render.js
│   │   ├── hud.js
│   │   ├── farmGrid.js
│   │   ├── panels.js
│   │   └── actions.js
│   │
│   └── utils/
│       ├── dom.js
│       ├── format.js
│       └── time.js
│
├── tests/
│   ├── manual/
│   └── reports/
│
├── agents/
│   ├── prompts/
│   │   ├── full-game-director.md
│   │   ├── product-director.md
│   │   ├── game-designer.md
│   │   ├── economy-balance-designer.md
│   │   ├── gameplay-developer.md
│   │   ├── ui-ux-developer.md
│   │   └── qa-playtest-agent.md
│   │
│   ├── planning/
│   │   ├── sprint-plans/
│   │   ├── analyses/
│   │   ├── reviews/
│   │   └── acceptance/
│   │
│   └── docs/
│       ├── systems/
│       ├── economy/
│       └── ui/
│
├── docs/
│   ├── architecture.md
│   ├── game-overview.md
│   ├── technical-decisions.md
│   └── changelog.md
│
├── README.md
└── AGENTS.md
```
