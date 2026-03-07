# Fazenda de Morangos MVP+ com Expansão e Eventos

## Visão geral
Este projeto é um jogo pequeno de navegador sobre plantar, colher e vender morangos.

O projeto foi implementado com:
- HTML puro
- CSS puro
- JavaScript puro
- uma única tela
- salvamento local com `localStorage`

Loop principal:
Comprar sementes -> Plantar -> Esperar -> Colher -> Vender -> Reinvestir

## Estado atual
O jogo já está funcional nos arquivos:
- `index.html`
- `style.css`
- `game.js`
- `config.js`

Recursos implementados:
- fazenda expansível de `3x3` para `4x4`
- morango como única cultura
- plantio ao clicar em terreno vazio
- temporizador simples de crescimento
- colheita ao clicar em planta pronta
- venda de todos os morangos colhidos
- compra de sementes
- sistema de moedas
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
- interface em português
- metas de progressão em tela única
- meta de progressão final de `35` moedas
- mensagem de vitória na mesma tela

## Regras atuais
- O jogador começa com `6` moedas.
- O jogador começa com `3` sementes.
- O jogador começa com `0` morangos.
- A fazenda começa com `9` canteiros.
- A expansão custa `12` moedas e libera `16` canteiros.
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
- Cada canteiro pode estar em um de três estados:
  - vazio
  - crescendo
  - pronto para colher
- Os eventos são curtos e podem surgir ao vender morangos.
- As metas atuais são:
  - colher `4` morangos
  - expandir a fazenda para `4x4`
  - comprar `2` melhorias
  - alcançar `35` moedas

## Interface atual
Tela única com:
- título do jogo
- contador de moedas
- contador de sementes
- contador de morangos
- contador de preço atual de venda
- contador de tempo atual de crescimento
- contador de tamanho atual da fazenda
- mensagem de status
- status de autosave
- legenda visual dos estados dos canteiros
- banner de evento ativo com temporizador
- grade da fazenda que começa em `3x3` e pode virar `4x4`
- barra de progresso durante o crescimento
- destaque visual quando o morango está pronto
- card de upgrade `Adubo rápido`
- card de upgrade `Caixa premium`
- card de expansão `Fazenda 4x4`
- painel de metas de progressão
- botão `Comprar semente`
- botão `Vender morangos`
- botão `Reiniciar jogo`

## Arquitetura dos arquivos
- `index.html`: estrutura da tela única
- `style.css`: layout, cores e responsividade
- `config.js`: constantes do jogo e valores da economia
- `game.js`: estado, renderização, lógica do jogo e persistência
- `tests/playwright/strawberry-farm.e2e.js`: teste end-to-end principal com Playwright

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
- [x] Melhorar feedback visual dos canteiros
- [x] Adicionar upgrade de crescimento
- [x] Adicionar upgrade de venda
- [x] Adicionar expansão para 4x4
- [x] Adicionar 3 eventos aleatórios simples
- [x] Exibir banner visual de evento ativo
- [x] Persistir expansão, eventos e progresso no save
- [x] Exibir mensagem de vitória ao chegar em `35` moedas
- [x] Manter constantes separadas em `config.js`
- [x] Traduzir a interface para português

## Testes
O projeto possui um teste principal de interface e fluxo em:

- `tests/playwright/strawberry-farm.e2e.js`

Esse teste valida:
- renderização inicial
- economia base
- expansão da fazenda
- eventos e timing
- consistência de save/load
- upgrade de crescimento
- upgrade de venda
- progressão final
- reset do jogo

## Agentes
O projeto também mantém agentes especializados em [AGENTS.md](/Users/wiser/projects/strawberry-farm/AGENTS.md) e no diretório [agents](/Users/wiser/projects/strawberry-farm/agents), cobrindo produto, design, economia, gameplay, UI/UX e QA/playtest.

Exemplo de execução com o `playwright-skill`:

```bash
cd <caminho-do-playwright-skill>
TARGET_URL="file://$(pwd)/index.html" node run.js "$(pwd)/tests/playwright/strawberry-farm.e2e.js"
```

Se quiser apontar para outra URL:

```bash
cd <caminho-do-playwright-skill>
TARGET_URL='http://localhost:4173' node run.js <caminho-absoluto-do-projeto>/tests/playwright/strawberry-farm.e2e.js
```

## Fora de escopo
- multiplayer
- arte complexa
- NPCs
- estações do ano
- áudio
- autenticação
