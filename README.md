# Fazenda de Morangos MVP+

## Objetivo do produto
Construir um jogo pequeno, polido e rápido de iterar sobre plantar, colher e vender morangos no navegador.

## Restrições técnicas
- HTML puro
- CSS puro
- JavaScript puro
- sem frameworks
- sem backend
- `localStorage` para persistência
- jogo em uma única tela
- código legível e modular

## Restrições de design
- sessões curtas
- uma cultura apenas: morango
- progressão rápida e recompensadora
- sistemas simples e óbvios
- nenhuma feature deve exigir infraestrutura complexa

## Loop principal
Comprar sementes -> Plantar -> Esperar -> Colher -> Vender -> Reinvestir

## Alvo atual
Entregar um MVP+ com:
- upgrades
- expansão da fazenda
- eventos aleatórios simples
- HUD mais claro
- save/load mais forte
- metas de marco
- onboarding curto
- feedback de progresso mais claro

## Estado atual
O jogo já está funcional nos arquivos:
- `index.html`
- `style.css`
- `game.js`
- `config.js`

Recursos implementados:
- fazenda expansível de `3x3` para `4x4`
- morango como única cultura
- painel de onboarding e ajuda rápida
- plantio ao clicar em terreno vazio
- temporizador simples de crescimento
- colheita ao clicar em planta pronta
- venda de todos os morangos colhidos
- compra de sementes
- sistema de moedas
- helper de automação leve para colheita
- salvamento e carregamento com `localStorage`
- salvamento automático com status visível
- retomada do crescimento após recarregar a página
- botão de reinício
- confirmação antes de apagar progresso
- melhoria visual dos estados dos canteiros
- upgrade de adubo para reduzir o tempo de crescimento
- upgrade de venda para aumentar o valor do morango
- expansão de fazenda para liberar `16` canteiros
- 3 eventos aleatórios simples
- banner visual para evento ativo com temporizador
- barra de progresso do evento ativo
- texto de efeito prático do evento ativo
- interface em português
- metas de progressão em tela única
- indicadores de progresso para meta final e canteiros prontos
- feedback visual de conclusão de meta
- combo de colheita curto com bônus leve
- mercado dinâmico simples
- indicador do `Farm Helper` no HUD
- colheita automática visual pelo `Farm Helper`
- meta de progressão final de `35` moedas
- mensagem de vitória na mesma tela

## Regras atuais
- O jogador começa com `6` moedas.
- O jogador começa com `3` sementes.
- O jogador começa com `0` morangos.
- A fazenda começa com `9` canteiros.
- A expansão custa `10` moedas e libera `16` canteiros.
- Cada semente custa `2` moedas.
- Durante o evento `Feira local`, cada semente custa `1` moeda.
- Cada morango vendido vale `3` moedas.
- Com upgrade de venda, cada morango vendido vale `5` moedas.
- Durante o evento `Sol forte`, cada morango vendido recebe `+1` moeda.
- Cada plantio consome `1` semente.
- Cada colheita gera `1` morango.
- O tempo de crescimento é de `10` segundos.
- Com upgrade de adubo, novos plantios levam `8` segundos.
- Durante o evento `Chuva leve`, as plantas atuais aceleram e os novos plantios crescem mais rápido.
- O upgrade `Adubo rápido` custa `10` moedas.
- O upgrade `Caixa premium` custa `14` moedas.
- O `Farm Helper` custa `18` moedas.
- O `Farm Helper` colhe `1` canteiro pronto a cada `3.5` segundos.
- O `Farm Helper` não planta, não vende e não ativa combo.
- Cada canteiro pode estar em um de três estados:
  - vazio
  - crescendo
  - pronto para colher
- Os eventos duram cerca de `12` segundos e podem surgir ao vender morangos.
- As metas atuais são:
  - colher `4` morangos
  - expandir a fazenda para `4x4`
  - comprar `2` melhorias
  - alcançar `35` moedas

## Interface atual
Tela única com:
- título do jogo
- botão e painel de ajuda rápida
- contador de moedas
- contador de sementes
- contador de morangos
- contador de preço atual de venda
- contador de tempo atual de crescimento
- contador de tamanho atual da fazenda
- contador de status do `Farm Helper`
- mensagem de status
- status de autosave
- faixa de atividade do `Farm Helper`
- toast visual para meta concluída
- barra de progresso da meta final
- barra de progresso de canteiros prontos
- legenda visual dos estados dos canteiros
- banner de evento ativo com temporizador
- texto de efeito prático do evento ativo
- barra de duração do evento
- grade da fazenda que começa em `3x3` e pode virar `4x4`
- barra de progresso durante o crescimento
- badge visual de ação em cada canteiro
- destaque visual quando o morango está pronto
- card de upgrade `Adubo rápido`
- card de upgrade `Caixa premium`
- card de expansão `Fazenda 4x4`
- card de upgrade `Farm Helper`
- painel de metas de progressão
- botão `Comprar semente`
- botão `Vender morangos`
- botão `Reiniciar jogo`

## Estrutura dos arquivos
- `index.html`: estrutura da tela única
- `style.css`: layout, cores e responsividade
- `config.js`: constantes do jogo e valores da economia
- `game.js`: estado, renderização, lógica do jogo e persistência
- `tests/README.md`: visão geral dos artefatos de teste
- `tests/playwright/strawberry-farm.e2e.js`: teste end-to-end principal com Playwright
- `tests/docs/TEST_SCENARIOS.md`: cenários de teste manuais e base para automação
- `tests/docs/QA_REPORT.md`: primeiro relatório de QA
- `tests/docs/QA_REPORT_V2.md`: relatório de QA após o sprint de estabilidade
- `tests/docs/QA_REPORT_MARKET.md`: relatório de QA do sistema de mercado
- `tests/docs/QA_REPORT_SPRINT_6.md`: relatório de QA do helper de automação
- `tests/artifacts/`: evidências geradas pelos testes

## Checklist de implementação
- [x] Criar layout de tela única
- [x] Exibir título, moedas, sementes e morangos
- [x] Renderizar fazenda inicial 3x3
- [x] Representar canteiros vazios, crescendo e prontos
- [x] Permitir plantio em canteiros vazios
- [x] Iniciar temporizador ao plantar
- [x] Liberar colheita ao final do tempo
- [x] Permitir colher com clique
- [x] Comprar sementes com moedas
- [x] Vender morangos colhidos
- [x] Reiniciar progresso
- [x] Exibir confirmação antes do reset
- [x] Salvar estado com `localStorage`
- [x] Carregar estado salvo ao abrir
- [x] Continuar crescimento após recarga usando timestamps
- [x] Exibir status de autosave
- [x] Adicionar painel curto de onboarding
- [x] Melhorar feedback visual dos canteiros
- [x] Adicionar indicadores de progresso úteis
- [x] Adicionar upgrade de crescimento
- [x] Adicionar upgrade de venda
- [x] Adicionar helper de colheita automática
- [x] Adicionar expansão para 4x4
- [x] Adicionar 3 eventos aleatórios simples
- [x] Exibir banner visual de evento ativo
- [x] Exibir feedback visual de conclusão de meta
- [x] Melhorar responsividade visual do ticker
- [x] Persistir expansão, eventos e progresso no save
- [x] Exibir mensagem de vitória ao chegar em `35` moedas
- [x] Manter constantes separadas em `config.js`
- [x] Traduzir a interface para português

## Testes
Todo o material de testes fica dentro da pasta `tests/`.

Principais arquivos:

- `tests/playwright/strawberry-farm.e2e.js`
- `tests/docs/TEST_SCENARIOS.md`
- `tests/docs/QA_REPORT.md`
- `tests/docs/QA_REPORT_V2.md`

Esse teste valida:
- renderização inicial
- onboarding e ajuda persistente
- economia base
- expansão da fazenda
- eventos e timing
- consistência de save/load
- upgrade de crescimento
- upgrade de venda
- helper automático e persistência do helper
- helper sem combo automático
- progressão final
- reset do jogo

Os documentos de apoio cobrem:
- cenários manuais e critérios de cobertura
- histórico de QA
- validações após correções de estabilidade
- evidências visuais geradas pela automação

## Papéis do time
O projeto também mantém agentes especializados em [AGENTS.md](/Users/wiser/projects/strawberry-farm/AGENTS.md) e no diretório [agents](/Users/wiser/projects/strawberry-farm/agents), cobrindo produto, design, economia, gameplay, UI/UX e QA/playtest.

Exemplo de execução com o `playwright-skill`:

```bash
cd <caminho-do-playwright-skill>
PROJECT_ROOT="<caminho-absoluto-do-projeto>"
TARGET_URL="file://$PROJECT_ROOT/index.html" node run.js "$PROJECT_ROOT/tests/playwright/strawberry-farm.e2e.js"
```

Se quiser apontar para outra URL:

```bash
cd <caminho-do-playwright-skill>
PROJECT_ROOT="<caminho-absoluto-do-projeto>"
TARGET_URL='http://localhost:4173' node run.js "$PROJECT_ROOT/tests/playwright/strawberry-farm.e2e.js"
```

Após a execução, a evidência visual fica em um novo arquivo versionado dentro de `tests/artifacts/`, por exemplo `tests/artifacts/strawberry-farm-test-20260308-153045-123.png`.

## Fora de escopo
- multiplayer
- backend
- contas de usuário
- múltiplas culturas
- estações
- árvores de diálogo com NPCs
- árvores de crafting
- simulação complexa de mercado
