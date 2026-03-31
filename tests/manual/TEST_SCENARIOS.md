# Cenários de Teste

## Objetivo
Este documento descreve os cenários principais para validar o MVP do jogo `Fazenda de Morangos`.

Os cenários foram escritos para servir como base de testes manuais e de futura automação com Playwright.

## Pré-condições gerais
- Abrir o jogo em um navegador com `localStorage` disponível.
- Sempre limpar o `localStorage` antes de iniciar um cenário isolado, exceto nos cenários de persistência.
- Estado inicial esperado:
  - `6` moedas
  - `3` sementes
  - `0` morangos
  - `9` canteiros vazios

## Cenários críticos

### CT-01: Renderização inicial da tela
Objetivo:
Validar que a interface principal carrega corretamente.

Passos:
1. Abrir a página do jogo.

Validações:
- O título `Fazenda de Morangos` é exibido.
- O texto de apoio da jogabilidade é exibido.
- O contador de moedas começa em `6`.
- O contador de sementes começa em `3`.
- O contador de morangos começa em `0`.
- A meta `Meta: alcançar 20 moedas` é exibida.
- Existem `9` canteiros visíveis na grade.
- O botão `Comprar semente` está habilitado.
- O botão `Vender morangos` está desabilitado.

### CT-02: Plantar em um canteiro vazio
Objetivo:
Validar o plantio básico.

Passos:
1. Abrir a página no estado inicial.
2. Clicar no primeiro canteiro vazio.

Validações:
- O número de sementes diminui de `3` para `2`.
- O canteiro muda para estado de crescimento.
- O texto do canteiro mostra contagem regressiva.
- A mensagem de status informa que a semente foi plantada.

### CT-03: Impedir plantio sem sementes
Objetivo:
Garantir que o jogador não consiga plantar sem estoque.

Passos:
1. Partindo do estado inicial, plantar em `3` canteiros.
2. Tentar plantar em um quarto canteiro vazio.

Validações:
- O contador de sementes permanece em `0`.
- O quarto canteiro continua vazio.
- A mensagem de status informa que é preciso ter sementes para plantar.

### CT-04: Evolução automática para pronto para colher
Objetivo:
Validar o temporizador de crescimento.

Passos:
1. Plantar em um canteiro vazio.
2. Aguardar `10` segundos.

Validações:
- O canteiro muda de `Crescendo` para `Colher`.
- O texto do canteiro muda para `Clique para colher`.
- A mensagem de status informa que um morango está pronto para colher.

### CT-05: Colher morango pronto
Objetivo:
Validar a colheita.

Passos:
1. Plantar em um canteiro vazio.
2. Aguardar o crescimento terminar.
3. Clicar no canteiro pronto.

Validações:
- O contador de morangos aumenta em `1`.
- O canteiro volta para `Terreno vazio`.
- A mensagem de status informa que `1` morango foi colhido.
- O botão `Vender morangos` fica habilitado.

### CT-06: Vender morangos colhidos
Objetivo:
Validar conversão de morangos em moedas.

Passos:
1. Colher `1` morango.
2. Clicar em `Vender morangos`.

Validações:
- O contador de morangos volta para `0`.
- O contador de moedas aumenta em `3`.
- A mensagem de status informa o valor vendido.
- O botão `Vender morangos` volta a ficar desabilitado.

### CT-07: Comprar sementes
Objetivo:
Validar compra manual de sementes.

Passos:
1. Abrir a página no estado inicial.
2. Clicar em `Comprar semente`.

Validações:
- O contador de moedas diminui de `6` para `4`.
- O contador de sementes aumenta de `3` para `4`.
- A mensagem de status informa que `1` semente foi comprada.

### CT-08: Impedir compra sem moedas suficientes
Objetivo:
Garantir bloqueio econômico mínimo.

Passos:
1. Gastar moedas até ficar com menos de `2`.
2. Tentar clicar em `Comprar semente`.

Validações:
- O botão `Comprar semente` fica desabilitado quando moedas < `2`.
- O total de moedas não fica negativo.
- O total de sementes não aumenta indevidamente.

### CT-09: Impedir venda sem morangos
Objetivo:
Garantir que não exista venda vazia.

Passos:
1. Abrir a página no estado inicial.

Validações:
- O botão `Vender morangos` começa desabilitado.
- Ao permanecer sem morangos, não há alteração de dinheiro ou estado.

### CT-10: Persistir progresso no recarregamento
Objetivo:
Validar salvamento com `localStorage`.

Passos:
1. Comprar uma semente.
2. Plantar em um canteiro.
3. Recarregar a página antes da colheita.

Validações:
- O número de moedas é preservado.
- O número de sementes é preservado.
- O canteiro continua em crescimento ou já pronto, conforme o tempo decorrido.
- A grade não volta para o estado inicial.

### CT-11: Finalizar crescimento após recarregar a página
Objetivo:
Validar retomada do timer com base em timestamp salvo.

Passos:
1. Plantar em um canteiro.
2. Recarregar a página.
3. Aguardar o tempo restante.

Validações:
- O canteiro não reinicia o tempo do zero.
- O canteiro muda corretamente para `Colher` após o período esperado.

### CT-12: Reiniciar o jogo
Objetivo:
Validar reset completo do progresso.

Passos:
1. Alterar o estado do jogo comprando sementes, plantando ou vendendo.
2. Clicar em `Reiniciar jogo`.
3. Confirmar a ação no diálogo.

Validações:
- O estado volta para `6` moedas, `3` sementes e `0` morangos.
- Todos os `9` canteiros voltam para vazios.
- A mensagem inicial volta a ser exibida.

### CT-13: Cancelar reinício
Objetivo:
Garantir que o cancelamento preserve o progresso.

Passos:
1. Alterar o estado do jogo.
2. Clicar em `Reiniciar jogo`.
3. Cancelar a confirmação.

Validações:
- Nenhum contador é alterado.
- Os canteiros preservam o estado atual.
- O progresso salvo continua intacto.

### CT-14: Alcançar a condição de vitória
Objetivo:
Validar a meta principal do MVP.

Passos:
1. Jogar até alcançar `20` moedas ou mais.

Validações:
- A meta no topo muda para a mensagem de vitória.
- A mensagem exibida é `Você construiu uma pequena fazenda de morangos!`.
- O jogo continua funcional após a vitória.

## Cenários de interface

### UI-01: Estados visuais dos canteiros
Validações:
- Canteiro vazio tem aparência distinta.
- Canteiro crescendo tem aparência distinta.
- Canteiro pronto para colher tem aparência distinta.
- O texto e o sprite refletem corretamente o estado do canteiro.

### UI-02: Responsividade básica
Validações:
- Em desktop, a grade 3x3 é exibida corretamente.
- Em mobile, os botões continuam clicáveis.
- Em mobile, os contadores ficam legíveis.
- O conteúdo principal permanece em uma única tela funcional.

### UI-03: Interface em português
Validações:
- Títulos, botões, status e metas estão em português.
- Os textos dos canteiros estão em português.
- O diálogo de reset aparece com mensagem em português.

## Cenários sugeridos para automação Playwright
- limpar `localStorage` antes de cada teste com `page.evaluate(() => localStorage.clear())`
- validar contadores por `id`
- selecionar canteiros por papel de botão dentro da grade
- usar espera orientada por texto para mudança de `Crescendo` para `Colher`
- validar persistência com `page.reload()`
- validar reset interceptando o diálogo com `page.on('dialog', ...)`

## Prioridade de automação
1. CT-01 Renderização inicial
2. CT-02 Plantar em canteiro vazio
3. CT-04 Evolução para pronto para colher
4. CT-05 Colher morango pronto
5. CT-06 Vender morangos
6. CT-10 Persistir progresso
7. CT-12 Reiniciar o jogo
8. CT-14 Condição de vitória
