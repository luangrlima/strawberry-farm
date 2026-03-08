# Plano do Sprint 7

## Status do documento
Documento histórico, escrito antes da refatoração arquitetural do Sprint 9.

## Objetivo do sprint
Adicionar um sistema de prestígio opcional que crie progressão de longo prazo sem complicar o loop principal.

## Escopo incluído
- sistema `Strawberry Knowledge`
- requisito de prestígio baseado em moedas
- reset voluntário da fazenda
- bônus permanente simples nas vendas
- persistência de nível e bônus de prestígio
- painel de UI com nível, bônus e requisito atual
- feedback visual quando o prestígio ficar disponível

## Fora de escopo
- árvore de talentos
- múltiplas rotas de prestígio
- moedas premium separadas
- bônus permanentes múltiplos
- automação nova ligada ao prestígio
- conteúdo pós-prestígio complexo

## Tarefas de design
- manter o prestígio opcional e claro
- tornar a recompensa forte o bastante para justificar reset
- garantir que o jogador entenda o que perde e o que mantém
- manter o loop base intacto

## Tarefas técnicas
- adicionar estado permanente de prestígio
- calcular requisito atual por nível
- integrar bônus de prestígio na venda
- criar rotina de reset com preservação de prestígio
- persistir prestígio no save/load
- adicionar UI de prestígio e confirmação

## Tarefas de balanceamento
- definir requisito inicial alcançável
- escalar o requisito por nível para evitar explosão econômica
- usar um multiplicador simples e legível
- validar convivência com helper, upgrades e mercado

## Foco de QA
- reset de prestígio correto
- persistência do nível de prestígio
- bônus aplicado corretamente na venda
- economia depois do primeiro prestígio
- clareza de UI e mensagens
