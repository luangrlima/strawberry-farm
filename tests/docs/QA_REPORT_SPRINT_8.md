# QA Report Sprint 8

## Escopo do QA
- Verificar se o layout ficou mais horizontal no desktop.
- Confirmar que informações críticas ficam visíveis acima da dobra em largura comum.
- Garantir que ações principais continuam fáceis de acessar.
- Validar que sistemas existentes não quebraram com a reorganização da interface.
- Fazer uma checagem básica do layout mobile empilhado.

## Cenários executados
1. Renderização inicial e HUD compacto.
2. Persistência da ajuda rápida recolhida/aberta.
3. Clareza do mercado dinâmico.
4. Plantio, colheita, venda e save/load base.
5. Combo de colheita e persistência curta.
6. Expansão da fazenda.
7. Eventos simples e efeitos econômicos.
8. Upgrades de crescimento e venda.
9. Farm Helper e persistência.
10. Strawberry Knowledge, reset opcional e persistência.
11. Progressão final após prestígio.
12. Reset completo.
13. Layout mobile razoável.

## Resultado
- Status geral: aprovado.
- Bugs críticos: nenhum.
- Bugs médios: nenhum.
- Regressões funcionais: nenhuma encontrada no fluxo principal.

## Observações principais
- O desktop ficou significativamente mais horizontal e jogável sem scroll global frequente.
- A fazenda está centralizada visualmente e permanece acima da dobra no estado inicial validado.
- HUD, ações principais e banners de mercado/evento ficaram mais rápidos de escanear.
- A ajuda recolhida por padrão reduziu ruído sem perder descoberta.
- No mobile o layout continua funcional, mesmo voltando a empilhar módulos.

## Ajustes feitos durante o QA
- O cenário automatizado ficou longo demais por depender de grind econômico até o prestígio.
- O teste foi ajustado para usar o estado de debug apenas na preparação do prestígio e da progressão final, mantendo a cobertura dos sistemas sem alongar artificialmente o run.

## Evidência
- Screenshot final: [tests/artifacts/strawberry-farm-test-20260308-092528-122.png](/Users/wiser/projects/strawberry-farm/tests/artifacts/strawberry-farm-test-20260308-092528-122.png)
