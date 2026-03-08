# Relatório de QA: Sprint 9

## Escopo validado
- carregamento do jogo após migração arquitetural
- compatibilidade do entrypoint da raiz
- grid da fazenda
- plantio
- colheita
- combo
- mercado
- eventos
- helper
- prestígio
- save/load
- reset
- layout desktop e mobile básico

## Cenários executados
1. renderização inicial e HUD
2. ajuda rápida persistente
3. mercado dinâmico e clareza de preço
4. plantio e save/load base
5. combo e persistência curta
6. expansão da fazenda
7. `Feira local`
8. `Chuva leve`
9. `Sol forte`
10. `Farm Helper`
11. `Strawberry Knowledge`
12. progressão final
13. reset completo
14. checagem mobile

## Resultado
- status geral: aprovado
- bugs críticos: nenhum
- bugs médios: nenhum
- regressões funcionais: nenhuma encontrada

## Observações
- o jogo carregou corretamente a partir de [index.html](/Users/wiser/projects/strawberry-farm/index.html), que redireciona para [public/index.html](/Users/wiser/projects/strawberry-farm/public/index.html)
- o save/load permaneceu compatível após a divisão do runtime em módulos
- `window.__strawberryFarmDebug` continuou funcional para o Playwright
- a migração não alterou o loop de gameplay nem a UI principal

## Evidência
- screenshot final: [tests/artifacts/strawberry-farm-test-20260308-095400-538.png](/Users/wiser/projects/strawberry-farm/tests/artifacts/strawberry-farm-test-20260308-095400-538.png)
