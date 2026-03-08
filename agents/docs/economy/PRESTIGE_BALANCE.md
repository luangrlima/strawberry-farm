# Balanceamento do Prestígio

## Requisito de prestígio
- Requisito base: `120` moedas
- Escala por nível: `+120` moedas por novo prestígio
- Exemplos:
  - nível 0 -> precisa de `120`
  - nível 1 -> precisa de `240`
  - nível 2 -> precisa de `360`

## Bônus permanente
- `+20%` no valor total das vendas por nível

## Efeito esperado no pacing
- primeiro prestígio é alcançável em uma sessão estendida, mas ainda exige domínio do loop
- depois do primeiro prestígio, a recuperação do early game fica claramente mais rápida
- a escala do requisito controla a aceleração nas runs seguintes

## Interação com sistemas atuais
- mercado: preço alto continua importante, e o bônus amplifica a decisão de vender bem
- Caixa premium: sinergia forte, mas ainda depende de reconstruir a run
- Adubo rápido: acelera produção, mas não multiplica venda sozinho
- helper: melhora conforto, ajudando a chegar ao requisito sem quebrar a progressão

## Riscos de balanceamento
- se o requisito ficar baixo demais, o jogador prestigia cedo demais e apaga o valor dos upgrades
- se o bônus ficar alto demais, o mercado perde relevância
- se o requisito crescer rápido demais, o sistema parece inútil após o primeiro uso

## Decisão final
- requisito escalável simples: `120 x (nível atual + 1)`
- bônus permanente fixo por nível: `+20%` nas vendas totais
