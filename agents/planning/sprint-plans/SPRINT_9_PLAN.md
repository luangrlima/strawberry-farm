# Plano do Sprint 9

## Objetivo do sprint
Refatorar a arquitetura e a organização do repositório para melhorar clareza, manutenção e descoberta do código sem alterar a experiência de gameplay.

## Estratégia de migração
- mover o entrypoint visual para `public/`
- dividir o runtime em módulos funcionais simples dentro de `src/`
- reorganizar prompts, planos e reviews em `agents/`
- separar testes manuais e relatórios dentro de `tests/`
- manter um `index.html` de compatibilidade na raiz

## Mudanças arquiteturais
- `public/`
  - HTML e CSS do jogo
- `src/config/`
  - constantes do jogo
- `src/state/`
  - estado inicial e persistência
- `src/systems/`
  - regras de mercado, eventos, combo, helper, prestígio, progressão e canteiros
- `src/ui/`
  - grid da fazenda e renderização
- `src/utils/`
  - formatação e coleta de DOM
- `agents/prompts/`
  - papéis dos agentes
- `agents/planning/`
  - análises, planos e reviews
- `agents/docs/`
  - docs de sistemas/economia/UI
- `docs/`
  - documentação arquitetural estável
- `tests/manual/` e `tests/reports/`
  - cenários e relatórios

## Escopo incluído
- code split do runtime atual
- reorganização do repositório
- atualização de caminhos, documentação e testes
- validação de regressão

## Fora de escopo
- novas mecânicas
- novos upgrades
- mudanças de economia
- redesign de interface
- qualquer alteração de regra de gameplay

## Riscos e mitigação
- risco: quebra de carregamento em `file://`
  - mitigação: scripts clássicos, sem ES modules
- risco: save incompatível
  - mitigação: shape do estado preservado
- risco: regressão de QA por paths antigos
  - mitigação: atualizar Playwright e docs para `public/index.html`
- risco: refatoração concentrar demais em outro arquivo
  - mitigação: separar runtime em módulos temáticos

## Responsabilidades dos agentes
- Diretor de Produto
  - confirmar escopo estritamente arquitetural
  - manter a raiz limpa e o projeto pequeno
- Designer de Jogo
  - garantir que o comportamento do loop permaneça intacto
- Designer de Economia e Balanceamento
  - validar que a refatoração não alterou pacing e fórmulas
- Desenvolvedor de Gameplay
  - executar code split e migração de paths
- Desenvolvedor de UI/UX
  - preservar clareza e compatibilidade visual
- Agente de QA e Playtest
  - rodar regressão funcional completa

## Foco de QA
- carregamento inicial
- grid e plantio
- colheita e combo
- mercado e eventos
- helper
- prestígio
- save/load
- compatibilidade do entrypoint em `public/`
