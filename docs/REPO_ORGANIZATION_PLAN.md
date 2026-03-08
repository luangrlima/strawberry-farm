# Plano de Organização do Repositório

## Onde o runtime do jogo fica
- `public/`
  - `index.html`
  - `style.css`
- `src/`
  - runtime JavaScript do jogo

## Onde a UI fica
- `public/index.html`
- `public/style.css`
- `src/ui/*`

## Onde a configuração fica
- `src/config/gameConfig.js`

## Onde os prompts dos agentes ficam
- `agents/prompts/*`

## Onde os artefatos de sprint ficam
- `agents/planning/analyses/*`
- `agents/planning/sprint-plans/*`
- `agents/planning/reviews/*`
- `agents/planning/acceptance/*`

## Onde a documentação do processo fica
- `agents/docs/systems/*`
- `agents/docs/economy/*`
- `agents/docs/ui/*`

## Onde a documentação estável fica
- `docs/*`

## Onde os testes ficam
- `tests/playwright/*`
- `tests/manual/*`
- `tests/reports/*`
- `tests/artifacts/*`

## Regra de separação
- produto jogável: `public/` + `src/`
- processo de agentes: `agents/`
- documentação estável: `docs/`
- testes e evidências: `tests/`
