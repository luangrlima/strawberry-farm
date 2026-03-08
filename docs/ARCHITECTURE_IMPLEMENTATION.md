# Implementação da Arquitetura

## Resumo
O Sprint 9 converteu o projeto de um runtime concentrado na raiz para uma estrutura separada por domínio, mantendo HTML/CSS/JS puros e o comportamento do jogo.

## O que foi feito
- `index.html` na raiz passou a funcionar como redirecionamento de compatibilidade
- o entrypoint real do jogo foi movido para `public/index.html`
- o CSS runtime foi movido para `public/style.css`
- o JavaScript runtime foi dividido entre `src/config`, `src/state`, `src/systems`, `src/ui` e `src/utils`
- prompts foram movidos para `agents/prompts`
- planos, análises e reviews foram movidos para `agents/planning`
- documentos de sistema/economia/UI foram movidos para `agents/docs`
- cenários manuais e relatórios foram reorganizados para `tests/manual` e `tests/reports`
- a proposta arquitetural foi movida para `docs/ARCHITECTURE_PROPOSAL.md`

## Compatibilidade preservada
- gameplay inalterado
- mesma estrutura geral de estado
- mesmos seletores principais de DOM
- mesmo `window.__strawberryFarmDebug`
- suporte a `file://` preservado

## Débito técnico reduzido
- leitura do runtime mais fácil
- descoberta do código mais rápida
- menor acoplamento entre sistemas de jogo e renderização
- separação visível entre produto e workflow

## Débito técnico restante
- `src/ui/render.js` ainda é o maior módulo individual
- `src/main.js` ainda concentra o wiring das ações
- não existe camada formal de testes unitários, só regressão end-to-end
