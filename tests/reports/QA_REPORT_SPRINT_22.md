# QA Report — Sprint 22

Data de execucao: 2026-03-30
Foco: troca de emoji por sprites de estado nos canteiros, com validacao do ciclo semente -> crescimento -> maduro -> podre.

---

## 1. Escopo validado
- renderizacao do canteiro vazio com leitura de terra
- renderizacao de crescimento com sprite em vez de emoji
- persistencia do estado visual apos reload
- troca para estado podre e retorno ao estado vazio apos limpeza
- regressao geral de gameplay, helper, eventos, prestigio, save/load e layout mobile

---

## 2. Validacao estrutural

### `node --check` — APROVADO

Arquivos verificados:
- `src/systems/plots.js`
- `src/ui/farmGrid.js`
- `tests/playwright/strawberry-farm.smoke.js`
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
- `tests/artifacts/strawberry-farm-smoke-20260330-230942-002.png`

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
- `tests/artifacts/strawberry-farm-test-20260330-230942-000.png`

---

## 4. Bugs encontrados durante o QA desta sessao

### BUG-1 (ALTO): ordem dos frames do morango estava invertida

**Arquivo:** `src/systems/plots.js`

**Descricao:** A primeira versao do mapeamento assumiu que os frames do morango seguiam da esquerda para a direita em ordem de crescimento. Na pratica, o row do spritesheet vinha em ordem inversa para o ciclo escolhido, fazendo o plantio mostrar fruta madura em vez de semente.

**Correcao aplicada:** remapeamento dos `frameX` para que o ciclo renderize `semente -> broto -> quase pronto -> maduro`.

**Status:** CORRIGIDO

---

## 5. Resultado final

Status final: APROVADO

Conclusao:
- os canteiros agora usam sprites locais em vez de emoji
- o plantio inicia visualmente na semente
- a leitura dos estados continuou clara sem quebrar o loop principal
- nao houve regressao funcional nas suites smoke e e2e
