# Análise do Sprint 6

## Status do documento
Documento histórico, escrito antes da refatoração arquitetural do Sprint 9.

## Leitura do estado atual
- O loop principal continua estável: comprar sementes, plantar, esperar, colher, vender e reinvestir.
- O jogo já tem camadas extras relevantes: upgrades, expansão 4x4, eventos curtos, mercado dinâmico, combo de colheita, metas e save/load forte.
- A arquitetura atual centraliza quase tudo em `game.js`, com `systems` já servindo como área de temporizadores e estados transitórios.

## Avaliação do build atual

### Estabilidade do loop
- O loop principal está jogável e curto.
- O ticker já trata tempo de planta, evento, combo e mercado sem depender de infraestrutura externa.
- O save automático é frequente e já persiste bem mercado, eventos, upgrades e expansão.

### Economia e progressão
- A economia está rápida o suficiente para sessões curtas.
- O mercado já cria uma pequena decisão de venda.
- Os dois upgrades atuais têm impacto claro e imediato.
- Há espaço para mais uma melhoria que aumente conforto sem quebrar a necessidade de plantar e vender manualmente.

### Interações entre sistemas
- Eventos atuais afetam venda, semente e crescimento.
- Combo hoje só depende de colheitas em sequência.
- Isso abre uma restrição importante para Sprint 6: automação não pode gerar combo grátis, senão o helper passa a substituir o jogador em vez de complementar.

### Clareza de UI
- O HUD já comunica bem preço, tempo de crescimento, tamanho da fazenda, evento ativo e progresso.
- Falta apenas deixar explícito quando uma automação está ligada, o que ela faz e quando ela acabou de agir.

### Riscos técnicos
- `game.js` já concentra muita lógica; novas mudanças devem reaproveitar `systems` e evitar espalhar temporizadores soltos.
- A colheita precisa continuar passando por uma única rotina para evitar divergência entre clique manual e helper.
- O helper precisa respeitar um intervalo simples global e não ficar varrendo a grade de forma agressiva.

## Oportunidade do Sprint 6
- Adicionar um `Farm Helper` como automação leve.
- O helper deve colher apenas plantas prontas.
- O helper deve rodar em um intervalo mais lento que o clique manual.
- O helper não deve acionar combo.
- O helper deve ser visível no HUD, persistente no save e fácil de entender em segundos.
