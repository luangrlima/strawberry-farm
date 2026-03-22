# Sprint 19 — Design Visual

## Tipo de sprint
`ui-sprint-master` — 100% visual/UX, sem mudança de lógica de gameplay

## Objetivo
Transformar a aparência do jogo de "dashboard de texto" para "jogo de fazenda visual". O jogador deve olhar para a fazenda e sentir que está jogando, não lendo uma planilha.

## Restrição obrigatória
**Todo texto visível ao jogador deve estar em português brasileiro.** Nenhum texto em inglês na interface — botões, labels, tooltips, badges, pills, títulos, mensagens de feedback, tudo em PT-BR.

---

## Tarefas

### Tarefa 1 — Canteiros visuais: emojis grandes + texto mínimo
**Responsáveis**: ui-ux-developer (CSS), gameplay-developer (JS)

**O que mudar:**
- Emoji do plot de 1.45rem → 2.5rem (protagonista visual do canteiro)
- Remover da renderização padrão: `plot__name`, `plot__stage`, `plot__hint`
- Manter visíveis: `plot__emoji`, `plot__badge` (ação), `plot__progress` (só em growing)
- `plot__timer` visível apenas em `growing` e `ready` (countdown de apodrecimento)
- Badge de ação sempre visível mas compacto: "Plantar", "Colher", "Limpar", "Aguarde"
- Emojis temáticos por estado: 🟫 (empty), 🌱 (growing early), 🌿 (growing mid), 🍓 (ready), 💀 (rotten)
- `aria-label` completo mantido para acessibilidade (sem mudança na função `getPlotLabel`)

**Arquivos afetados:**
- `src/ui/farmGrid.js` — ocultar elementos de texto, mostrar apenas emoji+badge+timer+progress
- `src/systems/plots.js` — atualizar `getPlotEmoji()` para 🌿 no mid-growth; manter demais funções para aria-label
- `public/style.css` — `.plot__emoji { font-size: 2.5rem }`, ocultar `.plot__name`, `.plot__stage`, `.plot__hint`

**Critérios de aceitação:**
- Plot mostra apenas: emoji grande + badge de ação + progress bar (growing) + timer (growing/ready)
- Emoji muda conforme estágio de crescimento
- aria-label mantém texto completo para acessibilidade
- Layout responsivo preservado

---

### Tarefa 2 — Remover textos meta-dev + linguagem de jogador em PT-BR
**Responsável**: ui-ux-developer

**O que mudar:**
- `<p class="eyebrow">UI Sprint 17</p>` → `Temporada 1`
- `<p class="subtitle">Plante, colha e venda em um painel mais visual.</p>` → `Sua fazenda de morangos espera por você!`
- Pills dev → pills temáticas:
  - "1 cultura" → "Morangos frescos"
  - "sessões curtas" → "Sessões rápidas"
  - "prestígio leve" → "Conhecimento acumulado"
- Ícones do HUD (stats): ◌ → 💰, ✦ → 🌱, ✿ → 🍓, $ → 📊
- Label "Knowledge" no mini-stat → "Prestígio"
- Label "Helper" no mini-stat → "Ajudante"
- Label "Feed" no status-module → "Status"
- `<h2>Strawberry Knowledge</h2>` no prestige panel → `Conhecimento do Morango`
- `<p class="section-kicker">Ritmo atual</p>` → `Visão geral`
- `<h2 class="overview-card__title">Sua banca de morango</h2>` → `Painel de recursos`
- `<p class="section-kicker">Fazenda</p>` → `Sua fazenda`
- `<h2 class="farm-stage__title">Tabuleiro principal</h2>` → `Canteiros`
- `<p class="progression__eyebrow">Painel rápido</p>` → `Progresso`
- Verificar render.js: "Strawberry Knowledge" em `renderPrestigePanel` → `Conhecimento do Morango`
- Verificar render.js: "Helper ativo" → "Ajudante ativo", "Exige helper" → "Exige ajudante"
- Verificar render.js: "Nivel maximo" → "Nível máximo"
- Corrigir acentuação faltante: "Nivel" → "Nível", "Reducao" → "Redução", "Proximo" → "Próximo", "Concluida" → "Concluída"

**Arquivos afetados:**
- `public/index.html` — strings estáticas
- `src/ui/render.js` — strings dinâmicas geradas pelo JS
- `src/config/gameConfig.js` — label do prestige, descriptions

**Critérios de aceitação:**
- Zero texto em inglês visível ao jogador
- Acentuação correta em todo texto PT-BR
- Nenhuma referência a "sprint", "UI", "MVP" ou termos dev na interface

---

### Tarefa 3 — Fazenda como protagonista visual
**Responsável**: ui-ux-developer

**O que mudar:**
- `.plot { min-height: 120px }` (era 98px)
- `.farm-section` com fundo terroso: gradiente usando `var(--soil)` com opacidade baixa
- `.farm-section` border mais presente: `border-color: rgba(124, 69, 44, 0.22)`
- `.zone--left`, `.zone--right` com opacidade levemente reduzida ou padding menor para dar destaque à fazenda
- `.stat__icon` com tamanho 36px (era 30px) e background com cor temática por recurso
- Separadores visuais entre seções do HUD (overview-card → actions → status-stack)

**Arquivos afetados:**
- `public/style.css`

**Critérios de aceitação:**
- Fazenda é visualmente o elemento mais proeminente da tela
- Sidebars são claramente secundárias
- Layout responsivo preservado (breakpoints 1180px, 860px, 560px)

---

## Fora de escopo (Sprint 20+)
- Animações/juice (bounce, pulse, shake)
- Progress bar vertical nos plots
- Money sink / tier 4 upgrades
- Helper limpar rotten
- Save resiliente
- Goals mid/late expandidos
- Timer de apodrecimento como barra nos plots ready

## Stretch goals (se sobrar tempo)
- Fix da race condition do combo (`now === expiresAt`)
- Indicador "X/Y moedas para próximo goal" no HUD

---

## Distribuição de responsabilidades

| Papel | Responsabilidade |
|---|---|
| Game Director | Coordenação, plano, review final |
| UI/UX Developer | Tarefa 1 (CSS), Tarefa 2 (HTML+strings), Tarefa 3 (CSS) |
| Gameplay Developer | Tarefa 1 (JS: farmGrid.js, plots.js) |
| QA/Playtest | Validação visual, regressão, acessibilidade |
| Product Director | Aprovação da linguagem PT-BR |
| Game Designer | Consultoria sobre hierarquia visual dos plots |
| Economy Designer | N/A neste sprint |

## Artefatos esperados
- `agents/planning/sprint-plans/SPRINT_19_PLAN.md` (este arquivo)
- `agents/planning/implementation-notes/SPRINT_19_IMPLEMENTATION_NOTES.md`
- `tests/reports/QA_REPORT_SPRINT_19.md`
- `agents/planning/reviews/SPRINT_19_REVIEW.md`
