# Plano de Divisão do Código

## Objetivo
Reduzir a responsabilidade concentrada no antigo `game.js` e deixar a navegação do runtime mais previsível.

## Responsabilidades retiradas do arquivo principal
- configuração do jogo
- criação e hidratação do estado
- persistência e storage adapter
- sistema de eventos
- sistema de mercado
- sistema de combo
- sistema de helper
- sistema de prestígio
- sistema de progressão
- sistema de canteiros
- renderização da UI
- criação e atualização do grid da fazenda
- utilitários de DOM e formatação

## Módulos criados
- `src/config/gameConfig.js`
- `src/state/createGameState.js`
- `src/state/persistence.js`
- `src/systems/events.js`
- `src/systems/market.js`
- `src/systems/combo.js`
- `src/systems/helper.js`
- `src/systems/prestige.js`
- `src/systems/progression.js`
- `src/systems/plots.js`
- `src/ui/farmGrid.js`
- `src/ui/render.js`
- `src/utils/dom.js`
- `src/utils/format.js`
- `src/main.js`

## State ownership
- `src/state/*`
  - criação do shape base
  - save/load
  - hidratação segura
- `src/systems/*`
  - mutação de domínios específicos do estado
- `src/ui/*`
  - leitura do estado para renderização
- `src/main.js`
  - bootstrap, wiring, eventos do DOM, ticker e commit

## Interação entre módulos
- `main` mantém o objeto `game`
- `game` concentra:
  - `state`
  - `elements`
  - `storage`
  - `plotElements`
  - `debugState`
  - `uiState`
  - `dirty`
- sistemas recebem `game` e operam diretamente no estado
- renderização também recebe `game` e não precisa conhecer persistência

## Estrutura de carregamento
- `public/index.html` carrega os scripts em ordem
- cada arquivo registra funções em `window.StrawberryFarm`
- `src/main.js` só inicia depois de todos os módulos estarem disponíveis

## Decisão importante
- não usar `type="module"` nem bundler
- motivo: preservar simplicidade e compatibilidade com abertura direta via `file://`
