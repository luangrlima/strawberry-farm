# Automation Design

## Feature name
Farm Helper

## Papel no jogo
O `Farm Helper` é uma automação leve de conforto. Ele colhe morangos prontos para evitar microcliques excessivos, mas não planta nem vende pelo jogador.

## Comportamento
- compra única
- depois de comprado, fica ativo permanentemente
- a cada alguns segundos verifica a fazenda inteira
- se existir ao menos um canteiro pronto, colhe apenas um por ciclo
- a colheita automática usa a mesma regra de ganho de morango da colheita manual

## Regras de design
- o helper é mais lento que o jogador
- o helper não ativa nem prolonga combo
- o helper não vende automaticamente
- o helper não interage com canteiros crescendo ou vazios
- o helper deve comunicar sua última ação de forma curta e visível

## Impacto no engajamento
- reduz atrito no meio da sessão
- preserva a decisão de plantar, vender e aproveitar preço alto
- mantém o clique manual como melhor forma de extrair valor de combo

## Integração com sistemas atuais
- combo: somente colheita manual conta
- eventos: o helper continua colhendo normalmente durante eventos, sem bônus especiais próprios
- mercado: sem impacto direto; o jogador continua decidindo quando vender
- upgrades: helper combina bem com crescimento acelerado porque encontra mais plantas prontas
