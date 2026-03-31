# QA Report — Sprint 21

Data de execucao: 2026-03-30
Foco: restauracao da experiencia mobile e correcoes de navegacao da sidebar de gestao.

---

## 1. Escopo validado
- fluxo mobile da pagina sem areas presas em altura fixa
- acesso a melhorias via aba `Melhorias`
- continuidade do loop principal em viewport estreita
- regressao geral de gameplay, helper, eventos, prestigio, save/load e reset

---

## 2. Validacao estrutural

### `node --check` — APROVADO

Arquivos verificados:
- `src/main.js`
- `src/ui/render.js`
- `src/utils/dom.js`
- `tests/playwright/strawberry-farm.e2e.js`

---

## 3. Testes automatizados

### `npm run test:smoke` — APROVADO (6/6)

Cenarios:
- HUD inicial
- plantio e reload
- borda de combo expirada
- apodrecimento e limpeza
- save legado e timer edge
- prestigio e reset

Evidencia:
- `tests/artifacts/strawberry-farm-smoke-20260330-224308-980.png`

### `npm run test:e2e` — APROVADO (11/11)

Cenarios:
- renderizacao inicial e HUD
- ajuda rapida persistente
- mercado dinamico e clareza de preco
- plantio e save/load base
- save legado sem versao
- combo de colheita e persistencia curta
- morango estraga e exige limpeza manual
- expansao da fazenda para 4x4
- upgrades, helper, eventos e prestigio
- reset e restauracao completa
- layout mobile razoavel

Evidencia:
- `tests/artifacts/strawberry-farm-test-20260330-224440-099.png`

---

## 4. Bugs encontrados durante o QA desta sessao

### BUG-1 (ALTO): e2e dependia do bug antigo da sidebar

**Arquivo:** `tests/playwright/strawberry-farm.e2e.js`

**Descricao:** Ao corrigir a aba `Melhorias`, o teste falhou ao clicar em `#expandFarmButton` sem antes ativar a aba correspondente. O painel de melhorias antes permanecia visivel indevidamente, mascarando o problema.

**Correcao aplicada:** adicao da helper `openUpgradesTab(page)` e uso explicito antes das interacoes com upgrades.

**Status:** CORRIGIDO

---

## 5. Resultado final

Status final: APROVADO

Conclusao:
- a navegacao mobile voltou a permitir acesso previsivel aos blocos principais do jogo
- a sidebar de gestao agora funciona de forma consistente
- nao houve regressao funcional nas suites smoke e e2e
